/**
 * Missouri State Tax 2025 - Basic Test Suite
 *
 * Tests Missouri's 8-bracket progressive system (0%-4.7%) with:
 * - Standard deductions
 * - Federal income tax deduction (capped)
 * - Dependent exemptions
 */

import { describe, it, expect } from 'vitest';
import { computeMO2025 } from '../../../../../src/engine/states/MO/2025/computeMO2025';
import type { MissouriInput2025 } from '../../../../../src/engine/states/MO/2025/computeMO2025';

describe('Missouri 2025 State Tax - Basic Tests', () => {
  describe('Progressive Tax Brackets', () => {
    it('should apply 0% rate in first bracket', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 1600000, // $16,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Taxable: $16,000 - $15,000 (std ded) = $1,000
      // Tax: $1,000 × 0% = $0 (first bracket)
      expect(result.stateTaxableIncome).toBe(100000);
      expect(result.stateTax).toBe(0);
    });

    it('should calculate tax across multiple brackets', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Taxable: $50,000 - $15,000 = $35,000
      // Top bracket applies (4.7%)
      expect(result.stateTaxableIncome).toBe(3500000);
      expect(result.stateTax).toBeGreaterThan(130000); // ~$1,300+
    });
  });

  describe('Standard Deductions', () => {
    it('should apply $15,000 standard deduction for single', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      expect(result.stateDeduction).toBe(1500000);
    });

    it('should apply $30,000 standard deduction for MFJ', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000, // $100,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Taxable: $100,000 - $30,000 = $70,000
      expect(result.stateDeduction).toBe(3000000);
      expect(result.stateTaxableIncome).toBe(7000000);
    });

    it('should apply $22,500 standard deduction for HOH', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 7000000, // $70,000
        federalTaxPaid: 0,
        dependents: 1,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Deduction: $22,500
      // Dependent exemption: $1,200
      // Taxable: $70,000 - $22,500 - $1,200 = $46,300
      expect(result.stateDeduction).toBe(2250000);
      expect(result.stateTaxableIncome).toBe(4630000);
    });
  });

  describe('Federal Income Tax Deduction', () => {
    it('should deduct federal tax up to $5,000 limit (single)', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        federalTaxPaid: 800000, // $8,000 federal tax
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Missouri AGI: $100,000 - $5,000 (capped) = $95,000
      // Taxable: $95,000 - $15,000 = $80,000
      expect(result.stateAGI).toBe(9500000); // After $5k deduction
      expect(result.stateTaxableIncome).toBe(8000000);
    });

    it('should deduct federal tax up to $10,000 limit (MFJ)', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 15000000, // $150,000
        federalTaxPaid: 1500000, // $15,000 federal tax
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Missouri AGI: $150,000 - $10,000 (capped) = $140,000
      // Taxable: $140,000 - $30,000 = $110,000
      expect(result.stateAGI).toBe(14000000); // After $10k deduction
      expect(result.stateTaxableIncome).toBe(11000000);
    });

    it('should deduct full federal tax when below cap', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        federalTaxPaid: 300000, // $3,000 (below $5k cap)
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Missouri AGI: $50,000 - $3,000 = $47,000
      expect(result.stateAGI).toBe(4700000);
    });
  });

  describe('Dependent Exemptions', () => {
    it('should apply $1,200 per dependent exemption', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 8000000, // $80,000
        federalTaxPaid: 0,
        dependents: 2,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Dependent exemptions: 2 × $1,200 = $2,400
      // Taxable: $80,000 - $15,000 - $2,400 = $62,600
      expect(result.stateExemptions).toBe(240000);
      expect(result.stateTaxableIncome).toBe(6260000);
    });

    it('should combine standard deduction and dependent exemptions', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 12000000, // $120,000
        federalTaxPaid: 0,
        dependents: 3,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Standard deduction: $30,000
      // Dependent exemptions: 3 × $1,200 = $3,600
      // Taxable: $120,000 - $30,000 - $3,600 = $86,400
      expect(result.stateDeduction).toBe(3000000);
      expect(result.stateExemptions).toBe(360000);
      expect(result.stateTaxableIncome).toBe(8640000);
    });
  });

  describe('Combined Features', () => {
    it('should apply federal tax deduction + standard deduction + dependent exemptions', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 15000000, // $150,000
        federalTaxPaid: 1200000, // $12,000 (capped at $10k)
        dependents: 2,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Missouri AGI: $150,000 - $10,000 = $140,000
      // Standard deduction: $30,000
      // Dependent exemptions: 2 × $1,200 = $2,400
      // Taxable: $140,000 - $30,000 - $2,400 = $107,600
      expect(result.stateAGI).toBe(14000000);
      expect(result.stateTaxableIncome).toBe(10760000);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 200000, // $2,000
      };

      const result = computeMO2025(input);

      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000,
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 100000, // $1,000
      };

      const result = computeMO2025(input);

      expect(result.stateRefundOrOwe).toBeLessThan(0); // Owes
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 1000000, // $10,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      // Taxable: $10,000 - $15,000 = -$5,000 → $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: MissouriInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        federalTaxPaid: 200000,
        dependents: 1,
        stateWithholding: 0,
      };

      const result = computeMO2025(input);

      expect(result.state).toBe('MO');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.calculationNotes).toBeDefined();
    });
  });
});
