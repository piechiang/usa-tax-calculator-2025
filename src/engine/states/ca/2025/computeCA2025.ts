import { TaxPayerInput, StateResult, FederalResult2025 } from '../../../types';
import { CA_RULES_2025 } from '../../../rules/2025/states/ca';
import { max0, safeCurrencyToCents, multiplyCents } from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/math';

/**
 * Compute California state tax for 2025 (simplified)
 */
export function computeCA2025(
  input: TaxPayerInput,
  federalResult: FederalResult2025
): StateResult {
  const caAGI = federalResult.agi;

  const standardDeduction =
    CA_RULES_2025.standardDeduction[
      input.filingStatus as keyof typeof CA_RULES_2025.standardDeduction
    ] || CA_RULES_2025.standardDeduction.single;

  const taxableIncome = max0(caAGI - standardDeduction);
  const stateTax = calculateTaxFromBrackets(taxableIncome, CA_RULES_2025.brackets);
  const caEITC = multiplyCents(
    federalResult.credits.eitc || 0,
    CA_RULES_2025.eitcPercentage
  );
  const netStateTax = max0(stateTax - caEITC);
  const stateWithheld = safeCurrencyToCents(input.payments?.stateWithheld);
  const totalStateLiability = netStateTax;
  const stateRefundOrOwe = stateWithheld - totalStateLiability;

  return {
    state: 'CA',
    year: 2025,
    agiState: caAGI,
    taxableIncomeState: taxableIncome,
    stateTax: netStateTax,
    totalStateLiability,
    stateWithheld,
    stateRefundOrOwe,
  };
}

export function isCaliforniaResident(input: TaxPayerInput): boolean {
  return input.state === 'CA';
}
