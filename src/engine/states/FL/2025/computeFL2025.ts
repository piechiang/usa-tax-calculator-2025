/**
 * Florida State Tax Calculation for 2025
 *
 * Florida has NO state income tax.
 */

import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';

/**
 * Calculate Florida state income tax for 2025
 *
 * Florida has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeFL2025(input: StateTaxInput): StateResult {
  const federalAGI = input.federalResult?.agi ?? 0;
  const stateWithheld = input.stateWithheld ?? 0;
  const stateEstPayments = input.stateEstPayments ?? 0;

  // Florida has no state income tax
  const stateCredits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  return {
    // Core amounts - all zero
    stateAGI: federalAGI,
    stateTaxableIncome: 0,
    stateTax: 0,
    localTax: 0,
    totalStateLiability: 0,

    // Deductions and exemptions - not applicable
    stateDeduction: 0,
    stateExemptions: 0,

    // Credits - not applicable
    stateCredits,

    // Payments and balance
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: stateWithheld + stateEstPayments,

    // Metadata
    state: 'FL',
    taxYear: 2025,
    calculationNotes: [
      'Florida has NO state income tax',
      'No state tax return filing required',
      'Florida Constitution prohibits personal income tax',
      'One of 9 states with no income tax',
      'Popular retirement destination due to tax benefits',
    ],
  };
}
