"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFederal2025 = void 0;
const deductions_1 = require("../../rules/2025/federal/deductions");
const medicareSocialSecurity_1 = require("../../rules/2025/federal/medicareSocialSecurity");
// Import new authoritative calculation modules
const seTax_1 = require("../../tax/seTax");
const longTermCapitalGains_1 = require("../../tax/longTermCapitalGains");
const regularTax_1 = require("../../tax/regularTax");
const eitc2025_1 = require("../../credits/eitc2025");
// Import existing advanced credits (CTC, AOTC, LLC)
const advancedCredits_1 = require("./advancedCredits");
const money_1 = require("../../util/money");
/**
 * Compute federal tax for 2025 tax year using IRS-authoritative constants and methods
 * Implements precise calculation flow following IRS worksheet order
 *
 * Sources:
 * - Rev. Proc. 2024-40 (2025 inflation adjustments)
 * - IRS Form 1040 instructions
 * - Schedule SE (self-employment tax)
 * - Capital gains worksheets
 *
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
function computeFederal2025(input) {
    // === STEP A: Calculate Self-Employment Tax (needed for AGI adjustment) ===
    const seTaxResult = calculateSelfEmploymentTax(input);
    // === STEP B: Calculate Adjusted Gross Income (AGI) ===
    const agi = calculateAGI(input, seTaxResult.halfDeduction);
    // === STEP C: Calculate Deductions (Standard vs Itemized) ===
    const deductionResult = calculateDeductions(input, agi);
    // === STEP D: Calculate Taxable Income ===
    const taxableIncome = (0, money_1.max0)(agi - deductionResult.deduction);
    // === STEP E: Calculate Regular Tax + Preferential Rates ===
    const taxResult = calculateIncomeTax(input, taxableIncome);
    // === STEP F: Calculate Additional Taxes ===
    const additionalTaxes = calculateAdditionalTaxes(input, agi, seTaxResult);
    // === STEP G: Calculate Credits ===
    const credits = calculateCredits(input, agi, taxResult.totalIncomeTax);
    // === STEP H: Calculate Final Tax Liability ===
    const totalNonRefundableCredits = (0, money_1.addCents)(credits.ctc || 0, credits.aotc || 0, credits.llc || 0, credits.otherNonRefundable || 0);
    const taxAfterNonRefundableCredits = (0, money_1.max0)(taxResult.totalIncomeTax - totalNonRefundableCredits);
    const totalTax = (0, money_1.addCents)(taxAfterNonRefundableCredits, additionalTaxes.seTax || 0, additionalTaxes.niit || 0, additionalTaxes.medicareSurtax || 0, additionalTaxes.amt || 0);
    // === STEP I: Calculate Payments and Refund/Owe ===
    const totalPayments = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.payments?.federalWithheld), (0, money_1.safeCurrencyToCents)(input.payments?.estPayments), (0, money_1.safeCurrencyToCents)(input.payments?.eitcAdvance));
    const refundableCredits = (0, money_1.addCents)(credits.eitc || 0, credits.otherRefundable || 0);
    const refundOrOwe = (0, money_1.addCents)(totalPayments, refundableCredits) - totalTax;
    return {
        agi,
        taxableIncome,
        standardDeduction: deductionResult.isStandard ? deductionResult.deduction : deductions_1.STANDARD_DEDUCTION_2025[input.filingStatus],
        itemizedDeduction: deductionResult.isStandard ? undefined : deductionResult.deduction,
        taxBeforeCredits: taxResult.totalIncomeTax,
        credits,
        additionalTaxes,
        totalTax,
        totalPayments,
        refundOrOwe,
    };
}
exports.computeFederal2025 = computeFederal2025;
/**
 * Calculate Self-Employment Tax (Schedule SE)
 * Must be calculated first as it affects AGI via the deduction
 */
function calculateSelfEmploymentTax(input) {
    const seNetProfit = (0, money_1.safeCurrencyToCents)(input.income?.scheduleCNet) || 0;
    const w2SocialSecurityWages = (0, money_1.safeCurrencyToCents)(input.income?.wages) || 0;
    const w2MedicareWages = (0, money_1.safeCurrencyToCents)(input.income?.wages) || 0;
    if (seNetProfit <= 0) {
        return {
            oasdi: 0,
            medicare: 0,
            additionalMedicare: 0,
            halfDeduction: 0,
            netEarningsFromSE: 0,
            totalSETax: 0
        };
    }
    return (0, seTax_1.computeSETax2025)({
        filingStatus: input.filingStatus,
        seNetProfit,
        w2SocialSecurityWages,
        w2MedicareWages
    });
}
/**
 * Calculate Adjusted Gross Income with SE tax deduction
 */
