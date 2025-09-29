"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFederal2025 = void 0;
const federalBrackets_1 = require("../../rules/2025/federal/federalBrackets");
const deductions_1 = require("../../rules/2025/federal/deductions");
const advancedCredits_1 = require("./advancedCredits");
const money_1 = require("../../util/money");
const math_1 = require("../../util/math");
/**
 * Compute federal tax for 2025 tax year
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
// Unified currency conversion: always use safeCurrencyToCents for consistent dollar-to-cents conversion
const nToCents = (val) => {
    return (0, money_1.safeCurrencyToCents)(val);
};
function computeFederal2025(input) {
    // Step 1: Calculate Adjusted Gross Income (AGI)
    const agi = calculateAGI(input);
    // Step 2: Calculate deductions (standard vs itemized)
    const deductionResult = calculateDeductions(input, agi);
    // Step 3: Calculate taxable income
    const taxableIncome = (0, money_1.max0)(agi - deductionResult.deduction);
    // Step 4: Calculate tax before credits
    const taxBeforeCredits = (0, math_1.calculateTaxFromBrackets)(taxableIncome, federalBrackets_1.FEDERAL_BRACKETS_2025[input.filingStatus]);
    // Step 5: Calculate credits
    const credits = calculateCredits(input, agi, taxBeforeCredits);
    // Step 6: Calculate additional taxes
    const additionalTaxes = calculateAdditionalTaxes(input, agi);
    // Step 7: Calculate total tax liability
    const totalNonRefundableCredits = (0, money_1.addCents)(credits.ctc || 0, credits.aotc || 0, credits.llc || 0, credits.otherNonRefundable || 0);
    const taxAfterNonRefundableCredits = (0, money_1.max0)(taxBeforeCredits - totalNonRefundableCredits);
    const totalTax = (0, money_1.addCents)(taxAfterNonRefundableCredits, additionalTaxes?.seTax || 0, additionalTaxes?.niit || 0, additionalTaxes?.medicareSurtax || 0, additionalTaxes?.amt || 0);
    // Step 8: Calculate payments and refund/owe
    const totalPayments = (0, money_1.addCents)(nToCents(input.payments?.federalWithheld), nToCents(input.payments?.estPayments), nToCents(input.payments?.eitcAdvance));
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
    const totalIncome = (0, money_1.addCents)(nToCents(income.wages), nToCents(income.interest), nToCents(income.dividends?.ordinary), nToCents(income.dividends?.qualified), nToCents(income.capGains), nToCents(income.scheduleCNet), nToCents(income.k1?.ordinaryBusinessIncome), nToCents(income.k1?.passiveIncome), nToCents(income.k1?.portfolioIncome), ...Object.values(income.other || {}).map(v => nToCents(v)));
    // Above-the-line deductions (adjustments to income)
    const adjustments = (0, money_1.addCents)(nToCents(input.adjustments?.studentLoanInterest), nToCents(input.adjustments?.hsaDeduction), nToCents(input.adjustments?.iraDeduction), nToCents(input.adjustments?.seTaxDeduction), nToCents(input.adjustments?.businessExpenses));
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
    const saltDeduction = (0, math_1.applySaltCap)(nToCents(itemized.stateLocalTaxes), deductions_1.SALT_CAP_2025);
    const medicalDeduction = calculateMedicalDeduction(nToCents(itemized.medical), agi);
    const itemizedTotal = (0, money_1.addCents)(saltDeduction, nToCents(itemized.mortgageInterest), nToCents(itemized.charitable), medicalDeduction, nToCents(itemized.other));
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
 * Calculate federal tax credits using advanced logic with proper sequencing
 */
function calculateCredits(input, agi, taxBeforeCredits) {
    // Earned Income Tax Credit with complex phase-in/phase-out (refundable, calculated first)
    const eitcResult = (0, advancedCredits_1.calculateAdvancedEITC)(input, agi);
    // Education credits with expense validation (apply before CTC)
    const aotcResult = (0, advancedCredits_1.calculateAdvancedAOTC)(input, agi);
    const llcResult = (0, advancedCredits_1.calculateAdvancedLLC)(input, agi);
    // Note: Allow both AOTC and LLC for different students
    // This fixes the issue where LLC was zeroed out whenever any AOTC was claimed
    const finalAOTC = aotcResult.aotc;
    const finalLLC = llcResult.llc; // Don't zero out LLC automatically
    // Calculate remaining tax liability after other non-refundable credits
    const otherNonRefundableCredits = (0, money_1.addCents)(finalAOTC, finalLLC);
    const taxAfterOtherCredits = (0, money_1.max0)(taxBeforeCredits - otherNonRefundableCredits);
    // Child Tax Credit with advanced eligibility and phase-out (limited by remaining tax)
    const ctcResult = (0, advancedCredits_1.calculateAdvancedCTC)(input, agi, taxAfterOtherCredits);
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
    const scheduleCNet = nToCents(input.income?.scheduleCNet);
    const seTax = scheduleCNet > 0 ? (0, money_1.multiplyCents)(scheduleCNet, 0.1413) : 0; // Simplified 14.13%
    // Net Investment Income Tax (3.8% on lesser of net investment income or excess MAGI)
    const niitThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
    const investmentIncome = (0, money_1.addCents)(nToCents(input.income?.interest), nToCents(input.income?.dividends?.ordinary), nToCents(input.income?.dividends?.qualified), (0, money_1.max0)(nToCents(input.income?.capGains)));
    // NIIT applies to the lesser of: (1) net investment income, or (2) excess of MAGI over threshold
    const excessMAGI = (0, money_1.max0)(agi - niitThreshold);
    const niitBase = Math.min(investmentIncome, excessMAGI);
    const niit = niitBase > 0 ? (0, money_1.multiplyCents)(niitBase, 0.038) : 0;
    // Additional Medicare Tax (0.9% on wages and SE earnings over threshold)
    // Correct thresholds: $250k MFJ, $125k MFS, $200k for others
    let medicareThreshold;
    if (input.filingStatus === 'marriedJointly') {
        medicareThreshold = 25000000; // $250k in cents
    }
    else if (input.filingStatus === 'marriedSeparately') {
        medicareThreshold = 12500000; // $125k in cents
    }
    else {
        medicareThreshold = 20000000; // $200k in cents (single, hoh, etc.)
    }
    const wages = nToCents(input.income?.wages);
    const seEarnings = (0, money_1.max0)(scheduleCNet); // Include SE earnings for Medicare tax
    const totalMedicareEarnings = (0, money_1.addCents)(wages, seEarnings);
    const medicareSurtax = totalMedicareEarnings > medicareThreshold ?
        (0, money_1.multiplyCents)(totalMedicareEarnings - medicareThreshold, 0.009) : 0;
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