import { TaxPayerInput, StateResult, FederalResult2025 } from '../../../types';
import { MD_RULES_2025 } from '../../../rules/2025/states/md';
import { 
  addCents, 
  max0, 
  multiplyCents, 
  safeCurrencyToCents 
} from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/math';

/**
 * Compute Maryland state tax for 2025
 * @param input Taxpayer input data
 * @param federalResult Federal tax calculation result for modifications
 * @returns Maryland state tax calculation result
 */
export function computeMD2025(
  input: TaxPayerInput, 
  federalResult: FederalResult2025
): StateResult {
  // Step 1: Calculate Maryland AGI (start with federal AGI)
  const mdAGI = calculateMDAGI(input, federalResult);
  
  // Step 2: Calculate Maryland deductions and exemptions
  const deductionsAndExemptions = calculateMDDeductionsAndExemptions(input, mdAGI);
  
  // Step 3: Calculate Maryland taxable income
  const mdTaxableIncome = max0(mdAGI - deductionsAndExemptions);
  
  // Step 4: Calculate Maryland state tax
  const mdStateTax = calculateTaxFromBrackets(mdTaxableIncome, MD_RULES_2025.brackets);
  
  // Step 5: Calculate local tax
  const localTax = calculateMDLocalTax(input, mdTaxableIncome);
  
  // Step 6: Calculate Maryland EITC (28% of federal EITC)
  const mdEITC = multiplyCents(federalResult.credits.eitc || 0, MD_RULES_2025.eitcPercentage);
  
  // Step 7: Calculate net Maryland tax after credits
  const netMDStateTax = max0(mdStateTax - mdEITC);
  const totalStateLiability = addCents(netMDStateTax, localTax);
  
  // Step 8: Calculate payments and refund/owe
  const stateWithheld = safeCurrencyToCents(input.payments?.stateWithheld);
  const stateRefundOrOwe = stateWithheld - totalStateLiability;
  
  return {
    state: 'MD',
    year: 2025,
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
function calculateMDDeductionsAndExemptions(input: TaxPayerInput, mdAGI: number): number {
  // Maryland standard deduction
  const standardDeduction = MD_RULES_2025.standardDeduction[
    input.filingStatus as keyof typeof MD_RULES_2025.standardDeduction
  ] || MD_RULES_2025.standardDeduction.single;
  
  // Maryland personal exemptions
  let exemptions = MD_RULES_2025.personalExemption.taxpayer; // Taxpayer exemption
  
  if (input.filingStatus === 'marriedJointly' && input.spouse) {
    exemptions += MD_RULES_2025.personalExemption.spouse; // Spouse exemption
  }
  
  if (input.dependents && input.dependents > 0) {
    exemptions += MD_RULES_2025.personalExemption.dependent * input.dependents; // Dependent exemptions
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
 * Maryland follows federal rules for medical expenses
 */
function calculateMDMedicalDeduction(medicalExpenses: number, mdAGI: number): number {
  const threshold = multiplyCents(mdAGI, 0.075); // 7.5% of AGI (same as federal)
  return max0(medicalExpenses - threshold);
}

/**
 * Calculate Maryland local tax based on county
 */
function calculateMDLocalTax(input: TaxPayerInput, mdTaxableIncome: number): number {
  if (!input.isMaryland || mdTaxableIncome <= 0) {
    return 0;
  }
  
  // Get county rate
  const county = input.county || '';
  const localRate = MD_RULES_2025.localRates[county] || MD_RULES_2025.defaultLocalRate;
  
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
export function getMarylandCounties(): string[] {
  return Object.keys(MD_RULES_2025.localRates);
}

/**
 * Get Maryland local tax rate for a specific county
 */
export function getMDLocalRate(county: string): number {
  return MD_RULES_2025.localRates[county] || MD_RULES_2025.defaultLocalRate;
}