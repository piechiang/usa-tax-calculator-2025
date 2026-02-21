/**
 * Form 8962: Premium Tax Credit (PTC)
 *
 * Calculates the Premium Tax Credit for health insurance purchased through
 * the ACA Marketplace (Healthcare.gov or state exchanges).
 *
 * Key concepts:
 * - FPL: Federal Poverty Level (varies by household size and state)
 * - SLCSP: Second Lowest Cost Silver Plan (benchmark plan)
 * - APTC: Advance Premium Tax Credit (paid during year)
 * - Reconciliation: Actual credit vs. advance payments
 *
 * @see https://www.irs.gov/forms-pubs/about-form-8962
 * @see https://www.healthcare.gov/glossary/premium-tax-credit/
 */

import type { FilingStatus } from '../types';

/**
 * Form 8962 input
 */
export interface Form8962Input {
  /** Modified Adjusted Gross Income (MAGI) for ACA */
  magi: number; // cents

  /** Filing status */
  filingStatus: FilingStatus;

  /** Household size (taxpayer + spouse + dependents) */
  householdSize: number;

  /** State of residence (for FPL determination) */
  state: string; // 2-letter code

  /** Coverage months (array of 12 booleans, Jan-Dec) */
  coverageMonths: boolean[];

  /** Second Lowest Cost Silver Plan (SLCSP) premium by month */
  slcspPremium: number[]; // cents, 12 entries

  /** Actual premium paid by taxpayer (after APTC) by month */
  actualPremiumPaid: number[]; // cents, 12 entries

  /** Advance Premium Tax Credit received by month */
  advancePTC: number[]; // cents, 12 entries

  /** Whether taxpayer can be claimed as dependent */
  canBeClaimedAsDependent?: boolean;

  /** Whether married filing separately with exceptions */
  mfsWithExceptions?: boolean;
}

/**
 * Form 8962 result
 */
export interface Form8962Result {
  /** Net Premium Tax Credit (positive = credit, negative = repayment) */
  netPTC: number; // cents

  /** Total PTC allowed for the year */
  totalPTCAllowed: number; // cents

  /** Total advance PTC received */
  totalAdvancePTC: number; // cents

  /** Excess advance PTC to repay (if negative net) */
  excessAPTCRepayment: number; // cents

  /** Repayment limitation applied (if any) */
  repaymentLimitation: number; // cents

  /** Whether taxpayer is eligible for PTC */
  isEligible: boolean;

  /** Ineligibility reason if not eligible */
  ineligibilityReason?: string;

  /** Household income as % of FPL */
  fplPercentage: number; // decimal (e.g., 2.00 = 200%)

  /** Federal Poverty Level for household */
  fpl: number; // cents

  /** Monthly calculation details */
  monthlyDetails: Array<{
    month: number; // 1-12
    covered: boolean;
    slcsp: number;
    contributionAmount: number; // Expected contribution
    ptcAmount: number; // PTC for this month
    advancePTC: number;
  }>;
}

/**
 * Federal Poverty Levels for 2025 (continental US)
 * Source: HHS Poverty Guidelines
 * https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 */
const FPL_2025_CONTINENTAL = [
  0, // index 0 unused
  1575000, // 1 person: $15,750
  2127500, // 2: $21,275
  2680000, // 3: $26,800
  3232500, // 4: $32,325
  3785000, // 5: $37,850
  4337500, // 6: $43,375
  4890000, // 7: $48,900
  5442500, // 8: $54,425
];

// Additional amount per person over 8
const FPL_2025_PER_ADDITIONAL = 552500; // $5,525

// Alaska multiplier
const FPL_ALASKA_MULTIPLIER = 1.25;

// Hawaii multiplier
const FPL_HAWAII_MULTIPLIER = 1.15;

/**
 * ACA affordability percentages by FPL level (2025)
 * Income as % of FPL → Expected contribution as % of income
 */
