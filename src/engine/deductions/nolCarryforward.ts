/**
 * Net Operating Loss (NOL) Carryforward Deduction
 *
 * NOL allows taxpayers to carry forward business losses from prior years
 * to offset taxable income in future years.
 *
 * Key Rules (Post-TCJA 2018+):
 * - NOL carryforward is UNLIMITED years (no 20-year limit)
 * - NOL carryback is ELIMINATED (except farming losses)
 * - NOL deduction LIMITED to 80% of taxable income (before NOL)
 * - NOLs must be used in chronological order (FIFO)
 *
 * Sources:
 * - IRC §172: Net Operating Losses
 * - TCJA (Tax Cuts and Jobs Act) 2017
 * - CARES Act 2020 (temporary modifications for 2018-2020)
 * - IRS Publication 536: Net Operating Losses (NOLs)
 */

import type { FilingStatus } from '../types';

/**
 * NOL from a specific prior year
 */
export interface NOLCarryforward {
  taxYear: number; // Year the loss occurred
  originalNOL: number; // Original NOL amount (cents, positive number)
  remainingNOL: number; // Amount still available to use (cents)
  source: 'business' | 'rental' | 'farm' | 'casualty' | 'other';
}

/**
 * NOL deduction input
 */
export interface NOLInput {
  taxableIncomeBeforeNOL: number; // Taxable income before NOL deduction (cents)
  nolCarryforwards: NOLCarryforward[]; // Prior year NOLs (ordered oldest to newest)
  taxYear: number; // Current tax year
  filingStatus: FilingStatus;
}

/**
 * NOL deduction result
 */
export interface NOLResult {
  nolDeduction: number; // Total NOL deduction allowed (cents)
  limitedByEightyPercent: boolean; // Was deduction limited to 80%?
  eightyPercentLimit: number; // 80% limit amount (cents)
  nolsUsed: {
    taxYear: number;
    amountUsed: number; // Amount used from this year's NOL (cents)
    remainingAfter: number; // Remaining after usage (cents)
  }[];
  updatedCarryforwards: NOLCarryforward[]; // Updated NOL carryforwards for next year
  excessNOL: number; // Total NOL still available for future years (cents)
}

/**
 * Calculate NOL deduction for current tax year
 *
 * @param input NOL deduction input
 * @returns NOL deduction result
 */
export function calculateNOLDeduction(input: NOLInput): NOLResult {
  const {
    taxableIncomeBeforeNOL,
    nolCarryforwards,
    taxYear,
  } = input;

  // No deduction if no taxable income or no NOLs
  if (taxableIncomeBeforeNOL <= 0 || nolCarryforwards.length === 0) {
    return {
      nolDeduction: 0,
      limitedByEightyPercent: false,
      eightyPercentLimit: 0,
      nolsUsed: [],
      updatedCarryforwards: nolCarryforwards,
      excessNOL: nolCarryforwards.reduce((sum, nol) => sum + nol.remainingNOL, 0),
    };
  }

  // 80% limitation (post-TCJA)
  // NOL deduction cannot exceed 80% of taxable income (before NOL)
  const eightyPercentLimit = Math.floor(taxableIncomeBeforeNOL * 0.80);

  // Sort NOLs chronologically (FIFO - First In, First Out)
  const sortedNOLs = [...nolCarryforwards].sort((a, b) => a.taxYear - b.taxYear);

  let remainingDeduction = eightyPercentLimit;
  const nolsUsed: NOLResult['nolsUsed'] = [];
  const updatedCarryforwards: NOLCarryforward[] = [];

  // Use NOLs in chronological order
  for (const nol of sortedNOLs) {
    if (remainingDeduction <= 0) {
      // No more deduction available - carry forward entire NOL
      updatedCarryforwards.push({ ...nol });
      continue;
    }

    // Use as much of this NOL as possible
    const amountToUse = Math.min(nol.remainingNOL, remainingDeduction);
    const remainingAfter = nol.remainingNOL - amountToUse;

    nolsUsed.push({
      taxYear: nol.taxYear,
      amountUsed: amountToUse,
      remainingAfter,
    });

    // Update remaining deduction
    remainingDeduction -= amountToUse;

    // Carry forward any unused portion
    if (remainingAfter > 0) {
      updatedCarryforwards.push({
        ...nol,
        remainingNOL: remainingAfter,
      });
    }
  }

  // Calculate totals
  const totalNOLDeduction = nolsUsed.reduce((sum, usage) => sum + usage.amountUsed, 0);
  const excessNOL = updatedCarryforwards.reduce((sum, nol) => sum + nol.remainingNOL, 0);

  // Check if limited by 80% rule
  const totalAvailableNOL = sortedNOLs.reduce((sum, nol) => sum + nol.remainingNOL, 0);
  const limitedByEightyPercent = totalNOLDeduction < totalAvailableNOL &&
                                  totalNOLDeduction >= eightyPercentLimit;

  return {
    nolDeduction: totalNOLDeduction,
    limitedByEightyPercent,
    eightyPercentLimit,
    nolsUsed,
    updatedCarryforwards,
    excessNOL,
  };
}

