import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import type { FederalResult2025, FilingStatus } from '../../../types';
import { NY_RULES_2025 } from '../../../rules/2025/states/ny/ny';
import { addCents, max0, multiplyCents } from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute New York state tax for 2025
 *
 * New York has a progressive income tax system with rates ranging from 4% to 10.9%
 * depending on income and filing status.
 *
 * Sources:
 * - https://www.tax.ny.gov
 * - New York Tax Forms and Instructions
 * - https://www.tax.ny.gov/pit/credits/earned_income_credit.htm
 *
 * Key Features:
 * - Progressive tax brackets (8 brackets for most filing statuses)
 * - Standard deductions based on filing status
 * - Dependent exemptions ($1,000 per dependent)
 * - Refundable EITC (30% of federal EITC)
 * - NYC local tax (progressive brackets for NYC residents)
 * - Yonkers local tax (1.675% resident surcharge, 0.5% non-resident surcharge on NY state tax)
 *
 * @param input State tax input with federal results
 * @returns New York state tax calculation result
 */
export function computeNY2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus } = input;

  // Step 1: Calculate New York AGI
  const nyAGI = calculateNYAGI(input);

  // Step 2: Calculate deductions and exemptions
  const deductionsAndExemptions = calculateNYDeductionsAndExemptions(input, nyAGI);

  // Step 3: Calculate New York taxable income
  const nyTaxableIncome = max0(nyAGI - deductionsAndExemptions);

  // Step 4: Calculate New York state tax
  const brackets = NY_RULES_2025.brackets[filingStatus]!;
  const nyStateTax = calculateTaxFromBrackets(nyTaxableIncome, brackets);

  // Step 5: Calculate local tax (if applicable)
  // Use city field instead of county for NYC/Yonkers
  // Check stateSpecific.yonkersResident for Yonkers residency status (defaults to true)
  const isYonkersResident = input.stateSpecific?.yonkersResident !== false;
  const localTax = calculateNYLocalTax(
    input.city,
    nyTaxableIncome,
    nyStateTax,
    filingStatus,
    isYonkersResident
  );

  // Step 6: Calculate New York credits
  const credits = calculateNYCredits(input, federalResult, nyAGI, nyStateTax);

  // Step 7: Calculate net New York tax after credits
  const netNYStateTax = max0(nyStateTax - credits.nonRefundableCredits);
  const totalStateLiability = addCents(netNYStateTax, localTax);

  // Step 8: Calculate payments and refund/owe
  const stateWithheld = input.stateWithheld || 0;
  const stateEstPayments = input.stateEstPayments || 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const stateRefundOrOwe = totalPayments + credits.refundableCredits - totalStateLiability;

  return {
    stateAGI: nyAGI,
    stateTaxableIncome: nyTaxableIncome,
    stateTax: netNYStateTax,
    localTax,
    totalStateLiability,
    stateDeduction: deductionsAndExemptions,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe,
    state: 'NY',
    ...(input.county && { county: input.county }),
    taxYear: 2025,
    formReferences: [
      'IT-201 (NY Resident Income Tax Return)',
      'IT-215 (Claim for Earned Income Credit)',
    ],
    calculationNotes: [
      'New York standard deduction and personal exemptions applied',
      localTax > 0
        ? `Local tax for ${input.city || input.county || 'locality'} applied`
        : undefined,
      credits.earned_income && credits.earned_income > 0
        ? 'New York EITC (30% of federal, refundable) applied'
        : undefined,
    ].filter(Boolean) as string[],
  };
}

/**
 * Calculate New York Adjusted Gross Income
 *
 * New York AGI starts with federal AGI and applies state-specific additions and subtractions:
 *
 * Additions:
 * - Federal tax refunds (if deducted in prior year)
 * - Interest on non-NY municipal bonds
 * - Other state-specific additions
 *
 * Subtractions:
 * - Social Security benefits
 * - Pension/retirement income (partial exclusion for those 59.5+)
 * - Military pay (for certain qualifying service members)
 * - Other state-specific subtractions
 *
 * @param input - State tax input containing federal AGI and state-specific adjustments
 * @returns New York AGI in cents
 */
function calculateNYAGI(input: StateTaxInput): number {
  let nyAGI = input.federalResult.agi;

  // New York additions to income
  if (input.stateAdditions) {
    nyAGI += input.stateAdditions.federalTaxRefund || 0;
    nyAGI += input.stateAdditions.municipalBondInterest || 0;
    nyAGI += input.stateAdditions.otherAdditions || 0;
  }

  // New York subtractions from income
  if (input.stateSubtractions) {
    nyAGI -= input.stateSubtractions.socialSecurityBenefits || 0;
    nyAGI -= input.stateSubtractions.retirementIncome || 0;
    nyAGI -= input.stateSubtractions.militaryPay || 0;
    nyAGI -= input.stateSubtractions.otherSubtractions || 0;
  }

  return max0(nyAGI);
}

