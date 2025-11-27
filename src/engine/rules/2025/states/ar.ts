/**
 * Arkansas (AR) Tax Rules for 2025
 *
 * Arkansas has a progressive income tax system transitioning to lower rates.
 * Rates range from 2% to 4.7% for 2025.
 *
 * Sources:
 * - Arkansas Department of Finance and Administration
 * - https://www.dfa.arkansas.gov/income-tax/individual-income-tax/
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const AR_RULES_2025: StateTaxRules = {
  state: 'AR',
  taxYear: 2025,

  standardDeduction: {
    single: 236000,               // $2,360
    marriedJointly: 472000,       // $4,720
    marriedSeparately: 236000,    // $2,360
    headOfHousehold: 354000       // $3,540
  },

  personalExemption: 2900,        // $29 per exemption

  brackets: {
    single: [
      { max: 520000, rate: 0.02 },       // Up to $5,200: 2%
      { max: 1040000, rate: 0.03 },      // $5,201-$10,400: 3%
      { max: 1560000, rate: 0.034 },     // $10,401-$15,600: 3.4%
      { max: 2600000, rate: 0.04 },      // $15,601-$26,000: 4%
      { max: Infinity, rate: 0.047 }     // Over $26,000: 4.7%
    ],
    marriedJointly: [
      { max: 520000, rate: 0.02 },
      { max: 1040000, rate: 0.03 },
      { max: 1560000, rate: 0.034 },
      { max: 2600000, rate: 0.04 },
      { max: Infinity, rate: 0.047 }
    ],
    marriedSeparately: [
      { max: 520000, rate: 0.02 },
      { max: 1040000, rate: 0.03 },
      { max: 1560000, rate: 0.034 },
      { max: 2600000, rate: 0.04 },
      { max: Infinity, rate: 0.047 }
    ],
    headOfHousehold: [
      { max: 520000, rate: 0.02 },
      { max: 1040000, rate: 0.03 },
      { max: 1560000, rate: 0.034 },
      { max: 2600000, rate: 0.04 },
      { max: Infinity, rate: 0.047 }
    ]
  },

  eitcPercentage: 0,  // Arkansas does not have state EITC

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: false
  }
};
