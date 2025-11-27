/**
 * Indiana State Tax Rules for 2025
 *
 * Indiana has a flat income tax rate of 3.0% (reduced from 3.05% in 2024).
 * Indiana has personal exemptions but NO standard deduction.
 * All 92 counties charge local income taxes (0.5%-3.0%).
 *
 * Key Features:
 * - Flat 3.0% state tax rate (will decrease to 2.9% by 2027)
 * - Personal exemptions: $1,000 (taxpayer/spouse), $1,500 (dependents)
 * - Additional exemptions for age 65+ and adopted children
 * - County income taxes (optional in this implementation)
 * - State EITC: 10% of federal EITC
 *
 * Sources:
 * - Indiana Department of Revenue: https://www.in.gov/dor
 * - https://blog.turbotax.intuit.com/income-tax-by-state/indiana-106926/
 * - https://www.symmetry.com/payroll-tax-insights/indiana-state-local-tax-system
 *
 * Last Updated: 2025-01-22
 */

import { dollarsToCents } from '../../../util/money';

/**
 * Indiana Flat Tax Rate for 2025
 *
 * Indiana reduced its flat tax rate from 3.05% (2024) to 3.0% (2025).
 * The rate will continue to decrease:
 * - 2025: 3.0%
 * - 2026: 2.95%
 * - 2027: 2.9%
 *
 * Source: Indiana Department of Revenue
 */
export const IN_TAX_RATE_2025 = 0.03; // 3.0%

/**
 * Indiana Personal Exemptions for 2025
 *
 * Indiana has NO standard deduction but provides personal exemptions:
 * - Taxpayer: $1,000
 * - Spouse (if MFJ): $1,000
 * - Each dependent: $1,500
 *
 * Source: Multiple sources including payroll tax guides
 */
export const IN_TAXPAYER_EXEMPTION_2025 = dollarsToCents(1000);
export const IN_SPOUSE_EXEMPTION_2025 = dollarsToCents(1000);
export const IN_DEPENDENT_EXEMPTION_2025 = dollarsToCents(1500);

/**
 * Indiana Additional Exemptions for 2025
 *
 * Age 65 or Older:
 * - $1,000 additional exemption for taxpayer if 65+
 * - $1,000 additional exemption for spouse if 65+
 * - Additional $500 if AGI < $40,000 ($20,000 if MFS)
 *
 * Adopted Children:
 * - $3,000 per adopted child (instead of $1,500 dependent exemption)
 *
 * Note: This implementation includes basic exemptions only.
 * Age-based and adopted child exemptions could be added in future enhancements.
 *
 * Source: https://www.symmetry.com/payroll-tax-insights/indiana-state-local-tax-system
 */
export const IN_AGE_65_EXEMPTION_2025 = dollarsToCents(1000);
export const IN_ADOPTED_CHILD_EXEMPTION_2025 = dollarsToCents(3000);

/**
 * Indiana Earned Income Tax Credit (EITC) for 2025
 *
 * Indiana provides a state EITC equal to 10% of the federal EITC.
 * The credit is NON-refundable (unlike some states).
 *
 * Source: https://blog.turbotax.intuit.com/income-tax-by-state/indiana-106926/
 */
export const IN_EITC_PERCENTAGE_2025 = 0.10; // 10% of federal EITC

/**
 * Indiana County Income Taxes (NOT IMPLEMENTED)
 *
 * All 92 Indiana counties charge local income taxes ranging from 0.5% to 3.0%.
 * These taxes are in addition to the 3.0% state tax.
 *
 * County rates vary significantly:
 * - Marion County (Indianapolis): ~2.02%
 * - Hamilton County: ~1.00%
 * - Lake County: ~1.50%
 * - Etc.
 *
 * Note: This implementation does NOT include county taxes.
 * Future enhancement could add county-specific rates.
 *
 * Source: https://blog.turbotax.intuit.com/income-tax-by-state/indiana-106926/
 */

/**
 * Calculate total Indiana personal exemptions
 *
 * @param filingStatus - Filing status
 * @param dependents - Number of dependents
 * @returns Total exemptions amount (in cents)
 */
export function calculateINExemptions(
  filingStatus: 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold',
  dependents: number
): number {
  let totalExemptions = 0;

  // Taxpayer exemption
  totalExemptions += IN_TAXPAYER_EXEMPTION_2025;

  // Spouse exemption (for MFJ only)
  if (filingStatus === 'marriedJointly') {
    totalExemptions += IN_SPOUSE_EXEMPTION_2025;
  }

  // Dependent exemptions
  totalExemptions += dependents * IN_DEPENDENT_EXEMPTION_2025;

  return totalExemptions;
}
