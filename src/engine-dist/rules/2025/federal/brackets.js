"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEDERAL_BRACKETS_2025 = void 0;
const money_1 = require("../../../util/money");
// Federal tax brackets for 2025 (converted to cents for precision)
exports.FEDERAL_BRACKETS_2025 = {
    single: [
        { min: 0, max: (0, money_1.dollarsToCents)(11925), rate: 0.10 },
        { min: (0, money_1.dollarsToCents)(11925), max: (0, money_1.dollarsToCents)(48475), rate: 0.12 },
        { min: (0, money_1.dollarsToCents)(48475), max: (0, money_1.dollarsToCents)(103350), rate: 0.22 },
        { min: (0, money_1.dollarsToCents)(103350), max: (0, money_1.dollarsToCents)(197300), rate: 0.24 },
        { min: (0, money_1.dollarsToCents)(197300), max: (0, money_1.dollarsToCents)(250525), rate: 0.32 },
        { min: (0, money_1.dollarsToCents)(250525), max: (0, money_1.dollarsToCents)(626350), rate: 0.35 },
        { min: (0, money_1.dollarsToCents)(626350), max: Infinity, rate: 0.37 }
    ],
    marriedJointly: [
        { min: 0, max: (0, money_1.dollarsToCents)(23850), rate: 0.10 },
        { min: (0, money_1.dollarsToCents)(23850), max: (0, money_1.dollarsToCents)(96950), rate: 0.12 },
        { min: (0, money_1.dollarsToCents)(96950), max: (0, money_1.dollarsToCents)(206700), rate: 0.22 },
        { min: (0, money_1.dollarsToCents)(206700), max: (0, money_1.dollarsToCents)(394600), rate: 0.24 },
        { min: (0, money_1.dollarsToCents)(394600), max: (0, money_1.dollarsToCents)(501050), rate: 0.32 },
        { min: (0, money_1.dollarsToCents)(501050), max: (0, money_1.dollarsToCents)(751600), rate: 0.35 },
        { min: (0, money_1.dollarsToCents)(751600), max: Infinity, rate: 0.37 }
    ],
    marriedSeparately: [
        { min: 0, max: (0, money_1.dollarsToCents)(11925), rate: 0.10 },
        { min: (0, money_1.dollarsToCents)(11925), max: (0, money_1.dollarsToCents)(48475), rate: 0.12 },
        { min: (0, money_1.dollarsToCents)(48475), max: (0, money_1.dollarsToCents)(103350), rate: 0.22 },
        { min: (0, money_1.dollarsToCents)(103350), max: (0, money_1.dollarsToCents)(197300), rate: 0.24 },
        { min: (0, money_1.dollarsToCents)(197300), max: (0, money_1.dollarsToCents)(250525), rate: 0.32 },
        { min: (0, money_1.dollarsToCents)(250525), max: (0, money_1.dollarsToCents)(375800), rate: 0.35 },
        { min: (0, money_1.dollarsToCents)(375800), max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
        { min: 0, max: (0, money_1.dollarsToCents)(17000), rate: 0.10 },
        { min: (0, money_1.dollarsToCents)(17000), max: (0, money_1.dollarsToCents)(64850), rate: 0.12 },
        { min: (0, money_1.dollarsToCents)(64850), max: (0, money_1.dollarsToCents)(103350), rate: 0.22 },
        { min: (0, money_1.dollarsToCents)(103350), max: (0, money_1.dollarsToCents)(197300), rate: 0.24 },
        { min: (0, money_1.dollarsToCents)(197300), max: (0, money_1.dollarsToCents)(250500), rate: 0.32 },
        { min: (0, money_1.dollarsToCents)(250500), max: (0, money_1.dollarsToCents)(626350), rate: 0.35 },
        { min: (0, money_1.dollarsToCents)(626350), max: Infinity, rate: 0.37 }
    ]
};
//# sourceMappingURL=brackets.js.map