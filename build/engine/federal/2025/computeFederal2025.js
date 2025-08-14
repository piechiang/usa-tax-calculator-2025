"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFederal2025 = void 0;
const brackets_1 = require("../../rules/2025/federal/brackets");
const deductions_1 = require("../../rules/2025/federal/deductions");
const advancedCredits_1 = require("./advancedCredits");
const money_1 = require("../../util/money");
const math_1 = require("../../util/math");
/**
 * Compute federal tax for 2025 tax year
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
function computeFederal2025(input) {
    // Step 1: Calculate Adjusted Gross Income (AGI)
    const agi = calculateAGI(input);
    // Step 2: Calculate deductions (standard vs itemized)
    const deductionResult = calculateDeductions(input, agi);
    // Step 3: Calculate taxable income
    const taxableIncome = (0, money_1.max0)(agi - deductionResult.deduction);
    // Step 4: Calculate tax before credits
    const taxBeforeCredits = (0, math_1.calculateTaxFromBrackets)(taxableIncome, brackets_1.FEDERAL_BRACKETS_2025[input.filingStatus]);
    // Step 5: Calculate credits
    const credits = calculateCredits(input, agi, taxBeforeCredits);
    // Step 6: Calculate additional taxes
    const additionalTaxes = calculateAdditionalTaxes(input, agi);
    // Step 7: Calculate total tax liability
    const totalNonRefundableCredits = (0, money_1.addCents)(credits.ctc || 0, credits.aotc || 0, credits.llc || 0, credits.otherNonRefundable || 0);
    const taxAfterNonRefundableCredits = (0, money_1.max0)(taxBeforeCredits - totalNonRefundableCredits);
    const totalTax = (0, money_1.addCents)(taxAfterNonRefundableCredits, additionalTaxes?.seTax || 0, additionalTaxes?.niit || 0, additionalTaxes?.medicareSurtax || 0, additionalTaxes?.amt || 0);
    // Step 8: Calculate payments and refund/owe
    const totalPayments = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.payments?.federalWithheld), (0, money_1.safeCurrencyToCents)(input.payments?.estPayments), (0, money_1.safeCurrencyToCents)(input.payments?.eitcAdvance));
    const refundableCredits = (0, money_1.addCents)(credits.eitc || 0, credits.otherRefundable || 0);
    const refundOrOwe = (0, money_1.addCents)(totalPayments, refundableCredits) - totalTax;
    return {
        agi,
        taxableIncome,
        standardDeduction: deductions_1.STANDARD_DEDUCTION_2025[input.filingStatus],
        itemizedDeduction: deductionResult.isItemizing ? deductionResult.deduction : undefined,
        taxBeforeCredits,
        credits,
        additionalTaxes: additionalTaxes || undefined,
        totalTax,
        totalPayments,
        refundOrOwe,
    };
}
exports.computeFederal2025 = computeFederal2025;
/**
 * Calculate Adjusted Gross Income (AGI)
 */
function calculateAGI(input) {
    const income = input.income || {};
    // Total income
    const totalIncome = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(income.wages), (0, money_1.safeCurrencyToCents)(income.interest), (0, money_1.safeCurrencyToCents)(income.dividends?.ordinary), (0, money_1.safeCurrencyToCents)(income.dividends?.qualified), (0, money_1.safeCurrencyToCents)(income.capGains), (0, money_1.safeCurrencyToCents)(income.scheduleCNet), (0, money_1.safeCurrencyToCents)(income.k1?.ordinaryBusinessIncome), (0, money_1.safeCurrencyToCents)(income.k1?.passiveIncome), (0, money_1.safeCurrencyToCents)(income.k1?.portfolioIncome), ...Object.values(income.other || {}).map(v => (0, money_1.safeCurrencyToCents)(v)));
    // Above-the-line deductions (adjustments to income)
    const adjustments = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.adjustments?.studentLoanInterest), (0, money_1.safeCurrencyToCents)(input.adjustments?.hsaDeduction), (0, money_1.safeCurrencyToCents)(input.adjustments?.iraDeduction), (0, money_1.safeCurrencyToCents)(input.adjustments?.seTaxDeduction), (0, money_1.safeCurrencyToCents)(input.adjustments?.businessExpenses));
    return (0, money_1.max0)(totalIncome - adjustments);
}
/**
 * Calculate deductions (standard vs itemized)
 */
