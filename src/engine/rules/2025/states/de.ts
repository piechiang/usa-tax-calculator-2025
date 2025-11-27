/**
 * Delaware (DE) Tax Rules for 2025
 *
 * Delaware has a progressive income tax system with rates from 2.2% to 6.6%.
 * No sales tax, but has income tax.
 *
 * Sources:
 * - Delaware Division of Revenue
 * - https://revenue.delaware.gov/individual-income-tax/
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const DE_RULES_2025: StateTaxRules = {
  state: 'DE',
  taxYear: 2025,

  standardDeduction: {
    single: 325000,               // $3,250
    marriedJointly: 650000,       // $6,500
    marriedSeparately: 325000,    // $3,250
    headOfHousehold: 487500       // $4,875
  },

  personalExemption: 11000,       // $110 per exemption

  brackets: {
    single: [
      { max: 200000, rate: 0 },          // Up to $2,000: 0%
      { max: 500000, rate: 0.022 },      // $2,001-$5,000: 2.2%
      { max: 1000000, rate: 0.039 },     // $5,001-$10,000: 3.9%
      { max: 2000000, rate: 0.048 },     // $10,001-$20,000: 4.8%
      { max: 2500000, rate: 0.052 },     // $20,001-$25,000: 5.2%
      { max: 6000000, rate: 0.0555 },    // $25,001-$60,000: 5.55%
      { max: Infinity, rate: 0.066 }     // Over $60,000: 6.6%
    ],
    marriedJointly: [
      { max: 200000, rate: 0 },
      { max: 500000, rate: 0.022 },
      { max: 1000000, rate: 0.039 },
      { max: 2000000, rate: 0.048 },
      { max: 2500000, rate: 0.052 },
      { max: 6000000, rate: 0.0555 },
      { max: Infinity, rate: 0.066 }
    ],
    marriedSeparately: [
      { max: 200000, rate: 0 },
      { max: 500000, rate: 0.022 },
      { max: 1000000, rate: 0.039 },
      { max: 2000000, rate: 0.048 },
      { max: 2500000, rate: 0.052 },
      { max: 6000000, rate: 0.0555 },
      { max: Infinity, rate: 0.066 }
    ],
    headOfHousehold: [
      { max: 200000, rate: 0 },
      { max: 500000, rate: 0.022 },
      { max: 1000000, rate: 0.039 },
      { max: 2000000, rate: 0.048 },
      { max: 2500000, rate: 0.052 },
      { max: 6000000, rate: 0.0555 },
      { max: Infinity, rate: 0.066 }
    ]
  },

  eitcPercentage: 0.045,  // Delaware EITC: 4.5% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: false
  }
};
