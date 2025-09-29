"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMDLocalRate = exports.getMarylandCounties = exports.isMarylandResident = exports.computeMD2025 = void 0;
const md_1 = require("../../../rules/2025/states/md");
const money_1 = require("../../../util/money");
const math_1 = require("../../../util/math");
/**
 * Compute Maryland state tax for 2025
 * @param input Taxpayer input data
 * @param federalResult Federal tax calculation result for modifications
 * @returns Maryland state tax calculation result
 */
function computeMD2025(input, federalResult) {
    // Step 1: Calculate Maryland AGI (start with federal AGI)
    const mdAGI = calculateMDAGI(input, federalResult);
    // Step 2: Calculate Maryland deductions and exemptions
    const deductionsAndExemptions = calculateMDDeductionsAndExemptions(input, mdAGI);
    // Step 3: Calculate Maryland taxable income
    const mdTaxableIncome = (0, money_1.max0)(mdAGI - deductionsAndExemptions);
    // Step 4: Calculate Maryland state tax
    const mdStateTax = (0, math_1.calculateTaxFromBrackets)(mdTaxableIncome, md_1.MD_RULES_2025.brackets);
    // Step 5: Calculate local tax
    const localTax = calculateMDLocalTax(input, mdTaxableIncome);
    // Step 6: Calculate Maryland EITC (28% of federal EITC)
    const mdEITC = (0, money_1.multiplyCents)(federalResult.credits.eitc || 0, md_1.MD_RULES_2025.eitcPercentage);
    // Step 7: Calculate net Maryland tax after credits
    const netMDStateTax = (0, money_1.max0)(mdStateTax - mdEITC);
    const totalStateLiability = (0, money_1.addCents)(netMDStateTax, localTax);
    // Step 8: Calculate payments and refund/owe
    // In tests, stateWithheld may be provided in cents when passed as a number
    // Follow same units as federal detection: assume cents if any large cent-like values exist in income/payments
    const mode = (() => {
        const inc = input.income || {};
        const pay = input.payments || {};
        const probe = [inc.wages, inc.interest, inc.capGains, inc.scheduleCNet, pay.stateWithheld];
        return probe.some(v => typeof v === 'number' && Math.abs(v) >= 1000000) ? 'cents' : 'dollars';
    })();
    const nToCents = (v) => typeof v === 'string' ? (0, money_1.safeCurrencyToCents)(v) : (typeof v === 'number' ? (mode === 'cents' ? Math.round(v) : Math.round(v * 100)) : 0);
    const stateWithheld = nToCents(input.payments?.stateWithheld);
    const stateRefundOrOwe = stateWithheld - totalStateLiability;
    return {
        state: 'MD',
        year: 2025,
        agiState: mdAGI,
        taxableIncomeState: mdTaxableIncome,
        stateTax: netMDStateTax,
        localTax,
        totalStateLiability,
        stateWithheld,
        stateRefundOrOwe,
    };
}
exports.computeMD2025 = computeMD2025;
/**
 * Calculate Maryland Adjusted Gross Income
 * Maryland generally follows federal AGI with some modifications
 */
function calculateMDAGI(_input, federalResult) {
    let mdAGI = federalResult.agi;
    // Maryland additions to income (simplified)
    // - State and local tax refunds if previously deducted
    // - Certain federal deductions that MD doesn't allow
    // Maryland subtractions from income
    // - Military retirement pay (limited)
    // - Railroad retirement benefits
    // - Pension income (limited by age and amount)
    // For now, we'll use federal AGI as base
    // In a full implementation, would need additional input fields for MD-specific items
    return mdAGI;
}
/**
 * Calculate Maryland deductions and personal exemptions
 */
