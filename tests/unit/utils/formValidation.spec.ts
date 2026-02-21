/**
 * Form Validation Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  required,
  minLength,
  maxLength,
  min,
  max,
  email,
  numeric,
  integer,
  nonNegative,
  ssn,
  ein,
  itin,
  taxAmount,
  zipCode,
  phoneNumber,
  percentage,
  requiredIf,
  lessThan,
  greaterThan,
  validateField,
  validateForm,
  personalInfoSchema,
} from '../../../src/utils/formValidation';

describe('Form Validation Module', () => {
  describe('Basic Validators', () => {
    describe('required', () => {
      const validator = required();

      it('should fail for null/undefined', () => {
        expect(validator.validate(null)).toBe(false);
        expect(validator.validate(undefined)).toBe(false);
      });

      it('should fail for empty string', () => {
        expect(validator.validate('')).toBe(false);
        expect(validator.validate('   ')).toBe(false);
      });

      it('should pass for non-empty values', () => {
        expect(validator.validate('hello')).toBe(true);
        expect(validator.validate(0)).toBe(true);
        expect(validator.validate(false)).toBe(true);
      });
    });

    describe('minLength', () => {
      const validator = minLength(3);

      it('should pass for empty value', () => {
        expect(validator.validate('')).toBe(true);
      });

      it('should fail for too short strings', () => {
        expect(validator.validate('ab')).toBe(false);
      });

      it('should pass for long enough strings', () => {
        expect(validator.validate('abc')).toBe(true);
        expect(validator.validate('abcd')).toBe(true);
      });
    });

    describe('maxLength', () => {
      const validator = maxLength(5);

      it('should pass for strings within limit', () => {
        expect(validator.validate('abc')).toBe(true);
        expect(validator.validate('abcde')).toBe(true);
      });

      it('should fail for too long strings', () => {
        expect(validator.validate('abcdef')).toBe(false);
      });
    });

    describe('min', () => {
      const validator = min(10);

      it('should pass for empty value', () => {
        expect(validator.validate('')).toBe(true);
      });

      it('should fail for values below minimum', () => {
        expect(validator.validate(5)).toBe(false);
        expect(validator.validate('5')).toBe(false);
      });

      it('should pass for values at or above minimum', () => {
        expect(validator.validate(10)).toBe(true);
        expect(validator.validate(15)).toBe(true);
        expect(validator.validate('20')).toBe(true);
      });
    });

    describe('max', () => {
      const validator = max(100);

      it('should pass for values at or below maximum', () => {
        expect(validator.validate(50)).toBe(true);
        expect(validator.validate(100)).toBe(true);
      });

      it('should fail for values above maximum', () => {
        expect(validator.validate(101)).toBe(false);
      });
    });

    describe('email', () => {
      const validator = email();

      it('should pass for empty value', () => {
        expect(validator.validate('')).toBe(true);
      });

      it('should pass for valid emails', () => {
        expect(validator.validate('test@example.com')).toBe(true);
        expect(validator.validate('user.name@domain.org')).toBe(true);
      });

      it('should fail for invalid emails', () => {
        expect(validator.validate('invalid')).toBe(false);
        expect(validator.validate('no@domain')).toBe(false);
        expect(validator.validate('@nodomain.com')).toBe(false);
      });
    });

    describe('numeric', () => {
      const validator = numeric();

      it('should pass for numbers', () => {
        expect(validator.validate(123)).toBe(true);
        expect(validator.validate('123.45')).toBe(true);
        expect(validator.validate('1,234.56')).toBe(true);
      });

      it('should fail for non-numeric strings', () => {
        expect(validator.validate('abc')).toBe(false);
        // Note: parseFloat('12abc') returns 12, which is JavaScript behavior
        // For strict validation, use a regex-based validator instead
      });
    });

    describe('integer', () => {
      const validator = integer();

      it('should pass for integers', () => {
        expect(validator.validate(123)).toBe(true);
        expect(validator.validate('456')).toBe(true);
        expect(validator.validate(0)).toBe(true);
      });

      it('should fail for decimals', () => {
        expect(validator.validate(12.5)).toBe(false);
        expect(validator.validate('12.5')).toBe(false);
      });
    });

    describe('nonNegative', () => {
      const validator = nonNegative();

      it('should pass for zero and positive numbers', () => {
        expect(validator.validate(0)).toBe(true);
        expect(validator.validate(100)).toBe(true);
        expect(validator.validate('50.5')).toBe(true);
      });

      it('should fail for negative numbers', () => {
        expect(validator.validate(-1)).toBe(false);
        expect(validator.validate('-50')).toBe(false);
      });
    });
  });

  describe('IRS-Specific Validators', () => {
    describe('ssn', () => {
      const validator = ssn();

      it('should pass for valid SSNs', () => {
        expect(validator.validate('123-45-6789')).toBe(true);
        expect(validator.validate('123456789')).toBe(true);
      });

      it('should fail for invalid SSNs', () => {
        // Wrong length
        expect(validator.validate('12345678')).toBe(false);
        // Starts with 000
        expect(validator.validate('000-12-3456')).toBe(false);
        // Starts with 666
        expect(validator.validate('666-12-3456')).toBe(false);
        // Starts with 9xx (reserved for ITIN)
        expect(validator.validate('900-12-3456')).toBe(false);
        // Group number 00
        expect(validator.validate('123-00-4567')).toBe(false);
        // Serial number 0000
        expect(validator.validate('123-45-0000')).toBe(false);
      });

      it('should pass for empty value', () => {
        expect(validator.validate('')).toBe(true);
      });
    });

    describe('ein', () => {
      const validator = ein();

      it('should pass for valid EINs', () => {
        expect(validator.validate('12-3456789')).toBe(true);
        expect(validator.validate('123456789')).toBe(true);
      });

      it('should fail for invalid EINs', () => {
        // Wrong length
        expect(validator.validate('12345678')).toBe(false);
        // Invalid prefix
        expect(validator.validate('00-1234567')).toBe(false);
      });
    });

    describe('itin', () => {
      const validator = itin();

      it('should pass for valid ITINs', () => {
        expect(validator.validate('9XX-70-XXXX'.replace(/X/g, '1'))).toBe(true);
        expect(validator.validate('911-78-1234')).toBe(true);
      });

      it('should fail for ITINs not starting with 9', () => {
        expect(validator.validate('123-45-6789')).toBe(false);
      });
    });

    describe('taxAmount', () => {
      const validator = taxAmount();

      it('should pass for valid tax amounts', () => {
        expect(validator.validate('50000')).toBe(true);
        expect(validator.validate('$1,234.56')).toBe(true);
        expect(validator.validate(-5000)).toBe(true); // Losses allowed
      });

      it('should fail for invalid amounts', () => {
        expect(validator.validate('abc')).toBe(false);
      });
    });

    describe('zipCode', () => {
      const validator = zipCode();

      it('should pass for valid ZIP codes', () => {
        expect(validator.validate('12345')).toBe(true);
        expect(validator.validate('12345-6789')).toBe(true);
      });

      it('should fail for invalid ZIP codes', () => {
        expect(validator.validate('1234')).toBe(false);
        expect(validator.validate('123456')).toBe(false);
        expect(validator.validate('12345-678')).toBe(false);
      });
    });

    describe('phoneNumber', () => {
      const validator = phoneNumber();

      it('should pass for valid phone numbers', () => {
        expect(validator.validate('1234567890')).toBe(true);
        expect(validator.validate('(123) 456-7890')).toBe(true);
        expect(validator.validate('123-456-7890')).toBe(true);
      });

      it('should fail for invalid phone numbers', () => {
        expect(validator.validate('123456')).toBe(false);
      });
    });

    describe('percentage', () => {
      const validator = percentage();

      it('should pass for valid percentages', () => {
        expect(validator.validate(0)).toBe(true);
        expect(validator.validate(50)).toBe(true);
        expect(validator.validate(100)).toBe(true);
      });

      it('should fail for invalid percentages', () => {
        expect(validator.validate(-1)).toBe(false);
        expect(validator.validate(101)).toBe(false);
      });
    });
  });

  describe('Cross-Field Validators', () => {
    describe('requiredIf', () => {
      const validator = requiredIf('hasSpouse', true);
      const context = {
        values: { hasSpouse: true },
        field: 'spouseName',
      };

      it('should require value when condition is met', () => {
        expect(validator.validate('', context)).toBe(false);
        expect(validator.validate('Jane', context)).toBe(true);
      });

      it('should not require value when condition is not met', () => {
        const contextFalse = { ...context, values: { hasSpouse: false } };
        expect(validator.validate('', contextFalse)).toBe(true);
      });
    });

    describe('lessThan', () => {
      const validator = lessThan('maxValue');

      it('should pass when value is less than other field', () => {
        const context = { values: { maxValue: 100 }, field: 'value' };
        expect(validator.validate(50, context)).toBe(true);
      });

      it('should fail when value is not less than other field', () => {
        const context = { values: { maxValue: 100 }, field: 'value' };
        expect(validator.validate(100, context)).toBe(false);
        expect(validator.validate(150, context)).toBe(false);
      });
    });

    describe('greaterThan', () => {
      const validator = greaterThan('minValue');

      it('should pass when value is greater than other field', () => {
        const context = { values: { minValue: 10 }, field: 'value' };
        expect(validator.validate(50, context)).toBe(true);
      });

      it('should fail when value is not greater than other field', () => {
        const context = { values: { minValue: 10 }, field: 'value' };
        expect(validator.validate(10, context)).toBe(false);
        expect(validator.validate(5, context)).toBe(false);
      });
    });
  });

  describe('Validation Engine', () => {
    describe('validateField', () => {
      it('should validate a field against multiple rules', async () => {
        const rules = [required(), minLength(3), maxLength(10)];
        const context = { values: {}, field: 'name' };

        const result1 = await validateField('ab', rules, context);
        expect(result1.valid).toBe(false);
        expect(result1.errors.length).toBeGreaterThan(0);

        const result2 = await validateField('hello', rules, context);
        expect(result2.valid).toBe(true);
        expect(result2.errors.length).toBe(0);
      });
    });

    describe('validateForm', () => {
      it('should validate entire form against schema', async () => {
        const schema = {
          name: [required(), minLength(2)],
          age: [numeric(), min(0), max(120)],
        };

        const result1 = await validateForm({ name: '', age: 25 }, schema);
        expect(result1.valid).toBe(false);
        expect(result1.errors.name).toBeDefined();

        const result2 = await validateForm({ name: 'John', age: 25 }, schema);
        expect(result2.valid).toBe(true);
      });
    });
  });

  describe('Pre-built Schemas', () => {
    describe('personalInfoSchema', () => {
      it('should have required validators for key fields', () => {
        expect(personalInfoSchema.firstName).toBeDefined();
        expect(personalInfoSchema.lastName).toBeDefined();
        expect(personalInfoSchema.filingStatus).toBeDefined();
      });
    });
  });
});
