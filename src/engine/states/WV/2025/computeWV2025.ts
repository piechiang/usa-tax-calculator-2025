/**
 * West Virginia State Tax Computation for 2025
 *
 * Implements West Virginia's 5-bracket progressive income tax system (2.36%-5.12%)
 * with personal exemptions but no standard deduction.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { WV_RULES_2025 } from '../../../rules/2025/states/wv';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeWV2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  const wvAGI = federalResult.agi;

  // West Virginia does not have a standard deduction
  const standardDeduction = 0;

  // Personal exemptions ($2,000 per exemption)
  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = WV_RULES_2025.personalExemption * numberOfExemptions;

  const wvTaxableIncome = max0(subtractCents(wvAGI, personalExemptions));

  const fullBrackets = convertToFullBrackets(WV_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(wvTaxableIncome, fullBrackets);
  const finalTax = taxBeforeCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  return {
    stateAGI: wvAGI,
    stateTaxableIncome: wvTaxableIncome,
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
    state: 'WV',
    taxYear: 2025,
    calculationNotes: [
      `West Virginia uses 5-bracket progressive system (2.36%-5.12%)`,
      `No standard deduction in West Virginia`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
    ],
  };
}
