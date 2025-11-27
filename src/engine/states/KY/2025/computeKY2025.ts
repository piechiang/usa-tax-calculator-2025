/**
 * Kentucky State Tax Calculation for 2025
 *
 * Implements Kentucky's flat 4% income tax system.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  KY_TAX_RATE_2025,
  KY_STANDARD_DEDUCTION_2025,
  KY_CHILD_CARE_CREDIT_PERCENTAGE_2025,
} from '../../../rules/2025/states/ky';

export interface KentuckyInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  federalChildCareCredit?: number; // Federal Child and Dependent Care Credit (cents)
  stateWithholding: number; // Kentucky tax withheld (cents)
}

/**
 * Calculate Kentucky state income tax for 2025
 *
 * Steps:
 * 1. Start with federal AGI
 * 2. Subtract standard deduction
 * 3. Calculate tax at flat 4% rate
 * 4. Apply child care credit (20% of federal)
 * 5. Calculate refund/owe
 */
export function computeKY2025(input: KentuckyInput2025): StateResult {
  const {
    filingStatus,
    federalAGI,
    federalChildCareCredit = 0,
    stateWithholding,
  } = input;

  // Step 1: Kentucky AGI starts with federal AGI
  const kentuckyAGI = federalAGI;

  // Step 2: Calculate standard deduction
  const standardDeduction = KY_STANDARD_DEDUCTION_2025[filingStatus];

  // Step 3: Calculate taxable income
  const taxableIncome = Math.max(0, kentuckyAGI - standardDeduction);

  // Step 4: Calculate tax at flat 4% rate
  const tax = Math.round(taxableIncome * KY_TAX_RATE_2025);

  // Step 5: Calculate child care credit (20% of federal, non-refundable)
  const childCareCredit = Math.round(federalChildCareCredit * KY_CHILD_CARE_CREDIT_PERCENTAGE_2025);
  const nonRefundableCredits = Math.min(childCareCredit, tax);

  // Step 6: Calculate final tax liability
  const taxAfterCredits = Math.max(0, tax - nonRefundableCredits);

  // Step 7: Calculate refund or amount owed
  const refundOrOwed = stateWithholding - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    child_care: childCareCredit,
    nonRefundableCredits,
    refundableCredits: 0,
  };

  return {
    // Core amounts
    stateAGI: kentuckyAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // Kentucky has no state-administered local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: 0, // Kentucky has no personal exemptions

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'KY',
    taxYear: 2025,
    calculationNotes: [
      `Flat 4.0% tax rate applied to taxable income`,
      childCareCredit > 0
        ? `Child care credit: $${(childCareCredit / 100).toFixed(2)} (20% of federal credit)`
        : 'No child care credit',
    ],
  };
}
