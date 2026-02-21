/**
 * Common Type Definitions
 * Shared interfaces used across multiple components
 */

import type { UISpouseInfo, UIPersonalInfo } from '../utils/engineAdapter';
import type { FederalResult2025 } from '../engine/types';
import type { StateResult } from '../engine/types/stateTax';

/**
 * Standard tax calculation result interface
 * Used by multiple UI components for displaying tax results
 */
export interface TaxResult {
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number; // Generic state tax (replaces marylandTax)
  localTax: number;
  totalTax: number;
  totalPayments: number;
  balance: number;
  effectiveRate: number;
  afterTaxIncome: number;

  // Deduction details
  standardDeduction: number;
  itemizedDeduction: number;
  deductionType?: 'standard' | 'itemized';

  // Tax rates
  marginalRate: number; // Marginal tax rate (bracket rate)

  // Credits breakdown (legacy individual fields)
  childTaxCredit?: number;
  earnedIncomeCredit?: number;
  educationCredits?: number;

  // Credits object (detailed breakdown from engine)
  credits?: {
    ctc?: number; // Child Tax Credit
    aotc?: number; // American Opportunity Tax Credit
    llc?: number; // Lifetime Learning Credit
    eitc?: number; // Earned Income Tax Credit
    ftc?: number; // Foreign Tax Credit
    adoptionCreditNonRefundable?: number; // Adoption Credit (non-refundable)
    adoptionCreditRefundable?: number; // Adoption Credit (refundable)
    ptc?: number; // Premium Tax Credit
    ptcRepayment?: number; // Excess APTC repayment
    otherNonRefundable?: number;
    otherRefundable?: number;
  };

  // Additional taxes (legacy individual fields)
  selfEmploymentTax?: number;
  netInvestmentIncomeTax?: number;
  additionalMedicareTax?: number;

  // Additional taxes object (detailed breakdown from engine)
  additionalTaxes?: {
    seTax?: number; // Self-employment tax
    niit?: number; // Net Investment Income Tax
    medicareSurtax?: number; // Additional Medicare Tax
    amt?: number; // Alternative Minimum Tax
  };

  // Legacy field for backward compatibility
  marylandTax: number; // @deprecated Use stateTax instead
}

/**
 * Spouse information for joint filing
 * Extends UISpouseInfo with required fields
 */
export interface SpouseInfo extends UISpouseInfo {
  firstName: string;
  lastName: string;
  ssn: string;
  wages: string;
  interestIncome: string;
  dividends: string;
  capitalGains: string;
  businessIncome: string;
  otherIncome: string;
  federalWithholding: string;
  stateWithholding: string;
}

/**
 * Personal information for primary taxpayer
 * State-agnostic design - works with any US state via STATE_CONFIGS
 */
export interface PersonalInfo extends Omit<UIPersonalInfo, 'dependents'> {
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
  firstName: string;
  lastName: string;
  ssn: string;
  age: number;
  filingStatus: string;
  address: string;
  dependents: number;

  // State and locality information (integrated with STATE_CONFIGS)
  state: string; // State code (e.g., 'MD', 'NY', 'CA') - REQUIRED
  county?: string; // County name (for states with county-based local tax like MD)
  city?: string; // City name (for states with city-based local tax like NY)

  // Deprecated field - kept for backward compatibility only
  // Use 'state' field instead. Auto-synced: isMaryland = (state === 'MD')
  /** @deprecated Use 'state' field instead */
  isMaryland?: boolean;
}

/**
 * Translation function type
 */
export type TranslationFunction = (key: string) => string;

/**
 * Language code type
 */
export type LanguageCode = 'en' | 'zh' | 'es';

/**
 * Language information
 */
export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

// ============================================================================
// Shared Data Structures (to eliminate 'any' types)
// ============================================================================

/**
 * Tax Data Snapshot
 * Represents a complete snapshot of user's tax data at a point in time
 */
