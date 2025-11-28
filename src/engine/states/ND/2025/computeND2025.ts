/**
 * North Dakota State Tax Computation for 2025
 *
 * Implements North Dakota's 3-bracket progressive income tax system (1.95%-2.5%)
 * Among the lowest state income tax rates in the nation.
 */

import type { StateTaxInput, StateResult } from '../../../types';
import { ND_RULES_2025 } from '../../../rules/2025/states/nd';
import { addCents, subtractCents, max0 } from '../../../util/money';
import { calculateTaxFromBrackets, convertToFullBrackets } from '../../../util/taxCalculations';

export function computeND2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateWithheld = 0, stateEstPayments = 0 } = input;

  const ndAGI = federalResult.agi;
  const standardDeduction = ND_RULES_2025.standardDeduction[filingStatus];
  const ndTaxableIncome = max0(subtractCents(ndAGI, standardDeduction));

  const fullBrackets = convertToFullBrackets(ND_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(ndTaxableIncome, fullBrackets);
  const finalTax = taxBeforeCredits;

  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax;

  return {
    stateAGI: ndAGI,
    stateTaxableIncome: ndTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: { nonRefundableCredits: 0, refundableCredits: 0 },
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    state: 'ND',
    taxYear: 2025,
    calculationNotes: [
      `North Dakota uses 3-bracket progressive system (1.95%-2.5%)`,
      `Standard deduction: $${(standardDeduction / 100).toFixed(2)}`,
    ],
  };
}
