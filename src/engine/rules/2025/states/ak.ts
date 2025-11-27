/**
 * Alaska State Tax Rules for 2025
 *
 * Alaska has NO state income tax and has never had one.
 * Alaska is unique among no-tax states for having the Permanent Fund Dividend (PFD),
 * which pays residents annually from oil revenue investments.
 *
 * Key Features (2025):
 * - No state income tax (never had one)
 * - No state sales tax (though localities may impose sales taxes)
 * - Permanent Fund Dividend: Annual payment to residents (~$1,000-$3,000/year)
 * - Constitutional protection against income tax without voter approval
 * - Revenue from oil/gas production taxes instead
 *
 * Sources:
 * - Alaska Department of Revenue: https://tax.alaska.gov
 * - Alaska Permanent Fund Corporation: https://apfc.org
 * - Tax Foundation: https://taxfoundation.org/location/alaska/
 * - https://www.investopedia.com/articles/personal-finance/112015/why-alaska-pays-you-live-there.asp
 *
 * Last Updated: 2025-01-22
 */

export const AK_HAS_NO_INCOME_TAX = true;

/**
 * Alaska has NO state income tax
 *
 * Alaska has never implemented a state income tax and relies on:
 * - Oil and gas production taxes
 * - Federal transfers
 * - Investment income from Permanent Fund
 * - Local property and sales taxes
 */
export const AK_TAX_RATE_2025 = 0.0; // 0% - No income tax

/**
 * Alaska Permanent Fund Dividend (PFD)
 *
 * Unique feature: Alaska pays residents from oil revenue investments.
 * The PFD amount varies annually based on fund performance.
 *
 * Recent amounts:
 * - 2024: $1,312
 * - 2023: $1,312
 * - 2022: $3,284 (special energy relief payment included)
 * - 2021: $1,114
 * - 2020: $992
 *
 * Note: This is NOT taxable at the state level (no income tax),
 * but IS taxable on federal return as income.
 */
export const AK_HAS_PERMANENT_FUND_DIVIDEND = true;
