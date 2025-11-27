/**
 * Hawaii (HI) Tax Rules for 2025
 *
 * Hawaii has a highly progressive income tax system with rates from 1.4% to 11%
 * and relatively low standard deductions.
 *
 * Sources:
 * - Hawaii Department of Taxation
 * - https://tax.hawaii.gov/geninfo/rates/
 * - 2025 HI Tax Rate Schedule
 *
 * Last Updated: 2025-01-22
 */

import type { StateTaxRules } from '../../../types';

export const HI_RULES_2025: StateTaxRules = {
  state: 'HI',
  taxYear: 2025,

  /**
   * HI Standard Deductions for 2025 (in cents)
   * Hawaii has relatively low standard deductions
   */
  standardDeduction: {
    single: 244400,               // $2,444
    marriedJointly: 488800,       // $4,888
    marriedSeparately: 244400,    // $2,444
    headOfHousehold: 366600       // $3,666
  },

  /**
   * HI Personal Exemption for 2025 (in cents)
   * Hawaii provides personal exemptions
   */
  personalExemption: 114400,      // $1,144 per exemption

  /**
   * HI Tax Brackets for 2025 (in cents)
   * Very progressive with 12 brackets, rates from 1.4% to 11%
   */
  brackets: {
    single: [
      { max: 260000, rate: 0.014 },      // Up to $2,600: 1.4%
      { max: 520000, rate: 0.032 },      // $2,601-$5,200: 3.2%
      { max: 1040000, rate: 0.055 },     // $5,201-$10,400: 5.5%
      { max: 2080000, rate: 0.064 },     // $10,401-$20,800: 6.4%
      { max: 3120000, rate: 0.068 },     // $20,801-$31,200: 6.8%
      { max: 4160000, rate: 0.072 },     // $31,201-$41,600: 7.2%
      { max: 5200000, rate: 0.076 },     // $41,601-$52,000: 7.6%
      { max: 6760000, rate: 0.079 },     // $52,001-$67,600: 7.9%
      { max: 10400000, rate: 0.0825 },   // $67,601-$104,000: 8.25%
      { max: 20800000, rate: 0.09 },     // $104,001-$208,000: 9%
      { max: 41600000, rate: 0.10 },     // $208,001-$416,000: 10%
      { max: Infinity, rate: 0.11 }      // Over $416,000: 11%
    ],
    marriedJointly: [
      { max: 520000, rate: 0.014 },      // Up to $5,200: 1.4%
      { max: 1040000, rate: 0.032 },     // $5,201-$10,400: 3.2%
      { max: 2080000, rate: 0.055 },     // $10,401-$20,800: 5.5%
      { max: 4160000, rate: 0.064 },     // $20,801-$41,600: 6.4%
      { max: 6240000, rate: 0.068 },     // $41,601-$62,400: 6.8%
      { max: 8320000, rate: 0.072 },     // $62,401-$83,200: 7.2%
      { max: 10400000, rate: 0.076 },    // $83,201-$104,000: 7.6%
      { max: 13520000, rate: 0.079 },    // $104,001-$135,200: 7.9%
      { max: 20800000, rate: 0.0825 },   // $135,201-$208,000: 8.25%
      { max: 41600000, rate: 0.09 },     // $208,001-$416,000: 9%
      { max: 83200000, rate: 0.10 },     // $416,001-$832,000: 10%
      { max: Infinity, rate: 0.11 }      // Over $832,000: 11%
    ],
    marriedSeparately: [
      { max: 260000, rate: 0.014 },
      { max: 520000, rate: 0.032 },
      { max: 1040000, rate: 0.055 },
      { max: 2080000, rate: 0.064 },
      { max: 3120000, rate: 0.068 },
      { max: 4160000, rate: 0.072 },
      { max: 5200000, rate: 0.076 },
      { max: 6760000, rate: 0.079 },
      { max: 10400000, rate: 0.0825 },
      { max: 20800000, rate: 0.09 },
      { max: 41600000, rate: 0.10 },
      { max: Infinity, rate: 0.11 }
    ],
    headOfHousehold: [
      { max: 390000, rate: 0.014 },      // Up to $3,900: 1.4%
      { max: 780000, rate: 0.032 },      // $3,901-$7,800: 3.2%
      { max: 1560000, rate: 0.055 },     // $7,801-$15,600: 5.5%
      { max: 3120000, rate: 0.064 },     // $15,601-$31,200: 6.4%
      { max: 4680000, rate: 0.068 },     // $31,201-$46,800: 6.8%
      { max: 6240000, rate: 0.072 },     // $46,801-$62,400: 7.2%
      { max: 7800000, rate: 0.076 },     // $62,401-$78,000: 7.6%
      { max: 10140000, rate: 0.079 },    // $78,001-$101,400: 7.9%
      { max: 15600000, rate: 0.0825 },   // $101,401-$156,000: 8.25%
      { max: 31200000, rate: 0.09 },     // $156,001-$312,000: 9%
      { max: 62400000, rate: 0.10 },     // $312,001-$624,000: 10%
      { max: Infinity, rate: 0.11 }      // Over $624,000: 11%
    ]
  },

  /**
   * Hawaii does not have a state EITC
   */
  eitcPercentage: 0,

  /**
   * Special HI provisions
   */
  specialProvisions: {
    allowsItemizedDeductions: true,
    hasStateEITC: false
  }
};
