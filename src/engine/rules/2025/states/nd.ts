/**
 * North Dakota (ND) Tax Rules for 2025
 *
 * North Dakota has a progressive income tax from 1.95% to 2.5%.
 * Among the lowest state income tax rates.
 *
 * Sources:
 * - North Dakota Office of State Tax Commissioner
 * - https://www.tax.nd.gov/individual-income-tax
 *
 * Last Updated: 2025-01-22
 */


export const ND_RULES_2025 = {
  state: 'ND',
  taxYear: 2025,

  standardDeduction: {
    single: 1460000,              // $14,600 (follows federal)
    marriedJointly: 2920000,      // $29,200
    marriedSeparately: 1460000,   // $14,600
    headOfHousehold: 2190000      // $21,900
  },

  personalExemption: 0,           // North Dakota eliminated personal exemptions

  brackets: {
    single: [
      { max: 4550000, rate: 0.0195 },    // Up to $45,500: 1.95%
      { max: 11025000, rate: 0.0225 },   // $45,501-$110,250: 2.25%
      { max: Infinity, rate: 0.025 }     // Over $110,250: 2.5%
    ],
    marriedJointly: [
      { max: 7600000, rate: 0.0195 },    // Up to $76,000: 1.95%
      { max: 18350000, rate: 0.0225 },   // $76,001-$183,500: 2.25%
      { max: Infinity, rate: 0.025 }     // Over $183,500: 2.5%
    ],
    marriedSeparately: [
      { max: 3800000, rate: 0.0195 },
      { max: 9175000, rate: 0.0225 },
      { max: Infinity, rate: 0.025 }
    ],
    headOfHousehold: [
      { max: 6100000, rate: 0.0195 },    // Up to $61,000: 1.95%
      { max: 14700000, rate: 0.0225 },   // $61,001-$147,000: 2.25%
      { max: Infinity, rate: 0.025 }     // Over $147,000: 2.5%
    ]
  },

  eitcPercentage: 0,  // North Dakota does not have state EITC

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: false
  }
};
