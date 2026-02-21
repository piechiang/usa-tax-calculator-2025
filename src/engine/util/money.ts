import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -15,
  toExpPos: 15,
  modulo: Decimal.ROUND_FLOOR,
  crypto: false,
});

// ============================================================================
// Currency Conversion Result Types
// ============================================================================

/**
 * Result type for currency conversion operations.
 * Eliminates silent failures by making success/failure explicit.
 */
export type CurrencyResult<T> =
  | { success: true; value: T; warnings?: string[] }
  | { success: false; error: CurrencyError; originalInput: unknown };

/**
 * Specific error types for currency conversion failures.
 */
export type CurrencyErrorCode =
  | 'INVALID_STRING' // Unparseable string (e.g., "abc", "NaN")
  | 'INVALID_TYPE' // Unsupported input type
  | 'INFINITE_VALUE' // Infinity or -Infinity
  | 'NEGATIVE_VALUE' // Negative when not allowed
  | 'EXCEEDS_MAX' // Value exceeds maximum allowed
  | 'PRECISION_LOSS'; // Fractional cents detected

export interface CurrencyError {
  code: CurrencyErrorCode;
  message: string;
  field?: string; // Optional field name for context
}

/**
 * Options for currency conversion behavior.
 */
export interface CurrencyConversionOptions {
  /** Field name for error context */
  fieldName?: string;
  /** Allow negative values (default: false for tax inputs) */
  allowNegative?: boolean;
  /** Maximum allowed value in cents (default: 100 billion = $1B) */
  maxCents?: number;
  /** Treat empty/null as zero (default: true) */
  emptyAsZero?: boolean;
  /** Log warnings for edge cases */
  logWarnings?: boolean;
}

const DEFAULT_OPTIONS: Required<CurrencyConversionOptions> = {
  fieldName: 'amount',
  allowNegative: false,
  maxCents: 100_000_000_000, // $1 billion max
  emptyAsZero: true,
  logWarnings: false,
};

// ============================================================================
// Result-based Currency Conversion (New API)
// ============================================================================

/**
 * Converts a dollar amount (string or number) to cents with explicit success/failure.
 *
 * @param amount - The amount to convert (string like "$1,234.56" or number like 1234.56)
 * @param options - Conversion options
 * @returns CurrencyResult with either the value in cents or an error
 *
 * @example
 * const result = dollarsToCentsResult("$1,234.56");
 * if (result.success) {
 *   console.log(result.value); // 123456
 * } else {
 *   console.error(result.error.message);
 * }
 */
export function dollarsToCentsResult(
  amount: unknown,
  options: CurrencyConversionOptions = {}
): CurrencyResult<number> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];

  // Handle null/undefined/empty
  if (amount === null || amount === undefined || amount === '') {
    if (opts.emptyAsZero) {
      return { success: true, value: 0, warnings: ['Empty input treated as $0'] };
    }
    return {
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: `${opts.fieldName}: Missing or empty value`,
        field: opts.fieldName,
      },
      originalInput: amount,
    };
  }

  let dollars: number;

  // Parse string input
  if (typeof amount === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = amount.replace(/[$,\s]/g, '').trim();

    if (cleaned === '') {
      if (opts.emptyAsZero) {
        return { success: true, value: 0, warnings: ['Empty string treated as $0'] };
      }
      return {
        success: false,
        error: {
          code: 'INVALID_STRING',
          message: `${opts.fieldName}: Empty string after cleaning`,
          field: opts.fieldName,
        },
        originalInput: amount,
      };
    }

    dollars = parseFloat(cleaned);

    if (isNaN(dollars)) {
      return {
        success: false,
        error: {
          code: 'INVALID_STRING',
          message: `${opts.fieldName}: Cannot parse "${amount}" as a currency value`,
          field: opts.fieldName,
        },
        originalInput: amount,
      };
    }

    // Warn if parseFloat consumed only part of the string
    const parsedStr = dollars.toString();
    if (cleaned !== parsedStr && !cleaned.match(/^-?\d+\.?\d*$/)) {
      warnings.push(`Partial parse: "${amount}" interpreted as $${dollars}`);
    }
  } else if (typeof amount === 'number') {
    dollars = amount;
  } else {
    return {
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: `${opts.fieldName}: Expected string or number, got ${typeof amount}`,
        field: opts.fieldName,
      },
      originalInput: amount,
    };
  }

  // Validate the parsed number
  if (!isFinite(dollars)) {
    return {
      success: false,
      error: {
        code: 'INFINITE_VALUE',
        message: `${opts.fieldName}: Value is ${dollars === Infinity ? 'Infinity' : '-Infinity'}`,
        field: opts.fieldName,
      },
      originalInput: amount,
    };
  }

  if (!opts.allowNegative && dollars < 0) {
    return {
      success: false,
      error: {
        code: 'NEGATIVE_VALUE',
        message: `${opts.fieldName}: Negative values not allowed ($${dollars})`,
        field: opts.fieldName,
      },
      originalInput: amount,
    };
  }

  // Convert to cents
  const cents = Math.round(dollars * 100);

  // Check for precision loss (fractional cents)
  const reconstructedDollars = cents / 100;
  if (Math.abs(dollars - reconstructedDollars) > 0.001) {
    warnings.push(`Precision: $${dollars} rounded to $${reconstructedDollars}`);
  }

  // Check max value
  if (Math.abs(cents) > opts.maxCents) {
    return {
      success: false,
      error: {
        code: 'EXCEEDS_MAX',
        message: `${opts.fieldName}: Value $${dollars} exceeds maximum allowed`,
        field: opts.fieldName,
      },
      originalInput: amount,
    };
  }

  if (opts.logWarnings && warnings.length > 0) {
    console.warn(`[CurrencyConversion] ${opts.fieldName}:`, warnings);
  }

  return {
    success: true,
    value: cents,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Batch convert multiple fields, collecting all errors.
 * Useful for form validation where you want to show all errors at once.
 */
export function convertFieldsToCents<T extends Record<string, unknown>>(
  fields: T,
  options: CurrencyConversionOptions = {}
): {
  values: Record<keyof T, number>;
  errors: CurrencyError[];
  warnings: Record<string, string[]>;
} {
  const values = {} as Record<keyof T, number>;
  const errors: CurrencyError[] = [];
  const warnings: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(fields)) {
    const result = dollarsToCentsResult(value, { ...options, fieldName: key });
    if (result.success) {
      values[key as keyof T] = result.value;
      if (result.warnings) {
        warnings[key] = result.warnings;
      }
    } else {
      errors.push(result.error);
      values[key as keyof T] = 0; // Default for error cases
    }
  }

  return { values, errors, warnings };
}

