/**
 * Tax Year Configuration
 *
 * Bridges the versioning system with the main calculation engine.
 * Provides year-parameterized access to tax rules and constants.
 *
 * Usage:
 *   const config = getTaxYearConfig(2025);
 *   const stdDed = config.getStandardDeduction('single'); // Returns cents
 */

import { loadAllRules } from './versioning/loader';
import { getConstant, getFederalBrackets, getRegistry } from './versioning/registry';
import type { FilingStatus } from '../types';

// Supported tax years
export const SUPPORTED_TAX_YEARS = [2024, 2025] as const;
export type SupportedTaxYear = (typeof SUPPORTED_TAX_YEARS)[number];

// Default tax year for current calculations
export const DEFAULT_TAX_YEAR: SupportedTaxYear = 2025;

// Track if rules have been loaded
let rulesLoaded = false;

/**
 * Ensure rules are loaded into the registry
 */
export function ensureRulesLoaded(): void {
  if (!rulesLoaded) {
    loadAllRules();
    rulesLoaded = true;
  }
}

/**
 * Check if a tax year is supported
 */
export function isSupportedTaxYear(year: number): year is SupportedTaxYear {
  return SUPPORTED_TAX_YEARS.includes(year as SupportedTaxYear);
}

/**
 * Get the closest supported tax year (for fallback)
 */
export function getClosestSupportedYear(year: number): SupportedTaxYear {
  if (isSupportedTaxYear(year)) {
    return year;
  }
  // Find closest year
  const sorted = [...SUPPORTED_TAX_YEARS].sort((a, b) => Math.abs(a - year) - Math.abs(b - year));
  // sorted[0] is guaranteed to exist since SUPPORTED_TAX_YEARS is non-empty
  return sorted[0] as SupportedTaxYear;
}

/**
 * Filing status key mapping for registry lookups
 */
const FILING_STATUS_KEY_MAP: Record<FilingStatus, string> = {
  single: 'single',
  marriedJointly: 'married_jointly',
  marriedSeparately: 'married_separately',
  headOfHousehold: 'head_of_household',
};

/**
 * Tax bracket structure (matches existing engine format)
 */
export interface TaxBracket {
  min: number; // In cents
  max: number; // In cents (Infinity for top bracket)
  rate: number; // Decimal (e.g., 0.22 for 22%)
}

/**
 * Tax year configuration interface
 */
export interface TaxYearConfig {
  taxYear: number;
  isSupported: boolean;

  // Standard deduction
  getStandardDeduction(filingStatus: FilingStatus): number;

  // Tax brackets
  getTaxBrackets(filingStatus: FilingStatus): TaxBracket[];

  // Credits
  getChildTaxCreditAmount(): number;
  getEITCMax(numChildren: number): number;

  // Phaseouts
  getCTCPhaseoutStart(filingStatus: FilingStatus): number;

  // Additional elderly/blind deduction
  getAdditionalDeduction(filingStatus: FilingStatus, isOver65: boolean, isBlind: boolean): number;
}

/**
 * Fallback values for 2025 (used when registry not loaded or missing values)
 */
const FALLBACK_2025 = {
  standardDeduction: {
    single: 1550000, // $15,500
    marriedJointly: 3100000, // $31,000
    marriedSeparately: 1550000, // $15,500
    headOfHousehold: 2325000, // $23,250
  },
  brackets: {
    single: [
      { min: 0, max: 1180000, rate: 0.1 },
      { min: 1180000, max: 4780000, rate: 0.12 },
      { min: 4780000, max: 10025000, rate: 0.22 },
      { min: 10025000, max: 19175000, rate: 0.24 },
      { min: 19175000, max: 24320000, rate: 0.32 },
      { min: 24320000, max: 60990000, rate: 0.35 },
      { min: 60990000, max: Infinity, rate: 0.37 },
    ],
    marriedJointly: [
      { min: 0, max: 2360000, rate: 0.1 },
      { min: 2360000, max: 9600000, rate: 0.12 },
      { min: 9600000, max: 20050000, rate: 0.22 },
      { min: 20050000, max: 38350000, rate: 0.24 },
      { min: 38350000, max: 48640000, rate: 0.32 },
      { min: 48640000, max: 73130000, rate: 0.35 },
      { min: 73130000, max: Infinity, rate: 0.37 },
    ],
    marriedSeparately: [
      { min: 0, max: 1180000, rate: 0.1 },
      { min: 1180000, max: 4800000, rate: 0.12 },
      { min: 4800000, max: 10025000, rate: 0.22 },
      { min: 10025000, max: 19175000, rate: 0.24 },
      { min: 19175000, max: 24320000, rate: 0.32 },
      { min: 24320000, max: 36565000, rate: 0.35 },
      { min: 36565000, max: Infinity, rate: 0.37 },
    ],
    headOfHousehold: [
      { min: 0, max: 1680000, rate: 0.1 },
      { min: 1680000, max: 6400000, rate: 0.12 },
      { min: 6400000, max: 10250000, rate: 0.22 },
      { min: 10250000, max: 19175000, rate: 0.24 },
      { min: 19175000, max: 24320000, rate: 0.32 },
      { min: 24320000, max: 60990000, rate: 0.35 },
      { min: 60990000, max: Infinity, rate: 0.37 },
    ],
  },
  ctcAmount: 200000, // $2,000
  eitcMax: {
    0: 63200, // $632
    1: 421800, // $4,218
    2: 697200, // $6,972
    3: 781200, // $7,812
  },
  ctcPhaseout: {
    single: 20000000, // $200,000
    marriedJointly: 40000000, // $400,000
    marriedSeparately: 20000000,
    headOfHousehold: 20000000,
  },
  additionalDeduction: {
    marriedOrSurviving: 160000, // $1,600
    single: 200000, // $2,000
  },
};

