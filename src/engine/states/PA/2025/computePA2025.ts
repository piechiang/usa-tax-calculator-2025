import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { PA_RULES_2025 } from '../../../rules/2025/states/pa/pa';
import {
  addCents,
  max0,
  multiplyCents
} from '../../../util/money';

/**
 * Compute Pennsylvania state tax for 2024-2025
 *
 * Pennsylvania has the SIMPLEST state income tax structure in the US:
 * - Flat 3.07% rate on ALL income
 * - NO standard deduction
 * - NO personal exemptions
 * - Retirement income FULLY EXEMPT
 * - Minimal credits (tax forgiveness for low income only)
 *
 * Sources:
 * - Pennsylvania Department of Revenue
 * - https://www.revenue.pa.gov/FormsandPublications/FormsforIndividuals/PIT/Pages/default.aspx
 * - PA-40 (Personal Income Tax Return)
 *
 * Key Features:
 * - Flat 3.07% tax on taxable income
 * - All retirement income exempt (pensions, 401k, IRA, Social Security)
 * - No deductions except limited items (HSA, 529, unreimbursed expenses)
 * - Tax Forgiveness Credit for low-income taxpayers
 *
 * @param input State tax input with federal results
 * @returns Pennsylvania state tax calculation result
 */
export function computePA2025(input: StateTaxInput): StateResult {
  // Step 1: Calculate Pennsylvania AGI
  // PA starts with federal AGI but excludes retirement income
  const paAGI = calculatePAAGI(input);

  // Step 2: Calculate Pennsylvania taxable income
  // For PA, this is essentially the same as PA AGI (no deductions/exemptions)
  const paTaxableIncome = max0(paAGI);

  // Step 3: Calculate Pennsylvania state tax
  // Simple: 3.07% flat tax on all taxable income
  const paStateTax = multiplyCents(paTaxableIncome, PA_RULES_2025.taxRate);

  // Step 4: No local tax at state level (handled separately by municipalities)
  const localTax = 0;

  // Step 5: Calculate Pennsylvania credits (minimal - mainly tax forgiveness)
  const credits: StateCredits = {
    // PA has no EITC, no child credits, no education credits
    // Only Tax Forgiveness Credit for very low income (not implemented here)
    nonRefundableCredits: 0,
    refundableCredits: 0
  };

  // Step 6: Calculate net Pennsylvania tax (no credits applied in basic calc)
  const netPAStateTax = paStateTax;
  const totalStateLiability = netPAStateTax;

  // Step 7: Calculate payments and refund/owe
  const stateWithheld = input.stateWithheld || 0;
  const stateEstPayments = input.stateEstPayments || 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const stateRefundOrOwe = totalPayments - totalStateLiability;

  return {
    stateAGI: paAGI,
    stateTaxableIncome: paTaxableIncome,
    stateTax: netPAStateTax,
    localTax,
    totalStateLiability,
    stateDeduction: 0, // PA has no standard deduction
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe,
    state: 'PA',
    taxYear: 2025,
    formReferences: ['PA-40', 'PA Schedule PA'],
    calculationNotes: [
      `Pennsylvania flat tax rate: 3.07%`,
      'No standard deduction or personal exemptions in PA',
      'Retirement income fully exempt from PA tax'
    ]
  };
}

/**
 * Calculate Pennsylvania Adjusted Gross Income
 *
 * TODO: Document Pennsylvania-specific AGI adjustments
 *
 * @param input - State tax input containing federal AGI and state-specific adjustments
 * @returns Pennsylvania AGI in cents
 */
function calculatePAAGI(input: StateTaxInput): number {
  let paAGI = input.federalResult.agi;

  // Pennsylvania additions to income
  if (input.stateAdditions) {
    paAGI += input.stateAdditions.federalTaxRefund || 0;
    paAGI += input.stateAdditions.municipalBondInterest || 0;
    paAGI += input.stateAdditions.otherAdditions || 0;
  }

  // Pennsylvania subtractions from income
  if (input.stateSubtractions) {
    paAGI -= input.stateSubtractions.socialSecurityBenefits || 0;
    paAGI -= input.stateSubtractions.retirementIncome || 0;
    paAGI -= input.stateSubtractions.militaryPay || 0;
    paAGI -= input.stateSubtractions.otherSubtractions || 0;
  }

  return max0(paAGI);
}
