/**
 * New Mexico State Tax Rules for 2025
 *
 * New Mexico enacted HB 252 in March 2024, which restructured tax brackets
 * for 2025, lowering rates for low- and middle-income taxpayers.
 *
 * Key Features (2025):
 * - 5 progressive tax brackets: 1.5%, 4.3%, 4.7%, 4.9%, 5.9%
 * - Lowest rate reduced from 1.7% to 1.5%
 * - New 4.3% bracket for middle incomes
 * - Standard deduction: $15,000 (single), $30,000 (MFJ)
 * - First major tax change since 2005
 *
 * Sources:
 * - New Mexico Taxation and Revenue Department: https://www.tax.newmexico.gov
 * - HB 252 (2024): https://www.nmlegis.gov/Sessions/24%20Regular/bills/house/HB0252.HTML
 * - https://www.visaverge.com/taxes/new-mexico-state-income-tax-rates-and-brackets-for-2025/
 * - https://sourcenm.com/2024/03/12/all-new-mexicans-will-pay-less-income-tax-after-first-major-change-in-nearly-20-years/
 *
 * Last Updated: 2025-01-22
 */

import type { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * New Mexico Tax Brackets for 2025
 *
 * HB 252 restructured the brackets effective January 1, 2025:
 * - Lowest rate: 1.5% (down from 1.7%)
 * - New 4.3% bracket for middle incomes ($16,500-$33,500 single)
 * - Higher thresholds for 4.7% and 4.9% brackets
 * - Top 5.9% bracket unchanged
 *
 * Brackets are progressive - only income in each bracket is taxed at that rate.
 *
 * Source: HB 252, New Mexico Taxation and Revenue Department
 */
export const NM_TAX_BRACKETS_2025: Record<
  FilingStatus,
  Array<{ max: number; rate: number }>
> = {
  single: [
    { max: dollarsToCents(8000), rate: 0.015 },    // 1.5%
    { max: dollarsToCents(16500), rate: 0.043 },   // 4.3%
    { max: dollarsToCents(33500), rate: 0.047 },   // 4.7%
    { max: dollarsToCents(220000), rate: 0.049 },  // 4.9%
    { max: Infinity, rate: 0.059 },                // 5.9%
  ],
  marriedJointly: [
    { max: dollarsToCents(16000), rate: 0.015 },   // 1.5%
    { max: dollarsToCents(25000), rate: 0.043 },   // 4.3%
    { max: dollarsToCents(50000), rate: 0.047 },   // 4.7%
    { max: dollarsToCents(330000), rate: 0.049 },  // 4.9%
    { max: Infinity, rate: 0.059 },                // 5.9%
  ],
  marriedSeparately: [
    { max: dollarsToCents(8000), rate: 0.015 },
    { max: dollarsToCents(12500), rate: 0.043 },
    { max: dollarsToCents(25000), rate: 0.047 },
    { max: dollarsToCents(165000), rate: 0.049 },
    { max: Infinity, rate: 0.059 },
  ],
  headOfHousehold: [
    { max: dollarsToCents(12000), rate: 0.015 },
    { max: dollarsToCents(20750), rate: 0.043 },
    { max: dollarsToCents(41750), rate: 0.047 },
    { max: dollarsToCents(275000), rate: 0.049 },
    { max: Infinity, rate: 0.059 },
  ],
};

/**
 * New Mexico Standard Deduction for 2025
 *
 * Standard deductions align with federal amounts:
 * - Single: $15,000
 * - MFJ: $30,000
 * - MFS: $15,000
 * - HOH: $22,500
 *
 * Source: New Mexico Taxation and Revenue Department
 */
export const NM_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(15000),
  marriedJointly: dollarsToCents(30000),
  marriedSeparately: dollarsToCents(15000),
  headOfHousehold: dollarsToCents(22500),
};

/**
 * New Mexico Personal Exemption for 2025
 *
 * New Mexico provides a personal exemption of $2,500 per person.
 *
 * Source: New Mexico tax forms
 */
export const NM_PERSONAL_EXEMPTION_2025 = dollarsToCents(2500);
