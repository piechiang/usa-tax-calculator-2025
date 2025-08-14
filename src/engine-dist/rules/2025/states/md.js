"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MD_RULES_2025 = void 0;
const money_1 = require("../../../util/money");
// Maryland tax rules for 2025
exports.MD_RULES_2025 = {
    // Maryland standard deductions (converted to cents)
    standardDeduction: {
        marriedJointly: (0, money_1.dollarsToCents)(4850),
        single: (0, money_1.dollarsToCents)(2400),
        marriedSeparately: (0, money_1.dollarsToCents)(2400),
        headOfHousehold: (0, money_1.dollarsToCents)(2400),
    },
    // Maryland tax brackets (converted to cents)
    brackets: [
        { min: 0, max: (0, money_1.dollarsToCents)(1000), rate: 0.02 },
        { min: (0, money_1.dollarsToCents)(1000), max: (0, money_1.dollarsToCents)(2000), rate: 0.03 },
        { min: (0, money_1.dollarsToCents)(2000), max: (0, money_1.dollarsToCents)(3000), rate: 0.04 },
        { min: (0, money_1.dollarsToCents)(3000), max: (0, money_1.dollarsToCents)(100000), rate: 0.0475 },
        { min: (0, money_1.dollarsToCents)(100000), max: (0, money_1.dollarsToCents)(125000), rate: 0.05 },
        { min: (0, money_1.dollarsToCents)(125000), max: (0, money_1.dollarsToCents)(150000), rate: 0.0525 },
        { min: (0, money_1.dollarsToCents)(150000), max: (0, money_1.dollarsToCents)(250000), rate: 0.055 },
        { min: (0, money_1.dollarsToCents)(250000), max: Infinity, rate: 0.0575 },
    ],
    // Default local tax rate if county not found
    defaultLocalRate: 0.032,
    // Maryland county local tax rates
    localRates: {
        'Allegany': 0.0305,
        'Anne Arundel': 0.0281,
        'Baltimore City': 0.032,
        'Baltimore County': 0.032,
        'Calvert': 0.032,
        'Caroline': 0.0263,
        'Carroll': 0.032,
        'Cecil': 0.0274,
        'Charles': 0.029,
        'Dorchester': 0.0262,
        'Frederick': 0.0296,
        'Garrett': 0.0265,
        'Harford': 0.0306,
        'Howard': 0.032,
        'Kent': 0.0285,
        'Montgomery': 0.032,
        'Prince Georges': 0.032,
        'Queen Annes': 0.0285,
        'Somerset': 0.032,
        'St. Marys': 0.032,
        'Talbot': 0.0240,
        'Washington': 0.028,
        'Wicomico': 0.032,
        'Worcester': 0.0125,
    },
    // Maryland personal exemptions
    personalExemption: {
        taxpayer: (0, money_1.dollarsToCents)(3200),
        spouse: (0, money_1.dollarsToCents)(3200),
        dependent: (0, money_1.dollarsToCents)(3200),
    },
    // Maryland EITC (percentage of federal EITC)
    eitcPercentage: 0.28,
    // Maryland tax-free pay (subtraction modification)
    taxFreePay: {
        military: true,
        railroad: true,
        pension: {
            maximum: (0, money_1.dollarsToCents)(33100),
            ageRequirement: 65,
        },
    },
    // Maryland itemized deduction limitations
    itemizedLimitations: {
        saltDeduction: {
            // Maryland allows full SALT deduction (no federal cap)
            allowFull: true,
        },
    },
    // Maryland poverty level exemption
    povertyLevelExemption: {
        enabled: true,
        thresholds: {
            single: (0, money_1.dollarsToCents)(15000),
            marriedJointly: (0, money_1.dollarsToCents)(20000),
            marriedSeparately: (0, money_1.dollarsToCents)(15000),
            headOfHousehold: (0, money_1.dollarsToCents)(18000),
        },
    },
};
//# sourceMappingURL=md.js.map