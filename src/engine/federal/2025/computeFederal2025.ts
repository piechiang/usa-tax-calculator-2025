import type {
  FederalDiagnostics2025,
  FederalInput2025,
  FederalResult2025,
  FilingStatus,
} from '../../types';
import {
  STANDARD_DEDUCTION_2025,
  ADDITIONAL_STANDARD_DEDUCTION_2025,
  SALT_CAP_2025,
} from '../../rules/2025/federal/deductions';
import { NIIT_THRESHOLDS_2025 } from '../../rules/2025/federal/medicareSocialSecurity';

// Import Schedule 1 adjustment constants
import {
  EDUCATOR_EXPENSES_2025,
  SELF_EMPLOYED_RETIREMENT_PLANS_2025,
  IRA_DEDUCTION_LIMITS_2025,
  STUDENT_LOAN_INTEREST_2025,
  HSA_LIMITS_2025,
} from '../../rules/2025/federal/schedule1Adjustments';

// Import new authoritative calculation modules
import { computeSETax2025, type SETaxResult } from '../../tax/seTax';
import { computePreferentialRatesTax2025 } from '../../tax/longTermCapitalGains';
import { calculateRegularTax2025 } from '../../tax/regularTax';
import { computeEITC2025 } from '../../credits/eitc2025';
import { computeAMT2025, type AMTInput } from '../../tax/amt';

// Import existing advanced credits (CTC, AOTC, LLC)
import {
  calculateAdvancedCTC,
  calculateAdvancedAOTC,
  calculateAdvancedLLC,
} from './advancedCredits';

// Import QBI deduction module
import { computeQBIDeduction2025, type QBIInput } from '../../deductions/qbi';

// Import NOL carryforward module
import { calculateNOLDeduction, type NOLInput } from '../../deductions/nolCarryforward';

// Import additional credit modules
import { computeSaversCredit2025 } from '../../credits/saversCredit';
import { computeChildCareCredit2025 } from '../../credits/childCareCredit';
import { computeForeignTaxCredit2025 } from '../../credits/foreignTaxCredit';
import { computeAdoptionCredit2025 } from '../../credits/adoptionCredit';
import { calculatePTC } from '../../credits/premiumTaxCredit';

