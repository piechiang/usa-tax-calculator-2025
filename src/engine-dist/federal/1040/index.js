"use strict";
/**
 * Federal 1040 Tax Engine - Main Export
 * Complete implementation of Federal Form 1040 for 2025 tax year
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertUIToFederal1040Input = exports.validateFederalInput = exports.addDependentToInput = exports.addSpouseToInput = exports.createBasicFederalInput = exports.calculateQBILossCarryforward = exports.estimateW2Wages = exports.calculatePTPQBIDeduction = exports.calculateREITQBIDeduction = exports.aggregateQBIItems = exports.calculateQualifiedBusinessIncome = exports.calculateNonRefundableCredits = exports.calculateRefundableCredits = exports.calculateOtherCredits = exports.calculatePremiumTaxCredit = exports.calculateChildAndDependentCareCredit = exports.calculateEducationCredits = exports.calculateEarnedIncomeCredit = exports.calculateOtherDependentCredit = exports.calculateChildTaxCredit = exports.calculateRetirementSavingsCredit = exports.calculateForeignTaxCredit = exports.calculatePremiumTaxCreditReconciliation = exports.calculateHealthCoverageTaxCredit = exports.calculateExcessSocialSecurityCredit = exports.calculateAlternativeMinimumTax = exports.calculateNetInvestmentIncomeTax = exports.calculateAdditionalMedicareTax = exports.calculateSEDeduction = exports.calculateSelfEmploymentTax = exports.validateConstants = exports.NIIT_2025 = exports.MEDICARE_2025 = exports.SOCIAL_SECURITY_2025 = exports.CTC_CONSTANTS_2025 = exports.EITC_CONSTANTS_2025 = exports.AMT_CONSTANTS_2025 = exports.CAPITAL_GAINS_THRESHOLDS_2025 = exports.TAX_BRACKETS_2025 = exports.STANDARD_DEDUCTIONS_2025 = exports.CALCULATION_CONSTANTS = exports.IRS_CONSTANTS_2025 = exports.computeFederal1040 = void 0;
// Main calculator function
var calculator_1 = require("./calculator");
Object.defineProperty(exports, "computeFederal1040", { enumerable: true, get: function () { return calculator_1.computeFederal1040; } });
// Constants
var constants2025_1 = require("./constants2025");
Object.defineProperty(exports, "IRS_CONSTANTS_2025", { enumerable: true, get: function () { return constants2025_1.IRS_CONSTANTS_2025; } });
Object.defineProperty(exports, "CALCULATION_CONSTANTS", { enumerable: true, get: function () { return constants2025_1.CALCULATION_CONSTANTS; } });
Object.defineProperty(exports, "STANDARD_DEDUCTIONS_2025", { enumerable: true, get: function () { return constants2025_1.STANDARD_DEDUCTIONS_2025; } });
Object.defineProperty(exports, "TAX_BRACKETS_2025", { enumerable: true, get: function () { return constants2025_1.TAX_BRACKETS_2025; } });
Object.defineProperty(exports, "CAPITAL_GAINS_THRESHOLDS_2025", { enumerable: true, get: function () { return constants2025_1.CAPITAL_GAINS_THRESHOLDS_2025; } });
Object.defineProperty(exports, "AMT_CONSTANTS_2025", { enumerable: true, get: function () { return constants2025_1.AMT_CONSTANTS_2025; } });
Object.defineProperty(exports, "EITC_CONSTANTS_2025", { enumerable: true, get: function () { return constants2025_1.EITC_CONSTANTS_2025; } });
Object.defineProperty(exports, "CTC_CONSTANTS_2025", { enumerable: true, get: function () { return constants2025_1.CTC_CONSTANTS_2025; } });
Object.defineProperty(exports, "SOCIAL_SECURITY_2025", { enumerable: true, get: function () { return constants2025_1.SOCIAL_SECURITY_2025; } });
Object.defineProperty(exports, "MEDICARE_2025", { enumerable: true, get: function () { return constants2025_1.MEDICARE_2025; } });
Object.defineProperty(exports, "NIIT_2025", { enumerable: true, get: function () { return constants2025_1.NIIT_2025; } });
Object.defineProperty(exports, "validateConstants", { enumerable: true, get: function () { return constants2025_1.validateConstants; } });
// Specialized calculators
var specialTaxes_1 = require("./specialTaxes");
Object.defineProperty(exports, "calculateSelfEmploymentTax", { enumerable: true, get: function () { return specialTaxes_1.calculateSelfEmploymentTax; } });
Object.defineProperty(exports, "calculateSEDeduction", { enumerable: true, get: function () { return specialTaxes_1.calculateSEDeduction; } });
Object.defineProperty(exports, "calculateAdditionalMedicareTax", { enumerable: true, get: function () { return specialTaxes_1.calculateAdditionalMedicareTax; } });
Object.defineProperty(exports, "calculateNetInvestmentIncomeTax", { enumerable: true, get: function () { return specialTaxes_1.calculateNetInvestmentIncomeTax; } });
Object.defineProperty(exports, "calculateAlternativeMinimumTax", { enumerable: true, get: function () { return specialTaxes_1.calculateAlternativeMinimumTax; } });
Object.defineProperty(exports, "calculateExcessSocialSecurityCredit", { enumerable: true, get: function () { return specialTaxes_1.calculateExcessSocialSecurityCredit; } });
Object.defineProperty(exports, "calculateHealthCoverageTaxCredit", { enumerable: true, get: function () { return specialTaxes_1.calculateHealthCoverageTaxCredit; } });
Object.defineProperty(exports, "calculatePremiumTaxCreditReconciliation", { enumerable: true, get: function () { return specialTaxes_1.calculatePremiumTaxCreditReconciliation; } });
Object.defineProperty(exports, "calculateForeignTaxCredit", { enumerable: true, get: function () { return specialTaxes_1.calculateForeignTaxCredit; } });
Object.defineProperty(exports, "calculateRetirementSavingsCredit", { enumerable: true, get: function () { return specialTaxes_1.calculateRetirementSavingsCredit; } });
var credits_1 = require("./credits");
Object.defineProperty(exports, "calculateChildTaxCredit", { enumerable: true, get: function () { return credits_1.calculateChildTaxCredit; } });
Object.defineProperty(exports, "calculateOtherDependentCredit", { enumerable: true, get: function () { return credits_1.calculateOtherDependentCredit; } });
Object.defineProperty(exports, "calculateEarnedIncomeCredit", { enumerable: true, get: function () { return credits_1.calculateEarnedIncomeCredit; } });
Object.defineProperty(exports, "calculateEducationCredits", { enumerable: true, get: function () { return credits_1.calculateEducationCredits; } });
Object.defineProperty(exports, "calculateChildAndDependentCareCredit", { enumerable: true, get: function () { return credits_1.calculateChildAndDependentCareCredit; } });
Object.defineProperty(exports, "calculatePremiumTaxCredit", { enumerable: true, get: function () { return credits_1.calculatePremiumTaxCredit; } });
Object.defineProperty(exports, "calculateOtherCredits", { enumerable: true, get: function () { return credits_1.calculateOtherCredits; } });
Object.defineProperty(exports, "calculateRefundableCredits", { enumerable: true, get: function () { return credits_1.calculateRefundableCredits; } });
Object.defineProperty(exports, "calculateNonRefundableCredits", { enumerable: true, get: function () { return credits_1.calculateNonRefundableCredits; } });
var qbiDeduction_1 = require("./qbiDeduction");
Object.defineProperty(exports, "calculateQualifiedBusinessIncome", { enumerable: true, get: function () { return qbiDeduction_1.calculateQualifiedBusinessIncome; } });
Object.defineProperty(exports, "aggregateQBIItems", { enumerable: true, get: function () { return qbiDeduction_1.aggregateQBIItems; } });
Object.defineProperty(exports, "calculateREITQBIDeduction", { enumerable: true, get: function () { return qbiDeduction_1.calculateREITQBIDeduction; } });
Object.defineProperty(exports, "calculatePTPQBIDeduction", { enumerable: true, get: function () { return qbiDeduction_1.calculatePTPQBIDeduction; } });
Object.defineProperty(exports, "estimateW2Wages", { enumerable: true, get: function () { return qbiDeduction_1.estimateW2Wages; } });
Object.defineProperty(exports, "calculateQBILossCarryforward", { enumerable: true, get: function () { return qbiDeduction_1.calculateQBILossCarryforward; } });
// Helper functions
function createBasicFederalInput(filingStatus, wagesAmount = 0, federalWithholding = 0) {
    return {
        filingStatus,
        taxpayer: { age: 30, blind: false },
        dependents: [],
        income: {
            wages: wagesAmount > 0 ? [{
                    wages: wagesAmount,
                    fedWithholding: federalWithholding,
                    socialSecurityWages: Math.min(wagesAmount, IRS_CONSTANTS_2025.socialSecurity.wageBase),
                    socialSecurityWithheld: Math.min(wagesAmount, IRS_CONSTANTS_2025.socialSecurity.wageBase) * IRS_CONSTANTS_2025.socialSecurity.employeeRate,
                    medicareWages: wagesAmount,
                    medicareWithheld: wagesAmount * IRS_CONSTANTS_2025.medicare.employeeRate,
                }] : [],
            interest: { taxable: 0, taxExempt: 0 },
            dividends: { ordinary: 0, qualified: 0 },
            capitalGains: { shortTerm: 0, longTerm: 0 },
            scheduleC: [],
            retirementDistributions: { total: 0, taxable: 0 },
            socialSecurityBenefits: { total: 0 },
            scheduleE: {
                rentalRealEstate: 0,
                royalties: 0,
                k1PassiveIncome: 0,
                k1NonPassiveIncome: 0,
                k1PortfolioIncome: 0,
            },
            unemployment: 0,
            otherIncome: 0,
        },
        adjustments: {
            educatorExpenses: 0,
            businessExpenses: 0,
            hsaDeduction: 0,
            movingExpenses: 0,
            selfEmploymentTaxDeduction: 0,
            selfEmployedRetirement: 0,
            selfEmployedHealthInsurance: 0,
            earlyWithdrawalPenalty: 0,
            alimonyPaid: 0,
            iraDeduction: 0,
            studentLoanInterest: 0,
            otherAdjustments: 0,
        },
        payments: {
            federalWithholding: 0,
            estimatedTaxPayments: 0,
            eicAdvancePayments: 0,
            extensionPayment: 0,
            otherPayments: 0,
        },
    };
}
exports.createBasicFederalInput = createBasicFederalInput;
function addSpouseToInput(input, spouseAge = 30, spouseBlind = false) {
    return {
        ...input,
        filingStatus: input.filingStatus === 'single' ? 'mfj' : input.filingStatus,
        spouse: {
            age: spouseAge,
            blind: spouseBlind,
        },
    };
}
exports.addSpouseToInput = addSpouseToInput;
function addDependentToInput(input, age, relationship = 'son', hasSSN = true) {
    const dependent = {
        age,
        hasSSN,
        relationship,
        isQualifyingChild: age < 17,
        isQualifyingRelative: age >= 17,
        ctcEligible: age < 17 && hasSSN,
        eitcEligible: age < 19 || (age >= 19 && age < 24), // Simplified - would need student status
    };
    return {
        ...input,
        dependents: [...input.dependents, dependent],
    };
}
exports.addDependentToInput = addDependentToInput;
/**
 * Validate Federal Input for completeness and accuracy
 */
