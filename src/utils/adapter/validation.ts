/**
 * Runtime validation for tax calculation inputs
 * Uses Zod for schema validation with detailed error messages
 */
import { z } from 'zod';
import type { FederalInput2025, FederalResult2025, FilingStatus } from '../../engine/types';
import type { StateTaxInput } from '../../engine/types/stateTax';

/**
 * Runtime validation error class for type-safe error handling
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Zod schema for filing status
const FilingStatusSchema = z.enum([
  'single',
  'marriedJointly',
  'marriedSeparately',
  'headOfHousehold',
]);

// Helper to validate a value is a valid number
const FiniteNumberSchema = z.number().finite();

// Helper to validate non-negative numbers
const NonNegativeNumberSchema = z.number().finite().nonnegative();

// Zod schema for PersonIncome
const PersonIncomeSchema = z.object({
  wages: NonNegativeNumberSchema,
  selfEmploymentIncome: NonNegativeNumberSchema,
  interestIncome: NonNegativeNumberSchema,
  dividendIncome: NonNegativeNumberSchema,
  capitalGains: NonNegativeNumberSchema,
  k1Income: NonNegativeNumberSchema,
  retirementDistributions: NonNegativeNumberSchema,
  socialSecurityBenefits: NonNegativeNumberSchema,
  otherIncome: NonNegativeNumberSchema,
});

// Zod schema for FederalInput2025
const FederalInputSchema = z.object({
  filingStatus: FilingStatusSchema,
  age: z.number().int().min(0).max(120),
  isBlind: z.boolean().optional(),
  dependents: z.number().int().nonnegative(),

  income: PersonIncomeSchema,

  deductions: z.object({
    useStandardDeduction: z.boolean(),
    itemizedTotal: NonNegativeNumberSchema.optional(),
    mortgageInterest: NonNegativeNumberSchema.optional(),
    stateLocalTaxes: NonNegativeNumberSchema.optional(),
    charitableContributions: NonNegativeNumberSchema.optional(),
    medicalExpenses: NonNegativeNumberSchema.optional(),
    otherItemized: NonNegativeNumberSchema.optional(),
  }),

  payments: z.object({
    federalWithheld: NonNegativeNumberSchema,
    estimatedPayments: NonNegativeNumberSchema.optional(),
    priorYearOverpayment: NonNegativeNumberSchema.optional(),
  }),

  businessDetails: z.object({
    grossReceipts: NonNegativeNumberSchema.optional(),
    costOfGoodsSold: NonNegativeNumberSchema.optional(),
    businessExpenses: NonNegativeNumberSchema.optional(),
    advertisingExpenses: NonNegativeNumberSchema.optional(),
    businessInsurance: NonNegativeNumberSchema.optional(),
    businessInterest: NonNegativeNumberSchema.optional(),
    legalFees: NonNegativeNumberSchema.optional(),
    officeExpenses: NonNegativeNumberSchema.optional(),
    rentExpense: NonNegativeNumberSchema.optional(),
    repairsMaintenance: NonNegativeNumberSchema.optional(),
    suppliesExpenses: NonNegativeNumberSchema.optional(),
    travelExpenses: NonNegativeNumberSchema.optional(),
    utilitiesExpenses: NonNegativeNumberSchema.optional(),
    wagesExpenses: NonNegativeNumberSchema.optional(),
    otherBusinessExpenses: NonNegativeNumberSchema.optional(),
  }).optional(),

  credits: z.object({
    childTaxCredit: NonNegativeNumberSchema.optional(),
    otherCredits: NonNegativeNumberSchema.optional(),
  }).optional(),

  retirementContributions: z.object({
    traditionalIRA: NonNegativeNumberSchema.optional(),
    rothIRA: NonNegativeNumberSchema.optional(),
    sep: NonNegativeNumberSchema.optional(),
    simpleIRA: NonNegativeNumberSchema.optional(),
  }).optional(),
});

// Zod schema for FederalResult2025
const FederalResultSchema = z.object({
  adjustedGrossIncome: FiniteNumberSchema,
  taxableIncome: NonNegativeNumberSchema,
  regularTax: NonNegativeNumberSchema,
  selfEmploymentTax: NonNegativeNumberSchema,
  netInvestmentIncomeTax: NonNegativeNumberSchema,
  additionalMedicareTax: NonNegativeNumberSchema,
  totalTaxBeforeCredits: NonNegativeNumberSchema,
  standardDeduction: NonNegativeNumberSchema,
  itemizedDeduction: NonNegativeNumberSchema.optional(),
  actualDeduction: NonNegativeNumberSchema,

  credits: z.object({
    childTaxCredit: NonNegativeNumberSchema.optional(),
    additionalChildTaxCredit: NonNegativeNumberSchema.optional(),
    earnedIncomeCredit: NonNegativeNumberSchema.optional(),
    eitc: NonNegativeNumberSchema.optional(),
    educationCredits: NonNegativeNumberSchema.optional(),
    retirementSavingsCredit: NonNegativeNumberSchema.optional(),
    childDependentCareCredit: NonNegativeNumberSchema.optional(),
    otherCredits: NonNegativeNumberSchema.optional(),
  }),

  totalNonRefundableCredits: NonNegativeNumberSchema,
  totalRefundableCredits: NonNegativeNumberSchema,
  totalCredits: NonNegativeNumberSchema,
  totalTax: NonNegativeNumberSchema,
  effectiveRate: FiniteNumberSchema,
  marginalRate: FiniteNumberSchema,

  notes: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

// Zod schema for StateTaxInput
const StateTaxInputSchema = z.object({
  stateCode: z.string().length(2),
  filingStatus: FilingStatusSchema,
  federalAGI: FiniteNumberSchema,
  wages: NonNegativeNumberSchema.optional(),
  interestIncome: NonNegativeNumberSchema.optional(),
  dividendIncome: NonNegativeNumberSchema.optional(),
  capitalGains: NonNegativeNumberSchema.optional(),
  retirementDistributions: NonNegativeNumberSchema.optional(),
  socialSecurityBenefits: NonNegativeNumberSchema.optional(),
  businessIncome: NonNegativeNumberSchema.optional(),
  k1Income: NonNegativeNumberSchema.optional(),
  otherIncome: NonNegativeNumberSchema.optional(),

  dependents: z.number().int().nonnegative().optional(),
  age: z.number().int().min(0).max(120).optional(),

  stateWithholding: NonNegativeNumberSchema.optional(),
  county: z.string().optional(),
  city: z.string().optional(),

  federalItemizedDeductions: NonNegativeNumberSchema.optional(),
  federalResult: FederalResultSchema.optional(),
});

/**
 * Validate filing status
 */