import { CTC_2025 } from '../../rules/2025/federal/credits';
import { addCents, formatCents, max0, multiplyCents } from '../../util/money';
import { createDiagnostics, addError, addWarning } from '../../diagnostics';
import type { DiagnosticCode } from '../../diagnostics/codes';
import { TaxInputValidator } from '../../validation/inputValidation';

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
export function computeFederal2025(input: FederalInput2025): FederalResult2025 {
  const diagnostics = createDiagnostics();
  collectInputDiagnostics(input, diagnostics);

  // === STEP A: Calculate Self-Employment Tax (needed for AGI adjustment) ===
  const seTaxResult = calculateSelfEmploymentTax(input);
  if (input.income.scheduleCNet !== 0) {
    pushWarning(diagnostics, 'FORM-W-001', {
      field: 'income.scheduleCNet',
      phase: 'self-employment',
    });
  }
  if (seTaxResult.totalSETax > 0) {
    pushWarning(diagnostics, 'CALC-W-004', {
      field: 'income.scheduleCNet',
      context: { amount: formatCents(seTaxResult.netEarningsFromSE) },
      phase: 'self-employment',
    });
    pushWarning(diagnostics, 'FORM-W-005', {
      field: 'income.scheduleCNet',
      phase: 'self-employment',
    });
  }

  // === STEP B: Calculate Adjusted Gross Income (AGI) ===
  const agi = calculateAGI(input, seTaxResult.halfDeduction, diagnostics);

  // === STEP C: Calculate Deductions (Standard vs Itemized) ===
  const deductionResult = calculateDeductions(input, agi, diagnostics);

  // === STEP D: Calculate Taxable Income (before QBI deduction) ===
  const taxableIncomeBeforeQBI = max0(agi - deductionResult.deduction);

  // === STEP D2: Calculate QBI Deduction (§199A) ===
  // QBI deduction is calculated based on taxable income before QBI,
  // then subtracted to get final taxable income
  const qbiResult = calculateQBIDeduction(input, taxableIncomeBeforeQBI);
  if ((input.qbiBusinesses?.length || 0) > 0 || input.qbiREITPTP) {
    if (qbiResult.qbiDeduction === 0) {
      pushWarning(diagnostics, 'CALC-W-005', {
        field: 'qbiDeduction',
        context: { amount: formatCents(0) },
        message: 'Qualified Business Income deduction not available—verify wage/UBIA thresholds',
        phase: 'qbi',
      });
    } else if (qbiResult.isLimitedByOverall) {
      pushWarning(diagnostics, 'CALC-W-005', {
        field: 'qbiDeduction',
        context: { amount: formatCents(qbiResult.qbiDeduction) },
        phase: 'qbi',
      });
    }
  }

  // === STEP D3: Taxable Income after QBI (before NOL) ===
  const taxableIncomeBeforeNOL = max0(taxableIncomeBeforeQBI - qbiResult.qbiDeduction);

  // === STEP D4: NOL Deduction ===
  let nolDeduction = 0;
  if (input.nolCarryforwards && input.nolCarryforwards.length > 0) {
    const nolInput: NOLInput = {
      taxableIncomeBeforeNOL,
      nolCarryforwards: input.nolCarryforwards,
      taxYear: 2025, // For 2025, 80% limitation applies (post-CARES Act)
      filingStatus: input.filingStatus,
    };
    const nolResult = calculateNOLDeduction(nolInput);
    nolDeduction = nolResult.nolDeduction;

    // Warn about limitation applied based on tax year
    if (nolResult.limitedByEightyPercent) {
      pushWarning(diagnostics, 'CALC-W-019', {
        field: 'nolCarryforwards',
        context: {
          amount: formatCents(nolResult.effectiveLimit),
          limitationType: nolResult.limitationType,
        },
        message: `NOL deduction limited to ${nolResult.limitationType} of taxable income ($${formatCents(nolResult.effectiveLimit)})`,
        phase: 'nol',
      });
    }

    // Informational: Note when excess NOL is carried forward
    if (nolResult.excessNOL > 0) {
      pushWarning(diagnostics, 'NOL-W-001', {
        field: 'nolCarryforwards',
        context: { carryforward: formatCents(nolResult.excessNOL) },
        message: `$${formatCents(nolResult.excessNOL)} NOL will carry forward to future years`,
        phase: 'nol',
      });
    }
  }

  // === STEP D5: Final Taxable Income (after NOL deduction) ===
  const taxableIncome = max0(taxableIncomeBeforeNOL - nolDeduction);

  // === STEP E: Calculate Regular Tax + Preferential Rates ===
  const taxResult = calculateIncomeTax(input, taxableIncome);
  if (taxResult.capitalGainsDetails) {
    const preferentialTotal = addCents(
      taxResult.capitalGainsDetails.at0Percent,
      taxResult.capitalGainsDetails.at15Percent,
      taxResult.capitalGainsDetails.at20Percent
    );
    if (preferentialTotal > 0) {
      pushWarning(diagnostics, 'FORM-W-002', { field: 'income.capGainsNet', phase: 'income-tax' });
    }
  }

  // === STEP F: Calculate Additional Taxes ===
  const additionalTaxes = calculateAdditionalTaxes(
    input,
    agi,
    taxableIncome,
    deductionResult,
    taxResult.totalIncomeTax,
    seTaxResult,
    diagnostics
  );

  // === STEP G: Calculate Credits ===
  const creditsResult = calculateCredits(
    input,
    agi,
    taxableIncome,
    taxResult.totalIncomeTax,
    diagnostics
  );
  const credits = creditsResult.credits;

  // === STEP H: Calculate Final Tax Liability ===
  const totalNonRefundableCredits = addCents(
    credits.ctc || 0,
    credits.aotc || 0,
    credits.llc || 0,
    credits.ftc || 0,
    credits.adoptionCreditNonRefundable || 0,
    credits.otherNonRefundable || 0
  );

  const taxAfterNonRefundableCredits = max0(taxResult.totalIncomeTax - totalNonRefundableCredits);

  const totalTax = addCents(
    taxAfterNonRefundableCredits,
    additionalTaxes.seTax || 0,
    additionalTaxes.niit || 0,
    additionalTaxes.medicareSurtax || 0,
    additionalTaxes.amt || 0,
    credits.ptcRepayment || 0 // Excess APTC repayment increases tax liability
  );

  // === STEP I: Calculate Payments and Refund/Owe ===
  const totalPayments = addCents(
    input.payments.federalWithheld,
    input.payments.estPayments,
    input.payments.eitcAdvance
  );

  // Add diagnostic warnings for unusual payment patterns
  if (totalPayments > 0 && totalTax > 0) {
    const paymentRatio = totalPayments / totalTax;
    if (paymentRatio > 1.5) {
      pushWarning(diagnostics, 'PAYMENT-W-001', {
        field: 'payments',
        context: {
          payments: formatCents(totalPayments),
          tax: formatCents(totalTax),
          ratio: (paymentRatio * 100).toFixed(0) + '%',
        },
        message: 'Payments significantly exceed tax liability—verify withholding accuracy',
        phase: 'payments',
      });
    }
  }

  const refundableCredits = addCents(
    credits.eitc || 0,
    credits.adoptionCreditRefundable || 0,
    credits.ptc || 0, // Premium Tax Credit is refundable
    credits.otherRefundable || 0
  );

  const refundOrOwe = addCents(totalPayments, refundableCredits) - totalTax;

  // Warn about large refunds (may indicate overwithholding)
  if (refundOrOwe > 500000) {
    // > $5,000
    pushWarning(diagnostics, 'PAYMENT-W-002', {
      field: 'refundOrOwe',
      context: { refund: formatCents(refundOrOwe) },
      message:
        'Large refund detected—consider adjusting withholding to avoid interest-free loan to IRS',
      phase: 'payments',
    });
  }

  // Warn about large amounts owed (may trigger underpayment penalty)
  if (refundOrOwe < -100000 && totalPayments < multiplyCents(totalTax, 0.9)) {
    // Owe > $1,000 and paid < 90%
    pushWarning(diagnostics, 'PAYMENT-W-003', {
      field: 'refundOrOwe',
      context: { owed: formatCents(-refundOrOwe) },
      message: 'Significant amount owed—may be subject to underpayment penalty (Form 2210)',
      phase: 'payments',
    });
  }

  // === STEP I2: Build Detailed Payment Breakdown ===
  const paymentBreakdown: import('../../types').PaymentBreakdown = {
    federalWithheld: input.payments.federalWithheld,
    estimatedPayments: input.payments.estPayments,
    eitcAdvancePayments: input.payments.eitcAdvance,
    totalPayments,
  };

  // === STEP I3: Build Detailed Refundable Credits Breakdown ===
  const refundableCreditsBreakdown: import('../../types').RefundableCreditsBreakdown = {
    eitc: credits.eitc || 0,
    additionalChildTaxCredit: creditsResult.actc || 0,
    aotcRefundable: creditsResult.aotcRefundable || 0,
    adoptionCreditRefundable: credits.adoptionCreditRefundable || 0,
    ptc: credits.ptc || 0,
    otherRefundable: credits.otherRefundable || 0,
    totalRefundableCredits: refundableCredits,
  };

  // === STEP I4: Build Detailed Refund/Owe Breakdown ===
  const refundOrOweBreakdown: import('../../types').RefundOrOweBreakdown = {
    totalTax,
    totalNonRefundableCredits,
    taxAfterNonRefundableCredits,
    totalAdditionalTaxes: addCents(
      additionalTaxes.seTax || 0,
      additionalTaxes.niit || 0,
      additionalTaxes.medicareSurtax || 0,
      additionalTaxes.amt || 0
    ),
    totalPayments,
    totalRefundableCredits: refundableCredits,
    paymentsAndCredits: addCents(totalPayments, refundableCredits),
    refundOrOwe,
  };

  return {
    agi,
    taxableIncome,
    deductionType: deductionResult.isStandard ? 'standard' : 'itemized',
    standardDeduction: deductionResult.standardDeduction,
    // Always include itemizedDeduction if user provided any itemized amounts (for reference)
    ...(deductionResult.itemizedTotal > 0 && { itemizedDeduction: deductionResult.itemizedTotal }),
    ...((input.qbiBusinesses?.length || input.qbiREITPTP) && {
      qbiDeduction: qbiResult.qbiDeduction,
    }),
    // Include qbiDetails if there are QBI businesses or REIT/PTP income, even if deduction is 0
    ...((input.qbiBusinesses?.length || input.qbiREITPTP) && { qbiDetails: qbiResult }),
    ...(nolDeduction > 0 && { nolDeduction }),
    taxBeforeCredits: taxResult.totalIncomeTax,
    credits,
    additionalTaxes,
    amtDetails: additionalTaxes.amtDetails,
    totalTax,
    totalPayments,
    refundOrOwe,
    paymentBreakdown,
    refundableCreditsBreakdown,
    refundOrOweBreakdown,
    diagnostics,
  };
}

/**
 * Calculate Self-Employment Tax (Schedule SE)
 * Must be calculated first as it affects AGI via the deduction
 */
