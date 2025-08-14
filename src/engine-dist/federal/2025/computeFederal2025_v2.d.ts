import { TaxPayerInput, FederalResult2025 } from '../../types';
/**
 * Compute federal tax for 2025 tax year using IRS-authoritative constants and methods
 * Implements precise calculation flow following IRS worksheet order
 *
 * Sources:
 * - Rev. Proc. 2024-40 (2025 inflation adjustments)
 * - IRS Form 1040 instructions
 * - Schedule SE (self-employment tax)
 * - Capital gains worksheets
 *
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
export declare function computeFederal2025(input: TaxPayerInput): FederalResult2025;
//# sourceMappingURL=computeFederal2025_v2.d.ts.map