/**
 * Michigan State Tax 2025 - Basic Test Suite
 *
 * Tests Michigan's flat 4.25% tax rate with:
 * - Personal exemptions ($5,000 per person)
 * - No standard deduction
 * - State EITC (30% of federal, refundable)
 */

import { describe, it, expect } from 'vitest';
import { computeMI2025 } from '../../../../../src/engine/states/MI/2025/computeMI2025';
import type { MichiganInput2025 } from '../../../../../src/engine/states/MI/2025/computeMI2025';

describe('Michigan 2025 State Tax - Basic Tests', () => {
  describe('Flat Tax Rate', () => {
    it('should apply 4.25% flat tax rate - Single', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Personal exemptions: 1 × $5,000 = $5,000
      // Taxable: $50,000 - $5,000 = $45,000
      // Tax: $45,000 × 4.25% = $1,912.50
      expect(result.stateExemptions).toBe(500000); // 1 × $5,000
      expect(result.stateTaxableIncome).toBe(4500000);
      expect(result.stateTax).toBeGreaterThan(191000);
      expect(result.stateTax).toBeLessThan(192000);
    });

    it('should apply 4.25% flat tax on high income', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 20000000, // $200,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Taxable: $200,000 - $5,000 = $195,000
      // Tax: $195,000 × 4.25% = $8,287.50
      expect(result.stateTaxableIncome).toBe(19500000);
      expect(result.stateTax).toBeGreaterThan(828000);
      expect(result.stateTax).toBeLessThan(829000);
    });

    it('should apply 4.25% flat tax on low income', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 2000000, // $20,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Taxable: $20,000 - $5,000 = $15,000
      // Tax: $15,000 × 4.25% = $637.50
      expect(result.stateTaxableIncome).toBe(1500000);
      expect(result.stateTax).toBeGreaterThan(63700);
      expect(result.stateTax).toBeLessThan(63800);
    });
  });

  describe('Personal Exemptions', () => {
    it('should apply single exemption ($5,000)', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // 1 personal exemption (taxpayer only)
      expect(result.stateExemptions).toBe(500000); // $5,000
    });

    it('should apply exemptions for taxpayer + spouse (MFJ)', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000, // $100,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // 2 personal exemptions (taxpayer + spouse)
      // Taxable: $100,000 - $10,000 = $90,000
      // Tax: $90,000 × 4.25% = $3,825
      expect(result.stateExemptions).toBe(1000000); // 2 × $5,000
      expect(result.stateTaxableIncome).toBe(9000000);
      expect(result.stateTax).toBeGreaterThan(382000);
      expect(result.stateTax).toBeLessThan(383000);
    });

    it('should apply exemptions for taxpayer + dependents - Single', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 8000000, // $80,000
        dependents: 2,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // 3 exemptions (1 taxpayer + 2 dependents) × $5,000 = $15,000
      // Taxable: $80,000 - $15,000 = $65,000
      // Tax: $65,000 × 4.25% = $2,762.50
      expect(result.stateExemptions).toBe(1500000); // 3 × $5,000
      expect(result.stateTaxableIncome).toBe(6500000);
      expect(result.stateTax).toBeGreaterThan(276000);
      expect(result.stateTax).toBeLessThan(277000);
    });

    it('should apply exemptions for taxpayer + spouse + dependents - MFJ', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 12000000, // $120,000
        dependents: 3,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // 5 exemptions (2 taxpayers + 3 dependents) × $5,000 = $25,000
      // Taxable: $120,000 - $25,000 = $95,000
      // Tax: $95,000 × 4.25% = $4,037.50
      expect(result.stateExemptions).toBe(2500000); // 5 × $5,000
      expect(result.stateTaxableIncome).toBe(9500000);
      expect(result.stateTax).toBeGreaterThan(403000);
      expect(result.stateTax).toBeLessThan(404000);
    });
  });

  describe('No Standard Deduction', () => {
    it('should have zero standard deduction', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Michigan has NO standard deduction
      expect(result.stateDeduction).toBe(0);
    });
  });

  describe('State EITC - 30% of Federal', () => {
    it('should calculate state EITC as 30% of federal', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 3000000, // $30,000
        dependents: 1,
        federalEITC: 380000, // $3,800 federal EITC
        stateWithholding: 100000,
      };

      const result = computeMI2025(input);

      // State EITC: $3,800 × 30% = $1,140
      // Tax before EITC: ($30,000 - $10,000) × 4.25% = $850
      // Tax after EITC: $850 - $1,140 = -$290 (refund)
      expect(result.stateCredits.earned_income).toBe(114000); // $1,140
      expect(result.stateCredits.refundableCredits).toBe(114000);
    });

    it('should apply refundable EITC even when tax is low', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 4000000, // $40,000
        dependents: 2,
        federalEITC: 700000, // $7,000 federal EITC
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Exemptions: 4 × $5,000 = $20,000
      // Tax before EITC: ($40,000 - $20,000) × 4.25% = $850
      // State EITC: $7,000 × 30% = $2,100
      // Tax after EITC: $850 - $2,100 = -$1,250 (results in refund)
      expect(result.stateCredits.earned_income).toBe(210000); // $2,100
      expect(result.stateTax).toBe(0); // Tax can't be negative
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Gets refund
    });

    it('should not apply EITC when federal EITC is zero', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000,
        dependents: 0,
        federalEITC: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      expect(result.stateCredits.earned_income).toBe(0);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        dependents: 0,
        stateWithholding: 300000, // $3,000 withheld
      };

      const result = computeMI2025(input);

      // Tax: ($50,000 - $5,000) × 4.25% = $1,912.50
      // Refund: $3,000 - $1,912.50 = $1,087.50
      expect(result.stateTax).toBeGreaterThan(191000);
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        dependents: 0,
        stateWithholding: 200000, // $2,000 withheld
      };

      const result = computeMI2025(input);

      // Tax: ($100,000 - $5,000) × 4.25% = $4,037.50
      // Owe: $2,000 - $4,037.50 = -$2,037.50
      expect(result.stateTax).toBeGreaterThan(200000);
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Owes money
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 400000, // $4,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Taxable: $4,000 - $5,000 = -$1,000 → $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle large family with many exemptions', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 15000000, // $150,000
        dependents: 5,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      // Exemptions: 7 × $5,000 = $35,000
      // Taxable: $150,000 - $35,000 = $115,000
      // Tax: $115,000 × 4.25% = $4,887.50
      expect(result.stateExemptions).toBe(3500000); // 7 × $5,000
      expect(result.stateTaxableIncome).toBe(11500000);
      expect(result.stateTax).toBeGreaterThan(488000);
      expect(result.stateTax).toBeLessThan(489000);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: MichiganInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        dependents: 1,
        federalEITC: 100000,
        stateWithholding: 0,
      };

      const result = computeMI2025(input);

      expect(result.state).toBe('MI');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes!.length).toBeGreaterThan(0);
    });
  });
});
