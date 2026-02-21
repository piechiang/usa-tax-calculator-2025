/**
 * Pre-conversion validation layer for UI inputs.
 *
 * This module validates user input BEFORE currency conversion,
 * preventing silent data loss that occurs when invalid inputs
 * are converted to $0 by safeCurrencyToCents.
 *
 * Use this to:
 * 1. Catch invalid inputs early with user-friendly error messages
 * 2. Collect all validation errors at once (not fail-fast)
 * 3. Distinguish between "empty/not filled" and "invalid value"
 */

import {
  dollarsToCentsResult,
  convertFieldsToCents,
  type CurrencyError,
} from '../engine/util/money';

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Result of validating UI input data.
 */
export interface UIValidationResult<T> {
  /** Whether all validation passed */
  valid: boolean;
  /** Converted data (if valid) or partial data with defaults (if invalid) */
  data: T;
  /** List of validation errors */
  errors: ValidationError[];
  /** List of warnings (non-fatal issues) */
  warnings: ValidationWarning[];
}

/**
 * A validation error with field context.
 */
export interface ValidationError {
  /** Field path (e.g., "income.wages", "deductions.medical") */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Error code for programmatic handling */
  code: ValidationErrorCode;
  /** The original invalid value */
  value?: unknown;
}

/**
 * A validation warning (non-fatal).
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: 'EMPTY_FIELD' | 'PRECISION_LOSS' | 'PARTIAL_PARSE' | 'DEPRECATED_FIELD';
}

export type ValidationErrorCode =
  | 'REQUIRED_FIELD' // Field is required but empty
  | 'INVALID_CURRENCY' // Cannot parse as currency
  | 'NEGATIVE_NOT_ALLOWED' // Negative value where only positive allowed
  | 'EXCEEDS_MAXIMUM' // Value exceeds allowed maximum
  | 'INVALID_TYPE' // Wrong data type
  | 'INVALID_FORMAT' // Wrong format (e.g., date, SSN)
  | 'INVALID_FILING_STATUS'; // Invalid filing status value

// ============================================================================
// Income Validation
// ============================================================================

/**
 * Validated and converted income data (values in cents).
 */
export interface ValidatedIncome {
  wages: number;
  interestIncome: number;
  dividends: number;
  qualifiedDividends: number;
  capitalGains: number;
  netShortTermCapitalGain: number;
  netLongTermCapitalGain: number;
  businessIncome: number;
  otherIncome: number;
}

/**
 * Fields that can have negative values (losses).
 */
const INCOME_FIELDS_ALLOW_NEGATIVE = new Set([
  'capitalGains',
  'netShortTermCapitalGain',
  'netLongTermCapitalGain',
  'businessIncome',
]);

/**
 * Validate and convert income data from UI.
 *
 * @param incomeData - Raw income data from UI form
 * @returns Validation result with converted values in cents
 */
export function validateIncomeData(
  incomeData: Record<string, unknown>
): UIValidationResult<ValidatedIncome> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const incomeFields = [
    'wages',
    'interestIncome',
    'dividends',
    'qualifiedDividends',
    'capitalGains',
    'netShortTermCapitalGain',
    'netLongTermCapitalGain',
    'businessIncome',
    'otherIncome',
  ];

  const converted: Record<string, number> = {};

  for (const field of incomeFields) {
    const value = incomeData[field];
    const allowNegative = INCOME_FIELDS_ALLOW_NEGATIVE.has(field);

    const result = dollarsToCentsResult(value, {
      fieldName: `income.${field}`,
      allowNegative,
      emptyAsZero: true,
    });

    if (result.success) {
      converted[field] = result.value;
      if (result.warnings) {
        for (const w of result.warnings) {
          if (w.includes('Empty')) {
            warnings.push({
              field: `income.${field}`,
              message: w,
              code: 'EMPTY_FIELD',
            });
          } else if (w.includes('Precision')) {
            warnings.push({
              field: `income.${field}`,
              message: w,
              code: 'PRECISION_LOSS',
            });
          } else if (w.includes('Partial')) {
            warnings.push({
              field: `income.${field}`,
              message: w,
              code: 'PARTIAL_PARSE',
            });
          }
        }
      }
    } else {
      errors.push({
        field: `income.${field}`,
        message: result.error.message,
        code: mapCurrencyErrorCode(result.error.code),
        value: result.originalInput,
      });
      converted[field] = 0; // Default for error cases
    }
  }

  return {
    valid: errors.length === 0,
    data: converted as unknown as ValidatedIncome,
    errors,
    warnings,
  };
}

// ============================================================================
// Deductions Validation
// ============================================================================

/**
 * Validated and converted deduction data (values in cents).
 */
