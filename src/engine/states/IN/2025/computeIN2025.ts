/**
 * Indiana State Tax Calculation for 2025
 *
 * Implements Indiana's flat 3.0% income tax system with personal exemptions.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  IN_TAX_RATE_2025,
  IN_EITC_PERCENTAGE_2025,
  calculateINExemptions,
} from '../../../rules/2025/states/in';

export interface IndianaInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  dependents: number; // Number of dependents
  federalEITC?: number; // Federal EITC amount for state EITC calculation (cents)
  stateWithholding: number; // Indiana state tax withheld (cents)
  countyTaxRate?: number; // Optional county tax rate (e.g., 0.02 for 2%)
}

/**
 * Calculate Indiana state income tax for 2025
 *
 * Steps:
 * 1. Start with federal AGI (Indiana AGI = Federal AGI, simplified)
 * 2. Calculate personal exemptions (taxpayer + spouse + dependents)
 * 3. Calculate taxable income (AGI - exemptions, no standard deduction)
 * 4. Apply flat 3.0% state tax rate
 * 5. Apply optional county tax rate (if provided)
 * 6. Calculate state EITC (10% of federal, non-refundable)
 * 7. Calculate final tax liability
 * 8. Calculate refund/owe
 */
export function computeIN2025(input: IndianaInput2025): StateResult {
  const {
    filingStatus,
    federalAGI,
    dependents,
    federalEITC = 0,
    stateWithholding,
    countyTaxRate = 0, // Default: no county tax
  } = input;

  // Step 1: Indiana AGI (simplified - use federal AGI)
  const indianaAGI = federalAGI;

  // Step 2: Calculate personal exemptions
  const totalExemptions = calculateINExemptions(filingStatus, dependents);

  // Step 3: Calculate taxable income
  // Note: Indiana has NO standard deduction, only personal exemptions
  const taxableIncome = Math.max(0, indianaAGI - totalExemptions);

  // Step 4: Apply flat 3.0% state tax rate
  const stateTax = Math.round(taxableIncome * IN_TAX_RATE_2025);

  // Step 5: Apply optional county tax rate
  const countyTax = countyTaxRate > 0
    ? Math.round(taxableIncome * countyTaxRate)
    : 0;

  // Step 6: Calculate state EITC (10% of federal, non-refundable)
  let stateEITC = 0;
  if (federalEITC > 0) {
    stateEITC = Math.round(federalEITC * IN_EITC_PERCENTAGE_2025);
  }

  // Step 7: Calculate final tax liability
  // EITC is non-refundable, so it can only reduce tax to zero
  const totalTaxBeforeCredits = stateTax + countyTax;
  const taxAfterCredits = Math.max(0, totalTaxBeforeCredits - stateEITC);

  // Step 8: Calculate refund or amount owed
  const refundOrOwed = stateWithholding - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    earned_income: stateEITC,
    nonRefundableCredits: stateEITC, // Indiana EITC is non-refundable
    refundableCredits: 0,
  };

  return {
    // Core amounts
    stateAGI: indianaAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: countyTax, // County tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: 0, // Indiana has NO standard deduction
    stateExemptions: totalExemptions,

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'IN',
    taxYear: 2025,
    calculationNotes: [
      `State tax rate: 3.0%`,
      countyTaxRate > 0
        ? `County tax rate: ${(countyTaxRate * 100).toFixed(2)}%`
        : 'No county tax applied',
      `Personal exemptions: $${(totalExemptions / 100).toFixed(2)}`,
      stateEITC > 0
        ? `State EITC (non-refundable): $${(stateEITC / 100).toFixed(2)} (10% of federal)`
        : 'No state EITC',
    ],
  };
}
