/**
 * Pennsylvania 2024-2025 Tax Credits
 *
 * Pennsylvania offers limited tax credits compared to many other states.
 *
 * Source: Pennsylvania Department of Revenue
 * https://www.revenue.pa.gov/FormsandPublications/PAPersonalIncomeTaxGuide/Pages/Deductions-and-Credits.aspx
 *
 * Last Updated: 2025-10-19
 */

/**
 * Tax Forgiveness Credit
 *
 * Pennsylvania offers a "Tax Forgiveness" program for low-income taxpayers.
 * This credit can reduce or eliminate PA state income tax liability.
 *
 * The credit amount depends on income and family size.
 * It's designed to help low-income working families.
 *
 * Income limits and credit amounts vary by filing status and number of dependents.
 */
export const PA_TAX_FORGIVENESS_2025 = {
  // The credit is calculated using a complex formula based on income
  // See PA Schedule SP (Tax Forgiveness Credit) for details
  enabled: true
};

/**
 * Credit for Taxes Paid to Other States
 *
 * Pennsylvania residents who pay income tax to another state on the same income
 * may be eligible for a credit to avoid double taxation.
 *
 * This is a resident credit and applies to income earned in other states.
 */
export const PA_OTHER_STATE_TAX_CREDIT_2025 = {
  enabled: true,
  // Credit is the lesser of:
  // 1. Tax paid to other state
  // 2. PA tax on the same income
};

/**
 * Pennsylvania does NOT offer:
 *
 * - Earned Income Tax Credit (EITC) - No state EITC in PA
 * - Child Tax Credit - No state child credit
 * - Education Credits - No state education credits
 * - Property Tax/Rent Rebate Program - This is a separate program, not an income tax credit
 *
 * PA's tax structure is very simple with minimal credits.
 */

/**
 * Note on Property Tax/Rent Rebate Program
 *
 * While PA has a Property Tax/Rent Rebate Program for seniors and people with disabilities,
 * this is NOT an income tax credit. It's a separate refund program administered by the
 * Department of Revenue but not part of the personal income tax calculation.
 */
