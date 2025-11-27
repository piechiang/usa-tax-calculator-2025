import type { FilingStatus } from '../../../../types';

/**
 * California Standard Deductions for 2025
 *
 * Source: FTB Publication 1001 (2025 California Tax Rates and Exemptions)
 * https://www.ftb.ca.gov/forms/2025-california-tax-rates-and-exemptions.html
 *
 * California does NOT have additional deductions for age 65+ or blindness
 * (unlike federal rules)
 *
 * All amounts in cents
 */

export const CA_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 584900,              // $5,849
  marriedJointly: 1169800,     // $11,698
  marriedSeparately: 584900,   // $5,849
  headOfHousehold: 1178000,    // $11,780
};

/**
 * California Personal Exemption Credits for 2025
 *
 * California eliminated personal exemptions and replaced them with
 * nonrefundable credits starting in 2019.
 *
 * Source: FTB Notice 2019-03
 * https://www.ftb.ca.gov/tax-pros/law/legislation/prior/2018/sb1.html
 */

export const CA_PERSONAL_EXEMPTION_2025 = 0; // Eliminated in 2019

/**
 * California Dependent Exemption for 2025
 *
 * California provides a tax credit (not deduction) for dependents
 * See credits.ts for dependent credit amounts
 */

export const CA_DEPENDENT_EXEMPTION_2025 = 0; // Converted to credit in 2019

/**
 * California Itemized Deduction Rules for 2025
 *
 * California generally follows federal itemized deduction rules with some differences:
 * - No SALT cap (unlike federal $10,000 cap)
 * - Medical expenses: 7.5% of AGI floor (same as federal)
 * - Mortgage interest: Generally follows federal rules
 * - Charitable contributions: Generally follows federal rules
 *
 * Source: FTB Form 540 Schedule CA Instructions
 */

/**
 * SALT (State and Local Tax) deduction cap for California
 * California does NOT have a SALT cap (unlike federal $10,000 limit)
 */
export const CA_SALT_CAP_2025 = Infinity; // No cap

/**
 * Medical expense AGI threshold for California
 * Must exceed 7.5% of AGI to be deductible
 */
export const CA_MEDICAL_EXPENSE_THRESHOLD = 0.075; // 7.5% of AGI
