/**
 * Oklahoma (OK) Tax Rules for 2025
 *
 * Oklahoma has a progressive income tax from 0.25% to 4.75%.
 *
 * Sources:
 * - Oklahoma Tax Commission
 * - https://oklahoma.gov/tax.html
 *
 * Last Updated: 2025-01-22
 */


export const OK_RULES_2025 = {
  state: 'OK',
  taxYear: 2025,

  standardDeduction: {
    single: 680000,               // $6,800
    marriedJointly: 1360000,      // $13,600
    marriedSeparately: 680000,    // $6,800
    headOfHousehold: 1020000      // $10,200
  },

  personalExemption: 100000,      // $1,000 per exemption

  brackets: {
    single: [
      { max: 100000, rate: 0.0025 },     // Up to $1,000: 0.25%
      { max: 250000, rate: 0.0075 },     // $1,001-$2,500: 0.75%
      { max: 380000, rate: 0.0175 },     // $2,501-$3,800: 1.75%
      { max: 475000, rate: 0.0275 },     // $3,801-$4,750: 2.75%
      { max: 710000, rate: 0.0375 },     // $4,751-$7,100: 3.75%
      { max: Infinity, rate: 0.0475 }    // Over $7,100: 4.75%
    ],
    marriedJointly: [
      { max: 200000, rate: 0.0025 },     // Up to $2,000: 0.25%
      { max: 500000, rate: 0.0075 },     // $2,001-$5,000: 0.75%
      { max: 760000, rate: 0.0175 },     // $5,001-$7,600: 1.75%
      { max: 950000, rate: 0.0275 },     // $7,601-$9,500: 2.75%
      { max: 1420000, rate: 0.0375 },    // $9,501-$14,200: 3.75%
      { max: Infinity, rate: 0.0475 }    // Over $14,200: 4.75%
    ],
    marriedSeparately: [
      { max: 100000, rate: 0.0025 },
      { max: 250000, rate: 0.0075 },
      { max: 380000, rate: 0.0175 },
      { max: 475000, rate: 0.0275 },
      { max: 710000, rate: 0.0375 },
      { max: Infinity, rate: 0.0475 }
    ],
    headOfHousehold: [
      { max: 200000, rate: 0.0025 },
      { max: 500000, rate: 0.0075 },
      { max: 760000, rate: 0.0175 },
      { max: 950000, rate: 0.0275 },
      { max: 1420000, rate: 0.0375 },
      { max: Infinity, rate: 0.0475 }
    ]
  },

  eitcPercentage: 0.05,  // Oklahoma EITC: 5% of federal

  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: true,
    eitcRefundable: true
  }
};
