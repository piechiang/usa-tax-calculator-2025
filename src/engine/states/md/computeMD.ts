import { TaxPayerInput, StateResult, FederalResult2025 } from '../../types';
import {
  addCents,
  max0,
  multiplyCents,
  safeCurrencyToCents
} from '../../util/money';
import { calculateTaxFromBrackets } from '../../util/math';
import { MD_RULES_2024 } from '../../rules/2024/states/md';
import { MD_RULES_2025 } from '../../rules/2025/states/md';
import { MD_RULES_2026 } from '../../rules/2026/states/md';

const MD_RULES_BY_YEAR: Record<number, any> = {
  2024: MD_RULES_2024,
  2025: MD_RULES_2025,
  2026: MD_RULES_2026,
};

/**
 * Compute Maryland state tax for given year
 * @param input Taxpayer input data
 * @param federalResult Federal tax calculation result for modifications
 * @returns Maryland state tax calculation result
 */
export function computeMD(
  year: number,
  input: TaxPayerInput,
  federalResult: FederalResult2025
): StateResult {
  const MD_RULES = MD_RULES_BY_YEAR[year] || MD_RULES_2025;
  // Step 1: Calculate Maryland AGI (start with federal AGI)
  const mdAGI = calculateMDAGI(input, federalResult);

  // Step 2: Calculate Maryland deductions and exemptions
  const deductionsAndExemptions = calculateMDDeductionsAndExemptions(input, mdAGI, MD_RULES);
  
  // Step 3: Calculate Maryland taxable income
  const mdTaxableIncome = max0(mdAGI - deductionsAndExemptions);
  
  // Step 4: Calculate Maryland state tax
  const mdStateTax = calculateTaxFromBrackets(mdTaxableIncome, MD_RULES.brackets);
  
  // Step 5: Calculate local tax
  const localTax = calculateMDLocalTax(input, mdTaxableIncome, MD_RULES);
  
  // Step 6: Calculate Maryland EITC (28% of federal EITC)
  const mdEITC = multiplyCents(federalResult.credits.eitc || 0, MD_RULES.eitcPercentage);
  
  // Step 7: Calculate net Maryland tax after credits
  const netMDStateTax = max0(mdStateTax - mdEITC);
  const totalStateLiability = addCents(netMDStateTax, localTax);
  
  // Step 8: Calculate payments and refund/owe
  const stateWithheld = safeCurrencyToCents(input.payments?.stateWithheld);
  const stateRefundOrOwe = stateWithheld - totalStateLiability;
  
  return {
    state: 'MD',
    year,
    agiState: mdAGI,
    taxableIncomeState: mdTaxableIncome,
    stateTax: netMDStateTax,
    localTax,
    totalStateLiability,
    stateWithheld,
    stateRefundOrOwe,
  };
}

/**
 * Calculate Maryland Adjusted Gross Income
 * Maryland generally follows federal AGI with some modifications
 */
function calculateMDAGI(_input: TaxPayerInput, federalResult: FederalResult2025): number {
  let mdAGI = federalResult.agi;
  
  // Maryland additions to income (simplified)
  // - State and local tax refunds if previously deducted
  // - Certain federal deductions that MD doesn't allow
  
  // Maryland subtractions from income
  // - Military retirement pay (limited)
  // - Railroad retirement benefits
  // - Pension income (limited by age and amount)
  
  // For now, we'll use federal AGI as base
  // In a full implementation, would need additional input fields for MD-specific items
  
  return mdAGI;
}

/**
 * Calculate Maryland deductions and personal exemptions
 */
function calculateMDDeductionsAndExemptions(input: TaxPayerInput, mdAGI: number, MD_RULES: any): number {
  // Maryland standard deduction
  const standardDeduction = MD_RULES.standardDeduction[
    input.filingStatus as keyof typeof MD_RULES.standardDeduction
  ] || MD_RULES.standardDeduction.single;
  
  // Maryland personal exemptions
  let exemptions = MD_RULES.personalExemption.taxpayer; // Taxpayer exemption
  
  if (input.filingStatus === 'marriedJointly' && input.spouse) {
    exemptions += MD_RULES.personalExemption.spouse; // Spouse exemption
  }
  
  if (input.dependents && input.dependents > 0) {
    exemptions += MD_RULES.personalExemption.dependent * input.dependents; // Dependent exemptions
  }
  
  // Maryland itemized deductions (if taxpayer itemizes on federal)
  let itemizedDeduction = 0;
  if (input.itemized) {
    // Maryland allows full SALT deduction (no federal cap)
    itemizedDeduction = addCents(
      safeCurrencyToCents(input.itemized.stateLocalTaxes), // No cap in MD
      safeCurrencyToCents(input.itemized.mortgageInterest),
      safeCurrencyToCents(input.itemized.charitable),
      calculateMDMedicalDeduction(safeCurrencyToCents(input.itemized.medical), mdAGI),
      safeCurrencyToCents(input.itemized.other)
    );
  }
  
  // Use greater of standard deduction or itemized deduction, plus exemptions
  const totalDeduction = Math.max(standardDeduction, itemizedDeduction);
  
  // Check for poverty level exemption
  const povertyThreshold = MD_RULES.povertyLevelExemption.thresholds[
    input.filingStatus as keyof typeof MD_RULES.povertyLevelExemption.thresholds
  ] || MD_RULES.povertyLevelExemption.thresholds.single;

  if (MD_RULES.povertyLevelExemption.enabled && mdAGI <= povertyThreshold) {
    // If under poverty level, may be exempt from MD tax
    return mdAGI; // Effectively makes taxable income 0
  }
  
  return addCents(totalDeduction, exemptions);
}

/**
 * Calculate Maryland medical expense deduction
 * Maryland follows federal rules for medical expenses
 */
function calculateMDMedicalDeduction(medicalExpenses: number, mdAGI: number): number {
  const threshold = multiplyCents(mdAGI, 0.075); // 7.5% of AGI (same as federal)
  return max0(medicalExpenses - threshold);
}

/**
 * Calculate Maryland local tax based on county
 */
function calculateMDLocalTax(input: TaxPayerInput, mdTaxableIncome: number, MD_RULES: any): number {
  if (!input.isMaryland || mdTaxableIncome <= 0) {
    return 0;
  }
  
  // Get county rate
  const county = input.county || '';
  const localRate = MD_RULES.localRates[county] || MD_RULES.defaultLocalRate;
  
  return multiplyCents(mdTaxableIncome, localRate);
}

/**
 * Utility function to validate Maryland residence
 */
export function isMarylandResident(input: TaxPayerInput): boolean {
  return input.isMaryland === true || input.state === 'MD';
}

/**
 * Get available Maryland counties for validation
 */
export function getMarylandCounties(year: number = 2025): string[] {
  const rules = MD_RULES_BY_YEAR[year] || MD_RULES_2025;
  return Object.keys(rules.localRates);
}

/**
 * Get Maryland local tax rate for a specific county
 */
export function getMDLocalRate(county: string, year: number = 2025): number {
  const rules = MD_RULES_BY_YEAR[year] || MD_RULES_2025;
  return rules.localRates[county] || rules.defaultLocalRate;
}