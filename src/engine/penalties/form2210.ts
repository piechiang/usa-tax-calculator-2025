/**
 * Form 2210: Underpayment of Estimated Tax Penalty
 *
 * Calculates penalty for not paying enough tax throughout the year via
 * withholding or estimated tax payments.
 *
 * Key concepts:
 * - Required annual payment: Lesser of 90% of current year tax or 100%/110% of prior year
 * - Safe harbors: No penalty if certain conditions met
 * - Quarterly installments: Penalty calculated per quarter
 * - Interest rate: IRS short-term rate + 3%
 *
 * @see https://www.irs.gov/forms-pubs/about-form-2210
 */

import type { FilingStatus } from '../types';

/**
 * Form 2210 input
 */
export interface Form2210Input {
  /** Current year total tax liability (Form 1040, Line 24) */
  currentYearTax: number; // cents

  /** Prior year AGI */
  priorYearAGI: number; // cents

  /** Prior year total tax (from prior year Form 1040, Line 24) */
  priorYearTax: number; // cents

  /** Current year AGI */
  currentYearAGI: number; // cents

  /** Filing status */
  filingStatus: FilingStatus;

  /** Federal withholding */
  withholding: number; // cents

  /** Estimated tax payments by quarter */
  estimatedPayments: {
    q1: number; // Due Apr 15
    q2: number; // Due Jun 15
    q3: number; // Due Sep 15
    q4: number; // Due Jan 15 (following year)
  }; // cents

  /** Whether taxpayer is a farmer or fisherman (2/3 gross income rule) */
  isFarmerFisherman?: boolean;

  /** Whether to use annualized income installment method */
  useAnnualizedMethod?: boolean;
}

/**
 * Form 2210 result
 */
export interface Form2210Result {
  /** Total penalty owed */
  totalPenalty: number; // cents

  /** Whether penalty applies */
  penaltyApplies: boolean;

  /** Reason penalty doesn't apply (if applicable) */
  exceptionReason?: string;

  /** Required annual payment */
  requiredAnnualPayment: number; // cents

  /** Total payments made */
  totalPayments: number; // cents

  /** Underpayment amount */
  underpayment: number; // cents

  /** Penalty by quarter */
  quarterlyPenalties: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  }; // cents

  /** Detailed calculation breakdown */
  details: {
    priorYearSafeHarbor: number; // 100% or 110% of prior year
    currentYearSafeHarbor: number; // 90% of current year
    requiredInstallment: number; // Per quarter
    shortTermRate: number; // IRS rate (decimal)
  };
}

/**
 * IRS short-term interest rates by quarter (2025 projected)
 * Updated quarterly - these are estimates
 */
const INTEREST_RATES_2025 = {
  q1: 0.08, // 8% annual
  q2: 0.08,
  q3: 0.08,
  q4: 0.08,
};

/**
 * High-income threshold for 110% prior year rule
 */
const HIGH_INCOME_THRESHOLD = 15000000; // $150,000

/**
 * Calculate Form 2210 underpayment penalty
 */
export function calculateForm2210(input: Form2210Input): Form2210Result {
  // Check safe harbor exceptions first
  const safeHarborCheck = checkSafeHarbors(input);
  if (safeHarborCheck.exempt) {
    return {
      totalPenalty: 0,
      penaltyApplies: false,
      exceptionReason: safeHarborCheck.reason,
      requiredAnnualPayment: 0,
      totalPayments:
        input.withholding +
        input.estimatedPayments.q1 +
        input.estimatedPayments.q2 +
        input.estimatedPayments.q3 +
        input.estimatedPayments.q4,
      underpayment: 0,
      quarterlyPenalties: { q1: 0, q2: 0, q3: 0, q4: 0 },
      details: {
        priorYearSafeHarbor: 0,
        currentYearSafeHarbor: 0,
        requiredInstallment: 0,
        shortTermRate: 0,
      },
    };
  }

  // Calculate required annual payment
  const priorYearPercent =
    input.priorYearAGI > HIGH_INCOME_THRESHOLD ? 1.10 : 1.00;
  const priorYearSafeHarbor = Math.round(input.priorYearTax * priorYearPercent);
  const currentYearSafeHarbor = Math.round(input.currentYearTax * 0.90);

  const requiredAnnualPayment = Math.min(
    priorYearSafeHarbor,
    currentYearSafeHarbor
  );

  // Required quarterly installment (25% each)
  const requiredInstallment = Math.round(requiredAnnualPayment / 4);

  // Allocate withholding evenly across quarters
  const withholdingPerQuarter = Math.round(input.withholding / 4);

  // Calculate payments by quarter (cumulative)
  const paymentsByQuarter = {
    q1: withholdingPerQuarter + input.estimatedPayments.q1,
    q2: withholdingPerQuarter + input.estimatedPayments.q2,
    q3: withholdingPerQuarter + input.estimatedPayments.q3,
    q4: withholdingPerQuarter + input.estimatedPayments.q4,
  };

  // Calculate underpayment by quarter
  const underpaymentByQuarter = {
    q1: Math.max(0, requiredInstallment - paymentsByQuarter.q1),
    q2: Math.max(0, requiredInstallment - paymentsByQuarter.q2),
    q3: Math.max(0, requiredInstallment - paymentsByQuarter.q3),
    q4: Math.max(0, requiredInstallment - paymentsByQuarter.q4),
  };

  // Calculate penalty by quarter
  // Penalty = Underpayment × Rate × (Days late / 365)
  // Simplified: Use full quarter periods
  const quarterlyPenalties = {
    q1: calculateQuarterPenalty(
      underpaymentByQuarter.q1,
      INTEREST_RATES_2025.q1,
      3 // 3 quarters of penalty (Apr to Dec)
    ),
    q2: calculateQuarterPenalty(
      underpaymentByQuarter.q2,
      INTEREST_RATES_2025.q2,
      2 // 2 quarters (Jun to Dec)
    ),
    q3: calculateQuarterPenalty(
      underpaymentByQuarter.q3,
      INTEREST_RATES_2025.q3,
      1 // 1 quarter (Sep to Dec)
    ),
    q4: calculateQuarterPenalty(
      underpaymentByQuarter.q4,
      INTEREST_RATES_2025.q4,
      0 // No penalty (due after year end)
    ),
  };

  const totalPenalty =
    quarterlyPenalties.q1 +
    quarterlyPenalties.q2 +
    quarterlyPenalties.q3 +
    quarterlyPenalties.q4;

  const totalPayments =
    input.withholding +
    input.estimatedPayments.q1 +
    input.estimatedPayments.q2 +
    input.estimatedPayments.q3 +
    input.estimatedPayments.q4;

  const totalUnderpayment =
    underpaymentByQuarter.q1 +
    underpaymentByQuarter.q2 +
    underpaymentByQuarter.q3 +
    underpaymentByQuarter.q4;

  return {
    totalPenalty,
    penaltyApplies: totalPenalty > 0,
    requiredAnnualPayment,
    totalPayments,
    underpayment: totalUnderpayment,
    quarterlyPenalties,
    details: {
      priorYearSafeHarbor,
      currentYearSafeHarbor,
      requiredInstallment,
      shortTermRate: INTEREST_RATES_2025.q1,
    },
  };
}

