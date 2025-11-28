/**
 * Shared tax calculation utilities
 *
 * Common functions used across state and federal tax calculations
 * to ensure consistency and reduce duplication.
 *
 * All calculations use cents-based arithmetic with Decimal.js to avoid
 * floating-point rounding errors.
 */

import { multiplyCents } from './money';

/**
 * Tax bracket definition
 */
export interface TaxBracket {
  min: number;        // Lower bound (cents)
  max: number;        // Upper bound (cents)
  rate: number;       // Tax rate (decimal, e.g., 0.05 for 5%)
  baseAmount?: number; // Optional: cumulative tax at start of bracket
}

/**
 * Convert simplified bracket format (with only max and rate) to full TaxBracket format
 *
 * Many state tax rules define brackets in a simplified format with just the upper bound
 * and rate for each bracket. This function converts that to the full format needed by
 * calculateTaxFromBrackets().
 *
 * @param simplifiedBrackets - Brackets with only max and rate
 * @returns Full TaxBracket array with min and max
 *
 * @example
 * const simplified = [
 *   { max: 1000000, rate: 0.02 },  // 0 - $10k at 2%
 *   { max: 5000000, rate: 0.04 },  // $10k - $50k at 4%
 *   { max: Infinity, rate: 0.06 }  // Over $50k at 6%
 * ];
 * const full = convertToFullBrackets(simplified);
 * // Returns: [
 * //   { min: 0, max: 1000000, rate: 0.02 },
 * //   { min: 1000000, max: 5000000, rate: 0.04 },
 * //   { min: 5000000, max: Infinity, rate: 0.06 }
 * // ]
 */
export function convertToFullBrackets(
  simplifiedBrackets: Array<{ max: number; rate: number }>
): TaxBracket[] {
  const fullBrackets: TaxBracket[] = [];
  let previousMax = 0;

  for (const bracket of simplifiedBrackets) {
    fullBrackets.push({
      min: previousMax,
      max: bracket.max,
      rate: bracket.rate
    });
    previousMax = bracket.max;
  }

  return fullBrackets;
}

/**
 * Calculate tax from graduated brackets
 *
 * This is the most common pattern across state tax systems.
 * Uses marginal tax rates - each bracket only applies to income within that range.
 *
 * @param taxableIncome - Income to tax (in cents)
 * @param brackets - Array of tax brackets (must be sorted by min)
 * @returns Total tax (in cents)
 *
 * @example
 * const brackets = [
 *   { min: 0, max: 1000000, rate: 0.10 },      // 10% on first $10k
 *   { min: 1000000, max: 5000000, rate: 0.20 }, // 20% on next $40k
 *   { min: 5000000, max: Infinity, rate: 0.30 } // 30% on everything over $50k
 * ];
 * const tax = calculateTaxFromBrackets(7500000, brackets); // Tax on $75k
 */
export function calculateTaxFromBrackets(
  taxableIncome: number,
  brackets: TaxBracket[]
): number {
  if (taxableIncome <= 0) return 0;

  let totalTax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      // Income doesn't reach this bracket
      break;
    }

    // Calculate amount of income in this bracket
    const incomeInBracket = Math.min(
      taxableIncome - bracket.min,
      bracket.max - bracket.min
    );

    // Add tax for this bracket using precise cents-based multiplication
    totalTax += multiplyCents(incomeInBracket, bracket.rate);

    if (taxableIncome <= bracket.max) {
      // All income accounted for
      break;
    }
  }

  return totalTax;
}

/**
 * Calculate tax using flat rate
 *
 * Used by states with a single tax rate on all taxable income.
 * Examples: CO, IL, IN, MI, NC, PA, etc.
 *
 * @param taxableIncome - Income to tax (in cents)
 * @param rate - Flat tax rate (decimal, e.g., 0.0495 for 4.95%)
 * @returns Total tax (in cents)
 *
 * @example
 * const tax = calculateFlatTax(5000000, 0.05); // 5% on $50k = $2,500
 */
export function calculateFlatTax(taxableIncome: number, rate: number): number {
  if (taxableIncome <= 0) return 0;
  return multiplyCents(taxableIncome, rate);
}

/**
 * Calculate credit with phaseout
 *
 * Many credits phase out as income increases. This implements a linear phaseout.
 *
 * @param baseCredit - Maximum credit amount (cents)
 * @param income - Income used for phaseout calculation (usually AGI, in cents)
 * @param phaseoutStart - Income level where phaseout begins (cents)
 * @param phaseoutEnd - Income level where credit is fully phased out (cents)
 * @returns Credit amount after phaseout (cents)
 *
 * @example
 * // $1000 credit that phases out from $50k to $75k
 * const credit = calculateCreditWithPhaseout(
 *   100000,   // $1,000 max credit
 *   6000000,  // $60,000 income
 *   5000000,  // Phaseout starts at $50k
 *   7500000   // Fully phased out at $75k
 * );
 * // Returns: $60,000 = 40% through phaseout range, so credit = $1000 * 0.6 = $600
 */
export function calculateCreditWithPhaseout(
  baseCredit: number,
  income: number,
  phaseoutStart: number,
  phaseoutEnd: number
): number {
  if (baseCredit <= 0) return 0;
  if (income <= phaseoutStart) return baseCredit;
  if (income >= phaseoutEnd) return 0;

  // Calculate reduction percentage using Decimal for precision
  const phaseoutRange = phaseoutEnd - phaseoutStart;
  const incomeInPhaseout = income - phaseoutStart;
  const reductionPercent = incomeInPhaseout / phaseoutRange;

  return multiplyCents(baseCredit, 1 - reductionPercent);
}

