"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSETax2025 = void 0;
const medicareSocialSecurity_1 = require("../rules/2025/federal/medicareSocialSecurity");
/**
 * Compute self-employment tax for 2025
 * Implements Schedule SE calculations with proper W-2 wage coordination
 * Source: IRS Topic 751, Schedule SE instructions
 */
function computeSETax2025(input) {
    const { filingStatus, seNetProfit, w2SocialSecurityWages, w2MedicareWages } = input;
    // Step 1: Calculate net earnings from self-employment (92.35% of positive net profit)
    const netEarningsFromSE = Math.max(0, Math.round(seNetProfit * medicareSocialSecurity_1.SE_TAX_RATES.netEarningsRate));
    // Step 2: OASDI (12.4%) up to Social Security wage base, coordinated with W-2 wages
    const ssRemainingBase = Math.max(0, medicareSocialSecurity_1.SS_WAGE_BASE_2025 - Math.max(0, w2SocialSecurityWages));
    const oasdiBase = Math.min(netEarningsFromSE, ssRemainingBase);
    const oasdi = Math.round(oasdiBase * medicareSocialSecurity_1.SE_TAX_RATES.oasdi);
    // Step 3: Medicare (2.9%) on all net earnings from SE (no wage base limit)
    const medicare = Math.round(netEarningsFromSE * medicareSocialSecurity_1.SE_TAX_RATES.medicare);
    // Step 4: Additional Medicare Tax (0.9%) on combined wages + SE above threshold
    const threshold = medicareSocialSecurity_1.ADDL_MEDICARE_THRESHOLDS_2025[filingStatus];
    const combinedMedicareEarnings = Math.max(0, w2MedicareWages) + netEarningsFromSE;
    const additionalMedicareBase = Math.max(0, combinedMedicareEarnings - threshold);
    const additionalMedicare = Math.round(additionalMedicareBase * medicareSocialSecurity_1.SE_TAX_RATES.additional);
    // Step 5: Above-the-line deduction is one-half of SE tax (OASDI + Medicare only)
    // Note: Additional Medicare Tax is NOT included in the deduction per IRS rules
    const halfDeduction = Math.floor((oasdi + medicare) / 2);
    const totalSETax = oasdi + medicare + additionalMedicare;
    return {
        oasdi,
        medicare,
        additionalMedicare,
        halfDeduction,
        netEarningsFromSE,
        totalSETax
    };
}
exports.computeSETax2025 = computeSETax2025;
//# sourceMappingURL=seTax.js.map