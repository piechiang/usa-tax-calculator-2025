/**
 * Arizona State Tax Calculation Engine for 2025
 *
 * Implements Arizona's flat income tax system:
 * - 2.5% flat rate on Arizona taxable income
 * - Standard deduction: $15,750 (single) / $31,500 (MFJ)
 * - Additional deduction for age 65+ ($6,000 with income limits)
 * - Dependent exemptions ($1,000/$500/$300 based on AGI)
 * - Charitable contribution standard deduction increase (33%)
 *
 * Sources:
 * - Arizona Department of Revenue
 * - https://azdor.gov
 * - 2025 Tax Rate: 2.5% flat (transitioned from progressive in 2023)
 *
 * @module computeAZ2025
 */

import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  AZ_RULES_2025,
  calculateArizonaTax,
  getStandardDeduction,
  calculateAge65AdditionalDeduction,
  calculateDependentExemption,
  calculateCharitableDeductionIncrease,
  type ArizonaSpecificInput,
} from '../../../rules/2025/states/az';
import { addCents, subtractCents, max0 } from '../../../util/money';

/**
 * Compute Arizona state income tax for 2025
 *
 * Arizona tax calculation steps:
 * 1. Start with federal AGI
 * 2. Calculate standard deduction (based on filing status)
 * 3. Add age 65+ additional deduction (if applicable)
 * 4. Add charitable contribution deduction increase (if applicable)
 * 5. Calculate dependent exemptions (based on AGI)
 * 6. Calculate Arizona taxable income
 * 7. Apply 2.5% flat tax rate
 * 8. Calculate refund or amount owed
 *
 * @param input Unified state tax input with federal results
 * @returns Arizona state tax calculation result
 */
export function computeAZ2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateDependents, stateSpecific } = input;
  const azSpecific = stateSpecific as ArizonaSpecificInput | undefined;

  // Step 1: Calculate Arizona AGI (starts with federal AGI)
  const azAGI = federalResult.agi;

  // Step 2: Calculate base standard deduction
  const baseStandardDeduction = getStandardDeduction(filingStatus);

  // Step 3: Calculate age 65+ additional deduction
  const age65AdditionalDeduction = calculateAge65AdditionalDeduction(
    azSpecific?.age,
    azSpecific?.spouseAge,
    azAGI,
    filingStatus
  );

  // Step 4: Calculate charitable contribution deduction increase
  const charitableDeductionIncrease = calculateCharitableDeductionIncrease(
    azSpecific?.charitableContributions ?? 0
  );

  // Step 5: Calculate total standard deduction
  const totalStandardDeduction = addCents(
    addCents(baseStandardDeduction, age65AdditionalDeduction),
    charitableDeductionIncrease
  );

  // Step 6: Calculate dependent exemptions
  const numberOfDependents = stateDependents ?? 0;
  const dependentExemption = calculateDependentExemption(azAGI, numberOfDependents);

  // Step 7: Calculate total deductions
  const totalDeductions = addCents(totalStandardDeduction, dependentExemption);

  // Step 8: Calculate Arizona taxable income
  const azTaxableIncome = max0(subtractCents(azAGI, totalDeductions));

  // Step 9: Calculate Arizona tax (flat rate on taxable income)
  const azTax = calculateArizonaTax(azTaxableIncome);

  // Step 10: Build credits structure (AZ has minimal credits in basic implementation)
  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  // Step 11: Calculate final tax
  const finalTax = azTax;

  // Step 12: Calculate refund or amount owed
  const stateWithheld = input.stateWithheld ?? 0;
  const stateEstPayments = input.stateEstPayments ?? 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax; // Positive = refund, negative = owe

  // Build calculation notes
  const notes: string[] = [
    `Arizona uses a flat 2.5% tax rate (transitioned from progressive in 2023)`,
    `Base standard deduction: ${formatCents(baseStandardDeduction)}`,
  ];

  if (age65AdditionalDeduction > 0) {
    notes.push(`Age 65+ additional deduction: ${formatCents(age65AdditionalDeduction)}`);
  }

  if (charitableDeductionIncrease > 0) {
    notes.push(
      `Charitable contribution deduction increase (33%): ${formatCents(charitableDeductionIncrease)}`
    );
  }

  if (dependentExemption > 0) {
    notes.push(
      `Dependent exemptions (${numberOfDependents} dependent${numberOfDependents > 1 ? 's' : ''}): ${formatCents(dependentExemption)}`
    );
  }

  return {
    state: 'AZ',
    taxYear: 2025,
    stateAGI: azAGI,
    stateTaxableIncome: azTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // AZ has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: totalStandardDeduction,
    stateExemptions: dependentExemption,
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
