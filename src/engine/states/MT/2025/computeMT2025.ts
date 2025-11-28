/**
 * Montana State Tax Computation for 2025
 *
 * Implements Montana's 3-bracket progressive income tax system (4.7%-5.9%)
 * with standard deductions, personal exemptions, and state EITC.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { MT_RULES_2025 } from '../../../rules/2025/states/mt';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeMT2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  const mtAGI = federalResult.agi;
  const standardDeduction = MT_RULES_2025.standardDeduction[filingStatus];

  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = MT_RULES_2025.personalExemption * numberOfExemptions;

  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const mtTaxableIncome = max0(subtractCents(mtAGI, totalDeductions));

  const fullBrackets = convertToFullBrackets(MT_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(mtTaxableIncome, fullBrackets);

  const federalEITC = federalResult.credits?.earnedIncomeCredit || 0;
  const mtEITC = Math.round(federalEITC * MT_RULES_2025.eitcPercentage);
  const taxAfterCredits = max0(taxBeforeCredits - mtEITC);

  const refundableEITC = Math.max(0, mtEITC - taxBeforeCredits);
  const finalTax = taxAfterCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments + refundableEITC - finalTax;

  return {
    stateAGI: mtAGI,
    stateTaxableIncome: mtTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: mtEITC - refundableEITC,
      refundableCredits: refundableEITC,
      personal_exemption: personalExemptions,
      eitc: mtEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'MT',
    taxYear: 2025,
    calculationNotes: [
      `Montana uses 3-bracket progressive system (4.7%-5.9%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      mtEITC > 0 ? `Montana EITC (3% of federal, refundable): $${(mtEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
