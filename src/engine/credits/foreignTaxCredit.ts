/**
 * Foreign Tax Credit (FTC) Calculation - Form 1116
 *
 * The Foreign Tax Credit allows U.S. taxpayers to offset U.S. income tax
 * on income that was also taxed by a foreign country, preventing double taxation.
 *
 * Key Rules (2025):
 * - Credit is limited to the lesser of: foreign taxes paid OR the FTC limitation
 * - FTC Limitation = U.S. Tax × (Foreign Source Income / Worldwide Income)
 * - Credit is non-refundable (can reduce tax to $0 but not create refund)
 * - Unused credits can be carried back 1 year or forward 10 years
 * - Simplified election available if qualified foreign taxes ≤ $300 ($600 MFJ)
 *
 * Income Categories (separate Form 1116 for each):
 * - General Category: Wages, business income, etc.
 * - Passive Category: Interest, dividends, rents, royalties
 * - Foreign Branch Category: Income from foreign branch operations
 *
 * Sources:
 * - IRS Form 1116 and Instructions (2024/2025)
 * - IRS Publication 514 (Foreign Tax Credit for Individuals)
 * - IRC Section 901-909
 *
 * @module credits/foreignTaxCredit
 */

import { FilingStatus } from '../types';
import { multiplyCents, max0 } from '../util/money';

/**
 * Foreign income category for Form 1116
 * Each category requires a separate Form 1116
 */
export type ForeignIncomeCategory =
  | 'general' // Active income: wages, business, etc.
  | 'passive' // Passive income: interest, dividends, rents, royalties
  | 'foreignBranch' // Income from foreign branch of U.S. business
  | 'section951A'; // GILTI (Global Intangible Low-Taxed Income)

/**
 * Input for a single foreign income source/country
 */
export interface ForeignIncomeSource {
  /** Country or possession name */
  country: string;

  /** Income category for this source */
  category: ForeignIncomeCategory;

  /** Gross foreign income (before foreign taxes, in cents) */
  grossForeignIncome: number;

  /** Foreign taxes paid or accrued (in cents) */
  foreignTaxesPaid: number;

  /** Expenses allocable to foreign income (in cents) */
  expenses?: number;

  /** Is this income from a treaty country? */
  treatyCountry?: boolean;
}

/**
 * Input for Foreign Tax Credit calculation
 */
export interface ForeignTaxCreditInput {
  /** Filing status */
  filingStatus: FilingStatus;

  /** Total U.S. taxable income (in cents) */
  totalTaxableIncome: number;

  /** Total U.S. tax before credits (in cents) */
  usTaxBeforeCredits: number;

  /** Foreign income sources */
  foreignIncomeSources: ForeignIncomeSource[];

  /** Foreign tax credit carryover from prior year (in cents) */
  priorYearCarryover?: number;

  /** Use simplified election (no Form 1116)? */
  useSimplifiedElection?: boolean;
}

/**
 * Foreign Tax Credit calculation result
 */
export interface ForeignTaxCreditResult {
  /** Total foreign tax credit claimed (in cents) */
  foreignTaxCredit: number;

  /** Foreign tax credit limitation (in cents) */
  creditLimitation: number;

  /** Total foreign taxes paid (in cents) */
  totalForeignTaxesPaid: number;

  /** Total foreign source taxable income (in cents) */
  totalForeignSourceIncome: number;

  /** Unused foreign tax credit available for carryover (in cents) */
  unusedCreditCarryforward: number;

  /** Was simplified election used? */
  usedSimplifiedElection: boolean;

  /** Per-category breakdown */
  categoryBreakdown: {
    category: ForeignIncomeCategory;
    foreignIncome: number;
    foreignTaxesPaid: number;
    creditLimitation: number;
    creditAllowed: number;
  }[];

  /** Calculation notes */
  calculationNotes: string[];
}

/**
 * Simplified election thresholds (2025)
 */
const SIMPLIFIED_ELECTION_THRESHOLD_SINGLE = 30000; // $300
const SIMPLIFIED_ELECTION_THRESHOLD_MFJ = 60000; // $600

