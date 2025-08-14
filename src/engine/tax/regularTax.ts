import type { FilingStatus } from '../rules/2025/federal/standardDeductions';
import { FEDERAL_BRACKETS_2025 } from '../rules/2025/federal/federalBrackets';

/**
 * Calculate regular income tax using 2025 federal tax brackets
 * Source: Rev. Proc. 2024-40
 */
export function calculateRegularTax2025(taxableIncome: number, filingStatus: FilingStatus): number {
  if (taxableIncome <= 0) return 0;

  const brackets = FEDERAL_BRACKETS_2025[filingStatus];
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketSize = bracket.max === Infinity 
      ? remainingIncome 
      : Math.min(remainingIncome, bracket.max - bracket.min);
    
    if (bracketSize > 0 && taxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(bracketSize, taxableIncome - bracket.min);
      tax += Math.round(taxableInThisBracket * bracket.rate);
      remainingIncome -= taxableInThisBracket;
    }
  }

  return tax;
}

/**
 * Find the marginal tax rate for given income and filing status
 */
export function getMarginalRate2025(taxableIncome: number, filingStatus: FilingStatus): number {
  if (taxableIncome <= 0) return 0;

  const brackets = FEDERAL_BRACKETS_2025[filingStatus];
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min && (bracket.max === Infinity || taxableIncome <= bracket.max)) {
      return bracket.rate;
    }
  }

  return 0;
}