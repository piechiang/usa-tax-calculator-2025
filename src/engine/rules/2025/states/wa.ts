/**
 * Washington State Tax Rules for 2025
 *
 * Washington has NO state income tax on wages and salaries.
 * However, Washington implemented a capital gains tax in 2022 on high earners.
 *
 * Key Features (2025):
 * - No state income tax on wages, salaries, pensions
 * - Capital gains tax: 7% on gains exceeding $262,000 (2025)
 * - High sales tax (6.5% state + local, up to 10.5%)
 * - Business & Occupation (B&O) tax on businesses
 * - Constitutional prohibition on graduated income tax
 *
 * Sources:
 * - Washington Department of Revenue: https://dor.wa.gov
 * - Tax Foundation: https://taxfoundation.org/location/washington/
 * - https://dor.wa.gov/taxes-rates/other-taxes/capital-gains-tax
 *
 * Last Updated: 2025-01-22
 */

export const WA_HAS_NO_INCOME_TAX = true;

/**
 * Washington has NO state income tax on wages/salaries
 *
 * Washington has never had a traditional income tax and relies on:
 * - Sales and use taxes (6.5% state rate)
 * - Capital gains tax (7% on gains > $262,000)
 * - Business & Occupation tax (gross receipts tax)
 * - Property taxes
 * - Excise taxes
 */
export const WA_TAX_RATE_2025 = 0.0; // 0% on wages/salaries

/**
 * Washington Capital Gains Tax (enacted 2022)
 *
 * 7% tax on capital gains exceeding $262,000 annually (2025 threshold).
 * Exemptions:
 * - Real estate sales
 * - Retirement accounts
 * - Certain small business sales
 *
 * Note: This calculator focuses on wage/salary income tax.
 * Capital gains tax would require separate calculation.
 */
export const WA_CAPITAL_GAINS_TAX_RATE_2025 = 0.07; // 7%
export const WA_CAPITAL_GAINS_EXEMPTION_2025 = 262000; // $262,000 (2025)