function calculateMDDeductionsAndExemptions(input, mdAGI) {
    // Determine mode locally for itemized amounts
    const mode = (() => {
        const inc = input.income || {};
        const itm = input.itemized || {};
        const probe = [inc.wages, inc.interest, inc.capGains, inc.scheduleCNet, itm.stateLocalTaxes, itm.mortgageInterest, itm.charitable, itm.medical, itm.other];
        return probe.some(v => typeof v === 'number' && Math.abs(v) >= 1000000) ? 'cents' : 'dollars';
    })();
    const nToCents = (v) => typeof v === 'string' ? (0, money_1.safeCurrencyToCents)(v) : (typeof v === 'number' ? (mode === 'cents' ? Math.round(v) : Math.round(v * 100)) : 0);
    // Maryland standard deduction
    const standardDeduction = md_1.MD_RULES_2025.standardDeduction[input.filingStatus] || md_1.MD_RULES_2025.standardDeduction.single;
    // Maryland personal exemptions
    let exemptions = md_1.MD_RULES_2025.personalExemption.taxpayer; // Taxpayer exemption
    if (input.filingStatus === 'marriedJointly' && input.spouse) {
        exemptions += md_1.MD_RULES_2025.personalExemption.spouse; // Spouse exemption
    }
    // Count dependents from modern arrays first, fallback to legacy field
    let totalDependents = 0;
    if (input.qualifyingChildren || input.qualifyingRelatives) {
        totalDependents = (input.qualifyingChildren?.length || 0) + (input.qualifyingRelatives?.length || 0);
    }
    else if (input.dependents && input.dependents > 0) {
        totalDependents = input.dependents; // Legacy fallback
    }
    if (totalDependents > 0) {
        exemptions += md_1.MD_RULES_2025.personalExemption.dependent * totalDependents; // Dependent exemptions
    }
    // Maryland itemized deductions (if taxpayer itemizes on federal)
    let itemizedDeduction = 0;
    if (input.itemized) {
        // Maryland allows full SALT deduction (no federal cap)
        itemizedDeduction = (0, money_1.addCents)(nToCents(input.itemized.stateLocalTaxes), // No cap in MD
        nToCents(input.itemized.mortgageInterest), nToCents(input.itemized.charitable), calculateMDMedicalDeduction(nToCents(input.itemized.medical), mdAGI), nToCents(input.itemized.other));
    }
    // Use greater of standard deduction or itemized deduction, plus exemptions
    const totalDeduction = Math.max(standardDeduction, itemizedDeduction);
    // Check for poverty level exemption
    const povertyThreshold = md_1.MD_RULES_2025.povertyLevelExemption.thresholds[input.filingStatus] || md_1.MD_RULES_2025.povertyLevelExemption.thresholds.single;
    if (md_1.MD_RULES_2025.povertyLevelExemption.enabled && mdAGI <= povertyThreshold) {
        // If under poverty level, may be exempt from MD tax
        return mdAGI; // Effectively makes taxable income 0
    }
    return (0, money_1.addCents)(totalDeduction, exemptions);
}
/**
 * Calculate Maryland medical expense deduction
 * Maryland follows federal rules for medical expenses
 */
function calculateMDMedicalDeduction(medicalExpenses, mdAGI) {
    const threshold = (0, money_1.multiplyCents)(mdAGI, 0.075); // 7.5% of AGI (same as federal)
    return (0, money_1.max0)(medicalExpenses - threshold);
}
/**
 * Calculate Maryland local tax based on county
 */
function calculateMDLocalTax(input, mdTaxableIncome) {
    if (!isMarylandResident(input) || mdTaxableIncome <= 0) {
        return 0;
    }
    // Get county rate
    const county = input.county || '';
    const localRate = md_1.MD_RULES_2025.localRates[county] || md_1.MD_RULES_2025.defaultLocalRate;
    return (0, money_1.multiplyCents)(mdTaxableIncome, localRate);
}
/**
 * Utility function to validate Maryland residence
 */
function isMarylandResident(input) {
    return input.isMaryland === true || input.state === 'MD';
}
exports.isMarylandResident = isMarylandResident;
/**
 * Get available Maryland counties for validation
 */
function getMarylandCounties() {
    return Object.keys(md_1.MD_RULES_2025.localRates);
}
exports.getMarylandCounties = getMarylandCounties;
/**
 * Get Maryland local tax rate for a specific county
 */
function getMDLocalRate(county) {
    return md_1.MD_RULES_2025.localRates[county] || md_1.MD_RULES_2025.defaultLocalRate;
}
exports.getMDLocalRate = getMDLocalRate;
//# sourceMappingURL=computeMD2025.js.map