/**
 * Compute Foreign Tax Credit (Form 1116)
 *
 * @param input Foreign tax credit input data
 * @returns Foreign tax credit calculation result
 */
export function computeForeignTaxCredit2025(input: ForeignTaxCreditInput): ForeignTaxCreditResult {
  const notes: string[] = [];

  // Check if taxpayer qualifies for simplified election
  const qualifiesForSimplified = checkSimplifiedElection(input);
  const useSimplified = input.useSimplifiedElection && qualifiesForSimplified;

  if (input.useSimplifiedElection && !qualifiesForSimplified) {
    notes.push('Does not qualify for simplified election - must use Form 1116');
  }

  // Calculate total foreign taxes paid and foreign source income
  let totalForeignTaxesPaid = 0;
  let totalForeignSourceIncome = 0;

  for (const source of input.foreignIncomeSources) {
    totalForeignTaxesPaid += source.foreignTaxesPaid;
    const netIncome = source.grossForeignIncome - (source.expenses || 0);
    totalForeignSourceIncome += max0(netIncome);
  }

  // If using simplified election, credit = min(taxes paid, threshold)
  if (useSimplified) {
    const threshold =
      input.filingStatus === 'marriedJointly'
        ? SIMPLIFIED_ELECTION_THRESHOLD_MFJ
        : SIMPLIFIED_ELECTION_THRESHOLD_SINGLE;

    const creditAllowed = Math.min(totalForeignTaxesPaid, threshold);

    notes.push('Used simplified election - no Form 1116 required');
    notes.push('No carryback or carryforward allowed with simplified election');

    return {
      foreignTaxCredit: creditAllowed,
      creditLimitation: threshold,
      totalForeignTaxesPaid,
      totalForeignSourceIncome,
      unusedCreditCarryforward: 0, // No carryover with simplified election
      usedSimplifiedElection: true,
      categoryBreakdown: [],
      calculationNotes: notes,
    };
  }

  // Full Form 1116 calculation
  // Group income sources by category
  const categorizedSources = categorizeForeignIncome(input.foreignIncomeSources);
  const categoryBreakdown: ForeignTaxCreditResult['categoryBreakdown'] = [];

  let totalCreditAllowed = 0;
  let totalCreditLimitation = 0;
  let totalUnusedCredit = 0;

  // Calculate credit for each category separately (separate Form 1116 for each)
  for (const [category, sources] of Object.entries(categorizedSources)) {
    const categoryResult = calculateCategoryCredit(
      sources,
      input.totalTaxableIncome,
      input.usTaxBeforeCredits
    );

    categoryBreakdown.push({
      category: category as ForeignIncomeCategory,
      foreignIncome: categoryResult.foreignIncome,
      foreignTaxesPaid: categoryResult.foreignTaxesPaid,
      creditLimitation: categoryResult.creditLimitation,
      creditAllowed: categoryResult.creditAllowed,
    });

    totalCreditAllowed += categoryResult.creditAllowed;
    totalCreditLimitation += categoryResult.creditLimitation;
    totalUnusedCredit += categoryResult.unusedCredit;
  }

  // Apply prior year carryover if available
  let creditWithCarryover = totalCreditAllowed;
  if (input.priorYearCarryover && input.priorYearCarryover > 0) {
    // Carryover can only be used up to the limitation
    const remainingLimitation = totalCreditLimitation - totalCreditAllowed;
    const carryoverUsed = Math.min(input.priorYearCarryover, remainingLimitation);
    creditWithCarryover += carryoverUsed;
    totalUnusedCredit += input.priorYearCarryover - carryoverUsed;

    if (carryoverUsed > 0) {
      notes.push(`Applied $${carryoverUsed / 100} from prior year carryover`);
    }
  }

  // Ensure credit doesn't exceed U.S. tax liability
  const finalCredit = Math.min(creditWithCarryover, input.usTaxBeforeCredits);

  // Calculate carryforward (unused credits)
  const unusedCreditCarryforward = totalUnusedCredit + (creditWithCarryover - finalCredit);

  if (unusedCreditCarryforward > 0) {
    notes.push(
      `$${unusedCreditCarryforward / 100} unused credit available for carryback (1 year) or carryforward (10 years)`
    );
  }

  notes.push(
    `Credit calculated using Form 1116 for ${categoryBreakdown.length} income categor${categoryBreakdown.length === 1 ? 'y' : 'ies'}`
  );

  return {
    foreignTaxCredit: finalCredit,
    creditLimitation: totalCreditLimitation,
    totalForeignTaxesPaid,
    totalForeignSourceIncome,
    unusedCreditCarryforward,
    usedSimplifiedElection: false,
    categoryBreakdown,
    calculationNotes: notes,
  };
}

