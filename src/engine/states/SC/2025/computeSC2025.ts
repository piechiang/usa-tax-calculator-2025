/**
 * South Carolina State Tax Computation for 2025
 *
 * Implements South Carolina's simplified 3-bracket progressive income tax system:
 * - 0% on $0 - $3,560
 * - 3% on $3,561 - $17,830
 * - 6.2% on $17,831+
 */

import type { StateTaxInput, StateResult } from '../../../types';
import {
  calculateSouthCarolinaTax,
  calculateStandardDeduction,
  calculatePersonalExemption,
  calculateDependentExemption,
  type SouthCarolinaSpecificInput,
} from '../../../rules/2025/states/sc';
import { addCents, subtractCents, max0 } from '../../../util/money';

/**
 * Compute South Carolina state tax for 2025
 *
 * @param input - State tax input including federal result and SC-specific data
 * @returns South Carolina state tax result
 */
export function computeSC2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateSpecific, stateDependents = 0 } = input;
  const scSpecific = stateSpecific as SouthCarolinaSpecificInput | undefined;

  // Step 1: South Carolina AGI = Federal AGI (no modifications for basic case)
  const scAGI = federalResult.agi;

  // Step 2: Calculate standard deduction
  const standardDeduction = calculateStandardDeduction(filingStatus);

  // Step 3: Calculate personal exemption
  const personalExemption = calculatePersonalExemption(filingStatus);

  // Step 4: Calculate dependent exemption
  const numberOfDependents = scSpecific?.numberOfDependents ?? stateDependents;
  const dependentExemption = calculateDependentExemption(numberOfDependents);

  // Step 5: Calculate South Carolina taxable income
  const totalDeductions = addCents(addCents(standardDeduction, personalExemption), dependentExemption);
  const scTaxableIncome = max0(subtractCents(scAGI, totalDeductions));

  // Step 6: Calculate tax using progressive brackets
  const taxBeforeCredits = calculateSouthCarolinaTax(scTaxableIncome);

  // Step 7: Final tax liability (no additional credits for basic implementation)
  const finalTax = taxBeforeCredits;

  // Step 8: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  // Build result
  return {
    stateAGI: scAGI,
    stateTaxableIncome: scTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // South Carolina has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: totalDeductions,
    stateCredits: {
      nonRefundableCredits: 0,
      refundableCredits: 0,
      personal_exemption: personalExemption,
      dependent_exemption: dependentExemption,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'SC',
    taxYear: 2025,
    calculationNotes: [
      `South Carolina uses 3-bracket progressive system (0%, 3%, 6.2%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemption: $${(personalExemption / 100).toFixed(2)}`,
      numberOfDependents > 0 ? `Dependent exemption: $${(dependentExemption / 100).toFixed(2)} (${numberOfDependents} dependent${numberOfDependents !== 1 ? 's' : ''})` : null,
    ].filter((note): note is string => note !== null),
  };
}
