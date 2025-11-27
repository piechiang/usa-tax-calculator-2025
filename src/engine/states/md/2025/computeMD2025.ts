import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { MD_RULES_2025 } from '../../../rules/2025/states/md';
import {
  addCents,
  max0,
  multiplyCents
} from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute Maryland state tax for 2025
 *
 * Maryland has a progressive state income tax (2%-5.75%) plus local county taxes (0.0125%-3.2%).
 * The state also provides EITC at 45% of federal EITC (updated for 2025).
 *
 * Sources:
 * - Maryland Comptroller of Maryland
 * - Maryland Tax Forms and Instructions
 * - https://www.marylandtaxes.gov
 *
 * @param input Unified state tax input with federal results
 * @returns Maryland state tax calculation result
 */
export function computeMD2025(input: StateTaxInput): StateResult {
  const { federalResult, county } = input;

  // Step 1: Calculate Maryland AGI (start with federal AGI)
  const mdAGI = calculateMDAGI(input);

  // Step 2: Calculate Maryland deductions and exemptions
  const deductionsAndExemptions = calculateMDDeductionsAndExemptions(input, mdAGI);

  // Step 3: Calculate Maryland taxable income
  const mdTaxableIncome = max0(mdAGI - deductionsAndExemptions);

  // Step 4: Calculate Maryland state tax
  const mdStateTax = calculateTaxFromBrackets(mdTaxableIncome, MD_RULES_2025.brackets);

  // Step 5: Calculate local tax
  const localTax = calculateMDLocalTax(county, mdTaxableIncome);

  // Step 6: Calculate Maryland EITC (45% of federal EITC for 2025)
  const mdEITC = multiplyCents(federalResult.credits.eitc || 0, MD_RULES_2025.eitcPercentage);

  // Step 7: Build credits structure
  const credits: StateCredits = {
    earned_income: mdEITC,
    nonRefundableCredits: mdEITC, // MD EITC is non-refundable
    refundableCredits: 0
  };

  // Step 8: Calculate net Maryland tax after credits
  const netMDStateTax = max0(mdStateTax - mdEITC);
  const totalStateLiability = addCents(netMDStateTax, localTax);

  // Step 9: Calculate payments and refund/owe
  const stateWithheld = input.stateWithheld || 0;
  const stateEstPayments = input.stateEstPayments || 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const stateRefundOrOwe = totalPayments - totalStateLiability;

  return {
    stateAGI: mdAGI,
    stateTaxableIncome: mdTaxableIncome,
    stateTax: netMDStateTax,
    localTax,
    totalStateLiability,
    stateDeduction: deductionsAndExemptions,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe,
    state: 'MD',
    ...(county && { county }), // Only include county if defined
    taxYear: 2025,
    formReferences: ['Form 502', 'Schedule MD'],
    calculationNotes: [
      'Maryland standard deduction and personal exemptions applied',
      localTax > 0 ? `Local tax for ${county} County applied` : undefined,
      mdEITC > 0 ? 'Maryland EITC (45% of federal) applied' : undefined
    ].filter(Boolean) as string[]
  };
}

/**
 * Calculate Maryland Adjusted Gross Income
 *
 * Maryland generally follows federal AGI with some modifications including:
 * - Additions: Federal tax refunds, other state-specific additions
 * - Subtractions: Military pay, retirement income, other state-specific subtractions
 *
 * @param input - State tax input containing federal AGI and state-specific adjustments
 * @returns Maryland AGI in cents
 * @see https://www.marylandtaxes.gov/forms/current_forms/502.pdf
 */
function calculateMDAGI(input: StateTaxInput): number {
  let mdAGI = input.federalResult.agi;

  // Maryland additions to income
  if (input.stateAdditions) {
    if (input.stateAdditions.federalTaxRefund) {
      mdAGI = addCents(mdAGI, input.stateAdditions.federalTaxRefund);
    }
    if (input.stateAdditions.otherAdditions) {
      mdAGI = addCents(mdAGI, input.stateAdditions.otherAdditions);
    }
  }

  // Maryland subtractions from income
  if (input.stateSubtractions) {
    if (input.stateSubtractions.militaryPay) {
      mdAGI = max0(mdAGI - input.stateSubtractions.militaryPay);
    }
    if (input.stateSubtractions.retirementIncome) {
      mdAGI = max0(mdAGI - input.stateSubtractions.retirementIncome);
    }
    if (input.stateSubtractions.otherSubtractions) {
      mdAGI = max0(mdAGI - input.stateSubtractions.otherSubtractions);
    }
  }

  return mdAGI;
}

