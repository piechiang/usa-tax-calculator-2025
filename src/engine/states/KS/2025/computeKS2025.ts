/**
 * Kansas State Tax Computation for 2025
 *
 * Implements Kansas's 3-bracket progressive income tax system (3.1%-5.7%)
 * with standard deductions, personal exemptions, and state EITC.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { KS_RULES_2025 } from '../../../rules/2025/states/ks';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

/**
 * Compute Kansas state tax for 2025
 *
 * @param input - State tax input including federal result and KS-specific data
 * @returns Kansas state tax result
 */
export function computeKS2025(input: StateTaxInput): StateResult {
  const {
    federalResult,
    filingStatus,
    stateWithheld = 0,
    stateEstPayments = 0,
    stateDependents = 0,
  } = input;

  // Step 1: Kansas AGI = Federal AGI (no modifications for basic case)
  const ksAGI = federalResult.agi;

  // Step 2: Calculate standard deduction
  const standardDeduction = KS_RULES_2025.standardDeduction[filingStatus];

  // Step 3: Calculate personal exemptions
  // $2,250 per exemption (taxpayer, spouse if MFJ, dependents)
  const numberOfExemptions =
    filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = KS_RULES_2025.personalExemption * numberOfExemptions;

  // Step 4: Calculate Kansas taxable income
  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const ksTaxableIncome = max0(subtractCents(ksAGI, totalDeductions));

  // Step 5: Calculate tax using progressive brackets
  const fullBrackets = convertToFullBrackets(KS_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(ksTaxableIncome, fullBrackets);

  // Step 6: Apply Kansas EITC (17% of federal EITC, refundable)
  const federalEITC = federalResult.credits?.eitc || 0;
  const ksEITC = Math.round(federalEITC * KS_RULES_2025.eitcPercentage);
  const taxAfterCredits = max0(taxBeforeCredits - ksEITC);

  // Kansas EITC is refundable, so track refundable portion
  const refundableEITC = Math.max(0, ksEITC - taxBeforeCredits);
  const finalTax = taxAfterCredits;

  // Step 7: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments + refundableEITC - finalTax;

  // Build result
  return {
    stateAGI: ksAGI,
    stateTaxableIncome: ksTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Kansas has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: {
      nonRefundableCredits: ksEITC - refundableEITC,
      refundableCredits: refundableEITC,
      personal_exemption: personalExemptions,
      eitc: ksEITC,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'KS',
    taxYear: 2025,
    calculationNotes: [
      `Kansas uses 3-bracket progressive system (3.1%-5.7%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      ksEITC > 0 ? `Kansas EITC (17% of federal, refundable): $${(ksEITC / 100).toFixed(2)}` : null,
    ].filter((note): note is string => note !== null),
  };
}
