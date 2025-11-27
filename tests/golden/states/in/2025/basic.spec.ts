/**
 * Indiana State Tax 2025 - Basic Test Suite
 *
 * Tests Indiana's flat 3.0% tax rate with:
 * - Personal exemptions ($1,000 taxpayer/spouse, $1,500 dependents)
 * - No standard deduction
 * - State EITC (10% of federal, non-refundable)
 * - Optional county taxes
 */

import { describe, it, expect } from 'vitest';
import { computeIN2025 } from '../../../../../src/engine/states/IN/2025/computeIN2025';
import type { IndianaInput2025 } from '../../../../../src/engine/states/IN/2025/computeIN2025';

describe('Indiana 2025 State Tax - Basic Tests', () => {
  describe('Flat Tax Rate', () => {
    it('should apply 3.0% flat tax rate - Single', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // Personal exemptions: 1 × $1,000 = $1,000
      // Taxable: $50,000 - $1,000 = $49,000
      // Tax: $49,000 × 3.0% = $1,470
      expect(result.stateExemptions).toBe(100000); // 1 × $1,000
      expect(result.stateTaxableIncome).toBe(4900000);
      expect(result.stateTax).toBe(147000);
    });

    it('should apply 3.0% flat tax on high income', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 20000000, // $200,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // Taxable: $200,000 - $1,000 = $199,000
      // Tax: $199,000 × 3.0% = $5,970
      expect(result.stateTaxableIncome).toBe(19900000);
      expect(result.stateTax).toBe(597000);
    });
  });

  describe('Personal Exemptions', () => {
    it('should apply $1,000 exemption for single taxpayer', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      expect(result.stateExemptions).toBe(100000); // $1,000
    });

    it('should apply $2,000 exemptions for MFJ (taxpayer + spouse)', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 10000000, // $100,000
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // 2 exemptions (taxpayer + spouse) × $1,000 = $2,000
      // Taxable: $100,000 - $2,000 = $98,000
      // Tax: $98,000 × 3.0% = $2,940
      expect(result.stateExemptions).toBe(200000); // 2 × $1,000
      expect(result.stateTaxableIncome).toBe(9800000);
      expect(result.stateTax).toBe(294000);
    });

    it('should apply $1,500 per dependent exemption', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 8000000, // $80,000
        dependents: 2,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // Exemptions: 1 × $1,000 (taxpayer) + 2 × $1,500 (dependents) = $4,000
      // Taxable: $80,000 - $4,000 = $76,000
      // Tax: $76,000 × 3.0% = $2,280
      expect(result.stateExemptions).toBe(400000); // $1,000 + $3,000
      expect(result.stateTaxableIncome).toBe(7600000);
      expect(result.stateTax).toBe(228000);
    });

    it('should apply exemptions for MFJ with dependents', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 12000000, // $120,000
        dependents: 3,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // Exemptions: 2 × $1,000 (taxpayers) + 3 × $1,500 (dependents) = $6,500
      // Taxable: $120,000 - $6,500 = $113,500
      // Tax: $113,500 × 3.0% = $3,405
      expect(result.stateExemptions).toBe(650000); // $2,000 + $4,500
      expect(result.stateTaxableIncome).toBe(11350000);
      expect(result.stateTax).toBe(340500);
    });
  });

  describe('No Standard Deduction', () => {
    it('should have zero standard deduction', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      expect(result.stateDeduction).toBe(0);
    });
  });

  describe('State EITC - 10% of Federal (Non-Refundable)', () => {
    it('should calculate state EITC as 10% of federal', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 3000000, // $30,000
        dependents: 1,
        federalEITC: 380000, // $3,800 federal EITC
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // State EITC: $3,800 × 10% = $380
      // Tax before EITC: ($30,000 - $1,000 - $1,500) × 3.0% = $825
      // Tax after EITC: $825 - $380 = $445
      expect(result.stateCredits.earned_income).toBe(38000); // $380
      expect(result.stateCredits.nonRefundableCredits).toBe(38000);
      expect(result.stateCredits.refundableCredits).toBe(0); // Non-refundable
    });

    it('should not make EITC refundable (non-refundable credit)', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 4000000, // $40,000
        dependents: 2,
        federalEITC: 700000, // $7,000 federal EITC
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // Exemptions: 2 × $1,000 + 2 × $1,500 = $5,000
      // Tax before EITC: ($40,000 - $5,000) × 3.0% = $1,050
      // State EITC: $7,000 × 10% = $700
      // Tax after EITC: $1,050 - $700 = $350
      expect(result.stateCredits.earned_income).toBe(70000); // $700
      expect(result.stateTax).toBe(35000); // $350
      // EITC reduces tax but doesn't create refund
    });
  });

  describe('County Taxes (Optional)', () => {
    it('should apply county tax when rate provided', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        dependents: 0,
        stateWithholding: 0,
        countyTaxRate: 0.02, // 2% county tax
      };

      const result = computeIN2025(input);

      // Taxable: $100,000 - $1,000 = $99,000
      // State tax: $99,000 × 3.0% = $2,970
      // County tax: $99,000 × 2.0% = $1,980
      // Total: $2,970 + $1,980 = $4,950
      expect(result.stateTax).toBe(297000 + 198000); // Includes county tax
      expect(result.localTax).toBe(198000); // County tax
    });

    it('should not apply county tax when rate not provided', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000,
        dependents: 0,
        stateWithholding: 0,
        // No countyTaxRate provided
      };

      const result = computeIN2025(input);

      expect(result.localTax).toBe(0);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        dependents: 0,
        stateWithholding: 200000, // $2,000
      };

      const result = computeIN2025(input);

      // Tax: $1,470
      // Refund: $2,000 - $1,470 = $530
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000,
        dependents: 0,
        stateWithholding: 100000, // $1,000
      };

      const result = computeIN2025(input);

      // Tax: $2,970
      // Owe: $1,000 - $2,970 = -$1,970
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Owes
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero taxable income', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 80000, // $800
        dependents: 0,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      // Taxable: $800 - $1,000 = -$200 → $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: IndianaInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000,
        dependents: 1,
        federalEITC: 100000,
        stateWithholding: 0,
      };

      const result = computeIN2025(input);

      expect(result.state).toBe('IN');
      expect(result.taxYear).toBe(2025);
      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes!.length).toBeGreaterThan(0);
    });
  });
});
