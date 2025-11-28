/**
 * Utah State Tax Computation for 2025
 *
 * Implements Utah's flat 4.65% income tax rate
 * Utah uses tax credits instead of traditional deductions.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { UT_RULES_2025 } from '../../../rules/2025/states/ut';
import { addCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeUT2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0, stateDependents = 0 } = input;

  // Step 1: Utah AGI = Federal AGI
  const utAGI = federalResult.agi;

  // Step 2: Utah taxable income = AGI (no standard deduction, uses credits instead)
  const utTaxableIncome = utAGI;

  // Step 3: Calculate tax at flat 4.65% rate
  const fullBrackets = convertToFullBrackets(UT_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(utTaxableIncome, fullBrackets);

  // Step 4: Apply personal exemption credits ($785 per exemption)
  const numberOfExemptions = filingStatus === 'marriedJointly' ? 2 + stateDependents : 1 + stateDependents;
  const personalExemptionCredit = (UT_RULES_2025.personalExemptionCredit || 0) * numberOfExemptions;

  // Step 5: Final tax after credits
  const finalTax = max0(taxBeforeCredits - personalExemptionCredit);

  // Step 6: Calculate refund or amount owed
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  return {
    stateAGI: utAGI,
    stateTaxableIncome: utTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: 0, // Utah uses credits, not deductions
    stateCredits: {
      nonRefundableCredits: personalExemptionCredit,
      refundableCredits: 0,
      personal_exemption_credit: personalExemptionCredit,
    },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'UT',
    taxYear: 2025,
    calculationNotes: [
      `Utah uses flat 4.65% tax rate`,
      `Personal exemption credits: $${(personalExemptionCredit / 100).toFixed(2)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''} × $785)`,
      `Utah uses tax credits instead of standard deductions`,
    ],
  };
}