export interface TaxDataSnapshot {
  timestamp: number;
  label: string;
  personalInfo: {
    filingStatus: string;
    dependents: number;
    age?: number;
    isBlind?: boolean;
    ssn?: string;
  };
  income: {
    wages: number;
    interest: number;
    dividends: number;
    capitalGains: number;
    businessIncome: number;
    otherIncome: number;
  };
  deductions: {
    type: 'standard' | 'itemized';
    amount: number;
    breakdown?: Record<string, number>;
    // Extended fields for accuracy checking
    useStandardDeduction?: boolean;
    mortgageInterestAmount?: number;
    saltAmount?: number;
    charitableAmount?: number;
    medicalExpenses?: number;
  };
  credits: {
    childTaxCredit: number;
    earnedIncomeCredit: number;
    educationCredits: number;
    otherCredits: number;
  };
  payments: {
    federalWithheld: number;
    stateWithheld: number;
    estimatedPayments: number;
  };
  calculatedResults?: {
    federalTax: number;
    stateTax: number;
    totalTax: number;
    refundOrOwe: number;
  };
  // Extended fields for advanced accuracy checking
  incomeSourcesEach?: Array<{
    type?: string;
    amount: number;
    description?: string;
  }>;
  hasRetirementContributions?: boolean;
  qualifyingChildren?: Array<{
    name?: string;
    dateOfBirth: string;
    relationship?: string;
  }>;
  claimedChildTaxCredit?: boolean;
  educationExpenses?: number;
  claimedEducationCredits?: boolean;
  hasMultiStateIncome?: boolean;
  optimizedStateTaxes?: boolean;
  madeEstimatedPayments?: boolean;
}

/**
 * Audit Data
 * Data structure for audit trail and review
 */
export interface AuditData {
  id: string;
  userId?: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'calculate' | 'export' | 'import';
  entityType: 'taxReturn' | 'snapshot' | 'settings' | 'document';
  entityId?: string;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
}

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
}

/**
 * Reminder Item
 * Tax deadline and reminder data structure
 */
export interface ReminderItem {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  category: 'filing' | 'payment' | 'estimated' | 'document' | 'review' | 'other';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedDate?: string;
  recurringPattern?: 'yearly' | 'quarterly' | 'monthly' | 'none';
  notifications?: ReminderNotification[];
}

export interface ReminderNotification {
  type: 'email' | 'push' | 'sms';
  scheduledFor: string; // ISO date string
  sent: boolean;
  sentAt?: string;
}

/**
 * Accuracy Check Result
 * Result from tax accuracy validation
 */
export interface AccuracyCheck {
  id: string;
  category: 'error' | 'warning' | 'suggestion' | 'info';
  title: string;
  description: string;
  impact?: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  actionRequired?: boolean;
  suggestion?: string;
  fieldPath?: string;
  relatedFields?: string[];
}

/**
 * Tax Calculation Input/Output
 * Standardized structure for tax calculations
 */
export interface TaxCalculationInput {
  personalInfo: TaxDataSnapshot['personalInfo'];
  income: TaxDataSnapshot['income'];
  deductions: TaxDataSnapshot['deductions'];
  credits?: TaxDataSnapshot['credits'];
  payments?: TaxDataSnapshot['payments'];
  state?: string;
  county?: string;
  city?: string;
}

export interface TaxCalculationOutput {
  federalResult: FederalResult2025;
  stateResult?: StateResult;
  accuracy?: AccuracyCheck[];
  warnings?: string[];
  timestamp: number;
  // Extended fields for filing optimization
  filingComparison?: {
    joint: { totalTax: number; refundOrOwe: number };
    separate: { totalTax: number; refundOrOwe: number };
  };
  estimatedTaxDue?: number;
  // Convenience properties (computed from federalResult)
  totalTax?: number;
  refund?: number;
}

/**
 * Deduction Comparison
 * Compare standard vs itemized deductions
 */
export interface DeductionComparison {
  standardDeduction: number;
  itemizedDeduction: number;
  recommended: 'standard' | 'itemized';
  savings: number;
  breakdown?: DeductionBreakdownItem[];
}

export interface DeductionBreakdownItem {
  category: string;
  amount: number;
  limit?: number;
  percentage?: number;
}

/**
 * Tax Scenario
 * "What-if" scenario analysis
 */
export interface TaxScenario {
  id: string;
  name: string;
  description: string;
  baselineSnapshot: TaxDataSnapshot;
  changes: TaxScenarioChange[];
  calculatedDifference?: {
    taxOwed: number;
    refund: number;
    effectiveTaxRate: number;
  };
}

export interface TaxScenarioChange {
  field: string;
  description: string;
  value: unknown;
}

/**
 * Diagnostic Message
 * Structured diagnostic information from tax engine
 */
export interface DiagnosticMessage {
  code: string;
  severity: 'error' | 'warning' | 'info';
  category: 'INPUT' | 'CALC' | 'CREDIT' | 'FORM';
  message: string;
  field?: string;
  context?: Record<string, unknown>;
}

/**
 * Review Context
 * Context data for tax review components
 */
export interface ReviewContext {
  snapshot: TaxDataSnapshot;
  calculations: TaxCalculationOutput;
  accuracyChecks: AccuracyCheck[];
  deductionComparison?: DeductionComparison;
  scenarios?: TaxScenario[];
  auditTrail?: AuditData[];
}
