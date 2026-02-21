/**
 * Colorado State Tax Calculation Engine for 2025
 *
 * Implements Colorado's simple flat income tax system:
 * - 4.40% flat rate on Colorado taxable income
 * - Uses federal taxable income as base (no state standard deduction)
 * - State income tax addback for high earners
 * - No personal exemptions
 *
 * Sources:
 * - Colorado Department of Revenue
 * - https://tax.colorado.gov/individual-income-tax-guide
 * - 2025 Tax Rate: 4.40% flat
 *
 * @module computeCO2025
 */

import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  calculateColoradoTax,
  calculateStateIncomeAddback,
  type ColoradoSpecificInput,
} from '../../../rules/2025/states/co';
import { addCents, max0 } from '../../../util/money';

/**
 * Compute Colorado state income tax for 2025
 *
 * Colorado tax calculation steps:
 * 1. Start with federal taxable income (not federal AGI)
 * 2. Apply state income tax addback for high earners (if applicable)
 * 3. Calculate Colorado taxable income
 * 4. Apply 4.40% flat tax rate
 * 5. Calculate refund or amount owed
 *
 * @param input Unified state tax input with federal results
 * @returns Colorado state tax calculation result
 */
export function computeCO2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateSpecific } = input;
  const coSpecific = stateSpecific as ColoradoSpecificInput | undefined;

  // Step 1: Calculate Colorado AGI (starts with federal AGI)
  // Note: Colorado uses federal taxable income, but we'll use AGI and apply federal deduction
  const federalAGI = federalResult.agi;

  // Get federal deduction from federalResult or stateSpecific
  const federalDeduction = coSpecific?.federalDeduction ?? federalResult.standardDeduction ?? 0;

  // Step 2: Calculate federal taxable income
  const federalTaxableIncome = max0(federalAGI - federalDeduction);

  // Step 3: Apply state income tax addback for high earners
  const stateIncomeAddback = calculateStateIncomeAddback(
    federalAGI,
    federalDeduction,
    filingStatus
  );

  // Step 4: Calculate Colorado taxable income
  // Colorado taxable income = federal taxable income + addback
  const coloradoTaxableIncome = addCents(federalTaxableIncome, stateIncomeAddback);

  // Step 5: Calculate Colorado tax (flat rate on taxable income)
  const coloradoTax = calculateColoradoTax(coloradoTaxableIncome);

  // Step 6: Build credits structure (CO has minimal credits in basic implementation)
  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  // Step 7: Calculate final tax
  const finalTax = coloradoTax;

  // Step 8: Calculate refund or amount owed
  const stateWithheld = input.stateWithheld ?? 0;
  const stateEstPayments = input.stateEstPayments ?? 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax; // Positive = refund, negative = owe

  // Build calculation notes
  const notes: string[] = [
    `Colorado uses a flat 4.40% tax rate`,
    `Starting point: Federal taxable income (${formatCents(federalTaxableIncome)})`,
  ];

  if (stateIncomeAddback > 0) {
    notes.push(
      `State income tax addback applied: ${formatCents(stateIncomeAddback)} (high earner rule)`
    );
  }

  notes.push(`No state standard deduction or personal exemptions`);

  return {
    state: 'CO',
    taxYear: 2025,
    stateAGI: federalAGI, // CO AGI same as federal AGI
    stateTaxableIncome: coloradoTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // CO has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: 0, // No separate state deduction
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    calculationNotes: notes,
  };
}

/**
 * Format cents as dollar string (for calculation notes)
 */
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
