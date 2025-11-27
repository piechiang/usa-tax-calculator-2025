/**
 * New Jersey State Tax Rules for 2025
 *
 * New Jersey uses a highly progressive income tax system with 8 brackets
 * and rates ranging from 1.4% to 10.75%. The bracket structure differs
 * by filing status (MFJ has 8 brackets, Single has 7).
 *
 * Key Features:
 * - 8 progressive tax brackets (1.4% to 10.75%)
 * - Different brackets for MFJ vs Single/HOH
 * - Standard deduction: $1,000 (single) / $2,000 (MFJ)
 * - Personal exemption: $1,000 (age 65+)
 * - Dependent exemption: $1,500 per dependent
 * - Property tax deduction: Up to $15,000
 * - Property tax credit: $50 (refundable)
 *
 * Sources:
 * - New Jersey Division of Taxation (https://www.nj.gov/treasury/taxation)
 * - NJ Tax Rate Tables
 * - 2025 tax law updates
 *
 * @module rules/2025/states/nj
 */

/**
 * New Jersey 2025 Tax Brackets for Married Filing Jointly
 * 8 brackets ranging from 1.4% to 10.75%
 */
export const NJ_BRACKETS_2025_MFJ = [
  { threshold: 0, rate: 0.014 }, // 1.4% on first $20,000
  { threshold: 2000000, rate: 0.0175 }, // 1.75% on $20,001-$50,000
  { threshold: 5000000, rate: 0.0245 }, // 2.45% on $50,001-$70,000
  { threshold: 7000000, rate: 0.035 }, // 3.5% on $70,001-$80,000
  { threshold: 8000000, rate: 0.05525 }, // 5.525% on $80,001-$150,000
  { threshold: 15000000, rate: 0.0637 }, // 6.37% on $150,001-$500,000
  { threshold: 50000000, rate: 0.0897 }, // 8.97% on $500,001-$1,000,000
  { threshold: 100000000, rate: 0.1075 }, // 10.75% on $1,000,001+
] as const;

/**
 * New Jersey 2025 Tax Brackets for Single/Married Filing Separately
 * 7 brackets ranging from 1.4% to 10.75%
 */
export const NJ_BRACKETS_2025_SINGLE = [
  { threshold: 0, rate: 0.014 }, // 1.4% on first $20,000
  { threshold: 2000000, rate: 0.0175 }, // 1.75% on $20,001-$35,000
  { threshold: 3500000, rate: 0.035 }, // 3.5% on $35,001-$40,000
  { threshold: 4000000, rate: 0.05525 }, // 5.525% on $40,001-$75,000
  { threshold: 7500000, rate: 0.0637 }, // 6.37% on $75,001-$500,000
  { threshold: 50000000, rate: 0.0897 }, // 8.97% on $500,001-$1,000,000
  { threshold: 100000000, rate: 0.1075 }, // 10.75% on $1,000,001+
] as const;

/**
 * New Jersey 2025 Tax Brackets for Head of Household
 * Same as MFJ (8 brackets)
 */
export const NJ_BRACKETS_2025_HOH = NJ_BRACKETS_2025_MFJ;

/**
 * New Jersey 2025 Tax Rules
 */
export const NJ_RULES_2025 = {
  /**
   * Standard deduction amounts by filing status
   */
  standardDeduction: {
    single: 100000, // $1,000 in cents
    marriedJointly: 200000, // $2,000 in cents
    marriedSeparately: 100000, // $1,000 in cents
    headOfHousehold: 200000, // $2,000 in cents
  },

  /**
   * Personal exemption for age 65+
   * $1,000 per qualifying person (age 65+ by end of tax year)
   */
  ageExemption: 100000, // $1,000 per person in cents

  /**
   * Minimum age for age exemption
   */
  minimumAgeForExemption: 65,

  /**
   * Dependent exemption
   * $1,500 per qualifying dependent (federal definition)
   */
  dependentExemption: 150000, // $1,500 per dependent in cents

  /**
   * Property tax deduction
   * Taxpayers can deduct property taxes paid up to $15,000
   *
   * For renters: 18% of rent paid is considered property taxes
   */
  propertyTaxDeduction: {
    maximum: 1500000, // $15,000 in cents
    renterPercentage: 0.18, // 18% of rent paid
  },

  /**
   * Property tax credit (refundable)
   * Alternative to property tax deduction
   * Taxpayers must choose deduction OR credit (not both)
   */
  propertyTaxCredit: 5000, // $50 in cents (refundable)
} as const;

/**
 * Type for New Jersey-specific state tax input
 */
export interface NJStateSpecific {
  /** State withholding */
  stateWithheld?: number;

  /** State estimated tax payments */
  stateEstPayments?: number;

  /** Age of taxpayer (for age exemption) */
  taxpayerAge?: number;

  /** Age of spouse (for age exemption on MFJ returns) */
  spouseAge?: number;

  /** Property taxes paid on primary residence (for deduction) */
  propertyTaxPaid?: number;

  /** Rent paid during the year (for renters - 18% counts as property tax) */
  rentPaid?: number;

  /** Use property tax credit instead of deduction? */
  usePropertyTaxCredit?: boolean;
}

/**
 * Calculate New Jersey tax using progressive brackets
 *
 * @param taxableIncome Taxable income in cents
 * @param filingStatus Filing status to determine which brackets to use
 * @returns Tax liability in cents
 */
export function calculateNewJerseyTax(
  taxableIncome: number,
  filingStatus: string
): number {
  if (taxableIncome <= 0) return 0;

  // Select appropriate bracket table
  let brackets;
  if (filingStatus === 'marriedJointly') {
    brackets = NJ_BRACKETS_2025_MFJ;
  } else if (filingStatus === 'headOfHousehold') {
    brackets = NJ_BRACKETS_2025_HOH;
  } else {
    // Single and married filing separately
    brackets = NJ_BRACKETS_2025_SINGLE;
  }

  let tax = 0;
  let previousThreshold = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const nextThreshold =
      i < brackets.length - 1 ? brackets[i + 1].threshold : Infinity;

    if (taxableIncome <= previousThreshold) {
      break;
    }

    const taxableInThisBracket =
      Math.min(taxableIncome, nextThreshold) - previousThreshold;
    tax += Math.round(taxableInThisBracket * bracket.rate);

    previousThreshold = nextThreshold;
  }

  return tax;
}
