import type { FilingStatus } from '../../../../types';
import type { TaxBracket } from '../../../../util/taxCalculations';

/**
 * California Tax Brackets for 2025
 *
 * Source: California Franchise Tax Board (FTB)
 * - FTB Publication 1001 (2025 California Tax Rates and Exemptions)
 * - https://www.ftb.ca.gov/forms/2025-california-tax-rates-and-exemptions.html
 *
 * California has 10 tax brackets ranging from 1% to 12.3%
 * Mental Health Services Tax (additional 1% on income above $1M) is calculated separately
 *
 * Last Updated: 2025-01-01
 * All amounts in cents
 */

export const CA_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0,       max: 1079200,   rate: 0.01 },   // $0 - $10,792: 1%
    { min: 1079200, max: 2558000,   rate: 0.02 },   // $10,792 - $25,580: 2%
    { min: 2558000, max: 4037200,   rate: 0.04 },   // $25,580 - $40,372: 4%
    { min: 4037200, max: 5604800,   rate: 0.06 },   // $40,372 - $56,048: 6%
    { min: 5604800, max: 7172400,   rate: 0.08 },   // $56,048 - $71,724: 8%
    { min: 7172400, max: 36771600,  rate: 0.093 },  // $71,724 - $367,716: 9.3%
    { min: 36771600, max: 44127200, rate: 0.103 },  // $367,716 - $441,272: 10.3%
    { min: 44127200, max: 73547200, rate: 0.113 },  // $441,272 - $735,472: 11.3%
    { min: 73547200, max: 100000000, rate: 0.123 }, // $735,472 - $1,000,000: 12.3%
    { min: 100000000, max: Infinity, rate: 0.123 }  // $1,000,000+: 12.3% (MHST applied separately)
  ],

  marriedJointly: [
    { min: 0,        max: 2158400,   rate: 0.01 },   // $0 - $21,584: 1%
    { min: 2158400,  max: 5116000,   rate: 0.02 },   // $21,584 - $51,160: 2%
    { min: 5116000,  max: 8074400,   rate: 0.04 },   // $51,160 - $80,744: 4%
    { min: 8074400,  max: 11209600,  rate: 0.06 },   // $80,744 - $112,096: 6%
    { min: 11209600, max: 14344800,  rate: 0.08 },   // $112,096 - $143,448: 8%
    { min: 14344800, max: 73543200,  rate: 0.093 },  // $143,448 - $735,432: 9.3%
    { min: 73543200, max: 88254400,  rate: 0.103 },  // $735,432 - $882,544: 10.3%
    { min: 88254400, max: 147094400, rate: 0.113 },  // $882,544 - $1,470,944: 11.3%
    { min: 147094400, max: 200000000, rate: 0.123 }, // $1,470,944 - $2,000,000: 12.3%
    { min: 200000000, max: Infinity,  rate: 0.123 }  // $2,000,000+: 12.3% (MHST applied separately)
  ],

  marriedSeparately: [
    { min: 0,       max: 1079200,   rate: 0.01 },   // $0 - $10,792: 1%
    { min: 1079200, max: 2558000,   rate: 0.02 },   // $10,792 - $25,580: 2%
    { min: 2558000, max: 4037200,   rate: 0.04 },   // $25,580 - $40,372: 4%
    { min: 4037200, max: 5604800,   rate: 0.06 },   // $40,372 - $56,048: 6%
    { min: 5604800, max: 7172400,   rate: 0.08 },   // $56,048 - $71,724: 8%
    { min: 7172400, max: 36771600,  rate: 0.093 },  // $71,724 - $367,716: 9.3%
    { min: 36771600, max: 44127200, rate: 0.103 },  // $367,716 - $441,272: 10.3%
    { min: 44127200, max: 73547200, rate: 0.113 },  // $441,272 - $735,472: 11.3%
    { min: 73547200, max: 100000000, rate: 0.123 }, // $735,472 - $1,000,000: 12.3%
    { min: 100000000, max: Infinity, rate: 0.123 }  // $1,000,000+: 12.3% (MHST applied separately)
  ],

  headOfHousehold: [
    { min: 0,        max: 2158600,   rate: 0.01 },   // $0 - $21,586: 1%
    { min: 2158600,  max: 5116800,   rate: 0.02 },   // $21,586 - $51,168: 2%
    { min: 5116800,  max: 8075200,   rate: 0.04 },   // $51,168 - $80,752: 4%
    { min: 8075200,  max: 11210800,  rate: 0.06 },   // $80,752 - $112,108: 6%
    { min: 11210800, max: 14346400,  rate: 0.08 },   // $112,108 - $143,464: 8%
    { min: 14346400, max: 73547200,  rate: 0.093 },  // $143,464 - $735,472: 9.3%
    { min: 73547200, max: 88258400,  rate: 0.103 },  // $735,472 - $882,584: 10.3%
    { min: 88258400, max: 147102400, rate: 0.113 },  // $882,584 - $1,471,024: 11.3%
    { min: 147102400, max: 200000000, rate: 0.123 }, // $1,471,024 - $2,000,000: 12.3%
    { min: 200000000, max: Infinity,  rate: 0.123 }  // $2,000,000+: 12.3% (MHST applied separately)
  ]
};

/**
 * Mental Health Services Tax (MHST)
 *
 * Additional 1% tax on taxable income over $1,000,000
 * Calculated separately from the standard brackets
 *
 * Source: California Revenue and Taxation Code Section 17043
 */
export const CA_MHST_THRESHOLD_2025 = 100000000; // $1,000,000 in cents
export const CA_MHST_RATE = 0.01; // 1%
