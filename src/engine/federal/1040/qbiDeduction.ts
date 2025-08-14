/**
 * Qualified Business Income (QBI) Deduction Calculation (Form 8995/8995-A)
 * Section 199A Deduction for 2025
 */

import { FederalInput } from './types';
import { CALCULATION_CONSTANTS } from './constants2025';

/**
 * Calculate Section 199A QBI Deduction
 * Source: IRC §199A, Form 8995/8995-A
 */
export function calculateQualifiedBusinessIncome(
  input: FederalInput,
  adjustedGrossIncome: number,
  totalDeductions: number
): number {
  const taxableIncome = Math.max(0, adjustedGrossIncome - totalDeductions);
  
  if (taxableIncome === 0) {
    return 0;
  }
  
  // Collect QBI from various sources
  let totalQBI = 0;
  let totalWages = 0;
  let totalUBIA = 0; // Unadjusted basis in qualified property
  
  // Schedule C QBI
  const scheduleCQBI = input.income.scheduleC.reduce((sum, biz) => {
    // Only positive business income counts toward QBI
    return sum + Math.max(0, biz.netProfit);
  }, 0);
  totalQBI += scheduleCQBI;
  
  // Schedule E QBI (from partnerships, S corps, trusts)
  // Non-passive K-1 income may qualify as QBI
  const k1QBI = Math.max(0, input.income.scheduleE.k1NonPassiveIncome);
  totalQBI += k1QBI;
  
  if (totalQBI <= 0) {
    return 0; // No QBI, no deduction
  }
  
  // Determine which form to use based on taxable income
  const isMarriedJoint = input.filingStatus === 'mfj' || input.filingStatus === 'qss';
  const simpleThreshold = isMarriedJoint 
    ? CALCULATION_CONSTANTS.QBI_PHASEOUT_THRESHOLD_MFJ 
    : CALCULATION_CONSTANTS.QBI_PHASEOUT_THRESHOLD_SINGLE;
  
  if (taxableIncome <= simpleThreshold) {
    // Use Form 8995 (simple method)
    return calculateSimpleQBIDeduction(totalQBI, taxableIncome);
  } else {
    // Use Form 8995-A (complex method with limitations)
    return calculateComplexQBIDeduction(
      input,
      totalQBI,
      totalWages,
      totalUBIA,
      taxableIncome,
      isMarriedJoint
    );
  }
}

/**
 * Calculate QBI deduction using simple method (Form 8995)
 * For taxpayers below the taxable income threshold
 */
function calculateSimpleQBIDeduction(totalQBI: number, taxableIncome: number): number {
  // 20% of QBI or 20% of taxable income, whichever is less
  const qbiDeduction = Math.min(
    totalQBI * CALCULATION_CONSTANTS.QBI_DEDUCTION_MAX_RATE,
    taxableIncome * CALCULATION_CONSTANTS.QBI_DEDUCTION_MAX_RATE
  );
  
  return Math.round(qbiDeduction);
}

/**
 * Calculate QBI deduction using complex method (Form 8995-A)
 * For taxpayers above the taxable income threshold with limitations
 */
function calculateComplexQBIDeduction(
  input: FederalInput,
  totalQBI: number,
  totalWages: number,
  totalUBIA: number,
  taxableIncome: number,
  isMarriedJoint: boolean
): number {
  const fullThreshold = isMarriedJoint 
    ? CALCULATION_CONSTANTS.QBI_PHASEOUT_THRESHOLD_MFJ + CALCULATION_CONSTANTS.QBI_PHASEOUT_RANGE
    : CALCULATION_CONSTANTS.QBI_PHASEOUT_THRESHOLD_SINGLE + CALCULATION_CONSTANTS.QBI_PHASEOUT_RANGE;
  
  const simpleThreshold = isMarriedJoint 
    ? CALCULATION_CONSTANTS.QBI_PHASEOUT_THRESHOLD_MFJ
    : CALCULATION_CONSTANTS.QBI_PHASEOUT_THRESHOLD_SINGLE;
  
  // Determine if we're in phaseout range or fully subject to limitations
  let phaseoutRatio = 1.0; // 1.0 = fully subject to limitations
  
  if (taxableIncome < fullThreshold) {
    // In phaseout range
    const excessIncome = taxableIncome - simpleThreshold;
    phaseoutRatio = excessIncome / CALCULATION_CONSTANTS.QBI_PHASEOUT_RANGE;
  }
  
  // Calculate limitation based on W-2 wages and UBIA
  const wageLimit = totalWages * 0.50; // 50% of W-2 wages
  const wagePlusUBIALimit = (totalWages * 0.25) + (totalUBIA * 0.025); // 25% of wages + 2.5% of UBIA
  const wageUBIALimit = Math.max(wageLimit, wagePlusUBIALimit);
  
  // Apply phaseout to limitations
  let applicableLimit: number;
  if (phaseoutRatio >= 1.0) {
    // Fully subject to limitations
    applicableLimit = Math.min(totalQBI * 0.20, wageUBIALimit);
  } else {
    // Blend between unrestricted and restricted amounts
    const unrestrictedAmount = totalQBI * 0.20;
    const restrictedAmount = Math.min(totalQBI * 0.20, wageUBIALimit);
    applicableLimit = unrestrictedAmount - (phaseoutRatio * (unrestrictedAmount - restrictedAmount));
  }
  
  // Check for Specified Service Trade or Business (SSTB)
  const isSSTB = checkIfSSTB(input);
  if (isSSTB && taxableIncome > simpleThreshold) {
    // SSTB income may be partially or fully excluded
    const sstbPhaseoutRatio = Math.min(1.0, phaseoutRatio);
    const includibleSSTBIncome = totalQBI * (1 - sstbPhaseoutRatio);
    applicableLimit = Math.min(applicableLimit, includibleSSTBIncome * 0.20);
  }
  
  // Final limitation: 20% of taxable income less net capital gain
  const netCapitalGain = Math.max(0, input.income.capitalGains.longTerm);
  const taxableIncomeLimit = Math.max(0, taxableIncome - netCapitalGain) * 0.20;
  
  const qbiDeduction = Math.min(applicableLimit, taxableIncomeLimit);
  
  return Math.round(Math.max(0, qbiDeduction));
}