export interface ValidatedDeductions {
  stateLocalTaxes: number;
  mortgageInterest: number;
  charitable: number;
  medical: number;
  other: number;
  studentLoanInterest: number;
  hsaContribution: number;
  iraContribution: number;
  itemizedTotal?: number;
  forceItemized: boolean;
}

/**
 * Validate and convert deductions data from UI.
 * Handles the complex field name variations that exist in the codebase.
 *
 * @param deductions - Raw deductions data from UI form
 * @returns Validation result with converted values in cents
 */
export function validateDeductionsData(
  deductions: Record<string, unknown>
): UIValidationResult<ValidatedDeductions> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Handle field name variations
  const stateLocalValue = deductions.stateLocalTaxes ?? deductions.stateTaxesPaid ?? 0;
  const charitableValue =
    deductions.charitable ??
    deductions.charitableContributions ??
    deductions.charitableDonations ??
    0;
  const otherValue =
    deductions.other ?? deductions.otherItemized ?? deductions.otherDeductions ?? 0;

  const fieldsToConvert = {
    stateLocalTaxes: stateLocalValue,
    mortgageInterest: deductions.mortgageInterest ?? 0,
    charitable: charitableValue,
    medical: deductions.medical ?? deductions.medicalExpenses ?? 0,
    other: otherValue,
    studentLoanInterest: deductions.studentLoanInterest ?? 0,
    hsaContribution: deductions.hsaContribution ?? 0,
    iraContribution: deductions.iraContribution ?? 0,
  };

  const {
    values,
    errors: conversionErrors,
    warnings: conversionWarnings,
  } = convertFieldsToCents(fieldsToConvert, { emptyAsZero: true });

  // Map currency errors to validation errors
  for (const err of conversionErrors) {
    errors.push({
      field: `deductions.${err.field}`,
      message: err.message,
      code: mapCurrencyErrorCode(err.code),
      value: fieldsToConvert[err.field as keyof typeof fieldsToConvert],
    });
  }

  // Map warnings
  for (const [field, warns] of Object.entries(conversionWarnings)) {
    for (const w of warns) {
      warnings.push({
        field: `deductions.${field}`,
        message: w,
        code: w.includes('Empty')
          ? 'EMPTY_FIELD'
          : w.includes('Precision')
            ? 'PRECISION_LOSS'
            : 'PARTIAL_PARSE',
      });
    }
  }

  // Handle itemizedTotal if provided (special case: already in dollars, convert)
  let itemizedTotal: number | undefined;
  if (deductions.itemizedTotal !== undefined && deductions.itemizedTotal !== null) {
    const totalResult = dollarsToCentsResult(deductions.itemizedTotal, {
      fieldName: 'deductions.itemizedTotal',
      emptyAsZero: false,
    });
    if (totalResult.success) {
      itemizedTotal = totalResult.value;
    } else {
      errors.push({
        field: 'deductions.itemizedTotal',
        message: totalResult.error.message,
        code: mapCurrencyErrorCode(totalResult.error.code),
        value: deductions.itemizedTotal,
      });
    }
  }

  // Handle deprecated field names with warnings
  if ('stateTaxesPaid' in deductions && !('stateLocalTaxes' in deductions)) {
    warnings.push({
      field: 'deductions.stateTaxesPaid',
      message: 'Field "stateTaxesPaid" is deprecated, use "stateLocalTaxes" instead',
      code: 'DEPRECATED_FIELD',
    });
  }
  if ('charitableDonations' in deductions && !('charitable' in deductions)) {
    warnings.push({
      field: 'deductions.charitableDonations',
      message: 'Field "charitableDonations" is deprecated, use "charitable" instead',
      code: 'DEPRECATED_FIELD',
    });
  }

  return {
    valid: errors.length === 0,
    data: {
      stateLocalTaxes: values.stateLocalTaxes,
      mortgageInterest: values.mortgageInterest,
      charitable: values.charitable,
      medical: values.medical,
      other: values.other,
      studentLoanInterest: values.studentLoanInterest,
      hsaContribution: values.hsaContribution,
      iraContribution: values.iraContribution,
      itemizedTotal,
      forceItemized: Boolean(deductions.forceItemized ?? deductions.itemizeDeductions),
    },
    errors,
    warnings,
  };
}

// ============================================================================
// Payments Validation
// ============================================================================

/**
 * Validated and converted payments data (values in cents).
 */
export interface ValidatedPayments {
  federalWithholding: number;
  stateWithholding: number;
  estimatedTaxPayments: number;
  otherPayments: number;
}

/**
 * Validate and convert payments data from UI.
 */
