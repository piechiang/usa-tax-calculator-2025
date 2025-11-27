/**
 * Ohio State Tax Rules for 2025
 *
 * Sources:
 * - Ohio Revised Code Section 5747.025
 * - Ohio HB 33 (2025-2026 Budget Bill signed June 30, 2025)
 * - Ohio Department of Taxation
 *
 * Key Features:
 * - Progressive 3-bracket system (0%, 2.75%, 3.125%)
 * - Standard deduction: $2,400 (single) / $4,800 (MFJ)
 * - Income-based personal exemptions with MAGI phaseouts
 * - $20 personal exemption credit for low-income taxpayers
 * - MAGI limit of $750,000 for exemptions/credits (2025)
 *
 * 2025 Changes:
 * - Top bracket reduced from 3.5% to 3.125%
 * - Added $750,000 MAGI cap on exemptions/credits
 * - Will transition to flat 2.75% rate in 2026
 */

import { addCents, multiplyCents, subtractCents, max0 } from '../../../util/money';

/**
 * Ohio Tax Brackets for 2025
 * Same thresholds for all filing statuses
 */
export const OH_BRACKETS_2025 = [
  { threshold: 0, rate: 0.00 },      // 0% on first $26,050
  { threshold: 2605000, rate: 0.0275 }, // 2.75% on $26,051-$100,000
  { threshold: 10000000, rate: 0.03125 }, // 3.125% on $100,001+ (reduced from 3.5% in 2024)
] as const;

/**
 * Ohio Tax Rules for 2025
 */
export const OH_RULES_2025 = {
  /**
   * Standard Deduction (Ohio has a standard deduction, unlike many states)
   */
  standardDeduction: {
    single: 240000, // $2,400 in cents
    marriedJointly: 480000, // $4,800 in cents
    marriedSeparately: 240000, // $2,400 in cents
    headOfHousehold: 240000, // $2,400 in cents (same as single)
  },

  /**
   * Personal Exemption Amounts
   * Based on Modified Adjusted Gross Income (MAGI)
   * Available for taxpayer, spouse, and each dependent
   * Subject to MAGI cap of $750,000 in 2025
   */
  personalExemption: {
    lowIncome: 235000, // $2,350 if MAGI ≤ $40,000
    midIncome: 210000, // $2,100 if $40,000 < MAGI ≤ $80,000
    highIncome: 185000, // $1,850 if MAGI > $80,000
    lowIncomeThreshold: 4000000, // $40,000
    midIncomeThreshold: 8000000, // $80,000
    magiCap2025: 75000000, // $750,000 MAGI cap for 2025
    magiCap2026: 50000000, // $500,000 MAGI cap for 2026 (future)
  },

  /**
   * Personal Exemption Credit
   * $20 credit for each exemption (taxpayer, spouse, dependents)
   * Only available if Ohio taxable income < $30,000
   */
  personalExemptionCredit: {
    creditPerExemption: 2000, // $20 in cents
    incomeLimit: 3000000, // $30,000 in cents
  },

  /**
   * Joint Filing Credit
   * Additional credit for married filing jointly
   * Subject to MAGI cap of $750,000 in 2025
   */
  jointFilingCredit: {
    amount: 65000, // $650 in cents (estimated - need verification)
    magiCap: 75000000, // $750,000 MAGI cap
  },
} as const;

/**
 * Calculate Ohio personal exemption amount based on MAGI
 */
export function calculateOhioPersonalExemption(
  magi: number,
  numberOfExemptions: number
): number {
  const { personalExemption } = OH_RULES_2025;

  // Check MAGI cap - no exemptions if over $750,000
  if (magi > personalExemption.magiCap2025) {
    return 0;
  }

  // Determine exemption amount per person based on MAGI
  let exemptionPerPerson = 0;
  if (magi <= personalExemption.lowIncomeThreshold) {
    exemptionPerPerson = personalExemption.lowIncome; // $2,350
  } else if (magi <= personalExemption.midIncomeThreshold) {
    exemptionPerPerson = personalExemption.midIncome; // $2,100
  } else {
    exemptionPerPerson = personalExemption.highIncome; // $1,850
  }

  return multiplyCents(exemptionPerPerson, numberOfExemptions);
}

/**
 * Calculate Ohio tax using progressive brackets
 */
export function calculateOhioTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let previousThreshold = 0;

  for (let i = 0; i < OH_BRACKETS_2025.length; i++) {
    const bracket = OH_BRACKETS_2025[i];
    const nextBracket = OH_BRACKETS_2025[i + 1];

    if (taxableIncome <= bracket.threshold) {
      break;
    }

    const bracketCeiling = nextBracket ? nextBracket.threshold : taxableIncome;
    const taxableInBracket = Math.min(taxableIncome, bracketCeiling) - bracket.threshold;

    if (taxableInBracket > 0) {
      tax = addCents(tax, multiplyCents(taxableInBracket, bracket.rate));
    }

    previousThreshold = bracket.threshold;
  }

  return Math.round(tax);
}

/**
 * Calculate $20 personal exemption credit
 * Only available if Ohio taxable income < $30,000
 */
export function calculatePersonalExemptionCredit(
  ohioTaxableIncome: number,
  numberOfExemptions: number
): number {
  const { personalExemptionCredit } = OH_RULES_2025;

  // Credit only available if taxable income < $30,000
  if (ohioTaxableIncome >= personalExemptionCredit.incomeLimit) {
    return 0;
  }

  return multiplyCents(personalExemptionCredit.creditPerExemption, numberOfExemptions);
}

/**
 * Type for Ohio-specific input data
 */
export interface OhioSpecificInput {
  // Ohio uses federal AGI with minimal modifications
  // No special Ohio-specific income types needed for basic calculation

  // For future expansion:
  // - Ohio retirement income exclusions
  // - Military pay exclusions
  // - Other Ohio-specific adjustments
}
