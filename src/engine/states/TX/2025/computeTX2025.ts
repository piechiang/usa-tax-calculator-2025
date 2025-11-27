/**
 * Texas State Tax Calculation for 2025
 *
 * Texas has NO state income tax.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface TexasInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

/**
 * Calculate Texas state income tax for 2025
 *
 * Texas has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeTX2025(input: TexasInput2025): StateResult {
  const { federalAGI } = input;

  // Texas has no state income tax
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
    state: 'TX',
    taxYear: 2025,
    calculationNotes: [
      'Texas has NO state income tax',
      'No state tax return filing required',
      'Texas Constitution prohibits income tax without voter approval',
      'One of 9 states with no income tax',
    ],
  };
}
