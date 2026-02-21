/**
 * Virginia State Tax Rules for 2025
 *
 * Virginia uses a progressive income tax system with 4 brackets.
 * The state has a standard deduction and personal/dependent exemptions.
 *
 * Key Features:
 * - 4 progressive tax brackets (2% to 5.75%)
 * - Standard deduction: $8,750 (single) / $17,500 (MFJ)
 * - Personal/dependent exemption: $930 each
 * - Age exemption: $800 for age 65+ (or alternative $12,000 age deduction)
 * - Cannot use standard deduction if itemized on federal return
 *
 * Sources:
 * - Virginia Department of Taxation (https://www.tax.virginia.gov)
 * - Code of Virginia § 58.1-322 et seq.
 * - 2025 Virginia tax law updates
 *
 * @module rules/2025/states/va
 */

/**
 * Virginia 2025 Tax Brackets
 *
 * Virginia uses the same brackets for all filing statuses
 */
export const VA_BRACKETS_2025 = [
  { threshold: 0, rate: 0.02 }, // 2% on first $3,000
  { threshold: 300000, rate: 0.03 }, // 3% on $3,001-$5,000
  { threshold: 500000, rate: 0.05 }, // 5% on $5,001-$17,000
  { threshold: 1700000, rate: 0.0575 }, // 5.75% on $17,001+
] as const;

/**
 * Virginia 2025 Tax Rules
 */
export const VA_RULES_2025 = {
  /**
   * Standard deduction amounts by filing status (2025 increase from 2024)
   * Note: Cannot use standard deduction if itemized on federal return
   */
  standardDeduction: {
    single: 875000, // $8,750 in cents (increased from $8,500)
    marriedJointly: 1750000, // $17,500 in cents (increased from $17,000)
    marriedSeparately: 875000, // $8,750 in cents
    headOfHousehold: 875000, // $8,750 in cents
  },

  /**
   * Personal and dependent exemption amount
   * Each taxpayer and dependent qualifies
   */
  personalExemption: 93000, // $930 per person in cents

  /**
   * Age exemption for taxpayers age 65 or older
   * $800 per qualifying person (age 65+ by January 1)
   */
  ageExemption: 80000, // $800 per qualifying person in cents

  /**
   * Alternative age deduction (instead of $800 exemption)
   * $12,000 for individuals born after January 1, 1939, who are age 65+
   * Taxpayer must choose either age exemption OR alternative age deduction
   */
  alternativeAgeDeduction: 1200000, // $12,000 in cents

  /**
   * Minimum age for age exemption/deduction
   */
  minimumAgeForExemption: 65,

  /**
   * Year cutoff for alternative age deduction eligibility
   * Must be born AFTER January 1, 1939
   */
  alternativeAgeDeductionBirthYearCutoff: 1939,
} as const;

/**
 * Type for Virginia-specific state tax input
 */
export interface VAStateSpecific {
  /** Did taxpayer itemize on federal return? If yes, cannot use standard deduction */
  itemizedOnFederal?: boolean;

  /** State withholding */
  stateWithheld?: number;

  /** State estimated tax payments */
  stateEstPayments?: number;

  /** Age of taxpayer (for age exemption/deduction) */
  taxpayerAge?: number;

  /** Age of spouse (for age exemption/deduction on MFJ returns) */
  spouseAge?: number;

  /** Birth year of taxpayer (for alternative age deduction eligibility) */
  taxpayerBirthYear?: number;

  /** Birth year of spouse (for alternative age deduction eligibility on MFJ) */
  spouseBirthYear?: number;

  /** Use alternative age deduction instead of age exemption? */
  useAlternativeAgeDeduction?: boolean;

  /** Is taxpayer blind? (qualifies for additional $800 exemption) */
  taxpayerBlind?: boolean;

  /** Is spouse blind? (qualifies for additional $800 exemption on MFJ) */
  spouseBlind?: boolean;
}

/**
 * Calculate Virginia tax using progressive brackets
 *
 * @param taxableIncome Taxable income in cents
 * @returns Tax liability in cents
 */
export function calculateVirginiaTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let previousThreshold = 0;

  for (let i = 0; i < VA_BRACKETS_2025.length; i++) {
    const bracket = VA_BRACKETS_2025[i];
    if (!bracket) break;
    const nextThreshold =
      i < VA_BRACKETS_2025.length - 1 ? (VA_BRACKETS_2025[i + 1]?.threshold ?? Infinity) : Infinity;

    if (taxableIncome <= previousThreshold) {
      break;
    }

    const taxableInThisBracket = Math.min(taxableIncome, nextThreshold) - previousThreshold;
    tax += Math.round(taxableInThisBracket * bracket.rate);

    previousThreshold = nextThreshold;
  }

  return tax;
}
