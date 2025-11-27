/**
 * Wisconsin State Tax Calculation for 2025
 *
 * Implements Wisconsin's 4-bracket progressive income tax system.
 */

import type { FilingStatus } from '../../../types';
import type { StateResult, StateCredits } from '../../../types/stateTax';
import {
  WI_TAX_BRACKETS_2025,
  WI_STANDARD_DEDUCTION_2025,
  WI_STANDARD_DEDUCTION_PHASEOUT_2025,
  WI_PERSONAL_EXEMPTION_2025,
  WI_EITC_PERCENTAGE_2025,
} from '../../../rules/2025/states/wi';

export interface WisconsinInput2025 {
  filingStatus: FilingStatus;
  federalAGI: number; // Federal AGI (cents)
  exemptions: number; // Number of exemptions (self + spouse + dependents)
  federalEITC?: number; // Federal EITC amount for state EITC calculation (cents)
  qualifyingChildrenCount?: number; // Number of qualifying children for EITC
  stateWithholding: number; // Wisconsin tax withheld (cents)
}

/**
 * Calculate Wisconsin state income tax for 2025
 *
 * Steps:
 * 1. Start with federal AGI (simplified - no state modifications)
 * 2. Subtract standard deduction (with phase-out if applicable)
 * 3. Subtract personal exemptions ($700 per exemption)
 * 4. Calculate tax using 4-bracket progressive system
 * 5. Apply credits (state EITC if applicable)
 * 6. Calculate refund/owe
 */
export function computeWI2025(input: WisconsinInput2025): StateResult {
  const {
    filingStatus,
    federalAGI,
    exemptions,
    federalEITC = 0,
    qualifyingChildrenCount = 0,
    stateWithholding,
  } = input;

  // Step 1: Wisconsin AGI (simplified - use federal AGI)
  const wisconsinAGI = federalAGI;

  // Step 2: Calculate standard deduction with phase-out
  const baseStandardDeduction = WI_STANDARD_DEDUCTION_2025[filingStatus];
  const phaseoutInfo = WI_STANDARD_DEDUCTION_PHASEOUT_2025[filingStatus];

  let standardDeduction = baseStandardDeduction;

  if (wisconsinAGI > phaseoutInfo.threshold) {
    // Reduce deduction by $1 for every $10 over threshold
    const excessIncome = wisconsinAGI - phaseoutInfo.threshold;
    const reduction = Math.floor(excessIncome * phaseoutInfo.rate);
    standardDeduction = Math.max(0, baseStandardDeduction - reduction);
  }

  // Step 3: Subtract personal exemptions
  const totalExemptions = exemptions * WI_PERSONAL_EXEMPTION_2025;

  // Step 4: Calculate taxable income
  const taxableIncome = Math.max(0, wisconsinAGI - standardDeduction - totalExemptions);

  // Step 5: Calculate tax using progressive brackets
  const brackets = WI_TAX_BRACKETS_2025[filingStatus];
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousMax) {
      break;
    }

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - previousMax;
    tax += Math.round(taxableInBracket * bracket.rate);
    previousMax = bracket.max;

    if (taxableIncome <= bracket.max) {
      break;
    }
  }

  // Step 6: Calculate credits
  let credits = 0;

  // State EITC (percentage of federal EITC)
  if (federalEITC > 0 && qualifyingChildrenCount > 0) {
    const eitcPercentage =
      qualifyingChildrenCount >= 3
        ? WI_EITC_PERCENTAGE_2025[3]
        : WI_EITC_PERCENTAGE_2025[qualifyingChildrenCount as 1 | 2];

    const stateEITC = Math.round(federalEITC * eitcPercentage);
    credits += stateEITC;
  }

  // Step 7: Calculate final tax liability
  const taxAfterCredits = Math.max(0, tax - credits);

  // Step 8: Calculate refund or amount owed
  const refundOrOwed = stateWithholding - taxAfterCredits;

  // Build state credits object
  const stateCredits: StateCredits = {
    earned_income: federalEITC > 0 && qualifyingChildrenCount > 0 ? credits : 0,
    nonRefundableCredits: 0,
    refundableCredits: credits,
  };

  return {
    // Core amounts
    stateAGI: wisconsinAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0, // Wisconsin has no local income tax
    totalStateLiability: taxAfterCredits,

    // Deductions and exemptions
    stateDeduction: standardDeduction,
    stateExemptions: totalExemptions,

    // Credits
    stateCredits,

    // Payments and balance
    stateWithheld: stateWithholding,
    stateEstPayments: 0,
    stateRefundOrOwe: refundOrOwed,

    // Metadata
    state: 'WI',
    taxYear: 2025,
  };
}
