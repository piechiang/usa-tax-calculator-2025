/**
 * New Mexico State Tax Calculation for 2025
 *
 * Implements New Mexico's progressive 5-bracket system (HB 252, effective 2025).
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  NM_TAX_BRACKETS_2025,
  NM_STANDARD_DEDUCTION_2025,
  NM_PERSONAL_EXEMPTION_2025,
} from '../../../rules/2025/states/nm';

export interface NewMexicoInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  dependents: number; // Number of dependents
  stateWithholding?: number; // New Mexico tax withheld (cents)
}

/**
 * Calculate New Mexico state income tax for 2025
 *
 * New Mexico enacted HB 252 (March 2024), restructuring brackets for 2025:
 * - Lowest rate reduced from 1.7% to 1.5%
 * - New 4.3% bracket for middle incomes
 * - Progressive brackets: 1.5%, 4.3%, 4.7%, 4.9%, 5.9%
 *
 * Steps:
 * 1. Start with federal AGI
 * 2. Subtract standard deduction
 * 3. Subtract personal exemptions ($2,500 per person)
 * 4. Calculate tax using progressive brackets
 * 5. Calculate refund/owe
 */
export function computeNM2025(input: NewMexicoInput2025): StateResult {
  const { filingStatus, federalAGI, dependents, stateWithholding } = input;

  // Step 1: New Mexico AGI starts with federal AGI
  const newMexicoAGI = federalAGI;

  // Step 2: Calculate standard deduction
  const standardDeduction = NM_STANDARD_DEDUCTION_2025[filingStatus];

  // Step 3: Calculate personal exemptions
  // Taxpayer + spouse (if MFJ) + dependents
  const numberOfExemptions =
    filingStatus === 'marriedJointly' ? 2 + dependents : 1 + dependents;
  const personalExemptions = numberOfExemptions * NM_PERSONAL_EXEMPTION_2025;

  // Step 4: Calculate taxable income
  const taxableIncome = Math.max(
    0,
    newMexicoAGI - standardDeduction - personalExemptions
  );

  // Step 5: Calculate tax using progressive brackets
  const brackets = NM_TAX_BRACKETS_2025[filingStatus];
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    const bracketBase = previousMax;
    const bracketTop = bracket.max;
    const taxableInBracket = Math.min(
      Math.max(0, taxableIncome - bracketBase),
      bracketTop - bracketBase
    );

    if (taxableInBracket > 0) {
      tax += Math.round(taxableInBracket * bracket.rate);
    }

    previousMax = bracketTop;
    if (taxableIncome <= bracketTop) break;
  }

  // Step 6: No state credits in this basic implementation
  const credits = 0;

  // Step 7: Calculate final tax liability
  const taxAfterCredits = Math.max(0, tax - credits);

  // Step 8: Calculate refund or amount owed
  const withheld = stateWithholding ?? 0;
  const refundOrOwed = withheld - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  return {
    // Core amounts
    stateAGI: newMexicoAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // New Mexico has no state-administered local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: personalExemptions,

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: withheld,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'NM',
    taxYear: 2025,
    calculationNotes: [
      'HB 252 (2024) restructured tax brackets for 2025',
      'Progressive brackets: 1.5%, 4.3%, 4.7%, 4.9%, 5.9%',
      'First major tax change since 2005',
      `Personal exemptions: ${numberOfExemptions} × $2,500 = $${(personalExemptions / 100).toFixed(2)}`,
    ],
  };
}
