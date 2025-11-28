/**
 * West Virginia (WV) Tax Rules for 2025
 *
 * West Virginia has a progressive income tax from 2.36% to 5.12%.
 *
 * Sources:
 * - West Virginia State Tax Department
 * - https://tax.wv.gov/Individuals/Pages/Individuals.aspx
 *
 * Last Updated: 2025-01-22
 */


export const WV_RULES_2025 = {
  state: 'WV',
  taxYear: 2025,

  standardDeduction: {
    single: 0,                    // WV does not use standard deduction
    marriedJointly: 0,
    marriedSeparately: 0,
    headOfHousehold: 0
  },

  personalExemption: 200000,      // $2,000 per exemption

  brackets: {
    single: [
      { max: 1000000, rate: 0.0236 },    // Up to $10,000: 2.36%
      { max: 2500000, rate: 0.0315 },    // $10,001-$25,000: 3.15%
      { max: 4000000, rate: 0.0354 },    // $25,001-$40,000: 3.54%
      { max: 6000000, rate: 0.0472 },    // $40,001-$60,000: 4.72%
      { max: Infinity, rate: 0.0512 }    // Over $60,000: 5.12%
    ],
    marriedJointly: [
      { max: 1000000, rate: 0.0236 },
      { max: 2500000, rate: 0.0315 },
      { max: 4000000, rate: 0.0354 },
      { max: 6000000, rate: 0.0472 },
      { max: Infinity, rate: 0.0512 }
    ],
    marriedSeparately: [
      { max: 1000000, rate: 0.0236 },
      { max: 2500000, rate: 0.0315 },
      { max: 4000000, rate: 0.0354 },
      { max: 6000000, rate: 0.0472 },
      { max: Infinity, rate: 0.0512 }
    ],
    headOfHousehold: [
      { max: 1000000, rate: 0.0236 },
      { max: 2500000, rate: 0.0315 },
      { max: 4000000, rate: 0.0354 },
      { max: 6000000, rate: 0.0472 },
      { max: Infinity, rate: 0.0512 }
    ]
  },

  eitcPercentage: 0,  // West Virginia does not have state EITC

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: false
  }
};
