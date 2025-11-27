/**
 * New York 2024 Tax Credits (for 2025 tax returns)
 *
 * New York offers several tax credits to reduce tax liability.
 * The Earned Income Tax Credit (EITC) is the most significant credit.
 *
 * Source: New York State Department of Taxation and Finance
 * https://www.tax.ny.gov/pit/credits/
 *
 * Last Updated: 2025-10-19
 */

/**
 * New York Earned Income Tax Credit (EITC)
 *
 * The New York State EITC is 30% of the federal EITC.
 * This is a refundable credit.
 *
 * Investment income limit: $11,600 for 2024 tax year
 *
 * Source: https://www.tax.ny.gov/pit/credits/earned_income_credit.htm
 */
export const NY_EITC_PERCENTAGE_2025 = 0.30; // 30% of federal EITC

/**
 * Empire State Child Credit
 *
 * This is a refundable credit for families with children under age 4.
 * Percentage of federal child tax credit (varies by income).
 *
 * For families with income up to $50,000: 33% of the federal credit
 * Phase-out begins at $50,000
 */
export const NY_EMPIRE_STATE_CHILD_CREDIT_2025 = {
  maxPercentage: 0.33, // 33% of federal CTC
  phaseOutStart: 50000_00, // $50,000
  childAgeLimit: 4 // Children must be under age 4
};

/**
 * New York City School Tax Credit (NYC residents only)
 *
 * NYC residents may be eligible for the school tax credit.
 * Amount varies by income and filing status.
 *
 * Maximum credit amounts for 2024:
 * - Single: $125
 * - Married Filing Jointly: $250
 * - Head of Household: $125
 *
 * Phase-out begins at certain income levels.
 */
export const NYC_SCHOOL_TAX_CREDIT_2025 = {
  single: 125_00,
  marriedJointly: 250_00,
  headOfHousehold: 125_00
};

/**
 * Child and Dependent Care Credit
 *
 * New York offers a child and dependent care credit based on federal credit.
 * The credit is a percentage of the federal credit (varies by income).
 *
 * For families with income up to $30,000: varies by number of dependents
 */
export const NY_CHILD_DEPENDENT_CARE_CREDIT_2025 = {
  // Credit is calculated as percentage of federal credit
  // Percentage varies by income level
  basePercentage: 0.20 // 20% minimum
};

/**
 * College Tuition Credit/Deduction
 *
 * New York offers a college tuition credit or deduction.
 * Maximum credit: $400 (for higher ed expenses)
 */
export const NY_COLLEGE_TUITION_CREDIT_2025 = 400_00; // $400 max

/**
 * Real Property Tax Credit
 *
 * For homeowners and renters.
 * Amount varies based on income and property taxes paid.
 */
export const NY_PROPERTY_TAX_CREDIT_2025 = {
  // Complex calculation based on income and property taxes
  // See Form IT-214 for details
};
