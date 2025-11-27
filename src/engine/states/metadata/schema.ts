/**
 * Metadata-Driven State Tax Rule Schema
 *
 * This schema defines a unified, declarative format for state tax rules.
 * States can be configured using YAML/JSON without writing custom TypeScript code.
 *
 * Architecture Benefits:
 * - Uniform data structure across all states
 * - Easy addition of new states (just YAML config + golden tests)
 * - Centralized validation and parsing
 * - Single generic calculator engine
 * - Clear separation of rules from logic
 *
 * @version 1.0.0
 * @date 2025
 */

import type { FilingStatus } from '../../types';

/**
 * Complete state tax configuration for a single tax year
 */
export interface StateTaxConfig {
  /** State metadata */
  metadata: StateMetadata;

  /** Tax calculation structure (flat, progressive, or hybrid) */
  structure: TaxStructure;

  /** Tax brackets (for progressive/hybrid systems) */
  brackets?: BracketSchedule;

  /** Flat tax rate (for flat systems like PA) */
  flatRate?: number;

  /** Standard deduction rules */
  standardDeduction?: DeductionConfig;

  /** Personal exemptions */
  personalExemption?: ExemptionConfig;

  /** Itemized deduction rules (if different from federal) */
  itemizedDeductions?: ItemizedDeductionConfig;

  /** AGI modifications (additions/subtractions from federal AGI) */
  agiModifications: AGIModificationConfig;

  /** State-specific credits */
  credits?: CreditConfig[];

  /** Local tax configuration (city/county taxes) */
  localTax?: LocalTaxConfig;

  /** Special taxes or surcharges */
  specialTaxes?: SpecialTaxConfig[];

  /** Form references and documentation */
  documentation: DocumentationConfig;
}

/**
 * State identification and version information
 */
export interface StateMetadata {
  /** Two-letter state code (e.g., 'CA', 'NY', 'PA') */
  stateCode: string;

  /** Full state name */
  stateName: string;

  /** Tax year this configuration applies to */
  taxYear: number;

  /** Configuration version (for tracking updates within a tax year) */
  version: string;

  /** Last updated date (ISO 8601 format) */
  lastUpdated: string;

  /** Data sources and authorities */
  sources: string[];

  /** Notes about special characteristics */
  notes?: string[];
}

/**
 * Tax structure type
 */
export type TaxStructure =
  | 'flat'        // Single rate (e.g., PA: 3.07%)
  | 'progressive' // Multiple brackets (e.g., CA: 1%-13.3%)
  | 'hybrid';     // Flat rate with surcharges (e.g., MA: 5% + 4% on high earners)

/**
 * Tax bracket schedule with rates by filing status
 */
export interface BracketSchedule {
  /** Brackets by filing status */
  byFilingStatus: Record<FilingStatus, TaxBracket[]>;

  /** Whether brackets are indexed for inflation */
  inflationIndexed: boolean;

  /** Maximum marginal rate across all brackets */
  topRate: number;
}

/**
 * Single tax bracket definition
 */
export interface TaxBracket {
  /** Income threshold start (in dollars, will be converted to cents) */
  min: number;

  /** Income threshold end (use Infinity for top bracket) */
  max: number;

  /** Tax rate (decimal, e.g., 0.0307 for 3.07%) */
  rate: number;

  /** Optional description */
  description?: string;
}

/**
 * Standard deduction configuration
 */
export interface DeductionConfig {
  /** Deduction amounts by filing status (in dollars) */
  amounts: Record<FilingStatus, number>;

  /** Additional deduction for age 65+ */
  additionalForAge?: number;

  /** Additional deduction for blindness */
  additionalForBlindness?: number;

  /** AGI phase-out configuration (if deduction phases out) */
  phaseOut?: PhaseOutConfig;

  /** Whether standard deduction is available */
  available: boolean;
}

/**
 * Personal exemption configuration
 */
export interface ExemptionConfig {
  /** Exemption amount per person (in dollars) */
  amount: number;

  /** Whether exemption applies to taxpayer */
  taxpayer: boolean;

  /** Whether exemption applies to spouse (for MFJ) */
  spouse: boolean;

  /** Whether exemption applies to dependents */
  dependents: boolean;

  /** AGI phase-out configuration */
  phaseOut?: PhaseOutConfig;

  /** Whether exemptions are available (some states eliminated them) */
  available: boolean;
}

/**
 * AGI phase-out configuration
 */
export interface PhaseOutConfig {
  /** AGI threshold where phase-out begins (by filing status) */
  startThreshold: Record<FilingStatus, number>;

  /** AGI threshold where phase-out completes (by filing status) */
  endThreshold: Record<FilingStatus, number>;

