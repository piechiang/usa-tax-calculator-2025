/**
 * Michigan State Tax Calculation for 2025
 *
 * Implements Michigan's flat 4.25% income tax system with personal exemptions.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  MI_TAX_RATE_2025,
  MI_PERSONAL_EXEMPTION_2025,
  MI_EITC_PERCENTAGE_2025,
  calculateMIExemptions,
} from '../../../rules/2025/states/mi';

export interface MichiganInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  dependents: number; // Number of dependents
  federalEITC?: number; // Federal EITC amount for state EITC calculation (cents)
  stateWithholding: number; // Michigan tax withheld (cents)
}

/**
 * Calculate Michigan state income tax for 2025
 *
 * Steps:
 * 1. Start with federal AGI (Michigan AGI = Federal AGI, simplified)
 * 2. Calculate personal exemptions (taxpayer + spouse + dependents)
 * 3. Calculate taxable income (AGI - exemptions, no standard deduction)
 * 4. Apply flat 4.25% tax rate
 * 5. Calculate state EITC (30% of federal, refundable)
 * 6. Calculate final tax liability
 * 7. Calculate refund/owe
 */
export function computeMI2025(input: MichiganInput2025): StateResult {
  const {
    filingStatus,
    federalAGI,
    dependents,
    federalEITC = 0,
    stateWithholding,
  } = input;

  // Step 1: Michigan AGI (simplified - use federal AGI)
  const michiganAGI = federalAGI;

  // Step 2: Calculate personal exemptions
  const exemptionCount = calculateMIExemptions(filingStatus, dependents);
  const totalExemptions = exemptionCount * MI_PERSONAL_EXEMPTION_2025;

  // Step 3: Calculate taxable income
  // Note: Michigan has NO standard deduction, only personal exemptions
  const taxableIncome = Math.max(0, michiganAGI - totalExemptions);

  // Step 4: Apply flat 4.25% tax rate
  const tax = Math.round(taxableIncome * MI_TAX_RATE_2025);

  // Step 5: Calculate state EITC (30% of federal, refundable)
  let stateEITC = 0;
  if (federalEITC > 0) {
    stateEITC = Math.round(federalEITC * MI_EITC_PERCENTAGE_2025);
  }

  // Step 6: Calculate final tax liability
  // EITC is refundable, so it can create a negative tax (refund)
  const taxAfterCredits = tax - stateEITC;

  // Step 7: Calculate refund or amount owed
  const refundOrOwed = stateWithholding - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    earned_income: stateEITC,
    nonRefundableCredits: 0,
    refundableCredits: stateEITC, // Michigan EITC is fully refundable
  };

  return {
    // Core amounts
    stateAGI: michiganAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: Math.max(0, taxAfterCredits), // Tax can't be negative (EITC refunds via stateRefundOrOwe)
    localTax: 0, // Michigan has no state-administered local income tax
    totalStateLiability: Math.max(0, taxAfterCredits),

    // Deductions and exemptions
    stateDeduction: 0, // Michigan has NO standard deduction
    stateExemptions: totalExemptions,

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'MI',
    taxYear: 2025,
    calculationNotes: [
      `Flat tax rate: 4.25%`,
      `Personal exemptions: ${exemptionCount} × $${(MI_PERSONAL_EXEMPTION_2025 / 100).toFixed(2)} = $${(totalExemptions / 100).toFixed(2)}`,
      stateEITC > 0
        ? `State EITC (refundable): $${(stateEITC / 100).toFixed(2)} (30% of federal)`
        : 'No state EITC',
    ],
  };
}
