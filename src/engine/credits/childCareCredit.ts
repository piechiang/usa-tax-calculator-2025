import { FilingStatus } from '../types';
import { dollarsToCents } from '../util/money';
import { multiplyCents } from '../util/money';

/**
 * Child and Dependent Care Credit Calculation for 2025
 * Form 2441 - Child and Dependent Care Expenses
 *
 * This credit helps taxpayers pay for care of qualifying persons so they can work
 * or look for work. The credit is non-refundable (unless made refundable by special legislation).
 *
 * Key Rules:
 * - Credit rate: 20-35% based on AGI
 * - Maximum expenses: $3,000 for 1 qualifying person, $6,000 for 2+
 * - Phases down from 35% to 20% as AGI increases
 * - Must have earned income to claim
 * - Care must be for work-related purposes
 *
 * Source: IRC §21, IRS Form 2441
 * Note: ARPA 2021 temporarily increased limits and made credit refundable for 2021 only
 * For 2025, we use permanent law amounts (pre-ARPA)
 */

/**
 * Maximum Qualifying Expenses for 2025
 * These are the permanent law amounts (not ARPA amounts)
 */
const CHILD_CARE_MAX_EXPENSES_2025 = {
  oneQualifyingPerson: dollarsToCents(3000),   // $3,000 for 1 person
  twoOrMorePersons: dollarsToCents(6000),      // $6,000 for 2+ persons
};

/**
 * Credit Rate Phase-down
 * Credit rate starts at 35% and decreases to 20%
 * Rate: 35% - 1% for each $2,000 (or fraction) of AGI over $15,000
 * Minimum rate: 20% (reached at AGI $43,000+)
 */
const CHILD_CARE_CREDIT_RATES = {
  maximumRate: 0.35,              // 35% maximum
  minimumRate: 0.20,              // 20% minimum
  phaseDownStart: dollarsToCents(15000),  // Phase-down starts at $15,000 AGI
  phaseDownIncrement: dollarsToCents(2000), // Reduce 1% per $2,000 AGI
  rateReduction: 0.01,            // 1% reduction per increment
};

export interface ChildCareCreditInput {
  filingStatus: FilingStatus;
  agi: number; // Adjusted Gross Income (cents)

  // Qualifying persons
  numberOfQualifyingPersons: number; // 1, 2, or more

  // Care expenses paid (cents)
  careExpenses: number;

  // Earned income (for limitation)
  taxpayerEarnedIncome: number; // cents
  spouseEarnedIncome?: number; // cents (for MFJ only)

  // Special cases
  isSpouseStudent?: boolean; // Spouse full-time student?
  isSpouseDisabled?: boolean; // Spouse physically or mentally unable to care for self?
}

export interface ChildCareCreditResult {
  // Expense limits
  maxAllowableExpenses: number; // $3,000 or $6,000 (cents)
  actualExpenses: number; // Expenses paid (cents)

  // Earned income limitation
  taxpayerEarnedIncome: number; // cents
  spouseEarnedIncome: number; // cents (0 if not MFJ, or deemed amount if student/disabled)
  earnedIncomeLimit: number; // Lesser of taxpayer or spouse earned income (cents)

  // Qualifying expenses (after all limitations)
  qualifyingExpenses: number; // cents

  // Credit calculation
  creditRate: number; // 0.20 - 0.35
  creditBeforeLimits: number; // Qualifying expenses × Rate (cents)

  // Final credit (non-refundable)
  childCareCredit: number; // cents
}

/**
 * Compute Child and Dependent Care Credit (Form 2441)
 *
 * @param input Child care credit calculation input
 * @returns Complete child care credit calculation
 */
export function computeChildCareCredit2025(
  input: ChildCareCreditInput
): ChildCareCreditResult {
  // Step 1: Determine maximum allowable expenses
  const maxAllowableExpenses =
    input.numberOfQualifyingPersons >= 2
      ? CHILD_CARE_MAX_EXPENSES_2025.twoOrMorePersons
      : CHILD_CARE_MAX_EXPENSES_2025.oneQualifyingPerson;

  // Step 2: Limit expenses to maximum
  const expensesLimitedByMax = Math.min(input.careExpenses, maxAllowableExpenses);

  // Step 3: Calculate earned income limit
  const { earnedIncomeLimit, spouseEarnedIncome } = calculateEarnedIncomeLimit(
    input.taxpayerEarnedIncome,
    input.spouseEarnedIncome,
    input.isSpouseStudent,
    input.isSpouseDisabled,
    input.numberOfQualifyingPersons
  );

  // Step 4: Limit expenses to earned income
  const qualifyingExpenses = Math.min(expensesLimitedByMax, earnedIncomeLimit);

  // Step 5: Determine credit rate based on AGI
  const creditRate = determineCreditRate(input.agi);

  // Step 6: Calculate credit
  const creditBeforeLimits = multiplyCents(qualifyingExpenses, creditRate);

  // For 2025, credit is non-refundable (ARPA refundability expired)
  // Credit is limited to tax liability in main calculation
  const childCareCredit = creditBeforeLimits;

  return {
    maxAllowableExpenses,
    actualExpenses: input.careExpenses,
    taxpayerEarnedIncome: input.taxpayerEarnedIncome,
    spouseEarnedIncome,
    earnedIncomeLimit,
    qualifyingExpenses,
    creditRate,
    creditBeforeLimits,
    childCareCredit,
  };
}

