/**
 * Oregon State Tax Computation for 2025
 *
 * Implements Oregon's 4-bracket progressive income tax system with:
 * - Federal tax deduction (up to $6,100/$12,200)
 * - Personal exemption credit ($256 per person, income-limited)
 * - Standard deduction with elderly/blind additional amounts
 * - Progressive rates: 4.75%, 6.75%, 8.75%, 9.90%
 */

import type { StateTaxInput, StateResult } from '../../../types';
import {
  calculateOregonTax,
  calculateStandardDeduction,
  calculatePersonalExemptionCredit,
  calculateFederalTaxDeduction,
  type OregonSpecificInput,
} from '../../../rules/2025/states/or';
import { addCents, subtractCents, max0 } from '../../../util/money';

/**
 * Compute Oregon state tax for 2025
 *
 * @param input - State tax input including federal result and Oregon-specific data
 * @returns Oregon state tax result
 */
export function computeOR2025(input: StateTaxInput): StateResult {
  const {
    federalResult,
    filingStatus,
    stateWithheld = 0,
    stateEstPayments = 0,
    stateSpecific,
  } = input;
  const orSpecific = stateSpecific as OregonSpecificInput | undefined;

  // Step 1: Oregon AGI = Federal AGI (no modifications for basic case)
  const orAGI = federalResult.agi;

  // Step 2: Calculate federal tax deduction
  // Oregon allows deduction of federal tax paid, up to limits
  const federalTaxPaid = orSpecific?.federalTaxPaid ?? federalResult.totalTax;
  const federalTaxDeduction = calculateFederalTaxDeduction(filingStatus, federalTaxPaid);

  // Step 3: Calculate standard deduction (with elderly/blind additions)
  const age65OrOlder = orSpecific?.age65OrOlder ?? 0;
  const isBlind = orSpecific?.isBlind ?? 0;
  const standardDeduction = calculateStandardDeduction(filingStatus, age65OrOlder, isBlind);

  // Step 4: Calculate Oregon taxable income
  // OR Taxable Income = OR AGI - Federal Tax Deduction - Standard Deduction
  const orTaxableIncome = max0(
    subtractCents(subtractCents(orAGI, federalTaxDeduction), standardDeduction)
  );

  // Step 5: Calculate tax before credits using progressive brackets
  const taxBeforeCredits = calculateOregonTax(orTaxableIncome, filingStatus);

  // Step 6: Calculate personal exemption credit
  // $256 per person (filer + dependents), income-limited
  const numberOfExemptions = orSpecific?.numberOfExemptions ?? 1; // Default to 1 (filer only)
  const personalExemptionCredit = calculatePersonalExemptionCredit(
    filingStatus,
    federalResult.agi,
    numberOfExemptions
  );

  // Step 7: Apply non-refundable credits
  const totalNonRefundableCredits = personalExemptionCredit;
  const taxAfterCredits = max0(subtractCents(taxBeforeCredits, totalNonRefundableCredits));

  // Step 8: Final tax liability
  const finalTax = taxAfterCredits;

  // Step 9: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  // Build result
  return {
    stateAGI: orAGI,
    stateTaxableIncome: orTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Oregon has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: addCents(federalTaxDeduction, standardDeduction),
    stateCredits: {
      nonRefundableCredits: totalNonRefundableCredits,
      refundableCredits: 0, // No refundable credits for basic Oregon return
      personal_exemption: personalExemptionCredit,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'OR',
    taxYear: 2025,
    calculationNotes: [
      `Oregon uses 4-bracket progressive system (4.75%-9.90%)`,
      `Federal tax deduction: $${(federalTaxDeduction / 100).toFixed(2)}`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemption credit: $${(personalExemptionCredit / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      age65OrOlder > 0
        ? `Additional deduction for ${age65OrOlder} elderly person${age65OrOlder !== 1 ? 's' : ''}`
        : null,
      isBlind > 0
        ? `Additional deduction for ${isBlind} blind person${isBlind !== 1 ? 's' : ''}`
        : null,
    ].filter((note): note is string => note !== null),
  };
}