function calculateSelfEmploymentTax(input: FederalInput2025) {
  const { scheduleCNet, wages } = input.income;

  if (scheduleCNet <= 0) {
    return {
      oasdi: 0,
      medicare: 0,
      additionalMedicare: 0,
      halfDeduction: 0,
      netEarningsFromSE: 0,
      totalSETax: 0,
    };
  }

  return computeSETax2025({
    filingStatus: input.filingStatus,
    seNetProfit: scheduleCNet,
    w2SocialSecurityWages: wages,
    w2MedicareWages: wages,
  });
}

/**
 * Calculate Adjusted Gross Income with all Schedule 1 adjustments
 *
 * Schedule 1 Part II - Adjustments to Income (Lines 11-26)
 * These "above-the-line" deductions reduce total income to arrive at AGI.
 *
 * Source: IRS Schedule 1 (Form 1040), 2025
 */
function calculateAGI(
  input: FederalInput2025,
  seTaxDeduction: number,
  diagnostics: FederalDiagnostics2025
): number {
  const { income } = input;

  // Calculate Total Income (Form 1040 Lines 1-9)
  const totalIncome = addCents(
    income.wages,
    income.interest,
    income.dividends.ordinary,
    income.dividends.qualified,
    income.capGainsNet,
    income.scheduleCNet,
    income.k1.ordinaryBusinessIncome,
    income.k1.passiveIncome,
    income.k1.portfolioIncome,
    income.other.otherIncome,
    income.other.royalties,
    income.other.guaranteedPayments
  );

  // Calculate Schedule 1 Part II Adjustments
  const schedule1Adjustments = calculateSchedule1Adjustments(
    input,
    totalIncome,
    seTaxDeduction,
    diagnostics
  );

  return max0(totalIncome - schedule1Adjustments.totalAdjustments);
}

/**
 * Calculate all Schedule 1 Part II adjustments to income
 * Returns the total adjustments and breakdown for diagnostics
 */
function calculateSchedule1Adjustments(
  input: FederalInput2025,
  totalIncome: number,
  seTaxDeduction: number,
  diagnostics: FederalDiagnostics2025
): { totalAdjustments: number; breakdown: Record<string, number> } {
  const { adjustments, filingStatus } = input;
  const breakdown: Record<string, number> = {};

  // Line 11: Educator expenses (max $300 per educator, $600 if both)
  const requestedEducator = adjustments.educatorExpenses || 0;
  const maxEducator = EDUCATOR_EXPENSES_2025.maxDeductionBothSpouses;
  const educatorExpenses = Math.min(requestedEducator, maxEducator);
  breakdown.educatorExpenses = educatorExpenses;
  if (requestedEducator > maxEducator) {
    pushWarning(diagnostics, 'CALC-W-010', {
      field: 'adjustments.educatorExpenses',
      context: { max: formatCents(maxEducator), requested: formatCents(requestedEducator) },
      phase: 'agi',
    });
  }

  // Line 12: Certain business expenses (reservists, performers, fee-basis officials)
  breakdown.businessExpenses = adjustments.businessExpenses || 0;

  // Line 13: HSA deduction (validated against contribution limits)
  const hsaDeduction = adjustments.hsaDeduction || 0;
  breakdown.hsaDeduction = hsaDeduction;
  // Warn if HSA seems high (could exceed limits)
  if (hsaDeduction > HSA_LIMITS_2025.familyCoverage + HSA_LIMITS_2025.catchUpAge55) {
    pushWarning(diagnostics, 'CALC-W-018', {
      field: 'adjustments.hsaDeduction',
      context: { amount: formatCents(hsaDeduction) },
      phase: 'agi',
    });
  }

  // Line 14: Moving expenses for Armed Forces
  breakdown.movingExpensesMilitary = adjustments.movingExpensesMilitary || 0;

  // Line 15: Deductible part of SE tax (calculated automatically)
  breakdown.seTaxDeduction = seTaxDeduction;

  // Line 16: Self-employed SEP, SIMPLE, and qualified plans
  const requestedRetirement = adjustments.selfEmployedRetirement || 0;
  const netSEIncome = max0(input.income.scheduleCNet - seTaxDeduction);
  const sepSimpleLimit = calculateSEPSimpleLimit(netSEIncome, requestedRetirement);
  breakdown.selfEmployedRetirement = sepSimpleLimit;
  if (requestedRetirement > 0 && sepSimpleLimit < requestedRetirement) {
    pushWarning(diagnostics, 'CALC-W-015', {
      field: 'adjustments.selfEmployedRetirement',
      context: { allowed: formatCents(sepSimpleLimit) },
      phase: 'agi',
    });
  }

  // Line 17: Self-employed health insurance deduction
  const requestedHealthIns = adjustments.selfEmployedHealthInsurance || 0;
  const seHealthInsurance = calculateSEHealthInsuranceDeduction(
    requestedHealthIns,
    input.income.scheduleCNet,
    seTaxDeduction
  );
  breakdown.selfEmployedHealthInsurance = seHealthInsurance;
  if (requestedHealthIns > 0 && seHealthInsurance < requestedHealthIns) {
    pushWarning(diagnostics, 'CALC-W-016', {
      field: 'adjustments.selfEmployedHealthInsurance',
      context: { allowed: formatCents(seHealthInsurance) },
      phase: 'agi',
    });
  }

  // Line 18a: Alimony paid (only for pre-2019 divorce decrees)
  const requestedAlimony = adjustments.alimonyPaid || 0;
  const alimonyDeduction = calculateAlimonyDeduction(adjustments);
  breakdown.alimonyPaid = alimonyDeduction;
  if (requestedAlimony > 0 && alimonyDeduction === 0) {
    pushWarning(diagnostics, 'CALC-W-017', {
      field: 'adjustments.alimonyPaid',
      phase: 'agi',
    });
  }

  // Line 19: Penalty on early withdrawal of savings (fully deductible)
  breakdown.earlyWithdrawalPenalty = adjustments.earlyWithdrawalPenalty || 0;

  // Line 20: IRA deduction (subject to income phaseouts if covered by plan)
  const requestedIRA = adjustments.iraDeduction || 0;
  const iraDeduction = calculateIRADeduction(input, totalIncome);
  breakdown.iraDeduction = iraDeduction;
  if (requestedIRA > 0 && iraDeduction === 0) {
    pushWarning(diagnostics, 'CALC-W-012', {
      field: 'adjustments.iraDeduction',
      context: {
        threshold: formatCents(IRA_DEDUCTION_LIMITS_2025.coveredByPlan.single.noDeduction),
      },
      phase: 'agi',
    });
  } else if (requestedIRA > 0 && iraDeduction < requestedIRA) {
    pushWarning(diagnostics, 'CALC-W-011', {
      field: 'adjustments.iraDeduction',
      context: { requested: formatCents(requestedIRA), allowed: formatCents(iraDeduction) },
      phase: 'agi',
    });
  }

  // Line 21: Student loan interest deduction (max $2,500, subject to phaseout)
  const requestedSLI = adjustments.studentLoanInterest || 0;
  const studentLoanDeduction = calculateStudentLoanDeduction(
    requestedSLI,
    totalIncome,
    filingStatus
  );
  breakdown.studentLoanInterest = studentLoanDeduction;
  if (requestedSLI > 0 && filingStatus === 'marriedSeparately') {
    pushWarning(diagnostics, 'CALC-W-014', {
      field: 'adjustments.studentLoanInterest',
      phase: 'agi',
    });
  } else if (requestedSLI > 0 && studentLoanDeduction < requestedSLI && studentLoanDeduction > 0) {
    pushWarning(diagnostics, 'CALC-W-013', {
      field: 'adjustments.studentLoanInterest',
      context: { requested: formatCents(requestedSLI), allowed: formatCents(studentLoanDeduction) },
      phase: 'agi',
    });
  }

  // Line 23: Archer MSA deduction (grandfathered accounts only)
  breakdown.archerMsaDeduction = adjustments.archerMsaDeduction || 0;

  // Line 24: Other adjustments
  breakdown.otherAdjustments = adjustments.otherAdjustments || 0;

  // Calculate total adjustments
  const totalAdjustments = addCents(
    breakdown.educatorExpenses,
    breakdown.businessExpenses,
    breakdown.hsaDeduction,
    breakdown.movingExpensesMilitary,
    breakdown.seTaxDeduction,
    breakdown.selfEmployedRetirement,
    breakdown.selfEmployedHealthInsurance,
    breakdown.alimonyPaid,
    breakdown.earlyWithdrawalPenalty,
    breakdown.iraDeduction,
    breakdown.studentLoanInterest,
    breakdown.archerMsaDeduction,
    breakdown.otherAdjustments
  );

  return { totalAdjustments, breakdown };
}

