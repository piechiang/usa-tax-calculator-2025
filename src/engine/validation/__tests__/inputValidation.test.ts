import { describe, it, expect } from 'vitest';
import {
  validateTaxInput,
  validateTaxInputComprehensive,
  TaxInputValidator,
} from '../inputValidation';
import type { TaxPayerInput } from '../../types';

describe('Tax Input Validation', () => {
  describe('Basic Schema Validation', () => {
    it('should accept valid single filer input', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
        },
        income: {
          wages: 50000,
        },
        payments: {
          federalWithheld: 5000,
        },
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject negative wages', () => {
      const input = {
        filingStatus: 'single',
        income: {
          wages: -1000, // Invalid: negative
        },
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('non-negative');
    });

    it('should reject invalid filing status', () => {
      const input = {
        filingStatus: 'invalid_status',
        income: {},
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(false);
    });

    it('should accept negative capital gains (losses)', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        income: {
          wages: 50000,
          capGains: -3000, // Capital loss
        },
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(true);
    });

    it('should reject excessive student loan interest deduction', () => {
      const input = {
        filingStatus: 'single',
        adjustments: {
          studentLoanInterest: 3000, // Over $2,500 limit
        },
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(false);
      expect(result.errors![0].message).toContain('2500');
    });

    it('should validate birth date format', () => {
      const input = {
        filingStatus: 'single',
        primary: {
          birthDate: '01/01/1990', // Wrong format
        },
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(false);
      expect(result.errors![0].message).toContain('YYYY-MM-DD');
    });
  });

  describe('Custom Validation Rules', () => {
    it('should require spouse info for married filing jointly', () => {
      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        income: {
          wages: 50000,
        },
      };

      const error = TaxInputValidator.validateMarriedJointly(input);
      expect(error).toBeTruthy();
      expect(error).toContain('spouse');
    });

    it('should accept MFJ with spouse info', () => {
      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        spouse: {
          firstName: 'Jane',
          lastName: 'Doe',
        },
        income: {},
      };

      const error = TaxInputValidator.validateMarriedJointly(input);
      expect(error).toBeNull();
    });

    it('should require dependents for head of household', () => {
      const input: TaxPayerInput = {
        filingStatus: 'headOfHousehold',
        income: {
          wages: 50000,
        },
      };

      const error = TaxInputValidator.validateHeadOfHousehold(input);
      expect(error).toBeTruthy();
      expect(error).toContain('qualifying person');
    });

    it('should warn about children over 17', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        qualifyingChildren: [
          {
            name: 'Adult Child',
            birthDate: '2000-01-01', // 25 years old in 2025
            relationship: 'son',
            monthsLivedWithTaxpayer: 12,
          },
        ],
        income: {},
      };

      const warnings = TaxInputValidator.validateQualifyingChildrenAges(input);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('17');
    });

    it('should not warn about children under 17', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        qualifyingChildren: [
          {
            name: 'Young Child',
            birthDate: '2015-01-01', // 10 years old in 2025
            relationship: 'daughter',
            monthsLivedWithTaxpayer: 12,
          },
        ],
        income: {},
      };

      const warnings = TaxInputValidator.validateQualifyingChildrenAges(input);
      expect(warnings.length).toBe(0);
    });
  });

  describe('Comprehensive Validation', () => {
    it('should pass valid complete input', () => {
      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {
          birthDate: '1985-06-15',
        },
        spouse: {
          firstName: 'Jane',
          lastName: 'Doe',
          birthDate: '1987-03-20',
        },
        qualifyingChildren: [
          {
            name: 'Child Doe',
            birthDate: '2015-08-10',
            relationship: 'son',
            monthsLivedWithTaxpayer: 12,
          },
        ],
        income: {
          wages: 95000,
          interest: 800,
        },
        adjustments: {
          iraDeduction: 6000,
        },
        payments: {
          federalWithheld: 10000,
        },
      };

      const result = validateTaxInputComprehensive(input);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing spouse in MFJ', () => {
      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        income: {
          wages: 50000,
        },
      };

      const result = validateTaxInputComprehensive(input);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('spouse');
    });

    it('should return warnings for non-blocking issues', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        qualifyingChildren: [
          {
            name: 'Older Child',
            birthDate: '2005-01-01', // 20 years old
            relationship: 'son',
            monthsLivedWithTaxpayer: 12,
          },
        ],
        income: {
          wages: 50000,
        },
      };

      const result = validateTaxInputComprehensive(input);
      expect(result.success).toBe(true); // No blocking errors
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('may not qualify');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty income object', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        income: {},
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(true);
    });

    it('should reject unknown properties in strict mode', () => {
      const input = {
        filingStatus: 'single',
        unknownProperty: 'should fail',
        income: {},
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(false);
    });

    it('should handle multiple education expenses', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        educationExpenses: [
          {
            studentName: 'Student 1',
            institutionName: 'University A',
            tuitionAndFees: 10000,
            isEligibleInstitution: true,
          },
          {
            studentName: 'Student 2',
            institutionName: 'College B',
            tuitionAndFees: 5000,
            isEligibleInstitution: true,
          },
        ],
        income: {},
      };

      const result = validateTaxInput(input);
      expect(result.success).toBe(true);
    });
  });
});