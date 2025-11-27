/**
 * Adoption Credit (Form 8839) Calculation
 *
 * The Adoption Credit allows taxpayers to claim a credit for qualified adoption
 * expenses paid to adopt an eligible child. The credit helps offset the costs
 * of domestic and foreign adoptions.
 *
 * Key Rules (2025):
 * - Maximum credit: $17,280 per eligible child
 * - Partially refundable: Up to $5,000 refundable (new for 2025 under OBBBA)
 * - Income phase-out: $259,190 - $299,190 MAGI
 * - Carryforward: Unused credits carry forward 5 years
 * - Special needs adoption: Full credit even with $0 expenses
 * - Employer exclusion: Up to $17,280 per child (reduces qualified expenses)
 *
 * Timing Rules:
 * - Domestic: Expenses claimed year after payment (unless finalized same year)
 * - Foreign: All expenses claimed in year adoption becomes final
 *
 * Sources:
 * - IRS Form 8839 and Instructions (2024/2025)
 * - One Big Beautiful Bill Act (OBBBA) - July 2025
 * - IRC Section 23 (Adoption Expenses)
 *
 * @module credits/adoptionCredit
 */

import { FilingStatus } from '../types';
import { addCents, max0, multiplyCents, subtractCents } from '../util/money';

/**
 * 2025 Adoption Credit constants
 */
export const ADOPTION_CREDIT_2025 = {
  /** Maximum credit per eligible child */
  maxCredit: 1728000, // $17,280 in cents

  /** Refundable portion of credit (new for 2025 under OBBBA) */
  refundablePortion: 500000, // $5,000 in cents

  /** MAGI phase-out begins */
  phaseOutStart: 25919000, // $259,190 in cents

  /** MAGI phase-out ends (credit fully eliminated) */
  phaseOutEnd: 29919000, // $299,190 in cents

  /** Carryforward period in years */
  carryforwardYears: 5,

  /** Maximum employer-provided adoption assistance exclusion */
  maxEmployerExclusion: 1728000, // $17,280 in cents
} as const;

/**
 * Type of adoption
 */
export type AdoptionType = 'domestic' | 'foreign';

/**
 * Status of adoption for a specific child
 */
export type AdoptionStatus =
  | 'pending'         // Not yet finalized
  | 'finalized'       // Adoption finalized in current year
  | 'attempted';      // Domestic adoption that didn't finalize (still eligible)

/**
 * Information about a single adopted or eligible child
 */
export interface AdoptedChild {
  /** Child's name (optional for privacy) */
  name?: string;

  /** Child's taxpayer identification number (SSN or ATIN) */
  tin?: string;

  /** Type of adoption */
  adoptionType: AdoptionType;

  /** Current status of adoption */
  adoptionStatus: AdoptionStatus;

  /** Is this a special needs child? */
  isSpecialNeeds: boolean;

  /** Year adoption became final (if finalized) */
  yearFinalized?: number;

  /** Qualified adoption expenses paid in current year (cents) */
  currentYearExpenses: number;

  /** Qualified adoption expenses paid in prior years (cents) */
  priorYearsExpenses: number;

  /** Employer-provided adoption assistance received (cents) */
  employerAssistance: number;

  /** Amount already claimed in prior years for this child (cents) */
  priorYearCreditsClaimed: number;

  /** Is this child a U.S. citizen or resident? */
  isUsCitizenOrResident?: boolean;
}

/**
 * Input for Adoption Credit calculation
 */
export interface AdoptionCreditInput {
  /** Filing status */
  filingStatus: FilingStatus;

  /** Modified Adjusted Gross Income (MAGI) - cents */
  magi: number;

  /** Tax liability before credits (for non-refundable limit) - cents */
  taxBeforeCredits: number;

  /** Information about each adopted child */
  adoptedChildren: AdoptedChild[];

  /** Prior year adoption credit carryforward - cents */
  priorYearCarryforward?: number;
}

/**
 * Detailed result for a single child
 */
export interface ChildAdoptionCreditDetail {
  /** Child identifier (name or index) */
  childId: string;

  /** Total qualified expenses for this child */
  totalQualifiedExpenses: number;

  /** Expenses eligible for credit after exclusions */
  eligibleExpenses: number;

  /** Credit amount before phase-out */
  creditBeforePhaseout: number;

  /** Credit amount after phase-out */
  creditAfterPhaseout: number;

  /** Is this a special needs adoption? */
  isSpecialNeeds: boolean;

  /** Was this child eligible for credit this year? */
  isEligible: boolean;

  /** Reason if not eligible */
  ineligibilityReason?: string;
}

/**
 * Result from Adoption Credit calculation
 */
export interface AdoptionCreditResult {
  /** Total non-refundable adoption credit (cents) */
  nonRefundableCredit: number;

  /** Total refundable adoption credit (cents) - new for 2025 */
  refundableCredit: number;

