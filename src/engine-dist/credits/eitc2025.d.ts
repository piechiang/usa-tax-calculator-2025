import type { FilingStatus } from '../rules/2025/federal/standardDeductions';
import { type EITCQualifyingChildren } from '../rules/2025/federal/eitc';
export interface EITCInput {
    filingStatus: FilingStatus;
    earnedIncome: number;
    agi: number;
    qualifyingChildren: EITCQualifyingChildren;
    investmentIncome: number;
}
export interface EITCResult {
    eitc: number;
    disqualified: boolean;
    phase: 'phase-in' | 'plateau' | 'phase-out' | 'zero';
    details: {
        maxCredit: number;
        incomeUsedForCalculation: number;
        thresholdUsed: number;
        completePhaseoutPoint: number;
    };
}
/**
 * Compute Earned Income Tax Credit for 2025
 * Implements precise EITC calculation with investment income test and phase-in/phase-out
 * Source: Rev. Proc. 2024-40 §2.06, IRS Publication 596
 */
export declare function computeEITC2025(input: EITCInput): EITCResult;
//# sourceMappingURL=eitc2025.d.ts.map