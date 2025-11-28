import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { DC_RULES_2025 } from '../../../rules/2025/states/dc';
import {
  addCents,
  max0,
  multiplyCents
} from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute District of Columbia state tax for 2025
 *
 * DC has a progressive income tax (4%-10.75%) with a generous EITC at 70% of federal.
 * DC standard deductions and personal exemptions apply.
 *
 * Sources:
 * - DC Office of Tax and Revenue
 * - https://otr.cfo.dc.gov/page/individual-income-tax
 *
 * @param input Unified state tax input with federal results
 * @returns District of Columbia state tax calculation result
 */
export function computeDC2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus } = input;

  // Step 1: Calculate DC AGI (follows federal AGI)
  const dcAGI = calculateDCAGI(input);

  // Step 2: Calculate DC deductions and exemptions
  const deductionsAndExemptions = calculateDCDeductionsAndExemptions(input);

  // Step 3: Calculate DC taxable income
  const dcTaxableIncome = max0(dcAGI - deductionsAndExemptions);

  // Step 4: Calculate DC state tax using progressive brackets
  const brackets = DC_RULES_2025.brackets[filingStatus];
  const dcStateTax = calculateTaxFromBrackets(dcTaxableIncome, brackets);

  // Step 5: Calculate DC EITC (70% of federal EITC - refundable)
  const federalEITC = federalResult.credits.eitc || 0;
  const dcEITC = multiplyCents(federalEITC, DC_RULES_2025.eitcPercentage);

  // Step 6: Build credits structure
  const credits: StateCredits = {
    earned_income: dcEITC,
    nonRefundableCredits: 0,
    refundableCredits: dcEITC  // DC EITC is refundable
  };

  // Step 7: Calculate net DC tax after non-refundable credits
  const netDCTax = max0(dcStateTax - credits.nonRefundableCredits);

  // Step 8: Calculate total liability (before refundable credits)
  const totalStateLiability = netDCTax;

  // Step 9: Calculate payments and refund/owe (including refundable credits)
  const stateWithheld = input.stateWithheld || 0;
  const stateEstPayments = input.stateEstPayments || 0;
  const totalPayments = addCents(addCents(stateWithheld, stateEstPayments), credits.refundableCredits);
  const stateRefundOrOwe = totalPayments - totalStateLiability;

  return {
    stateAGI: dcAGI,
    stateTaxableIncome: dcTaxableIncome,
    stateTax: netDCTax,
    localTax: 0,  // DC has no local tax (it's a single jurisdiction)
    totalStateLiability,
    stateDeduction: deductionsAndExemptions,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe,
    state: 'DC',
    taxYear: 2025,
    formReferences: ['D-40', 'D-40EZ'],
    calculationNotes: [
      'DC standard deduction and personal exemptions applied',
      dcEITC > 0 ? 'DC EITC (70% of federal, refundable) applied' : undefined
    ].filter(Boolean) as string[]
  };
}

/**
 * Calculate DC Adjusted Gross Income
 * DC generally follows federal AGI with minimal modifications
 */
function calculateDCAGI(input: StateTaxInput): number {
  let dcAGI = input.federalResult.agi;

  // DC additions to income
  if (input.stateAdditions) {
    const additions = (input.stateAdditions.federalTaxRefund || 0) +
                     (input.stateAdditions.municipalBondInterest || 0) +
                     (input.stateAdditions.otherAdditions || 0);
    dcAGI = addCents(dcAGI, additions);
  }

  // DC subtractions from income
  if (input.stateSubtractions) {
    const subtractions = (input.stateSubtractions.socialSecurityBenefits || 0) +
                        (input.stateSubtractions.retirementIncome || 0) +
                        (input.stateSubtractions.militaryPay || 0) +
                        (input.stateSubtractions.otherSubtractions || 0);
    dcAGI = max0(dcAGI - subtractions);
  }

  return dcAGI;
}

/**
 * Calculate DC deductions and exemptions
 * DC allows either standard deduction or itemized deductions, plus personal exemptions
 */
function calculateDCDeductionsAndExemptions(input: StateTaxInput): number {
  const { filingStatus } = input;

  // Standard deduction
  const standardDeduction = DC_RULES_2025.standardDeduction[filingStatus];

  // Itemized deductions (DC allows itemized if taxpayer itemizes federally)
  let deduction = standardDeduction;
  if (input.stateItemized) {
    const itemizedTotal = (input.stateItemized.medicalExpenses || 0) +
                         (input.stateItemized.propertyTaxes || 0) +
                         (input.stateItemized.mortgageInterest || 0) +
                         (input.stateItemized.charitableContributions || 0) +
                         (input.stateItemized.other || 0);
    if (itemizedTotal > standardDeduction) {
      deduction = itemizedTotal;
    }
  }

  // Personal exemptions
  const exemptionCount = getDCExemptionCount(input);
  const totalExemptions = multiplyCents(DC_RULES_2025.personalExemption, exemptionCount);

  return addCents(deduction, totalExemptions);
}

/**
 * Calculate number of personal exemptions for DC
 * Includes taxpayer(s) and dependents
 */
function getDCExemptionCount(input: StateTaxInput): number {
  const { filingStatus } = input;

  let exemptions = 0;

  // Taxpayer exemption(s)
  if (filingStatus === 'marriedJointly') {
    exemptions = 2;  // Two exemptions for joint filers
  } else {
    exemptions = 1;  // One exemption for single, MFS, HOH
  }

  // Add dependent exemptions
  // Note: stateDependents should be provided in the state input
  const dependents = input.stateDependents ?? 0;
  exemptions += dependents;

  return exemptions;
}
