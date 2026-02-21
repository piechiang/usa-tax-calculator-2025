/**
 * Unified state tax calculation interfaces
 *
 * This file defines the contract that all state tax engines must implement,
 * ensuring consistency across all 50 states + DC.
 */

import type { FilingStatus } from '../types';
import type { FederalResult2025 } from '../types';

/**
 * Standard state tax result structure
 * All state calculators must return this format
 */
export interface StateResult {
  // Core amounts (in cents)
  stateAGI: number; // State-specific AGI (may differ from federal)
  stateTaxableIncome: number; // State taxable income after deductions
  stateTax: number; // State income tax
  localTax: number; // Local/county/city tax
  totalStateLiability: number; // Total state + local tax

  // State-specific deductions
  stateDeduction: number; // Standard or itemized deduction
  stateExemptions?: number; // Personal/dependent exemptions (if applicable)

  // State-specific credits
  stateCredits: StateCredits;

  // Payments and balance
  stateWithheld: number; // State withholding
  stateEstPayments: number; // Estimated payments
  stateRefundOrOwe: number; // Refund (positive) or amount owed (negative)

  // Metadata
  state: string; // Two-letter state code
  county?: string; // County name (if applicable)
  city?: string; // City name (if applicable)
  taxYear: number; // Tax year

  // Additional details for reporting
  calculationNotes?: string[]; // Special notes or warnings
  formReferences?: string[]; // State forms used (e.g., "Form 540", "Schedule CA")
}

/**
 * State tax credits (common across states)
 */
export interface StateCredits {
  earned_income?: number; // State EITC (often % of federal)
  child_dependent?: number; // Child/dependent care credit
  education?: number; // Education credits
  renters?: number; // Renter's credit
  property_tax?: number; // Property tax credit
  other_credits?: number; // Other state-specific credits

  // Total credits breakdown
  nonRefundableCredits: number;
  refundableCredits: number;
}

/**
 * Input for state tax calculation
 * Extends base taxpayer info with state-specific fields
 */
export interface StateTaxInput {
  // Federal results (used as starting point)
  federalResult: FederalResult2025;

  // Location
  state: string; // Two-letter state code (required)
  county?: string; // County name
  city?: string; // City name

  // Filing status (may differ from federal in some states)
  filingStatus: FilingStatus;

  // State-specific income adjustments
  stateAdditions?: {
    federalTaxRefund?: number; // Federal tax refund (taxable in some states)
    municipalBondInterest?: number; // Out-of-state muni bond interest
    otherAdditions?: number;
  };

  stateSubtractions?: {
    socialSecurityBenefits?: number; // SS benefits (exempt in some states)
    retirementIncome?: number; // Retirement income exemption
    militaryPay?: number; // Military pay exemption
    otherSubtractions?: number;
  };

  // State-specific deductions
  stateItemized?: {
    medicalExpenses?: number;
    propertyTaxes?: number; // State property tax (no SALT cap)
    mortgageInterest?: number;
    charitableContributions?: number;
    other?: number;
  };

  // Dependents (may have different rules than federal)
  stateDependents?: number;
  dependents?: number;

  // Payments
  stateWithheld: number;
  stateEstPayments?: number;

  // State-specific fields (extensible)
  itemizedDeductions?: number;

  // State-specific fields (extensible)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateSpecific?: Record<string, any>;
}

/**
 * State tax configuration
 * Metadata about each state's tax system
 */
export interface StateConfig {
  code: string; // Two-letter code (e.g., "CA", "NY")
  name: string; // Full name
  hasTax: boolean; // Whether state has income tax
  hasLocalTax: boolean; // Whether there are local taxes

  // Tax structure
  taxType: 'flat' | 'graduated' | 'none';

  // Data sources
  authoritativeSource: string; // URL to state tax authority
  lastUpdated: string; // When rules were last updated (ISO date)
  taxYear: number; // Tax year these rules apply to

  // Special characteristics
  hasStateEITC: boolean; // State EITC as % of federal
  stateEITCPercent?: number; // Percentage (e.g., 0.30 for 30%)

  hasStandardDeduction: boolean;
  hasPersonalExemption: boolean;

  // Implementation status
  implemented: boolean; // Whether engine is implemented
  notes?: string; // Implementation notes or limitations
}

/**
 * State tax calculator function signature
 * All state calculators must implement this interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StateCalculator = (input: any) => StateResult;

/**
 * State calculator registry
 * Maps state codes to their calculator functions
 */
export interface StateRegistry {
  [stateCode: string]: {
    config: StateConfig;
    calculator: StateCalculator;
  };
}
