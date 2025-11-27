/**
 * Alabama State Tax Rules for 2025
 *
 * Alabama has a 3-bracket progressive income tax system with rates of 2%, 4%, and 5%.
 * A unique feature is that Alabama allows taxpayers to deduct federal income taxes paid
 * from their state taxable income.
 *
 * Key Features:
 * - 3 tax brackets (2%, 4%, 5%)
 * - Standard deduction: $4,500 (single), $11,500 (MFJ)
 * - Federal income tax deduction allowed
 * - Income-based dependent exemptions
 * - No personal exemption for taxpayer
 *
 * Sources:
 * - Alabama Department of Revenue: https://www.revenue.alabama.gov
 * - 2025 Alabama tax forms and instructions
 *
 * Last Updated: 2025-01-22
 */

import type { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Alabama Tax Brackets for 2025
 *
 * Alabama uses a simple 3-bracket system with very low thresholds.
 * The top rate of 5% kicks in at just $3,000 for single filers.
 *
 * Tax Structure:
 * - First $500 (single) / $1,000 (MFJ): 2%
 * - Next $2,500 (single) / $5,000 (MFJ): 4%
 * - Over $3,000 (single) / $6,000 (MFJ): 5%
 */
export const AL_TAX_BRACKETS_2025: Record<
  FilingStatus,
  Array<{ max: number; rate: number }>
> = {
  single: [
    { max: dollarsToCents(500), rate: 0.02 }, // 2% on first $500
    { max: dollarsToCents(3000), rate: 0.04 }, // 4% on $501-$3,000
    { max: Infinity, rate: 0.05 }, // 5% on $3,001+
  ],
  marriedJointly: [
    { max: dollarsToCents(1000), rate: 0.02 }, // 2% on first $1,000
    { max: dollarsToCents(6000), rate: 0.04 }, // 4% on $1,001-$6,000
    { max: Infinity, rate: 0.05 }, // 5% on $6,001+
  ],
  marriedSeparately: [
    { max: dollarsToCents(500), rate: 0.02 }, // 2% on first $500
    { max: dollarsToCents(3000), rate: 0.04 }, // 4% on $501-$3,000
    { max: Infinity, rate: 0.05 }, // 5% on $3,001+
  ],
  headOfHousehold: [
    { max: dollarsToCents(500), rate: 0.02 }, // 2% on first $500
    { max: dollarsToCents(3000), rate: 0.04 }, // 4% on $501-$3,000
    { max: Infinity, rate: 0.05 }, // 5% on $3,001+
  ],
};

/**
 * Alabama Standard Deduction for 2025
 *
 * Alabama has fixed standard deductions that do not vary by income
 * (unlike some other states with sliding scales).
 *
 * Amounts:
 * - Single: $4,500
 * - MFJ: $11,500
 * - MFS: $4,500 (assumed same as single)
 * - HOH: $4,500 (assumed same as single)
 *
 * Note: Alabama allows itemized deductions as an alternative,
 * but this implementation uses standard deduction only.
 */
export const AL_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(4500),
  marriedJointly: dollarsToCents(11500),
  marriedSeparately: dollarsToCents(4500),
  headOfHousehold: dollarsToCents(4500),
};

/**
 * Alabama Dependent Exemptions for 2025
 *
 * Alabama provides dependent exemptions that vary by AGI:
 * - AGI ≤ $20,000: $1,000 per dependent
 * - AGI $20,001 - $100,000: $500 per dependent
 * - AGI > $100,000: $300 per dependent
 *
 * Note: Alabama does NOT provide a personal exemption for the taxpayer or spouse.
 * Only dependent exemptions are allowed.
 *
 * Source: Alabama Form 40 instructions
 */
export interface DependentExemptionTier {
  maxAGI: number; // Maximum AGI for this tier (in cents)
  exemptionAmount: number; // Exemption amount per dependent (in cents)
}

export const AL_DEPENDENT_EXEMPTIONS_2025: DependentExemptionTier[] = [
  {
    maxAGI: dollarsToCents(20000),
    exemptionAmount: dollarsToCents(1000),
  },
  {
    maxAGI: dollarsToCents(100000),
    exemptionAmount: dollarsToCents(500),
  },
  {
    maxAGI: Infinity,
    exemptionAmount: dollarsToCents(300),
  },
];

/**
 * Get dependent exemption amount based on AGI
 *
 * @param agi - Alabama AGI (in cents)
 * @returns Exemption amount per dependent (in cents)
 */
export function getDependentExemptionAmount(agi: number): number {
  for (const tier of AL_DEPENDENT_EXEMPTIONS_2025) {
    if (agi <= tier.maxAGI) {
      return tier.exemptionAmount;
    }
  }
  // Should never reach here due to Infinity in last tier
  return AL_DEPENDENT_EXEMPTIONS_2025[AL_DEPENDENT_EXEMPTIONS_2025.length - 1]
    .exemptionAmount;
}

/**
 * Federal Income Tax Deduction
 *
 * Alabama is one of the few states that allows taxpayers to deduct
 * federal income taxes paid when calculating state taxable income.
 *
 * This deduction is for the net federal tax liability (after credits),
 * not the gross tax before credits.
 *
 * Impact: This deduction disproportionately benefits higher earners,
 * as they pay more in federal taxes and thus get a larger deduction.
 *
 * Example:
 * - Federal tax paid: $15,000
 * - Alabama AGI before deduction: $100,000
 * - Alabama AGI after federal tax deduction: $85,000
 * - This reduces Alabama taxable income and thus Alabama tax owed
 *
 * Source: Alabama Department of Revenue
 * https://www.revenue.alabama.gov/faqs/does-alabama-provide-for-a-federal-income-tax-deduction/
 */
export const AL_ALLOWS_FEDERAL_TAX_DEDUCTION = true;
