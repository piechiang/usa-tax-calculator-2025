/**
 * Minnesota State Tax Computation for 2025
 *
 * Implements Minnesota's 4-bracket progressive income tax system with:
 * - Standard deduction ($14,950 single / $29,900 MFJ)
 * - Dependent exemption
 * - Progressive rates: 5.35%, 6.80%, 7.85%, 9.85%
 */

import type { StateTaxInput, StateResult } from '../../../types';
import {
  calculateMinnesotaTax,
  calculateStandardDeduction,
  calculateDependentExemption,
  type MinnesotaSpecificInput,
} from '../../../rules/2025/states/mn';
import { addCents, subtractCents, max0 } from '../../../util/money';

/**
 * Compute Minnesota state tax for 2025
 *
 * @param input - State tax input including federal result and Minnesota-specific data
 * @returns Minnesota state tax result
 */
export function computeMN2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateSpecific, stateDependents = 0 } = input;
  const mnSpecific = stateSpecific as MinnesotaSpecificInput | undefined;

  // Step 1: Minnesota AGI = Federal AGI (no modifications for basic case)
  const mnAGI = federalResult.agi;

  // Step 2: Calculate standard deduction
  const standardDeduction = calculateStandardDeduction(filingStatus);

  // Step 3: Calculate dependent exemption
  const numberOfDependents = mnSpecific?.numberOfDependents ?? stateDependents;
  const dependentExemption = calculateDependentExemption(numberOfDependents);

  // Step 4: Calculate Minnesota taxable income
  const mnTaxableIncome = max0(
    subtractCents(subtractCents(mnAGI, standardDeduction), dependentExemption)
  );

  // Step 5: Calculate tax using progressive brackets
  const taxBeforeCredits = calculateMinnesotaTax(mnTaxableIncome, filingStatus);

  // Step 6: Final tax liability (no additional credits for basic implementation)
  const finalTax = taxBeforeCredits;

  // Step 7: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  // Build result
  return {
    stateAGI: mnAGI,
    stateTaxableIncome: mnTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Minnesota has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: addCents(standardDeduction, dependentExemption),
    stateCredits: {
      nonRefundableCredits: 0,
      refundableCredits: 0,
      dependent_exemption: dependentExemption,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'MN',
    taxYear: 2025,
    calculationNotes: [
      `Minnesota uses 4-bracket progressive system (5.35%-9.85%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      numberOfDependents > 0 ? `Dependent exemption: $${(dependentExemption / 100).toFixed(2)} (${numberOfDependents} dependent${numberOfDependents !== 1 ? 's' : ''})` : null,
    ].filter((note): note is string => note !== null),
  };
}