/**
 * Check if the business is a Specified Service Trade or Business (SSTB)
 * This is a simplified check - actual determination requires detailed business analysis
 */
function checkIfSSTB(input: FederalInput): boolean {
  // SSTB includes: health, law, accounting, actuarial science, performing arts,
  // consulting, athletics, financial services, brokerage services, 
  // investing and investment management, trading, dealing in securities,
  // partnership interests, or commodities
  
  // This is a placeholder - actual implementation would require
  // business type classification from Schedule C or K-1 forms
  
  // For now, assume most Schedule C businesses are not SSTB
  // unless specifically identified
  
  return false; // Placeholder implementation
}

/**
 * Calculate aggregated QBI items for multiple businesses
 * Used when taxpayer has multiple qualifying businesses
 */
export function aggregateQBIItems(businesses: Array<{
  qbi: number;
  wages: number;
  ubia: number;
  isSSTB: boolean;
}>): { totalQBI: number; totalWages: number; totalUBIA: number; hasSSTB: boolean } {
  let totalQBI = 0;
  let totalWages = 0;
  let totalUBIA = 0;
  let hasSSTB = false;
  
  for (const business of businesses) {
    totalQBI += business.qbi;
    totalWages += business.wages;
    totalUBIA += business.ubia;
    if (business.isSSTB) hasSSTB = true;
  }
  
  return { totalQBI, totalWages, totalUBIA, hasSSTB };
}

/**
 * Calculate QBI deduction from Real Estate Investment Trusts (REITs)
 */
export function calculateREITQBIDeduction(
  reitDividends: number,
  taxableIncome: number
): number {
  if (reitDividends <= 0) {
    return 0;
  }
  
  // 20% of REIT dividends, limited by 20% of taxable income
  const reitDeduction = Math.min(
    reitDividends * 0.20,
    taxableIncome * 0.20
  );
  
  return Math.round(reitDeduction);
}

/**
 * Calculate QBI deduction from Publicly Traded Partnership (PTP) income
 */
export function calculatePTPQBIDeduction(
  ptpIncome: number,
  taxableIncome: number
): number {
  if (ptpIncome <= 0) {
    return 0;
  }
  
  // 20% of PTP income, limited by 20% of taxable income
  const ptpDeduction = Math.min(
    ptpIncome * 0.20,
    taxableIncome * 0.20
  );
  
  return Math.round(ptpDeduction);
}

/**
 * Estimate W-2 wages for QBI limitation (when not provided)
 * This is a rough estimation method
 */
export function estimateW2Wages(scheduleCSales: number, scheduleCProfit: number): number {
  if (scheduleCSales <= 0 || scheduleCProfit <= 0) {
    return 0;
  }
  
  // Very rough estimation: assume W-2 wages are 20-40% of gross receipts
  // for businesses that have employees
  // This is highly variable and should be provided by the taxpayer
  
  const profitMargin = scheduleCProfit / scheduleCSales;
  
  if (profitMargin > 0.30) {
    // High profit margin businesses often have lower wage ratios
    return scheduleCSales * 0.15;
  } else if (profitMargin > 0.10) {
    // Medium profit margin
    return scheduleCSales * 0.25;
  } else {
    // Low profit margin businesses often have higher wage ratios
    return scheduleCSales * 0.35;
  }
}

/**
 * Calculate carryforward of QBI losses
 * QBI losses from one year can be carried forward to offset future QBI
 */
export function calculateQBILossCarryforward(
  currentYearQBI: number,
  priorYearLossCarryforward: number = 0
): { currentYearDeduction: number; newCarryforward: number } {
  const netQBI = currentYearQBI + priorYearLossCarryforward;
  
  if (netQBI >= 0) {
    // No new carryforward, use net QBI for deduction
    return {
      currentYearDeduction: netQBI,
      newCarryforward: 0,
    };
  } else {
    // Current year QBI is negative, create new carryforward
    return {
      currentYearDeduction: 0,
      newCarryforward: Math.abs(netQBI),
    };
  }
}