/**
 * Calculate penalty for a single quarter
 */
function calculateQuarterPenalty(
  underpayment: number,
  annualRate: number,
  quartersLate: number
): number {
  if (underpayment === 0 || quartersLate === 0) {
    return 0;
  }

  // Penalty = Underpayment × Rate × (Quarters / 4)
  const penalty = Math.round(underpayment * annualRate * (quartersLate / 4));
  return penalty;
}

/**
 * Check safe harbor exceptions
 */
function checkSafeHarbors(input: Form2210Input): {
  exempt: boolean;
  reason?: string;
} {
  // Exception 1: Tax liability under $1,000
  if (input.currentYearTax < 100000) {
    // $1,000
    return {
      exempt: true,
      reason: 'Tax liability less than $1,000',
    };
  }

  // Exception 2: No tax liability in prior year (and full-year US citizen/resident)
  if (input.priorYearTax === 0) {
    return {
      exempt: true,
      reason: 'No tax liability in prior year',
    };
  }

  // Exception 3: Total payments >= 90% of current year tax
  const totalPayments =
    input.withholding +
    input.estimatedPayments.q1 +
    input.estimatedPayments.q2 +
    input.estimatedPayments.q3 +
    input.estimatedPayments.q4;

  const currentYear90Percent = Math.round(input.currentYearTax * 0.90);
  if (totalPayments >= currentYear90Percent) {
    return {
      exempt: true,
      reason: 'Paid at least 90% of current year tax',
    };
  }

  // Exception 4: Total payments >= 100% or 110% of prior year tax
  const priorYearPercent =
    input.priorYearAGI > HIGH_INCOME_THRESHOLD ? 1.10 : 1.00;
  const priorYearSafeHarbor = Math.round(input.priorYearTax * priorYearPercent);

  if (totalPayments >= priorYearSafeHarbor) {
    const pctFormatted = priorYearPercent === 1.00 ? '100' : '110';
    return {
      exempt: true,
      reason: `Paid at least ${pctFormatted}% of prior year tax`,
    };
  }

  // Exception 5: Farmer/fisherman special rule (2/3 of gross income)
  if (input.isFarmerFisherman) {
    // Special rule: Pay 2/3 by Jan 15 OR file return by Mar 1
    // Simplified: Assume met if flagged
    return {
      exempt: true,
      reason: 'Farmer/fisherman exception',
    };
  }

  // No exception applies
  return { exempt: false };
}

/**
 * Format penalty for display
 */
export function formatPenaltyResult(result: Form2210Result): string {
  if (!result.penaltyApplies) {
    return `No penalty applies: ${result.exceptionReason}`;
  }

  return `
Form 2210: Underpayment Penalty
================================

Required Annual Payment:  $${(result.requiredAnnualPayment / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Total Payments Made:      $${(result.totalPayments / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Underpayment:             $${(result.underpayment / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}

Quarterly Breakdown:
  Q1 Penalty: $${(result.quarterlyPenalties.q1 / 100).toFixed(2)}
  Q2 Penalty: $${(result.quarterlyPenalties.q2 / 100).toFixed(2)}
  Q3 Penalty: $${(result.quarterlyPenalties.q3 / 100).toFixed(2)}
  Q4 Penalty: $${(result.quarterlyPenalties.q4 / 100).toFixed(2)}

TOTAL PENALTY: $${(result.totalPenalty / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}

Interest Rate: ${(result.details.shortTermRate * 100).toFixed(2)}%
  `.trim();
}
