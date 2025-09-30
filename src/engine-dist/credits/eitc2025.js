"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEITC2025 = void 0;
const eitc_1 = require("../rules/2025/federal/eitc");
/**
 * Compute Earned Income Tax Credit for 2025
 * Implements precise EITC calculation with investment income test and phase-in/phase-out
 * Source: Rev. Proc. 2024-40 §2.06, IRS Publication 596
 */
function computeEITC2025(input) {
    const { filingStatus, earnedIncome, agi, qualifyingChildren, investmentIncome, primaryAge, spouseAge } = input;
    // Step 1: Investment income test - disqualifies if over limit
    if (investmentIncome > eitc_1.EITC_INVESTMENT_INCOME_LIMIT_2025) {
        return {
            eitc: 0,
            disqualified: true,
            phase: 'zero',
            details: {
                maxCredit: 0,
                incomeUsedForCalculation: 0,
                thresholdUsed: 0,
                completePhaseoutPoint: 0
            }
        };
    }
    // Step 2: Age test for childless taxpayers (must be 25-64)
    // IRS Pub 596: Without qualifying children, must be at least 25 but under 65
    if (qualifyingChildren === 0) {
        const ageCheckFailed = (age) => {
            return age !== undefined && (age < 25 || age >= 65);
        };
        if (filingStatus === 'marriedJointly') {
            // For MFJ, at least one spouse must meet age requirement
            const primaryFails = ageCheckFailed(primaryAge);
            const spouseFails = ageCheckFailed(spouseAge);
            // If both fail or both are undefined, disqualify
            if ((primaryFails && spouseFails) || (primaryAge === undefined && spouseAge === undefined)) {
                return {
                    eitc: 0,
                    disqualified: true,
                    phase: 'zero',
                    details: {
                        maxCredit: 0,
                        incomeUsedForCalculation: 0,
                        thresholdUsed: 0,
                        completePhaseoutPoint: 0
                    }
                };
            }
        }
        else {
            // For other filing statuses, primary must meet age requirement
            if (ageCheckFailed(primaryAge)) {
                return {
                    eitc: 0,
                    disqualified: true,
                    phase: 'zero',
                    details: {
                        maxCredit: 0,
                        incomeUsedForCalculation: 0,
                        thresholdUsed: 0,
                        completePhaseoutPoint: 0
                    }
                };
            }
        }
    }
    const row = eitc_1.EITC_2025[qualifyingChildren];
    // Determine phaseout thresholds based on filing status
    const phaseoutThreshold = filingStatus === 'marriedJointly'
        ? row.thresholdPhaseoutMFJ
        : row.thresholdPhaseoutOther;
    const completePhaseout = filingStatus === 'marriedJointly'
        ? row.completedPhaseoutMFJ
        : row.completedPhaseoutOther;
    // Use the greater of AGI or earned income for EITC calculation
    const incomeForCalculation = Math.max(agi, earnedIncome);
    let credit = 0;
    let phase = 'zero';
    // Step 2: Calculate credit based on phase
    if (earnedIncome < row.earnedIncomeAmount) {
        // Phase-in: Credit grows linearly to maximum
        if (earnedIncome > 0) {
            credit = Math.round(row.maxCredit * (earnedIncome / row.earnedIncomeAmount));
            phase = 'phase-in';
        }
    }
    else if (incomeForCalculation <= phaseoutThreshold) {
        // Plateau: Maximum credit
        credit = row.maxCredit;
        phase = 'plateau';
    }
    else if (incomeForCalculation < completePhaseout) {
        // Phase-out: Linear reduction to zero
        const phaseoutRange = completePhaseout - phaseoutThreshold;
        const excessIncome = incomeForCalculation - phaseoutThreshold;
        const phaseoutRatio = 1 - (excessIncome / phaseoutRange);
        credit = Math.max(0, Math.round(row.maxCredit * phaseoutRatio));
        phase = 'phase-out';
    }
    // If income >= completePhaseout, credit remains 0
    return {
        eitc: credit,
        disqualified: false,
        phase,
        details: {
            maxCredit: row.maxCredit,
            incomeUsedForCalculation: incomeForCalculation,
            thresholdUsed: phaseoutThreshold,
            completePhaseoutPoint: completePhaseout
        }
    };
}
exports.computeEITC2025 = computeEITC2025;
//# sourceMappingURL=eitc2025.js.map