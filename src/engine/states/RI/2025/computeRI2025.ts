/**
 * Rhode Island State Tax Computation for 2025
 *
 * Implements Rhode Island's 3-bracket progressive income tax system (3.75%-5.99%)
 * with standard deductions, personal exemptions, and state EITC.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { RI_RULES_2025 } from '../../../rules/2025/states/ri';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeRI2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  const riAGI = federalResult.agi;
  const standardDeduction = RI_RULES_2025.standardDeduction[filingStatus];

  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = RI_RULES_2025.personalExemption * numberOfExemptions;

  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const riTaxableIncome = max0(subtractCents(riAGI, totalDeductions));

  const fullBrackets = convertToFullBrackets(RI_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(riTaxableIncome, fullBrackets);

  const federalEITC = federalResult.credits?.earnedIncomeCredit || 0;
  const riEITC = Math.round(federalEITC * RI_RULES_2025.eitcPercentage);
  const taxAfterCredits = max0(taxBeforeCredits - riEITC);

  const refundableEITC = Math.max(0, riEITC - taxBeforeCredits);
  const finalTax = taxAfterCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments + refundableEITC - finalTax;

  return {
    stateAGI: riAGI,
    stateTaxableIncome: riTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: riEITC - refundableEITC,
      refundableCredits: refundableEITC,
      personal_exemption: personalExemptions,
      eitc: riEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'RI',
    taxYear: 2025,
    calculationNotes: [
      `Rhode Island uses 3-bracket progressive system (3.75%-5.99%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      riEITC > 0 ? `Rhode Island EITC (15% of federal, refundable): $${(riEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