/**
 * Create a TaxYearConfig for a specific year
 */
function createTaxYearConfig(taxYear: number): TaxYearConfig {
  ensureRulesLoaded();

  const isSupported = isSupportedTaxYear(taxYear);
  const effectiveYear = isSupported ? taxYear : getClosestSupportedYear(taxYear);

  return {
    taxYear: effectiveYear,
    isSupported,

    getStandardDeduction(filingStatus: FilingStatus): number {
      const key = FILING_STATUS_KEY_MAP[filingStatus];
      const value = getConstant(effectiveYear, `standard_deduction.${key}`);
      if (value !== null) {
        return value;
      }
      // Fallback
      return FALLBACK_2025.standardDeduction[filingStatus];
    },

    getTaxBrackets(filingStatus: FilingStatus): TaxBracket[] {
      const key = FILING_STATUS_KEY_MAP[filingStatus];
      const versionedBracket = getFederalBrackets(effectiveYear, key);
      if (versionedBracket) {
        return versionedBracket.brackets;
      }
      // Fallback
      return FALLBACK_2025.brackets[filingStatus];
    },

    getChildTaxCreditAmount(): number {
      const value = getConstant(effectiveYear, 'ctc.amount_per_child');
      return value ?? FALLBACK_2025.ctcAmount;
    },

    getEITCMax(numChildren: number): number {
      const clampedChildren = Math.min(Math.max(numChildren, 0), 3);
      const value = getConstant(effectiveYear, `eitc.max_${clampedChildren}_children`);
      return value ?? FALLBACK_2025.eitcMax[clampedChildren as keyof typeof FALLBACK_2025.eitcMax];
    },

    getCTCPhaseoutStart(filingStatus: FilingStatus): number {
      // CTC phaseout is $200k single, $400k joint
      return FALLBACK_2025.ctcPhaseout[filingStatus];
    },

    getAdditionalDeduction(
      filingStatus: FilingStatus,
      isOver65: boolean,
      isBlind: boolean
    ): number {
      if (!isOver65 && !isBlind) return 0;

      const isMarriedOrSurviving =
        filingStatus === 'marriedJointly' || filingStatus === 'marriedSeparately';
      const baseAmount = isMarriedOrSurviving
        ? FALLBACK_2025.additionalDeduction.marriedOrSurviving
        : FALLBACK_2025.additionalDeduction.single;

      let count = 0;
      if (isOver65) count++;
      if (isBlind) count++;

      return baseAmount * count;
    },
  };
}

// Cache for tax year configs
const configCache = new Map<number, TaxYearConfig>();

/**
 * Get tax year configuration (cached)
 */
export function getTaxYearConfig(taxYear: number = DEFAULT_TAX_YEAR): TaxYearConfig {
  if (!configCache.has(taxYear)) {
    configCache.set(taxYear, createTaxYearConfig(taxYear));
  }
  return configCache.get(taxYear)!;
}

/**
 * Clear config cache (for testing)
 */
export function clearConfigCache(): void {
  configCache.clear();
}

/**
 * Get available tax years from the registry
 */
export function getAvailableTaxYears(): number[] {
  ensureRulesLoaded();
  const registry = getRegistry();
  const years = new Set<number>();

  // Check constants
  for (const year in registry.constants) {
    years.add(parseInt(year, 10));
  }

  // Check brackets
  for (const year in registry.brackets.federal) {
    years.add(parseInt(year, 10));
  }

  return Array.from(years).sort((a, b) => b - a); // Most recent first
}
