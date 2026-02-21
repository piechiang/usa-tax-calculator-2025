import { describe, it, expect } from 'vitest';
import {
  dollarsToCentsResult,
  convertFieldsToCents,
  safeCurrencyToCents,
  strictCurrencyToCents,
  dollarsToCents,
  centsToDollars,
} from '../../../src/engine/util/money';

describe('dollarsToCentsResult', () => {
  describe('successful conversions', () => {
    it('converts dollar string to cents', () => {
      const result = dollarsToCentsResult('$1,234.56');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(123456);
      }
    });

    it('converts plain number string to cents', () => {
      const result = dollarsToCentsResult('100.50');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(10050);
      }
    });

    it('converts number to cents', () => {
      const result = dollarsToCentsResult(250.75);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(25075);
      }
    });

    it('handles zero correctly', () => {
      const result = dollarsToCentsResult(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(0);
      }
    });

    it('handles string zero correctly', () => {
      const result = dollarsToCentsResult('0');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(0);
      }
    });

    it('handles negative values when allowed', () => {
      const result = dollarsToCentsResult(-100.5, { allowNegative: true });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(-10050);
      }
    });

    it('handles empty/null as zero by default', () => {
      expect(dollarsToCentsResult(null).success).toBe(true);
      expect(dollarsToCentsResult(undefined).success).toBe(true);
      expect(dollarsToCentsResult('').success).toBe(true);

      const nullResult = dollarsToCentsResult(null);
      if (nullResult.success) {
        expect(nullResult.value).toBe(0);
        expect(nullResult.warnings).toContain('Empty input treated as $0');
      }
    });

    it('removes whitespace from strings', () => {
      const result = dollarsToCentsResult('  $1,000  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(100000);
      }
    });
  });

  describe('failure cases', () => {
    it('fails on unparseable string', () => {
      const result = dollarsToCentsResult('abc', { fieldName: 'wages' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_STRING');
        expect(result.error.field).toBe('wages');
        expect(result.originalInput).toBe('abc');
      }
    });

    it('fails on negative when not allowed', () => {
      const result = dollarsToCentsResult(-100, { fieldName: 'income' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NEGATIVE_VALUE');
      }
    });

    it('fails on Infinity', () => {
      const result = dollarsToCentsResult(Infinity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INFINITE_VALUE');
      }
    });

    it('fails on -Infinity', () => {
      const result = dollarsToCentsResult(-Infinity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INFINITE_VALUE');
      }
    });

    it('fails on invalid type', () => {
      const result = dollarsToCentsResult({ value: 100 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_TYPE');
      }
    });

    it('fails on value exceeding max', () => {
      const result = dollarsToCentsResult(2_000_000_000, { maxCents: 100_000_000_000 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EXCEEDS_MAX');
      }
    });

    it('fails on empty when emptyAsZero is false', () => {
      const result = dollarsToCentsResult('', { emptyAsZero: false });
      expect(result.success).toBe(false);
    });
  });

  describe('warnings', () => {
    it('warns on partial parse', () => {
      const result = dollarsToCentsResult('100abc');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(10000); // parseFloat('100abc') = 100
        expect(result.warnings).toBeDefined();
        expect(result.warnings?.some((w) => w.includes('Partial parse'))).toBe(true);
      }
    });

    it('warns on precision loss', () => {
      const result = dollarsToCentsResult(100.999);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(10100); // Rounded
        expect(result.warnings?.some((w) => w.includes('Precision'))).toBe(true);
      }
    });
  });
});

describe('convertFieldsToCents', () => {
  it('converts multiple fields and collects errors', () => {
    const fields = {
      wages: '$50,000',
      interest: '1,200.50',
      invalid: 'not a number',
      dividends: 500,
    };

    const { values, errors, warnings } = convertFieldsToCents(fields);

    expect(values.wages).toBe(5000000);
    expect(values.interest).toBe(120050);
    expect(values.dividends).toBe(50000);
    expect(values.invalid).toBe(0); // Defaults to 0 on error

    expect(errors.length).toBe(1);
    expect(errors[0].field).toBe('invalid');
    expect(errors[0].code).toBe('INVALID_STRING');
  });

  it('handles all valid fields', () => {
    const fields = {
      a: '100',
      b: 200,
      c: '$300.50',
    };

    const { values, errors } = convertFieldsToCents(fields);

    expect(errors.length).toBe(0);
    expect(values.a).toBe(10000);
    expect(values.b).toBe(20000);
    expect(values.c).toBe(30050);
  });
});

describe('safeCurrencyToCents (legacy)', () => {
  it('converts valid inputs', () => {
    expect(safeCurrencyToCents('$1,234.56')).toBe(123456);
    expect(safeCurrencyToCents(100.5)).toBe(10050);
    expect(safeCurrencyToCents('0')).toBe(0);
  });

  it('returns 0 for invalid inputs (silent failure)', () => {
    expect(safeCurrencyToCents('abc')).toBe(0);
    expect(safeCurrencyToCents(Infinity)).toBe(0);
    expect(safeCurrencyToCents(null)).toBe(0);
    expect(safeCurrencyToCents(undefined)).toBe(0);
    expect(safeCurrencyToCents('')).toBe(0);
  });
});

describe('strictCurrencyToCents', () => {
  it('converts valid inputs', () => {
    expect(strictCurrencyToCents('$1,234.56', 'wages')).toBe(123456);
    expect(strictCurrencyToCents(100.5, 'interest')).toBe(10050);
  });

  it('throws on invalid inputs', () => {
    expect(() => strictCurrencyToCents('abc', 'wages')).toThrow();
    expect(() => strictCurrencyToCents(Infinity, 'wages')).toThrow();
    expect(() => strictCurrencyToCents('', 'wages')).toThrow(); // Empty not allowed
  });

  it('throws on negative values', () => {
    expect(() => strictCurrencyToCents(-100, 'amount')).toThrow(/Negative/);
  });
});

describe('basic conversion functions', () => {
  it('dollarsToCents converts correctly', () => {
    expect(dollarsToCents(1)).toBe(100);
    expect(dollarsToCents(1.5)).toBe(150);
    expect(dollarsToCents(0.99)).toBe(99);
    expect(dollarsToCents(1234.56)).toBe(123456);
  });

  it('centsToDollars converts correctly', () => {
    expect(centsToDollars(100)).toBe(1);
    expect(centsToDollars(150)).toBe(1.5);
    expect(centsToDollars(99)).toBe(0.99);
    expect(centsToDollars(123456)).toBe(1234.56);
  });

  it('round-trips correctly', () => {
    const dollars = 1234.56;
    const cents = dollarsToCents(dollars);
    const backToDollars = centsToDollars(cents);
    expect(backToDollars).toBe(dollars);
  });
});
