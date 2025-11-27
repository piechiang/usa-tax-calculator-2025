/**
 * Alabama State Tax 2025 - Basic Test Suite
 *
 * Tests Alabama's 3-bracket progressive tax system with:
 * - Federal income tax deduction
 * - Income-based dependent exemptions
 * - Standard deductions
 */

import { describe, it, expect } from 'vitest';
import { computeAL2025 } from '../../../../../src/engine/states/AL/2025/computeAL2025';
import type { AlabamaInput2025 } from '../../../../../src/engine/states/AL/2025/computeAL2025';

describe('Alabama 2025 State Tax - Basic Tests', () => {
  describe('Tax Brackets', () => {
    it('should calculate tax in first bracket (2%) - Single', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 1000000, // $10,000
        federalTaxPaid: 0, // No federal tax paid
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Alabama AGI: $10,000 (no federal tax deduction)
      // Standard deduction: $4,500
      // Taxable: $10,000 - $4,500 = $5,500
      // Tax: $500 × 2% + $2,500 × 4% + $2,500 × 5%
      //    = $10 + $100 + $125 = $235
      expect(result.stateAGI).toBe(1000000);
      expect(result.stateTaxableIncome).toBe(550000);
      expect(result.stateTax).toBeGreaterThan(23400);
      expect(result.stateTax).toBeLessThan(23600);
    });

    it('should calculate tax in second bracket (4%) - Single', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 700000, // $7,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Taxable: $7,000 - $4,500 = $2,500
      // Tax: $500 × 2% + $2,000 × 4%
      //    = $10 + $80 = $90
      expect(result.stateTaxableIncome).toBe(250000);
      expect(result.stateTax).toBeGreaterThan(8900);
      expect(result.stateTax).toBeLessThan(9100);
    });

    it('should calculate tax in third bracket (5%) - Single', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Taxable: $100,000 - $4,500 = $95,500
      // Tax: $500 × 2% + $2,500 × 4% + $92,500 × 5%
      //    = $10 + $100 + $4,625 = $4,735
      expect(result.stateTaxableIncome).toBe(9550000);
      expect(result.stateTax).toBeGreaterThan(473000);
      expect(result.stateTax).toBeLessThan(474000);
    });
  });

  describe('Federal Income Tax Deduction', () => {
    it('should deduct federal tax from AGI', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        federalTaxPaid: 1500000, // $15,000 federal tax
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Alabama AGI: $100,000 - $15,000 = $85,000
      // Standard deduction: $4,500
      // Taxable: $85,000 - $4,500 = $80,500
      // Tax: $500 × 2% + $2,500 × 4% + $77,500 × 5%
      //    = $10 + $100 + $3,875 = $3,985
      expect(result.stateAGI).toBe(8500000); // After federal tax deduction
      expect(result.stateTaxableIncome).toBe(8050000);
      expect(result.stateTax).toBeGreaterThan(398000);
      expect(result.stateTax).toBeLessThan(399000);
    });

    it('should handle large federal tax deduction', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 50000000, // $500,000
        federalTaxPaid: 15000000, // $150,000 federal tax
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Alabama AGI: $500,000 - $150,000 = $350,000
      // Standard deduction: $11,500
      // Taxable: $350,000 - $11,500 = $338,500
      // Tax: $1,000 × 2% + $5,000 × 4% + $332,500 × 5%
      //    = $20 + $200 + $16,625 = $16,845
      expect(result.stateAGI).toBe(35000000);
      expect(result.stateTaxableIncome).toBe(33850000);
      expect(result.stateTax).toBeGreaterThan(1684000);
      expect(result.stateTax).toBeLessThan(1685000);
    });
  });

  describe('Married Filing Jointly', () => {
    it('should use MFJ brackets and higher standard deduction', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 8000000, // $80,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Standard deduction: $11,500
      // Taxable: $80,000 - $11,500 = $68,500
      // Tax: $1,000 × 2% + $5,000 × 4% + $62,500 × 5%
      //    = $20 + $200 + $3,125 = $3,345
      expect(result.stateTaxableIncome).toBe(6850000);
      expect(result.stateTax).toBeGreaterThan(334000);
      expect(result.stateTax).toBeLessThan(335000);
    });
  });

  describe('Dependent Exemptions - Income Based', () => {
    it('should apply $1,000 per dependent for AGI ≤ $20,000', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 2000000, // $20,000
        federalTaxPaid: 0,
        dependents: 2,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Standard deduction: $4,500
      // Dependent exemptions: 2 × $1,000 = $2,000
      // Taxable: $20,000 - $4,500 - $2,000 = $13,500
      // Tax: $500 × 2% + $2,500 × 4% + $10,500 × 5%
      //    = $10 + $100 + $525 = $635
      expect(result.stateExemptions).toBe(200000); // 2 × $1,000
      expect(result.stateTaxableIncome).toBe(1350000);
      expect(result.stateTax).toBeGreaterThan(63000);
      expect(result.stateTax).toBeLessThan(64000);
    });

    it('should apply $500 per dependent for AGI $20,001-$100,000', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        federalTaxPaid: 0,
        dependents: 3,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Standard deduction: $4,500
      // Dependent exemptions: 3 × $500 = $1,500 (AGI in $20,001-$100,000 range)
      // Taxable: $50,000 - $4,500 - $1,500 = $44,000
      // Tax: $500 × 2% + $2,500 × 4% + $41,000 × 5%
      //    = $10 + $100 + $2,050 = $2,160
      expect(result.stateExemptions).toBe(150000); // 3 × $500
      expect(result.stateTaxableIncome).toBe(4400000);
      expect(result.stateTax).toBeGreaterThan(215000);
      expect(result.stateTax).toBeLessThan(217000);
    });

    it('should apply $300 per dependent for AGI > $100,000', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 15000000, // $150,000
        federalTaxPaid: 0,
        dependents: 2,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Standard deduction: $11,500
      // Dependent exemptions: 2 × $300 = $600 (AGI > $100,000)
      // Taxable: $150,000 - $11,500 - $600 = $137,900
      // Tax: $1,000 × 2% + $5,000 × 4% + $131,900 × 5%
      //    = $20 + $200 + $6,595 = $6,815
      expect(result.stateExemptions).toBe(60000); // 2 × $300
      expect(result.stateTaxableIncome).toBe(13790000);
      expect(result.stateTax).toBeGreaterThan(681000);
      expect(result.stateTax).toBeLessThan(682000);
    });

    it('should use federal AGI (not Alabama AGI) for exemption determination', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 11000000, // $110,000 federal AGI
        federalTaxPaid: 1500000, // $15,000 federal tax
        dependents: 1,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Federal AGI: $110,000 → dependent exemption = $300 (>$100k tier)
      // Alabama AGI: $110,000 - $15,000 = $95,000
      // Standard deduction: $4,500
      // Dependent exemption: 1 × $300 = $300
      // Taxable: $95,000 - $4,500 - $300 = $90,200
      expect(result.stateAGI).toBe(9500000);
      expect(result.stateExemptions).toBe(30000); // 1 × $300 (based on federal AGI)
      expect(result.stateTaxableIncome).toBe(9020000);
    });
  });

  describe('Combined Features', () => {
    it('should handle federal tax deduction with dependents', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 9000000, // $90,000
        federalTaxPaid: 1000000, // $10,000 federal tax
        dependents: 3,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Federal AGI: $90,000 → dependent exemption = $500 each
      // Alabama AGI: $90,000 - $10,000 = $80,000
      // Standard deduction: $11,500
      // Dependent exemptions: 3 × $500 = $1,500
      // Taxable: $80,000 - $11,500 - $1,500 = $67,000
      // Tax: $1,000 × 2% + $5,000 × 4% + $61,000 × 5%
      //    = $20 + $200 + $3,050 = $3,270
      expect(result.stateAGI).toBe(8000000);
      expect(result.stateExemptions).toBe(150000); // 3 × $500
      expect(result.stateTaxableIncome).toBe(6700000);
      expect(result.stateTax).toBeGreaterThan(326000);
      expect(result.stateTax).toBeLessThan(328000);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 300000, // $3,000 withheld
      };

      const result = computeAL2025(input);

      // Tax should be around $2,185
      // Refund: $3,000 - $2,185 = $815
      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 200000, // $2,000 withheld
      };

      const result = computeAL2025(input);

      // Tax should be around $4,735
      // Owe: $2,000 - $4,735 = -$2,735
      expect(result.stateTax).toBeGreaterThan(200000);
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Owes money
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 300000, // $3,000
        federalTaxPaid: 0,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Taxable: $3,000 - $4,500 = -$1,500 → $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle federal tax exceeding federal AGI', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 1000000, // $10,000
        federalTaxPaid: 1500000, // $15,000 (more than AGI)
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      // Alabama AGI: max(0, $10,000 - $15,000) = $0
      expect(result.stateAGI).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: AlabamaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        federalTaxPaid: 500000,
        dependents: 1,
        stateWithholding: 0,
      };

      const result = computeAL2025(input);

      expect(result.state).toBe('AL');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes!.length).toBeGreaterThan(0);
    });
  });
});
