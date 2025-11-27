/**
 * Ohio State Tax Calculation Engine for 2025
 *
 * Implements Ohio's progressive 3-bracket income tax system with:
 * - 0% on first $26,050
 * - 2.75% on $26,051-$100,000
 * - 3.125% on $100,001+ (reduced from 3.5% in 2024)
 * - Standard deduction: $2,400 (single) / $4,800 (MFJ)
 * - Income-based personal exemptions
 * - $20 personal exemption credit for low-income taxpayers
 *
 * Sources:
 * - Ohio Department of Taxation
 * - Ohio HB 33 (2025-2026 Budget Bill)
 * - Ohio Revised Code Section 5747.025
 *
 * @module computeOH2025
 */

import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  OH_RULES_2025,
  calculateOhioTax,
  calculateOhioPersonalExemption,
  calculatePersonalExemptionCredit,
  type OhioSpecificInput,
} from '../../../rules/2025/states/oh';
import { addCents, subtractCents, max0 } from '../../../util/money';

/**
 * Compute Ohio state income tax for 2025
 *
 * @param input Unified state tax input with federal results
 * @returns Ohio state tax calculation result
 */
export function computeOH2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateDependents, stateSpecific } = input;
  const ohSpecific = stateSpecific as OhioSpecificInput | undefined;

  // Use state dependents if provided, otherwise fall back to 0
  const dependents = stateDependents ?? 0;

  // Step 1: Calculate Ohio AGI (starts with federal AGI)
  const ohioAGI = federalResult.agi;

  // Step 2: Calculate Modified Adjusted Gross Income (MAGI)
  // For Ohio, MAGI is typically the same as AGI for exemption calculations
  const ohioMAGI = ohioAGI;

  // Step 3: Calculate standard deduction based on filing status
  const standardDeduction = getStandardDeduction(filingStatus);

  // Step 4: Calculate number of exemptions
  // Taxpayer + spouse (if MFJ) + dependents
  const numberOfExemptions = getNumberOfExemptions(filingStatus, dependents);

  // Step 5: Calculate personal exemption amount
  const personalExemptionAmount = calculateOhioPersonalExemption(
    ohioMAGI,
    numberOfExemptions
  );

  // Step 6: Calculate total deductions
  const totalDeductions = addCents(standardDeduction, personalExemptionAmount);

  // Step 7: Calculate Ohio taxable income
  const ohioTaxableIncome = max0(subtractCents(ohioAGI, totalDeductions));

  // Step 8: Calculate base tax using progressive brackets
  const baseTax = calculateOhioTax(ohioTaxableIncome);

  // Step 9: Calculate $20 personal exemption credit (for low-income taxpayers)
  const personalExemptionCredit = calculatePersonalExemptionCredit(
    ohioTaxableIncome,
    numberOfExemptions
  );

  // Step 10: Calculate joint filing credit (if applicable)
  const jointFilingCredit = calculateJointFilingCredit(filingStatus, ohioMAGI);

  // Step 11: Build credits structure
  const totalCreditAmount = addCents(personalExemptionCredit, jointFilingCredit);
  const credits: StateCredits = {
    other_credits: totalCreditAmount,
    nonRefundableCredits: totalCreditAmount,
    refundableCredits: 0,
  };

  // Step 12: Calculate tax after credits
  const taxAfterCredits = max0(subtractCents(baseTax, totalCreditAmount));

  // Step 13: Calculate final tax or refund
  const finalTax = taxAfterCredits;
  const stateWithheld = input.stateWithheld ?? 0;
  const stateEstPayments = input.stateEstPayments ?? 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const refundOrOwe = totalPayments - finalTax; // Positive = refund, negative = owe

  return {
    state: 'OH',
    taxYear: 2025,
    stateAGI: ohioAGI,
    stateTaxableIncome: ohioTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // Ohio has no local income tax at state level
    totalStateLiability: finalTax,
    stateDeduction: totalDeductions,
    stateExemptions: personalExemptionAmount,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe: refundOrOwe,
    calculationNotes: [
      `Ohio uses 3 tax brackets: 0%, 2.75%, 3.125%`,
      `Standard deduction: ${formatCents(standardDeduction)}`,
      `Personal exemptions: ${formatCents(personalExemptionAmount)} (${numberOfExemptions} exemption${numberOfExemptions !== 1 ? 's' : ''})`,
      ohioMAGI > OH_RULES_2025.personalExemption.magiCap2025
        ? `MAGI (${formatCents(ohioMAGI)}) exceeds $750,000 cap - no exemptions/credits allowed`
        : undefined,
      totalCreditAmount > 0
        ? `Credits applied: ${formatCents(totalCreditAmount)}`
        : undefined,
    ].filter((note): note is string => note !== undefined),
  };
}

/**
 * Get standard deduction based on filing status
 */
function getStandardDeduction(filingStatus: string): number {
  const { standardDeduction } = OH_RULES_2025;

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
 * Calculate number of personal exemptions
 * - Single: 1 (taxpayer)
 * - MFJ: 2 (taxpayer + spouse)
 * - MFS: 1 (taxpayer)
 * - HOH: 1 (taxpayer)
 * - Plus dependents for all
 */
function getNumberOfExemptions(filingStatus: string, dependents: number): number {
  let exemptions = 1; // Taxpayer

  if (filingStatus === 'marriedJointly') {
    exemptions = 2; // Taxpayer + spouse
  }

  exemptions += dependents;

  return exemptions;
}

/**
 * Calculate joint filing credit
 * Only available for married filing jointly with MAGI < $750,000
 */
function calculateJointFilingCredit(filingStatus: string, magi: number): number {
  const { jointFilingCredit } = OH_RULES_2025;

  // Only for married filing jointly
  if (filingStatus !== 'marriedJointly') {
    return 0;
  }

  // Subject to MAGI cap
  if (magi > jointFilingCredit.magiCap) {
    return 0;
  }

  return jointFilingCredit.amount;
}

/**
 * Format cents as dollar string (for calculation notes)
 */
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