function calculateDeductions(input, agi) {
    // Calculate standard deduction
    let standardDeduction = deductions_1.STANDARD_DEDUCTION_2025[input.filingStatus];
    // Add additional standard deduction for age/blindness
    if (input.primary?.birthDate || input.primary?.isBlind) {
        standardDeduction += (0, math_1.calculateAdditionalStandardDeduction)(input.primary.birthDate, input.primary.isBlind, 2025);
    }
    if (input.spouse?.birthDate || input.spouse?.isBlind) {
        standardDeduction += (0, math_1.calculateAdditionalStandardDeduction)(input.spouse.birthDate, input.spouse.isBlind, 2025);
    }
    // Calculate itemized deductions
    const itemized = input.itemized || {};
    const saltDeduction = (0, math_1.applySaltCap)((0, money_1.safeCurrencyToCents)(itemized.stateLocalTaxes), deductions_1.SALT_CAP_2025);
    const medicalDeduction = calculateMedicalDeduction((0, money_1.safeCurrencyToCents)(itemized.medical), agi);
    const itemizedTotal = (0, money_1.addCents)(saltDeduction, (0, money_1.safeCurrencyToCents)(itemized.mortgageInterest), (0, money_1.safeCurrencyToCents)(itemized.charitable), medicalDeduction, (0, money_1.safeCurrencyToCents)(itemized.other));
    return (0, math_1.chooseDeduction)(standardDeduction, itemizedTotal);
}
/**
 * Calculate medical expense deduction (AGI threshold applies)
 */
function calculateMedicalDeduction(medicalExpenses, agi) {
    const threshold = (0, money_1.multiplyCents)(agi, 0.075); // 7.5% of AGI
    return (0, money_1.max0)(medicalExpenses - threshold);
}
/**
 * Calculate federal tax credits using advanced logic
 */
function calculateCredits(input, agi, taxBeforeCredits) {
    // Child Tax Credit with advanced eligibility and phase-out
    const ctcResult = (0, advancedCredits_1.calculateAdvancedCTC)(input, agi, taxBeforeCredits);
    // Earned Income Tax Credit with complex phase-in/phase-out
    const eitcResult = (0, advancedCredits_1.calculateAdvancedEITC)(input, agi);
    // Education credits with expense validation
    const aotcResult = (0, advancedCredits_1.calculateAdvancedAOTC)(input, agi);
    const llcResult = (0, advancedCredits_1.calculateAdvancedLLC)(input, agi);
    // Note: Taxpayers can't claim both AOTC and LLC for the same student
    // In a full implementation, we'd need to optimize which credit to use
    // For now, we'll prefer AOTC over LLC if both are available
    const finalAOTC = aotcResult.aotc;
    const finalLLC = finalAOTC > 0 ? 0 : llcResult.llc;
    return {
        ctc: ctcResult.ctc,
        aotc: finalAOTC,
        llc: finalLLC,
        eitc: eitcResult.eitc,
        otherNonRefundable: 0,
        otherRefundable: (0, money_1.addCents)(ctcResult.additionalChildTaxCredit, aotcResult.refundableAOTC),
    };
}
/**
 * Calculate additional taxes (SE, NIIT, Medicare surtax, AMT)
 */
function calculateAdditionalTaxes(input, agi) {
    // Self-employment tax (simplified)
    const scheduleCNet = (0, money_1.safeCurrencyToCents)(input.income?.scheduleCNet);
    const seTax = scheduleCNet > 0 ? (0, money_1.multiplyCents)(scheduleCNet, 0.1413) : 0; // Simplified 14.13%
    // Net Investment Income Tax (3.8% on investment income over threshold)
    const niitThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
    const investmentIncome = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.income?.interest), (0, money_1.safeCurrencyToCents)(input.income?.dividends?.ordinary), (0, money_1.safeCurrencyToCents)(input.income?.dividends?.qualified), (0, money_1.max0)((0, money_1.safeCurrencyToCents)(input.income?.capGains)));
    const niit = agi > niitThreshold ? (0, money_1.multiplyCents)(investmentIncome, 0.038) : 0;
    // Additional Medicare Tax (0.9% on wages over threshold)
    const medicareThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
    const wages = (0, money_1.safeCurrencyToCents)(input.income?.wages);
    const medicareSurtax = wages > medicareThreshold ? (0, money_1.multiplyCents)(wages - medicareThreshold, 0.009) : 0;
    // AMT (simplified - placeholder)
    const amt = 0;
    return {
        seTax,
        niit,
        medicareSurtax,
        amt,
    };
}
//# sourceMappingURL=computeFederal2025.js.map