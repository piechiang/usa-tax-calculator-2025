/**
 * Tests for Enhanced Input Validation
 * Multi-field consistency checks and logical validation
 */

import { describe, it, expect } from 'vitest';
import { TaxInputValidator } from '../../../src/engine/validation/inputValidation';

describe('Enhanced Input Validation', () => {
  describe('Dependents Consistency', () => {
    it('should detect when qualifyingChildren exceed dependents count', () => {
      const input: any = {
        filingStatus: 'single',
        dependents: 1,
        qualifyingChildren: [
          { birthDate: '2020-01-01', relationship: 'son', monthsLivedWithTaxpayer: 12 },
          { birthDate: '2021-01-01', relationship: 'daughter', monthsLivedWithTaxpayer: 12 },
        ],
      };

      const error = TaxInputValidator.validateDependentsConsistency(input);
      expect(error).not.toBeNull();
      expect(error).toContain('exceeds total dependents');
    });

    it('should pass when qualifyingChildren match dependents', () => {
      const input: any = {
        filingStatus: 'single',
        dependents: 2,
        qualifyingChildren: [
          { birthDate: '2020-01-01', relationship: 'son', monthsLivedWithTaxpayer: 12 },
          { birthDate: '2021-01-01', relationship: 'daughter', monthsLivedWithTaxpayer: 12 },
        ],
      };

      const error = TaxInputValidator.validateDependentsConsistency(input);
      expect(error).toBeNull();
    });
  });

  describe('Single Filing Status', () => {
    it('should detect spouse information for single filer', () => {
      const input: any = {
        filingStatus: 'single',
        spouse: { firstName: 'Jane', lastName: 'Doe' },
      };

      const error = TaxInputValidator.validateSingleFilingStatus(input);
      expect(error).not.toBeNull();
      expect(error).toContain('Single filing status should not have spouse');
    });

    it('should pass when single filer has no spouse info', () => {
      const input: any = {
        filingStatus: 'single',
      };

      const error = TaxInputValidator.validateSingleFilingStatus(input);
      expect(error).toBeNull();
    });
  });

  describe('Withholding Reasonableness', () => {
    it('should warn when withholding exceeds wages significantly', () => {
      const input: any = {
        income: { wages: 50_000_00 }, // $50k wages
        payments: { federalWithheld: 100_000_00 }, // $100k withheld
      };

      const warning = TaxInputValidator.validateWithholdingReasonableness(input);
      expect(warning).not.toBeNull();
      expect(warning).toContain('unusually high');
    });

    it('should pass when withholding is reasonable', () => {
      const input: any = {
        income: { wages: 50_000_00 },
        payments: { federalWithheld: 10_000_00 }, // 20% withholding
      };

      const warning = TaxInputValidator.validateWithholdingReasonableness(input);
      expect(warning).toBeNull();
    });
  });

  describe('Education Expenses Consistency', () => {
    it('should warn when multiple education expenses but no dependents', () => {
      const input: any = {
        dependents: 0,
        qualifyingChildren: [],
        educationExpenses: [
          { studentName: 'Student 1', tuitionAndFees: 5000 },
          { studentName: 'Student 2', tuitionAndFees: 5000 },
          { studentName: 'Student 3', tuitionAndFees: 5000 },
        ],
      };

      const warning = TaxInputValidator.validateEducationExpensesConsistency(input);
      expect(warning).not.toBeNull();
      expect(warning).toContain('no dependents listed');
    });

    it('should pass when education expenses align with dependents', () => {
      const input: any = {
        dependents: 2,
        qualifyingChildren: [
          { birthDate: '2005-01-01', relationship: 'son', monthsLivedWithTaxpayer: 12 },
        ],
        educationExpenses: [{ studentName: 'Student 1', tuitionAndFees: 5000 }],
      };

      const warning = TaxInputValidator.validateEducationExpensesConsistency(input);
      expect(warning).toBeNull();
    });
  });

  describe('Negative Income Validation', () => {
    it('should warn on large business loss', () => {
      const input: any = {
        income: { scheduleCNet: -60_000_00 }, // -$60k loss
      };

      const warnings = TaxInputValidator.validateNegativeIncome(input);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('business loss');
    });

    it('should warn on capital losses exceeding deduction limit', () => {
      const input: any = {
        income: { capGainsNet: -5_000_00 }, // -$5k capital loss
      };

      const warnings = TaxInputValidator.validateNegativeIncome(input);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('Capital losses exceed');
    });

    it('should pass with reasonable negative income', () => {
      const input: any = {
        income: { scheduleCNet: -10_000_00, capGainsNet: -2_000_00 },
      };

      const warnings = TaxInputValidator.validateNegativeIncome(input);
      expect(warnings.length).toBe(0);
    });
  });

  describe('QBI Consistency', () => {
    it('should warn when QBI businesses exist but no Schedule C income', () => {
      const input: any = {
        income: { scheduleCNet: 0 },
        qbiBusinesses: [{ businessName: 'Test LLC', qbi: 50_000_00, w2Wages: 0, ubia: 0 }],
      };

      const warning = TaxInputValidator.validateQBIConsistency(input);
      expect(warning).not.toBeNull();
      expect(warning).toContain('no Schedule C income');
    });

    it('should pass when QBI aligns with Schedule C', () => {
      const input: any = {
        income: { scheduleCNet: 50_000_00 },
        qbiBusinesses: [{ businessName: 'Test LLC', qbi: 40_000_00, w2Wages: 0, ubia: 0 }],
      };

      const warning = TaxInputValidator.validateQBIConsistency(input);
      expect(warning).toBeNull();
    });
  });

  describe('Itemized Deductions Reasonableness', () => {
    it('should warn when SALT exceeds cap', () => {
      const input: any = {
        income: { wages: 100_000_00 },
        itemized: { stateLocalTaxes: 15_000_00 }, // Over $10k cap
      };

      const warnings = TaxInputValidator.validateItemizedDeductionsReasonableness(input);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.includes('exceed the $10,000 cap'))).toBe(true);
    });

    it('should warn when charitable donations exceed 60% AGI', () => {
      const input: any = {
        income: { wages: 100_000_00, interest: 0, dividends: { ordinary: 0 } },
        itemized: { charitable: 70_000_00 }, // 70% of wages
      };

      const warnings = TaxInputValidator.validateItemizedDeductionsReasonableness(input);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.includes('60% of AGI'))).toBe(true);
    });

    it('should pass with reasonable itemized deductions', () => {
      const input: any = {
        income: { wages: 100_000_00, interest: 0, dividends: { ordinary: 0 } },
        itemized: {
          stateLocalTaxes: 9_000_00,
          charitable: 20_000_00,
          mortgageInterest: 15_000_00,
        },
      };

      const warnings = TaxInputValidator.validateItemizedDeductionsReasonableness(input);
      // May have informational warnings but no errors
      expect(warnings.every((w) => !w.includes('exceed'))).toBe(true);
    });
  });
});
