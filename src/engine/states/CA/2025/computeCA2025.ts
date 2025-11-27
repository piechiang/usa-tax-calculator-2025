import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import type { FederalResult2025 } from '../../../types';
import { CA_BRACKETS_2025, CA_MHST_THRESHOLD_2025, CA_MHST_RATE } from '../rules/2025/brackets';
import {
  CA_STANDARD_DEDUCTION_2025,
  CA_MEDICAL_EXPENSE_THRESHOLD
} from '../rules/2025/deductions';
import {
  CALEITC_2025,
  YCTC_2025,
  CA_DEPENDENT_CREDIT_2025,
  CA_RENTERS_CREDIT_2025,
  CALEITC_MIN_EARNED_INCOME
} from '../rules/2025/credits';
import {
  calculateTaxFromBrackets,
  limitNonRefundableCredit
} from '../../../util/taxCalculations';
import { max0, addCents, multiplyCents } from '../../../util/money';

/**
 * Compute California state tax for 2025
 *
 * California has a progressive income tax with 10 brackets (1% to 13.3%)
 * The top 13.3% rate includes the 1% Mental Health Services Tax on income >$1M
 *
 * Sources:
 * - California Franchise Tax Board Publication 1001 (2025 Tax Rates and Exemptions)
 * - FTB Form 540 and Instructions
 * - California Revenue and Taxation Code
 * - https://www.ftb.ca.gov/forms/2025-california-tax-rates-and-exemptions.html
 *
 * Key Features:
 * - Standard deduction (no age/blindness add-ons)
 * - No personal exemptions (replaced with credits in 2019)
 * - California EITC (CalEITC) - more generous than federal for low incomes
 * - Young Child Tax Credit (YCTC) for children under 6
 * - Renter's credit
 * - Mental Health Services Tax on income >$1M
 *
 * @param input State tax input with federal results
 * @returns California state tax calculation result
 */
export function computeCA2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus } = input;

  // Step 1: Calculate California AGI
  const caAGI = calculateCAGI(input, federalResult);

  // Step 2: Calculate deductions
  const standardDeduction = CA_STANDARD_DEDUCTION_2025[filingStatus];
  const itemizedDeduction = calculateCAItemizedDeductions(input, caAGI);
  const deduction = Math.max(standardDeduction, itemizedDeduction);

  // Step 3: Calculate taxable income
  const taxableIncome = max0(caAGI - deduction);

  // Step 4: Calculate tax from brackets
  const brackets = CA_BRACKETS_2025[filingStatus];
  const baseTax = calculateTaxFromBrackets(taxableIncome, brackets);
  const mentalHealthTax = calculateMentalHealthSurtax(taxableIncome);
  const tax = addCents(baseTax, mentalHealthTax);

  // Step 5: Calculate credits
  const credits = calculateCACredits(input, federalResult, caAGI, tax);

  // Step 6: Calculate final liability
  const taxAfterNonRefundableCredits = max0(tax - credits.nonRefundableCredits);
  const totalLiability = taxAfterNonRefundableCredits;

  // Step 7: Calculate refund/owe
  const payments = addCents(
    input.stateWithheld || 0,
    input.stateEstPayments || 0
  );
  const refundOrOwe = payments + credits.refundableCredits - totalLiability;

  return {
    stateAGI: caAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: tax,
    localTax: 0, // California has no local income tax
    totalStateLiability: totalLiability,
    stateDeduction: deduction,
    stateCredits: credits,
    stateWithheld: input.stateWithheld || 0,
    stateEstPayments: input.stateEstPayments || 0,
    stateRefundOrOwe: refundOrOwe,
    state: 'CA',
    taxYear: 2025,
    formReferences: ['Form 540', 'Schedule CA (540)'],
    calculationNotes: [
      deduction === standardDeduction ? 'Standard deduction used' : 'Itemized deductions used',
      mentalHealthTax > 0 ? 'Mental Health Services Tax applies (1% on taxable income over $1,000,000)' : undefined,
      credits.earned_income && credits.earned_income > 0 ? 'CalEITC claimed' : undefined,
      credits.other_credits && credits.other_credits > 0 ? 'Young Child Tax Credit applied' : undefined
    ].filter(Boolean) as string[]
  };
}

/**
 * Calculate California Earned Income Tax Credit (CalEITC)
 *
 * CalEITC is refundable and more generous than federal EITC for very low incomes
 */
