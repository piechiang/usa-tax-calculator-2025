/**
 * Wyoming State Tax Calculation for 2025
 *
 * Wyoming has NO state income tax.
 * Wyoming relies on mineral extraction taxes and tourism revenue.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface WyomingInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

/**
 * Calculate Wyoming state income tax for 2025
 *
 * Wyoming has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * Wyoming has the lowest population of any state (~580,000)
 * and relies on mineral extraction taxes instead of income tax.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeWY2025(input: WyomingInput2025): StateResult {
  const { federalAGI } = input;

  // Wyoming has no state income tax
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
    state: 'WY',
    taxYear: 2025,
    calculationNotes: [
      'Wyoming has NO state income tax',
      'No state tax return filing required',
      'Wyoming has never had a state income tax',
      'Constitutional protection against income tax',
      'One of 9 states with no income tax',
      'Revenue from mineral extraction taxes (coal, gas, oil)',
      'Lowest population state (~580,000 residents)',
    ],
  };
}