/**
 * Calculate New York deductions and exemptions
 *
 * New York allows:
 * 1. Standard deduction OR itemized deductions (whichever is greater)
 *    - Standard deduction amounts vary by filing status
 *    - Itemized deductions include medical, property taxes, mortgage interest, charitable contributions
 *
 * 2. Dependent exemptions ($1,000 per dependent for 2025)
 *
 * Note: Unlike federal tax, NY maintains separate personal and dependent exemptions
 *
 * @param input - State tax input
 * @param nyAGI - New York AGI (currently unused, but available for AGI-based phaseouts)
 * @returns Total deductions and exemptions in cents
 */
function calculateNYDeductionsAndExemptions(input: StateTaxInput, nyAGI: number): number {
  const { filingStatus } = input;
  const rules = NY_RULES_2025;

  // Standard deduction
  const standardDeduction = rules.standardDeduction[filingStatus];

  // Itemized deductions (state-specific itemization)
  let itemizedDeduction = 0;
  if (input.stateItemized) {
    itemizedDeduction += input.stateItemized.medicalExpenses || 0;
    itemizedDeduction += input.stateItemized.propertyTaxes || 0;
    itemizedDeduction += input.stateItemized.mortgageInterest || 0;
    itemizedDeduction += input.stateItemized.charitableContributions || 0;
    itemizedDeduction += input.stateItemized.other || 0;
  }

  // Use greater of standard or itemized
  const deduction = Math.max(standardDeduction, itemizedDeduction);

  // Dependent exemptions (NY has dependent exemptions, not personal exemptions)
  const dependentExemptions = rules.dependentExemption
    ? rules.dependentExemption * (input.stateDependents || 0)
    : 0;

  return deduction + dependentExemptions;
}

/**
 * Calculate New York local tax
 *
 * New York has two jurisdictions with local income taxes:
 * 1. New York City (NYC) - Progressive brackets
 * 2. Yonkers - Surcharge on NY state tax
 *
 * @param city - City name (e.g., "New York City", "NYC", "Yonkers")
 * @param taxableIncome - New York taxable income
 * @param nyStateTax - New York state tax (needed for Yonkers surcharge)
 * @param filingStatus - Filing status
 * @param isResident - Whether taxpayer is a resident of the city (for Yonkers)
 * @returns Local tax in cents
 */
function calculateNYLocalTax(
  city: string | undefined,
  taxableIncome: number,
  nyStateTax: number,
  filingStatus: FilingStatus,
  isResident: boolean = true
): number {
  if (!city) return 0;

  const localRateInfo = NY_RULES_2025.localRates?.[city];
  if (!localRateInfo) return 0;

  if (localRateInfo.type === 'nyc') {
    // NYC has progressive tax brackets
    const nycBrackets = localRateInfo.brackets[filingStatus];
    if (!nycBrackets) return 0;
    return calculateTaxFromBrackets(taxableIncome, nycBrackets);
  } else if (localRateInfo.type === 'yonkers') {
    // Yonkers has a surcharge on NY state tax
    const surchargeRate = isResident
      ? localRateInfo.residentSurcharge
      : localRateInfo.nonResidentSurcharge;
    return multiplyCents(nyStateTax, surchargeRate);
  }

  return 0;
}

/**
 * Calculate New York tax credits
 *
 * New York offers various tax credits including:
 * - Earned Income Credit (30% of federal EITC, refundable)
 * - Child and Dependent Care Credit
 * - Child Tax Credit (for lower-income taxpayers)
 * - College Tuition Credit
 * - Real Property Tax Credit
 *
 * Current implementation:
 * - NY EITC: Fully implemented (30% of federal, refundable)
 * - Other credits: Available for future implementation via input parameters
 *
 * @param input - State tax input (available for future credit expansions)
 * @param federalResult - Federal tax calculation result
 * @param nyAGI - New York AGI (available for income-based credit phaseouts)
 * @param nyTax - New York tax before credits (available for non-refundable credit limits)
 * @returns New York tax credits
 */
function calculateNYCredits(
  input: StateTaxInput,
  federalResult: FederalResult2025,
  nyAGI: number,
  nyTax: number
): StateCredits {
  const nonRefundableCredits = 0;
  let refundableCredits = 0;

  // New York EITC (30% of federal EITC) - REFUNDABLE
  // Source: https://www.tax.ny.gov/pit/credits/earned_income_credit.htm
  // New York's EITC is refundable (taxpayer can receive it even if they owe no tax)
  const nyEITC = multiplyCents(federalResult.credits.eitc || 0, 0.3);

  // New York EITC is refundable
  refundableCredits += nyEITC;

  return {
    earned_income: nyEITC,
    nonRefundableCredits,
    refundableCredits,
  };
}
