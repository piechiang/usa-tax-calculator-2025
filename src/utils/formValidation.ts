/**
 * Enhanced Form Validation Module
 *
 * Provides comprehensive validation for tax forms with:
 * - Type-safe validation rules
 * - Cross-field validation
 * - Async validation support
 * - Localized error messages
 * - IRS-specific format validation
 */

import { getTranslation } from './translations';

// ============================================================================
// Types
// ============================================================================

export interface ValidationRule<T = unknown> {
  validate: (value: T, context?: ValidationContext) => boolean | Promise<boolean>;
  message: string | ((value: T, context?: ValidationContext) => string);
  /** Only run this validation if condition is true */
  when?: (context: ValidationContext) => boolean;
}

export interface ValidationContext {
  /** All form field values */
  values: Record<string, unknown>;
  /** The field being validated */
  field: string;
  /** Language code for error messages */
  language?: string;
  /** Filing status (affects many validations) */
  filingStatus?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationSchema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [field: string]: ValidationRule<any>[];
}

export interface FieldValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
  firstError?: ValidationError;
}

// ============================================================================
// Built-in Validators
// ============================================================================

/**
 * Required field validator
 */
export const required = (message?: string): ValidationRule<unknown> => ({
  validate: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  message: message || 'validation.required',
});

/**
 * Minimum length validator
 */
export const minLength = (min: number, message?: string): ValidationRule<string> => ({
  validate: (value) => !value || value.length >= min,
  message: message || `validation.minLength:${min}`,
});

/**
 * Maximum length validator
 */
export const maxLength = (max: number, message?: string): ValidationRule<string> => ({
  validate: (value) => !value || value.length <= max,
  message: message || `validation.maxLength:${max}`,
});

/**
 * Pattern validator
 */
export const pattern = (regex: RegExp, message: string): ValidationRule<string> => ({
  validate: (value) => !value || regex.test(value),
  message,
});

/**
 * Minimum value validator
 */
export const min = (minValue: number, message?: string): ValidationRule<number | string> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= minValue;
  },
  message: message || `validation.min:${minValue}`,
});

/**
 * Maximum value validator
 */
export const max = (maxValue: number, message?: string): ValidationRule<number | string> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num <= maxValue;
  },
  message: message || `validation.max:${maxValue}`,
});

/**
 * Email validator
 */
export const email = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  message: message || 'validation.invalidEmail',
});

/**
 * Numeric validator - ensures value is a valid number
 */
export const numeric = (message?: string): ValidationRule<string | number> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    return !isNaN(num) && isFinite(num);
  },
  message: message || 'validation.invalidNumber',
});

/**
 * Integer validator
 */
export const integer = (message?: string): ValidationRule<string | number> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && Number.isInteger(num);
  },
  message: message || 'validation.mustBeInteger',
});

/**
 * Non-negative validator
 */
export const nonNegative = (message?: string): ValidationRule<string | number> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    return !isNaN(num) && num >= 0;
  },
  message: message || 'validation.mustBeNonNegative',
});

// ============================================================================
// IRS-Specific Validators
// ============================================================================

/**
 * SSN validator - validates Social Security Number format
 * Accepts: XXX-XX-XXXX or XXXXXXXXX
 */
export const ssn = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 9) return false;
    // SSNs cannot start with 000, 666, or 900-999
    const areaNumber = parseInt(digitsOnly.substring(0, 3), 10);
    if (areaNumber === 0 || areaNumber === 666 || areaNumber >= 900) return false;
    // Group number (middle 2 digits) cannot be 00
    const groupNumber = parseInt(digitsOnly.substring(3, 5), 10);
    if (groupNumber === 0) return false;
    // Serial number (last 4 digits) cannot be 0000
    const serialNumber = parseInt(digitsOnly.substring(5, 9), 10);
    if (serialNumber === 0) return false;
    return true;
  },
  message: message || 'validation.invalidSSN',
});

/**
 * EIN validator - validates Employer Identification Number format
 * Format: XX-XXXXXXX
 */