/**
 * Calculate Maryland deductions and personal exemptions
 *
 * Determines the total deductions available including:
 * - Standard deduction (varies by filing status)
 * - Personal exemptions for taxpayer, spouse, and dependents
 * - Itemized deductions (if greater than standard deduction)
 * - Poverty level exemption (if applicable)
 *
 * Maryland allows full SALT deduction without the federal $10,000 cap.
 *
 * @param input - State tax input with filing status and itemized deductions
 * @param mdAGI - Maryland adjusted gross income in cents
 * @returns Total deductions and exemptions in cents
 */
function calculateMDDeductionsAndExemptions(input: StateTaxInput, mdAGI: number): number {
  // Maryland standard deduction
  const standardDeduction = MD_RULES_2025.standardDeduction[
    input.filingStatus as keyof typeof MD_RULES_2025.standardDeduction
  ] || MD_RULES_2025.standardDeduction.single;

  // Maryland personal exemptions
  let exemptions = MD_RULES_2025.personalExemption.taxpayer; // Taxpayer exemption

  if (input.filingStatus === 'marriedJointly') {
    exemptions += MD_RULES_2025.personalExemption.spouse; // Spouse exemption
  }

  // Add dependent exemptions
  const dependents = input.stateDependents || 0;
  if (dependents > 0) {
    exemptions += MD_RULES_2025.personalExemption.dependent * dependents;
  }

  // Maryland itemized deductions (if provided)
  let itemizedDeduction = 0;
  if (input.stateItemized) {
    // Maryland allows full SALT deduction (no federal $10k cap)
    itemizedDeduction = addCents(
      input.stateItemized.propertyTaxes || 0,
      input.stateItemized.mortgageInterest || 0,
      input.stateItemized.charitableContributions || 0,
      calculateMDMedicalDeduction(input.stateItemized.medicalExpenses || 0, mdAGI),
      input.stateItemized.other || 0
    );
  }

  // Use greater of standard deduction or itemized deduction, plus exemptions
  const totalDeduction = Math.max(standardDeduction, itemizedDeduction);

  // Check for poverty level exemption
  const povertyThreshold = MD_RULES_2025.povertyLevelExemption.thresholds[
    input.filingStatus as keyof typeof MD_RULES_2025.povertyLevelExemption.thresholds
  ] || MD_RULES_2025.povertyLevelExemption.thresholds.single;

  if (MD_RULES_2025.povertyLevelExemption.enabled && mdAGI <= povertyThreshold) {
    // If under poverty level, may be exempt from MD tax
    return mdAGI; // Effectively makes taxable income 0
  }

  return addCents(totalDeduction, exemptions);
}

/**
 * Calculate Maryland medical expense deduction
 *
 * Maryland follows federal rules for medical expenses:
 * Only medical expenses exceeding 7.5% of AGI are deductible.
 *
 * @param medicalExpenses - Total medical and dental expenses in cents
 * @param mdAGI - Maryland adjusted gross income in cents
 * @returns Deductible medical expenses in cents
 */
function calculateMDMedicalDeduction(medicalExpenses: number, mdAGI: number): number {
  const threshold = multiplyCents(mdAGI, 0.075); // 7.5% of AGI (same as federal)
  return max0(medicalExpenses - threshold);
}

/**
 * Calculate Maryland local tax based on county
 *
 * Each Maryland county and Baltimore City levy a local income tax
 * ranging from 1.25% (Worcester County) to 3.2% (Baltimore City).
 *
 * @param county - Maryland county or Baltimore City
 * @param mdTaxableIncome - Maryland taxable income in cents
 * @returns Local tax liability in cents
 * @see https://www.marylandtaxes.gov/individual/income/filing/local-tax-rates.php
 */
function calculateMDLocalTax(county: string | undefined, mdTaxableIncome: number): number {
  if (!county || mdTaxableIncome <= 0) {
    return 0;
  }

  // Get county rate
  const localRate = MD_RULES_2025.localRates[county] || MD_RULES_2025.defaultLocalRate;

  return multiplyCents(mdTaxableIncome, localRate);
}

/**
 * Get available Maryland counties for validation
 *
 * Returns a list of all Maryland counties and Baltimore City
 * that have local income tax rates defined.
 *
 * @returns Array of county names
 */
export function getMarylandCounties(): string[] {
  return Object.keys(MD_RULES_2025.localRates);
}

/**
 * Get Maryland local tax rate for a specific county
 *
 * Returns the local income tax rate as a decimal (e.g., 0.032 for 3.2%).
 * If county is not found, returns the default rate (3.2%, Baltimore City rate).
 *
 * @param county - Maryland county or Baltimore City name
 * @returns Local tax rate as a decimal
 * @example
 * getMDLocalRate('Baltimore City') // returns 0.032
 * getMDLocalRate('Montgomery') // returns 0.032
 */
export function getMDLocalRate(county: string): number {
  return MD_RULES_2025.localRates[county] || MD_RULES_2025.defaultLocalRate;
}
