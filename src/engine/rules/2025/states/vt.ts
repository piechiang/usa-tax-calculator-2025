/**
 * Vermont (VT) Tax Rules for 2025
 *
 * Vermont has a progressive income tax from 3.35% to 8.75%.
 *
 * Sources:
 * - Vermont Department of Taxes
 * - https://tax.vermont.gov/individuals/income-tax
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const VT_RULES_2025: StateTaxRules = {
  state: 'VT',
  taxYear: 2025,

  standardDeduction: {
    single: 750000,               // $7,500
    marriedJointly: 1500000,      // $15,000
    marriedSeparately: 750000,    // $7,500
    headOfHousehold: 1125000      // $11,250
  },

  personalExemption: 530000,      // $5,300 per exemption

  brackets: {
    single: [
      { max: 4550000, rate: 0.0335 },    // Up to $45,500: 3.35%
      { max: 11025000, rate: 0.066 },    // $45,501-$110,250: 6.6%
      { max: 23020000, rate: 0.076 },    // $110,251-$230,200: 7.6%
      { max: Infinity, rate: 0.0875 }    // Over $230,200: 8.75%
    ],
    marriedJointly: [
      { max: 7600000, rate: 0.0335 },    // Up to $76,000: 3.35%
      { max: 18350000, rate: 0.066 },    // $76,001-$183,500: 6.6%
      { max: 28020000, rate: 0.076 },    // $183,501-$280,200: 7.6%
      { max: Infinity, rate: 0.0875 }    // Over $280,200: 8.75%
    ],
    marriedSeparately: [
      { max: 3800000, rate: 0.0335 },
      { max: 9175000, rate: 0.066 },
      { max: 14010000, rate: 0.076 },
      { max: Infinity, rate: 0.0875 }
    ],
    headOfHousehold: [
      { max: 6100000, rate: 0.0335 },    // Up to $61,000: 3.35%
      { max: 14700000, rate: 0.066 },    // $61,001-$147,000: 6.6%
      { max: 23800000, rate: 0.076 },    // $147,001-$238,000: 7.6%
      { max: Infinity, rate: 0.0875 }    // Over $238,000: 8.75%
    ]
  },

  eitcPercentage: 0.36,  // Vermont EITC: 36% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: true
  }
};