export const ein = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 9) return false;
    // Valid EIN prefixes
    const validPrefixes = [
      '10',
      '12',
      '60',
      '67',
      '50',
      '53',
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '11',
      '13',
      '14',
      '15',
      '16',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
      '40',
      '41',
      '42',
      '43',
      '44',
      '45',
      '46',
      '47',
      '48',
      '51',
      '52',
      '54',
      '55',
      '56',
      '57',
      '58',
      '59',
      '61',
      '62',
      '63',
      '64',
      '65',
      '66',
      '68',
      '71',
      '72',
      '73',
      '74',
      '75',
      '76',
      '77',
      '80',
      '81',
      '82',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '90',
      '91',
      '92',
      '93',
      '94',
      '95',
      '98',
      '99',
    ];
    const prefix = digitsOnly.substring(0, 2);
    return validPrefixes.includes(prefix);
  },
  message: message || 'validation.invalidEIN',
});

/**
 * ITIN validator - validates Individual Taxpayer Identification Number
 * Format: 9XX-XX-XXXX (starts with 9)
 */
export const itin = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 9) return false;
    // ITINs always start with 9
    if (!digitsOnly.startsWith('9')) return false;
    // Fourth and fifth digits must be 70-88, 90-92, or 94-99
    const fourthFifth = parseInt(digitsOnly.substring(3, 5), 10);
    const validRanges =
      (fourthFifth >= 70 && fourthFifth <= 88) ||
      (fourthFifth >= 90 && fourthFifth <= 92) ||
      (fourthFifth >= 94 && fourthFifth <= 99);
    return validRanges;
  },
  message: message || 'validation.invalidITIN',
});

/**
 * Tax amount validator - validates dollar amounts for tax purposes
 * Max: $999,999,999,999 (reasonable upper bound)
 */
export const taxAmount = (message?: string): ValidationRule<string | number> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const strValue = String(value).replace(/[$,]/g, '');
    const num = parseFloat(strValue);
    if (isNaN(num)) return false;
    // Allow negative for losses/refunds, cap at reasonable max
    return num >= -999999999999 && num <= 999999999999;
  },
  message: message || 'validation.invalidTaxAmount',
});

/**
 * Percentage validator (0-100)
 */
export const percentage = (message?: string): ValidationRule<string | number> => ({
  validate: (value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= 0 && num <= 100;
  },
  message: message || 'validation.invalidPercentage',
});

/**
 * Date validator - validates date strings
 */
export const date = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    const parsed = new Date(value);
    return !isNaN(parsed.getTime());
  },
  message: message || 'validation.invalidDate',
});

/**
 * US ZIP code validator
 */
export const zipCode = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    // 5-digit or 5+4 digit format
    return /^\d{5}(-\d{4})?$/.test(value);
  },
  message: message || 'validation.invalidZipCode',
});

/**
 * US phone number validator
 */
export const phoneNumber = (message?: string): ValidationRule<string> => ({
  validate: (value) => {
    if (!value) return true;
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length === 10 || digitsOnly.length === 11;
  },
  message: message || 'validation.invalidPhoneNumber',
});

// ============================================================================
// Cross-Field Validators
// ============================================================================

/**
 * Conditional required - required only if another field has a specific value
 */
export const requiredIf = (
  dependentField: string,
  expectedValue: unknown,
  message?: string
): ValidationRule<unknown> => ({
  validate: (value, context) => {
    if (!context) return true;
    const dependentValue = context.values[dependentField];
    if (dependentValue !== expectedValue) return true;
    return required().validate(value, context);
  },
  message: message || 'validation.required',
});

/**
 * Less than another field
 */
