"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAdditionalStandardDeduction = exports.calculateQBIDeduction = exports.chooseDeduction = exports.applySaltCap = exports.calculatePhaseOut = exports.calculateEffectiveRate = exports.calculateMarginalRate = exports.calculateTaxFromBrackets = void 0;
const money_1 = require("./money");
// Progressive tax calculation using brackets
const calculateTaxFromBrackets = (taxableIncome, brackets) => {
    let tax = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= bracket.min)
            break;
        const bracketMax = bracket.max === Infinity ? taxableIncome : Math.min(bracket.max, taxableIncome);
        const taxableInBracket = bracketMax - bracket.min;
        if (taxableInBracket > 0) {
            tax += (0, money_1.toCents)((0, money_1.C)(taxableInBracket).times(bracket.rate));
        }
    }
    return Math.max(0, tax);
};
exports.calculateTaxFromBrackets = calculateTaxFromBrackets;
// Calculate marginal tax rate for given income
const calculateMarginalRate = (taxableIncome, brackets) => {
    for (const bracket of brackets) {
        if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
            return bracket.rate;
        }
    }
    // If income exceeds all brackets, return top rate
    return brackets[brackets.length - 1]?.rate || 0;
};
exports.calculateMarginalRate = calculateMarginalRate;
// Calculate effective tax rate
const calculateEffectiveRate = (totalTax, agi) => {
    if (agi <= 0)
        return 0;
    return totalTax / agi;
};
exports.calculateEffectiveRate = calculateEffectiveRate;
// Phase-out calculation (linear)
const calculatePhaseOut = (income, phaseOutStart, phaseOutEnd, maxBenefit) => {
    if (income <= phaseOutStart)
        return maxBenefit;
    if (income >= phaseOutEnd)
        return 0;
    const phaseOutRange = phaseOutEnd - phaseOutStart;
    const incomeInRange = income - phaseOutStart;
    const reductionRatio = incomeInRange / phaseOutRange;
    return Math.max(0, (0, money_1.toCents)((0, money_1.C)(maxBenefit).times(1 - reductionRatio)));
};
exports.calculatePhaseOut = calculatePhaseOut;
// SALT deduction cap application
const applySaltCap = (saltDeduction, cap) => {
    return Math.min(saltDeduction, cap);
};
exports.applySaltCap = applySaltCap;
// Standard vs itemized deduction comparison
const chooseDeduction = (standardDeduction, itemizedDeduction) => {
    const isItemizing = itemizedDeduction > standardDeduction;
    return {
        deduction: Math.max(standardDeduction, itemizedDeduction),
        isItemizing
    };
};
exports.chooseDeduction = chooseDeduction;
// Calculate QBI deduction (simplified)
const calculateQBIDeduction = (qbiIncome, taxableIncomeBeforeQBI, _w2Wages, _filingStatus) => {
    // Simplified QBI calculation - 20% of QBI income subject to limitations
    const qbiLimit = (0, money_1.toCents)((0, money_1.C)(qbiIncome).times(0.20));
    const taxableIncomeLimit = (0, money_1.toCents)((0, money_1.C)(taxableIncomeBeforeQBI).times(0.20));
    // Basic limitation - lesser of 20% of QBI or 20% of taxable income
    return Math.min(qbiLimit, taxableIncomeLimit);
};
exports.calculateQBIDeduction = calculateQBIDeduction;
// Age-based additional standard deduction
const calculateAdditionalStandardDeduction = (birthDate, isBlind = false, taxYear = 2025) => {
    let additional = 0;
    if (birthDate) {
        const birth = new Date(birthDate);
        const age = taxYear - birth.getFullYear();
        // Additional standard deduction for age 65+
        if (age >= 65) {
            additional += 140000; // $1,400 in cents (2025 estimate)
        }
    }
    // Additional standard deduction for blind
    if (isBlind) {
        additional += 140000; // $1,400 in cents (2025 estimate)
    }
    return additional;
};
exports.calculateAdditionalStandardDeduction = calculateAdditionalStandardDeduction;
//# sourceMappingURL=math.js.map