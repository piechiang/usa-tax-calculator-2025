/**
 * Idaho State Tax Computation for 2025
 *
 * Implements Idaho's 4-bracket progressive income tax system (1%-5.8%)
 * with standard deductions.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { ID_RULES_2025 } from '../../../rules/2025/states/id';
import { subtractCents, addCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute Idaho state tax for 2025
 *
 * @param input - State tax input including federal result and ID-specific data
 * @returns Idaho state tax result
 */
export function computeID2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0 } = input;

  // Step 1: Idaho AGI = Federal AGI (no modifications for basic case)
  const idAGI = federalResult.agi;

  // Step 2: Calculate standard deduction (follows federal amounts)
  const standardDeduction = ID_RULES_2025.standardDeduction[filingStatus];

  // Step 3: Calculate Idaho taxable income
  const idTaxableIncome = max0(subtractCents(idAGI, standardDeduction));

  // Step 4: Calculate tax using progressive brackets
  const taxBeforeCredits = calculateTaxFromBrackets(idTaxableIncome, ID_RULES_2025.brackets[filingStatus]);

  // Step 5: Final tax liability (no state EITC or other credits in ID)
  const finalTax = taxBeforeCredits;

  // Step 6: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  // Build result
  return {
    stateAGI: idAGI,
    stateTaxableIncome: idTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Idaho has no local income tax
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: 0,
      refundableCredits: 0,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'ID',
    taxYear: 2025,
    calculationNotes: [
      `Idaho uses 4-bracket progressive system (1%-5.8%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
    ],
  };
}
