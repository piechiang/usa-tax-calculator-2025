/**
 * Alabama State Tax Calculation for 2025
 *
 * Implements Alabama's 3-bracket progressive income tax system with
 * federal income tax deduction.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  AL_TAX_BRACKETS_2025,
  AL_STANDARD_DEDUCTION_2025,
  getDependentExemptionAmount,
} from '../../../rules/2025/states/al';

export interface AlabamaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  federalTaxPaid: number; // Federal income tax paid (after credits) (cents)
  dependents: number; // Number of dependents (NOT including taxpayer/spouse)
  stateWithholding: number; // Alabama tax withheld (cents)
}

/**
 * Calculate Alabama state income tax for 2025
 *
 * Steps:
 * 1. Start with federal AGI
 * 2. Subtract federal income tax paid (Alabama's unique deduction)
 * 3. Subtract standard deduction
 * 4. Subtract dependent exemptions (income-based)
 * 5. Calculate tax using 3-bracket progressive system
 * 6. Calculate refund/owe
 */
export function computeAL2025(input: AlabamaInput2025): StateResult {
  const {
    filingStatus,
    federalAGI,
    federalTaxPaid,
    dependents,
    stateWithholding,
  } = input;

  // Step 1: Alabama AGI starts with federal AGI
  let alabamaAGI = federalAGI;

  // Step 2: Subtract federal income tax paid (Alabama's unique feature)
  // This is the net federal tax liability after all credits
  alabamaAGI = Math.max(0, alabamaAGI - federalTaxPaid);

  // Step 3: Calculate standard deduction
  const standardDeduction = AL_STANDARD_DEDUCTION_2025[filingStatus];

  // Step 4: Calculate dependent exemptions (income-based)
  // Note: Use original federal AGI for determining exemption amount,
  // not the Alabama AGI after federal tax deduction
  const exemptionPerDependent = getDependentExemptionAmount(federalAGI);
  const totalDependentExemptions = dependents * exemptionPerDependent;

  // Step 5: Calculate taxable income
  const taxableIncome = Math.max(
    0,
    alabamaAGI - standardDeduction - totalDependentExemptions
  );

  // Step 6: Calculate tax using progressive brackets
  const brackets = AL_TAX_BRACKETS_2025[filingStatus];
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousMax) {
      break;
    }

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - previousMax;
    tax += Math.round(taxableInBracket * bracket.rate);
    previousMax = bracket.max;

    if (taxableIncome <= bracket.max) {
      break;
    }
  }

  // Step 7: Alabama has no state credits implemented in this version
  const credits = 0;

  // Step 8: Calculate final tax liability
  const taxAfterCredits = Math.max(0, tax - credits);

  // Step 9: Calculate refund or amount owed
  const refundOrOwed = stateWithholding - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  return {
    // Core amounts
    stateAGI: alabamaAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // Alabama has no state-level local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: totalDependentExemptions,

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'AL',
    taxYear: 2025,
    calculationNotes: [
      `Federal income tax deduction: $${(federalTaxPaid / 100).toFixed(2)}`,
      dependents > 0
        ? `Dependent exemptions: ${dependents} × $${(exemptionPerDependent / 100).toFixed(2)} = $${(totalDependentExemptions / 100).toFixed(2)}`
        : 'No dependent exemptions',
    ],
  };
}