  /** Phase-out rate (e.g., 2% per $2,500 over threshold) */
  rate: number;
}

/**
 * Itemized deduction configuration
 */
export interface ItemizedDeductionConfig {
  /** Whether state allows itemized deductions */
  allowed: boolean;

  /** Whether state requires federal itemization to itemize state */
  requiresFederalItemization: boolean;

  /** State-specific deduction rules */
  deductions: {
    /** State and local tax (SALT) deduction */
    salt?: {
      allowed: boolean;
      limit?: number; // Cap amount (like federal $10k cap)
    };

    /** Mortgage interest deduction */
    mortgageInterest?: {
      allowed: boolean;
      limit?: number;
    };

    /** Charitable contributions */
    charitable?: {
      allowed: boolean;
      agiLimitPercentage?: number;
    };

    /** Medical expenses */
    medical?: {
      allowed: boolean;
      agiThresholdPercentage: number; // e.g., 7.5% of AGI
    };

    /** Other itemized deductions */
    other?: {
      allowed: boolean;
      categories?: string[];
    };
  };

  /** Overall itemized deduction cap or phase-out */
  overallLimit?: {
    type: 'cap' | 'phaseOut';
    amount?: number;
    phaseOut?: PhaseOutConfig;
  };
}

/**
 * AGI modification rules (state additions and subtractions)
 */
export interface AGIModificationConfig {
  /** Items added to federal AGI */
  additions: AGIModificationRule[];

  /** Items subtracted from federal AGI */
  subtractions: AGIModificationRule[];
}

/**
 * Single AGI modification rule
 */
export interface AGIModificationRule {
  /** Unique identifier for this modification */
  id: string;

  /** Human-readable name */
  name: string;

  /** Detailed description */
  description: string;

  /** Category (income type) */
  category:
    | 'retirement'          // Pension, IRA, 401(k), Social Security
    | 'investment'          // Interest, dividends, capital gains
    | 'business'            // Self-employment, partnership income
    | 'compensation'        // Wages, bonuses, unemployment
    | 'deduction'           // Federal tax refund, state tax paid
    | 'other';

  /** Whether modification requires user input */
  requiresInput: boolean;

  /** Input field name (if requiresInput is true) */
  inputField?: string;

  /** Whether this is a full exemption (100% adjustment) */
  fullExemption?: boolean;

  /** Partial exemption percentage (if not full) */
  exemptionPercentage?: number;

  /** Dollar limit on modification */
  limit?: number;

  /** AGI-based phase-out */
  phaseOut?: PhaseOutConfig;

  /** Conditions for applicability */
  conditions?: ModificationCondition[];

  /** Related IRS form or schedule */
  irsForm?: string;

  /** Related state form or schedule */
  stateForm?: string;
}

/**
 * Condition for AGI modification applicability
 */
export interface ModificationCondition {
  type: 'age' | 'filingStatus' | 'income' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string | number;
}

/**
 * State tax credit configuration
 */
export interface CreditConfig {
  /** Unique credit identifier */
  id: string;

  /** Credit name */
  name: string;

  /** Credit description */
  description: string;

  /** Credit type */
  type: 'nonRefundable' | 'refundable' | 'partiallyRefundable';

  /** Credit category */
  category:
    | 'earnedIncome'      // State EITC
    | 'child'             // Child tax credit
    | 'dependent'         // Dependent care
    | 'education'         // College credits
    | 'property'          // Property tax, renter's credit
    | 'lowIncome'         // Tax forgiveness, low-income credits
    | 'other';

  /** Credit calculation method */
  calculation: CreditCalculation;

  /** Eligibility rules */
  eligibility?: EligibilityRule[];

  /** AGI phase-out configuration */
  phaseOut?: PhaseOutConfig;

  /** Maximum credit amount */
  maxCredit?: number;

  /** Related forms */
  forms?: string[];
}

/**
 * Credit calculation configuration
 */
export interface CreditCalculation {
  /** Calculation method type */
  method:
    | 'fixed'                // Fixed dollar amount
    | 'percentage'           // Percentage of expense/income
    | 'tiered'              // Tiered based on AGI/income
    | 'federalPercentage'   // Percentage of federal credit
    | 'table'               // Lookup table
    | 'formula';            // Custom formula

  /** Fixed amount (for 'fixed' method) */
  amount?: number;

  /** Percentage rate (for 'percentage' method) */
  rate?: number;

  /** Base amount calculation (for 'percentage' method) */
  baseAmount?: string; // e.g., "qualifyingExpenses", "earnedIncome", "federalCredit"

