"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePreferentialRatesTax2025 = void 0;
const ltcgThresholds_1 = require("../rules/2025/federal/ltcgThresholds");
/**
 * Compute preferential tax rates for qualified dividends and long-term capital gains
 * Implements IRS worksheet approach using 2025 thresholds (0%/15%/20% rates)
 * Source: Rev. Proc. 2024-40 §2.03
 */
function computePreferentialRatesTax2025(input) {
    const { filingStatus, taxableIncome, qualifiedDividendsAndLTCG } = input;
    const thresholds = ltcgThresholds_1.LTCG_2025[filingStatus];
    // Calculate ordinary taxable income (non-preferential portion)
    const ordinaryTaxableIncome = Math.max(0, taxableIncome - qualifiedDividendsAndLTCG);
    // Step 1: Determine portion taxed at 0%
    // 0% rate applies up to the threshold, reduced by ordinary income
    const zeroRateCapacity = Math.max(0, thresholds.zeroRateMax - ordinaryTaxableIncome);
    const at0Percent = Math.max(0, Math.min(qualifiedDividendsAndLTCG, zeroRateCapacity));
    // Step 2: Determine portion taxed at 15%
    // 15% rate applies from 0% threshold up to 15% threshold, reduced by ordinary income
    const fifteenRateCapacity = Math.max(0, thresholds.fifteenRateMax - ordinaryTaxableIncome);
    const availableFor15 = Math.max(0, fifteenRateCapacity - at0Percent);
    const at15Percent = Math.max(0, Math.min(qualifiedDividendsAndLTCG - at0Percent, availableFor15));
    // Step 3: Remainder is taxed at 20%
    const at20Percent = Math.max(0, qualifiedDividendsAndLTCG - at0Percent - at15Percent);
    // Calculate total preferential tax
    const preferentialTax = Math.round(at15Percent * 0.15 + at20Percent * 0.20);
    return {
        at0Percent,
        at15Percent,
        at20Percent,
        preferentialTax
    };
}
exports.computePreferentialRatesTax2025 = computePreferentialRatesTax2025;
//# sourceMappingURL=longTermCapitalGains.js.map