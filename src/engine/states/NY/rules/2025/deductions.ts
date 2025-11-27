import type { FilingStatus } from '../../../../types';

/**
 * New York 2024 Standard Deduction (for 2025 tax returns)
 *
 * New York provides standard deductions that vary by filing status.
 * The amounts shown are for the 2024 tax year (filed in 2025).
 *
 * Source: New York State Department of Taxation and Finance
 * Form IT-201 Instructions (2024)
 * https://www.tax.ny.gov/pit/file/it201i.htm
 *
 * Last Updated: 2025-10-19
 */

export const NY_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 8000_00,                    // $8,000
  marriedJointly: 16050_00,           // $16,050
  marriedSeparately: 8000_00,         // $8,000
  headOfHousehold: 11200_00           // $11,200
};

/**
 * New York 2024 Dependent Exemption (for 2025 tax returns)
 *
 * New York allows a deduction for each dependent.
 * The amount is $1,000 per dependent for the 2024 tax year.
 *
 * Source: New York State Department of Taxation and Finance
 * https://www.tax.ny.gov/pit/file/it201i.htm
 *
 * Last Updated: 2025-10-19
 */

export const NY_DEPENDENT_EXEMPTION_2025 = 1000_00; // $1,000 per dependent

/**
 * New York State does not have personal exemptions (for self/spouse)
 * New York only has dependent exemptions
 */

export const NY_PERSONAL_EXEMPTION_2025 = 0; // No personal exemption in NY
