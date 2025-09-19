"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SE_TAX_RATES = exports.NIIT_THRESHOLDS_2025 = exports.ADDL_MEDICARE_THRESHOLDS_2025 = exports.SS_WAGE_BASE_2025 = void 0;
// Social Security wage base for 2025 (SSA)
exports.SS_WAGE_BASE_2025 = 17610000; // $176,100
// Additional Medicare Tax thresholds for 2025 (0.9% on earnings above threshold)
// Source: IRS Topic 560
exports.ADDL_MEDICARE_THRESHOLDS_2025 = {
    single: 20000000,
    headOfHousehold: 20000000,
    marriedJointly: 25000000,
    marriedSeparately: 12500000, // $125,000
};
// Net Investment Income Tax (NIIT) thresholds for 2025 (3.8% on investment income)
// Source: IRS Form 8960
exports.NIIT_THRESHOLDS_2025 = {
    single: 20000000,
    headOfHousehold: 20000000,
    marriedJointly: 25000000,
    marriedSeparately: 12500000, // $125,000
};
// Self-employment tax rates
exports.SE_TAX_RATES = {
    oasdi: 0.124,
    medicare: 0.029,
    additional: 0.009,
    netEarningsRate: 0.9235, // 92.35% of net profit = net earnings from SE
};
//# sourceMappingURL=medicareSocialSecurity.js.map