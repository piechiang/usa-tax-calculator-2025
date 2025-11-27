/**
 * Iowa State Tax 2025 - Basic Test Suite
 *
 * Tests Iowa's NEW flat 3.8% tax system (effective 2025).
 * Iowa enacted Senate File 2442 in May 2024, which:
 * - Replaced progressive bracket system with flat 3.8% rate
 * - Reduced rate from 5.7% in 2024
 * - Continues retirement income exemption
 */

import { describe, it, expect } from 'vitest';
import { computeIA2025 } from '../../../../../src/engine/states/IA/2025/computeIA2025';
import type { IowaInput2025 } from '../../../../../src/engine/states/IA/2025/computeIA2025';

describe('Iowa 2025 State Tax - Basic Tests', () => {
  describe('Flat Tax Rate (3.8%)', () => {
    it('should apply flat 3.8% rate to taxable income', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      // Taxable: $50,000 - $2,210 (std ded) = $47,790
      // Tax: $47,790 × 3.8% = $1,816.02
      expect(result.stateTaxableIncome).toBe(4779000);
      expect(result.stateTax).toBe(181602);
    });

    it('should calculate correct tax for low income', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 2500000, // $25,000
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      // Taxable: $25,000 - $2,210 = $22,790
      // Tax: $22,790 × 3.8% = $866.02
      expect(result.stateTaxableIncome).toBe(2279000);
      expect(result.stateTax).toBe(86602);
    });

    it('should calculate correct tax for high income', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 20000000, // $200,000
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      // Taxable: $200,000 - $2,210 = $197,790
      // Tax: $197,790 × 3.8% = $7,516.02
      expect(result.stateTaxableIncome).toBe(19779000);
      expect(result.stateTax).toBe(751602);
    });
  });

  describe('Standard Deductions (2025)', () => {
    it('should apply $2,210 standard deduction for single', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      expect(result.stateDeduction).toBe(221000); // $2,210
    });

    it('should apply $5,450 standard deduction for MFJ', () => {
      const input: IowaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000, // $100,000
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      // Taxable: $100,000 - $5,450 = $94,550
      // Tax: $94,550 × 3.8% = $3,592.90
      expect(result.stateDeduction).toBe(545000); // $5,450
      expect(result.stateTaxableIncome).toBe(9455000);
      expect(result.stateTax).toBe(359290);
    });

    it('should apply $2,725 standard deduction for MFS', () => {
      const input: IowaInput2025 = {
        filingStatus: 'marriedSeparately',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      expect(result.stateDeduction).toBe(272500); // $2,725
    });

    it('should apply $2,210 standard deduction for HOH', () => {
      const input: IowaInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 7000000, // $70,000
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      // Taxable: $70,000 - $2,210 = $67,790
      // Tax: $67,790 × 3.8% = $2,576.02
      expect(result.stateDeduction).toBe(221000); // $2,210
      expect(result.stateTaxableIncome).toBe(6779000);
      expect(result.stateTax).toBe(257602);
    });
  });

  describe('Tax Rate Comparison: 2024 vs 2025', () => {
    it('should save significantly compared to 2024 rate', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      // 2025: ($100,000 - $2,210) × 3.8% = $3,716.02
      expect(result.stateTax).toBe(371602);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 200000, // $2,000
      };

      const result = computeIA2025(input);

      // Tax: $1,816.02
      // Withholding: $2,000
      // Refund: $2,000 - $1,816.02 = $183.98
      expect(result.stateRefundOrOwe).toBe(18398);
      expect(result.stateRefundOrOwe).toBeGreaterThan(0);
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        stateWithholding: 300000, // $3,000
      };

      const result = computeIA2025(input);

      expect(result.stateTax).toBe(371602);
      expect(result.stateRefundOrOwe).toBe(-71602);
      expect(result.stateRefundOrOwe).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 150000, // $1,500
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle income equal to standard deduction', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 221000, // $2,210
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      expect(result.state).toBe('IA');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateExemptions).toBe(0);
      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes.length).toBeGreaterThan(0);
    });

    it('should mention 2025 reform in notes', () => {
      const input: IowaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeIA2025(input);

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('NEW for 2025');
    });
  });
});
