/**
 * Nevada State Tax Calculation for 2025
 *
 * Nevada has NO state income tax.
 * Nevada relies on gaming (casino) revenue instead of income tax.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface NevadaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

/**
 * Calculate Nevada state income tax for 2025
 *
 * Nevada has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * Nevada is unique for relying on gaming (casino) revenue
 * instead of income tax, making it attractive to businesses
 * and high-income individuals.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeNV2025(input: NevadaInput2025): StateResult {
  const { federalAGI } = input;

  // Nevada has no state income tax
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
    state: 'NV',
    taxYear: 2025,
    calculationNotes: [
      'Nevada has NO state income tax',
      'No state tax return filing required',
      'Nevada has never had a state income tax',
      'Constitutional protection against income tax',
      'One of 9 states with no income tax',
      'Gaming (casino) revenue funds state operations instead',
      'Popular destination for businesses and high-income individuals',
    ],
  };
}