/**
 * Calculate SEP/SIMPLE/Solo 401(k) deduction limit
 * Limited by net SE income after SE tax deduction
 */
function calculateSEPSimpleLimit(netSEIncome: number, requestedContribution: number): number {
  if (netSEIncome <= 0 || requestedContribution <= 0) return 0;

  // Maximum contribution is 25% of net SE income or $69,000 for 2025
  const maxContribution = Math.min(
    multiplyCents(netSEIncome, 0.25),
    SELF_EMPLOYED_RETIREMENT_PLANS_2025.sepIRA.maxContribution2025
  );

  return Math.min(requestedContribution, maxContribution);
}

/**
 * Calculate self-employed health insurance deduction
 * Limited to net profit from business (after SE tax deduction)
 */
function calculateSEHealthInsuranceDeduction(
  premiumsPaid: number,
  scheduleCNet: number,
  seTaxDeduction: number
): number {
  if (premiumsPaid <= 0 || scheduleCNet <= 0) return 0;

  // Limited to net profit after SE tax deduction
  const netProfit = max0(scheduleCNet - seTaxDeduction);
  return Math.min(premiumsPaid, netProfit);
}

/**
 * Calculate alimony paid deduction
 * Only deductible for divorce decrees finalized before January 1, 2019
 */
function calculateAlimonyDeduction(adjustments: FederalInput2025['adjustments']): number {
  const alimonyPaid = adjustments.alimonyPaid || 0;
  const divorceYear = adjustments.divorceYear;

  if (alimonyPaid <= 0) return 0;

  // TCJA eliminated alimony deduction for post-2018 divorces
  if (divorceYear === undefined || divorceYear >= 2019) {
    return 0; // Not deductible for divorces after 2018
  }

  return alimonyPaid;
}

/**
 * Calculate IRA deduction with income phaseouts
 * Phaseouts apply if taxpayer (or spouse for joint filers) is covered by workplace plan
 */
function calculateIRADeduction(input: FederalInput2025, totalIncome: number): number {
  const { adjustments, filingStatus, primary, spouse } = input;
  const contribution = adjustments.iraDeduction || 0;

  if (contribution <= 0) return 0;

  // Calculate age for catch-up eligibility
  const TAX_YEAR = 2025;
  const calculateAge = (birthDate: string | undefined): number => {
    if (!birthDate) return 40; // Default to non-catch-up age
    const parts = birthDate.split('-');
    const birthYear = parseInt(parts[0] || '0', 10);
    return TAX_YEAR - birthYear;
  };

  const primaryAge = calculateAge(primary?.birthDate);
  const maxContribution =
    primaryAge >= 50
      ? IRA_DEDUCTION_LIMITS_2025.contributionLimit + IRA_DEDUCTION_LIMITS_2025.catchUpAge50
      : IRA_DEDUCTION_LIMITS_2025.contributionLimit;

  // Cap contribution at maximum
  const cappedContribution = Math.min(contribution, maxContribution);

  // If not covered by workplace plan, full deduction allowed
  const isCoveredByPlan = adjustments.iraContributorCoveredByPlan ?? false;
  const spouseCoveredByPlan = adjustments.iraSpouseCoveredByPlan ?? false;

  if (!isCoveredByPlan && !spouseCoveredByPlan) {
    return cappedContribution;
  }

  // Apply phaseout based on filing status and coverage
  const phaseoutRanges = isCoveredByPlan
    ? IRA_DEDUCTION_LIMITS_2025.coveredByPlan
    : IRA_DEDUCTION_LIMITS_2025.spouseNotCovered;

  const range = getPhaseoutRange(filingStatus, phaseoutRanges);
  if (!range) return cappedContribution;

  return applyPhaseout(cappedContribution, totalIncome, range.fullDeduction, range.noDeduction);
}

/**
 * Calculate student loan interest deduction with phaseout
 * Maximum $2,500, phases out based on MAGI
 */
function calculateStudentLoanDeduction(
  interestPaid: number,
  magi: number,
  filingStatus: FilingStatus
): number {
  if (interestPaid <= 0) return 0;

  // MFS cannot claim student loan interest deduction
  if (filingStatus === 'marriedSeparately') return 0;

  // Cap at maximum deduction
  const maxDeduction = STUDENT_LOAN_INTEREST_2025.maxDeduction;
  const cappedInterest = Math.min(interestPaid, maxDeduction);

  // Get phaseout range for filing status
  const phaseoutRange =
    filingStatus === 'marriedJointly'
      ? STUDENT_LOAN_INTEREST_2025.phaseOut.marriedJointly
      : STUDENT_LOAN_INTEREST_2025.phaseOut.single;

  return applyPhaseout(cappedInterest, magi, phaseoutRange.start, phaseoutRange.end);
}

