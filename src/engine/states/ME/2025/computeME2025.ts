/**
 * Maine State Tax Computation for 2025
 *
 * Implements Maine's 3-bracket progressive income tax system (5.8%-7.15%)
 * with standard deductions, personal exemptions, and state EITC.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { ME_RULES_2025 } from '../../../rules/2025/states/me';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

/**
 * Compute Maine state tax for 2025
 */
export function computeME2025(input: StateTaxInput): StateResult {
  const {
    federalResult,
    filingStatus,
    stateWithheld = 0,
    stateEstPayments = 0,
    stateDependents = 0,
  } = input;

  const meAGI = federalResult.agi;
  const standardDeduction = ME_RULES_2025.standardDeduction[filingStatus];

  const numberOfExemptions =
    filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = ME_RULES_2025.personalExemption * numberOfExemptions;

  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const meTaxableIncome = max0(subtractCents(meAGI, totalDeductions));

  const fullBrackets = convertToFullBrackets(ME_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(meTaxableIncome, fullBrackets);

  const federalEITC = federalResult.credits?.eitc || 0;
  const meEITC = Math.round(federalEITC * ME_RULES_2025.eitcPercentage);
  const taxAfterCredits = max0(taxBeforeCredits - meEITC);

  const refundableEITC = Math.max(0, meEITC - taxBeforeCredits);
  const finalTax = taxAfterCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments + refundableEITC - finalTax;

  return {
    stateAGI: meAGI,
    stateTaxableIncome: meTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: meEITC - refundableEITC,
      refundableCredits: refundableEITC,
      personal_exemption: personalExemptions,
      eitc: meEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'ME',
    taxYear: 2025,
    calculationNotes: [
      `Maine uses 3-bracket progressive system (5.8%-7.15%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      meEITC > 0 ? `Maine EITC (15% of federal, refundable): $${(meEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
