"use strict";
/**
 * Federal 1040 Tax Calculator (2025)
 * Implements the complete tax calculation pipeline following IRS Form 1040
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeFederal1040 = void 0;
const constants2025_1 = require("./constants2025");
const specialTaxes_1 = require("./specialTaxes");
const credits_1 = require("./credits");
const qbiDeduction_1 = require("./qbiDeduction");
function computeFederal1040(input) {
    const steps = [];
    const errors = [];
    const warnings = [];
    try {
        // Step 1: Calculate Total Income (Lines 1-8z)
        const totalIncome = calculateTotalIncome(input, steps);
        // Step 2: Calculate Above-the-Line Deductions (Lines 11-26)
        const totalAdjustments = calculateAboveLineDeductions(input, steps);
        // Step 3: Calculate Adjusted Gross Income (Line 11)
        const adjustedGrossIncome = Math.max(0, totalIncome - totalAdjustments);
        steps.push({
            description: 'Adjusted Gross Income',
            amount: adjustedGrossIncome,
            source: 'Form 1040, Line 11',
            formula: `Total Income (${totalIncome}) - Adjustments (${totalAdjustments})`,
        });
        // Step 4: Calculate Deductions (Standard vs Itemized)
        const deductionResult = calculateDeductions(input, adjustedGrossIncome, steps);
        // Step 5: Calculate QBI Deduction (if applicable)
        const qbiDeduction = input.options?.qbiDeduction
            ? (0, qbiDeduction_1.calculateQualifiedBusinessIncome)(input, adjustedGrossIncome, deductionResult.deductionUsed)
            : 0;
        if (qbiDeduction > 0) {
            steps.push({
                description: 'Qualified Business Income Deduction',
                amount: qbiDeduction,
                source: 'Form 8995/8995-A',
                formula: 'Lesser of 20% of QBI or taxable income limitation',
            });
        }
        // Step 6: Calculate Taxable Income (Line 15)
        const taxableIncome = Math.max(0, adjustedGrossIncome - deductionResult.deductionUsed - qbiDeduction);
        steps.push({
            description: 'Taxable Income',
            amount: taxableIncome,
            source: 'Form 1040, Line 15',
            formula: `AGI (${adjustedGrossIncome}) - Deductions (${deductionResult.deductionUsed}) - QBI (${qbiDeduction})`,
        });
        // Step 7: Calculate Regular Tax (Including Capital Gains)
        const taxCalculation = calculateRegularTax(input, taxableIncome, steps);
        // Step 8: Calculate Alternative Minimum Tax (if enabled)
        const amt = input.options?.amtCalculation
            ? (0, specialTaxes_1.calculateAlternativeMinimumTax)(input, adjustedGrossIncome, deductionResult.itemizedDeduction)
            : 0;
        // Step 9: Calculate Additional Taxes
        const additionalTaxes = calculateAdditionalTaxes(input, adjustedGrossIncome, steps);
        // Step 10: Total Tax Before Credits
        const taxBeforeCredits = Math.max(taxCalculation.totalTax, amt) + additionalTaxes.totalAdditionalTax;
        steps.push({
            description: 'Tax Before Credits',
            amount: taxBeforeCredits,
            source: 'Form 1040, Line 16',
            formula: `Max(Regular Tax (${taxCalculation.totalTax}), AMT (${amt})) + Additional Taxes (${additionalTaxes.totalAdditionalTax})`,
        });
        // Step 11: Calculate Tax Credits
        const creditResults = calculateTaxCredits(input, taxBeforeCredits, steps);
        // Step 12: Calculate Total Tax After Credits
        const totalTax = Math.max(0, taxBeforeCredits - creditResults.nonRefundableCredits);
        steps.push({
            description: 'Total Tax After Non-Refundable Credits',
            amount: totalTax,
            source: 'Form 1040, Line 24',
            formula: `Tax Before Credits (${taxBeforeCredits}) - Non-Refundable Credits (${creditResults.nonRefundableCredits})`,
        });
        // Step 13: Calculate Total Payments
        const totalPayments = calculateTotalPayments(input, steps);
        // Step 14: Add Refundable Credits to Payments
        const totalPaymentsWithCredits = totalPayments + creditResults.refundableCredits;
        steps.push({
            description: 'Total Payments and Credits',
            amount: totalPaymentsWithCredits,
            source: 'Form 1040, Line 33',
            formula: `Payments (${totalPayments}) + Refundable Credits (${creditResults.refundableCredits})`,
        });
        // Step 15: Calculate Refund or Amount Owed
        const refundOwed = totalPaymentsWithCredits - totalTax;
        steps.push({
            description: refundOwed >= 0 ? 'Refund' : 'Amount Owed',
            amount: Math.abs(refundOwed),
            source: refundOwed >= 0 ? 'Form 1040, Line 34' : 'Form 1040, Line 37',
            formula: `Total Payments and Credits (${totalPaymentsWithCredits}) - Total Tax (${totalTax})`,
        });
        // Calculate tax rates
        const effectiveTaxRate = adjustedGrossIncome > 0 ? totalTax / adjustedGrossIncome : 0;
        const marginalTaxRate = calculateMarginalTaxRate(input.filingStatus, taxableIncome);
        return {
            totalIncome,
            adjustedGrossIncome,
            taxableIncome,
            standardDeduction: deductionResult.standardDeduction,
            itemizedDeduction: deductionResult.itemizedDeduction,
            deductionUsed: deductionResult.deductionUsed,
            qbiDeduction,
            regularTax: taxCalculation.regularTax,
            capitalGainsTax: taxCalculation.capitalGainsTax,
            alternativeMinimumTax: amt,
            selfEmploymentTax: additionalTaxes.selfEmploymentTax,
            additionalMedicareTax: additionalTaxes.additionalMedicareTax,
            netInvestmentIncomeTax: additionalTaxes.netInvestmentIncomeTax,
            taxBeforeCredits,
            nonRefundableCredits: creditResults.nonRefundableCredits,
            refundableCredits: creditResults.refundableCredits,
            totalTax,
            totalPayments: totalPaymentsWithCredits,
            refundOwed,
            calculationSteps: steps,
            effectiveTaxRate,
            marginalTaxRate,
            errors,
            warnings,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Calculation error: ${errorMessage}`);
        return createErrorResult(errors);
    }
}
exports.computeFederal1040 = computeFederal1040;
function calculateTotalIncome(input, steps) {
    let totalIncome = 0;
    // Line 1 - Wages, salaries, tips
    const totalWages = input.income.wages.reduce((sum, w2) => sum + w2.wages, 0);
    if (totalWages > 0) {
        totalIncome += totalWages;
        steps.push({
            description: 'Wages, Salaries, Tips',
            amount: totalWages,
            source: 'Form 1040, Line 1a',
            formula: 'Sum of all W-2 wages',
        });
    }
    // Line 2a/2b - Interest
    const totalInterest = input.income.interest.taxable;
    if (totalInterest > 0) {
        totalIncome += totalInterest;
        steps.push({
            description: 'Taxable Interest',
            amount: totalInterest,
            source: 'Form 1040, Line 2b',
        });
    }
    // Line 3a/3b - Dividends
    const totalDividends = input.income.dividends.ordinary;
    if (totalDividends > 0) {
        totalIncome += totalDividends;
        steps.push({
            description: 'Dividends',
            amount: totalDividends,
            source: 'Form 1040, Line 3b',
        });
    }
    // Line 7 - Capital gains
    const totalCapitalGains = input.income.capitalGains.shortTerm + input.income.capitalGains.longTerm;
    if (totalCapitalGains !== 0) {
        totalIncome += totalCapitalGains;
        steps.push({
            description: 'Capital Gains/Losses',
            amount: totalCapitalGains,
            source: 'Form 1040, Line 7',
        });
    }
    // Schedule C - Business income (can be negative)
    const scheduleC = input.income.scheduleC.reduce((sum, biz) => sum + biz.netProfit, 0);
    if (scheduleC !== 0) {
        totalIncome += scheduleC;
        steps.push({
            description: scheduleC >= 0 ? 'Business Income (Schedule C)' : 'Business Loss (Schedule C)',
            amount: scheduleC,
            source: 'Form 1040, Line 8a (Schedule C)',
        });
    }
    // Schedule E - Rental and other income
    const scheduleE = input.income.scheduleE.rentalRealEstate +
        input.income.scheduleE.royalties +
        input.income.scheduleE.k1PassiveIncome +
        input.income.scheduleE.k1NonPassiveIncome +
        input.income.scheduleE.k1PortfolioIncome;
    if (scheduleE !== 0) {
        totalIncome += scheduleE;
        steps.push({
            description: 'Rental, Royalties, Partnerships (Schedule E)',
            amount: scheduleE,
            source: 'Form 1040, Line 8b (Schedule E)',
        });
    }
    // Line 5 - IRA/pension distributions
    if (input.income.retirementDistributions.taxable > 0) {
        totalIncome += input.income.retirementDistributions.taxable;
        steps.push({
            description: 'Taxable IRA/Pension Distributions',
            amount: input.income.retirementDistributions.taxable,
            source: 'Form 1040, Line 5b',
        });
    }
    // Line 6 - Social Security benefits (taxable portion)
    const taxableSS = calculateTaxableSocialSecurity(input);
    if (taxableSS > 0) {
        totalIncome += taxableSS;
        steps.push({
            description: 'Taxable Social Security Benefits',
            amount: taxableSS,
            source: 'Form 1040, Line 6b',
        });
    }
    // Line 8i - Unemployment
    if (input.income.unemployment > 0) {
        totalIncome += input.income.unemployment;
        steps.push({
            description: 'Unemployment Compensation',
            amount: input.income.unemployment,
            source: 'Form 1040, Line 8i',
        });
    }
    // Line 8z - Other income
    if (input.income.otherIncome > 0) {
        totalIncome += input.income.otherIncome;
        steps.push({
            description: 'Other Income',
            amount: input.income.otherIncome,
            source: 'Form 1040, Line 8z',
        });
    }
    steps.push({
        description: 'Total Income',
        amount: totalIncome,
        source: 'Form 1040, Line 9',
        formula: 'Sum of all income sources',
    });
    return Math.round(totalIncome);
}
function calculateAboveLineDeductions(input, steps) {
    let totalAdjustments = 0;
    // Add each adjustment with documentation
    const adjustmentItems = [
        { key: 'educatorExpenses', line: '11', desc: 'Educator Expenses' },
        { key: 'businessExpenses', line: '12', desc: 'Business Expenses' },
        { key: 'hsaDeduction', line: '13', desc: 'HSA Deduction' },
        { key: 'movingExpenses', line: '14', desc: 'Moving Expenses' },
        { key: 'selfEmploymentTaxDeduction', line: '15', desc: 'Self-Employment Tax Deduction' },
        { key: 'selfEmployedRetirement', line: '16', desc: 'Self-Employed Retirement' },
        { key: 'selfEmployedHealthInsurance', line: '17', desc: 'Self-Employed Health Insurance' },
        { key: 'earlyWithdrawalPenalty', line: '18', desc: 'Early Withdrawal Penalty' },
        { key: 'alimonyPaid', line: '19', desc: 'Alimony Paid' },
        { key: 'iraDeduction', line: '20', desc: 'IRA Deduction' },
        { key: 'studentLoanInterest', line: '21', desc: 'Student Loan Interest' },
        { key: 'otherAdjustments', line: '26', desc: 'Other Adjustments' },
    ];
    adjustmentItems.forEach(item => {
        const amount = input.adjustments[item.key] || 0;
        if (amount > 0) {
            totalAdjustments += amount;
            steps.push({
                description: item.desc,
                amount,
                source: `Form 1040, Line ${item.line}`,
            });
        }
    });
    if (totalAdjustments > 0) {
        steps.push({
            description: 'Total Adjustments',
            amount: totalAdjustments,
            source: 'Form 1040, Line 10c',
            formula: 'Sum of all above-the-line deductions',
        });
    }
    return Math.round(totalAdjustments);
}
function calculateDeductions(input, agi, steps) {
    // Calculate standard deduction
    const baseStandardDeduction = constants2025_1.IRS_CONSTANTS_2025.standardDeductions[input.filingStatus];
    let additionalStandardDeduction = 0;
    // Additional standard deduction for age 65+ or blind
    const isMarried = input.filingStatus === 'mfj' || input.filingStatus === 'mfs' || input.filingStatus === 'qss';
    // Taxpayer
    if (input.taxpayer.age >= 65 || input.taxpayer.blind) {
        const amount = isMarried
            ? constants2025_1.IRS_CONSTANTS_2025.additionalStandardDeductions.marriedAge65OrBlind
            : constants2025_1.IRS_CONSTANTS_2025.additionalStandardDeductions.age65OrBlind;
        additionalStandardDeduction += amount;
    }
    // Spouse (if applicable)
    if (input.spouse && (input.spouse.age >= 65 || input.spouse.blind)) {
        const amount = isMarried
            ? constants2025_1.IRS_CONSTANTS_2025.additionalStandardDeductions.marriedAge65OrBlind
            : constants2025_1.IRS_CONSTANTS_2025.additionalStandardDeductions.age65OrBlind;
        additionalStandardDeduction += amount;
    }
    const standardDeduction = baseStandardDeduction + additionalStandardDeduction;
    // Calculate itemized deduction if provided
    let itemizedDeduction = 0;
    if (input.itemizedDeductions) {
        const itemized = input.itemizedDeductions;
        // SALT deduction (capped at $10,000 for most filers, $5,000 for MFS)
        const saltCap = input.filingStatus === 'mfs' ? 5000 : constants2025_1.CALCULATION_CONSTANTS.SALT_CAP;
        const saltDeduction = Math.min(itemized.stateLocalIncomeTaxes +
            itemized.stateLocalSalesTaxes +
            itemized.realEstateTaxes +
            itemized.personalPropertyTaxes, saltCap);
        // Mortgage interest
        const mortgageInterest = itemized.mortgageInterest + itemized.mortgagePoints +
            itemized.mortgageInsurance + itemized.investmentInterest;
        // Charitable contributions
        const charitable = itemized.charitableCash + itemized.charitableNonCash + itemized.charitableCarryover;
        // Medical expenses (excess over 7.5% of AGI)
        const medicalThreshold = agi * constants2025_1.CALCULATION_CONSTANTS.MEDICAL_EXPENSE_AGI_THRESHOLD;
        const medicalDeduction = Math.max(0, itemized.medicalExpenses - medicalThreshold);
        itemizedDeduction = saltDeduction + mortgageInterest + charitable + medicalDeduction + itemized.otherItemized;
    }
    // Use the higher of standard or itemized
    const deductionUsed = Math.max(standardDeduction, itemizedDeduction);
    steps.push({
        description: 'Standard Deduction',
        amount: standardDeduction,
        source: 'Form 1040, Line 12a',
        formula: `Base (${baseStandardDeduction}) + Additional (${additionalStandardDeduction})`,
    });
    if (itemizedDeduction > 0) {
        steps.push({
            description: 'Itemized Deduction',
            amount: itemizedDeduction,
            source: 'Schedule A',
        });
    }
    steps.push({
        description: 'Deduction Used',
        amount: deductionUsed,
        source: 'Form 1040, Line 12',
        formula: `Max(Standard (${standardDeduction}), Itemized (${itemizedDeduction}))`,
    });
    return {
        standardDeduction: Math.round(standardDeduction),
        itemizedDeduction: Math.round(itemizedDeduction),
        deductionUsed: Math.round(deductionUsed),
    };
}
function calculateRegularTax(input, taxableIncome, steps) {
    const brackets = constants2025_1.IRS_CONSTANTS_2025.taxBrackets[input.filingStatus];
    // Separate ordinary income from qualified dividends and long-term capital gains
    const qualifiedDividends = input.income.dividends.qualified;
    const longTermCapitalGains = Math.max(0, input.income.capitalGains.longTerm);
    const preferentialIncome = qualifiedDividends + longTermCapitalGains;
    let regularTax = 0;
    let capitalGainsTax = 0;
    if (preferentialIncome > 0 && taxableIncome > 0) {
        // Use qualified dividends and capital gains worksheet approach
        const ordinaryIncome = Math.max(0, taxableIncome - preferentialIncome);
        // Calculate tax on ordinary income
        regularTax = calculateTaxFromBrackets(ordinaryIncome, brackets);
        // Calculate tax on preferential income using special rates
        const capGainsThresholds = constants2025_1.IRS_CONSTANTS_2025.capitalGainsThresholds[input.filingStatus];
        capitalGainsTax = calculateCapitalGainsTax(preferentialIncome, taxableIncome, ordinaryIncome, capGainsThresholds);
        steps.push({
            description: 'Tax on Ordinary Income',
            amount: regularTax,
            source: 'Tax Table/Schedule',
            formula: `Applied to ordinary income of $${ordinaryIncome}`,
        });
        steps.push({
            description: 'Tax on Qualified Dividends and Long-Term Capital Gains',
            amount: capitalGainsTax,
            source: 'Qualified Dividends and Capital Gain Tax Worksheet',
            formula: `Applied to preferential income of $${preferentialIncome}`,
        });
    }
    else {
        // Standard tax calculation on all taxable income
        regularTax = calculateTaxFromBrackets(taxableIncome, brackets);
        steps.push({
            description: 'Regular Income Tax',
            amount: regularTax,
            source: 'Tax Table/Schedule',
        });
    }
    const totalTax = regularTax + capitalGainsTax;
    return {
        regularTax: Math.round(regularTax),
        capitalGainsTax: Math.round(capitalGainsTax),
        totalTax: Math.round(totalTax),
    };
}
function calculateTaxFromBrackets(income, brackets) {
    if (income <= 0)
        return 0;
    let tax = 0;
    for (const bracket of brackets) {
        if (income <= bracket.min)
            break;
        const taxableInBracket = bracket.max
            ? Math.min(income, bracket.max) - bracket.min
            : income - bracket.min;
        tax += taxableInBracket * bracket.rate;
        if (!bracket.max || income <= bracket.max)
            break;
    }
    return tax;
}
function calculateCapitalGainsTax(preferentialIncome, taxableIncome, ordinaryIncome, thresholds) {
    let tax = 0;
    let remainingIncome = preferentialIncome;
    let currentTaxableIncome = ordinaryIncome;
    for (const threshold of thresholds) {
        if (remainingIncome <= 0)
            break;
        const thresholdStart = Math.max(threshold.min, currentTaxableIncome);
        const thresholdEnd = threshold.max || Infinity;
        const availableInThreshold = Math.max(0, thresholdEnd - thresholdStart);
        if (availableInThreshold > 0) {
            const taxableInThreshold = Math.min(remainingIncome, availableInThreshold);
            tax += taxableInThreshold * threshold.rate;
            remainingIncome -= taxableInThreshold;
            currentTaxableIncome += taxableInThreshold;
        }
    }
    return tax;
}
function calculateAdditionalTaxes(input, agi, steps) {
    let selfEmploymentTax = 0;
    let additionalMedicareTax = 0;
    let netInvestmentIncomeTax = 0;
    // Self-employment tax
    const seIncome = input.income.scheduleC.reduce((sum, biz) => sum + Math.max(0, biz.netProfit), 0);
    if (seIncome > 0) {
        selfEmploymentTax = (0, specialTaxes_1.calculateSelfEmploymentTax)(seIncome, input.income.wages);
        steps.push({
            description: 'Self-Employment Tax',
            amount: selfEmploymentTax,
            source: 'Schedule SE',
        });
    }
    // Additional Medicare Tax (if enabled)
    if (input.options?.additionalMedicareTax) {
        const medicareWages = input.income.wages.reduce((sum, w2) => sum + w2.medicareWages, 0);
        additionalMedicareTax = (0, specialTaxes_1.calculateAdditionalMedicareTax)(input.filingStatus, medicareWages, seIncome);
        if (additionalMedicareTax > 0) {
            steps.push({
                description: 'Additional Medicare Tax',
                amount: additionalMedicareTax,
                source: 'Form 8959',
            });
        }
    }
    // Net Investment Income Tax (if enabled)
    if (input.options?.niitCalculation) {
        const netInvestmentIncome = input.income.interest.taxable +
            input.income.dividends.ordinary +
            Math.max(0, input.income.capitalGains.longTerm + input.income.capitalGains.shortTerm) +
            input.income.scheduleE.k1PassiveIncome +
            Math.max(0, input.income.scheduleE.rentalRealEstate) +
            Math.max(0, input.income.scheduleE.royalties);
        netInvestmentIncomeTax = (0, specialTaxes_1.calculateNetInvestmentIncomeTax)(input.filingStatus, agi, netInvestmentIncome);
        if (netInvestmentIncomeTax > 0) {
            steps.push({
                description: 'Net Investment Income Tax',
                amount: netInvestmentIncomeTax,
                source: 'Form 8960',
            });
        }
    }
    const totalAdditionalTax = selfEmploymentTax + additionalMedicareTax + netInvestmentIncomeTax;
    return {
        selfEmploymentTax: Math.round(selfEmploymentTax),
        additionalMedicareTax: Math.round(additionalMedicareTax),
        netInvestmentIncomeTax: Math.round(netInvestmentIncomeTax),
        totalAdditionalTax: Math.round(totalAdditionalTax),
    };
}
function calculateTaxCredits(input, taxBeforeCredits, steps) {
    let nonRefundableCredits = 0;
    let refundableCredits = 0;
    // Child Tax Credit
    const ctcResult = (0, credits_1.calculateChildTaxCredit)(input, taxBeforeCredits);
    nonRefundableCredits += ctcResult.nonRefundable;
    refundableCredits += ctcResult.refundable;
    if (ctcResult.nonRefundable + ctcResult.refundable > 0) {
        steps.push({
            description: 'Child Tax Credit (Non-Refundable)',
            amount: ctcResult.nonRefundable,
            source: 'Form 8812',
        });
        if (ctcResult.refundable > 0) {
            steps.push({
                description: 'Additional Child Tax Credit (Refundable)',
                amount: ctcResult.refundable,
                source: 'Form 8812',
            });
        }
    }
    // Earned Income Credit
    const eitcAmount = (0, credits_1.calculateEarnedIncomeCredit)(input);
    refundableCredits += eitcAmount;
    if (eitcAmount > 0) {
        steps.push({
            description: 'Earned Income Credit',
            amount: eitcAmount,
            source: 'EIC Worksheet',
        });
    }
    // Education Credits
    const educationCredits = (0, credits_1.calculateEducationCredits)(input);
    nonRefundableCredits += educationCredits.nonRefundable;
    refundableCredits += educationCredits.refundable;
    if (educationCredits.nonRefundable + educationCredits.refundable > 0) {
        steps.push({
            description: 'Education Credits',
            amount: educationCredits.nonRefundable + educationCredits.refundable,
            source: 'Form 8863',
        });
    }
    return {
        nonRefundableCredits: Math.round(nonRefundableCredits),
        refundableCredits: Math.round(refundableCredits),
    };
}
function calculateTotalPayments(input, steps) {
    let totalPayments = 0;
    // Federal withholding from W-2s
    const federalWithholding = input.income.wages.reduce((sum, w2) => sum + w2.fedWithholding, 0) +
        input.payments.federalWithholding;
    // Estimated tax payments
    const estimatedTax = input.payments.estimatedTaxPayments;
    totalPayments = federalWithholding + estimatedTax +
        input.payments.eicAdvancePayments +
        input.payments.extensionPayment +
        input.payments.otherPayments;
    if (federalWithholding > 0) {
        steps.push({
            description: 'Federal Income Tax Withheld',
            amount: federalWithholding,
            source: 'Form 1040, Line 25a',
        });
    }
    if (estimatedTax > 0) {
        steps.push({
            description: 'Estimated Tax Payments',
            amount: estimatedTax,
            source: 'Form 1040, Line 26',
        });
    }
    return Math.round(totalPayments);
}
function calculateTaxableSocialSecurity(input) {
    // Simplified calculation - in practice would need provisional income calculation
    const ssBenefits = input.income.socialSecurityBenefits.total;
    if (input.income.socialSecurityBenefits.taxable !== undefined) {
        return input.income.socialSecurityBenefits.taxable;
    }
    // Placeholder - actual calculation requires provisional income
    return ssBenefits * 0.85; // Assume 85% taxable for high-income taxpayers
}
function calculateMarginalTaxRate(filingStatus, taxableIncome) {
    const brackets = constants2025_1.IRS_CONSTANTS_2025.taxBrackets[filingStatus];
    for (const bracket of brackets) {
        if (!bracket.max || taxableIncome <= bracket.max) {
            return bracket.rate;
        }
    }
    return brackets[brackets.length - 1].rate;
}
function createErrorResult(errors) {
    return {
        totalIncome: 0,
        adjustedGrossIncome: 0,
        taxableIncome: 0,
        standardDeduction: 0,
        itemizedDeduction: 0,
        deductionUsed: 0,
        qbiDeduction: 0,
        regularTax: 0,
        capitalGainsTax: 0,
        alternativeMinimumTax: 0,
        selfEmploymentTax: 0,
        additionalMedicareTax: 0,
        netInvestmentIncomeTax: 0,
        taxBeforeCredits: 0,
        nonRefundableCredits: 0,
        refundableCredits: 0,
        totalTax: 0,
        totalPayments: 0,
        refundOwed: 0,
        calculationSteps: [],
        effectiveTaxRate: 0,
        marginalTaxRate: 0,
        errors,
        warnings: [],
    };
}
//# sourceMappingURL=calculator.js.map