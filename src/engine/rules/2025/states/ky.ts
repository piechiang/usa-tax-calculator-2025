/**
 * Kentucky State Tax Rules for 2025
 *
 * Kentucky has a flat income tax rate that has been gradually decreasing.
 * For 2025, the rate is 4.0% (reduced from 4.5% in 2024).
 * The rate will continue decreasing to 3.5% by 2026.
 *
 * Key Features:
 * - Flat 4.0% tax rate
 * - Standard deduction: $3,270 (single), $6,540 (MFJ/HOH)
 * - NO personal exemptions
 * - NO dependent exemptions
 * - Child and Dependent Care Credit: 20% of federal credit
 * - Pension income exemption: Up to $31,110
 *
 * Sources:
 * - Kentucky Department of Revenue: https://revenue.ky.gov
 * - https://www.kentucky.com/news/politics-government/article285134497.html
 * - https://taxfoundation.org/data/all/state/kentucky-tax-rates-2025/
 *
 * Last Updated: 2025-01-22
 */

import type { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Kentucky Flat Tax Rate for 2025
 *
 * Kentucky reduced its flat rate from 4.5% (2024) to 4.0% (2025).
 * The rate will further reduce to 3.5% in 2026.
 *
 * Source: Kentucky DOR 2025 tax changes
 */
export const KY_TAX_RATE_2025 = 0.04; // 4.0%

/**
 * Kentucky Standard Deduction for 2025
 *
 * Kentucky provides a standard deduction:
 * - Single: $3,270
 * - MFJ: $6,540
 * - MFS: $3,270
 * - HOH: $6,540
 *
 * Source: Kentucky tax forms 2025
 */
export const KY_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(3270),
  marriedJointly: dollarsToCents(6540),
  marriedSeparately: dollarsToCents(3270),
  headOfHousehold: dollarsToCents(6540),
};

/**
 * Kentucky Child and Dependent Care Credit for 2025
 *
 * Kentucky provides a credit equal to 20% of the federal
 * Child and Dependent Care Credit (Form 2441).
 *
 * This credit is NON-REFUNDABLE (can only reduce tax to $0).
 *
 * Source: Kentucky tax forms
 */
export const KY_CHILD_CARE_CREDIT_PERCENTAGE_2025 = 0.20; // 20% of federal

/**
 * Kentucky Pension Income Exemption for 2025
 *
 * Kentucky allows taxpayers to exclude up to $31,110 in pension
 * income from their taxable income.
 *
 * Note: This implementation does NOT include pension income exemption.
 * It could be added in future enhancements.
 *
 * Source: Kentucky DOR
 */
export const KY_PENSION_EXEMPTION_2025 = dollarsToCents(31110);
