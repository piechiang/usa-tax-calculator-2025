/**
 * Massachusetts State Tax Rules for 2025
 *
 * Massachusetts uses a dual-rate system:
 * - 5% on all taxable income
 * - Additional 4% surtax on income exceeding $1 million (inflation-adjusted)
 *
 * Key Features:
 * - Flat 5% base rate
 * - 4% millionaire surtax (total 9% on income over threshold)
 * - Personal exemption: $4,400 (single) / $8,800 (MFJ)
 * - Dependent exemption: $1,000 per dependent
 * - Age 65+ exemption: $700 per qualifying person
 * - Blind exemption: $2,200 per qualifying person
 * - No standard deduction (unlike most states)
 *
 * Sources:
 * - Massachusetts Department of Revenue (https://www.mass.gov)
 * - Massachusetts General Law Chapter 62
 * - 2025 tax law updates
 *
 * @module rules/2025/states/ma
 */

/**
 * Massachusetts 2025 Tax Rules
 */
export const MA_RULES_2025 = {
  /**
   * Base income tax rate (applies to all taxable income)
   */
  baseTaxRate: 0.05, // 5%

  /**
   * Surtax rate on income exceeding threshold
   */
  surtaxRate: 0.04, // 4% additional (total 9% on income over threshold)

  /**
   * Surtax threshold (inflation-adjusted annually)
   * 2023: $1,000,000
   * 2024: $1,053,750
   * 2025: Estimated $1,080,000 (using ~2.5% inflation adjustment)
   *
   * Note: Actual 2025 threshold will be announced by MA DOR
   * This is a conservative estimate for implementation
   */
  surtaxThreshold: 108000000, // $1,080,000 in cents (estimated)

  /**
   * Personal exemption amounts by filing status
   * Massachusetts has personal exemptions (unlike federal after TCJA)
   */
  personalExemption: {
    single: 440000, // $4,400 in cents
    marriedJointly: 880000, // $8,800 in cents
    marriedSeparately: 440000, // $4,400 in cents
    headOfHousehold: 440000, // $4,400 in cents
  },

  /**
   * Dependent exemption amount
   * $1,000 per qualifying dependent
   */
  dependentExemption: 100000, // $1,000 per dependent in cents

  /**
   * Age exemption (age 65 or older)
   * $700 per qualifying person
   */
  ageExemption: 70000, // $700 per qualifying person in cents

  /**
   * Minimum age for age exemption
   */
  minimumAgeForExemption: 65,

  /**
   * Blind exemption
   * $2,200 per qualifying person
   */
  blindExemption: 220000, // $2,200 per qualifying person in cents

  /**
   * Massachusetts does not have a standard deduction
   * (This differs from most states and the federal system)
   */
  hasStandardDeduction: false,
} as const;

/**
 * Type for Massachusetts-specific state tax input
 */
export interface MAStateSpecific {
  /** State withholding */
  stateWithheld?: number;

  /** State estimated tax payments */
  stateEstPayments?: number;

  /** Age of taxpayer (for age exemption) */
  taxpayerAge?: number;

  /** Age of spouse (for age exemption on MFJ returns) */
  spouseAge?: number;

  /** Is taxpayer blind? (qualifies for $2,200 exemption) */
  taxpayerBlind?: boolean;

  /** Is spouse blind? (qualifies for $2,200 exemption on MFJ) */
  spouseBlind?: boolean;

  /** Number of qualifying dependents (for $1,000 per dependent exemption) */
  dependents?: number;
}

/**
 * Calculate Massachusetts tax using dual-rate system
 *
 * @param taxableIncome Taxable income in cents
 * @returns Object with base tax, surtax, and total tax (all in cents)
 */
export function calculateMassachusettsTax(taxableIncome: number): {
  baseTax: number;
  surtax: number;
  totalTax: number;
} {
  if (taxableIncome <= 0) {
    return { baseTax: 0, surtax: 0, totalTax: 0 };
  }

  // Base tax: 5% on all taxable income
  const baseTax = Math.round(taxableIncome * MA_RULES_2025.baseTaxRate);

  // Surtax: 4% on income exceeding threshold
  let surtax = 0;
  if (taxableIncome > MA_RULES_2025.surtaxThreshold) {
    const excessIncome = taxableIncome - MA_RULES_2025.surtaxThreshold;
    surtax = Math.round(excessIncome * MA_RULES_2025.surtaxRate);
  }

  const totalTax = baseTax + surtax;

  return { baseTax, surtax, totalTax };
}