function validateFederalInput(input) {
    const errors = [];
    const warnings = [];
    // Required fields validation
    if (!input.filingStatus) {
        errors.push('Filing status is required');
    }
    if (!input.taxpayer || input.taxpayer.age < 0) {
        errors.push('Valid taxpayer information is required');
    }
    if (input.filingStatus === 'mfj' && !input.spouse) {
        errors.push('Spouse information is required for married filing jointly');
    }
    // Income validation
    if (!input.income) {
        errors.push('Income information is required');
    }
    else {
        // Check for reasonable W-2 values
        input.income.wages.forEach((w2, index) => {
            if (w2.wages < 0) {
                errors.push(`W-2 #${index + 1}: Wages cannot be negative`);
            }
            if (w2.fedWithholding < 0) {
                errors.push(`W-2 #${index + 1}: Federal withholding cannot be negative`);
            }
            if (w2.fedWithholding > w2.wages * 0.5) {
                warnings.push(`W-2 #${index + 1}: Federal withholding seems high (>50% of wages)`);
            }
        });
        // Check for investment income limits for EITC
        const investmentIncome = input.income.interest.taxable +
            input.income.dividends.ordinary +
            input.income.dividends.qualified +
            Math.max(0, input.income.capitalGains.shortTerm + input.income.capitalGains.longTerm);
        if (investmentIncome > IRS_CONSTANTS_2025.eitc.investmentIncomeLimit) {
            warnings.push(`Investment income (${investmentIncome}) exceeds EITC limit - may not qualify for EITC`);
        }
    }
    // Dependent validation
    input.dependents.forEach((dep, index) => {
        if (!dep.hasSSN && dep.ctcEligible) {
            warnings.push(`Dependent #${index + 1}: No SSN but marked CTC eligible - may not qualify for CTC`);
        }
        if (dep.age < 0 || dep.age > 120) {
            errors.push(`Dependent #${index + 1}: Invalid age (${dep.age})`);
        }
    });
    // Itemized deduction validation
    if (input.itemizedDeductions) {
        const saltTotal = input.itemizedDeductions.stateLocalIncomeTaxes +
            input.itemizedDeductions.stateLocalSalesTaxes +
            input.itemizedDeductions.realEstateTaxes +
            input.itemizedDeductions.personalPropertyTaxes;
        if (saltTotal > CALCULATION_CONSTANTS.SALT_CAP) {
            warnings.push(`SALT deduction (${saltTotal}) will be limited to $${CALCULATION_CONSTANTS.SALT_CAP}`);
        }
        if (input.itemizedDeductions.charitableCash < 0 || input.itemizedDeductions.charitableNonCash < 0) {
            errors.push('Charitable contributions cannot be negative');
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}
exports.validateFederalInput = validateFederalInput;
/**
 * Convert existing UI input format to new Federal 1040 format
 */
function convertUIToFederal1040Input(uiInput) {
    // This would convert from the existing tax calculator format
    // to the new standardized Federal 1040 format
    const federalInput = {
        filingStatus: mapFilingStatus(uiInput.filingStatus),
        taxpayer: {
            age: calculateAge(uiInput.birthDate) || 30,
            blind: uiInput.isBlind || false,
        },
        dependents: (uiInput.dependents || []).map((dep) => ({
            age: dep.age || 0,
            hasSSN: dep.hasSSN !== false,
            relationship: dep.relationship || 'other',
            isQualifyingChild: dep.age < 17,
            isQualifyingRelative: dep.age >= 17,
            ctcEligible: dep.age < 17 && dep.hasSSN !== false,
        })),
        income: {
            wages: uiInput.wages ? [{
                    wages: uiInput.wages,
                    fedWithholding: uiInput.federalWithholding || 0,
                    socialSecurityWages: Math.min(uiInput.wages, IRS_CONSTANTS_2025.socialSecurity.wageBase),
                    socialSecurityWithheld: 0,
                    medicareWages: uiInput.wages,
                    medicareWithheld: 0, // Would need from input
                }] : [],
            interest: {
                taxable: uiInput.interestIncome || 0,
                taxExempt: uiInput.taxExemptInterest || 0,
            },
            dividends: {
                ordinary: uiInput.dividends || 0,
                qualified: uiInput.qualifiedDividends || 0,
            },
            capitalGains: {
                shortTerm: uiInput.shortTermCapitalGains || 0,
                longTerm: uiInput.longTermCapitalGains || 0,
            },
            scheduleC: uiInput.businessIncome ? [{
                    netProfit: uiInput.businessIncome,
                    businessExpenses: uiInput.businessExpenses || 0,
                }] : [],
            retirementDistributions: {
                total: uiInput.retirementIncome || 0,
                taxable: uiInput.taxableRetirementIncome || uiInput.retirementIncome || 0,
            },
            socialSecurityBenefits: {
                total: uiInput.socialSecurityBenefits || 0,
            },
            scheduleE: {
                rentalRealEstate: uiInput.rentalIncome || 0,
                royalties: uiInput.royalties || 0,
                k1PassiveIncome: uiInput.k1PassiveIncome || 0,
                k1NonPassiveIncome: uiInput.k1NonPassiveIncome || 0,
                k1PortfolioIncome: uiInput.k1PortfolioIncome || 0,
            },
            unemployment: uiInput.unemployment || 0,
            otherIncome: uiInput.otherIncome || 0,
        },
        adjustments: {
            educatorExpenses: 0,
            businessExpenses: 0,
            hsaDeduction: uiInput.hsaContribution || 0,
            movingExpenses: 0,
            selfEmploymentTaxDeduction: 0,
            selfEmployedRetirement: uiInput.sepIraContribution || 0,
            selfEmployedHealthInsurance: 0,
            earlyWithdrawalPenalty: 0,
            alimonyPaid: 0,
            iraDeduction: uiInput.iraContribution || 0,
            studentLoanInterest: uiInput.studentLoanInterest || 0,
            otherAdjustments: 0,
        },
        itemizedDeductions: uiInput.itemizeDeductions ? {
            stateLocalIncomeTaxes: uiInput.stateLocalTaxes || 0,
            stateLocalSalesTaxes: 0,
            realEstateTaxes: 0,
            personalPropertyTaxes: 0,
            mortgageInterest: uiInput.mortgageInterest || 0,
            mortgagePoints: 0,
            mortgageInsurance: 0,
            investmentInterest: 0,
            charitableCash: uiInput.charitableContributions || 0,
            charitableNonCash: 0,
            charitableCarryover: 0,
            medicalExpenses: uiInput.medicalExpenses || 0,
            stateRefundTaxable: 0,
            otherItemized: uiInput.otherDeductions || 0,
        } : undefined,
        payments: {
            federalWithholding: uiInput.federalWithholding || 0,
            estimatedTaxPayments: uiInput.estimatedPayments || 0,
            eicAdvancePayments: 0,
            extensionPayment: 0,
            otherPayments: 0,
        },
    };
    return federalInput;
}
exports.convertUIToFederal1040Input = convertUIToFederal1040Input;
// Helper functions for conversion
function mapFilingStatus(status) {
    const mapping = {
        'single': 'single',
        'marriedJointly': 'mfj',
        'marriedSeparately': 'mfs',
        'headOfHousehold': 'hoh',
        'qualifyingSurvivingSpouse': 'qss',
    };
    return mapping[status] || 'single';
}
function calculateAge(birthDate) {
    if (!birthDate)
        return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
//# sourceMappingURL=index.js.map