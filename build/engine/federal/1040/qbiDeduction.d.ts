/**
 * Qualified Business Income (QBI) Deduction Calculation (Form 8995/8995-A)
 * Section 199A Deduction for 2025
 */
import { FederalInput } from './types';
/**
 * Calculate Section 199A QBI Deduction
 * Source: IRC §199A, Form 8995/8995-A
 */
export declare function calculateQualifiedBusinessIncome(input: FederalInput, adjustedGrossIncome: number, totalDeductions: number): number;
/**
 * Calculate aggregated QBI items for multiple businesses
 * Used when taxpayer has multiple qualifying businesses
 */
export declare function aggregateQBIItems(businesses: Array<{
    qbi: number;
    wages: number;
    ubia: number;
    isSSTB: boolean;
}>): {
    totalQBI: number;
    totalWages: number;
    totalUBIA: number;
    hasSSTB: boolean;
};
/**
 * Calculate QBI deduction from Real Estate Investment Trusts (REITs)
 */
export declare function calculateREITQBIDeduction(reitDividends: number, taxableIncome: number): number;
/**
 * Calculate QBI deduction from Publicly Traded Partnership (PTP) income
 */
export declare function calculatePTPQBIDeduction(ptpIncome: number, taxableIncome: number): number;
/**
 * Estimate W-2 wages for QBI limitation (when not provided)
 * This is a rough estimation method
 */
export declare function estimateW2Wages(scheduleCSales: number, scheduleCProfit: number): number;
/**
 * Calculate carryforward of QBI losses
 * QBI losses from one year can be carried forward to offset future QBI
 */
export declare function calculateQBILossCarryforward(currentYearQBI: number, priorYearLossCarryforward?: number): {
    currentYearDeduction: number;
    newCarryforward: number;
};
//# sourceMappingURL=qbiDeduction.d.ts.map