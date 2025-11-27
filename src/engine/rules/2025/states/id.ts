/**
 * Idaho (ID) Tax Rules for 2025
 *
 * Idaho has a progressive income tax with rates from 1% to 5.8%.
 *
 * Sources:
 * - Idaho State Tax Commission
 * - https://tax.idaho.gov/i-1169.cfm
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const ID_RULES_2025: StateTaxRules = {
  state: 'ID',
  taxYear: 2025,

  standardDeduction: {
    single: 1460000,              // $14,600 (follows federal)
    marriedJointly: 2920000,      // $29,200
    marriedSeparately: 1460000,   // $14,600
    headOfHousehold: 2190000      // $21,900
  },

  personalExemption: 0,           // Idaho eliminated personal exemptions

  brackets: {
    single: [
      { max: 180000, rate: 0.01 },       // Up to $1,800: 1%
      { max: 540000, rate: 0.03 },       // $1,801-$5,400: 3%
      { max: 720000, rate: 0.045 },      // $5,401-$7,200: 4.5%
      { max: Infinity, rate: 0.058 }     // Over $7,200: 5.8%
    ],
    marriedJointly: [
      { max: 180000, rate: 0.01 },
      { max: 540000, rate: 0.03 },
      { max: 720000, rate: 0.045 },
      { max: Infinity, rate: 0.058 }
    ],
    marriedSeparately: [
      { max: 180000, rate: 0.01 },
      { max: 540000, rate: 0.03 },
      { max: 720000, rate: 0.045 },
      { max: Infinity, rate: 0.058 }
    ],
    headOfHousehold: [
      { max: 180000, rate: 0.01 },
      { max: 540000, rate: 0.03 },
      { max: 720000, rate: 0.045 },
      { max: Infinity, rate: 0.058 }
    ]
  },

  eitcPercentage: 0,  // Idaho does not have state EITC

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: false
  }
};