  /** Tiers (for 'tiered' method) */
  tiers?: CreditTier[];

  /** Table values (for 'table' method) */
  table?: CreditTable;

  /** Formula expression (for 'formula' method) */
  formula?: string;

  /** Federal credit percentage (for 'federalPercentage' method) */
  federalPercentage?: number;
}

/**
 * Credit tier for tiered calculations
 */
export interface CreditTier {
  /** AGI or income threshold */
  threshold: number;

  /** Credit amount or rate at this tier */
  value: number;

  /** Whether value is fixed amount or percentage */
  valueType: 'amount' | 'rate';
}

/**
 * Credit lookup table
 */
export interface CreditTable {
  /** Table lookup key (e.g., "agi", "numberOfChildren") */
  lookupKey: string;

  /** Table entries */
  entries: CreditTableEntry[];
}

/**
 * Single credit table entry
 */
export interface CreditTableEntry {
  /** Minimum value for lookup key */
  min: number;

  /** Maximum value for lookup key */
  max: number;

  /** Credit amount for this range */
  credit: number;

  /** Additional multiplier (e.g., per child) */
  multiplier?: number;
}

/**
 * Eligibility rule for credits
 */
export interface EligibilityRule {
  /** Rule type */
  type:
    | 'age'
    | 'income'
    | 'filingStatus'
    | 'dependents'
    | 'federalCreditClaimed'
    | 'residency'
    | 'custom';

  /** Comparison operator */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';

  /** Expected value(s) */
  value: string | number | (string | number)[];

  /** Rule description */
  description?: string;
}

/**
 * Local tax configuration (city/county taxes)
 */
export interface LocalTaxConfig {
  /** Whether state has local income taxes */
  hasLocalTax: boolean;

  /** List of localities with income taxes */
  localities?: LocalityTax[];

  /** Default local tax (if uniform across state) */
  defaultRate?: number;
}

/**
 * Individual locality tax configuration
 */
export interface LocalityTax {
  /** Locality name */
  name: string;

  /** Locality type (city, county, etc.) */
  type: 'city' | 'county' | 'district';

  /** Tax structure */
  structure: 'flat' | 'progressive' | 'piggyback';

  /** Flat rate (if applicable) */
  rate?: number;

  /** Progressive brackets (if applicable) */
  brackets?: TaxBracket[];

  /** Piggyback percentage (if applicable) */
  piggybackPercentage?: number; // Percentage of state tax

  /** Whether locality allows credits */
  allowsCredits?: boolean;
}

/**
 * Special taxes and surcharges
 */
export interface SpecialTaxConfig {
  /** Tax identifier */
  id: string;

  /** Tax name */
  name: string;

  /** Tax description */
  description: string;

  /** Tax type */
  type:
    | 'surcharge'     // Additional percentage on high earners
    | 'surtax'        // Flat amount on high earners
    | 'mentalHealth'  // CA Mental Health Services Tax
    | 'millionaire'   // Special tax on very high incomes
    | 'other';

  /** Tax rate or amount */
  rate?: number;

  /** Amount (for surtax) */
  amount?: number;

  /** Income threshold for applicability */
  threshold?: Record<FilingStatus, number>;

  /** Calculation base */
  base:
    | 'taxableIncome'
    | 'agi'
    | 'stateTax'
    | 'federalTax';

  /** Form references */
  forms?: string[];
}

/**
 * Documentation and form references
 */
export interface DocumentationConfig {
  /** Primary tax return form */
  primaryForm: string;

  /** Additional forms and schedules */
  additionalForms?: string[];

  /** Official state tax authority URL */
  authorityUrl: string;

  /** Links to tax forms */
  formUrls?: Record<string, string>;

  /** Links to instructions */
  instructionUrls?: Record<string, string>;

  /** Key calculation notes */
  calculationNotes?: string[];

  /** Common taxpayer scenarios */
  scenarios?: TaxScenario[];
}

/**
 * Example tax scenario for documentation
 */
export interface TaxScenario {
  /** Scenario name */
  name: string;

  /** Scenario description */
  description: string;

  /** Example inputs */
  exampleInputs: Record<string, any>;

  /** Expected outputs */
  expectedOutputs: Record<string, any>;
}

/**
 * Validation result for state tax configuration
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation errors */
  errors: ConfigValidationError[];

  /** Validation warnings */
  warnings: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Path to problematic field */
  path: string;

  /** Expected value or format */
  expected?: string;

  /** Actual value */
  actual?: any;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  /** Warning code */
  code: string;

  /** Warning message */
  message: string;

  /** Path to field */
  path: string;

  /** Suggestion */
  suggestion?: string;
}
