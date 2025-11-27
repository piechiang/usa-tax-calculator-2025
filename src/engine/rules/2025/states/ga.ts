/**
 * Georgia State Tax Rules for 2025
 *
 * Georgia uses a flat income tax system with a gradually declining rate.
 * The state has generous retirement income exclusions and a high standard deduction.
 *
 * Key Features:
 * - Flat 5.19% tax rate (effective July 1, 2025, down from 5.39%)
 * - Standard deduction: $12,000 (single) / $24,000 (MFJ)
 * - Dependent exemption: $4,000 per dependent
 * - Retirement income exclusion: $35,000 (ages 62-64) / $65,000 (age 65+)
 * - Social Security and Railroad Retirement fully exempt
 *
 * Sources:
 * - Georgia Department of Revenue (https://dor.georgia.gov)
 * - HB 1437 (Tax Reform Act)
 * - 2025 Georgia Tax Code
 *
 * @module rules/2025/states/ga
 */

/**
 * Georgia 2025 Tax Rules
 */
export const GA_RULES_2025 = {
  /** Flat income tax rate (effective July 1, 2025) */
  taxRate: 0.0519, // 5.19%

  /**
   * Standard deduction amounts by filing status
   * Note: Georgia increased these in tax reform to offset elimination of personal exemptions
   */
  standardDeduction: {
    single: 1200000, // $12,000 in cents
    marriedJointly: 2400000, // $24,000 in cents
    marriedSeparately: 1200000, // $12,000 in cents
    headOfHousehold: 1200000, // $12,000 in cents
  },

  /**
   * Personal exemptions have been eliminated as of 2025
   * Only dependent exemptions remain
   */
  dependentExemption: 400000, // $4,000 per dependent in cents

  /**
   * Retirement income exclusion amounts by age
   * Each spouse qualifies separately (can double for MFJ)
   */
  retirementExclusion: {
    /** Age 62-64 exclusion amount */
    age62to64: 3500000, // $35,000 in cents

    /** Age 65+ exclusion amount */
    age65Plus: 6500000, // $65,000 in cents

    /** Military retirement exclusion (under age 62) */
    militaryRetirement: 1750000, // $17,500 in cents

    /** Minimum age for retirement exclusion */
    minimumAge: 62,
  },

  /**
   * Types of income included in retirement exclusion:
   * - Interest
   * - Dividends
   * - Net rental income
   * - Capital gains
   * - Royalties
   * - Pensions and annuities
   * - First $5,000 of earned income (if over 62)
   */
  retirementIncomeTypes: {
    interest: true,
    dividends: true,
    netRentals: true,
    capitalGains: true,
    royalties: true,
    pensions: true,
    annuities: true,
    earnedIncomeLimit: 500000, // First $5,000 in cents
  },

  /**
   * Income types that are 100% exempt (don't count toward exclusion)
   */
  fullyExemptIncome: {
    socialSecurity: true,
    railroadRetirement: true,
  },
} as const;

/**
 * Type for Georgia-specific state tax input
 */
export interface GAStateSpecific {
  /** Property tax paid on principal residence (for credit calculation) */
  propertyTaxPaid?: number;

  /** State withholding */
  stateWithheld?: number;

  /** Retirement income details (for exclusion calculation) */
  retirementIncome?: {
    /** Social Security benefits (100% exempt, doesn't count toward limit) */
    socialSecurityBenefits?: number;

    /** Railroad Retirement benefits (100% exempt) */
    railroadRetirement?: number;

    /** Pension and annuity income */
    pensionIncome?: number;

    /** Interest income (from retirement accounts or general) */
    interestIncome?: number;

    /** Dividend income */
    dividendIncome?: number;

    /** Net rental income */
    netRentalIncome?: number;

    /** Capital gains */
    capitalGains?: number;

    /** Royalties */
    royalties?: number;

    /** First $5,000 of earned income (if over 62) */
    earnedIncome?: number;
  };

  /** Age of taxpayer (for retirement exclusion) */
  taxpayerAge?: number;

  /** Age of spouse (for retirement exclusion on MFJ returns) */
  spouseAge?: number;

  /** Is taxpayer a military retiree? */
  isMilitaryRetiree?: boolean;

  /** Is spouse a military retiree? (for MFJ) */
  isSpouseMilitaryRetiree?: boolean;
}