/**
 * Format NOL result for display
 */
export function formatNOLResult(result: NOLResult): string {
  const lines: string[] = [];

  lines.push('=== NOL Deduction Summary ===');
  lines.push(`Total NOL Deduction: $${(result.nolDeduction / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  lines.push(`80% Limit: $${(result.eightyPercentLimit / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  lines.push(`Limited by 80% rule: ${result.limitedByEightyPercent ? 'YES' : 'NO'}`);
  lines.push('');

  if (result.nolsUsed.length > 0) {
    lines.push('NOLs Used:');
    for (const usage of result.nolsUsed) {
      lines.push(`  ${usage.taxYear}: $${(usage.amountUsed / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} used, $${(usage.remainingAfter / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining`);
    }
    lines.push('');
  }

  lines.push(`Total NOL Carryforward to Next Year: $${(result.excessNOL / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  return lines.join('\n');
}

/**
 * Validate NOL carryforward data
 */
export function validateNOLCarryforwards(
  nolCarryforwards: NOLCarryforward[],
  currentTaxYear: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const nol of nolCarryforwards) {
    // NOL must be from a prior year
    if (nol.taxYear >= currentTaxYear) {
      errors.push(`NOL from year ${nol.taxYear} cannot be used in year ${currentTaxYear}`);
    }

    // Remaining NOL cannot exceed original NOL
    if (nol.remainingNOL > nol.originalNOL) {
      errors.push(`Remaining NOL ($${nol.remainingNOL / 100}) exceeds original NOL ($${nol.originalNOL / 100}) for year ${nol.taxYear}`);
    }

    // Remaining NOL must be non-negative
    if (nol.remainingNOL < 0) {
      errors.push(`Remaining NOL cannot be negative for year ${nol.taxYear}`);
    }

    // Original NOL must be positive
    if (nol.originalNOL <= 0) {
      errors.push(`Original NOL must be positive for year ${nol.taxYear}`);
    }

    // For post-TCJA NOLs (2018+), carryback should not exist
    // (except for farming losses, which we'll allow)
    if (nol.taxYear >= 2018 && nol.taxYear < currentTaxYear - 50) {
      errors.push(`NOL from year ${nol.taxYear} is suspiciously old (post-TCJA NOLs have unlimited carryforward)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate NOL for current year (to be carried forward)
 *
 * This is a simplified calculation. Full NOL calculation requires
 * detailed analysis of income and deductions.
 *
 * @param totalIncome Total income for the year (cents)
 * @param totalDeductions Total deductions (cents)
 * @param nonBusinessDeductions Non-business deductions that don't create NOL (cents)
 * @returns NOL amount (positive number if loss, 0 if no loss)
 */
export function calculateCurrentYearNOL(
  totalIncome: number,
  totalDeductions: number,
  nonBusinessDeductions: number = 0
): number {
  // NOL = (Total Income) - (Total Deductions - Non-Business Deductions)
  // Simplified: NOL occurs when business deductions exceed total income

  const businessDeductions = totalDeductions - nonBusinessDeductions;
  const nol = businessDeductions - totalIncome;

  // Return positive NOL amount (or 0 if no loss)
  return Math.max(0, nol);
}