export function validatePaymentsData(
  payments: Record<string, unknown>
): UIValidationResult<ValidatedPayments> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const fieldsToConvert = {
    federalWithholding: payments.federalWithholding ?? 0,
    stateWithholding: payments.stateWithholding ?? 0,
    estimatedTaxPayments: payments.estimatedTaxPayments ?? 0,
    otherPayments: payments.otherPayments ?? 0,
  };

  const {
    values,
    errors: conversionErrors,
    warnings: conversionWarnings,
  } = convertFieldsToCents(fieldsToConvert, { emptyAsZero: true });

  for (const err of conversionErrors) {
    errors.push({
      field: `payments.${err.field}`,
      message: err.message,
      code: mapCurrencyErrorCode(err.code),
      value: fieldsToConvert[err.field as keyof typeof fieldsToConvert],
    });
  }

  for (const [field, warns] of Object.entries(conversionWarnings)) {
    for (const w of warns) {
      warnings.push({
        field: `payments.${field}`,
        message: w,
        code: w.includes('Empty') ? 'EMPTY_FIELD' : 'PRECISION_LOSS',
      });
    }
  }

  return {
    valid: errors.length === 0,
    data: values as ValidatedPayments,
    errors,
    warnings,
  };
}

// ============================================================================
// Full Form Validation
// ============================================================================

/**
 * Combined validation result for all UI form data.
 */
export interface FullFormValidationResult {
  valid: boolean;
  income: ValidatedIncome;
  deductions: ValidatedDeductions;
  payments: ValidatedPayments;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validate all UI form data at once.
 * Collects all errors and warnings across all sections.
 */
export function validateFullForm(
  incomeData: Record<string, unknown>,
  deductionsData: Record<string, unknown>,
  paymentsData: Record<string, unknown>
): FullFormValidationResult {
  const incomeResult = validateIncomeData(incomeData);
  const deductionsResult = validateDeductionsData(deductionsData);
  const paymentsResult = validatePaymentsData(paymentsData);

  const allErrors = [...incomeResult.errors, ...deductionsResult.errors, ...paymentsResult.errors];

  const allWarnings = [
    ...incomeResult.warnings,
    ...deductionsResult.warnings,
    ...paymentsResult.warnings,
  ];

  return {
    valid: allErrors.length === 0,
    income: incomeResult.data,
    deductions: deductionsResult.data,
    payments: paymentsResult.data,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Map currency error codes to validation error codes.
 */
function mapCurrencyErrorCode(code: CurrencyError['code']): ValidationErrorCode {
  switch (code) {
    case 'INVALID_STRING':
      return 'INVALID_CURRENCY';
    case 'INVALID_TYPE':
      return 'INVALID_TYPE';
    case 'INFINITE_VALUE':
      return 'INVALID_CURRENCY';
    case 'NEGATIVE_VALUE':
      return 'NEGATIVE_NOT_ALLOWED';
    case 'EXCEEDS_MAX':
      return 'EXCEEDS_MAXIMUM';
    case 'PRECISION_LOSS':
      return 'INVALID_CURRENCY';
    default:
      return 'INVALID_CURRENCY';
  }
}

/**
 * Format validation errors for display to user.
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map((err) => {
    const fieldLabel = formatFieldLabel(err.field);
    return `${fieldLabel}: ${err.message}`;
  });
}

/**
 * Convert field path to user-friendly label.
 */
function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    'income.wages': 'Wages/Salary',
    'income.interestIncome': 'Interest Income',
    'income.dividends': 'Dividends',
    'income.qualifiedDividends': 'Qualified Dividends',
    'income.capitalGains': 'Capital Gains',
    'income.netShortTermCapitalGain': 'Short-Term Capital Gains',
    'income.netLongTermCapitalGain': 'Long-Term Capital Gains',
    'income.businessIncome': 'Business Income',
    'income.otherIncome': 'Other Income',
    'deductions.stateLocalTaxes': 'State & Local Taxes',
    'deductions.mortgageInterest': 'Mortgage Interest',
    'deductions.charitable': 'Charitable Contributions',
    'deductions.medical': 'Medical Expenses',
    'deductions.other': 'Other Deductions',
    'deductions.studentLoanInterest': 'Student Loan Interest',
    'deductions.hsaContribution': 'HSA Contribution',
    'deductions.iraContribution': 'IRA Contribution',
    'payments.federalWithholding': 'Federal Withholding',
    'payments.stateWithholding': 'State Withholding',
    'payments.estimatedTaxPayments': 'Estimated Tax Payments',
    'payments.otherPayments': 'Other Payments',
  };

  return labels[field] || field.split('.').pop() || field;
}

/**
 * Check if validation result has any errors.
 */
export function hasValidationErrors(result: { errors: ValidationError[] }): boolean {
  return result.errors.length > 0;
}

/**
 * Get errors for a specific field.
 */
export function getFieldErrors(errors: ValidationError[], fieldPath: string): ValidationError[] {
  return errors.filter((err) => err.field === fieldPath);
}

/**
 * Check if a specific field has errors.
 */
export function hasFieldError(errors: ValidationError[], fieldPath: string): boolean {
  return errors.some((err) => err.field === fieldPath);
}
