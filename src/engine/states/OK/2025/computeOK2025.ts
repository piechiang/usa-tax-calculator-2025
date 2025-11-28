/**
 * Oklahoma State Tax Computation for 2025
 *
 * Implements Oklahoma's 6-bracket progressive income tax system (0.25%-4.75%)
 * with standard deductions, personal exemptions, and state EITC.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { OK_RULES_2025 } from '../../../rules/2025/states/ok';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeOK2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  const okAGI = federalResult.agi;
  const standardDeduction = OK_RULES_2025.standardDeduction[filingStatus];

  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = OK_RULES_2025.personalExemption * numberOfExemptions;

  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const okTaxableIncome = max0(subtractCents(okAGI, totalDeductions));

  const fullBrackets = convertToFullBrackets(OK_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(okTaxableIncome, fullBrackets);

  const federalEITC = federalResult.credits?.earnedIncomeCredit || 0;
  const okEITC = Math.round(federalEITC * OK_RULES_2025.eitcPercentage);
  const finalTax = max0(taxBeforeCredits - okEITC);

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  return {
    stateAGI: okAGI,
    stateTaxableIncome: okTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: okEITC,
      refundableCredits: 0,
      personal_exemption: personalExemptions,
      eitc: okEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'OK',
    taxYear: 2025,
    calculationNotes: [
      `Oklahoma uses 6-bracket progressive system (0.25%-4.75%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      okEITC > 0 ? `Oklahoma EITC (5% of federal): $${(okEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
