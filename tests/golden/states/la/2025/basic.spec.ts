/**
 * Louisiana State Tax 2025 - Basic Test Suite
 *
 * Tests Louisiana's NEW flat 3% tax system (effective 2025).
 * Louisiana enacted Act 11 of 2024, which:
 * - Replaced 3-bracket graduated system with flat 3% rate
 * - Significantly increased standard deductions
 * - Eliminated personal and dependent exemptions
 */

import { describe, it, expect } from 'vitest';
import { computeLA2025 } from '../../../../../src/engine/states/LA/2025/computeLA2025';
import type { LouisianaInput2025 } from '../../../../../src/engine/states/LA/2025/computeLA2025';

describe('Louisiana 2025 State Tax - Basic Tests', () => {
  describe('Flat Tax Rate (3%)', () => {
    it('should apply flat 3% rate to taxable income', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // Taxable: $50,000 - $12,500 (std ded) = $37,500
      // Tax: $37,500 × 3% = $1,125
      expect(result.stateTaxableIncome).toBe(3750000);
      expect(result.stateTax).toBe(112500);
    });

    it('should calculate correct tax for low income', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 2500000, // $25,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // Taxable: $25,000 - $12,500 = $12,500
      // Tax: $12,500 × 3% = $375
      expect(result.stateTaxableIncome).toBe(1250000);
      expect(result.stateTax).toBe(37500);
    });

    it('should calculate correct tax for high income', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 20000000, // $200,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // Taxable: $200,000 - $12,500 = $187,500
      // Tax: $187,500 × 3% = $5,625
      expect(result.stateTaxableIncome).toBe(18750000);
      expect(result.stateTax).toBe(562500);
    });
  });

  describe('Standard Deductions (2025 Reform)', () => {
    it('should apply $12,500 standard deduction for single', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      expect(result.stateDeduction).toBe(1250000); // $12,500
    });

    it('should apply $25,000 standard deduction for MFJ', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000, // $100,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // Taxable: $100,000 - $25,000 = $75,000
      // Tax: $75,000 × 3% = $2,250
      expect(result.stateDeduction).toBe(2500000); // $25,000
      expect(result.stateTaxableIncome).toBe(7500000);
      expect(result.stateTax).toBe(225000);
    });

    it('should apply $12,500 standard deduction for MFS', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'marriedSeparately',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      expect(result.stateDeduction).toBe(1250000); // $12,500
    });

    it('should apply $25,000 standard deduction for HOH', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 7000000, // $70,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // Taxable: $70,000 - $25,000 = $45,000
      // Tax: $45,000 × 3% = $1,350
      expect(result.stateDeduction).toBe(2500000); // $25,000
      expect(result.stateTaxableIncome).toBe(4500000);
      expect(result.stateTax).toBe(135000);
    });
  });

  describe('No Personal/Dependent Exemptions (Eliminated 2025)', () => {
    it('should have zero exemptions for single taxpayer', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      expect(result.stateExemptions).toBe(0);
    });

    it('should have zero exemptions for MFJ', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000,
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      expect(result.stateExemptions).toBe(0);
    });
  });

  describe('Tax Comparison: 2024 vs 2025 Reform', () => {
    it('should benefit lower income under new system', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 3000000, // $30,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // 2025: $30,000 - $12,500 = $17,500 × 3% = $525
      // 2024 would have been higher due to lower deduction
      expect(result.stateTax).toBe(52500);
    });

    it('should benefit middle income under new system', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 8000000, // $80,000
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // 2025: $80,000 - $25,000 = $55,000 × 3% = $1,650
      expect(result.stateTax).toBe(165000);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 150000, // $1,500
      };

      const result = computeLA2025(input);

      // Tax: $1,125
      // Withholding: $1,500
      // Refund: $1,500 - $1,125 = $375
      expect(result.stateRefundOrOwe).toBe(37500);
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        stateWithholding: 200000, // $2,000
      };

      const result = computeLA2025(input);

      // Taxable: $100,000 - $12,500 = $87,500
      // Tax: $87,500 × 3% = $2,625
      // Withholding: $2,000
      // Owe: $2,000 - $2,625 = -$625
      expect(result.stateTax).toBe(262500);
      expect(result.stateRefundOrOwe).toBe(-62500); // Owes
      expect(result.stateRefundOrOwe).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 1000000, // $10,000 (below standard deduction)
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      // Taxable: $10,000 - $12,500 = -$2,500 → $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle income exactly equal to standard deduction', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 1250000, // $12,500
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      expect(result.state).toBe('LA');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes.length).toBeGreaterThan(0);
    });

    it('should mention 2025 tax reform in notes', () => {
      const input: LouisianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeLA2025(input);

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('NEW for 2025');
    });
  });
});