/**
 * Check if taxpayer qualifies for simplified election (no Form 1116)
 *
 * Requirements:
 * - All foreign income is passive income
 * - Foreign taxes ≤ $300 ($600 if MFJ)
 * - All income and taxes reported on payee statement (e.g., 1099-DIV)
 */
function checkSimplifiedElection(input: ForeignTaxCreditInput): boolean {
  // Check tax threshold
  const threshold =
    input.filingStatus === 'marriedJointly'
      ? SIMPLIFIED_ELECTION_THRESHOLD_MFJ
      : SIMPLIFIED_ELECTION_THRESHOLD_SINGLE;

  let totalForeignTaxes = 0;
  let allPassive = true;

  for (const source of input.foreignIncomeSources) {
    totalForeignTaxes += source.foreignTaxesPaid;
    if (source.category !== 'passive') {
      allPassive = false;
    }
  }

  return allPassive && totalForeignTaxes <= threshold;
}

/**
 * Group foreign income sources by category
 */
function categorizeForeignIncome(
  sources: ForeignIncomeSource[]
): Record<ForeignIncomeCategory, ForeignIncomeSource[]> {
  const categorized: Record<string, ForeignIncomeSource[]> = {};

  for (const source of sources) {
    if (!categorized[source.category]) {
      categorized[source.category] = [];
    }
    categorized[source.category]!.push(source);
  }

  return categorized as Record<ForeignIncomeCategory, ForeignIncomeSource[]>;
}

/**
 * Calculate foreign tax credit for a single income category
 *
 * Formula:
 * Credit Limitation = U.S. Tax × (Foreign Source Income / Total Taxable Income)
 * Credit Allowed = min(Foreign Taxes Paid, Credit Limitation)
 */
function calculateCategoryCredit(
  sources: ForeignIncomeSource[],
  totalTaxableIncome: number,
  usTaxBeforeCredits: number
): {
  foreignIncome: number;
  foreignTaxesPaid: number;
  creditLimitation: number;
  creditAllowed: number;
  unusedCredit: number;
} {
  let foreignIncome = 0;
  let foreignTaxesPaid = 0;

  // Sum up income and taxes for this category
  for (const source of sources) {
    const netIncome = source.grossForeignIncome - (source.expenses || 0);
    foreignIncome += max0(netIncome);
    foreignTaxesPaid += source.foreignTaxesPaid;
  }

  // Calculate credit limitation using the formula:
  // Limitation = U.S. Tax × (Foreign Income / Total Taxable Income)
  let creditLimitation = 0;
  if (totalTaxableIncome > 0) {
    const fraction = foreignIncome / totalTaxableIncome;
    creditLimitation = multiplyCents(usTaxBeforeCredits, fraction);
  }

  // Credit allowed is lesser of taxes paid or limitation
  const creditAllowed = Math.min(foreignTaxesPaid, creditLimitation);

  // Unused credit (excess foreign taxes that can't be claimed this year)
  const unusedCredit = max0(foreignTaxesPaid - creditLimitation);

  return {
    foreignIncome,
    foreignTaxesPaid,
    creditLimitation,
    creditAllowed,
    unusedCredit,
  };
}