/**
 * Apply income-based phaseout to a deduction
 */
function applyPhaseout(
  deduction: number,
  income: number,
  phaseoutStart: number,
  phaseoutEnd: number
): number {
  if (income <= phaseoutStart) return deduction;
  if (income >= phaseoutEnd) return 0;

  // Calculate proportional reduction
  const phaseoutRange = phaseoutEnd - phaseoutStart;
  const incomeOverThreshold = income - phaseoutStart;
  const reductionRatio = incomeOverThreshold / phaseoutRange;
  const reduction = multiplyCents(deduction, reductionRatio);

  return max0(deduction - reduction);
}

/**
 * Get phaseout range for IRA deduction based on filing status
 */
function getPhaseoutRange(
  filingStatus: FilingStatus,
  ranges:
    | typeof IRA_DEDUCTION_LIMITS_2025.coveredByPlan
    | typeof IRA_DEDUCTION_LIMITS_2025.spouseNotCovered
): { fullDeduction: number; noDeduction: number } | null {
  // Check if this is the spouseNotCovered ranges (has different structure)
  if ('fullDeduction' in ranges && 'noDeduction' in ranges) {
    return ranges as { fullDeduction: number; noDeduction: number };
  }

  // Otherwise it's the coveredByPlan ranges
  const coveredRanges = ranges as typeof IRA_DEDUCTION_LIMITS_2025.coveredByPlan;
  switch (filingStatus) {
    case 'single':
    case 'headOfHousehold':
      return coveredRanges.single;
    case 'marriedJointly':
      return coveredRanges.marriedJointly;
    case 'marriedSeparately':
      return coveredRanges.marriedSeparately;
    default:
      return coveredRanges.single;
  }
}

/**
 * Calculate deductions using 2025 IRS amounts
 */
function calculateDeductions(
  input: FederalInput2025,
  agi: number,
  diagnostics: FederalDiagnostics2025
): {
  deduction: number;
  isStandard: boolean;
  standardDeduction: number;
  itemizedTotal: number;
} {
  // Calculate standard deduction with age/blindness adjustments
  let standardDeduction = STANDARD_DEDUCTION_2025[input.filingStatus];

  const TAX_YEAR = 2025;

  // Helper to calculate age at end of tax year
  const calculateAge = (birthDate: string): number => {
    const parts = birthDate.split('-');
    const birthYear = parseInt(parts[0] || '0', 10);
    return TAX_YEAR - birthYear;
  };

  // Additional standard deduction for age 65+ and/or blindness
  // Use correct amounts based on filing status (married vs unmarried)
  const isMarried =
    input.filingStatus === 'marriedJointly' || input.filingStatus === 'marriedSeparately';
  const age65Amount = isMarried
    ? ADDITIONAL_STANDARD_DEDUCTION_2025.age65OrOlderMarried
    : ADDITIONAL_STANDARD_DEDUCTION_2025.age65OrOlderUnmarried;
  const blindAmount = isMarried
    ? ADDITIONAL_STANDARD_DEDUCTION_2025.blindMarried
    : ADDITIONAL_STANDARD_DEDUCTION_2025.blindUnmarried;

  if (input.primary) {
    if (input.primary.isBlind) {
      standardDeduction += blindAmount;
    }
    if (input.primary.birthDate && calculateAge(input.primary.birthDate) >= 65) {
      standardDeduction += age65Amount;
    }
  }

  if (input.spouse) {
    if (input.spouse.isBlind) {
      standardDeduction += blindAmount;
    }
    if (input.spouse.birthDate && calculateAge(input.spouse.birthDate) >= 65) {
      standardDeduction += age65Amount;
    }
  }

  // Calculate itemized deductions
  const itemized = input.itemized;

  if ((itemized.stateLocalTaxes || 0) > SALT_CAP_2025) {
    pushWarning(diagnostics, 'CALC-W-006', {
      field: 'itemized.stateLocalTaxes',
      phase: 'deductions',
    });
  }

  const saltDeduction = Math.min(itemized.stateLocalTaxes || 0, SALT_CAP_2025);

  const medicalDeduction = calculateMedicalDeduction(itemized.medical || 0, agi);

  const itemizedTotal = addCents(
    saltDeduction,
    itemized.mortgageInterest,
    itemized.charitable,
    medicalDeduction,
    itemized.other
  );

  // Choose higher deduction (unless user explicitly forces itemized)
  const useStandard = input.forceItemized ? false : standardDeduction >= itemizedTotal;

  if (useStandard && itemizedTotal > 0) {
    pushWarning(diagnostics, 'CALC-W-007', {
      field: 'itemized',
      context: {
        stdAmount: formatCents(standardDeduction),
        itemAmount: formatCents(itemizedTotal),
      },
      phase: 'deductions',
    });
  } else if (input.forceItemized && standardDeduction > itemizedTotal) {
    // Warn user they're forcing itemized when standard is higher
    pushWarning(diagnostics, 'CALC-W-008', {
      field: 'itemized',
      context: {
        stdAmount: formatCents(standardDeduction),
        itemAmount: formatCents(itemizedTotal),
        taxImpact: formatCents(standardDeduction - itemizedTotal),
      },
      phase: 'deductions',
    });
  }

  return {
    deduction: useStandard ? standardDeduction : itemizedTotal,
    isStandard: useStandard,
    standardDeduction,
    itemizedTotal,
  };
}

/**
 * Calculate medical expense deduction (7.5% AGI threshold)
 */
function calculateMedicalDeduction(medicalExpenses: number, agi: number): number {
  const threshold = multiplyCents(agi, 0.075); // 7.5% of AGI
  return max0(medicalExpenses - threshold);
}

/**
 * Calculate income tax using regular brackets + preferential rates
 */
function calculateIncomeTax(input: FederalInput2025, taxableIncome: number) {
  // Identify qualified dividends and long-term capital gains
  const qualifiedDividends = input.income.dividends.qualified || 0;
  const longTermCapGains = Math.max(0, input.income.capGainsNet || 0); // Only positive LTCG get preferential rates
  const totalPreferential = qualifiedDividends + longTermCapGains;

  if (totalPreferential === 0 || taxableIncome <= 0) {
    // No preferential income - use regular tax brackets only
    return {
      regularTax: calculateRegularTax2025(taxableIncome, input.filingStatus),
      preferentialTax: 0,
      totalIncomeTax: calculateRegularTax2025(taxableIncome, input.filingStatus),
      capitalGainsDetails: null,
    };
  }

  // Calculate tax using IRS worksheet method
  const ordinaryIncome = Math.max(0, taxableIncome - totalPreferential);
  const ordinaryTax = calculateRegularTax2025(ordinaryIncome, input.filingStatus);

  const preferentialResult = computePreferentialRatesTax2025({
    filingStatus: input.filingStatus,
    taxableIncome,
    qualifiedDividendsAndLTCG: totalPreferential,
  });

  return {
    regularTax: ordinaryTax,
    preferentialTax: preferentialResult.preferentialTax,
    totalIncomeTax: ordinaryTax + preferentialResult.preferentialTax,
    capitalGainsDetails: preferentialResult,
  };
}

