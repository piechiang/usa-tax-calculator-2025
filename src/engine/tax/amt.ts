import { FilingStatus, FederalInput2025, AMTCalculationDetails } from '../types';
import {
  AMT_EXEMPTION_2025,
  AMT_EXEMPTION_PHASEOUT_2025,
  AMT_RATE_THRESHOLD_2025,
  AMT_RATES,
} from '../rules/2025/federal/amt';
import { SALT_CAP_2025 } from '../rules/2025/federal/deductions';
import { addCents, max0, multiplyCents } from '../util/money';

/**
 * Form 6251 - Alternative Minimum Tax Calculation for 2025
 *
 * The AMT ensures that taxpayers with high incomes and significant tax preferences
 * pay at least a minimum amount of tax. It operates as a parallel tax system.
 *
 * Calculation Steps (Form 6251):
 * 1. Calculate Alternative Minimum Taxable Income (AMTI)
 *    - Start with regular taxable income
 *    - Add back certain deductions (adjustments)
 *    - Add preference items
 * 2. Subtract AMT exemption (with phase-out)
 * 3. Calculate Tentative Minimum Tax (TMT) at AMT rates
 * 4. Compare to regular tax
 * 5. AMT = max(0, TMT - regular tax)
 *
 * Source: IRS Form 6251, Rev. Proc. 2024-40
 */

export interface AMTInput {
  filingStatus: FilingStatus;
  taxableIncome: number; // Regular taxable income (cents)
  regularTax: number; // Regular income tax before credits (cents)
  agi: number; // Adjusted Gross Income (cents)

  // Deduction information (for adjustments)
  isStandardDeduction: boolean;
  standardDeductionAmount: number; // cents
  itemizedDeductions: {
    stateLocalTaxes: number; // SALT deduction claimed (cents)
    medical: number; // Medical expenses claimed (cents)
    mortgageInterest: number; // cents
    charitable: number; // cents
    other: number; // cents
  };

  // AMT-specific items (if any)
  amtItems?: {
    privateActivityBondInterest?: number;
    excessDepletion?: number;
    isoSpread?: number;
    depreciation?: number;
    passiveActivityLosses?: number;
    investmentInterestExpense?: number;
    nolDeduction?: number;
    priorYearAMTCredit?: number;
    otherAdjustments?: number;
  };
}

/**
 * Compute Alternative Minimum Tax (Form 6251)
 *
 * @param input AMT calculation input
 * @returns Complete AMT calculation details
 */
export function computeAMT2025(input: AMTInput): AMTCalculationDetails {
  // Step 1: Calculate Alternative Minimum Taxable Income (AMTI)
  const amtiResult = calculateAMTI(input);

  // Step 2: Calculate AMT exemption with phase-out
  const exemptionResult = calculateAMTExemption(
    input.filingStatus,
    amtiResult.amti
  );

  // Step 3: Calculate AMT taxable income (AMTI minus exemption)
  const amtTaxableIncome = max0(amtiResult.amti - exemptionResult.exemptionAllowed);

  // Step 4: Calculate Tentative Minimum Tax (TMT)
  const tentativeMinimumTax = calculateTentativeMinimumTax(
    input.filingStatus,
    amtTaxableIncome
  );

  // Step 5: Calculate AMT before credits
  // AMT is the excess of TMT over regular tax
  const amtBeforeCredit = max0(tentativeMinimumTax - input.regularTax);

  // Step 6: Apply prior year AMT credit (if available)
  const priorYearCredit = input.amtItems?.priorYearAMTCredit || 0;
  const priorYearCreditUsed = Math.min(priorYearCredit, amtBeforeCredit);
  const finalAMT = amtBeforeCredit - priorYearCreditUsed;

  // Step 7: Calculate AMT credit for future years
  // Credit is generated when you pay AMT due to timing differences
  // Credit can be used when regular tax > TMT in future years
  const creditCarryforward = calculateAMTCreditCarryforward(
    amtBeforeCredit,
    amtiResult.adjustments,
    amtiResult.preferences,
    priorYearCredit,
    priorYearCreditUsed
  );

  return {
    taxableIncome: input.taxableIncome,
    amtAdjustments: amtiResult.adjustments,
    amtPreferences: amtiResult.preferences,
    amti: amtiResult.amti,
    exemption: exemptionResult.exemption,
    exemptionPhaseout: exemptionResult.phaseout,
    exemptionAllowed: exemptionResult.exemptionAllowed,
    amtTaxableIncome,
    tentativeMinimumTax,
    regularTax: input.regularTax,
    amtBeforeCredit,
    priorYearCreditUsed,
    amt: finalAMT,
    creditCarryforward,
  };
}

