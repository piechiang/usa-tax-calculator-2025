/**
 * South Dakota State Tax Calculation for 2025
 *
 * South Dakota has NO state income tax.
 * South Dakota is known for its trust industry and business-friendly environment.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface SouthDakotaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

/**
 * Calculate South Dakota state income tax for 2025
 *
 * South Dakota has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * South Dakota is known for its trust industry, attracting billions
 * in trust assets due to no income tax and favorable trust laws.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeSD2025(input: SouthDakotaInput2025): StateResult {
  const { federalAGI } = input;

  // South Dakota has no state income tax
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
    state: 'SD',
    taxYear: 2025,
    calculationNotes: [
      'South Dakota has NO state income tax',
      'No state tax return filing required',
      'South Dakota has never had a state income tax',
      'One of 9 states with no income tax',
      'No corporate income tax, no personal property tax',
      'Strong trust industry with billions in assets',
      'Business-friendly environment',
    ],
  };
}
