import type { FilingStatus } from '../../../types';

// Social Security wage base for 2025 (SSA)
export const SS_WAGE_BASE_2025 = 17610000; // $176,100

// Additional Medicare Tax thresholds for 2025 (0.9% on earnings above threshold)
// Source: IRS Topic 560
export const ADDL_MEDICARE_THRESHOLDS_2025: Record<FilingStatus, number> = {
  single: 20000000,             // $200,000
  headOfHousehold: 20000000,    // $200,000
  marriedJointly: 25000000,     // $250,000
  marriedSeparately: 12500000,  // $125,000
};

// Net Investment Income Tax (NIIT) thresholds for 2025 (3.8% on investment income)
// Source: IRS Form 8960
export const NIIT_THRESHOLDS_2025: Record<FilingStatus, number> = {
  single: 20000000,             // $200,000
  headOfHousehold: 20000000,    // $200,000
  marriedJointly: 25000000,     // $250,000
  marriedSeparately: 12500000,  // $125,000
};

// Self-employment tax rates
export const SE_TAX_RATES = {
  oasdi: 0.124,        // 12.4% OASDI (Social Security)
  medicare: 0.029,     // 2.9% Medicare
  additional: 0.009,   // 0.9% Additional Medicare Tax
  netEarningsRate: 0.9235, // 92.35% of net profit = net earnings from SE
};