export const lessThan = (
  otherField: string,
  message?: string
): ValidationRule<number | string> => ({
  validate: (value, context) => {
    if (!context || value === '' || value === null || value === undefined) return true;
    const otherValue = context.values[otherField];
    if (otherValue === '' || otherValue === null || otherValue === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const other = typeof otherValue === 'string' ? parseFloat(otherValue) : Number(otherValue);
    return !isNaN(num) && !isNaN(other) && num < other;
  },
  message: message || `validation.mustBeLessThan:${otherField}`,
});

/**
 * Greater than another field
 */
export const greaterThan = (
  otherField: string,
  message?: string
): ValidationRule<number | string> => ({
  validate: (value, context) => {
    if (!context || value === '' || value === null || value === undefined) return true;
    const otherValue = context.values[otherField];
    if (otherValue === '' || otherValue === null || otherValue === undefined) return true;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const other = typeof otherValue === 'string' ? parseFloat(otherValue) : Number(otherValue);
    return !isNaN(num) && !isNaN(other) && num > other;
  },
  message: message || `validation.mustBeGreaterThan:${otherField}`,
});

// ============================================================================
// Validation Engine
// ============================================================================

/**
 * Validate a single field against its rules
 */
export const validateField = async (
  value: unknown,
  rules: ValidationRule[],
  context: ValidationContext
): Promise<FieldValidationResult> => {
  const errors: string[] = [];

  for (const rule of rules) {
    // Check if rule should run
    if (rule.when && !rule.when(context)) {
      continue;
    }

    const isValid = await rule.validate(value, context);

    if (!isValid) {
      const message =
        typeof rule.message === 'function' ? rule.message(value, context) : rule.message;

      // Translate message if it looks like a translation key
      const translatedMessage = message.startsWith('validation.')
        ? getTranslation(message, context.language || 'en')
        : message;

      errors.push(translatedMessage);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate an entire form against a schema
 */
export const validateForm = async (
  values: Record<string, unknown>,
  schema: ValidationSchema,
  options: { language?: string; filingStatus?: string } = {}
): Promise<FormValidationResult> => {
  const errors: Record<string, string[]> = {};
  let firstError: ValidationError | undefined;

  for (const [field, rules] of Object.entries(schema)) {
    const context: ValidationContext = {
      values,
      field,
      language: options.language,
      filingStatus: options.filingStatus,
    };

    const result = await validateField(values[field], rules, context);

    if (!result.valid) {
      errors[field] = result.errors;

      if (!firstError && result.errors.length > 0) {
        firstError = {
          field,
          message: result.errors[0]!,
          code: field,
        };
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};

/**
 * Create a reusable form validator from a schema
 */
export const createFormValidator = (schema: ValidationSchema) => {
  return (
    values: Record<string, unknown>,
    options?: { language?: string; filingStatus?: string }
  ) => validateForm(values, schema, options);
};

// ============================================================================
// Pre-built Tax Form Schemas
// ============================================================================

/**
 * Personal information validation schema
 */
export const personalInfoSchema: ValidationSchema = {
  firstName: [required(), minLength(1), maxLength(50)],
  lastName: [required(), minLength(1), maxLength(50)],
  ssn: [ssn()],
  filingStatus: [required()],
  state: [required()],
  dependents: [integer(), min(0), max(20)],
  age: [integer(), min(0), max(120)],
};

/**
 * Income section validation schema
 */
export const incomeSchema: ValidationSchema = {
  wages: [taxAmount(), nonNegative()],
  taxableInterest: [taxAmount(), nonNegative()],
  taxExemptInterest: [taxAmount(), nonNegative()],
  ordinaryDividends: [taxAmount(), nonNegative()],
  qualifiedDividends: [taxAmount(), nonNegative()],
  shortTermGains: [taxAmount()],
  longTermGains: [taxAmount()],
  businessIncome: [taxAmount()],
  rentalIncome: [taxAmount()],
  socialSecurityBenefits: [taxAmount(), nonNegative()],
  otherIncome: [taxAmount()],
};

/**
 * Spouse information validation schema
 */
export const spouseInfoSchema: ValidationSchema = {
  firstName: [requiredIf('hasSpouseIncome', true)],
  lastName: [requiredIf('hasSpouseIncome', true)],
  ssn: [ssn()],
  wages: [taxAmount(), nonNegative()],
  selfEmploymentIncome: [taxAmount()],
};
