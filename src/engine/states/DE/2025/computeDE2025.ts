/**
 * Delaware State Tax Computation for 2025
 *
 * Implements Delaware's 7-bracket progressive income tax system (0%-6.6%)
 * with standard deductions and personal exemptions.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { DE_RULES_2025 } from '../../../rules/2025/states/de';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

/**
 * Compute Delaware state tax for 2025
 *
 * @param input - State tax input including federal result and DE-specific data
 * @returns Delaware state tax result
 */
export function computeDE2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  // Step 1: Delaware AGI = Federal AGI (no modifications for basic case)
  const deAGI = federalResult.agi;

  // Step 2: Calculate standard deduction
  const standardDeduction = DE_RULES_2025.standardDeduction[filingStatus];

  // Step 3: Calculate personal exemptions
  // $110 per exemption (taxpayer, spouse if MFJ, dependents)
  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = DE_RULES_2025.personalExemption * numberOfExemptions;

  // Step 4: Calculate Delaware taxable income
  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const deTaxableIncome = max0(subtractCents(deAGI, totalDeductions));

  // Step 5: Calculate tax using progressive brackets
  const taxBeforeCredits = calculateTaxFromBrackets(deTaxableIncome, fullBrackets);

  // Step 6: Apply Delaware EITC (4.5% of federal EITC, non-refundable)
  const federalEITC = federalResult.credits?.earnedIncomeCredit || 0;
  const deEITC = Math.round(federalEITC * DE_RULES_2025.eitcPercentage);
  const finalTax = max0(taxBeforeCredits - deEITC);

  // Step 7: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  // Build result
  return {
    stateAGI: deAGI,
    stateTaxableIncome: deTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Delaware has no local income tax
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: deEITC,
      refundableCredits: 0,
      personal_exemption: personalExemptions,
      eitc: deEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'DE',
    taxYear: 2025,
    calculationNotes: [
      `Delaware uses 7-bracket progressive system (0%-6.6%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      deEITC > 0 ? `Delaware EITC (4.5% of federal): $${(deEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