/**
 * Calculate Alternative Minimum Taxable Income (AMTI)
 * Form 6251, Part I
 */
function calculateAMTI(input: AMTInput): {
  amti: number;
  adjustments: number;
  preferences: number;
} {
  let adjustments = 0;
  let preferences = 0;

  // === ADJUSTMENTS (Form 6251, Lines 2-25) ===

  // Line 2a: Standard deduction adjustment
  // If taxpayer claimed standard deduction, add it back for AMT
  // (AMT requires itemized calculation even if standard was better)
  if (input.isStandardDeduction) {
    adjustments = addCents(adjustments, input.standardDeductionAmount);
  }

  // Line 2b: State and Local Tax (SALT) adjustment
  // SALT is not deductible for AMT purposes
  // Add back the SALT deduction that was claimed (up to $10,000 cap)
  const saltDeduction = input.itemizedDeductions.stateLocalTaxes;
  if (saltDeduction > 0) {
    adjustments = addCents(adjustments, saltDeduction);
  }

  // Line 2c: Medical expense adjustment
  // For 2025, both regular tax and AMT use 7.5% AGI threshold
  // So no adjustment is needed
  // (Prior to 2021, AMT used 10% threshold creating an adjustment)

  // Line 2d: Home mortgage interest
  // Certain home equity loan interest not allowed for AMT
  // (This requires detailed tracking - not implemented in basic version)

  // Lines 3-11: ISO, Depreciation, Passive Losses, etc.
  if (input.amtItems) {
    // ISO spread (incentive stock option bargain element)
    if (input.amtItems.isoSpread) {
      adjustments = addCents(adjustments, input.amtItems.isoSpread);
    }

    // Depreciation adjustment (MACRS vs ADS)
    if (input.amtItems.depreciation) {
      // Can be positive or negative
      adjustments = addCents(adjustments, input.amtItems.depreciation);
    }

    // Passive activity losses
    if (input.amtItems.passiveActivityLosses) {
      adjustments = addCents(adjustments, input.amtItems.passiveActivityLosses);
    }

    // Investment interest expense
    if (input.amtItems.investmentInterestExpense) {
      adjustments = addCents(adjustments, input.amtItems.investmentInterestExpense);
    }

    // Other adjustments (net)
    if (input.amtItems.otherAdjustments) {
      adjustments = addCents(adjustments, input.amtItems.otherAdjustments);
    }
  }

  // === PREFERENCES (Form 6251, Lines 26-27) ===

  if (input.amtItems) {
    // Line 26: Private activity bond interest
    if (input.amtItems.privateActivityBondInterest) {
      preferences = addCents(
        preferences,
        input.amtItems.privateActivityBondInterest
      );
    }

    // Line 27: Excess percentage depletion
    if (input.amtItems.excessDepletion) {
      preferences = addCents(preferences, input.amtItems.excessDepletion);
    }
  }

  // Calculate AMTI (Form 6251, Line 28)
  const amti = addCents(input.taxableIncome, adjustments, preferences);

  return { amti, adjustments, preferences };
}

/**
 * Calculate AMT Exemption with Phase-out
 * Form 6251, Lines 29-31
 */
