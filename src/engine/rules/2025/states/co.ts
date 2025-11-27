/**
 * Colorado State Tax Rules for 2025
 *
 * Sources:
 * - Colorado Department of Revenue
 * - https://tax.colorado.gov/individual-income-tax-guide
 * - 2025 CO Tax Rate: 4.40% (flat rate)
 *
 * Key Features:
 * - Flat 4.40% tax rate on Colorado taxable income
 * - No state standard deduction (uses federal taxable income as base)
 * - No personal exemptions
 * - State income tax addback for high earners
 * - TABOR refunds (separate from regular tax calculation)
 *
 * 2025 Changes:
 * - Rate remains at 4.40% (temporary reductions may apply in specific years)
 * - Addback rule continues for high earners (AGI > $300k single / $1M joint)
 */

import { multiplyCents, subtractCents, max0 } from '../../../util/money';

/**
 * Colorado Tax Rate for 2025
 * Flat 4.40% on all Colorado taxable income
 */
export const CO_TAX_RATE_2025 = 0.044;

/**
 * Colorado Tax Rules for 2025
 */
export const CO_RULES_2025 = {
  /**
   * Flat tax rate (4.40% for 2025)
   */
  taxRate: 0.044,

  /**
   * Standard Deduction
   * Colorado does not have a separate state standard deduction
   * Uses federal taxable income as the starting point
   */
  hasStandardDeduction: false,

  /**
   * Personal Exemptions
   * Colorado does not have personal exemptions
   */
  hasPersonalExemption: false,

  /**
   * State Income Tax Addback Rule (for high earners)
   * Starting tax year 2023, taxpayers with AGI exceeding thresholds
   * must add back deductions exceeding certain limits
   */
  addbackRule: {
    /**
     * AGI thresholds for addback requirement
     */
    agiThreshold: {
      single: 30000000, // $300,000 in cents
      marriedJointly: 100000000, // $1,000,000 in cents
      marriedSeparately: 30000000, // $300,000 in cents
      headOfHousehold: 30000000, // $300,000 in cents
    },

    /**
     * Deduction limits before addback required
     * If deductions exceed these amounts AND AGI exceeds threshold,
     * the excess must be added back to federal taxable income
     */
    deductionLimit: {
      single: 1200000, // $12,000 in cents
      marriedJointly: 1600000, // $16,000 in cents
      marriedSeparately: 1200000, // $12,000 in cents
      headOfHousehold: 1200000, // $12,000 in cents
    },
  },

  /**
   * TABOR (Taxpayer's Bill of Rights) Refund
   * Note: TABOR refunds are calculated separately and vary by year
   * For 2024 tax year (filed in 2025): ~$326 single / ~$652 joint
   * For 2025 tax year (filed in 2026): ~$41 single / ~$82 joint
   * These are estimates and actual amounts vary
   */
  taborRefund: {
    // TABOR refunds are typically calculated separately
    // and are not part of the standard tax calculation
    enabled: true,
    note: 'TABOR refunds vary by year and must be claimed on state return',
  },
} as const;

/**
 * Calculate Colorado tax using flat rate
 *
 * @param coloradoTaxableIncome - CO taxable income in cents
 * @returns Tax amount in cents
 */
export function calculateColoradoTax(coloradoTaxableIncome: number): number {
  if (coloradoTaxableIncome <= 0) return 0;

  return Math.round(multiplyCents(coloradoTaxableIncome, CO_RULES_2025.taxRate));
}

/**
 * Calculate state income tax addback for high earners
 *
 * @param federalAGI - Federal AGI in cents
 * @param federalDeduction - Federal standard deduction or itemized deduction in cents
 * @param filingStatus - Filing status
 * @returns Addback amount in cents (0 if not applicable)
 */
export function calculateStateIncomeAddback(
  federalAGI: number,
  federalDeduction: number,
  filingStatus: string
): number {
  const { addbackRule } = CO_RULES_2025;

  // Determine AGI threshold and deduction limit based on filing status
  let agiThreshold = 0;
  let deductionLimit = 0;

  switch (filingStatus) {
    case 'single':
      agiThreshold = addbackRule.agiThreshold.single;
      deductionLimit = addbackRule.deductionLimit.single;
      break;
    case 'marriedJointly':
      agiThreshold = addbackRule.agiThreshold.marriedJointly;
      deductionLimit = addbackRule.deductionLimit.marriedJointly;
      break;
    case 'marriedSeparately':
      agiThreshold = addbackRule.agiThreshold.marriedSeparately;
      deductionLimit = addbackRule.deductionLimit.marriedSeparately;
      break;
    case 'headOfHousehold':
      agiThreshold = addbackRule.agiThreshold.headOfHousehold;
      deductionLimit = addbackRule.deductionLimit.headOfHousehold;
      break;
    default:
      agiThreshold = addbackRule.agiThreshold.single;
      deductionLimit = addbackRule.deductionLimit.single;
  }

  // Check if addback applies
  if (federalAGI <= agiThreshold) {
    return 0; // AGI below threshold, no addback
  }

  // Calculate excess deduction
  const excessDeduction = max0(subtractCents(federalDeduction, deductionLimit));

  return excessDeduction;
}

/**
 * Type for Colorado-specific input data
 */
export interface ColoradoSpecificInput {
  /**
   * Federal standard deduction or itemized deduction amount
   * Required for calculating state income tax addback
   */
  federalDeduction?: number;

  /**
   * Whether to claim TABOR refund
   * Must opt-in on state return
   */
  claimTaborRefund?: boolean;

  /**
   * For future expansion:
   * - Colorado-specific subtractions (Social Security, pensions, etc.)
   * - Colorado-specific additions (non-CO bond interest, etc.)
   * - Other state-specific provisions
   */
}
