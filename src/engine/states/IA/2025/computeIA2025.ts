/**
 * Iowa State Tax Calculation for 2025
 *
 * Implements Iowa's new flat 3.8% income tax system (effective 2025).
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  IA_TAX_RATE_2025,
  IA_STANDARD_DEDUCTION_2025,
} from '../../../rules/2025/states/ia';

export interface IowaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  stateWithholding: number; // Iowa tax withheld (cents)
}

/**
 * Calculate Iowa state income tax for 2025
 *
 * Iowa enacted major tax reform for 2025 (Senate File 2442, May 2024):
 * - Replaced progressive bracket system with flat 3.8% rate
 * - Reduced from 5.7% top rate in 2024
 * - Continues retirement income exemption (since 2023)
 *
 * Steps:
 * 1. Start with federal AGI
 * 2. Subtract standard deduction
 * 3. Calculate tax at flat 3.8% rate
 * 4. Calculate refund/owe
 */
export function computeIA2025(input: IowaInput2025): StateResult {
  const { filingStatus, federalAGI, stateWithholding } = input;

  // Step 1: Iowa AGI starts with federal AGI
  // Note: Assumes retirement income already excluded from AGI
  const iowaAGI = federalAGI;

  // Step 2: Calculate standard deduction
  const standardDeduction = IA_STANDARD_DEDUCTION_2025[filingStatus];

  // Step 3: Calculate taxable income
  const taxableIncome = Math.max(0, iowaAGI - standardDeduction);

  // Step 4: Calculate tax at flat 3.8% rate
  const tax = Math.round(taxableIncome * IA_TAX_RATE_2025);

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
    stateAGI: iowaAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // Iowa has no state-administered local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: 0, // Iowa does not use personal exemptions

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'IA',
    taxYear: 2025,
    calculationNotes: [
      'Flat 3.8% tax rate (NEW for 2025 - reduced from 5.7% in 2024)',
      'Senate File 2442 enacted May 2024',
      'Retirement income fully exempt from Iowa tax',
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
    ],
  };
}
