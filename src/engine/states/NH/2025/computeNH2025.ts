/**
 * New Hampshire State Tax Calculation for 2025
 *
 * New Hampshire has NO state income tax as of 2025.
 * The Interest & Dividends Tax was REPEALED effective January 1, 2025.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface NewHampshireInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

/**
 * Calculate New Hampshire state income tax for 2025
 *
 * New Hampshire has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * Major change: The 3% Interest & Dividends Tax was REPEALED
 * effective January 1, 2025. New Hampshire is now a true
 * no-income-tax state.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeNH2025(input: NewHampshireInput2025): StateResult {
  const { federalAGI } = input;

  // New Hampshire has no state income tax (2025+)
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
    state: 'NH',
    taxYear: 2025,
    calculationNotes: [
      'New Hampshire has NO state income tax (2025+)',
      'No state tax return filing required',
      'Interest & Dividends Tax REPEALED January 1, 2025',
      'One of 9 states with no income tax',
      'No sales tax either (unique among no-income-tax states)',
      'Property taxes are highest in nation (primary revenue source)',
      '"Live Free or Die" - state motto',
    ],
  };
}
