/**
 * Maine (ME) Tax Rules for 2025
 *
 * Maine has a progressive income tax from 5.8% to 7.15%.
 *
 * Sources:
 * - Maine Revenue Services
 * - https://www.maine.gov/revenue/taxes/income-estate-tax/individual-income-tax
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const ME_RULES_2025: StateTaxRules = {
  state: 'ME',
  taxYear: 2025,

  standardDeduction: {
    single: 1460000,              // $14,600 (follows federal)
    marriedJointly: 2920000,      // $29,200
    marriedSeparately: 1460000,   // $14,600
    headOfHousehold: 2190000      // $21,900
  },

  personalExemption: 520000,      // $5,200 per exemption

  brackets: {
    single: [
      { max: 2500000, rate: 0.058 },     // Up to $25,000: 5.8%
      { max: 5950000, rate: 0.0675 },    // $25,001-$59,500: 6.75%
      { max: Infinity, rate: 0.0715 }    // Over $59,500: 7.15%
    ],
    marriedJointly: [
      { max: 5000000, rate: 0.058 },     // Up to $50,000: 5.8%
      { max: 11900000, rate: 0.0675 },   // $50,001-$119,000: 6.75%
      { max: Infinity, rate: 0.0715 }    // Over $119,000: 7.15%
    ],
    marriedSeparately: [
      { max: 2500000, rate: 0.058 },
      { max: 5950000, rate: 0.0675 },
      { max: Infinity, rate: 0.0715 }
    ],
    headOfHousehold: [
      { max: 3750000, rate: 0.058 },     // Up to $37,500: 5.8%
      { max: 8925000, rate: 0.0675 },    // $37,501-$89,250: 6.75%
      { max: Infinity, rate: 0.0715 }    // Over $89,250: 7.15%
    ]
  },

  eitcPercentage: 0.15,  // Maine EITC: 15% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: true
  }
};
