/**
 * District of Columbia (DC) Tax Rules for 2025
 *
 * DC has a progressive income tax system with rates from 4% to 10.75%
 * and a standard deduction that varies by filing status.
 *
 * Sources:
 * - DC Office of Tax and Revenue
 * - https://otr.cfo.dc.gov/page/individual-income-tax
 * - 2025 DC Tax Rate Schedule
 *
 * Last Updated: 2025-01-22
 */


export const DC_RULES_2025 = {
  state: 'DC',
  taxYear: 2025,

  /**
   * DC Standard Deductions for 2025 (in cents)
   * Based on DC tax code
   */
  standardDeduction: {
    single: 1382500,              // $13,825
    marriedJointly: 2765000,      // $27,650
    marriedSeparately: 1382500,   // $13,825
    headOfHousehold: 2076500      // $20,765
  },

  /**
   * DC Personal Exemption for 2025 (in cents)
   * DC provides personal exemptions per person
   */
  personalExemption: 195000,      // $1,950 per exemption

  /**
   * DC Tax Brackets for 2025 (in cents)
   * Progressive rates from 4% to 10.75%
   */
  brackets: {
    single: [
      { min: 0, max: 1000000, rate: 0.04 },          // $0-$10,000: 4%
      { min: 1000000, max: 4000000, rate: 0.06 },    // $10,000-$40,000: 6%
      { min: 4000000, max: 6000000, rate: 0.065 },   // $40,000-$60,000: 6.5%
      { min: 6000000, max: 35000000, rate: 0.085 },  // $60,000-$350,000: 8.5%
      { min: 35000000, max: 100000000, rate: 0.0925 }, // $350,000-$1,000,000: 9.25%
      { min: 100000000, max: Infinity, rate: 0.1075 }  // Over $1,000,000: 10.75%
    ],
    marriedJointly: [
      { min: 0, max: 1000000, rate: 0.04 },          // $0-$10,000: 4%
      { min: 1000000, max: 4000000, rate: 0.06 },    // $10,000-$40,000: 6%
      { min: 4000000, max: 6000000, rate: 0.065 },   // $40,000-$60,000: 6.5%
      { min: 6000000, max: 35000000, rate: 0.085 },  // $60,000-$350,000: 8.5%
      { min: 35000000, max: 100000000, rate: 0.0925 }, // $350,000-$1,000,000: 9.25%
      { min: 100000000, max: Infinity, rate: 0.1075 }  // Over $1,000,000: 10.75%
    ],
    marriedSeparately: [
      { min: 0, max: 1000000, rate: 0.04 },          // $0-$10,000: 4%
      { min: 1000000, max: 4000000, rate: 0.06 },    // $10,000-$40,000: 6%
      { min: 4000000, max: 6000000, rate: 0.065 },   // $40,000-$60,000: 6.5%
      { min: 6000000, max: 35000000, rate: 0.085 },  // $60,000-$350,000: 8.5%
      { min: 35000000, max: 100000000, rate: 0.0925 }, // $350,000-$1,000,000: 9.25%
      { min: 100000000, max: Infinity, rate: 0.1075 }  // Over $1,000,000: 10.75%
    ],
    headOfHousehold: [
      { min: 0, max: 1000000, rate: 0.04 },          // $0-$10,000: 4%
      { min: 1000000, max: 4000000, rate: 0.06 },    // $10,000-$40,000: 6%
      { min: 4000000, max: 6000000, rate: 0.065 },   // $40,000-$60,000: 6.5%
      { min: 6000000, max: 35000000, rate: 0.085 },  // $60,000-$350,000: 8.5%
      { min: 35000000, max: 100000000, rate: 0.0925 }, // $350,000-$1,000,000: 9.25%
      { min: 100000000, max: Infinity, rate: 0.1075 }  // Over $1,000,000: 10.75%
    ]
  },

  /**
   * DC Earned Income Tax Credit
   * DC provides EITC at 70% of federal EITC (higher than most states)
   */
  eitcPercentage: 0.70,

  /**
   * Special DC provisions
   */
  specialProvisions: {
    // DC allows itemized deductions to mirror federal
    allowsItemizedDeductions: true,

    // DC has a generous EITC
    hasStateEITC: true,

    // DC EITC is refundable
    eitcRefundable: true
  }
};