  /** Total adoption credit (non-refundable + refundable) */
  totalAdoptionCredit: number;

  /** Amount of prior year carryforward used (cents) */
  carryforwardUsed: number;

  /** Unused credit to carry forward to next year (cents) */
  unusedCreditCarryforward: number;

  /** Employer-provided adoption assistance exclusion (cents) */
  employerAssistanceExclusion: number;

  /** Details for each child */
  childDetails: ChildAdoptionCreditDetail[];

  /** Was phase-out applied? */
  wasPhaseoutApplied: boolean;

  /** Phase-out percentage (0.0 to 1.0) */
  phaseoutPercentage: number;

  /** Notes and warnings */
  notes: string[];
}

/**
 * Calculate phase-out reduction for adoption credit
 *
 * Phase-out formula:
 * - No reduction if MAGI ≤ $259,190
 * - Full elimination if MAGI ≥ $299,190
 * - Proportional reduction in between
 *
 * Reduction = Credit × ((MAGI - $259,190) / $40,000)
 */
function calculatePhaseout(magi: number, creditBeforePhaseout: number): {
  creditAfterPhaseout: number;
  phaseoutPercentage: number;
} {
  const { phaseOutStart, phaseOutEnd } = ADOPTION_CREDIT_2025;

  // No phase-out if below threshold
  if (magi <= phaseOutStart) {
    return {
      creditAfterPhaseout: creditBeforePhaseout,
      phaseoutPercentage: 0,
    };
  }

  // Full phase-out if above threshold
  if (magi >= phaseOutEnd) {
    return {
      creditAfterPhaseout: 0,
      phaseoutPercentage: 1.0,
    };
  }

  // Partial phase-out
  const phaseOutRange = phaseOutEnd - phaseOutStart; // $40,000
  const excessMagi = magi - phaseOutStart;
  const phaseoutPercentage = excessMagi / phaseOutRange;

  const reduction = multiplyCents(creditBeforePhaseout, phaseoutPercentage);
  const creditAfterPhaseout = max0(subtractCents(creditBeforePhaseout, reduction));

  return {
    creditAfterPhaseout,
    phaseoutPercentage,
  };
}

/**
 * Calculate qualified expenses for a single child
 *
 * For special needs children: Full credit regardless of expenses
 * For others: Expenses limited to maximum credit amount
 * Expenses reduced by employer assistance
 */
function calculateChildCredit(
  child: AdoptedChild,
  magi: number,
  taxYear: number = 2025
): ChildAdoptionCreditDetail {
  const { maxCredit } = ADOPTION_CREDIT_2025;
  const notes: string[] = [];

  // Check eligibility based on adoption type and status
  let isEligible = true;
  let ineligibilityReason: string | undefined;

  // Foreign adoptions must be finalized
  if (child.adoptionType === 'foreign' && child.adoptionStatus !== 'finalized') {
    isEligible = false;
    ineligibilityReason = 'Foreign adoption not yet finalized';
  }

  // Domestic adoptions can be pending or attempted
  if (child.adoptionType === 'domestic' && child.adoptionStatus === 'pending') {
    // Expenses paid in prior year can be claimed in current year
    // This is eligible if we have prior year expenses
    if (child.priorYearsExpenses === 0 && child.currentYearExpenses === 0) {
      isEligible = false;
      ineligibilityReason = 'No qualified expenses for domestic pending adoption';
    }
  }

  if (!isEligible) {
    return {
      childId: child.name || `Child ${child.tin || 'Unknown'}`,
      totalQualifiedExpenses: 0,
      eligibleExpenses: 0,
      creditBeforePhaseout: 0,
      creditAfterPhaseout: 0,
      isSpecialNeeds: child.isSpecialNeeds,
      isEligible: false,
      ineligibilityReason,
    };
  }

  // Calculate total qualified expenses
  let totalQualifiedExpenses: number;

  if (child.adoptionType === 'foreign' && child.adoptionStatus === 'finalized') {
    // Foreign adoptions: Combine all expenses from all years when finalized
    totalQualifiedExpenses = addCents(
      child.currentYearExpenses,
      child.priorYearsExpenses
    );
  } else if (child.adoptionType === 'domestic') {
    // Domestic adoptions: Use timing rules
    if (child.adoptionStatus === 'finalized') {
      // If finalized this year, include current year expenses
      // Plus prior year expenses that are now claimable
      totalQualifiedExpenses = addCents(
        child.currentYearExpenses,
        child.priorYearsExpenses
      );
    } else {
      // Pending/attempted: Only prior year expenses are claimable now
      totalQualifiedExpenses = child.priorYearsExpenses;
    }
  } else {
    totalQualifiedExpenses = 0;
  }

  // Reduce by employer assistance (excludable amount)
  const eligibleExpenses = max0(
    subtractCents(totalQualifiedExpenses, child.employerAssistance)
  );

  // For special needs children: Full credit even if expenses are zero
  let creditBeforePhaseout: number;

  if (child.isSpecialNeeds && child.adoptionStatus === 'finalized') {
    // Special needs get full credit minus any prior year credits claimed
    creditBeforePhaseout = max0(
      subtractCents(maxCredit, child.priorYearCreditsClaimed)
    );
    notes.push('Special needs adoption - full credit allowed regardless of expenses');
  } else {
    // Regular adoption: Credit = min(expenses, max credit - prior credits)
    const maxAllowable = max0(
      subtractCents(maxCredit, child.priorYearCreditsClaimed)
    );
    creditBeforePhaseout = Math.min(eligibleExpenses, maxAllowable);
  }

  // Apply phase-out
  const { creditAfterPhaseout } = calculatePhaseout(magi, creditBeforePhaseout);

  return {
    childId: child.name || `Child ${child.tin || 'Unknown'}`,
    totalQualifiedExpenses,
    eligibleExpenses,
    creditBeforePhaseout,
    creditAfterPhaseout,
    isSpecialNeeds: child.isSpecialNeeds,
    isEligible: true,
  };
}

