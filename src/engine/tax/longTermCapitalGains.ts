import type { FilingStatus } from '../types';
import { LTCG_2025 } from '../rules/2025/federal/ltcgThresholds';

export interface LTCGInput {
  filingStatus: FilingStatus;
  taxableIncome: number;      // total taxable income (all income types) – cents
  qualifiedDividendsAndLTCG: number; // qualified dividends + net LTCG portion – cents
}

export interface LTCGResult {
  at0Percent: number;         // amount taxed at 0% - cents
  at15Percent: number;        // amount taxed at 15% - cents  
  at20Percent: number;        // amount taxed at 20% - cents
  preferentialTax: number;    // total tax on QD/LTCG - cents
}

/**
 * Compute preferential tax rates for qualified dividends and long-term capital gains
 * Implements IRS worksheet approach using 2025 thresholds (0%/15%/20% rates)
 * Source: Rev. Proc. 2024-40 §2.03
 */
export function computePreferentialRatesTax2025(input: LTCGInput): LTCGResult {
  const { filingStatus, taxableIncome, qualifiedDividendsAndLTCG } = input;
  const thresholds = LTCG_2025[filingStatus];

  // Edge case: QD/LTCG cannot exceed total taxable income
  const effectiveQDLTCG = Math.min(qualifiedDividendsAndLTCG, taxableIncome);

  // Calculate ordinary taxable income (non-preferential portion)
  const ordinaryTaxableIncome = Math.max(0, taxableIncome - effectiveQDLTCG);

  // Step 1: Determine portion taxed at 0%
  // 0% rate applies up to the threshold, reduced by ordinary income
  const zeroRateCapacity = Math.max(0, thresholds.zeroRateMax - ordinaryTaxableIncome);
  const at0Percent = Math.max(0, Math.min(effectiveQDLTCG, zeroRateCapacity));

  // Step 2: Determine portion taxed at 15%
  // 15% rate applies from 0% threshold up to 15% threshold, reduced by max(ordinaryIncome, zeroRateMax)
  const fifteenRateCapacity = Math.max(0, thresholds.fifteenRateMax - Math.max(ordinaryTaxableIncome, thresholds.zeroRateMax));
  const at15Percent = Math.max(0, Math.min(effectiveQDLTCG - at0Percent, fifteenRateCapacity));

  // Step 3: Remainder is taxed at 20%
  const at20Percent = Math.max(0, effectiveQDLTCG - at0Percent - at15Percent);

  // Calculate total preferential tax
  const preferentialTax = Math.round(at15Percent * 0.15 + at20Percent * 0.20);

  return {
    at0Percent,
    at15Percent,
    at20Percent,
    preferentialTax
  };
}