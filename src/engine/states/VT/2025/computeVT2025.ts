/**
 * Vermont State Tax Computation for 2025
 *
 * Implements Vermont's 4-bracket progressive income tax system (3.35%-8.75%)
 * with standard deductions, personal exemptions, and state EITC.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { VT_RULES_2025 } from '../../../rules/2025/states/vt';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

export function computeVT2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  const vtAGI = federalResult.agi;
  const standardDeduction = VT_RULES_2025.standardDeduction[filingStatus];

  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = VT_RULES_2025.personalExemption * numberOfExemptions;

  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const vtTaxableIncome = max0(subtractCents(vtAGI, totalDeductions));

  const taxBeforeCredits = calculateTaxFromBrackets(vtTaxableIncome, VT_RULES_2025.brackets[filingStatus]);

  const federalEITC = federalResult.credits?.earnedIncomeCredit || 0;
  const vtEITC = Math.round(federalEITC * VT_RULES_2025.eitcPercentage);
  const taxAfterCredits = max0(taxBeforeCredits - vtEITC);

  const refundableEITC = Math.max(0, vtEITC - taxBeforeCredits);
  const finalTax = taxAfterCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments + refundableEITC - finalTax;

  return {
    stateAGI: vtAGI,
    stateTaxableIncome: vtTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: vtEITC - refundableEITC,
      refundableCredits: refundableEITC,
      personal_exemption: personalExemptions,
      eitc: vtEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'VT',
    taxYear: 2025,
    calculationNotes: [
      `Vermont uses 4-bracket progressive system (3.35%-8.75%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      vtEITC > 0 ? `Vermont EITC (36% of federal, refundable): $${(vtEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
