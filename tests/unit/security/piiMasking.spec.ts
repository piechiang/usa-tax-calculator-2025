/**
 * PII Masking Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  maskSSN,
  fullMaskSSN,
  isValidSSN,
  maskEmail,
  maskPhone,
  maskAccountNumber,
  maskRoutingNumber,
  maskName,
  maskAddress,
  isPIIField,
  redactPII,
  createDisplaySafeSnapshot,
} from '../../../src/utils/piiMasking';

describe('PII Masking Utilities', () => {
  describe('maskSSN', () => {
    it('should mask SSN with dashes showing last 4', () => {
      expect(maskSSN('123-45-6789')).toBe('***-**-6789');
    });

    it('should mask SSN without dashes showing last 4', () => {
      expect(maskSSN('123456789')).toBe('***-**-6789');
    });

    it('should handle null/undefined', () => {
      expect(maskSSN(null)).toBe('***-**-****');
      expect(maskSSN(undefined)).toBe('***-**-****');
    });

    it('should handle invalid SSN length', () => {
      expect(maskSSN('12345')).toBe('***-**-****');
      expect(maskSSN('12345678901')).toBe('***-**-****');
    });
  });

  describe('fullMaskSSN', () => {
    it('should fully mask any SSN', () => {
      expect(fullMaskSSN('123-45-6789')).toBe('***-**-****');
      expect(fullMaskSSN('123456789')).toBe('***-**-****');
    });
  });

  describe('isValidSSN', () => {
    it('should validate correct SSN formats', () => {
      expect(isValidSSN('123-45-6789')).toBe(true);
      expect(isValidSSN('123456789')).toBe(true);
    });

    it('should reject invalid SSN formats', () => {
      expect(isValidSSN('12-345-6789')).toBe(false);
      expect(isValidSSN('123-456-789')).toBe(false);
      expect(isValidSSN('12345678')).toBe(false);
      expect(isValidSSN(null)).toBe(false);
      expect(isValidSSN(undefined)).toBe(false);
    });
  });

  describe('maskEmail', () => {
    it('should mask email address', () => {
      expect(maskEmail('john.doe@example.com')).toBe('j***@e***.com');
    });

    it('should handle null/undefined', () => {
      expect(maskEmail(null)).toBe('***@***.***');
      expect(maskEmail(undefined)).toBe('***@***.***');
    });

    it('should handle invalid email', () => {
      expect(maskEmail('invalid')).toBe('***@***.***');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number showing last 4', () => {
      expect(maskPhone('(555) 123-4567')).toBe('(***) ***-4567');
      expect(maskPhone('555-123-4567')).toBe('(***) ***-4567');
      expect(maskPhone('5551234567')).toBe('(***) ***-4567');
    });

    it('should handle null/undefined', () => {
      expect(maskPhone(null)).toBe('(***) ***-****');
      expect(maskPhone(undefined)).toBe('(***) ***-****');
    });
  });

  describe('maskAccountNumber', () => {
    it('should mask account number showing last 4', () => {
      expect(maskAccountNumber('123456789012')).toBe('********9012');
    });

    it('should handle short account numbers', () => {
      expect(maskAccountNumber('1234')).toBe('1234');
      expect(maskAccountNumber('123')).toBe('123');
    });

    it('should handle null/undefined', () => {
      expect(maskAccountNumber(null)).toBe('****');
      expect(maskAccountNumber(undefined)).toBe('****');
    });
  });

  describe('maskRoutingNumber', () => {
    it('should mask routing number showing first 2 and last 2', () => {
      expect(maskRoutingNumber('123456789')).toBe('12***89');
    });

    it('should handle null/undefined', () => {
      expect(maskRoutingNumber(null)).toBe('*********');
      expect(maskRoutingNumber(undefined)).toBe('*********');
    });
  });

  describe('maskName', () => {
    it('should mask name showing first initial', () => {
      expect(maskName('John')).toBe('J***');
      expect(maskName('Jane Doe')).toBe('J***');
    });

    it('should handle null/undefined', () => {
      expect(maskName(null)).toBe('***');
      expect(maskName(undefined)).toBe('***');
    });
  });

  describe('maskAddress', () => {
    it('should mask address keeping city/state/zip', () => {
      const result = maskAddress('123 Main St, Anytown, CA 90210');
      expect(result).toContain('Anytown');
      expect(result).toContain('CA 90210');
      expect(result).not.toContain('123 Main St');
    });

    it('should handle null/undefined', () => {
      expect(maskAddress(null)).toBe('*** (Address on file)');
      expect(maskAddress(undefined)).toBe('*** (Address on file)');
    });
  });

  describe('isPIIField', () => {
    it('should identify SSN-related fields', () => {
      expect(isPIIField('ssn')).toBe(true);
      expect(isPIIField('SSN')).toBe(true);
      expect(isPIIField('socialSecurityNumber')).toBe(true);
      expect(isPIIField('social_security')).toBe(true);
    });

    it('should identify other PII fields', () => {
      expect(isPIIField('taxId')).toBe(true);
      expect(isPIIField('ein')).toBe(true);
      expect(isPIIField('accountNumber')).toBe(true);
      expect(isPIIField('routingNumber')).toBe(true);
      expect(isPIIField('creditCard')).toBe(true);
      expect(isPIIField('password')).toBe(true);
      expect(isPIIField('dateOfBirth')).toBe(true);
      expect(isPIIField('driverLicense')).toBe(true);
    });

    it('should not flag non-PII fields', () => {
      expect(isPIIField('firstName')).toBe(false);
      expect(isPIIField('wages')).toBe(false);
      expect(isPIIField('deductions')).toBe(false);
    });
  });

  describe('redactPII', () => {
    it('should redact SSN fields in nested objects', () => {
      const input = {
        personalInfo: {
          name: 'John Doe',
          ssn: '123-45-6789',
        },
        spouseInfo: {
          name: 'Jane Doe',
          ssn: '987-65-4321',
        },
      };

      const result = redactPII(input);

      expect(result.personalInfo.ssn).toBe('***-**-****');
      expect(result.spouseInfo.ssn).toBe('***-**-****');
      expect(result.personalInfo.name).toBe('John Doe'); // Non-PII preserved
    });

    it('should redact email fields', () => {
      const input = { contactEmail: 'test@example.com' };
      const result = redactPII(input);
      expect(result.contactEmail).toBe('t***@e***.com');
    });
  });

  describe('createDisplaySafeSnapshot', () => {
    it('should mask only SSN fields for display', () => {
      const snapshot = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          ssn: '123-45-6789',
        },
        incomeData: {
          wages: '50000',
        },
      };

      const result = createDisplaySafeSnapshot(snapshot);

      expect(result.personalInfo.firstName).toBe('John');
      expect(result.personalInfo.lastName).toBe('Doe');
      expect(result.personalInfo.ssn).toBe('***-**-6789'); // Masked, showing last 4
      expect(result.incomeData.wages).toBe('50000'); // Income preserved
    });
  });
});
