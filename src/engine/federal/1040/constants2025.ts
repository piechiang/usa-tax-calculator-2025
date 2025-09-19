/**
 * IRS Tax Constants for 2025 Tax Year
 * Source: Rev. Proc. 2024-40 and related IRS publications
 * Last updated: 2025-01 (verification required for final amounts)
 */

import { IRSConstants2025, FilingStatus } from './types';

export const IRS_CONSTANTS_2025: IRSConstants2025 = {
  // Standard Deductions (Rev. Proc. 2024-40 §2.15)
  standardDeductions: {
    single: 15000,
    mfj: 30000,
    mfs: 15000,
    hoh: 22500,
    qss: 30000,
  },
  
  // Additional Standard Deduction for age 65+ or blind (Rev. Proc. 2024-40 §2.15)
  additionalStandardDeductions: {
    age65OrBlind: 1550, // Single/HOH
    marriedAge65OrBlind: 1250, // MFJ/MFS/QSS
  },
  
  // Tax Brackets (Rev. Proc. 2024-40 §2.01)
  taxBrackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
    mfj: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: null, rate: 0.37 },
    ],
    mfs: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 375800, rate: 0.35 },
      { min: 375800, max: null, rate: 0.37 },
    ],
    hoh: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64750, rate: 0.12 },
      { min: 64750, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
    qss: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: null, rate: 0.37 },
    ],
  },
  
  // Capital Gains Tax Thresholds (Rev. Proc. 2024-40 §2.03)
  capitalGainsThresholds: {
    single: [
      { min: 0, max: 48050, rate: 0.00 }, // 0% bracket
      { min: 48050, max: 518400, rate: 0.15 }, // 15% bracket  
      { min: 518400, max: null, rate: 0.20 }, // 20% bracket
    ],
    mfj: [
      { min: 0, max: 96700, rate: 0.00 },
      { min: 96700, max: 583750, rate: 0.15 },
      { min: 583750, max: null, rate: 0.20 },
    ],
    mfs: [
      { min: 0, max: 48350, rate: 0.00 },
      { min: 48350, max: 291875, rate: 0.15 },
      { min: 291875, max: null, rate: 0.20 },
    ],
    hoh: [
      { min: 0, max: 64750, rate: 0.00 },
      { min: 64750, max: 551200, rate: 0.15 },
      { min: 551200, max: null, rate: 0.20 },
    ],
    qss: [
      { min: 0, max: 96700, rate: 0.00 },
      { min: 96700, max: 583750, rate: 0.15 },
      { min: 583750, max: null, rate: 0.20 },
    ],
  },
  
  // Alternative Minimum Tax (Rev. Proc. 2024-40 §2.11)
  amt: {
    exemption: {
      single: 88100,
      mfj: 137000,
      mfs: 68500,
      hoh: 88100,
      qss: 137000,
    },
    phaseoutThreshold: {
      single: 609350,
      mfj: 1218700,
      mfs: 609350,
      hoh: 609350,
      qss: 1218700,
    },
    rates: [
      { min: 0, max: 220700, rate: 0.26 }, // 26% on first $220,700
      { min: 220700, max: null, rate: 0.28 }, // 28% on excess
    ],
  },
  
  // Earned Income Tax Credit (Rev. Proc. 2024-40 §2.06)
  eitc: {
    maxCredits: {
      0: 1667, // No qualifying children
      1: 4328, // 1 qualifying child
      2: 7152, // 2 qualifying children  
      3: 8046, // 3 or more qualifying children
    },
    phaseInRates: {
      0: 0.0765, // 7.65%
      1: 0.34, // 34%
      2: 0.40, // 40%
      3: 0.45, // 45%
    },
    phaseOutRates: {
      0: 0.0765, // 7.65%
      1: 0.1598, // 15.98%
      2: 0.2106, // 21.06%
      3: 0.2106, // 21.06%
    },
    phaseOutThresholds: {
      single: {
        0: 10380, // Start of phaseout for 0 children
        1: 21560, // Start of phaseout for 1 child
        2: 21560, // Start of phaseout for 2 children
        3: 21560, // Start of phaseout for 3+ children
      },
      mfj: {
        0: 16730, // MFJ adds $6,350
        1: 27910,
        2: 27910,  
        3: 27910,
      },
      mfs: {
        0: 10380, // Same as single
        1: 21560,
        2: 21560,
        3: 21560,
      },
      hoh: {
        0: 16730, // Same as MFJ
        1: 27910,
        2: 27910,
        3: 27910,
      },
      qss: {
        0: 16730,
        1: 27910,
        2: 27910,
        3: 27910,
      },
    },
    investmentIncomeLimit: 11950, // Investment income limit for EITC eligibility
  },
  
  // Child Tax Credit (Rev. Proc. 2024-40 §2.05 + potential 2025 changes)
  ctc: {
    maxPerChild: 2000, // May increase to $2,200 in 2025 - configurable
    additionalChildCredit: 1700, // ACTC refundable portion limit
    phaseOutThreshold: {
      single: 200000,
      mfj: 400000,
      mfs: 200000,
      hoh: 200000,
      qss: 400000,
    },
    phaseOutRate: 0.05, // $50 per $1,000 over threshold
  },
  
  // Social Security (SSA 2025)
  socialSecurity: {
    wageBase: 176100, // 2025 wage base limit
    employeeRate: 0.062, // 6.2%
    employerRate: 0.062, // 6.2%
    selfEmployedRate: 0.124, // 12.4%
  },
  
  // Medicare (CMS 2025)
  medicare: {
    employeeRate: 0.0145, // 1.45%
    employerRate: 0.0145, // 1.45%
    selfEmployedRate: 0.029, // 2.9%
    additionalThresholds: {
      single: 200000,
      mfj: 250000,
      mfs: 125000,
      hoh: 200000,
      qss: 250000,
    },
    additionalRate: 0.009, // 0.9% additional Medicare tax
  },
  
  // Net Investment Income Tax (IRC §1411)
  niit: {
    rate: 0.038, // 3.8%
    thresholds: {
      single: 200000,
      mfj: 250000,
      mfs: 125000,
      hoh: 200000,  
      qss: 250000,
    },
  },
  
  // Source references for verification
  sources: {
    revProc: 'Rev. Proc. 2024-40',
    lastUpdated: '2025-01-01',
    verificationLinks: {
      standardDeductions: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      taxBrackets: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf', 
      eitc: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      socialSecurity: 'https://www.ssa.gov/oact/cola/cbb.html',
      medicare: 'https://www.irs.gov/taxtopics/tc751',
      niit: 'https://www.irs.gov/taxtopics/tc559',
      amt: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      ctc: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
    },
  },
};

