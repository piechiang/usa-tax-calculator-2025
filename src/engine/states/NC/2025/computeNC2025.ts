/**
 * North Carolina State Tax Calculation Engine for 2025
 *
 * Implements North Carolina's simple flat income tax system:
 * - 4.25% flat rate on all taxable income
 * - Standard deduction: $12,750 (single) / $25,500 (MFJ) / $19,125 (HOH)
 * - No personal exemptions
 *
 * Sources:
 * - North Carolina Department of Revenue (NCDOR)
 * - https://www.ncdor.gov
 * - 2025 Tax Rate: 4.25% (down from 4.5% in 2024)
 *
 * @module computeNC2025
 */

import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  NC_RULES_2025,
  calculateNorthCarolinaTax,
  type NorthCarolinaSpecificInput,
} from '../../../rules/2025/states/nc';
import { subtractCents, addCents, max0 } from '../../../util/money';

/**
 * Compute North Carolina state income tax for 2025
 *
 * @param input Unified state tax input with federal results
 * @returns North Carolina state tax calculation result
 */
export function computeNC2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateSpecific } = input;
  const ncSpecific = stateSpecific as NorthCarolinaSpecificInput | undefined;

  // Step 1: Calculate North Carolina AGI (starts with federal AGI)
  const ncAGI = federalResult.agi;

  // Step 2: Calculate standard deduction based on filing status
  const standardDeduction = getStandardDeduction(filingStatus, ncSpecific);

  // Step 3: Calculate North Carolina taxable income
  const ncTaxableIncome = max0(subtractCents(ncAGI, standardDeduction));

  // Step 4: Calculate North Carolina tax (flat rate on taxable income)
  const ncTax = calculateNorthCarolinaTax(ncTaxableIncome);

  // Step 5: Build credits structure (NC has minimal credits in basic implementation)
  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  // Step 6: Calculate final tax
  const finalTax = ncTax;

  // Step 7: Calculate refund or amount owed
  const stateWithheld = input.stateWithheld ?? 0;
  const stateEstPayments = input.stateEstPayments ?? 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax; // Positive = refund, negative = owe

  return {
    state: 'NC',
    taxYear: 2025,
    stateAGI: ncAGI,
    stateTaxableIncome: ncTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // NC has no local income tax at state level
    totalStateLiability: finalTax,
    stateDeduction: standardDeduction,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    calculationNotes: [
      `North Carolina uses a flat 4.25% tax rate`,
      `Standard deduction: ${formatCents(standardDeduction)}`,
      `No personal exemptions`,
      standardDeduction === 0 && filingStatus === 'marriedSeparately'
        ? `Standard deduction is $0 because spouse is itemizing`
        : undefined,
    ].filter((note): note is string => note !== undefined),
  };
}

/**
 * Get standard deduction based on filing status
 *
 * Special rules:
 * - If MFS and spouse itemizes, standard deduction is $0
 * - Must be eligible for federal standard deduction
 */
function getStandardDeduction(
  filingStatus: string,
  ncSpecific?: NorthCarolinaSpecificInput
): number {
  const { standardDeduction } = NC_RULES_2025;

  // Special rule for MFS: if spouse itemizes, this taxpayer must also itemize (SD = $0)
  if (filingStatus === 'marriedSeparately' && ncSpecific?.spouseItemizing) {
    return 0;
  }

  switch (filingStatus) {
    case 'single':
      return standardDeduction.single;
    case 'marriedJointly':
      return standardDeduction.marriedJointly;
    case 'marriedSeparately':
      return standardDeduction.marriedSeparately;
    case 'headOfHousehold':
      return standardDeduction.headOfHousehold;
    default:
      return standardDeduction.single;
  }
}

/**
 * Format cents as dollar string (for calculation notes)
 */
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