const AFFORDABILITY_TABLE_2025 = [
  { fplMin: 0.0, fplMax: 1.5, contribution: 0.0 }, // 0-150% FPL: $0
  { fplMin: 1.5, fplMax: 2.0, contribution: 0.0 }, // 150-200%: $0
  { fplMin: 2.0, fplMax: 2.5, contribution: 0.02 }, // 200-250%: 2%
  { fplMin: 2.5, fplMax: 3.0, contribution: 0.04 }, // 250-300%: 4%
  { fplMin: 3.0, fplMax: 4.0, contribution: 0.06 }, // 300-400%: 6%
  { fplMin: 4.0, fplMax: 9.99, contribution: 0.085 }, // 400%+: 8.5%
];

/**
 * Repayment limitation by income level (% of FPL) and filing status
 * 2025 amounts
 */
const REPAYMENT_CAPS_2025 = {
  single: [
    { fplMax: 2.0, cap: 35000 }, // < 200% FPL: $350
    { fplMax: 3.0, cap: 90000 }, // 200-300%: $900
    { fplMax: 4.0, cap: 150000 }, // 300-400%: $1,500
    { fplMax: Infinity, cap: Infinity }, // 400%+: No cap
  ],
  other: [
    // MFJ, HOH, QSS
    { fplMax: 2.0, cap: 70000 }, // < 200% FPL: $700
    { fplMax: 3.0, cap: 180000 }, // 200-300%: $1,800
    { fplMax: 4.0, cap: 300000 }, // 300-400%: $3,000
    { fplMax: Infinity, cap: Infinity }, // 400%+: No cap
  ],
};

/**
 * Calculate Premium Tax Credit
 */
export function calculatePTC(input: Form8962Input): Form8962Result {
  // Check eligibility
  const eligibilityCheck = checkEligibility(input);
  if (!eligibilityCheck.eligible) {
    return {
      netPTC: 0,
      totalPTCAllowed: 0,
      totalAdvancePTC: 0,
      excessAPTCRepayment: 0,
      repaymentLimitation: 0,
      isEligible: false,
      ineligibilityReason: eligibilityCheck.reason,
      fplPercentage: 0,
      fpl: 0,
      monthlyDetails: [],
    };
  }

  // Calculate FPL
  const fpl = calculateFPL(input.householdSize, input.state);
  const fplPercentage = input.magi / fpl;

  // Get contribution percentage
  const contributionRate = getContributionRate(fplPercentage);

  // Calculate monthly PTC
  const monthlyDetails = [];
  let totalPTCAllowed = 0;
  let totalAdvancePTC = 0;

  for (let month = 0; month < 12; month++) {
    const covered = input.coverageMonths[month] || false;
    const slcsp = input.slcspPremium[month] || 0;
    const advancePTC = input.advancePTC[month] || 0;

    if (!covered) {
      monthlyDetails.push({
        month: month + 1,
        covered: false,
        slcsp: 0,
        contributionAmount: 0,
        ptcAmount: 0,
        advancePTC,
      });
      totalAdvancePTC += advancePTC;
      continue;
    }

    // Monthly contribution = (Annual MAGI × contribution rate) / 12
    const monthlyContribution = Math.round((input.magi * contributionRate) / 12);

    // PTC = SLCSP - contribution (minimum $0)
    const ptcAmount = Math.max(0, slcsp - monthlyContribution);

    monthlyDetails.push({
      month: month + 1,
      covered: true,
      slcsp,
      contributionAmount: monthlyContribution,
      ptcAmount,
      advancePTC,
    });

    totalPTCAllowed += ptcAmount;
    totalAdvancePTC += advancePTC;
  }

  // Reconciliation
  let netPTC = totalPTCAllowed - totalAdvancePTC;
  let excessAPTCRepayment = 0;

  // Determine repayment cap (even if no repayment owed)
  const repaymentCap = getRepaymentCap(fplPercentage, input.filingStatus);
  const repaymentLimitation = repaymentCap;

  if (netPTC < 0) {
    // Repayment owed
    const rawRepayment = -netPTC;

    if (repaymentCap < Infinity) {
      excessAPTCRepayment = Math.min(rawRepayment, repaymentCap);
      netPTC = -excessAPTCRepayment;
    } else {
      excessAPTCRepayment = rawRepayment;
    }
  }

  return {
    netPTC,
    totalPTCAllowed,
    totalAdvancePTC,
    excessAPTCRepayment,
    repaymentLimitation,
    isEligible: true,
    fplPercentage,
    fpl,
    monthlyDetails,
  };
}

