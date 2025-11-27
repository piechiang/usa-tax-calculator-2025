/**
 * Mississippi (MS) Tax Rules for 2025
 *
 * Mississippi has a progressive income tax from 0% to 5%.
 * Working toward eventual elimination of income tax.
 *
 * Sources:
 * - Mississippi Department of Revenue
 * - https://www.dor.ms.gov/individual/individual-income-tax
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const MS_RULES_2025: StateTaxRules = {
  state: 'MS',
  taxYear: 2025,

  standardDeduction: {
    single: 236000,               // $2,360
    marriedJointly: 472000,       // $4,720
    marriedSeparately: 236000,    // $2,360
    headOfHousehold: 354000       // $3,540
  },

  personalExemption: 600000,      // $6,000 per exemption (plus $1,500 for age/blindness)

  brackets: {
    single: [
      { max: 400000, rate: 0 },          // Up to $4,000: 0%
      { max: 500000, rate: 0.03 },       // $4,001-$5,000: 3%
      { max: 1000000, rate: 0.04 },      // $5,001-$10,000: 4%
      { max: Infinity, rate: 0.05 }      // Over $10,000: 5%
    ],
    marriedJointly: [
      { max: 400000, rate: 0 },
      { max: 500000, rate: 0.03 },
      { max: 1000000, rate: 0.04 },
      { max: Infinity, rate: 0.05 }
    ],
    marriedSeparately: [
      { max: 400000, rate: 0 },
      { max: 500000, rate: 0.03 },
      { max: 1000000, rate: 0.04 },
      { max: Infinity, rate: 0.05 }
    ],
    headOfHousehold: [
      { max: 400000, rate: 0 },
      { max: 500000, rate: 0.03 },
      { max: 1000000, rate: 0.04 },
      { max: Infinity, rate: 0.05 }
    ]
  },

  eitcPercentage: 0,  // Mississippi does not have state EITC

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: false
  }
};