/**
 * Calculate Alternative Minimum Tax (AMT) - Form 6251
 */
function calculateAMT(
  input: FederalInput2025,
  agi: number,
  taxableIncome: number,
  deductionResult: { deduction: number; isStandard: boolean },
  regularTax: number
) {
  // Prepare itemized deduction details for AMT calculation
  const itemized = input.itemized;

  // Build AMT input structure
  const amtInput: AMTInput = {
    filingStatus: input.filingStatus,
    taxableIncome,
    regularTax,
    agi,
    isStandardDeduction: deductionResult.isStandard,
    standardDeductionAmount: deductionResult.isStandard ? deductionResult.deduction : 0,
    itemizedDeductions: {
      stateLocalTaxes: itemized.stateLocalTaxes || 0,
      medical: itemized.medical || 0,
      mortgageInterest: itemized.mortgageInterest || 0,
      charitable: itemized.charitable || 0,
      other: itemized.other || 0,
    },
    ...(input.amtItems && { amtItems: input.amtItems }),
  };

  // Compute AMT using the dedicated AMT module
  return computeAMT2025(amtInput);
}

/**
 * Calculate additional taxes (NIIT, Additional Medicare, AMT)
 */
function calculateAdditionalTaxes(
  input: FederalInput2025,
  agi: number,
  taxableIncome: number,
  deductionResult: { deduction: number; isStandard: boolean },
  regularTax: number,
  seTaxResult: SETaxResult,
  diagnostics: FederalDiagnostics2025
) {
  // Net Investment Income Tax (3.8%)
  const niitThreshold = NIIT_THRESHOLDS_2025[input.filingStatus];
  const investmentIncome = addCents(
    input.income.interest,
    input.income.dividends.ordinary,
    input.income.dividends.qualified,
    Math.max(0, input.income.capGainsNet || 0) // Only positive gains
  );
  let niit = 0;
  let niitBase = 0;
  if (agi > niitThreshold) {
    niitBase = Math.min(investmentIncome, agi - niitThreshold);
    if (niitBase > 0) {
      niit = multiplyCents(niitBase, 0.038);
    }
  }
  if (niit > 0) {
    pushWarning(diagnostics, 'CALC-W-002', {
      field: 'income.capGainsNet',
      context: { amount: formatCents(niitBase) },
      phase: 'additional-taxes',
    });
    pushWarning(diagnostics, 'FORM-W-007', {
      field: 'income.capGainsNet',
      phase: 'additional-taxes',
    });
  }

  // Additional Medicare Tax is already calculated in SE tax
  const medicareSurtax = seTaxResult.additionalMedicare || 0;
  if (medicareSurtax > 0) {
    const medicareBase = Math.round(medicareSurtax / 0.009);
    pushWarning(diagnostics, 'CALC-W-003', {
      field: 'income.wages',
      context: { amount: formatCents(medicareBase) },
      phase: 'additional-taxes',
    });
    pushWarning(diagnostics, 'FORM-W-006', { field: 'income.wages', phase: 'additional-taxes' });
  }

  // Alternative Minimum Tax (AMT) - Form 6251
  const amtResult = calculateAMT(input, agi, taxableIncome, deductionResult, regularTax);
  if (amtResult.amt > 0) {
    pushWarning(diagnostics, 'CALC-W-001', {
      field: 'additionalTaxes.amt',
      phase: 'additional-taxes',
    });
  }

  return {
    seTax: seTaxResult.totalSETax,
    niit,
    medicareSurtax,
    amt: amtResult.amt,
    amtDetails: amtResult,
  };
}

/**
 * Calculate federal tax credits using both new and existing credit modules
 */
