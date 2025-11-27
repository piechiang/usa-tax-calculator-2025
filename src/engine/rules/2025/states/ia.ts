/**
 * Iowa State Tax Rules for 2025
 *
 * Iowa implemented MAJOR tax reform for 2025 (Senate File 2442, enacted May 2024),
 * transitioning from a multi-bracket progressive system to a flat 3.8% tax rate.
 *
 * Key Features:
 * - Flat 3.8% tax rate (NEW for 2025)
 * - Reduced from 5.7% in 2024
 * - Retirement income fully exempt (since 2023)
 * - Standard deduction: $2,210 (single), $5,450 (MFJ)
 * - Sixth-lowest income tax rate among 41 states with income tax
 *
 * Historical Context:
 * - Peak rate: ~9% (circa 2018)
 * - 2024: 5.7% top rate (progressive brackets)
 * - 2025: 3.8% flat rate (unified system)
 *
 * Sources:
 * - Iowa Department of Revenue: https://revenue.iowa.gov
 * - Senate File 2442 (2024): https://www.legis.iowa.gov/legislation/BillBook?ga=90&ba=SF2442
 * - https://revenue.iowa.gov/press-release/2024-10-16/idr-announces-2025-individual-income-tax-brackets-and-interest-rates
 * - https://iowacapitaldispatch.com/2025/01/02/iowas-income-tax-drops-to-single-3-8-rate-in-2025/
 * - https://www.kiplinger.com/taxes/iowa-has-a-new-income-tax-rate
 *
 * Last Updated: 2025-01-22
 */

import type { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Iowa Flat Tax Rate for 2025
 *
 * Iowa enacted Senate File 2442 in May 2024, which replaced the
 * progressive bracket system with a flat 3.8% rate for all taxable income.
 *
 * This represents a dramatic reduction from 5.7% in 2024.
 *
 * Source: Iowa Department of Revenue, Senate File 2442
 */
export const IA_TAX_RATE_2025 = 0.038; // 3.8%

/**
 * Iowa Standard Deduction for 2025
 *
 * Iowa's standard deduction amounts for 2025:
 * - Single: $2,210
 * - MFJ: $5,450
 * - MFS: $2,725
 * - HOH: $2,210
 *
 * Note: These amounts are relatively low compared to federal
 * standard deduction, but Iowa offers other tax benefits like
 * retirement income exemption.
 *
 * Source: Iowa Department of Revenue
 */
export const IA_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(2210),
  marriedJointly: dollarsToCents(5450),
  marriedSeparately: dollarsToCents(2725),
  headOfHousehold: dollarsToCents(2210),
};

/**
 * Iowa Retirement Income Exemption for 2025
 *
 * Iowa fully exempts retirement income from state taxation:
 * - Pensions
 * - 401(k) distributions
 * - IRA distributions
 * - Social Security benefits
 * - Other retirement income
 *
 * This exemption has been in effect since tax year 2023.
 *
 * Note: This implementation does NOT include retirement income
 * exemption calculation. It assumes retirement income is already
 * excluded from federal AGI or handled separately.
 *
 * Source: Iowa Department of Revenue
 */
export const IA_RETIREMENT_INCOME_EXEMPT_2025 = true;

/**
 * Iowa Withholding Rate for 2025
 *
 * Employers must withhold at the flat 3.8% rate for Iowa
 * individual income beginning January 1, 2025.
 *
 * Source: Iowa Department of Revenue withholding tables
 */
export const IA_WITHHOLDING_RATE_2025 = 0.038; // 3.8%
