/**
 * Louisiana State Tax Calculation for 2025
 *
 * Implements Louisiana's new flat 3% income tax system (effective 2025).
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  LA_TAX_RATE_2025,
  LA_STANDARD_DEDUCTION_2025,
} from '../../../rules/2025/states/la';

export interface LouisianaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  stateWithholding: number; // Louisiana tax withheld (cents)
}

/**
 * Calculate Louisiana state income tax for 2025
 *
 * Louisiana enacted major tax reform for 2025 (Act 11 of 2024):
 * - Replaced 3-bracket graduated system with flat 3% rate
 * - Increased standard deduction significantly
 * - Eliminated personal and dependent exemptions
 *
 * Steps:
 * 1. Start with federal AGI
 * 2. Subtract standard deduction
 * 3. Calculate tax at flat 3% rate
 * 4. Calculate refund/owe
 */
export function computeLA2025(input: LouisianaInput2025): StateResult {
  const { filingStatus, federalAGI, stateWithholding } = input;

  // Step 1: Louisiana AGI starts with federal AGI
  const louisianaAGI = federalAGI;

  // Step 2: Calculate standard deduction
  const standardDeduction = LA_STANDARD_DEDUCTION_2025[filingStatus];

  // Step 3: Calculate taxable income
  const taxableIncome = Math.max(0, louisianaAGI - standardDeduction);

  // Step 4: Calculate tax at flat 3% rate
  const tax = Math.round(taxableIncome * LA_TAX_RATE_2025);

  // Step 5: No state credits in this basic implementation
  const credits = 0;

  // Step 6: Calculate final tax liability
  const taxAfterCredits = Math.max(0, tax - credits);

  // Step 7: Calculate refund or amount owed
  const refundOrOwed = stateWithholding - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  return {
    // Core amounts
    stateAGI: louisianaAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // Louisiana has no state-administered local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: 0, // Eliminated in 2025 reform

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'LA',
    taxYear: 2025,
    calculationNotes: [
      'Flat 3% tax rate (NEW for 2025 - replaced graduated brackets)',
      'Personal and dependent exemptions eliminated (replaced by higher standard deduction)',
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
    ],
  };
}
