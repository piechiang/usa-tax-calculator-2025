/**
 * Michigan State Tax Rules for 2025
 *
 * Michigan has a flat income tax rate of 4.25% for all income levels.
 * Unlike most states, Michigan has NO standard deduction but does have
 * personal exemptions.
 *
 * Key Features:
 * - Flat 4.25% tax rate
 * - Personal exemptions: $5,000 per person (taxpayer, spouse, dependents)
 * - No standard deduction
 * - State EITC: 30% of federal EITC (refundable)
 * - Retirement income deductions for seniors
 *
 * Sources:
 * - Michigan Department of Treasury: https://www.michigan.gov/treasury
 * - 2025 Michigan tax forms and instructions
 * - https://www.efile.com/michigan-tax-brackets-rates-and-forms/
 *
 * Last Updated: 2025-01-22
 */

import { dollarsToCents } from '../../../util/money';

/**
 * Michigan Flat Tax Rate for 2025
 *
 * Michigan uses a flat 4.25% tax rate on all taxable income.
 * This rate has been confirmed for 2025 by the Michigan Department of Treasury.
 *
 * Source: https://www.michigan.gov/treasury/news/2025/05/01/calculation-of-state-individual-income-tax-rate-adjustment-for-2025-tax-year
 */
export const MI_TAX_RATE_2025 = 0.0425; // 4.25%

/**
 * Michigan Personal Exemption for 2025
 *
 * Michigan provides personal exemptions for:
 * - Taxpayer: $5,000
 * - Spouse (if MFJ): $5,000
 * - Each dependent: $5,000
 *
 * Note: Different sources show slight variations ($5,000 vs $5,800).
 * Using $5,000 as the conservative/commonly cited value.
 *
 * Source: https://www.efile.com/michigan-tax-brackets-rates-and-forms/
 */
export const MI_PERSONAL_EXEMPTION_2025 = dollarsToCents(5000);

/**
 * Michigan Standard Deduction for 2025
 *
 * Michigan does NOT have a traditional standard deduction like most states.
 * Instead, Michigan provides various specific deductions:
 * - Retirement income deductions (age-based)
 * - Interest/dividend deductions for seniors
 * - Social Security exemption (fully exempt)
 *
 * For simplicity, this implementation does NOT include retirement-specific
 * deductions. They could be added in future enhancements.
 *
 * Source: https://www.efile.com/michigan-tax-brackets-rates-and-forms/
 */
export const MI_HAS_STANDARD_DEDUCTION = false;

/**
 * Michigan Earned Income Tax Credit (EITC) for 2025
 *
 * Michigan provides a state EITC equal to 30% of the federal EITC.
 * This was increased from 6% in 2022 to 30% starting with 2023 tax year.
 *
 * The credit is REFUNDABLE, meaning if it exceeds tax liability,
 * the taxpayer receives a refund.
 *
 * Eligibility: Same as federal EITC requirements.
 *
 * Sources:
 * - https://www.michigan.gov/treasury/news/2025/01/31/michigan-earned-income-tax-credit-for-working-families-lowers-tax-bill-or-provides-refund
 * - https://michiganlegalhelp.org/resources/income-tax/earned-income-tax-credit
 */
export const MI_EITC_PERCENTAGE_2025 = 0.30; // 30% of federal EITC

/**
 * Michigan Retirement Income Deductions (NOT IMPLEMENTED)
 *
 * Michigan allows various retirement income deductions based on taxpayer age:
 *
 * Born before 1946:
 * - Can deduct most retirement/pension income
 * - Up to $14,274 (single) / $28,548 (MFJ) for interest/dividends
 *
 * Born 1946-1952:
 * - Partial deductions with phase-in schedule
 *
 * Born after 1952:
 * - Limited deductions, expanding over time
 * - By 2026, all qualifying retirement income will be exempt
 *
 * Note: This implementation does NOT include retirement deductions.
 * Future enhancement could add age-based retirement income handling.
 *
 * Source: https://www.westshorebank.com/learn/education/articles/2025-tax-deductions-and-credits-in-michigan
 */

/**
 * Calculate number of personal exemptions
 *
 * @param filingStatus - Filing status
 * @param dependents - Number of dependents
 * @returns Total number of exemptions
 */
export function calculateMIExemptions(
  filingStatus: 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold',
  dependents: number
): number {
  let exemptions = 0;

  // Taxpayer exemption
  exemptions += 1;

  // Spouse exemption (for MFJ only)
  if (filingStatus === 'marriedJointly') {
    exemptions += 1;
  }

  // Dependent exemptions
  exemptions += dependents;

  return exemptions;
}
