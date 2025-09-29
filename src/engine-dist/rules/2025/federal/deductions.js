"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEMIZED_DEDUCTION_PHASEOUT_2025 = exports.PERSONAL_EXEMPTION_2025 = exports.CHARITABLE_DEDUCTION_LIMITS = exports.MEDICAL_EXPENSE_AGI_THRESHOLD = exports.SALT_CAP_2025 = exports.ADDITIONAL_STANDARD_DEDUCTION_2025 = exports.STANDARD_DEDUCTION_2025 = void 0;
const money_1 = require("../../../util/money");
// Standard deductions for 2025 (converted to cents)
// Source: IRS Rev. Proc. 2024-40, aligned with official 2025 amounts
exports.STANDARD_DEDUCTION_2025 = {
    single: (0, money_1.dollarsToCents)(15000),
    marriedJointly: (0, money_1.dollarsToCents)(30000),
    marriedSeparately: (0, money_1.dollarsToCents)(15000),
    headOfHousehold: (0, money_1.dollarsToCents)(22500),
};
// Additional standard deduction amounts for 2025
exports.ADDITIONAL_STANDARD_DEDUCTION_2025 = {
    age65OrOlder: (0, money_1.dollarsToCents)(1400),
    blind: (0, money_1.dollarsToCents)(1400), // Per person
};
// SALT (State and Local Tax) deduction cap
exports.SALT_CAP_2025 = (0, money_1.dollarsToCents)(10000);
// Medical expense AGI threshold
exports.MEDICAL_EXPENSE_AGI_THRESHOLD = 0.075; // 7.5% of AGI
// Charitable deduction limits
exports.CHARITABLE_DEDUCTION_LIMITS = {
    cash: 0.60,
    property: 0.30,
    capitalGainProperty: 0.20, // 20% of AGI for capital gain property
};
// Personal exemption (suspended for 2018-2025)
exports.PERSONAL_EXEMPTION_2025 = 0;
// Itemized deduction phaseout thresholds (suspended for 2018-2025)
exports.ITEMIZED_DEDUCTION_PHASEOUT_2025 = {
    enabled: false,
    thresholds: {
        single: (0, money_1.dollarsToCents)(0),
        marriedJointly: (0, money_1.dollarsToCents)(0),
        marriedSeparately: (0, money_1.dollarsToCents)(0),
        headOfHousehold: (0, money_1.dollarsToCents)(0),
    }
};
//# sourceMappingURL=deductions.js.map