function calculateAGI(input, seTaxDeduction) {
    const income = input.income || {};
    // Total income from all sources
    const totalIncome = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(income.wages), (0, money_1.safeCurrencyToCents)(income.interest), (0, money_1.safeCurrencyToCents)(income.dividends?.ordinary), (0, money_1.safeCurrencyToCents)(income.dividends?.qualified), (0, money_1.safeCurrencyToCents)(income.capGains), (0, money_1.safeCurrencyToCents)(income.scheduleCNet), (0, money_1.safeCurrencyToCents)(income.k1?.ordinaryBusinessIncome), (0, money_1.safeCurrencyToCents)(income.k1?.passiveIncome), (0, money_1.safeCurrencyToCents)(income.k1?.portfolioIncome), ...Object.values(income.other || {}).map(v => (0, money_1.safeCurrencyToCents)(v)));
    // Above-the-line deductions (adjustments to income)
    const adjustments = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.adjustments?.studentLoanInterest), (0, money_1.safeCurrencyToCents)(input.adjustments?.hsaDeduction), (0, money_1.safeCurrencyToCents)(input.adjustments?.iraDeduction), (0, money_1.safeCurrencyToCents)(input.adjustments?.businessExpenses), seTaxDeduction // Half of SE tax
    );
    return (0, money_1.max0)(totalIncome - adjustments);
}
/**
 * Calculate deductions using 2025 IRS amounts
 */
function calculateDeductions(input, agi) {
    // Calculate standard deduction with age/blindness adjustments
    let standardDeduction = deductions_1.STANDARD_DEDUCTION_2025[input.filingStatus];
    // Additional standard deduction for age 65+ and/or blindness
    if (input.primary?.birthDate || input.primary?.isBlind) {
        if (input.primary.isBlind) {
            standardDeduction += deductions_1.ADDITIONAL_STANDARD_DEDUCTION_2025.blind;
        }
        // Add age calculation here when needed (currently using simplified approach)
        if (input.primary.birthDate) {
            standardDeduction += deductions_1.ADDITIONAL_STANDARD_DEDUCTION_2025.age65OrOlder;
        }
    }
    if (input.spouse?.birthDate || input.spouse?.isBlind) {
        if (input.spouse.isBlind) {
            standardDeduction += deductions_1.ADDITIONAL_STANDARD_DEDUCTION_2025.blind;
        }
        if (input.spouse.birthDate) {
            standardDeduction += deductions_1.ADDITIONAL_STANDARD_DEDUCTION_2025.age65OrOlder;
        }
    }
    // Calculate itemized deductions
    const itemized = input.itemized || {};
    const saltDeduction = Math.min((0, money_1.safeCurrencyToCents)(itemized.stateLocalTaxes) || 0, deductions_1.SALT_CAP_2025);
    const medicalDeduction = calculateMedicalDeduction((0, money_1.safeCurrencyToCents)(itemized.medical) || 0, agi);
    const itemizedTotal = (0, money_1.addCents)(saltDeduction, (0, money_1.safeCurrencyToCents)(itemized.mortgageInterest), (0, money_1.safeCurrencyToCents)(itemized.charitable), medicalDeduction, (0, money_1.safeCurrencyToCents)(itemized.other));
    // Choose higher deduction
    const useStandard = standardDeduction >= itemizedTotal;
    return {
        deduction: useStandard ? standardDeduction : itemizedTotal,
        isStandard: useStandard
    };
}
/**
 * Calculate medical expense deduction (7.5% AGI threshold)
 */
function calculateMedicalDeduction(medicalExpenses, agi) {
    const threshold = (0, money_1.multiplyCents)(agi, 0.075); // 7.5% of AGI
    return (0, money_1.max0)(medicalExpenses - threshold);
}
/**
 * Calculate income tax using regular brackets + preferential rates
 */
