/**
 * Rhode Island (RI) Tax Rules for 2025
 *
 * Rhode Island has a progressive income tax from 3.75% to 5.99%.
 *
 * Sources:
 * - Rhode Island Division of Taxation
 * - https://tax.ri.gov/taxation/individual-income-tax
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const RI_RULES_2025: StateTaxRules = {
  state: 'RI',
  taxYear: 2025,

  standardDeduction: {
    single: 1010000,              // $10,100
    marriedJointly: 2020000,      // $20,200
    marriedSeparately: 1010000,   // $10,100
    headOfHousehold: 1515000      // $15,150
  },

  personalExemption: 475000,      // $4,750 per exemption

  brackets: {
    single: [
      { max: 7350000, rate: 0.0375 },    // Up to $73,500: 3.75%
      { max: 16750000, rate: 0.0475 },   // $73,501-$167,500: 4.75%
      { max: Infinity, rate: 0.0599 }    // Over $167,500: 5.99%
    ],
    marriedJointly: [
      { max: 7350000, rate: 0.0375 },
      { max: 16750000, rate: 0.0475 },
      { max: Infinity, rate: 0.0599 }
    ],
    marriedSeparately: [
      { max: 7350000, rate: 0.0375 },
      { max: 16750000, rate: 0.0475 },
      { max: Infinity, rate: 0.0599 }
    ],
    headOfHousehold: [
      { max: 7350000, rate: 0.0375 },
      { max: 16750000, rate: 0.0475 },
      { max: Infinity, rate: 0.0599 }
    ]
  },

  eitcPercentage: 0.15,  // Rhode Island EITC: 15% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: true
  }
};