function calculateCalEITC(
  earnedIncome: number,
  caAGI: number,
  qualifyingChildren: number
): number {
  if (earnedIncome < CALEITC_MIN_EARNED_INCOME) {
    return 0;
  }

  const childrenKey = Math.min(Math.max(qualifyingChildren, 0), 3);
  const table = CALEITC_2025[childrenKey];

  if (!table) return 0;

  if (earnedIncome > table.maxIncome || caAGI > table.maxIncome) {
    return 0;
  }

  const incomeForPhaseIn = Math.min(earnedIncome, table.maxIncome);
  let credit = Math.min(table.maxCredit, multiplyCents(incomeForPhaseIn, table.phaseInRate));

  if (caAGI > table.phaseOutStart) {
    const incomeInPhaseOut = Math.min(caAGI, table.maxIncome) - table.phaseOutStart;
    const reduction = multiplyCents(Math.max(incomeInPhaseOut, 0), table.phaseOutRate);
    credit = max0(credit - reduction);
  }

  return Math.min(table.maxCredit, credit);
}

/**
 * Calculate Young Child Tax Credit (YCTC)
 *
 * Additional refundable credit for families with children under 6
 * Only available if also claiming CalEITC
 */
function calculateYCTC(
  caAGI: number,
  youngChildrenUnder6: number,
  eligibleForCalEITC: boolean
): number {
  if (!eligibleForCalEITC || youngChildrenUnder6 <= 0) {
    return 0;
  }

  if (caAGI > YCTC_2025.maxIncome) {
    return 0;
  }

  const eligibleChildren = Math.min(youngChildrenUnder6, 3);
  return eligibleChildren * YCTC_2025.maxCredit;
}

/**
 * Calculate dependent credit
 *
 * Nonrefundable credit that replaced personal exemptions
 */
function calculateDependentCredit(dependents: number): number {
  if (dependents <= 0) return 0;
  return dependents * CA_DEPENDENT_CREDIT_2025.perDependent;
}

/**
 * Calculate renter's credit
 *
 * Nonrefundable credit for California renters
 */
function calculateRentersCredit(filingStatus: string, caAGI: number): number {
  const limit = (filingStatus === 'marriedJointly' || filingStatus === 'headOfHousehold')
    ? CA_RENTERS_CREDIT_2025.maxIncomeJoint
    : CA_RENTERS_CREDIT_2025.maxIncome;

  if (caAGI > limit) {
    return 0;
  }

  switch (filingStatus) {
    case 'marriedJointly':
      return CA_RENTERS_CREDIT_2025.marriedJointly;
    case 'headOfHousehold':
      return CA_RENTERS_CREDIT_2025.headOfHousehold;
    case 'single':
      return CA_RENTERS_CREDIT_2025.single;
    default:
      return CA_RENTERS_CREDIT_2025.marriedSeparately;
  }
}

/**
 * Calculate California AGI
 *
 * Starts with federal AGI and applies CA-specific adjustments
 *
 * Common CA additions:
 * - State income tax refunds (if deducted on federal)
 * - Out-of-state municipal bond interest
 *
 * Common CA subtractions:
 * - Social Security benefits (CA doesn't tax SS)
 * - Railroad retirement benefits
 * - Certain retirement income
 */
function calculateCAGI(
  input: StateTaxInput,
  federalResult: FederalResult2025
): number {
  let caAGI = federalResult.agi;

  // California additions to federal AGI
  if (input.stateAdditions) {
    caAGI += input.stateAdditions.federalTaxRefund || 0;
    caAGI += input.stateAdditions.municipalBondInterest || 0;
    caAGI += input.stateAdditions.otherAdditions || 0;
  }

  // California subtractions from federal AGI
  if (input.stateSubtractions) {
    // Social Security benefits are NOT taxable in California
    caAGI -= input.stateSubtractions.socialSecurityBenefits || 0;
    // Certain retirement income may be excluded
    caAGI -= input.stateSubtractions.retirementIncome || 0;
    // Military pay exclusions
    caAGI -= input.stateSubtractions.militaryPay || 0;
    caAGI -= input.stateSubtractions.otherSubtractions || 0;
  }

  return max0(caAGI);
}

/**
 * Calculate California itemized deductions
 *
 * California generally follows federal itemized deductions with key differences:
 * - No SALT cap (unlike federal $10,000 limit)
 * - Medical expenses: 7.5% AGI floor (same as federal)
 * - Mortgage interest, charitable contributions follow federal rules
 *
 * Source: FTB Form 540 Schedule CA Instructions
 */
