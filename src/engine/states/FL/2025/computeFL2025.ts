/**
 * Florida State Tax Calculation for 2025
 *
 * Florida has NO state income tax.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface FloridaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

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
export function computeFL2025(input: FloridaInput2025): StateResult {
  const { federalAGI } = input;

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

    // Payments and balance - all zero
    stateWithheld: 0,
    stateEstPayments: 0,
    stateRefundOrOwe: 0,

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
