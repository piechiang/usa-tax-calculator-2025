import type { FilingStatus } from '../../../../types';

/**
 * Pennsylvania 2024-2025 Standard Deduction
 *
 * Pennsylvania does NOT have a standard deduction.
 * PA does not follow the federal standard deduction model.
 *
 * Source: Pennsylvania Department of Revenue
 * https://www.revenue.pa.gov/FormsandPublications/PAPersonalIncomeTaxGuide/Pages/Deductions-and-Credits.aspx
 *
 * Last Updated: 2025-10-19
 */

export const PA_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 0,                    // No standard deduction in PA
  marriedJointly: 0,            // No standard deduction in PA
  marriedSeparately: 0,         // No standard deduction in PA
  headOfHousehold: 0            // No standard deduction in PA
};

/**
 * Pennsylvania 2024-2025 Personal Exemption
 *
 * Pennsylvania does NOT have personal exemptions.
 *
 * Source: Pennsylvania Department of Revenue
 * https://www.revenue.pa.gov/FormsandPublications/PAPersonalIncomeTaxGuide/Pages/Deductions-and-Credits.aspx
 *
 * Last Updated: 2025-10-19
 */

export const PA_PERSONAL_EXEMPTION_2025 = 0; // No personal exemption in PA

/**
 * Pennsylvania Allowed Deductions
 *
 * PA law allows only a very limited number of deductions:
 * 1. Medical Savings Account (MSA) contributions
 * 2. Health Savings Account (HSA) contributions
 * 3. IRC Section 529 tuition account program contributions
 * 4. IRC Section 529A Pennsylvania ABLE Savings Account Program contributions
 * 5. Unreimbursed employee business expenses (deducted from compensation)
 *
 * These are handled separately and not as standard deductions.
 */

/**
 * Pennsylvania Retirement Income Exclusion
 *
 * Pennsylvania FULLY EXEMPTS all retirement income from state income tax:
 * - Social Security benefits
 * - Pensions (government and private)
 * - 401(k) distributions
 * - IRA distributions
 * - Annuities
 *
 * This is one of the most taxpayer-friendly retirement income tax policies in the US.
 */
export const PA_RETIREMENT_INCOME_EXEMPT = true;