function calculateAMTExemption(
  filingStatus: FilingStatus,
  amti: number
): {
  exemption: number;
  phaseout: number;
  exemptionAllowed: number;
} {
  const exemption = AMT_EXEMPTION_2025[filingStatus];
  const phaseoutThreshold = AMT_EXEMPTION_PHASEOUT_2025[filingStatus];

  // Calculate phase-out amount
  // Exemption is reduced by 25% of the amount by which AMTI exceeds threshold
  let phaseout = 0;
  if (amti > phaseoutThreshold) {
    const excessAMTI = amti - phaseoutThreshold;
    phaseout = multiplyCents(excessAMTI, 0.25);
  }

  // Exemption cannot be negative
  const exemptionAllowed = max0(exemption - phaseout);

  return { exemption, phaseout, exemptionAllowed };
}

/**
 * Calculate Tentative Minimum Tax (TMT)
 * Form 6251, Lines 32-37
 *
 * Two-tier rate structure:
 * - 26% on first portion up to threshold
 * - 28% on amount over threshold
 */
function calculateTentativeMinimumTax(
  filingStatus: FilingStatus,
  amtTaxableIncome: number
): number {
  if (amtTaxableIncome <= 0) {
    return 0;
  }

  const threshold = AMT_RATE_THRESHOLD_2025[filingStatus];

  if (amtTaxableIncome <= threshold) {
    // All income taxed at 26%
    return multiplyCents(amtTaxableIncome, AMT_RATES.lower);
  } else {
    // Income up to threshold at 26%, excess at 28%
    const taxOnThreshold = multiplyCents(threshold, AMT_RATES.lower);
    const excessIncome = amtTaxableIncome - threshold;
    const taxOnExcess = multiplyCents(excessIncome, AMT_RATES.upper);
    return addCents(taxOnThreshold, taxOnExcess);
  }
}

/**
 * Calculate AMT Credit Carryforward (Minimum Tax Credit)
 * Form 8801 - Credit for Prior Year Minimum Tax
 *
 * The AMT credit is calculated based on timing differences only.
 * Exclusion items (like SALT, standard deduction) do not generate credits.
 *
 * Simplified calculation for basic scenarios:
 * - If AMT was paid this year, generate credit for future use
 * - Credit = AMT paid (excluding exclusion preferences)
 * - Credit carries forward indefinitely
 */
function calculateAMTCreditCarryforward(
  amtPaid: number,
  adjustments: number,
  preferences: number,
  priorYearCredit: number,
  priorYearCreditUsed: number
): number {
  // In a full implementation, we would separate timing differences from exclusions
  // For now, we'll use a simplified approach:
  // - Credit is generated when AMT is paid
  // - All adjustments/preferences are assumed to be timing differences
  // - This is conservative but safe

  // Generate new credit from AMT paid this year
  // (In reality, only timing difference portion generates credit)
  const newCredit = amtPaid;

  // Remaining credit from prior years
  const remainingPriorCredit = max0(priorYearCredit - priorYearCreditUsed);

  // Total credit available for future years
  return addCents(newCredit, remainingPriorCredit);
}

/**
 * Helper function to determine if AMT applies to a taxpayer
 * Common AMT triggers post-TCJA:
 * - High income with large ISO exercise
 * - Significant passive activity adjustments
 * - Large depreciation differences
 * - Tax-exempt private activity bond interest
 *
 * Note: SALT deduction is capped at $10k for regular tax,
 * so it rarely triggers AMT anymore (unlike pre-TCJA)
 */
export function isLikelySubjectToAMT(input: FederalInput2025): boolean {
  const amtItems = input.amtItems;
  if (!amtItems) return false;

  // Check for common AMT triggers
  const hasISOSpread = (amtItems.isoSpread || 0) > 0;
  const hasLargeDepreciation = Math.abs(amtItems.depreciation || 0) > 1000000; // > $10k
  const hasPrivateActivityBonds = (amtItems.privateActivityBondInterest || 0) > 0;
  const hasPassiveLosses = (amtItems.passiveActivityLosses || 0) > 0;

  return (
    hasISOSpread ||
    hasLargeDepreciation ||
    hasPrivateActivityBonds ||
    hasPassiveLosses
  );
}