function calculateCredits(
  input: FederalInput2025,
  agi: number,
  taxableIncome: number,
  taxBeforeCredits: number,
  diagnostics: FederalDiagnostics2025
): {
  credits: FederalResult2025['credits'];
  actc: number;
  aotcRefundable: number;
} {
  // Earned Income Tax Credit using new 2025 authoritative calculation
  const earnedIncome = addCents(
    input.income.wages,
    input.income.scheduleCNet // SE income
  );

  const investmentIncome = addCents(
    input.income.interest,
    input.income.dividends.ordinary,
    input.income.dividends.qualified,
    Math.max(0, input.income.capGainsNet || 0)
  );

  // Determine qualifying children count (convert from legacy dependents if needed)
  // Note: EITC has a maximum of 3 qualifying children per IRS rules
  let qualifyingChildrenCount: 0 | 1 | 2 | 3 = 0;
  if (input.qualifyingChildren && input.qualifyingChildren.length > 0) {
    // Use actual qualifying children array if available
    const count = input.qualifyingChildren.length;
    qualifyingChildrenCount = Math.min(3, count) as 0 | 1 | 2 | 3;
  } else if (input.dependents > 0) {
    // Fallback to dependents count (legacy support)
    // This is not ideal as not all dependents are qualifying children for EITC
    const count = input.dependents;
    qualifyingChildrenCount = Math.min(3, count) as 0 | 1 | 2 | 3;
  }

  // Calculate ages for EITC eligibility (childless taxpayers need age 25-64)
  const TAX_YEAR = 2025;
  const calculateAge = (birthDate: string | undefined): number | undefined => {
    if (!birthDate) return undefined;
    const parts = birthDate.split('-');
    const birthYear = parseInt(parts[0] || '0', 10);
    return TAX_YEAR - birthYear;
  };

  const primaryAge = calculateAge(input.primary?.birthDate);
  const spouseAge = calculateAge(input.spouse?.birthDate);

  const eitcResult = computeEITC2025({
    filingStatus: input.filingStatus,
    earnedIncome,
    agi,
    qualifyingChildren: qualifyingChildrenCount,
    investmentIncome,
    ...(primaryAge !== undefined && { primaryAge }),
    ...(spouseAge !== undefined && { spouseAge }),
  });

  // Child Tax Credit using existing advanced logic
  const ctcResult = calculateAdvancedCTC(input, agi, taxBeforeCredits);

  // Education credits using existing advanced logic
  const aotcResult = calculateAdvancedAOTC(input, agi);
  const llcResult = calculateAdvancedLLC(input, agi);

  // Prefer AOTC over LLC if both are available (mutual exclusion)
  const finalAOTC = aotcResult.aotc;
  const finalLLC = finalAOTC > 0 ? 0 : llcResult.llc;

  // Calculate Saver's Credit (Form 8880) - Retirement Savings Contributions Credit
  let saversCredit = 0;
  if (input.saversCreditInfo) {
    const saversCreditResult = computeSaversCredit2025({
      filingStatus: input.filingStatus,
      agi,
      taxpayerAge: input.saversCreditInfo.taxpayerAge,
      isTaxpayerStudent: input.saversCreditInfo.isTaxpayerStudent ?? false,
      isTaxpayerDependent: input.saversCreditInfo.isTaxpayerDependent ?? false,
      taxpayerContributions: input.saversCreditInfo.taxpayerContributions || 0,
      taxpayerDistributions: input.saversCreditInfo.taxpayerDistributions,
      ...(input.filingStatus === 'marriedJointly' &&
        input.saversCreditInfo.spouseAge && {
          spouseAge: input.saversCreditInfo.spouseAge,
          isSpouseStudent: input.saversCreditInfo.isSpouseStudent ?? false,
          isSpouseDependent: input.saversCreditInfo.isSpouseDependent ?? false,
          spouseContributions: input.saversCreditInfo.spouseContributions,
          spouseDistributions: input.saversCreditInfo.spouseDistributions,
        }),
    });
    saversCredit = saversCreditResult.saversCredit;
  }

  // Calculate Child and Dependent Care Credit (Form 2441)
  let childCareCredit = 0;
  if (input.childCareInfo) {
    const childCareCreditResult = computeChildCareCredit2025({
      filingStatus: input.filingStatus,
      agi,
      numberOfQualifyingPersons: input.childCareInfo.numberOfQualifyingPersons,
      careExpenses: input.childCareInfo.careExpenses || 0,
      taxpayerEarnedIncome: input.childCareInfo.taxpayerEarnedIncome || earnedIncome,
      ...(input.filingStatus === 'marriedJointly' && {
        spouseEarnedIncome: input.childCareInfo.spouseEarnedIncome,
        isSpouseStudent: input.childCareInfo.isSpouseStudent,
        isSpouseDisabled: input.childCareInfo.isSpouseDisabled,
      }),
    });
    childCareCredit = childCareCreditResult.childCareCredit;
  }

  // Calculate Foreign Tax Credit (Form 1116)
  let foreignTaxCredit = 0;
  if (input.foreignIncomeSources && input.foreignIncomeSources.length > 0) {
    const foreignTaxCreditResult = computeForeignTaxCredit2025({
      filingStatus: input.filingStatus,
      totalTaxableIncome: taxableIncome,
      usTaxBeforeCredits: taxBeforeCredits,
      foreignIncomeSources: input.foreignIncomeSources,
      useSimplifiedElection: input.foreignTaxCreditOptions?.useSimplifiedElection,
      priorYearCarryover: input.foreignTaxCreditOptions?.priorYearCarryover,
    });
    foreignTaxCredit = foreignTaxCreditResult.foreignTaxCredit;
  }

  // Calculate Adoption Credit (Form 8839)
  let adoptionCreditNonRefundable = 0;
  let adoptionCreditRefundable = 0;
  if (input.adoptedChildren && input.adoptedChildren.length > 0) {
    const adoptionCreditResult = computeAdoptionCredit2025({
      filingStatus: input.filingStatus,
      magi: agi, // Use AGI as MAGI (simplified - in real scenarios, MAGI may differ)
      taxBeforeCredits: taxBeforeCredits,
      adoptedChildren: input.adoptedChildren,
      priorYearCarryforward: input.adoptionCreditOptions?.priorYearCarryforward,
    });
    adoptionCreditNonRefundable = adoptionCreditResult.nonRefundableCredit;
    adoptionCreditRefundable = adoptionCreditResult.refundableCredit;
  }

  // Calculate Premium Tax Credit (Form 8962) - ACA marketplace subsidy
  let ptc = 0;
  let ptcRepayment = 0;
  if (input.form8962) {
    const ptcResult = calculatePTC({
      ...input.form8962,
      magi: agi,
      filingStatus: input.filingStatus,
    });

    if (ptcResult.isEligible) {
      // netPTC is positive for additional credit, negative for repayment
      if (ptcResult.netPTC > 0) {
        ptc = ptcResult.netPTC;
      } else {
        ptcRepayment = ptcResult.excessAPTCRepayment;
      }
    }
  }

  const creditsResult = {
    ctc: ctcResult.ctc,
    aotc: finalAOTC,
    llc: finalLLC,
    eitc: eitcResult.eitc,
    ftc: foreignTaxCredit,
    adoptionCreditNonRefundable,
    adoptionCreditRefundable,
    ptc,
    ptcRepayment,
    otherNonRefundable: addCents(saversCredit, childCareCredit),
    otherRefundable: addCents(ctcResult.additionalChildTaxCredit, aotcResult.refundableAOTC),
  };

  const baseCTC = ctcResult.eligibleChildren * CTC_2025.maxCredit;
  if (baseCTC > 0 && ctcResult.ctc < baseCTC) {
    const reduction = baseCTC - ctcResult.ctc;
    if (reduction > 0) {
      pushWarning(diagnostics, 'CREDIT-W-001', {
        field: 'credits.ctc',
        context: { amount: formatCents(reduction) },
        phase: 'credits',
      });
    }
  }

  if (eitcResult.disqualified) {
    pushWarning(diagnostics, 'CREDIT-W-002', {
      field: 'credits.eitc',
      message: 'Earned Income Tax Credit disqualified—review age, SSN, and investment income tests',
      phase: 'credits',
    });
  } else if (eitcResult.eitc > 0 && eitcResult.details.maxCredit > eitcResult.eitc) {
    const reduction = eitcResult.details.maxCredit - eitcResult.eitc;
    if (reduction > 0) {
      pushWarning(diagnostics, 'CREDIT-W-002', {
        field: 'credits.eitc',
        context: { amount: formatCents(reduction) },
        phase: 'credits',
      });
    }
  }

  return {
    credits: creditsResult,
    actc: ctcResult.additionalChildTaxCredit,
    aotcRefundable: aotcResult.refundableAOTC,
  };
}

/**
 * Calculate Qualified Business Income (QBI) Deduction - IRC §199A
 * Form 8995 (simplified) or Form 8995-A (complex)
 */
