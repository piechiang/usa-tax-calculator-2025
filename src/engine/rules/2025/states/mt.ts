/**
 * Montana (MT) Tax Rules for 2025
 *
 * Montana has a progressive income tax from 4.7% to 5.9%.
 *
 * Sources:
 * - Montana Department of Revenue
 * - https://mtrevenue.gov/taxes/individual-income-tax/
 *
 * Last Updated: 2025-01-22
 */


export const MT_RULES_2025 = {
  state: 'MT',
  taxYear: 2025,

  standardDeduction: {
    single: 530000,               // $5,300
    marriedJointly: 1060000,      // $10,600
    marriedSeparately: 530000,    // $5,300
    headOfHousehold: 795000       // $7,950
  },

  personalExemption: 283000,      // $2,830 per exemption

  brackets: {
    single: [
      { max: 2100000, rate: 0.047 },     // Up to $21,000: 4.7%
      { max: 1100000, rate: 0.054 },     // $21,001-$11,000: 5.4%
      { max: Infinity, rate: 0.059 }     // Over $11,000: 5.9%
    ],
    marriedJointly: [
      { max: 4200000, rate: 0.047 },     // Up to $42,000: 4.7%
      { max: 22000000, rate: 0.054 },    // $42,001-$220,000: 5.4%
      { max: Infinity, rate: 0.059 }     // Over $220,000: 5.9%
    ],
    marriedSeparately: [
      { max: 2100000, rate: 0.047 },
      { max: 11000000, rate: 0.054 },
      { max: Infinity, rate: 0.059 }
    ],
    headOfHousehold: [
      { max: 3150000, rate: 0.047 },     // Up to $31,500: 4.7%
      { max: 16500000, rate: 0.054 },    // $31,501-$165,000: 5.4%
      { max: Infinity, rate: 0.059 }     // Over $165,000: 5.9%
    ]
  },

  eitcPercentage: 0.03,  // Montana EITC: 3% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: true
  }
};
