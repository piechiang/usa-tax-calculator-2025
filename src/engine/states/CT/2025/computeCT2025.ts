/**
 * Connecticut State Tax Calculation Engine for 2025
 *
 * Implements Connecticut's progressive income tax system:
 * - 7 tax brackets (2% to 6.99%)
 * - Personal exemption treated as a credit
 * - No traditional standard deduction
 * - Personal tax credit (income-based phaseout)
 * - Connecticut EITC (40% of federal EITC)
 *
 * Sources:
 * - Connecticut Department of Revenue Services
 * - https://portal.ct.gov/drs
 * - 2025 Tax Rates: 7 brackets (2%-6.99%)
 *
 * @module computeCT2025
 */

import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  calculateConnecticutTax,
  calculatePersonalExemptionCredit,
  calculatePersonalTaxCredit,
  calculateConnecticutEITC,
  type ConnecticutSpecificInput,
} from '../../../rules/2025/states/ct';
import { subtractCents, addCents, max0 } from '../../../util/money';

/**
 * Compute Connecticut state income tax for 2025
 *
 * Connecticut tax calculation steps:
 * 1. Start with federal AGI (CT AGI)
 * 2. Calculate taxable income (no state standard deduction)
 * 3. Apply progressive tax rates (7 brackets)
 * 4. Calculate personal exemption credit
 * 5. Calculate personal tax credit (income-based)
 * 6. Calculate CT EITC (40% of federal EITC, refundable)
 * 7. Calculate final tax and refund/owe
 *
 * @param input Unified state tax input with federal results
 * @returns Connecticut state tax calculation result
 */
export function computeCT2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateSpecific } = input;
  const ctSpecific = stateSpecific as ConnecticutSpecificInput | undefined;

  // Step 1: Calculate Connecticut AGI (starts with federal AGI)
  const ctAGI = federalResult.agi;

  // Step 2: Calculate Connecticut taxable income
  // CT does not have a traditional standard deduction, so taxable income = AGI
  const ctTaxableIncome = max0(ctAGI);

  // Step 3: Calculate Connecticut tax using progressive brackets
  const taxBeforeCredits = calculateConnecticutTax(ctTaxableIncome, filingStatus);

  // Step 4: Calculate personal exemption credit
  const personalExemptionCredit = calculatePersonalExemptionCredit(filingStatus);

  // Step 5: Calculate personal tax credit (income-based percentage of tax)
  const personalTaxCredit = calculatePersonalTaxCredit(taxBeforeCredits, ctAGI);

  // Step 6: Calculate total non-refundable credits
  const totalNonRefundableCredits = addCents(personalExemptionCredit, personalTaxCredit);

  // Apply non-refundable credits
  const taxAfterNonRefundableCredits = max0(
    subtractCents(taxBeforeCredits, totalNonRefundableCredits)
  );

  // Step 7: Calculate CT EITC (40% of federal EITC, refundable)
  const federalEITC = ctSpecific?.federalEITC ?? 0;
  const ctEITC = calculateConnecticutEITC(federalEITC);

  // Step 8: Build credits structure
  const credits: StateCredits = {
    personal_exemption: personalExemptionCredit,
    personal_tax_credit: personalTaxCredit,
    other_credits: personalExemptionCredit + personalTaxCredit,
    earned_income: ctEITC,
    eitc: ctEITC,
    nonRefundableCredits: totalNonRefundableCredits,
    refundableCredits: ctEITC,
  };

  // Step 9: Calculate final tax
  const finalTax = max0(subtractCents(taxAfterNonRefundableCredits, ctEITC));

  // Step 10: Calculate refund or amount owed
  const stateWithheld = input.stateWithheld ?? 0;
  const stateEstPayments = input.stateEstPayments ?? 0;
  const totalPayments = addCents(addCents(stateWithheld, stateEstPayments), ctEITC);
  const refundOrOwe = totalPayments - finalTax; // Positive = refund, negative = owe

  // Build calculation notes
  const notes: string[] = [
    `Connecticut uses a progressive tax system with 7 brackets (2%-6.99%)`,
    `Tax before credits: ${formatCents(taxBeforeCredits)}`,
  ];

  if (personalExemptionCredit > 0) {
    notes.push(`Personal exemption credit: ${formatCents(personalExemptionCredit)}`);
  }

  if (personalTaxCredit > 0) {
    notes.push(`Personal tax credit (income-based): ${formatCents(personalTaxCredit)}`);
  }

  if (ctEITC > 0) {
    notes.push(`Connecticut EITC (40% of federal): ${formatCents(ctEITC)}`);
  }

  notes.push(`No traditional standard deduction (CT uses federal AGI directly)`);

  return {
    state: 'CT',
    taxYear: 2025,
    stateAGI: ctAGI,
    stateTaxableIncome: ctTaxableIncome,
    agiState: ctAGI,
    taxableIncomeState: ctTaxableIncome,
    stateTax: finalTax,
    localTax: 0, // CT has no state-administered local income tax
    totalStateLiability: finalTax,
    stateDeduction: 0, // No standard deduction
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
