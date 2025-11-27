/**
 * Missouri State Tax Rules for 2025
 *
 * Missouri has an 8-bracket progressive income tax system with rates
 * ranging from 0% to 4.7% (reduced from 4.8% in 2024).
 *
 * Key Features:
 * - 8 tax brackets (0% to 4.7%)
 * - Standard deduction: $15,000 (single), $30,000 (MFJ), $22,500 (HOH)
 * - Federal income tax deduction: $5,000 (single), $10,000 (MFJ)
 * - Dependent exemption: $1,200 per dependent
 * - Additional exemptions for age 65+ and blindness
 *
 * Sources:
 * - Missouri Department of Revenue: https://dor.mo.gov
 * - https://learn.valur.com/missouri-income-tax/
 * - https://www.visaverge.com/taxes/missouri-state-income-tax-rates-and-brackets-for-2025-explained/
 *
 * Last Updated: 2025-01-22
 */

import type { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Missouri Tax Brackets for 2025
 *
 * Missouri reduced its top rate from 4.8% to 4.7% in 2025.
 * The brackets are the same for all filing statuses.
 *
 * Note: First bracket ($0-$1,313) is 0% (no tax)
 */
export const MO_TAX_BRACKETS_2025: Array<{ max: number; rate: number }> = [
  { max: dollarsToCents(1313), rate: 0.00 },   // 0% on first $1,313
  { max: dollarsToCents(2626), rate: 0.02 },   // 2% on $1,314-$2,626
  { max: dollarsToCents(3939), rate: 0.025 },  // 2.5% on $2,627-$3,939
  { max: dollarsToCents(5252), rate: 0.03 },   // 3% on $3,940-$5,252
  { max: dollarsToCents(6565), rate: 0.035 },  // 3.5% on $5,253-$6,565
  { max: dollarsToCents(7878), rate: 0.04 },   // 4% on $6,566-$7,878
  { max: dollarsToCents(9191), rate: 0.045 },  // 4.5% on $7,879-$9,191
  { max: Infinity, rate: 0.047 },              // 4.7% on $9,192+
];

/**
 * Missouri Standard Deduction for 2025
 *
 * Missouri updated standard deduction amounts for 2025:
 * - Single: $15,000 (up from $14,600)
 * - MFJ: $30,000 (up from $29,200)
 * - HOH: $22,500 (up from $21,900)
 * - MFS: $15,000
 *
 * Source: Missouri DOR 2025 changes
 */
export const MO_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(15000),
  marriedJointly: dollarsToCents(30000),
  marriedSeparately: dollarsToCents(15000),
  headOfHousehold: dollarsToCents(22500),
};

/**
 * Missouri Federal Income Tax Deduction for 2025
 *
 * Missouri allows taxpayers to deduct federal income taxes paid
 * from their Missouri taxable income (similar to Alabama):
 * - Single/MFS/HOH: Up to $5,000
 * - MFJ: Up to $10,000
 *
 * This is capped and does not scale with income.
 *
 * Source: Multiple Missouri tax guides
 */
export const MO_FEDERAL_TAX_DEDUCTION_LIMIT_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(5000),
  marriedJointly: dollarsToCents(10000),
  marriedSeparately: dollarsToCents(5000),
  headOfHousehold: dollarsToCents(5000),
};

/**
 * Missouri Dependent Exemption for 2025
 *
 * Missouri allows a $1,200 exemption for each dependent claimed.
 *
 * Source: Missouri tax forms
 */
export const MO_DEPENDENT_EXEMPTION_2025 = dollarsToCents(1200);

/**
 * Missouri Additional Exemptions for Age 65+ and Blindness (NOT IMPLEMENTED)
 *
 * Missouri provides additional deductions for:
 * - Age 65 or older:
 *   - $1,550 (MFJ or MFS)
 *   - $1,950 (Single or HOH)
 * - Blindness (same amounts)
 *
 * Note: This implementation does NOT include age/blindness exemptions.
 * They could be added in future enhancements.
 *
 * Source: Missouri tax forms
 */
export const MO_AGE_EXEMPTION_MFJ_2025 = dollarsToCents(1550);
export const MO_AGE_EXEMPTION_SINGLE_2025 = dollarsToCents(1950);