/**
 * Calculate state EITC as percentage of federal
 *
 * Many states offer EITC as a simple percentage of the federal credit.
 *
 * @param federalEITC - Federal EITC amount (cents)
 * @param statePercent - State percentage (decimal, e.g., 0.30 for 30%)
 * @returns State EITC amount (cents)
 *
 * @example
 * const stateEITC = calculateStateEITCFromFederal(350000, 0.30); // 30% of $3,500 = $1,050
 */
export function calculateStateEITCFromFederal(
  federalEITC: number,
  statePercent: number
): number {
  if (federalEITC <= 0 || statePercent <= 0) return 0;
  return multiplyCents(federalEITC, statePercent);
}

/**
 * Calculate itemized deduction subject to floor
 *
 * Some deductions (like medical expenses) only count above a certain % of income.
 *
 * @param expenses - Total expenses (cents)
 * @param income - Income used for floor calculation (usually AGI, in cents)
 * @param floorPercent - Floor percentage (decimal, e.g., 0.075 for 7.5%)
 * @returns Deductible amount (cents)
 *
 * @example
 * // Medical expenses only deductible above 7.5% of AGI
 * const deduction = calculateDeductionWithFloor(1000000, 5000000, 0.075);
 * // $10,000 expenses, $50,000 AGI -> floor = $3,750 -> deduction = $6,250
 */
export function calculateDeductionWithFloor(
  expenses: number,
  income: number,
  floorPercent: number
): number {
  if (expenses <= 0) return 0;
  const floor = multiplyCents(income, floorPercent);
  return Math.max(0, expenses - floor);
}

/**
 * Calculate itemized deduction subject to cap
 *
 * Some deductions have maximum limits (like SALT cap).
 *
 * @param expenses - Total expenses (cents)
 * @param cap - Maximum deductible amount (cents)
 * @returns Deductible amount (cents)
 *
 * @example
 * const saltDeduction = calculateDeductionWithCap(1500000, 1000000);
 * // $15,000 SALT paid, but capped at $10,000
 */
export function calculateDeductionWithCap(expenses: number, cap: number): number {
  if (expenses <= 0) return 0;
  return Math.min(expenses, cap);
}

/**
 * Determine if taxpayer uses standard or itemized deduction
 *
 * Returns the higher of standard or itemized deduction.
 *
 * @param standardDeduction - Standard deduction amount (cents)
 * @param itemizedDeduction - Total itemized deduction (cents)
 * @returns Object with chosen deduction and whether standard was used
 *
 * @example
 * const result = determineDeduction(1450000, 1200000);
 * // Returns: { deduction: 1450000, isStandard: true }
 */
export function determineDeduction(
  standardDeduction: number,
  itemizedDeduction: number
): { deduction: number; isStandard: boolean } {
  if (standardDeduction >= itemizedDeduction) {
    return { deduction: standardDeduction, isStandard: true };
  }
  return { deduction: itemizedDeduction, isStandard: false };
}

/**
 * Calculate local tax based on county/city rates
 *
 * Some states (MD, NY, OH) have local income taxes.
 *
 * @param localTaxableIncome - Income subject to local tax (cents)
 * @param localRate - Local tax rate (decimal)
 * @returns Local tax amount (cents)
 *
 * @example
 * const localTax = calculateLocalTax(5000000, 0.032); // 3.2% rate = $1,600
 */
export function calculateLocalTax(
  localTaxableIncome: number,
  localRate: number
): number {
  if (localTaxableIncome <= 0 || localRate <= 0) return 0;
  return multiplyCents(localTaxableIncome, localRate);
}

/**
 * Apply tax credit limit (non-refundable credits can't exceed tax)
 *
 * @param credit - Credit amount (cents)
 * @param taxBeforeCredit - Tax liability before credits (cents)
 * @returns Limited credit amount (cents)
 *
 * @example
 * const limitedCredit = limitNonRefundableCredit(500000, 300000);
 * // $5,000 credit but only $3,000 tax, so credit limited to $3,000
 */
export function limitNonRefundableCredit(
  credit: number,
  taxBeforeCredit: number
): number {
  if (credit <= 0 || taxBeforeCredit <= 0) return 0;
  return Math.min(credit, taxBeforeCredit);
}

/**
 * Calculate effective tax rate
 *
 * @param totalTax - Total tax liability (cents)
 * @param income - Total income (cents)
 * @returns Effective rate (decimal, e.g., 0.15 for 15%)
 *
 * @example
 * const rate = calculateEffectiveRate(1500000, 10000000); // 15% effective rate
 */
export function calculateEffectiveRate(totalTax: number, income: number): number {
  if (income <= 0) return 0;
  return totalTax / income;
}

/**
 * Find marginal tax bracket for given income
 *
 * Returns the bracket that applies to the last dollar of income.
 *
 * @param taxableIncome - Income to find bracket for (cents)
 * @param brackets - Array of tax brackets (must be sorted by min)
 * @returns The applicable tax bracket
 *
 * @example
 * const bracket = findMarginalBracket(7500000, brackets);
 * // Returns the bracket containing $75,000
 */
export function findMarginalBracket(
  taxableIncome: number,
  brackets: TaxBracket[]
): TaxBracket | null {
  if (taxableIncome <= 0) return null;

  for (let i = brackets.length - 1; i >= 0; i--) {
    const bracket = brackets[i];
    if (bracket && taxableIncome >= bracket.min) {
      return bracket;
    }
  }

  return brackets[0] || null;
}
