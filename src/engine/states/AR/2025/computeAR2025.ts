/**
 * Arkansas State Tax Computation for 2025
 *
 * Implements Arkansas's 5-bracket progressive income tax system (2%-4.7%)
 * with standard deductions and personal exemptions.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { AR_RULES_2025 } from '../../../rules/2025/states/ar';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute Arkansas state tax for 2025
 *
 * @param input - State tax input including federal result and AR-specific data
 * @returns Arkansas state tax result
 */
export function computeAR2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  // Step 1: Arkansas AGI = Federal AGI (no modifications for basic case)
  const arAGI = federalResult.agi;

  // Step 2: Calculate standard deduction
  const standardDeduction = AR_RULES_2025.standardDeduction[filingStatus];

  // Step 3: Calculate personal exemptions
  // $29 per exemption (taxpayer, spouse if MFJ, dependents)
  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptions = AR_RULES_2025.personalExemption * numberOfExemptions;

  // Step 4: Calculate Arkansas taxable income
  const totalDeductions = addCents(standardDeduction, personalExemptions);
  const arTaxableIncome = max0(subtractCents(arAGI, totalDeductions));

  // Step 5: Calculate tax using progressive brackets
  const taxBeforeCredits = calculateTaxFromBrackets(arTaxableIncome, AR_RULES_2025.brackets[filingStatus]);

  // Step 6: Final tax liability (no state EITC or other credits in AR)
  const finalTax = taxBeforeCredits;

  // Step 7: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  // Build result
  return {
    stateAGI: arAGI,
    stateTaxableIncome: arTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Arkansas has no state-administered local income tax
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
    state: 'AR',
    taxYear: 2025,
    calculationNotes: [
      `Arkansas uses 5-bracket progressive system (2%-4.7%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
      `Personal exemptions: $${(personalExemptions / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
    ],
  };
}
