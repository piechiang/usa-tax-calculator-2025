/**
 * Connecticut State Tax Rules for 2025
 *
 * Sources:
 * - Connecticut Department of Revenue Services
 * - https://portal.ct.gov/drs
 * - 2025 CT Tax Rates: 7 brackets (2%-6.99%)
 *
 * Key Features:
 * - Progressive tax system with 7 brackets
 * - Personal exemption treated as a credit (not a deduction)
 * - No traditional standard deduction
 * - Personal tax credit (income-based phaseout)
 * - Earned Income Tax Credit (40% of federal EITC)
 *
 * 2025 Changes:
 * - Lower brackets remain at reduced rates (2% and 4.5%)
 * - EITC continues at 40% of federal
 */

import { multiplyCents } from '../../../util/money';

/**
 * Connecticut Tax Brackets for 2025
 */
export const CT_BRACKETS_2025 = {
  single: [
    { threshold: 0, rate: 0.02 }, // 2% on $0 - $10,000
    { threshold: 1000000, rate: 0.045 }, // 4.5% on $10,001 - $50,000
    { threshold: 5000000, rate: 0.055 }, // 5.5% on $50,001 - $100,000
    { threshold: 10000000, rate: 0.06 }, // 6% on $100,001 - $200,000
    { threshold: 20000000, rate: 0.065 }, // 6.5% on $200,001 - $250,000
    { threshold: 25000000, rate: 0.069 }, // 6.9% on $250,001 - $500,000
    { threshold: 50000000, rate: 0.0699 }, // 6.99% on $500,001+
  ],
  marriedJointly: [
    { threshold: 0, rate: 0.02 }, // 2% on $0 - $20,000
    { threshold: 2000000, rate: 0.045 }, // 4.5% on $20,001 - $100,000
    { threshold: 10000000, rate: 0.055 }, // 5.5% on $100,001 - $200,000
    { threshold: 20000000, rate: 0.06 }, // 6% on $200,001 - $400,000
    { threshold: 40000000, rate: 0.065 }, // 6.5% on $400,001 - $500,000
    { threshold: 50000000, rate: 0.069 }, // 6.9% on $500,001 - $1,000,000
    { threshold: 100000000, rate: 0.0699 }, // 6.99% on $1,000,001+
  ],
  marriedSeparately: [
    { threshold: 0, rate: 0.02 }, // Same as single
    { threshold: 1000000, rate: 0.045 },
    { threshold: 5000000, rate: 0.055 },
    { threshold: 10000000, rate: 0.06 },
    { threshold: 20000000, rate: 0.065 },
    { threshold: 25000000, rate: 0.069 },
    { threshold: 50000000, rate: 0.0699 },
  ],
  headOfHousehold: [
    { threshold: 0, rate: 0.02 }, // 2% on $0 - $16,000
    { threshold: 1600000, rate: 0.045 }, // 4.5% on $16,001 - $80,000
    { threshold: 8000000, rate: 0.055 }, // 5.5% on $80,001 - $160,000
    { threshold: 16000000, rate: 0.06 }, // 6% on $160,001 - $320,000
    { threshold: 32000000, rate: 0.065 }, // 6.5% on $320,001 - $400,000
    { threshold: 40000000, rate: 0.069 }, // 6.9% on $400,001 - $800,000
    { threshold: 80000000, rate: 0.0699 }, // 6.99% on $800,001+
  ],
} as const;

/**
 * Connecticut Tax Rules for 2025
 */
export const CT_RULES_2025 = {
  /**
   * Tax Brackets
   */
  brackets: CT_BRACKETS_2025,

  /**
   * Standard Deduction
   * Connecticut does not have a traditional standard deduction
   */
  hasStandardDeduction: false,

  /**
   * Personal Exemption (treated as a credit, not a deduction)
   * Maximum amounts vary by filing status
   *
   * Note: These are credit amounts, not exemption amounts.
   * CT's personal exemption credit is relatively small.
   */
  personalExemptionCredit: {
    single: 75000, // $750 in cents
    marriedJointly: 100000, // $1,000 in cents
    marriedSeparately: 50000, // $500 in cents
    headOfHousehold: 75000, // $750 in cents
  },

  /**
   * Personal Tax Credit
   * Percentage of tax liability, phases out with income
   * Range: 0% to 75% of tax bill
   *
   * Note: CT uses complex tables. This is a simplified implementation.
   * The credit is significant only at very low incomes and phases out quickly.
   */
  personalTaxCredit: {
    enabled: true,
    maxRate: 0.75, // 75% maximum (only at very low incomes)
    minRate: 0.01, // 1% at higher incomes
    // Phaseout parameters (simplified for basic implementation)
    // Credit phases out much faster than initially thought
    phaseoutStart: 2400000, // $24,000 in cents (approximate)
    phaseoutEnd: 7500000, // $75,000 in cents (approximate)
  },

  /**
   * Earned Income Tax Credit
   * 40% of federal EITC (refundable)
   */
  eitcRate: 0.4, // 40% of federal EITC
};

