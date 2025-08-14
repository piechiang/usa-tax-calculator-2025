"use strict";
/**
 * IRS Tax Constants for 2025 Tax Year
 * Source: Rev. Proc. 2024-40 and related IRS publications
 * Last updated: 2025-01 (verification required for final amounts)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIIT_2025 = exports.MEDICARE_2025 = exports.SOCIAL_SECURITY_2025 = exports.CTC_CONSTANTS_2025 = exports.EITC_CONSTANTS_2025 = exports.AMT_CONSTANTS_2025 = exports.CAPITAL_GAINS_THRESHOLDS_2025 = exports.TAX_BRACKETS_2025 = exports.STANDARD_DEDUCTIONS_2025 = exports.validateConstants = exports.CALCULATION_CONSTANTS = exports.IRS_CONSTANTS_2025 = void 0;
exports.IRS_CONSTANTS_2025 = {
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
        age65OrBlind: 1550,
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
            { min: 0, max: 48050, rate: 0.00 },
            { min: 48050, max: 518400, rate: 0.15 },
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
            { min: 0, max: 220700, rate: 0.26 },
            { min: 220700, max: null, rate: 0.28 }, // 28% on excess
        ],
    },
    // Earned Income Tax Credit (Rev. Proc. 2024-40 §2.06)
    eitc: {
        maxCredits: {
            0: 1667,
            1: 4328,
            2: 7152,
            3: 8046, // 3 or more qualifying children
        },
        phaseInRates: {
            0: 0.0765,
            1: 0.34,
            2: 0.40,
            3: 0.45, // 45%
        },
        phaseOutRates: {
            0: 0.0765,
            1: 0.1598,
            2: 0.2106,
            3: 0.2106, // 21.06%
        },
        phaseOutThresholds: {
            single: {
                0: 10380,
                1: 21560,
                2: 21560,
                3: 21560, // Start of phaseout for 3+ children
            },
            mfj: {
                0: 16730,
                1: 27910,
                2: 27910,
                3: 27910,
            },
            mfs: {
                0: 10380,
                1: 21560,
                2: 21560,
                3: 21560,
            },
            hoh: {
                0: 16730,
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
        maxPerChild: 2000,
        additionalChildCredit: 1700,
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
        wageBase: 176100,
        employeeRate: 0.062,
        employerRate: 0.062,
        selfEmployedRate: 0.124, // 12.4%
    },
    // Medicare (CMS 2025)
    medicare: {
        employeeRate: 0.0145,
        employerRate: 0.0145,
        selfEmployedRate: 0.029,
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
        rate: 0.038,
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
exports.CALCULATION_CONSTANTS = {
    // Self-employment tax
    SE_DEDUCTION_MULTIPLIER: 0.9235,
    SE_TAX_DEDUCTION_RATE: 0.5,
    // Social Security taxable wages
    SS_WAGE_BASE_2025: 176100,
    // Medical expense AGI threshold
    MEDICAL_EXPENSE_AGI_THRESHOLD: 0.075,
    // SALT deduction cap (TCJA provision)
    SALT_CAP: 10000,
    // Dependent standard deduction (Rev. Proc. 2024-40 §2.15)
    DEPENDENT_STANDARD_DEDUCTION_MIN: 1350,
    DEPENDENT_STANDARD_DEDUCTION_EARNED_PLUS: 450,
    // QBI deduction limits (IRC §199A)
    QBI_DEDUCTION_MAX_RATE: 0.20,
    QBI_PHASEOUT_THRESHOLD_SINGLE: 191650,
    QBI_PHASEOUT_THRESHOLD_MFJ: 383300,
    QBI_PHASEOUT_RANGE: 50000,
    // Rounding rules
    ROUNDING_PRECISION: 0,
    INTERMEDIATE_PRECISION: 2, // Keep 2 decimal places for intermediate calculations
};
// Validation function to ensure constants are up to date
function validateConstants(year) {
    if (year !== 2025) {
        console.warn(`Constants are for 2025, but ${year} was requested`);
        return false;
    }
    // Basic sanity checks
    const checks = [
        exports.IRS_CONSTANTS_2025.standardDeductions.single > 0,
        exports.IRS_CONSTANTS_2025.taxBrackets.single.length === 7,
        exports.IRS_CONSTANTS_2025.socialSecurity.wageBase > 170000,
        exports.IRS_CONSTANTS_2025.eitc.investmentIncomeLimit > 0,
    ];
    return checks.every(check => check);
}
exports.validateConstants = validateConstants;
// Export individual constant groups for easier imports
exports.STANDARD_DEDUCTIONS_2025 = exports.IRS_CONSTANTS_2025.standardDeductions;
exports.TAX_BRACKETS_2025 = exports.IRS_CONSTANTS_2025.taxBrackets;
exports.CAPITAL_GAINS_THRESHOLDS_2025 = exports.IRS_CONSTANTS_2025.capitalGainsThresholds;
exports.AMT_CONSTANTS_2025 = exports.IRS_CONSTANTS_2025.amt;
exports.EITC_CONSTANTS_2025 = exports.IRS_CONSTANTS_2025.eitc;
exports.CTC_CONSTANTS_2025 = exports.IRS_CONSTANTS_2025.ctc;
exports.SOCIAL_SECURITY_2025 = exports.IRS_CONSTANTS_2025.socialSecurity;
exports.MEDICARE_2025 = exports.IRS_CONSTANTS_2025.medicare;
exports.NIIT_2025 = exports.IRS_CONSTANTS_2025.niit;
//# sourceMappingURL=constants2025.js.map