function calculateCAItemizedDeductions(input: StateTaxInput, caAGI: number): number {
  if (!input.stateItemized) {
    return 0;
  }

  let itemizedTotal = 0;

  // Medical expenses (deduct amount over 7.5% of AGI)
  if (input.stateItemized.medicalExpenses) {
    const medicalFloor = multiplyCents(caAGI, CA_MEDICAL_EXPENSE_THRESHOLD);
    const deductibleMedical = max0(input.stateItemized.medicalExpenses - medicalFloor);
    itemizedTotal = addCents(itemizedTotal, deductibleMedical);
  }

  // Property taxes (no SALT cap in California, unlike federal)
  if (input.stateItemized.propertyTaxes) {
    itemizedTotal = addCents(itemizedTotal, input.stateItemized.propertyTaxes);
  }

  // Mortgage interest
  if (input.stateItemized.mortgageInterest) {
    itemizedTotal = addCents(itemizedTotal, input.stateItemized.mortgageInterest);
  }

  // Charitable contributions
  if (input.stateItemized.charitableContributions) {
    itemizedTotal = addCents(itemizedTotal, input.stateItemized.charitableContributions);
  }

  // Other itemized deductions
  if (input.stateItemized.other) {
    itemizedTotal = addCents(itemizedTotal, input.stateItemized.other);
  }

  return itemizedTotal;
}

/**
 * Calculate California tax credits
 *
 * California offers several credits:
 * - CalEITC (California Earned Income Tax Credit) - refundable
 * - YCTC (Young Child Tax Credit) - refundable
 * - Dependent credits - nonrefundable
 * - Renter's credit - nonrefundable
 * - Child care credit - nonrefundable
 */
function calculateCACredits(
  input: StateTaxInput,
  federalResult: FederalResult2025,
  caAGI: number,
  tax: number
): StateCredits {
  const earnedIncome = calculateEarnedIncome(input, federalResult);
  const qualifyingChildren = Math.max(0, input.stateDependents || 0);

  const calEITC = calculateCalEITC(earnedIncome, caAGI, qualifyingChildren);
  const youngChildren = getYoungChildrenCount(input);
  const yctc = calculateYCTC(caAGI, youngChildren, calEITC > 0);
  const refundableCreditsTotal = addCents(calEITC, yctc);

  const dependentCredit = calculateDependentCredit(qualifyingChildren);
  const limitedDependentCredit = limitNonRefundableCredit(dependentCredit, tax);
  let totalNonRefundableCredits = limitedDependentCredit;

  const rentersCredit = calculateRentersCredit(input.filingStatus, caAGI);
  const limitedRentersCredit = limitNonRefundableCredit(
    rentersCredit,
    Math.max(0, tax - totalNonRefundableCredits)
  );
  totalNonRefundableCredits = addCents(totalNonRefundableCredits, limitedRentersCredit);

  return {
    earned_income: calEITC,
    child_dependent: limitedDependentCredit,
    renters: limitedRentersCredit,
    other_credits: yctc,
    nonRefundableCredits: totalNonRefundableCredits,
    refundableCredits: refundableCreditsTotal
  };
}


/**
 * Calculate earned income for CalEITC purposes
 *
 * Earned income includes:
 * - Wages, salaries, tips
 * - Self-employment income
 * - Certain other compensation
 */
function calculateEarnedIncome(input: StateTaxInput, federalResult: FederalResult2025): number {
  const override = input.stateSpecific?.earnedIncome ?? input.stateSpecific?.caEarnedIncome;
  if (typeof override === 'number' && !Number.isNaN(override)) {
    return max0(Math.round(override));
  }
  return max0(federalResult.agi);
}

function getYoungChildrenCount(input: StateTaxInput): number {
  const stateSpecific = input.stateSpecific ?? {};
  const explicitCount = stateSpecific.youngChildrenUnder6 ?? stateSpecific.californiaYoungChildren;

  if (typeof explicitCount === 'number') {
    return Math.max(0, Math.floor(explicitCount));
  }

  if (Array.isArray(stateSpecific.youngChildrenUnder6)) {
    return stateSpecific.youngChildrenUnder6.length;
  }

  if (Array.isArray(stateSpecific.californiaYoungChildren)) {
    return stateSpecific.californiaYoungChildren.length;
  }

  // Fallback assumption: at most one young child if dependents claimed
  return Math.min(input.stateDependents || 0, 1);
}

function calculateMentalHealthSurtax(taxableIncome: number): number {
  if (taxableIncome <= CA_MHST_THRESHOLD_2025) {
    return 0;
  }
  const excess = taxableIncome - CA_MHST_THRESHOLD_2025;
  return multiplyCents(excess, CA_MHST_RATE);
}
