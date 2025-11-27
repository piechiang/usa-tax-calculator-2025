import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  NJ_RULES_2025,
  calculateNewJerseyTax,
} from '../../../rules/2025/states/nj';
import type { NJStateSpecific } from '../../../rules/2025/states/nj';
import {
  addCents,
  max0,
  multiplyCents,
  subtractCents,
} from '../../../util/money';

/**
 * Compute New Jersey state tax for 2025
 *
 * New Jersey has a highly progressive income tax with 8 brackets (MFJ/HOH)
 * or 7 brackets (Single/MFS), ranging from 1.4% to 10.75%.
 *
 * Key features:
 * - 8 progressive brackets for MFJ/HOH (1.4% to 10.75%)
 * - 7 progressive brackets for Single/MFS (1.4% to 10.75%)
 * - Standard deduction: $1,000 (single) / $2,000 (MFJ)
 * - Age 65+ exemption: $1,000 per person
 * - Dependent exemption: $1,500 per dependent
 * - Property tax deduction: Up to $15,000
 * - Property tax credit: $50 (refundable, alternative to deduction)
 *
 * Sources:
 * - New Jersey Division of Taxation
 * - https://www.nj.gov/treasury/taxation
 * - NJ Tax Rate Tables
 *
 * @param input Unified state tax input with federal results
 * @returns New Jersey state tax calculation result
 */
export function computeNJ2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, dependents = 0, stateSpecific } = input;
  const njSpecific = stateSpecific as NJStateSpecific | undefined;

  // Step 1: Calculate New Jersey AGI (starts with federal AGI)
  const njAGI = federalResult.agi;

  // Step 2: Calculate standard deduction
  const standardDeduction = getStandardDeduction(filingStatus);

  // Step 3: Calculate property tax deduction (if applicable)
  const propertyTaxDeduction = calculatePropertyTaxDeduction(input);

  // Step 4: Calculate age exemption (age 65+)
  const ageExemption = calculateAgeExemption(input);

  // Step 5: Calculate dependent exemptions
  const dependentExemptions = multiplyCents(NJ_RULES_2025.dependentExemption, dependents);

  // Step 6: Calculate total deductions and exemptions
  const totalDeductions = addCents(
    standardDeduction,
    propertyTaxDeduction,
    ageExemption,
    dependentExemptions
  );

  // Step 7: Calculate New Jersey taxable income
  const njTaxableIncome = max0(subtractCents(njAGI, totalDeductions));

  // Step 8: Calculate New Jersey tax using progressive brackets
  const njTax = calculateNewJerseyTax(njTaxableIncome, filingStatus);

  // Step 9: Calculate credits
  const propertyTaxCredit = njSpecific?.usePropertyTaxCredit
    ? NJ_RULES_2025.propertyTaxCredit
    : 0;

  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: propertyTaxCredit,
  };

  // Step 10: Calculate final tax (credits can make it negative = refund)
  const finalTax = max0(subtractCents(njTax, propertyTaxCredit));

  // Step 11: Calculate refund or amount owed
  const totalPayments = addCents(
    njSpecific?.stateWithheld ?? 0,
    njSpecific?.stateEstPayments ?? 0
  );
  // Add refundable credits to payments
  const totalPaymentsWithCredits = addCents(totalPayments, propertyTaxCredit);
  const refundOrOwe = totalPaymentsWithCredits - njTax;

  return {
    state: 'NJ',
    year: 2025,
    agiState: njAGI,
    taxableIncomeState: njTaxableIncome,
    stateTax: finalTax,
    totalStateLiability: finalTax,
    stateWithheld: njSpecific?.stateWithheld,
    stateRefundOrOwe: refundOrOwe,
    credits,
  };
}

/**
 * Get standard deduction amount based on filing status
 */
function getStandardDeduction(filingStatus: string): number {
  switch (filingStatus) {
    case 'single':
      return NJ_RULES_2025.standardDeduction.single;
    case 'marriedJointly':
      return NJ_RULES_2025.standardDeduction.marriedJointly;
    case 'marriedSeparately':
      return NJ_RULES_2025.standardDeduction.marriedSeparately;
    case 'headOfHousehold':
      return NJ_RULES_2025.standardDeduction.headOfHousehold;
    default:
      return NJ_RULES_2025.standardDeduction.single;
  }
}

/**
 * Calculate property tax deduction
 *
 * Homeowners can deduct property taxes paid up to $15,000
 * Renters can deduct 18% of rent paid (considered property taxes)
 *
 * Note: Taxpayers must choose between property tax deduction OR $50 credit
 * This function only applies if NOT using the credit
 */
function calculatePropertyTaxDeduction(input: StateTaxInput): number {
  const { stateSpecific } = input;
  const njSpecific = stateSpecific as NJStateSpecific | undefined;

  if (!njSpecific) {
    return 0;
  }

  // If using property tax credit, cannot use deduction
  if (njSpecific.usePropertyTaxCredit) {
    return 0;
  }

  const { propertyTaxPaid, rentPaid } = njSpecific;

  let propertyTaxAmount = 0;

  // Homeowners: Use property tax paid directly
  if (propertyTaxPaid && propertyTaxPaid > 0) {
    propertyTaxAmount = propertyTaxPaid;
  }
  // Renters: 18% of rent paid is considered property tax
  else if (rentPaid && rentPaid > 0) {
    propertyTaxAmount = multiplyCents(rentPaid, NJ_RULES_2025.propertyTaxDeduction.renterPercentage);
  }

  // Cap at maximum deduction of $15,000
  return Math.min(propertyTaxAmount, NJ_RULES_2025.propertyTaxDeduction.maximum);
}

/**
 * Calculate age exemption for taxpayers age 65 or older
 *
 * $1,000 per qualifying person (age 65+ by end of tax year)
 * Each spouse qualifies separately for MFJ
 */
function calculateAgeExemption(input: StateTaxInput): number {
  const { filingStatus, stateSpecific } = input;
  const njSpecific = stateSpecific as NJStateSpecific | undefined;

  if (!njSpecific) {
    return 0;
  }

  const { taxpayerAge, spouseAge } = njSpecific;

  let ageExemptionCount = 0;

  // Taxpayer qualifies if age 65+
  if (taxpayerAge !== undefined && taxpayerAge >= NJ_RULES_2025.minimumAgeForExemption) {
    ageExemptionCount += 1;
  }

  // Spouse qualifies if age 65+ (MFJ only)
  if (
    filingStatus === 'marriedJointly' &&
    spouseAge !== undefined &&
    spouseAge >= NJ_RULES_2025.minimumAgeForExemption
  ) {
    ageExemptionCount += 1;
  }

  return multiplyCents(NJ_RULES_2025.ageExemption, ageExemptionCount);
}