// Core utility functions for money calculations
export const C = (n: number | string | Decimal) => new Decimal(n);

// Convert Decimal to cents (integer)
export const toCents = (d: Decimal) =>
  Number(d.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString());

// Create Decimal from cents
export const cents = (n: number) => new Decimal(n);

// Convert dollars to cents
export const dollarsToCents = (dollars: number) => Math.round(dollars * 100);

// Convert cents to dollars
export const centsToDollars = (cents: number) => cents / 100;

// Add multiple cent values safely
export const addCents = (...vals: (number | undefined | null)[]): number => {
  return toCents(vals.reduce((acc, v) => acc.plus(v || 0), C(0)));
};

// Subtract cents safely
export const subtractCents = (a: number, b: number): number => {
  return toCents(C(a).minus(b));
};

// Multiply cents by rate safely
export const multiplyCents = (cents: number, rate: number): number => {
  return toCents(C(cents).times(rate));
};

// Ensure non-negative result
export const max0 = (n: number) => Math.max(0, n);

// Calculate percentage of amount
export const percentOf = (amount: number, percentage: number): number => {
  return toCents(C(amount).times(percentage));
};

// Round to nearest cent
export const roundToCents = (amount: number): number => {
  return Math.round(amount);
};

// Validate currency amount
export const isValidCurrency = (amount: unknown): boolean => {
  if (amount === null || amount === undefined) return true;
  if (typeof amount === 'string') {
    const num = parseFloat(amount);
    return !isNaN(num) && isFinite(num);
  }
  return typeof amount === 'number' && isFinite(amount);
};

/**
 * Safe currency conversion with validation.
 *
 * @deprecated Use `dollarsToCentsResult()` for explicit error handling.
 * This function silently returns 0 for invalid inputs, which can cause
 * data loss. Consider migrating to the Result-based API.
 *
 * @param amount - Dollar amount as string (e.g., "$1,234.56") or number (e.g., 1234.56)
 * @param fieldName - Optional field name for warning logs
 * @returns Amount in cents (integer), or 0 for invalid input
 */
export const safeCurrencyToCents = (amount: unknown, fieldName?: string): number => {
  if (amount === null || amount === undefined || amount === '') return 0;

  // Strings are interpreted as dollars (e.g., "1234.56")
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) {
      if (process.env.NODE_ENV === 'development' && fieldName) {
        console.warn(
          `[safeCurrencyToCents] ${fieldName}: Invalid string "${amount}" converted to $0`
        );
      }
      return 0;
    }
    return dollarsToCents(num);
  }

  // Numbers are interpreted as dollars (consistent with UI/tests)
  if (typeof amount === 'number') {
    if (!isFinite(amount)) {
      if (process.env.NODE_ENV === 'development' && fieldName) {
        console.warn(`[safeCurrencyToCents] ${fieldName}: Infinite value converted to $0`);
      }
      return 0;
    }
    return dollarsToCents(amount);
  }

  if (process.env.NODE_ENV === 'development' && fieldName) {
    console.warn(
      `[safeCurrencyToCents] ${fieldName}: Invalid type ${typeof amount} converted to $0`
    );
  }
  return 0;
};

/**
 * Strict currency conversion that throws on invalid input.
 * Use this when you need to ensure data integrity and want to fail fast.
 *
 * @param amount - Dollar amount as string or number
 * @param fieldName - Field name for error messages
 * @returns Amount in cents (integer)
 * @throws Error if input is invalid
 */
export function strictCurrencyToCents(amount: unknown, fieldName: string): number {
  const result = dollarsToCentsResult(amount, { fieldName, emptyAsZero: false });
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.value;
}

// Heuristic conversion: accept either dollars or cents when a number is provided.
// - Numbers >= 1,000,000 are treated as cents (already in cents)
// - Numbers < 1,000,000 are treated as dollars
export const toCentsFlexible = (amount: unknown): number => {
  if (amount === null || amount === undefined || amount === '') return 0;
  if (typeof amount === 'string') return safeCurrencyToCents(amount);
  if (typeof amount === 'number') {
    const n = Math.round(amount);
    return Math.abs(n) >= 1_000_000 ? n : dollarsToCents(n);
  }
  return 0;
};

// Format cents as currency string
export const formatCents = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centsToDollars(cents));
};
