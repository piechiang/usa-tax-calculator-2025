import { z } from 'zod';
import type { TaxPayerInput } from '../types';

/**
 * Zod schema for validating tax input data
 * Ensures data integrity and type safety at runtime
 */

// Filing status enum
const FilingStatusSchema = z.enum(['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold']);

// Person schema (for primary and spouse)
const PersonSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  ssn: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format').optional(),
  isBlind: z.boolean().optional(),
});

// Income schema (all in dollars, will be converted to cents)
const IncomeSchema = z.object({
  wages: z.number().nonnegative('Wages must be non-negative').optional(),
  interest: z.number().nonnegative('Interest must be non-negative').optional(),
  dividends: z.object({
    ordinary: z.number().nonnegative().optional(),
    qualified: z.number().nonnegative().optional(),
  }).optional(),
  capGains: z.number().optional(), // Can be negative (capital losses)
  scheduleCNet: z.number().optional(), // Can be negative (business loss)
  k1: z.object({
    ordinaryBusinessIncome: z.number().optional(),
    passiveIncome: z.number().optional(),
    portfolioIncome: z.number().optional(),
  }).optional(),
  other: z.record(z.number()).optional(),
}).optional();

// Adjustments schema (above-the-line deductions)
const AdjustmentsSchema = z.object({
  studentLoanInterest: z.number().nonnegative().max(2500, 'Student loan interest deduction capped at $2,500').optional(),
  hsaDeduction: z.number().nonnegative().optional(),
  iraDeduction: z.number().nonnegative().optional(),
  businessExpenses: z.number().nonnegative().optional(),
}).optional();

// Itemized deductions schema
const ItemizedSchema = z.object({
  stateLocalTaxes: z.number().nonnegative().optional(),
  mortgageInterest: z.number().nonnegative().optional(),
  charitable: z.number().nonnegative().optional(),
  medical: z.number().nonnegative().optional(),
  other: z.number().nonnegative().optional(),
}).optional();

// Payments schema
const PaymentsSchema = z.object({
  federalWithheld: z.number().nonnegative('Federal withholding must be non-negative').optional(),
  estPayments: z.number().nonnegative().optional(),
  eitcAdvance: z.number().nonnegative().optional(),
}).optional();

// Qualifying child schema (matching QualifyingChild type)
const QualifyingChildSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  relationship: z.enum(['son', 'daughter', 'stepchild', 'foster', 'brother', 'sister', 'stepbrother', 'stepsister', 'descendant']),
  monthsLivedWithTaxpayer: z.number().int().min(0).max(12),
  isStudent: z.boolean().optional(),
  isPermanentlyDisabled: z.boolean().optional(),
  providedOwnSupport: z.boolean().optional(),
});

// Education expense schema
const EducationExpenseSchema = z.object({
  studentName: z.string().min(1),
  institutionName: z.string().min(1),
  tuitionAndFees: z.number().nonnegative(),
  booksAndSupplies: z.number().nonnegative().optional(),
  isEligibleInstitution: z.boolean(),
  academicPeriod: z.string().optional(),
  isFirstFourYears: z.boolean().optional(),
  isHalfTime: z.boolean().optional(),
  hasFelonyConviction: z.boolean().optional(),
});

// Main TaxPayerInput schema
export const TaxPayerInputSchema = z.object({
  filingStatus: FilingStatusSchema,
  primary: PersonSchema.optional(),
  spouse: PersonSchema.optional(),
  dependents: z.number().int().nonnegative().optional(),
  qualifyingChildren: z.array(QualifyingChildSchema).optional(),
  income: IncomeSchema,
  adjustments: AdjustmentsSchema,
  itemized: ItemizedSchema,
  payments: PaymentsSchema,
  educationExpenses: z.array(EducationExpenseSchema).optional(),
}).strict(); // Reject unknown properties

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  data?: TaxPayerInput;
}

