/**
 * Texas State Tax 2025 - Basic Test Suite
 *
 * Tests Texas's NO income tax system.
 * Texas has never had a state income tax and is constitutionally
 * prohibited from implementing one without voter approval.
 */

import { describe, it, expect } from 'vitest';
import { computeTX2025 } from '../../../../../src/engine/states/TX/2025/computeTX2025';
import type { TexasInput2025 } from '../../../../../src/engine/states/TX/2025/computeTX2025';

describe('Texas 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for low income', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 2500000, // $25,000
      };

      const result = computeTX2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for middle income', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
      };

      const result = computeTX2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for high income', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 100000000, // $1,000,000
      };

      const result = computeTX2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for married filing jointly', () => {
      const input: TexasInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 15000000, // $150,000
      };

      const result = computeTX2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for head of household', () => {
      const input: TexasInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 7500000, // $75,000
      };

      const result = computeTX2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });

  describe('No Deductions or Exemptions', () => {
    it('should have zero standard deduction', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should have zero credits', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.stateCredits.nonRefundableCredits).toBe(0);
      expect(result.stateCredits.refundableCredits).toBe(0);
    });
  });

  describe('AGI Handling', () => {
    it('should preserve federal AGI as state AGI', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.stateAGI).toBe(5000000);
    });

    it('should handle zero AGI', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 0,
      };

      const result = computeTX2025(input);

      expect(result.stateAGI).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high AGI', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 500000000, // $5,000,000
      };

      const result = computeTX2025(input);

      expect(result.stateAGI).toBe(500000000);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state code', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.state).toBe('TX');
    });

    it('should include correct tax year', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.taxYear).toBe(2025);
    });

    it('should include calculation notes about no income tax', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes.length).toBeGreaterThan(0);
      expect(result.calculationNotes.some(note => note.includes('NO state income tax'))).toBe(true);
    });

    it('should mention constitutional protection', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Constitution');
    });

    it('should have zero local tax', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.localTax).toBe(0);
    });
  });

  describe('Payments and Refunds', () => {
    it('should have zero withholding', () => {
      const input: TexasInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
      };

      const result = computeTX2025(input);

      expect(result.stateWithheld).toBe(0);
      expect(result.stateEstPayments).toBe(0);
      expect(result.stateRefundOrOwe).toBe(0);
    });
  });
});