/**
 * Compute Adoption Credit (Form 8839) for 2025
 *
 * Calculates both non-refundable and refundable portions of the adoption credit,
 * applies income phase-out, and handles carryforward of unused credits.
 *
 * @param input - Adoption credit input including MAGI, children, and tax info
 * @returns Detailed adoption credit result with refundable/non-refundable split
 */
export function computeAdoptionCredit2025(
  input: AdoptionCreditInput
): AdoptionCreditResult {
  const { magi, taxBeforeCredits, adoptedChildren, priorYearCarryforward = 0 } = input;
  const { refundablePortion } = ADOPTION_CREDIT_2025;
  const notes: string[] = [];

  // Calculate credit for each child
  const childDetails = adoptedChildren.map(child =>
    calculateChildCredit(child, magi)
  );

  // Sum up total credit from all children (after phase-out)
  const totalCurrentYearCredit = childDetails.reduce(
    (sum, detail) => addCents(sum, detail.creditAfterPhaseout),
    0
  );

  // Add prior year carryforward
  const totalCreditAvailable = addCents(totalCurrentYearCredit, priorYearCarryforward);

  // Determine phase-out status
  const wasPhaseoutApplied = childDetails.some(
    detail => detail.creditBeforePhaseout > detail.creditAfterPhaseout
  );
  const avgPhaseoutPercentage = wasPhaseoutApplied
    ? childDetails.reduce((sum, d) => sum + (d.creditBeforePhaseout > 0
        ? (d.creditBeforePhaseout - d.creditAfterPhaseout) / d.creditBeforePhaseout
        : 0), 0) / childDetails.filter(d => d.creditBeforePhaseout > 0).length
    : 0;

  // Split into refundable and non-refundable portions
  // Under OBBBA 2025: Up to $5,000 is refundable per return (not per child)
  const refundableCredit = Math.min(totalCreditAvailable, refundablePortion);
  const nonRefundableAvailable = max0(
    subtractCents(totalCreditAvailable, refundableCredit)
  );

  // Non-refundable credit limited by tax liability
  const nonRefundableCredit = Math.min(nonRefundableAvailable, taxBeforeCredits);

  // Total credit used this year
  const totalUsed = addCents(refundableCredit, nonRefundableCredit);

  // Unused credit carries forward (only non-refundable portion)
  const unusedCreditCarryforward = max0(
    subtractCents(nonRefundableAvailable, nonRefundableCredit)
  );

  // Carryforward used this year
  const carryforwardUsed = Math.min(priorYearCarryforward, totalUsed);

  // Calculate employer assistance exclusion
  const employerAssistanceExclusion = adoptedChildren.reduce(
    (sum, child) => addCents(sum, child.employerAssistance),
    0
  );

  // Generate notes
  if (totalCreditAvailable > totalUsed) {
    notes.push(
      `Unused credit of $${((totalCreditAvailable - totalUsed) / 100).toFixed(2)} ` +
      `can be carried forward for up to 5 years`
    );
  }

  if (wasPhaseoutApplied) {
    notes.push(
      `Credit reduced due to income phase-out (MAGI above $259,190)`
    );
  }

  if (refundableCredit > 0) {
    notes.push(
      `$${(refundableCredit / 100).toFixed(2)} of credit is refundable ` +
      `(new for 2025 under OBBBA)`
    );
  }

  if (childDetails.some(d => d.isSpecialNeeds)) {
    notes.push(
      'Special needs adoption(s) qualify for full credit regardless of expenses'
    );
  }

  return {
    nonRefundableCredit,
    refundableCredit,
    totalAdoptionCredit: totalUsed,
    carryforwardUsed,
    unusedCreditCarryforward,
    employerAssistanceExclusion,
    childDetails,
    wasPhaseoutApplied,
    phaseoutPercentage: avgPhaseoutPercentage,
    notes,
  };
}