// Helper constants for calculations
export const CALCULATION_CONSTANTS = {
  // Self-employment tax
  SE_DEDUCTION_MULTIPLIER: 0.9235, // 92.35% of net earnings subject to SE tax
  SE_TAX_DEDUCTION_RATE: 0.5, // 50% of SE tax is deductible
  
  // Social Security taxable wages
  SS_WAGE_BASE_2025: 176100,
  
  // Medical expense AGI threshold
  MEDICAL_EXPENSE_AGI_THRESHOLD: 0.075, // 7.5%
  
  // SALT deduction cap (TCJA provision)
  SALT_CAP: 10000,
  
  // Dependent standard deduction (Rev. Proc. 2024-40 §2.15)
  DEPENDENT_STANDARD_DEDUCTION_MIN: 1350,
  DEPENDENT_STANDARD_DEDUCTION_EARNED_PLUS: 450,
  
  // QBI deduction limits (IRC §199A)
  QBI_DEDUCTION_MAX_RATE: 0.20, // 20% of QBI or taxable income limitation
  QBI_PHASEOUT_THRESHOLD_SINGLE: 191650,
  QBI_PHASEOUT_THRESHOLD_MFJ: 383300,
  QBI_PHASEOUT_RANGE: 50000, // $50,000 phaseout range
  
  // Rounding rules
  ROUNDING_PRECISION: 0, // Round to nearest dollar for final amounts
  INTERMEDIATE_PRECISION: 2, // Keep 2 decimal places for intermediate calculations
};

// Validation function to ensure constants are up to date
export function validateConstants(year: number): boolean {
  if (year !== 2025) {
    console.warn(`Constants are for 2025, but ${year} was requested`);
    return false;
  }
  
  // Basic sanity checks
  const checks = [
    IRS_CONSTANTS_2025.standardDeductions.single > 0,
    IRS_CONSTANTS_2025.taxBrackets.single.length === 7,
    IRS_CONSTANTS_2025.socialSecurity.wageBase > 170000,
    IRS_CONSTANTS_2025.eitc.investmentIncomeLimit > 0,
  ];
  
  return checks.every(check => check);
}

// Export individual constant groups for easier imports
export const STANDARD_DEDUCTIONS_2025 = IRS_CONSTANTS_2025.standardDeductions;
export const TAX_BRACKETS_2025 = IRS_CONSTANTS_2025.taxBrackets;
export const CAPITAL_GAINS_THRESHOLDS_2025 = IRS_CONSTANTS_2025.capitalGainsThresholds;
export const AMT_CONSTANTS_2025 = IRS_CONSTANTS_2025.amt;
export const EITC_CONSTANTS_2025 = IRS_CONSTANTS_2025.eitc;
export const CTC_CONSTANTS_2025 = IRS_CONSTANTS_2025.ctc;
export const SOCIAL_SECURITY_2025 = IRS_CONSTANTS_2025.socialSecurity;
export const MEDICARE_2025 = IRS_CONSTANTS_2025.medicare;
export const NIIT_2025 = IRS_CONSTANTS_2025.niit;