/**
 * Check PTC eligibility
 */
function checkEligibility(input: Form8962Input): {
  eligible: boolean;
  reason?: string;
} {
  // Cannot be claimed as dependent
  if (input.canBeClaimedAsDependent) {
    return {
      eligible: false,
      reason: 'Taxpayer can be claimed as dependent',
    };
  }

  // MFS generally ineligible (unless exceptions apply)
  if (input.filingStatus === 'marriedSeparately' && !input.mfsWithExceptions) {
    return {
      eligible: false,
      reason: 'Married filing separately without domestic abuse/abandonment exception',
    };
  }

  // Must have coverage for at least one month
  const hasCoverage = input.coverageMonths.some((m) => m);
  if (!hasCoverage) {
    return {
      eligible: false,
      reason: 'No marketplace coverage during the year',
    };
  }

  // Household size must be at least 1
  if (input.householdSize < 1) {
    return {
      eligible: false,
      reason: 'Invalid household size',
    };
  }

  return { eligible: true };
}

/**
 * Calculate Federal Poverty Level for household
 */
function calculateFPL(householdSize: number, state: string): number {
  let baseFPL: number;

  if (householdSize <= 8) {
    baseFPL = FPL_2025_CONTINENTAL[householdSize]!;
  } else {
    baseFPL = FPL_2025_CONTINENTAL[8]! + (householdSize - 8) * FPL_2025_PER_ADDITIONAL;
  }

  // Apply state multiplier
  if (state === 'AK') {
    return Math.round(baseFPL * FPL_ALASKA_MULTIPLIER);
  } else if (state === 'HI') {
    return Math.round(baseFPL * FPL_HAWAII_MULTIPLIER);
  }

  return baseFPL;
}

/**
 * Get contribution rate based on FPL percentage
 */
function getContributionRate(fplPercentage: number): number {
  for (const tier of AFFORDABILITY_TABLE_2025) {
    if (fplPercentage >= tier.fplMin && fplPercentage < tier.fplMax) {
      return tier.contribution;
    }
  }

  // Above 400% FPL
  return 0.085; // 8.5% cap
}

/**
 * Get repayment cap based on FPL percentage and filing status
 */
function getRepaymentCap(fplPercentage: number, filingStatus: FilingStatus): number {
  const caps = filingStatus === 'single' ? REPAYMENT_CAPS_2025.single : REPAYMENT_CAPS_2025.other;

  for (const tier of caps) {
    if (fplPercentage < tier.fplMax) {
      return tier.cap;
    }
  }

  return Infinity;
}

/**
 * Format PTC result for display
 */
export function formatPTCResult(result: Form8962Result): string {
  if (!result.isEligible) {
    return `Not eligible for Premium Tax Credit: ${result.ineligibilityReason}`;
  }

  const fplPct = (result.fplPercentage * 100).toFixed(0);

  return `
Form 8962: Premium Tax Credit
==============================

Household Income: ${fplPct}% of Federal Poverty Level
FPL: $${(result.fpl / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}

Total PTC Allowed:        $${(result.totalPTCAllowed / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Advance PTC Received:     $${(result.totalAdvancePTC / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}

${result.netPTC >= 0 ? 'Additional Credit:' : 'Repayment Owed:'}        $${Math.abs(result.netPTC / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}

${result.repaymentLimitation > 0 ? `Repayment Cap Applied:   $${(result.repaymentLimitation / 100).toFixed(2)}` : ''}

Monthly Breakdown:
${result.monthlyDetails
  .filter((m) => m.covered)
  .map(
    (m) =>
      `  ${monthName(m.month)}: SLCSP $${(m.slcsp / 100).toFixed(2)} - Contribution $${(m.contributionAmount / 100).toFixed(2)} = PTC $${(m.ptcAmount / 100).toFixed(2)}`
  )
  .join('\n')}
  `.trim();
}

function monthName(month: number): string {
  const names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return names[month - 1] || '';
}
