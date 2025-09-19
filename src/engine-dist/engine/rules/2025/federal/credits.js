"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAVERS_CREDIT_2025 = exports.CDCC_2025 = exports.LLC_2025 = exports.AOTC_2025 = exports.EITC_2025 = exports.CTC_2025 = void 0;
const money_1 = require("../../../util/money");
// Child Tax Credit parameters for 2025
exports.CTC_2025 = {
    maxCredit: (0, money_1.dollarsToCents)(2000),
    additionalChildCredit: (0, money_1.dollarsToCents)(1700),
    phaseOutThresholds: {
        marriedJointly: (0, money_1.dollarsToCents)(400000),
        single: (0, money_1.dollarsToCents)(200000),
        marriedSeparately: (0, money_1.dollarsToCents)(200000),
        headOfHousehold: (0, money_1.dollarsToCents)(200000),
    },
    phaseOutRate: 0.05, // $50 per $1,000 of income over threshold
};
// Earned Income Tax Credit parameters for 2025
exports.EITC_2025 = {
    maxCredits: {
        0: (0, money_1.dollarsToCents)(600),
        1: (0, money_1.dollarsToCents)(4213),
        2: (0, money_1.dollarsToCents)(6935),
        3: (0, money_1.dollarsToCents)(7830), // 3+ children
    },
    phaseInRates: {
        0: 0.0765,
        1: 0.34,
        2: 0.40,
        3: 0.45, // 3+ children
    },
    plateauAmounts: {
        0: (0, money_1.dollarsToCents)(7840),
        1: (0, money_1.dollarsToCents)(12390),
        2: (0, money_1.dollarsToCents)(17340),
        3: (0, money_1.dollarsToCents)(17340), // 3+ children
    },
    phaseOutStarts: {
        marriedJointly: {
            0: (0, money_1.dollarsToCents)(16370),
            1: (0, money_1.dollarsToCents)(26610),
            2: (0, money_1.dollarsToCents)(26610),
            3: (0, money_1.dollarsToCents)(26610), // 3+ children
        },
        single: {
            0: (0, money_1.dollarsToCents)(9820),
            1: (0, money_1.dollarsToCents)(20060),
            2: (0, money_1.dollarsToCents)(20060),
            3: (0, money_1.dollarsToCents)(20060), // 3+ children
        },
        marriedSeparately: {
            0: (0, money_1.dollarsToCents)(9820),
            1: (0, money_1.dollarsToCents)(20060),
            2: (0, money_1.dollarsToCents)(20060),
            3: (0, money_1.dollarsToCents)(20060), // 3+ children
        },
        headOfHousehold: {
            0: (0, money_1.dollarsToCents)(16370),
            1: (0, money_1.dollarsToCents)(26610),
            2: (0, money_1.dollarsToCents)(26610),
            3: (0, money_1.dollarsToCents)(26610), // 3+ children
        },
    },
    phaseOutRates: {
        0: 0.0765,
        1: 0.1598,
        2: 0.2106,
        3: 0.2106, // 3+ children
    },
    ageRequirements: {
        minimumAge: 25,
        maximumAge: 64,
    },
};
// American Opportunity Tax Credit parameters for 2025
exports.AOTC_2025 = {
    maxCredit: (0, money_1.dollarsToCents)(2500),
    refundablePercentage: 0.40,
    phaseOutStart: {
        marriedJointly: (0, money_1.dollarsToCents)(160000),
        single: (0, money_1.dollarsToCents)(80000),
        marriedSeparately: (0, money_1.dollarsToCents)(0),
        headOfHousehold: (0, money_1.dollarsToCents)(80000),
    },
    phaseOutRange: (0, money_1.dollarsToCents)(20000), // Phases out over $20,000
};
// Lifetime Learning Credit parameters for 2025
exports.LLC_2025 = {
    maxCredit: (0, money_1.dollarsToCents)(2000),
    creditRate: 0.20,
    maxExpenses: (0, money_1.dollarsToCents)(10000),
    phaseOutStart: {
        marriedJointly: (0, money_1.dollarsToCents)(160000),
        single: (0, money_1.dollarsToCents)(80000),
        marriedSeparately: (0, money_1.dollarsToCents)(0),
        headOfHousehold: (0, money_1.dollarsToCents)(80000),
    },
    phaseOutRange: (0, money_1.dollarsToCents)(20000), // Phases out over $20,000
};
// Child and Dependent Care Credit parameters for 2025
exports.CDCC_2025 = {
    maxExpenses: {
        1: (0, money_1.dollarsToCents)(3000),
        2: (0, money_1.dollarsToCents)(6000), // Two or more children
    },
    creditRates: {
        // Sliding scale based on AGI
        base: 0.20,
        max: 0.35, // 35% for lower incomes
    },
    phaseOutStart: (0, money_1.dollarsToCents)(15000),
    phaseOutEnd: (0, money_1.dollarsToCents)(43000),
};
// Retirement Savings Contributions Credit (Saver's Credit) for 2025
exports.SAVERS_CREDIT_2025 = {
    maxContribution: (0, money_1.dollarsToCents)(2000),
    creditRates: {
        marriedJointly: [
            { agiLimit: (0, money_1.dollarsToCents)(47550), rate: 0.50 },
            { agiLimit: (0, money_1.dollarsToCents)(51800), rate: 0.20 },
            { agiLimit: (0, money_1.dollarsToCents)(79500), rate: 0.10 },
        ],
        single: [
            { agiLimit: (0, money_1.dollarsToCents)(23775), rate: 0.50 },
            { agiLimit: (0, money_1.dollarsToCents)(25900), rate: 0.20 },
            { agiLimit: (0, money_1.dollarsToCents)(39750), rate: 0.10 },
        ],
        headOfHousehold: [
            { agiLimit: (0, money_1.dollarsToCents)(35663), rate: 0.50 },
            { agiLimit: (0, money_1.dollarsToCents)(38850), rate: 0.20 },
            { agiLimit: (0, money_1.dollarsToCents)(59625), rate: 0.10 },
        ],
    },
};
//# sourceMappingURL=credits.js.map