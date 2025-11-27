/**
 * Alaska State Tax Calculation for 2025
 *
 * Alaska has NO state income tax.
 * Alaska is unique for the Permanent Fund Dividend (PFD) paid to residents.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface AlaskaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for state tax
}

/**
 * Calculate Alaska state income tax for 2025
 *
 * Alaska has NO state income tax, so this function returns
 * zero tax liability for all inputs.
 *
 * Alaska is unique among no-tax states for the Permanent Fund Dividend (PFD),
 * which pays residents annually from oil revenue investments.
 *
 * Steps:
 * 1. Return zero tax liability
 * 2. No deductions, exemptions, or credits needed
 */
export function computeAK2025(input: AlaskaInput2025): StateResult {
  const { federalAGI } = input;

  // Alaska has no state income tax
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
    state: 'AK',
    taxYear: 2025,
    calculationNotes: [
      'Alaska has NO state income tax',
      'No state tax return filing required',
      'Alaska has never had a state income tax',
      'Constitutional protection against income tax without voter approval',
      'One of 9 states with no income tax',
      'Unique Permanent Fund Dividend (PFD) pays residents annually from oil revenue',
      'PFD typically ranges $1,000-$3,000 per person per year',
    ],
  };
}
