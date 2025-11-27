/**
 * Kentucky State Tax 2025 - Basic Test Suite
 *
 * Tests Kentucky's flat 4% tax system with:
 * - Standard deductions
 * - Child and dependent care credit (20% of federal)
 * - No personal exemptions
 */

import { describe, it, expect } from 'vitest';
import { computeKY2025 } from '../../../../../src/engine/states/KY/2025/computeKY2025';
import type { KentuckyInput2025 } from '../../../../../src/engine/states/KY/2025/computeKY2025';

describe('Kentucky 2025 State Tax - Basic Tests', () => {
  describe('Flat Tax Rate (4%)', () => {
    it('should apply flat 4% rate to taxable income', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $50,000 - $3,270 (std ded) = $46,730
      // Tax: $46,730 × 4% = $1,869.20
      expect(result.stateTaxableIncome).toBe(4673000);
      expect(result.stateTax).toBe(186920);
    });

    it('should calculate correct tax for low income', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 2500000, // $25,000
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $25,000 - $3,270 = $21,730
      // Tax: $21,730 × 4% = $869.20
      expect(result.stateTaxableIncome).toBe(2173000);
      expect(result.stateTax).toBe(86920);
    });

    it('should calculate correct tax for high income', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 20000000, // $200,000
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $200,000 - $3,270 = $196,730
      // Tax: $196,730 × 4% = $7,869.20
      expect(result.stateTaxableIncome).toBe(19673000);
      expect(result.stateTax).toBe(786920);
    });
  });

  describe('Standard Deductions', () => {
    it('should apply $3,270 standard deduction for single', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      expect(result.stateDeduction).toBe(327000); // $3,270
    });

    it('should apply $6,540 standard deduction for MFJ', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000, // $100,000
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $100,000 - $6,540 = $93,460
      // Tax: $93,460 × 4% = $3,738.40
      expect(result.stateDeduction).toBe(654000); // $6,540
      expect(result.stateTaxableIncome).toBe(9346000);
      expect(result.stateTax).toBe(373840);
    });

    it('should apply $3,270 standard deduction for MFS', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'marriedSeparately',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      expect(result.stateDeduction).toBe(327000); // $3,270
    });

    it('should apply $6,540 standard deduction for HOH', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 7000000, // $70,000
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $70,000 - $6,540 = $63,460
      // Tax: $63,460 × 4% = $2,538.40
      expect(result.stateDeduction).toBe(654000); // $6,540
      expect(result.stateTaxableIncome).toBe(6346000);
      expect(result.stateTax).toBe(253840);
    });
  });

  describe('Child and Dependent Care Credit', () => {
    it('should apply 20% of federal child care credit', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        federalChildCareCredit: 100000, // $1,000 federal credit
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Kentucky credit: $1,000 × 20% = $200
      // Tax before credit: $1,869.20
      // Tax after credit: $1,869.20 - $200 = $1,669.20
      expect(result.stateCredits.child_care).toBe(20000);
      expect(result.stateTax).toBe(166920);
    });

    it('should be non-refundable (cannot reduce tax below zero)', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 2000000, // $20,000
        federalChildCareCredit: 100000, // $1,000 federal credit
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $20,000 - $3,270 = $16,730
      // Tax before credit: $16,730 × 4% = $669.20
      // Kentucky credit: $1,000 × 20% = $200
      // Tax after credit: $669.20 - $200 = $469.20
      expect(result.stateCredits.child_care).toBe(20000);
      expect(result.stateTax).toBe(46920);
    });

    it('should limit credit to tax liability (cannot go negative)', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 1500000, // $15,000
        federalChildCareCredit: 500000, // $5,000 federal credit
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $15,000 - $3,270 = $11,730
      // Tax before credit: $11,730 × 4% = $469.20
      // Kentucky credit potential: $5,000 × 20% = $1,000
      // Credit limited to tax: $469.20
      // Tax after credit: $0 (not negative)
      const taxBeforeCredit = Math.round(1173000 * 0.04);
      expect(result.stateTax).toBe(0);
      expect(result.stateCredits.nonRefundableCredits).toBe(taxBeforeCredit);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 200000, // $2,000
        federalChildCareCredit: 0,
      };

      const result = computeKY2025(input);

      // Tax: $1,869.20
      // Withholding: $2,000
      // Refund: $2,000 - $1,869.20 = $130.80
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Refund
      expect(result.stateRefundOrOwe).toBe(13080);
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        stateWithholding: 200000, // $2,000
        federalChildCareCredit: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $100,000 - $3,270 = $96,730
      // Tax: $96,730 × 4% = $3,869.20
      // Withholding: $2,000
      // Owe: $2,000 - $3,869.20 = -$1,869.20
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Owes
      expect(result.stateTax).toBe(386920);
      expect(result.stateRefundOrOwe).toBe(-186920);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 200000, // $2,000 (below standard deduction)
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      // Taxable: $2,000 - $3,270 = -$1,270 → $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle no federal child care credit', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      expect(result.stateCredits.child_care).toBe(0);
      expect(result.stateCredits.nonRefundableCredits).toBe(0);
      expect(result.stateCredits.refundableCredits).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: KentuckyInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        federalChildCareCredit: 50000, // $500
        stateWithholding: 0,
      };

      const result = computeKY2025(input);

      expect(result.state).toBe('KY');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateExemptions).toBe(0); // No personal exemptions
      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes.length).toBeGreaterThan(0);
    });
  });
});
