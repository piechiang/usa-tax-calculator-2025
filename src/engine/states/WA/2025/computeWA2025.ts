/**
 * Washington State Tax Calculation for 2025
 *
 * Washington has NO state income tax on wages/salaries.
 * Note: Washington has a 7% capital gains tax (2022+) on gains > $262,000,
 * but this calculator focuses on wage/salary income.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';

export interface WashingtonInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents) - not used for wage/salary tax
}

/**
 * Calculate Washington state income tax for 2025
 *
 * Washington has NO state income tax on wages and salaries,
 * so this function returns zero tax liability.
 *
 * Note: Washington enacted a 7% capital gains tax in 2022
 * on gains exceeding $262,000 (2025 threshold), but this is
 * NOT a general income tax and would require separate calculation.
 *
 * Steps:
 * 1. Return zero tax liability for wage/salary income
 * 2. No deductions, exemptions, or credits needed
 */
export function computeWA2025(input: WashingtonInput2025): StateResult {
  const { federalAGI } = input;

  // Washington has no state income tax on wages/salaries
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
    state: 'WA',
    taxYear: 2025,
    calculationNotes: [
      'Washington has NO state income tax on wages and salaries',
      'No state tax return filing required for wage/salary income',
      'Washington has never had a traditional income tax',
      'One of 9 states with no income tax',
      'Constitutional prohibition on graduated income tax',
      'Capital gains tax (7% on gains > $262,000) enacted 2022 - separate calculation',
      'Tech hub (Seattle, Microsoft, Amazon, Boeing)',
    ],
  };
}
