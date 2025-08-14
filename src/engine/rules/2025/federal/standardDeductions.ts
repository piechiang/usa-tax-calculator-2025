export type FilingStatus = 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold';

// Standard deduction amounts for 2025 tax year (Rev. Proc. 2024-40)
// Source: IRS news release IR-2024-273
export const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 1500000,            // $15,000
  marriedJointly: 3000000,    // $30,000
  marriedSeparately: 1500000, // $15,000
  headOfHousehold: 2250000,   // $22,500
};

// Additional standard deduction for age 65+ and/or blindness (2025)
export const ADDITIONAL_STANDARD_DEDUCTION_2025 = {
  singleOrHOH: 210000,        // $2,100 per condition
  marriedPerSpouse: 170000,   // $1,700 per spouse per condition
};