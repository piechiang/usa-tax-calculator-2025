import { TaxPayerInput, StateResult, FederalResult2025 } from '../../../types';
import { NY_RULES_2025 } from '../../../rules/2025/states/ny';
import { max0, safeCurrencyToCents, multiplyCents } from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/math';

/**
 * Compute New York state tax for 2025 (simplified)
 */
export function computeNY2025(
  input: TaxPayerInput,
  federalResult: FederalResult2025
): StateResult {
  const nyAGI = federalResult.agi;

  const standardDeduction =
    NY_RULES_2025.standardDeduction[
      input.filingStatus as keyof typeof NY_RULES_2025.standardDeduction
    ] || NY_RULES_2025.standardDeduction.single;

  const taxableIncome = max0(nyAGI - standardDeduction);
  const stateTax = calculateTaxFromBrackets(taxableIncome, NY_RULES_2025.brackets);
  const nyEITC = multiplyCents(
    federalResult.credits.eitc || 0,
    NY_RULES_2025.eitcPercentage
  );
  const netStateTax = max0(stateTax - nyEITC);
  const stateWithheld = safeCurrencyToCents(input.payments?.stateWithheld);
  const totalStateLiability = netStateTax;
  const stateRefundOrOwe = stateWithheld - totalStateLiability;

  return {
    state: 'NY',
    year: 2025,
    agiState: nyAGI,
    taxableIncomeState: taxableIncome,
    stateTax: netStateTax,
    totalStateLiability,
    stateWithheld,
    stateRefundOrOwe,
  };
}

export function isNewYorkResident(input: TaxPayerInput): boolean {
  return input.state === 'NY';
}
