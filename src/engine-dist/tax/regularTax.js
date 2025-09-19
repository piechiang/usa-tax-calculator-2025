"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarginalRate2025 = exports.calculateRegularTax2025 = void 0;
const federalBrackets_1 = require("../rules/2025/federal/federalBrackets");
/**
 * Calculate regular income tax using 2025 federal tax brackets
 * Source: Rev. Proc. 2024-40
 */
function calculateRegularTax2025(taxableIncome, filingStatus) {
    if (taxableIncome <= 0)
        return 0;
    const brackets = federalBrackets_1.FEDERAL_BRACKETS_2025[filingStatus];
    let tax = 0;
    let remainingIncome = taxableIncome;
    for (const bracket of brackets) {
        if (remainingIncome <= 0)
            break;
        const bracketSize = bracket.max === Infinity
            ? remainingIncome
            : Math.min(remainingIncome, bracket.max - bracket.min);
        if (bracketSize > 0 && taxableIncome > bracket.min) {
            const taxableInThisBracket = Math.min(bracketSize, taxableIncome - bracket.min);
            tax += Math.round(taxableInThisBracket * bracket.rate);
            remainingIncome -= taxableInThisBracket;
        }
    }
    return tax;
}
exports.calculateRegularTax2025 = calculateRegularTax2025;
/**
 * Find the marginal tax rate for given income and filing status
 */
function getMarginalRate2025(taxableIncome, filingStatus) {
    if (taxableIncome <= 0)
        return 0;
    const brackets = federalBrackets_1.FEDERAL_BRACKETS_2025[filingStatus];
    for (const bracket of brackets) {
        if (taxableIncome > bracket.min && (bracket.max === Infinity || taxableIncome <= bracket.max)) {
            return bracket.rate;
        }
    }
    return 0;
}
exports.getMarginalRate2025 = getMarginalRate2025;
//# sourceMappingURL=regularTax.js.map