/**
 * Calculate earned income limit
 *
 * Qualifying expenses are limited to the lesser of:
 * - Taxpayer's earned income
 * - Spouse's earned income (if MFJ)
 *
 * Special rules:
 * - If spouse is full-time student or disabled, deemed to have $250/month (1 child)
 *   or $500/month (2+ children)
 */
function calculateEarnedIncomeLimit(
  taxpayerEarnedIncome: number,
  spouseEarnedIncome: number | undefined,
  isSpouseStudent: boolean | undefined,
  isSpouseDisabled: boolean | undefined,
  numberOfQualifyingPersons: number
): { earnedIncomeLimit: number; spouseEarnedIncome: number } {
  let effectiveSpouseIncome = spouseEarnedIncome || 0;

  // Special rule: If spouse is student or disabled, deemed earned income applies
  if ((isSpouseStudent || isSpouseDisabled) && spouseEarnedIncome === undefined) {
    // Deemed earned income: $250/month for 1 child, $500/month for 2+ children
    // Assuming full year (12 months) for simplicity
    const monthlyDeemedIncome =
      numberOfQualifyingPersons >= 2
        ? dollarsToCents(500)
        : dollarsToCents(250);
    effectiveSpouseIncome = monthlyDeemedIncome * 12;
  }

  // Earned income limit is lesser of taxpayer or spouse income
  let earnedIncomeLimit: number;
  if (spouseEarnedIncome !== undefined || isSpouseStudent || isSpouseDisabled) {
    // MFJ: Lesser of taxpayer or spouse income
    earnedIncomeLimit = Math.min(taxpayerEarnedIncome, effectiveSpouseIncome);
  } else {
    // Single, HoH, MFS: Taxpayer income only
    earnedIncomeLimit = taxpayerEarnedIncome;
  }

  return {
    earnedIncomeLimit,
    spouseEarnedIncome: effectiveSpouseIncome,
  };
}

/**
 * Determine credit rate based on AGI
 *
 * Credit rate formula:
 * - Start at 35%
 * - Reduce by 1% for each $2,000 (or fraction thereof) of AGI over $15,000
 * - Minimum rate: 20%
 *
 * Examples:
 * - AGI $15,000 or less: 35% rate
 * - AGI $17,000: 34% rate (1 increment over $15k)
 * - AGI $43,000+: 20% rate (minimum)
 */
function determineCreditRate(agi: number): number {
  if (agi <= CHILD_CARE_CREDIT_RATES.phaseDownStart) {
    return CHILD_CARE_CREDIT_RATES.maximumRate; // 35%
  }

  // Calculate number of $2,000 increments over $15,000
  const excessAGI = agi - CHILD_CARE_CREDIT_RATES.phaseDownStart;
  const increments = Math.ceil(excessAGI / CHILD_CARE_CREDIT_RATES.phaseDownIncrement);

  // Reduce rate by 1% per increment
  const rateReduction = increments * CHILD_CARE_CREDIT_RATES.rateReduction;
  const calculatedRate = CHILD_CARE_CREDIT_RATES.maximumRate - rateReduction;

  // Minimum rate is 20%
  return Math.max(calculatedRate, CHILD_CARE_CREDIT_RATES.minimumRate);
}

/**
 * Helper: Determine if person qualifies as qualifying person
 *
 * Qualifying person is:
 * 1. Dependent under age 13 (when care was provided), OR
 * 2. Dependent or spouse physically/mentally unable to care for self
 *
 * This function would be used in form validation/input
 */
export function isQualifyingPerson(
  age: number | undefined,
  isDependent: boolean,
  isDisabled: boolean
): boolean {
  // Under 13 and dependent
  if (age !== undefined && age < 13 && isDependent) {
    return true;
  }

  // Any age if dependent and disabled
  if (isDependent && isDisabled) {
    return true;
  }

  // Spouse if disabled
  if (isDisabled && !isDependent) {
    return true;
  }

  return false;
}

/**
 * Helper: Determine if expenses are work-related
 *
 * Expenses must be for care that allows taxpayer (and spouse if MFJ) to:
 * - Work as an employee
 * - Look for work
 * - Attend school full-time (if spouse only)
 *
 * This is typically validated through form input
 */
export const QUALIFYING_CARE_PURPOSES = {
  workAsEmployee: true,
  lookForWork: true,
  attendSchoolFullTime: true, // Spouse only
  selfEmployment: true,
};

/**
 * Helper: Types of qualifying care providers
 *
 * Care provider can be:
 * - Daycare center
 * - Babysitter
 * - Nanny
 * - Before/after school program
 * - Day camp (not overnight camp)
 *
 * Cannot be:
 * - Parent of child
 * - Child under age 19 (even if not dependent)
 * - Taxpayer's dependent
 */
export const QUALIFYING_CARE_PROVIDERS = {
  daycareCenter: true,
  babysitter: true,
  nanny: true,
  beforeAfterSchoolProgram: true,
  dayCamp: true, // Day camp only, not overnight

  // NOT qualifying
  parentOfChild: false,
  childUnder19: false,
  taxpayerDependent: false,
  overnightCamp: false,
};
