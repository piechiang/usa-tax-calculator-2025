import { TaxPayerInput, StateResult, FederalResult2025 } from '../../../types';
/**
 * Compute Maryland state tax for 2025
 * @param input Taxpayer input data
 * @param federalResult Federal tax calculation result for modifications
 * @returns Maryland state tax calculation result
 */
export declare function computeMD2025(input: TaxPayerInput, federalResult: FederalResult2025): StateResult;
/**
 * Utility function to validate Maryland residence
 */
export declare function isMarylandResident(input: TaxPayerInput): boolean;
/**
 * Get available Maryland counties for validation
 */
export declare function getMarylandCounties(): string[];
/**
 * Get Maryland local tax rate for a specific county
 */
export declare function getMDLocalRate(county: string): number;
//# sourceMappingURL=computeMD2025.d.ts.map