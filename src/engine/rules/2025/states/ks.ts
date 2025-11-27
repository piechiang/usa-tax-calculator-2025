/**
 * Kansas (KS) Tax Rules for 2025
 *
 * Kansas has a progressive income tax system with rates from 3.1% to 5.7%.
 *
 * Sources:
 * - Kansas Department of Revenue
 * - https://www.ksrevenue.gov/taxrates.html
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const KS_RULES_2025: StateTaxRules = {
  state: 'KS',
  taxYear: 2025,

  standardDeduction: {
    single: 333000,               // $3,330
    marriedJointly: 800000,       // $8,000
    marriedSeparately: 400000,    // $4,000
    headOfHousehold: 600000       // $6,000
  },

  personalExemption: 225000,      // $2,250 per exemption

  brackets: {
    single: [
      { max: 1500000, rate: 0.031 },     // Up to $15,000: 3.1%
      { max: 3000000, rate: 0.0525 },    // $15,001-$30,000: 5.25%
      { max: Infinity, rate: 0.057 }     // Over $30,000: 5.7%
    ],
    marriedJointly: [
      { max: 3000000, rate: 0.031 },     // Up to $30,000: 3.1%
      { max: 6000000, rate: 0.0525 },    // $30,001-$60,000: 5.25%
      { max: Infinity, rate: 0.057 }     // Over $60,000: 5.7%
    ],
    marriedSeparately: [
      { max: 1500000, rate: 0.031 },
      { max: 3000000, rate: 0.0525 },
      { max: Infinity, rate: 0.057 }
    ],
    headOfHousehold: [
      { max: 1500000, rate: 0.031 },
      { max: 3000000, rate: 0.0525 },
      { max: Infinity, rate: 0.057 }
    ]
  },

  eitcPercentage: 0.17,  // Kansas EITC: 17% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: true
  }
};