function calculateIncomeTax(input, taxableIncome) {
    // Identify qualified dividends and long-term capital gains
    const qualifiedDividends = (0, money_1.safeCurrencyToCents)(input.income?.dividends?.qualified) || 0;
    const longTermCapGains = Math.max(0, (0, money_1.safeCurrencyToCents)(input.income?.capGains) || 0); // Only positive LTCG get preferential rates
    const totalPreferential = qualifiedDividends + longTermCapGains;
    if (totalPreferential === 0 || taxableIncome <= 0) {
        // No preferential income - use regular tax brackets only
        return {
            regularTax: (0, regularTax_1.calculateRegularTax2025)(taxableIncome, input.filingStatus),
            preferentialTax: 0,
            totalIncomeTax: (0, regularTax_1.calculateRegularTax2025)(taxableIncome, input.filingStatus),
            capitalGainsDetails: null
        };
    }
    // Calculate tax using IRS worksheet method
    const ordinaryIncome = Math.max(0, taxableIncome - totalPreferential);
    const ordinaryTax = (0, regularTax_1.calculateRegularTax2025)(ordinaryIncome, input.filingStatus);
    const preferentialResult = (0, longTermCapitalGains_1.computePreferentialRatesTax2025)({
        filingStatus: input.filingStatus,
        taxableIncome,
        qualifiedDividendsAndLTCG: totalPreferential
    });
    return {
        regularTax: ordinaryTax,
        preferentialTax: preferentialResult.preferentialTax,
        totalIncomeTax: ordinaryTax + preferentialResult.preferentialTax,
        capitalGainsDetails: preferentialResult
    };
}
/**
 * Calculate additional taxes (NIIT, Additional Medicare, AMT)
 */
function calculateAdditionalTaxes(input, agi, seTaxResult) {
    // Net Investment Income Tax (3.8%)
    const niitThreshold = medicareSocialSecurity_1.NIIT_THRESHOLDS_2025[input.filingStatus];
    const investmentIncome = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.income?.interest), (0, money_1.safeCurrencyToCents)(input.income?.dividends?.ordinary), (0, money_1.safeCurrencyToCents)(input.income?.dividends?.qualified), Math.max(0, (0, money_1.safeCurrencyToCents)(input.income?.capGains) || 0) // Only positive gains
    );
    const niit = agi > niitThreshold
        ? (0, money_1.multiplyCents)(Math.min(investmentIncome, agi - niitThreshold), 0.038)
        : 0;
    // Additional Medicare Tax is already calculated in SE tax
    const medicareSurtax = seTaxResult.additionalMedicare || 0;
    // AMT (placeholder - would need full AMT calculation)
    const amt = 0;
    return {
        seTax: seTaxResult.totalSETax,
        niit,
        medicareSurtax,
        amt,
    };
}
/**
 * Calculate federal tax credits using both new and existing credit modules
 */
function calculateCredits(input, agi, taxBeforeCredits) {
    // Earned Income Tax Credit using new 2025 authoritative calculation
    const earnedIncome = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.income?.wages), (0, money_1.safeCurrencyToCents)(input.income?.scheduleCNet) // SE income
    );
    const investmentIncome = (0, money_1.addCents)((0, money_1.safeCurrencyToCents)(input.income?.interest), (0, money_1.safeCurrencyToCents)(input.income?.dividends?.ordinary), (0, money_1.safeCurrencyToCents)(input.income?.dividends?.qualified), Math.max(0, (0, money_1.safeCurrencyToCents)(input.income?.capGains) || 0));
    // Determine qualifying children count (convert from legacy dependents if needed)
    let qualifyingChildrenCount = 0;
    if (input.qualifyingChildren && input.qualifyingChildren.length > 0) {
        qualifyingChildrenCount = Math.min(3, input.qualifyingChildren.length);
    }
    else if (input.dependents) {
        qualifyingChildrenCount = Math.min(3, input.dependents);
    }
    const eitcResult = (0, eitc2025_1.computeEITC2025)({
        filingStatus: input.filingStatus,
        earnedIncome,
        agi,
        qualifyingChildren: qualifyingChildrenCount,
        investmentIncome
    });
    // Child Tax Credit using existing advanced logic
    const ctcResult = (0, advancedCredits_1.calculateAdvancedCTC)(input, agi, taxBeforeCredits);
    // Education credits using existing advanced logic
    const aotcResult = (0, advancedCredits_1.calculateAdvancedAOTC)(input, agi);
    const llcResult = (0, advancedCredits_1.calculateAdvancedLLC)(input, agi);
    // Prefer AOTC over LLC if both are available (mutual exclusion)
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
//# sourceMappingURL=computeFederal2025_v2.js.map