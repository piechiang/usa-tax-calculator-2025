/**
 * Arizona State Tax Rules for 2025
 *
 * Sources:
 * - Arizona Department of Revenue
 * - https://azdor.gov
 * - 2025 AZ Tax Rate: 2.5% (flat rate, transitioned from progressive in 2023)
 *
 * Key Features:
 * - Flat 2.5% tax rate on Arizona taxable income
 * - Standard deduction: $15,750 (single) / $31,500 (MFJ)
 * - Additional standard deduction for age 65+ ($6,000 with income limits)
 * - Dependent exemptions: $1,000/$500/$300 based on AGI
 * - Charitable contribution standard deduction increase (33% of contributions)
 *
 * 2025 Changes:
 * - Rate remains at 2.5% (transitioned from progressive system in 2023)
 * - Additional age 65+ deduction continues through 2028
 */

import { multiplyCents } from '../../../util/money';

/**
 * Arizona Tax Rate for 2025
 * Flat 2.5% on all Arizona taxable income
 */
export const AZ_TAX_RATE_2025 = 0.025;

/**
 * Arizona Tax Rules for 2025
 */
export const AZ_RULES_2025 = {
  /**
   * Flat tax rate (2.5% for 2025)
   */
  taxRate: 0.025,

  /**
   * Standard Deduction
   * Arizona uses its own standard deduction amounts (aligned with federal but state-specific)
   */
  standardDeduction: {
    single: 1575000, // $15,750 in cents
    marriedJointly: 3150000, // $31,500 in cents
    marriedSeparately: 1575000, // $15,750 in cents
    headOfHousehold: 2370000, // $23,700 in cents (estimate based on federal pattern)
  },

  /**
   * Additional Standard Deduction for Age 65+
   * Available for 2025-2028 tax years
   * Phases out based on income thresholds
   */
  age65AdditionalDeduction: {
    amount: 600000, // $6,000 in cents
    incomeLimitSingle: 7500000, // $75,000 in cents
    incomeLimitJoint: 15000000, // $150,000 in cents
    phaseoutRate: 1.0, // Full phaseout above income limit
  },

  /**
   * Dependent Exemptions
   * Amount varies based on taxpayer's AGI
   */
  dependentExemption: {
    lowIncome: 100000, // $1,000 in cents (AGI ≤ $50,000)
    midIncome: 50000, // $500 in cents ($50,000 < AGI ≤ $100,000)
    highIncome: 30000, // $300 in cents (AGI > $100,000)

    agiThresholds: {
      low: 5000000, // $50,000 in cents
      high: 10000000, // $100,000 in cents
    },
  },

  /**
   * Charitable Contribution Standard Deduction Increase
   * Can add 33% of charitable contributions to standard deduction
   */
  charitableContributionRate: 0.33, // 33% of contributions

  /**
   * Personal Exemptions
   * Arizona does not have personal exemptions (eliminated)
   */
  hasPersonalExemption: false,
} as const;

/**
 * Calculate Arizona tax using flat rate
 *
 * @param taxableIncome - AZ taxable income in cents
 * @returns Tax amount in cents
 */
export function calculateArizonaTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  return Math.round(multiplyCents(taxableIncome, AZ_RULES_2025.taxRate));
}

/**
 * Calculate standard deduction based on filing status
 *
 * @param filingStatus - Filing status
 * @returns Standard deduction amount in cents
 */
export function getStandardDeduction(filingStatus: string): number {
  const { standardDeduction } = AZ_RULES_2025;

  switch (filingStatus) {
    case 'single':
      return standardDeduction.single;
    case 'marriedJointly':
      return standardDeduction.marriedJointly;
    case 'marriedSeparately':
      return standardDeduction.marriedSeparately;
    case 'headOfHousehold':
      return standardDeduction.headOfHousehold;
    default:
      return standardDeduction.single;
  }
}

/**
 * Calculate additional standard deduction for age 65+
 *
 * @param age - Taxpayer's age
 * @param spouseAge - Spouse's age (for MFJ)
 * @param agi - Arizona AGI in cents
 * @param filingStatus - Filing status
 * @returns Additional deduction amount in cents
 */
export function calculateAge65AdditionalDeduction(
  age: number | undefined,
  spouseAge: number | undefined,
  agi: number,
  filingStatus: string
): number {
  const { age65AdditionalDeduction } = AZ_RULES_2025;

  // Determine income limit based on filing status
  const incomeLimit =
    filingStatus === 'marriedJointly'
      ? age65AdditionalDeduction.incomeLimitJoint
      : age65AdditionalDeduction.incomeLimitSingle;

  // If income exceeds limit, no additional deduction
  if (agi > incomeLimit) {
    return 0;
  }

  // Count number of people age 65+
  let count = 0;
  if (age !== undefined && age >= 65) count++;
  if (spouseAge !== undefined && spouseAge >= 65 && filingStatus === 'marriedJointly') count++;

  if (count === 0) return 0;

  // Return additional deduction ($6,000 per person age 65+)
  return multiplyCents(age65AdditionalDeduction.amount, count);
}

/**
 * Calculate dependent exemption amount based on AGI
 *
 * @param agi - Arizona AGI in cents
 * @param numberOfDependents - Number of dependents
 * @returns Total dependent exemption amount in cents
 */
export function calculateDependentExemption(agi: number, numberOfDependents: number): number {
  if (numberOfDependents <= 0) return 0;

  const { dependentExemption } = AZ_RULES_2025;

  let exemptionPerDependent = 0;

  if (agi <= dependentExemption.agiThresholds.low) {
    // AGI ≤ $50,000: $1,000 per dependent
    exemptionPerDependent = dependentExemption.lowIncome;
  } else if (agi <= dependentExemption.agiThresholds.high) {
    // $50,000 < AGI ≤ $100,000: $500 per dependent
    exemptionPerDependent = dependentExemption.midIncome;
  } else {
    // AGI > $100,000: $300 per dependent
    exemptionPerDependent = dependentExemption.highIncome;
  }

  return multiplyCents(exemptionPerDependent, numberOfDependents);
}

/**
 * Calculate charitable contribution standard deduction increase
 *
 * @param charitableContributions - Total charitable contributions in cents
 * @returns Standard deduction increase amount in cents
 */
export function calculateCharitableDeductionIncrease(charitableContributions: number): number {
  if (charitableContributions <= 0) return 0;

  return Math.round(
    multiplyCents(charitableContributions, AZ_RULES_2025.charitableContributionRate)
  );
}

/**
 * Type for Arizona-specific input data
 */
export interface ArizonaSpecificInput {
  /**
   * Taxpayer's age (for age 65+ additional deduction)
   */
  age?: number;

  /**
   * Spouse's age (for MFJ age 65+ additional deduction)
   */
  spouseAge?: number;

  /**
   * Total charitable contributions (for standard deduction increase)
   */
  charitableContributions?: number;

  /**
   * For future expansion:
   * - Arizona-specific subtractions
   * - Arizona-specific additions
   * - Other state-specific provisions
   */
}