function calculateQBIDeduction(input: FederalInput2025, taxableIncomeBeforeQBI: number) {
  // If no QBI businesses or REIT/PTP income, no deduction
  const hasQBIBusinesses = input.qbiBusinesses && input.qbiBusinesses.length > 0;
  const hasREITPTP =
    input.qbiREITPTP &&
    ((input.qbiREITPTP.reitDividends || 0) > 0 || (input.qbiREITPTP.ptpIncome || 0) > 0);

  if (!hasQBIBusinesses && !hasREITPTP) {
    // No QBI deduction - return zero result
    return {
      taxableIncome: taxableIncomeBeforeQBI,
      taxableIncomeBeforeCapGains: taxableIncomeBeforeQBI,
      filingStatus: input.filingStatus,
      qbiThreshold: 0,
      qbiUpperThreshold: 0,
      isAboveThreshold: false,
      phaseInPercentage: 0,
      businesses: [],
      totalQBIComponent: 0,
      totalWithREITPTP: 0,
      overallLimitationAmount: 0,
      isLimitedByOverall: false,
      qbiDeduction: 0,
      formUsed: '8995' as const,
    };
  }

  // Calculate net capital gains for overall limitation
  // Net capital gains = positive capital gains only (not losses)
  const netCapitalGains = Math.max(0, input.income.capGainsNet || 0);

  // Build QBI input
  const qbiInput: QBIInput = {
    filingStatus: input.filingStatus,
    taxableIncome: taxableIncomeBeforeQBI,
    netCapitalGains,
    ...(input.qbiBusinesses && { businesses: input.qbiBusinesses }),
    ...(input.qbiREITPTP?.reitDividends && { reitDividends: input.qbiREITPTP.reitDividends }),
    ...(input.qbiREITPTP?.ptpIncome && { ptpIncome: input.qbiREITPTP.ptpIncome }),
  };

  // Compute QBI deduction
  return computeQBIDeduction2025(qbiInput);
}

/**
 * Collect input-related diagnostics before calculations
 * Performs comprehensive multi-field consistency validation
 */
function collectInputDiagnostics(
  input: FederalInput2025,
  diagnostics: FederalDiagnostics2025
): void {
  // === Filing Status Validations ===
  const marriedSeparatelyError = TaxInputValidator.validateMarriedSeparately(input);
  if (marriedSeparatelyError) {
    pushError(diagnostics, 'INPUT-E-001', {
      field: 'spouse',
      context: { field: 'spouse' },
      message: marriedSeparatelyError,
      phase: 'input-validation',
    });
  }

  const marriedJointlyError = TaxInputValidator.validateMarriedJointly(input);
  if (marriedJointlyError) {
    pushError(diagnostics, 'INPUT-E-001', {
      field: 'spouse',
      context: { field: 'spouse' },
      message: marriedJointlyError,
      phase: 'input-validation',
    });
  }

  const hohError = TaxInputValidator.validateHeadOfHousehold(input);
  if (hohError) {
    pushError(diagnostics, 'INPUT-E-001', {
      field: 'filingStatus',
      context: { field: 'filingStatus' },
      message: hohError,
      phase: 'input-validation',
    });
  }

  const singleStatusError = TaxInputValidator.validateSingleFilingStatus(input);
  if (singleStatusError) {
    pushError(diagnostics, 'INPUT-E-001', {
      field: 'filingStatus',
      context: { field: 'filingStatus' },
      message: singleStatusError,
      phase: 'input-validation',
    });
  }

  // === Dependents Consistency ===
  const dependentsConsistencyError = TaxInputValidator.validateDependentsConsistency(input);
  if (dependentsConsistencyError) {
    pushError(diagnostics, 'INPUT-E-001', {
      field: 'dependents',
      context: { field: 'dependents' },
      message: dependentsConsistencyError,
      phase: 'input-validation',
    });
  }

  // === Children Age Warnings ===
  const childAgeWarnings = TaxInputValidator.validateQualifyingChildrenAges(input);
  childAgeWarnings.forEach((message) => {
    pushWarning(diagnostics, 'CREDIT-W-006', {
      field: 'qualifyingChildren',
      message,
      phase: 'input-validation',
    });
  });

  // === Income Reasonableness ===
  const withholdingWarning = TaxInputValidator.validateWithholdingReasonableness(input);
  if (withholdingWarning) {
    pushWarning(diagnostics, 'INPUT-W-001', {
      field: 'payments.federalWithheld',
      message: withholdingWarning,
      phase: 'input-validation',
    });
  }

  const negativeIncomeWarnings = TaxInputValidator.validateNegativeIncome(input);
  negativeIncomeWarnings.forEach((message) => {
    pushWarning(diagnostics, 'INPUT-W-002', {
      field: 'income',
      message,
      phase: 'input-validation',
    });
  });

  // === Education Expenses Consistency ===
  const educationConsistencyWarning = TaxInputValidator.validateEducationExpensesConsistency(input);
  if (educationConsistencyWarning) {
    pushWarning(diagnostics, 'INPUT-W-003', {
      field: 'educationExpenses',
      message: educationConsistencyWarning,
      phase: 'input-validation',
    });
  }

  // === QBI Consistency ===
  const qbiConsistencyWarning = TaxInputValidator.validateQBIConsistency(input);
  if (qbiConsistencyWarning) {
    pushWarning(diagnostics, 'INPUT-W-004', {
      field: 'qbiBusinesses',
      message: qbiConsistencyWarning,
      phase: 'input-validation',
    });
  }

  // === Itemized Deductions Reasonableness ===
  const itemizedWarnings = TaxInputValidator.validateItemizedDeductionsReasonableness(input);
  itemizedWarnings.forEach((message) => {
    pushWarning(diagnostics, 'INPUT-W-005', {
      field: 'itemized',
      message,
      phase: 'input-validation',
    });
  });
}

interface DiagnosticOptions {
  field?: string;
  context?: Record<string, unknown>;
  message?: string;
  phase?: import('../../types').CalculationPhase;
}

function pushWarning(
  diagnostics: FederalDiagnostics2025,
  code: DiagnosticCode,
  options: DiagnosticOptions = {}
): void {
  addWarning(diagnostics, code, options.context, options.field, options.phase);
  if (options.message) {
    const last = diagnostics.warnings[diagnostics.warnings.length - 1];
    if (last && last.code === code) {
      last.message = options.message;
    }
  }
}

function pushError(
  diagnostics: FederalDiagnostics2025,
  code: DiagnosticCode,
  options: DiagnosticOptions = {}
): void {
  addError(diagnostics, code, options.context, options.field, options.phase);
  if (options.message) {
    const last = diagnostics.errors[diagnostics.errors.length - 1];
    if (last && last.code === code) {
      last.message = options.message;
    }
  }
}
