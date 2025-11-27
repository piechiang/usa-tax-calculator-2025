/**
 * Louisiana State Tax Rules for 2025
 *
 * Louisiana implemented MAJOR tax reform for 2025, transitioning from a
 * 3-bracket graduated system to a flat 3% tax rate.
 *
 * Key Features:
 * - Flat 3% tax rate (NEW for 2025)
 * - Standard deduction: $12,500 (single), $25,000 (MFJ/HOH)
 * - Personal exemptions eliminated (replaced by higher standard deduction)
 * - Simplified withholding at 3.09% rate
 *
 * 2024 System (for comparison):
 * - 3 brackets: 1.85%, 3.5%, 4.25%
 * - Lower standard deduction
 * - Personal exemptions: $4,500 each
 *
 * Sources:
 * - Louisiana Department of Revenue: https://revenue.louisiana.gov
 * - Act 11 of 2024: https://www.legis.la.gov/Legis/ViewDocument.aspx?d=1308694
 * - https://taxnews.ey.com/news/2024-2322-louisiana-law-implements-a-flat-personal-income-tax-rate-starting-in-2025
 * - https://www.visaverge.com/taxes/louisiana-state-income-tax-rates-and-brackets-for-2025-explained/
 *
 * Last Updated: 2025-01-22
 */

import type { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Louisiana Flat Tax Rate for 2025
 *
 * Louisiana enacted Act 11 of 2024, which replaced the graduated
 * bracket system with a flat 3% rate for all taxable income.
 *
 * This is effective for taxable years beginning on or after January 1, 2025.
 *
 * Source: Act 11 of 2024, Louisiana Department of Revenue
 */
export const LA_TAX_RATE_2025 = 0.03; // 3.0%

/**
 * Louisiana Standard Deduction for 2025
 *
 * The 2025 tax reform significantly increased the standard deduction:
 * - Single: $12,500 (increased from $4,500 in 2024)
 * - MFJ: $25,000 (increased from $9,000 in 2024)
 * - MFS: $12,500
 * - HOH: $25,000 (increased from $4,500 in 2024)
 *
 * These increases offset the elimination of personal exemptions.
 *
 * Source: Louisiana Department of Revenue
 */
export const LA_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(12500),
  marriedJointly: dollarsToCents(25000),
  marriedSeparately: dollarsToCents(12500),
  headOfHousehold: dollarsToCents(25000),
};

/**
 * Louisiana Personal Exemptions for 2025
 *
 * Personal exemptions were ELIMINATED in the 2025 tax reform.
 * Previously, taxpayers could claim $4,500 per person.
 *
 * The elimination was offset by significantly higher standard deductions.
 *
 * Source: Act 11 of 2024
 */
export const LA_PERSONAL_EXEMPTION_2025 = 0; // Eliminated

/**
 * Louisiana Dependent Exemptions for 2025
 *
 * Dependent exemptions were ELIMINATED in the 2025 tax reform.
 * Previously, taxpayers could claim $1,000 per dependent.
 *
 * Source: Act 11 of 2024
 */
export const LA_DEPENDENT_EXEMPTION_2025 = 0; // Eliminated

/**
 * Louisiana Withholding Rate for 2025
 *
 * For withholding purposes, Louisiana uses a rate of 3.09%
 * (slightly higher than the 3% tax rate to ensure adequate withholding).
 *
 * Source: Louisiana Department of Revenue
 */
export const LA_WITHHOLDING_RATE_2025 = 0.0309; // 3.09%