/**
 * Calculate Connecticut tax using progressive brackets
 *
 * @param taxableIncome - CT taxable income in cents
 * @param filingStatus - Filing status
 * @returns Tax amount in cents
 */
export function calculateConnecticutTax(taxableIncome: number, filingStatus: string): number {
  if (taxableIncome <= 0) return 0;

  // Get appropriate brackets
  let brackets;
  switch (filingStatus) {
    case 'single':
      brackets = CT_BRACKETS_2025.single;
      break;
    case 'marriedJointly':
      brackets = CT_BRACKETS_2025.marriedJointly;
      break;
    case 'marriedSeparately':
      brackets = CT_BRACKETS_2025.marriedSeparately;
      break;
    case 'headOfHousehold':
      brackets = CT_BRACKETS_2025.headOfHousehold;
      break;
    default:
      brackets = CT_BRACKETS_2025.single;
  }

  let tax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (!bracket) continue;

    const nextBracket = i < brackets.length - 1 ? brackets[i + 1] : null;

    if (taxableIncome <= bracket.threshold) {
      break;
    }

    const bracketBase = bracket.threshold;
    const bracketTop = nextBracket ? nextBracket.threshold : taxableIncome;
    const bracketIncome = Math.min(taxableIncome, bracketTop) - bracketBase;

    if (bracketIncome > 0) {
      tax += Math.round(multiplyCents(bracketIncome, bracket.rate));
    }
  }

  return tax;
}

/**
 * Calculate personal exemption credit
 *
 * @param filingStatus - Filing status
 * @returns Personal exemption credit amount in cents
 */
export function calculatePersonalExemptionCredit(filingStatus: string): number {
  const { personalExemptionCredit } = CT_RULES_2025;

  switch (filingStatus) {
    case 'single':
      return personalExemptionCredit.single;
    case 'marriedJointly':
      return personalExemptionCredit.marriedJointly;
    case 'marriedSeparately':
      return personalExemptionCredit.marriedSeparately;
    case 'headOfHousehold':
      return personalExemptionCredit.headOfHousehold;
    default:
      return personalExemptionCredit.single;
  }
}

/**
 * Calculate personal tax credit (income-based percentage of tax)
 *
 * @param tax - Tax before credits in cents
 * @param agi - Connecticut AGI in cents
 * @returns Personal tax credit amount in cents
 */
export function calculatePersonalTaxCredit(tax: number, agi: number): number {
  if (tax <= 0) return 0;

  const { personalTaxCredit } = CT_RULES_2025;

  // Simplified phaseout calculation
  // In reality, CT uses complex tables, but we'll use linear phaseout
  let creditRate = personalTaxCredit.maxRate;

  if (agi >= personalTaxCredit.phaseoutEnd) {
    creditRate = personalTaxCredit.minRate;
  } else if (agi > personalTaxCredit.phaseoutStart) {
    // Linear phaseout
    const phaseoutRange = personalTaxCredit.phaseoutEnd - personalTaxCredit.phaseoutStart;
    const phaseoutAmount = agi - personalTaxCredit.phaseoutStart;
    const phaseoutPct = phaseoutAmount / phaseoutRange;
    const rateRange = personalTaxCredit.maxRate - personalTaxCredit.minRate;
    creditRate = personalTaxCredit.maxRate - rateRange * phaseoutPct;
  }

  return Math.round(multiplyCents(tax, creditRate));
}

/**
 * Calculate Connecticut EITC (40% of federal EITC)
 *
 * @param federalEITC - Federal EITC amount in cents
 * @returns Connecticut EITC amount in cents
 */
export function calculateConnecticutEITC(federalEITC: number): number {
  if (federalEITC <= 0) return 0;
  return Math.round(multiplyCents(federalEITC, CT_RULES_2025.eitcRate));
}

/**
 * Type for Connecticut-specific input data
 */
export interface ConnecticutSpecificInput {
  /**
   * Federal EITC amount (for calculating CT EITC)
   */
  federalEITC?: number;

  /**
   * For future expansion:
   * - CT-specific deductions
   * - CT-specific credits
   * - Property tax credit
   * - Other state-specific provisions
   */
}