export function validateFilingStatus(status: unknown): asserts status is FilingStatus {
  try {
    FilingStatusSchema.parse(status);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid filing status: ${status}. Must be one of: single, marriedJointly, marriedSeparately, headOfHousehold`,
        'filingStatus',
        status
      );
    }
    throw error;
  }
}

/**
 * Validate that a value is a valid number (not NaN, not Infinity)
 */
export function validateNumber(value: unknown, fieldName: string): asserts value is number {
  try {
    FiniteNumberSchema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `${fieldName} must be a finite number, got ${typeof value}: ${value}`,
        fieldName,
        value
      );
    }
    throw error;
  }
}

/**
 * Validate that a value is non-negative
 */
export function validateNonNegative(value: unknown, fieldName: string): asserts value is number {
  try {
    NonNegativeNumberSchema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `${fieldName} must be a non-negative number, got ${value}`,
        fieldName,
        value
      );
    }
    throw error;
  }
}

/**
 * Validate FederalInput2025 structure
 */
export function validateFederalInput(input: unknown): asserts input is FederalInput2025 {
  try {
    FederalInputSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `Invalid federal input: ${firstError.path.join('.')}: ${firstError.message}`,
        firstError.path.join('.'),
        firstError
      );
    }
    throw error;
  }
}

/**
 * Validate FederalResult2025 structure
 */
export function validateFederalResult(result: unknown): asserts result is FederalResult2025 {
  try {
    FederalResultSchema.parse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `Invalid federal result: ${firstError.path.join('.')}: ${firstError.message}`,
        firstError.path.join('.'),
        firstError
      );
    }
    throw error;
  }
}

/**
 * Validate StateTaxInput structure
 */
export function validateStateTaxInput(input: unknown): asserts input is StateTaxInput {
  try {
    StateTaxInputSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `Invalid state tax input: ${firstError.path.join('.')}: ${firstError.message}`,
        firstError.path.join('.'),
        firstError
      );
    }
    throw error;
  }
}
