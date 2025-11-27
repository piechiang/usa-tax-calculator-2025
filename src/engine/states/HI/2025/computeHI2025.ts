import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { HI_RULES_2025 } from '../../../rules/2025/states/hi';
import {
  addCents,
  max0,
  multiplyCents
} from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute Hawaii state tax for 2025
 *
 * Hawaii has a highly progressive income tax (1.4%-11%) with 12 brackets.
 * Low standard deductions and personal exemptions apply.
 *
 * Sources:
 * - Hawaii Department of Taxation
 * - https://tax.hawaii.gov/geninfo/rates/
 *
 * @param input Unified state tax input with federal results
 * @returns Hawaii state tax calculation result
 */
export function computeHI2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus } = input;

  // Step 1: Calculate HI AGI (follows federal AGI)
  const hiAGI = calculateHIAGI(input);

  // Step 2: Calculate HI deductions and exemptions
  const deductionsAndExemptions = calculateHIDeductionsAndExemptions(input, hiAGI);

  // Step 3: Calculate HI taxable income
  const hiTaxableIncome = max0(hiAGI - deductionsAndExemptions);

  // Step 4: Calculate HI state tax using progressive brackets
  const brackets = HI_RULES_2025.brackets[filingStatus];
  const hiStateTax = calculateTaxFromBrackets(hiTaxableIncome, brackets);

  // Step 5: No state EITC in Hawaii
  const credits: StateCredits = {
    earned_income: 0,
    nonRefundableCredits: 0,
    refundableCredits: 0
  };

  // Step 6: Calculate net HI tax
  const netHITax = hiStateTax;
  const totalStateLiability = netHITax;

  // Step 7: Calculate payments and refund/owe
  const stateWithheld = input.stateWithheld || 0;
  const stateEstPayments = input.stateEstPayments || 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const stateRefundOrOwe = totalPayments - totalStateLiability;

  return {
    stateAGI: hiAGI,
    stateTaxableIncome: hiTaxableIncome,
    stateTax: netHITax,
    localTax: 0,
    totalStateLiability,
    stateDeduction: deductionsAndExemptions,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe,
    state: 'HI',
    taxYear: 2025,
    formReferences: ['N-11', 'N-15'],
    calculationNotes: [
      'Hawaii standard deduction and personal exemptions applied',
      'Progressive 12-bracket tax structure (1.4%-11%)'
    ]
  };
}

function calculateHIAGI(input: StateTaxInput): number {
  let hiAGI = input.federalResult.agi;

  if (input.stateAdditions) {
    hiAGI = addCents(hiAGI, input.stateAdditions);
  }

  if (input.stateSubtractions) {
    hiAGI = max0(hiAGI - input.stateSubtractions);
  }

  return hiAGI;
}

function calculateHIDeductionsAndExemptions(input: StateTaxInput, hiAGI: number): number {
  const { filingStatus, dependents } = input;

  // Standard deduction
  const standardDeduction = HI_RULES_2025.standardDeduction[filingStatus];

  // Itemized deductions (HI allows itemized if taxpayer itemizes federally)
  let deduction = standardDeduction;
  if (input.itemizedDeductions && input.itemizedDeductions > standardDeduction) {
    deduction = input.itemizedDeductions;
  }

  // Personal exemptions
  const exemptionCount = getHIExemptionCount(input);
  const totalExemptions = multiplyCents(HI_RULES_2025.personalExemption, exemptionCount);

  return addCents(deduction, totalExemptions);
}

function getHIExemptionCount(input: StateTaxInput): number {
  const { filingStatus, dependents } = input;

  let exemptions = 0;

  if (filingStatus === 'marriedJointly') {
    exemptions = 2;
  } else {
    exemptions = 1;
  }

  exemptions += dependents || 0;

  return exemptions;
}