/**
 * Validate tax input data
 * @param input Raw input data to validate
 * @returns ValidationResult with success flag and any errors
 */
export function validateTaxInput(input: unknown): ValidationResult {
  const result = TaxPayerInputSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data as TaxPayerInput,
    };
  }

  // Format Zod errors into a readable structure
  const errors = result.error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  return {
    success: false,
    errors,
  };
}

/**
 * Custom validation rules beyond Zod schema
 */
export class TaxInputValidator {
  /**
   * Validate that MFS filers have spouse information
   */
  static validateMarriedSeparately(input: TaxPayerInput): string | null {
    if (input.filingStatus === 'marriedSeparately' && !input.spouse) {
      return 'Married Filing Separately requires spouse information';
    }
    return null;
  }

  /**
   * Validate that MFJ filers have spouse information
   */
  static validateMarriedJointly(input: TaxPayerInput): string | null {
    if (input.filingStatus === 'marriedJointly' && !input.spouse) {
      return 'Married Filing Jointly requires spouse information';
    }
    return null;
  }

  /**
   * Validate head of household requirements (must have dependents)
   */
  static validateHeadOfHousehold(input: TaxPayerInput): string | null {
    if (input.filingStatus === 'headOfHousehold') {
      const hasChildren = (input.qualifyingChildren?.length || 0) > 0;
      const hasDependents = (input.dependents || 0) > 0;

      if (!hasChildren && !hasDependents) {
        return 'Head of Household requires at least one qualifying person';
      }
    }
    return null;
  }

  /**
   * Validate age for qualifying children (CTC requires under 17)
   */
  static validateQualifyingChildrenAges(input: TaxPayerInput): string[] {
    const errors: string[] = [];
    const TAX_YEAR = 2025;

    if (input.qualifyingChildren) {
      input.qualifyingChildren.forEach((child, index) => {
        const birthYear = parseInt(child.birthDate.split('-')[0] || '0', 10);
        const age = TAX_YEAR - birthYear;

        // Warn if child is over 17 (won't qualify for CTC)
        if (age >= 17) {
          const childName = child.name || `Child ${index + 1}`;
          errors.push(`${childName} is ${age} years old and may not qualify for Child Tax Credit (must be under 17)`);
        }
      });
    }

    return errors;
  }

  /**
   * Run all custom validations
   */
  static validateAll(input: TaxPayerInput): string[] {
    const errors: string[] = [];

    const mfsError = this.validateMarriedSeparately(input);
    if (mfsError) errors.push(mfsError);

    const mfjError = this.validateMarriedJointly(input);
    if (mfjError) errors.push(mfjError);

    const hohError = this.validateHeadOfHousehold(input);
    if (hohError) errors.push(hohError);

    const childAgeErrors = this.validateQualifyingChildrenAges(input);
    errors.push(...childAgeErrors);

    return errors;
  }
}

/**
 * Comprehensive validation combining Zod schema and custom rules
 */
export function validateTaxInputComprehensive(input: unknown): {
  success: boolean;
  errors: string[];
  warnings: string[];
  data?: TaxPayerInput;
} {
  // First, validate with Zod schema
  const schemaValidation = validateTaxInput(input);

  if (!schemaValidation.success) {
    return {
      success: false,
      errors: schemaValidation.errors?.map(e => `${e.path}: ${e.message}`) || [],
      warnings: [],
    };
  }

  // Then run custom validations
  const customErrors = TaxInputValidator.validateAll(schemaValidation.data!);

  // Separate errors from warnings (age warnings are not blocking)
  const errors = customErrors.filter(e => !e.includes('may not qualify'));
  const warnings = customErrors.filter(e => e.includes('may not qualify'));

  if (errors.length === 0 && schemaValidation.data) {
    return {
      success: true,
      errors: [],
      warnings,
      data: schemaValidation.data,
    };
  }

  return {
    success: false,
    errors,
    warnings,
  };
}