/**
 * Wisconsin State Tax Rules for 2025
 *
 * Wisconsin has a progressive income tax system with 4 tax brackets.
 *
 * Key Features:
 * - 4 tax brackets: 3.5%, 4.4%, 5.3%, 7.65%
 * - Standard deductions: $12,760 (single), $23,620 (MFJ), $18,970 (HOH)
 * - Personal exemptions: $700 per exemption
 * - Sliding scale standard deduction (phases out at higher incomes)
 * - School property tax credit
 * - Earned Income Credit (state-level, percentage of federal EITC)
 *
 * Sources:
 * - Wisconsin Department of Revenue
 * - Wisconsin Form 1 and instructions for 2025
 * - https://www.revenue.wi.gov/Pages/FAQS/pcs-taxrates.aspx
 */

import { dollarsToCents } from '../../../util/money';
import type { FilingStatus } from '../../../types';

/**
 * Wisconsin Tax Brackets for 2025
 *
 * 4 progressive brackets based on taxable income
 *
 * Source: Wisconsin DOR 2025 tax tables
 */
export const WI_TAX_BRACKETS_2025 = {
  single: [
    { max: dollarsToCents(13810), rate: 0.0354 }, // 3.54% on first $13,810
    { max: dollarsToCents(27630), rate: 0.0465 }, // 4.65% on next $13,820 ($13,811-$27,630)
    { max: dollarsToCents(304170), rate: 0.0627 }, // 6.27% on next $276,540 ($27,631-$304,170)
    { max: Infinity, rate: 0.0765 }, // 7.65% on income over $304,170
  ],
  marriedJointly: [
    { max: dollarsToCents(18380), rate: 0.0354 }, // 3.54% on first $18,380
    { max: dollarsToCents(36760), rate: 0.0465 }, // 4.65% on next $18,380 ($18,381-$36,760)
    { max: dollarsToCents(405560), rate: 0.0627 }, // 6.27% on next $368,800 ($36,761-$405,560)
    { max: Infinity, rate: 0.0765 }, // 7.65% on income over $405,560
  ],
  marriedSeparately: [
    { max: dollarsToCents(9190), rate: 0.0354 }, // 3.54% on first $9,190
    { max: dollarsToCents(18380), rate: 0.0465 }, // 4.65% on next $9,190 ($9,191-$18,380)
    { max: dollarsToCents(202780), rate: 0.0627 }, // 6.27% on next $184,400 ($18,381-$202,780)
    { max: Infinity, rate: 0.0765 }, // 7.65% on income over $202,780
  ],
  headOfHousehold: [
    { max: dollarsToCents(18380), rate: 0.0354 }, // 3.54% on first $18,380
    { max: dollarsToCents(36760), rate: 0.0465 }, // 4.65% on next $18,380 ($18,381-$36,760)
    { max: dollarsToCents(405560), rate: 0.0627 }, // 6.27% on next $368,800 ($36,761-$405,560)
    { max: Infinity, rate: 0.0765 }, // 7.65% on income over $405,560
  ],
};

/**
 * Wisconsin Standard Deduction for 2025
 *
 * Wisconsin uses a sliding scale standard deduction that phases out
 * at higher income levels.
 *
 * Base amounts:
 * - Single: $12,760
 * - MFJ: $23,620
 * - MFS: $11,810
 * - HOH: $18,970
 *
 * Phase-out: Standard deduction reduces by $1 for every $10 of income
 * above certain thresholds.
 *
 * Source: Wisconsin Form 1 instructions 2025
 */
export const WI_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(12760),
  marriedJointly: dollarsToCents(23620),
  marriedSeparately: dollarsToCents(11810),
  headOfHousehold: dollarsToCents(18970),
};

/**
 * Wisconsin Standard Deduction Phase-Out Thresholds for 2025
 *
 * Standard deduction begins to phase out when Wisconsin AGI exceeds:
 * - Single/HOH: $36,760
 * - MFJ: $54,870
 * - MFS: $27,430
 *
 * Reduction: $1 for every $10 over threshold (10% phase-out rate)
 *
 * Source: Wisconsin DOR 2025 instructions
 */
export const WI_STANDARD_DEDUCTION_PHASEOUT_2025: Record<
  FilingStatus,
  { threshold: number; rate: number }
> = {
  single: {
    threshold: dollarsToCents(36760),
    rate: 0.10, // $1 reduction per $10 over threshold
  },
  marriedJointly: {
    threshold: dollarsToCents(54870),
    rate: 0.10,
  },
  marriedSeparately: {
    threshold: dollarsToCents(27430),
    rate: 0.10,
  },
  headOfHousehold: {
    threshold: dollarsToCents(36760),
    rate: 0.10,
  },
};

/**
 * Wisconsin Personal Exemption for 2025
 *
 * $700 per exemption (taxpayer, spouse, dependents)
 *
 * Source: Wisconsin Form 1 instructions 2025
 */
export const WI_PERSONAL_EXEMPTION_2025 = dollarsToCents(700);

/**
 * Wisconsin Earned Income Credit (State EITC) for 2025
 *
 * Wisconsin provides a state-level EITC as a percentage of the federal EITC:
 * - 4% of federal EITC for taxpayers with 1 child
 * - 11% of federal EITC for taxpayers with 2 children
 * - 34% of federal EITC for taxpayers with 3+ children
 *
 * Source: Wisconsin DOR Schedule EIC instructions 2025
 */
export const WI_EITC_PERCENTAGE_2025 = {
  0: 0, // No state EITC for childless
  1: 0.04, // 4% for 1 child
  2: 0.11, // 11% for 2 children
  3: 0.34, // 34% for 3+ children
};

/**
 * Wisconsin School Property Tax Credit for 2025
 *
 * Refundable credit for property taxes paid on principal residence.
 * Maximum credit varies by income level.
 *
 * Note: This is a simplified placeholder. Full implementation would require:
 * - School district property tax amount
 * - Principal residence valuation
 * - Income-based phase-out calculations
 *
 * Source: Wisconsin Schedule PS 2025
 */
export const WI_SCHOOL_PROPERTY_TAX_CREDIT_2025 = {
  enabled: false, // Not fully implemented
  maxCredit: dollarsToCents(1168), // Maximum possible credit
};

/**
 * Wisconsin uses federal AGI as starting point
 * with certain modifications.
 *
 * Common additions:
 * - Interest from non-Wisconsin municipal bonds
 * - Capital loss carryforward deducted federally
 * - Certain federal deductions/credits
 *
 * Common subtractions:
 * - Social Security/Railroad Retirement benefits (up to $15,000)
 * - Military retirement pay
 * - Wisconsin municipal bond interest
 * - College savings account contributions
 *
 * Note: Simplified implementation uses federal AGI directly
 */
export const WI_AGI_MODIFICATIONS_2025 = {
  // Social Security benefits subtraction (up to $15,000 single/$30,000 MFJ)
  socialSecurityExclusion: {
    single: dollarsToCents(15000),
    marriedJointly: dollarsToCents(30000),
    marriedSeparately: dollarsToCents(15000),
    headOfHousehold: dollarsToCents(15000),
  },

  // Military retirement pay subtraction (up to $5,000)
  militaryRetirementExclusion: dollarsToCents(5000),
};

/**
 * Wisconsin Withholding Tables for 2025
 *
 * Employers use these tables for payroll withholding.
 * Not needed for annual return calculation but included for reference.
 */
export const WI_WITHHOLDING_ALLOWANCE_2025 = dollarsToCents(700); // Same as personal exemption
