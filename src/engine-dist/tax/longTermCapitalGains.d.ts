import type { FilingStatus } from '../types';
export interface LTCGInput {
    filingStatus: FilingStatus;
    taxableIncome: number;
    qualifiedDividendsAndLTCG: number;
}
export interface LTCGResult {
    at0Percent: number;
    at15Percent: number;
    at20Percent: number;
    preferentialTax: number;
}
/**
 * Compute preferential tax rates for qualified dividends and long-term capital gains
 * Implements IRS worksheet approach using 2025 thresholds (0%/15%/20% rates)
 * Source: Rev. Proc. 2024-40 §2.03
 */
export declare function computePreferentialRatesTax2025(input: LTCGInput): LTCGResult;
//# sourceMappingURL=longTermCapitalGains.d.ts.map