import type { FilingStatus } from '../types';
export interface SETaxInput {
    filingStatus: FilingStatus;
    seNetProfit: number;
    w2SocialSecurityWages: number;
    w2MedicareWages: number;
}
export interface SETaxResult {
    oasdi: number;
    medicare: number;
    additionalMedicare: number;
    halfDeduction: number;
    netEarningsFromSE: number;
    totalSETax: number;
}
/**
 * Compute self-employment tax for 2025
 * Implements Schedule SE calculations with proper W-2 wage coordination
 * Source: IRS Topic 751, Schedule SE instructions
 */
export declare function computeSETax2025(input: SETaxInput): SETaxResult;
//# sourceMappingURL=seTax.d.ts.map