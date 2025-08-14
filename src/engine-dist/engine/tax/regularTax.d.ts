import type { FilingStatus } from '../rules/2025/federal/standardDeductions';
/**
 * Calculate regular income tax using 2025 federal tax brackets
 * Source: Rev. Proc. 2024-40
 */
export declare function calculateRegularTax2025(taxableIncome: number, filingStatus: FilingStatus): number;
/**
 * Find the marginal tax rate for given income and filing status
 */
export declare function getMarginalRate2025(taxableIncome: number, filingStatus: FilingStatus): number;
//# sourceMappingURL=regularTax.d.ts.map