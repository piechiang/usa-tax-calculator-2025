/**
 * Mississippi State Tax Computation for 2025
 *
 * Implements Mississippi's 4-bracket progressive income tax system (0%-5%)
 * with standard deductions and personal exemptions.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { MS_RULES_2025 } from '../../../rules/2025/states/ms';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeMS2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  const msAGI = federalResult.agi;
  const standardDeduction = MS_RULES_2025.standardDeduction[filingStatus];

  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = MS_RULES_2025.personalExemption * numberOfExemptions;

  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const msTaxableIncome = max0(subtractCents(msAGI, totalDeductions));

  const fullBrackets = convertToFullBrackets(MS_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(msTaxableIncome, fullBrackets);
  const finalTax = taxBeforeCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  return {
    stateAGI: msAGI,
    stateTaxableIncome: msTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: 0,
      refundableCredits: 0,
      personal_exemption: personalExemptions,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'MS',
    taxYear: 2025,
    calculationNotes: [
      `Mississippi uses 4-bracket progressive system (0%-5%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
    ],
  };
}
