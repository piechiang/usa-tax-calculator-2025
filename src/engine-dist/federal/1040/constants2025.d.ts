/**
 * IRS Tax Constants for 2025 Tax Year
 * Source: Rev. Proc. 2024-40 and related IRS publications
 * Last updated: 2025-01 (verification required for final amounts)
 */
import { IRSConstants2025, FilingStatus } from './types';
export declare const IRS_CONSTANTS_2025: IRSConstants2025;
export declare const CALCULATION_CONSTANTS: {
    SE_DEDUCTION_MULTIPLIER: number;
    SE_TAX_DEDUCTION_RATE: number;
    SS_WAGE_BASE_2025: number;
    MEDICAL_EXPENSE_AGI_THRESHOLD: number;
    SALT_CAP: number;
    DEPENDENT_STANDARD_DEDUCTION_MIN: number;
    DEPENDENT_STANDARD_DEDUCTION_EARNED_PLUS: number;
    QBI_DEDUCTION_MAX_RATE: number;
    QBI_PHASEOUT_THRESHOLD_SINGLE: number;
    QBI_PHASEOUT_THRESHOLD_MFJ: number;
    QBI_PHASEOUT_RANGE: number;
    ROUNDING_PRECISION: number;
    INTERMEDIATE_PRECISION: number;
};
export declare function validateConstants(year: number): boolean;
export declare const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number>;
export declare const TAX_BRACKETS_2025: Record<FilingStatus, {
    min: number;
    max: number | null;
    rate: number;
}[]>;
export declare const CAPITAL_GAINS_THRESHOLDS_2025: Record<FilingStatus, {
    min: number;
    max: number | null;
    rate: number;
}[]>;
export declare const AMT_CONSTANTS_2025: {
    exemption: Record<FilingStatus, number>;
    phaseoutThreshold: Record<FilingStatus, number>;
    rates: {
        min: number;
        max: number | null;
        rate: number;
    }[];
};
export declare const EITC_CONSTANTS_2025: {
    maxCredits: Record<number, number>;
    phaseInRates: Record<number, number>;
    phaseOutRates: Record<number, number>;
    phaseOutThresholds: Record<FilingStatus, Record<number, number>>;
    investmentIncomeLimit: number;
};
export declare const CTC_CONSTANTS_2025: {
    maxPerChild: number;
    additionalChildCredit: number;
    phaseOutThreshold: Record<FilingStatus, number>;
    phaseOutRate: number;
};
export declare const SOCIAL_SECURITY_2025: {
    wageBase: number;
    employeeRate: number;
    employerRate: number;
    selfEmployedRate: number;
};
export declare const MEDICARE_2025: {
    employeeRate: number;
    employerRate: number;
    selfEmployedRate: number;
    additionalThresholds: Record<FilingStatus, number>;
    additionalRate: number;
};
export declare const NIIT_2025: {
    rate: number;
    thresholds: Record<FilingStatus, number>;
};
//# sourceMappingURL=constants2025.d.ts.map