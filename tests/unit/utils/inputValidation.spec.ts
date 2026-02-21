import { describe, it, expect } from 'vitest';
import {
  validateIncomeData,
  validateDeductionsData,
  validatePaymentsData,
  validateFullForm,
  formatValidationErrors,
  hasValidationErrors,
  getFieldErrors,
  hasFieldError,
} from '../../../src/utils/inputValidation';

describe('validateIncomeData', () => {
  it('validates and converts valid income data', () => {
    const result = validateIncomeData({
      wages: '$50,000',
      interestIncome: '1,200.50',
      dividends: 500,
      qualifiedDividends: '300',
      capitalGains: '2,500',
      netShortTermCapitalGain: '-500',
      netLongTermCapitalGain: '3,000',
      otherIncome: '100',
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data.wages).toBe(5000000); // $50,000 = 5,000,000 cents
    expect(result.data.interestIncome).toBe(120050);
    expect(result.data.dividends).toBe(50000);
    expect(result.data.netShortTermCapitalGain).toBe(-50000); // Negative allowed
  });

  it('handles empty/undefined fields as $0', () => {
    const result = validateIncomeData({
      wages: '',
      interestIncome: undefined,
      dividends: null,
    });

    expect(result.valid).toBe(true);
    expect(result.data.wages).toBe(0);
    expect(result.data.interestIncome).toBe(0);
    expect(result.data.dividends).toBe(0);
    expect(result.warnings.some((w) => w.code === 'EMPTY_FIELD')).toBe(true);
  });

  it('returns errors for invalid currency values', () => {
    const result = validateIncomeData({
      wages: 'not a number',
      interestIncome: '1,200.50',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('income.wages');
    expect(result.errors[0].code).toBe('INVALID_CURRENCY');
    expect(result.data.wages).toBe(0); // Default for error
    expect(result.data.interestIncome).toBe(120050); // Other fields still converted
  });

  it('rejects negative values for non-loss fields', () => {
    const result = validateIncomeData({
      wages: '-5000', // Wages cannot be negative
      dividends: '-100', // Dividends cannot be negative
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(
      result.errors.some((e) => e.field === 'income.wages' && e.code === 'NEGATIVE_NOT_ALLOWED')
    ).toBe(true);
    expect(
      result.errors.some((e) => e.field === 'income.dividends' && e.code === 'NEGATIVE_NOT_ALLOWED')
    ).toBe(true);
  });

  it('allows negative values for capital gains', () => {
    const result = validateIncomeData({
      capitalGains: '-5000',
      netShortTermCapitalGain: '-3000',
      netLongTermCapitalGain: '-2000',
    });

    expect(result.valid).toBe(true);
    expect(result.data.capitalGains).toBe(-500000);
    expect(result.data.netShortTermCapitalGain).toBe(-300000);
    expect(result.data.netLongTermCapitalGain).toBe(-200000);
  });

  it('warns on partial parse', () => {
    const result = validateIncomeData({
      wages: '50000abc',
    });

    expect(result.valid).toBe(true);
    expect(result.data.wages).toBe(5000000);
    expect(result.warnings.some((w) => w.code === 'PARTIAL_PARSE')).toBe(true);
  });
});

describe('validateDeductionsData', () => {
  it('validates and converts valid deductions data', () => {
    const result = validateDeductionsData({
      stateLocalTaxes: '10,000',
      mortgageInterest: '12,000',
      charitable: '5,000',
      medical: '3,000',
      other: '500',
      studentLoanInterest: '2,500',
      hsaContribution: '3,650',
      iraContribution: '6,500',
    });

    expect(result.valid).toBe(true);
    expect(result.data.stateLocalTaxes).toBe(1000000);
    expect(result.data.mortgageInterest).toBe(1200000);
    expect(result.data.charitable).toBe(500000);
    expect(result.data.studentLoanInterest).toBe(250000);
  });

  it('handles field name variations', () => {
    // Test deprecated field names
    const result = validateDeductionsData({
      stateTaxesPaid: '10,000', // deprecated name
      charitableDonations: '5,000', // deprecated name
      medicalExpenses: '3,000', // alternate name
      otherItemized: '500', // alternate name
    });

    expect(result.valid).toBe(true);
    expect(result.data.stateLocalTaxes).toBe(1000000);
    expect(result.data.charitable).toBe(500000);
    expect(result.data.medical).toBe(300000);
    expect(result.data.other).toBe(50000);
    expect(result.warnings.some((w) => w.code === 'DEPRECATED_FIELD')).toBe(true);
  });

  it('handles itemizedTotal override', () => {
    const result = validateDeductionsData({
      itemizedTotal: 25000, // $25,000 total override
      stateLocalTaxes: '10,000',
    });

    expect(result.valid).toBe(true);
    expect(result.data.itemizedTotal).toBe(2500000);
    expect(result.data.stateLocalTaxes).toBe(1000000); // Still parsed
  });

  it('handles forceItemized flag', () => {
    const result1 = validateDeductionsData({ forceItemized: true });
    expect(result1.data.forceItemized).toBe(true);

    const result2 = validateDeductionsData({ itemizeDeductions: true });
    expect(result2.data.forceItemized).toBe(true);

    const result3 = validateDeductionsData({});
    expect(result3.data.forceItemized).toBe(false);
  });
});

describe('validatePaymentsData', () => {
  it('validates and converts valid payments data', () => {
    const result = validatePaymentsData({
      federalWithholding: '$8,000',
      stateWithholding: '$2,000',
      estimatedTaxPayments: '4,000',
      otherPayments: '500',
    });

    expect(result.valid).toBe(true);
    expect(result.data.federalWithholding).toBe(800000);
    expect(result.data.stateWithholding).toBe(200000);
    expect(result.data.estimatedTaxPayments).toBe(400000);
    expect(result.data.otherPayments).toBe(50000);
  });

  it('handles empty payments as $0', () => {
    const result = validatePaymentsData({});

    expect(result.valid).toBe(true);
    expect(result.data.federalWithholding).toBe(0);
    expect(result.data.stateWithholding).toBe(0);
    expect(result.data.estimatedTaxPayments).toBe(0);
    expect(result.data.otherPayments).toBe(0);
  });
});

describe('validateFullForm', () => {
  it('validates all sections and aggregates errors', () => {
    const result = validateFullForm(
      { wages: 'invalid', interestIncome: '1,000' },
      { stateLocalTaxes: 'bad', mortgageInterest: '5,000' },
      { federalWithholding: '3,000' }
    );

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2); // Two invalid fields
    expect(result.errors.some((e) => e.field === 'income.wages')).toBe(true);
    expect(result.errors.some((e) => e.field === 'deductions.stateLocalTaxes')).toBe(true);

    // Valid fields should still be converted
    expect(result.income.interestIncome).toBe(100000);
    expect(result.deductions.mortgageInterest).toBe(500000);
    expect(result.payments.federalWithholding).toBe(300000);
  });

  it('passes when all data is valid', () => {
    const result = validateFullForm(
      { wages: '50,000' },
      { mortgageInterest: '10,000' },
      { federalWithholding: '8,000' }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('utility functions', () => {
  it('formatValidationErrors creates readable messages', () => {
    const errors = [
      {
        field: 'income.wages',
        message: 'Cannot parse "abc" as currency',
        code: 'INVALID_CURRENCY' as const,
      },
      {
        field: 'deductions.medical',
        message: 'Negative not allowed',
        code: 'NEGATIVE_NOT_ALLOWED' as const,
      },
    ];

    const formatted = formatValidationErrors(errors);

    expect(formatted).toHaveLength(2);
    expect(formatted[0]).toContain('Wages/Salary');
    expect(formatted[1]).toContain('Medical Expenses');
  });

  it('hasValidationErrors detects errors', () => {
    expect(hasValidationErrors({ errors: [] })).toBe(false);
    expect(
      hasValidationErrors({
        errors: [{ field: 'x', message: 'y', code: 'INVALID_CURRENCY' as const }],
      })
    ).toBe(true);
  });

  it('getFieldErrors filters by field', () => {
    const errors = [
      { field: 'income.wages', message: 'Error 1', code: 'INVALID_CURRENCY' as const },
      { field: 'income.wages', message: 'Error 2', code: 'NEGATIVE_NOT_ALLOWED' as const },
      { field: 'deductions.medical', message: 'Error 3', code: 'INVALID_CURRENCY' as const },
    ];

    const wageErrors = getFieldErrors(errors, 'income.wages');
    expect(wageErrors).toHaveLength(2);
  });

  it('hasFieldError checks specific field', () => {
    const errors = [{ field: 'income.wages', message: 'Error', code: 'INVALID_CURRENCY' as const }];

    expect(hasFieldError(errors, 'income.wages')).toBe(true);
    expect(hasFieldError(errors, 'income.dividends')).toBe(false);
  });
});
