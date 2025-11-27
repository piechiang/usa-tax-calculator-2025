import type { FilingStatus } from '../../../../types';

/**
 * Pennsylvania 2024-2025 Tax Rate
 *
 * Pennsylvania has a flat income tax rate of 3.07% that applies to all income
 * regardless of filing status or income level.
 *
 * This is one of the simplest tax structures in the United States.
 *
 * Source: Pennsylvania Department of Revenue
 * https://www.revenue.pa.gov/FormsandPublications/FormsforIndividuals/PIT/Pages/default.aspx
 *
 * Last Updated: 2025-10-19
 */

export const PA_TAX_RATE_2025 = 0.0307; // 3.07% flat tax rate

/**
 * Pennsylvania 2025 Tax Brackets
 * For compatibility with graduated tax calculation
 *
 * PA uses a single flat rate, so all "brackets" have the same rate.
 */
export const PA_BRACKETS_2025: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: Infinity, rate: PA_TAX_RATE_2025 }
  ],
  marriedJointly: [
    { min: 0, max: Infinity, rate: PA_TAX_RATE_2025 }
  ],
  marriedSeparately: [
    { min: 0, max: Infinity, rate: PA_TAX_RATE_2025 }
  ],
  headOfHousehold: [
    { min: 0, max: Infinity, rate: PA_TAX_RATE_2025 }
  ]
};
