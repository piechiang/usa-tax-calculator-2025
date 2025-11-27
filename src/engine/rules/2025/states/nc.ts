/**
 * North Carolina State Tax Rules for 2025
 *
 * Sources:
 * - North Carolina Department of Revenue (NCDOR)
 * - https://www.ncdor.gov
 * - 2025 NC Tax Rate: 4.25% (reduced from 4.5% in 2024)
 *
 * Key Features:
 * - Flat 4.25% tax rate on taxable income
 * - Standard deductions: $12,750 (single) / $25,500 (MFJ) / $19,125 (HOH)
 * - No personal exemptions
 * - Simple flat tax system
 *
 * 2025 Changes:
 * - Tax rate reduced from 4.5% to 4.25%
 * - Standard deduction amounts remain at 2024 levels
 * - Future reduction to 3.99% planned for 2026
 */

import { multiplyCents } from '../../../util/money';

/**
 * North Carolina Tax Rate for 2025
 * Flat 4.25% on all taxable income
 */
export const NC_TAX_RATE_2025 = 0.0425;

/**
 * North Carolina Tax Rules for 2025
 */
export const NC_RULES_2025 = {
  /**
   * Flat tax rate (4.25% for 2025)
   */
  taxRate: 0.0425,

  /**
   * Standard Deduction
   * NC follows federal eligibility - if not eligible for federal standard deduction, NC is ZERO
   */
  standardDeduction: {
    single: 1275000, // $12,750 in cents
    marriedJointly: 2550000, // $25,500 in cents
    marriedSeparately: 1275000, // $12,750 in cents
    headOfHousehold: 1912500, // $19,125 in cents
  },

  /**
   * Personal Exemptions
   * NC does not have personal exemptions (eliminated)
   */
  hasPersonalExemption: false,

  /**
   * Important Notes:
   * - If spouse itemizes on MFS, the other spouse must itemize (standard deduction = $0)
   * - No additional deduction for age 65+ or blind
   * - Must be eligible for federal standard deduction to claim NC standard deduction
   */
} as const;

/**
 * Calculate North Carolina tax using flat rate
 *
 * @param taxableIncome - NC taxable income in cents
 * @returns Tax amount in cents
 */
export function calculateNorthCarolinaTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  return Math.round(multiplyCents(taxableIncome, NC_RULES_2025.taxRate));
}

/**
 * Type for North Carolina-specific input data
 */
export interface NorthCarolinaSpecificInput {
  // NC uses federal AGI with minimal modifications

  // For future expansion:
  // - NC-specific income adjustments
  // - NC-specific deductions
  // - Bailey settlement exclusion (for certain pension income)
  // - Other NC-specific provisions

  /**
   * Whether spouse is itemizing (for MFS only)
   * If true, this taxpayer cannot use standard deduction
   */
  spouseItemizing?: boolean;
}
