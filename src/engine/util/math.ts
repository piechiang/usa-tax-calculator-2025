import { C, toCents } from './money';

// Progressive tax calculation using brackets
export const calculateTaxFromBrackets = (
  taxableIncome: number, 
  brackets: Array<{ min: number; max: number; rate: number }>
): number => {
  let tax = 0;
  
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    
    const bracketMax = bracket.max === Infinity ? taxableIncome : Math.min(bracket.max, taxableIncome);
    const taxableInBracket = bracketMax - bracket.min;
    
    if (taxableInBracket > 0) {
      tax += toCents(C(taxableInBracket).times(bracket.rate));
    }
  }
  
  return Math.max(0, tax);
};

// Calculate marginal tax rate for given income
export const calculateMarginalRate = (
  taxableIncome: number,
  brackets: Array<{ min: number; max: number; rate: number }>
): number => {
  for (const bracket of brackets) {
    if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
      return bracket.rate;
    }
  }
  // If income exceeds all brackets, return top rate
  return brackets[brackets.length - 1]?.rate || 0;
};

// Calculate effective tax rate
export const calculateEffectiveRate = (totalTax: number, agi: number): number => {
  if (agi <= 0) return 0;
  return totalTax / agi;
};

// Phase-out calculation (linear)
export const calculatePhaseOut = (
  income: number,
  phaseOutStart: number,
  phaseOutEnd: number,
  maxBenefit: number
): number => {
  if (income <= phaseOutStart) return maxBenefit;
  if (income >= phaseOutEnd) return 0;
  
  const phaseOutRange = phaseOutEnd - phaseOutStart;
  const incomeInRange = income - phaseOutStart;
  const reductionRatio = incomeInRange / phaseOutRange;
  
  return Math.max(0, toCents(C(maxBenefit).times(1 - reductionRatio)));
};

// SALT deduction cap application
export const applySaltCap = (saltDeduction: number, cap: number): number => {
  return Math.min(saltDeduction, cap);
};

// Standard vs itemized deduction comparison
export const chooseDeduction = (standardDeduction: number, itemizedDeduction: number): {
  deduction: number;
  isItemizing: boolean;
} => {
  const isItemizing = itemizedDeduction > standardDeduction;
  return {
    deduction: Math.max(standardDeduction, itemizedDeduction),
    isItemizing
  };
};

// Calculate QBI deduction (simplified)
export const calculateQBIDeduction = (
  qbiIncome: number,
  taxableIncomeBeforeQBI: number,
  _w2Wages?: number,
  _filingStatus?: string
): number => {
  // Simplified QBI calculation - 20% of QBI income subject to limitations
  const qbiLimit = toCents(C(qbiIncome).times(0.20));
  const taxableIncomeLimit = toCents(C(taxableIncomeBeforeQBI).times(0.20));
  
  // Basic limitation - lesser of 20% of QBI or 20% of taxable income
  return Math.min(qbiLimit, taxableIncomeLimit);
};

// Age-based additional standard deduction
export const calculateAdditionalStandardDeduction = (
  birthDate: string | undefined,
  isBlind: boolean = false,
  taxYear: number = 2025
): number => {
  let additional = 0;
  
  if (birthDate) {
    const birth = new Date(birthDate);
    const age = taxYear - birth.getFullYear();
    
    // Additional standard deduction for age 65+
    if (age >= 65) {
      additional += 140000; // $1,400 in cents (2025 estimate)
    }
  }
  
  // Additional standard deduction for blind
  if (isBlind) {
    additional += 140000; // $1,400 in cents (2025 estimate)
  }
  
  return additional;
};