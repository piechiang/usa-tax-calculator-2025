/**
 * Missouri State Tax Calculation for 2025
 *
 * Implements Missouri's 8-bracket progressive income tax system.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  MO_TAX_BRACKETS_2025,
  MO_STANDARD_DEDUCTION_2025,
  MO_FEDERAL_TAX_DEDUCTION_LIMIT_2025,
  MO_DEPENDENT_EXEMPTION_2025,
} from '../../../rules/2025/states/mo';

export interface MissouriInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  federalTaxPaid: number; // Federal income tax paid (after credits) (cents)
  dependents: number; // Number of dependents
  stateWithholding: number; // Missouri tax withheld (cents)
}

/**
 * Calculate Missouri state income tax for 2025
 *
 * Steps:
 * 1. Start with federal AGI
 * 2. Subtract federal income tax deduction (capped at $5k/$10k)
 * 3. Subtract standard deduction
 * 4. Subtract dependent exemptions ($1,200 each)
 * 5. Calculate tax using 8-bracket progressive system
 * 6. Calculate refund/owe
 */
export function computeMO2025(input: MissouriInput2025): StateResult {
  const {
    filingStatus,
    federalAGI,
    federalTaxPaid,
    dependents,
    stateWithholding,
  } = input;

  // Step 1: Missouri AGI starts with federal AGI
  let missouriAGI = federalAGI;

  // Step 2: Subtract federal income tax paid (capped)
  const federalTaxDeductionLimit = MO_FEDERAL_TAX_DEDUCTION_LIMIT_2025[filingStatus];
  const federalTaxDeduction = Math.min(federalTaxPaid, federalTaxDeductionLimit);
  missouriAGI = Math.max(0, missouriAGI - federalTaxDeduction);

  // Step 3: Calculate standard deduction
  const standardDeduction = MO_STANDARD_DEDUCTION_2025[filingStatus];

  // Step 4: Calculate dependent exemptions
  const dependentExemptions = dependents * MO_DEPENDENT_EXEMPTION_2025;

  // Step 5: Calculate taxable income
  const taxableIncome = Math.max(
    0,
    missouriAGI - standardDeduction - dependentExemptions
  );

  // Step 6: Calculate tax using progressive brackets
  let tax = 0;
  let previousMax = 0;

  for (const bracket of MO_TAX_BRACKETS_2025) {
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

  // Step 7: Missouri has no state credits implemented in this version
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
    stateAGI: missouriAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // Missouri has no state-administered local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: dependentExemptions,

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'MO',
    taxYear: 2025,
    calculationNotes: [
      `Federal income tax deduction: $${(federalTaxDeduction / 100).toFixed(2)} (capped at $${(federalTaxDeductionLimit / 100).toFixed(2)})`,
      dependents > 0
        ? `Dependent exemptions: ${dependents} × $${(MO_DEPENDENT_EXEMPTION_2025 / 100).toFixed(2)} = $${(dependentExemptions / 100).toFixed(2)}`
        : 'No dependent exemptions',
    ],
  };
}
