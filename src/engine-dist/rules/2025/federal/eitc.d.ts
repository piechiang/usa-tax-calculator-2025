export type EITCQualifyingChildren = 0 | 1 | 2 | 3;
export interface EITCTableRow {
    earnedIncomeAmount: number;
    maxCredit: number;
    thresholdPhaseoutMFJ: number;
    completedPhaseoutMFJ: number;
    thresholdPhaseoutOther: number;
    completedPhaseoutOther: number;
}
export declare const EITC_INVESTMENT_INCOME_LIMIT_2025 = 1195000;
export declare const EITC_2025: Record<EITCQualifyingChildren, EITCTableRow>;
//# sourceMappingURL=eitc.d.ts.map