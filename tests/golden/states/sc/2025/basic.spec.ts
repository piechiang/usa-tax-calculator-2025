/**
 * South Carolina State Tax Tests for 2025
 *
 * Tests South Carolina's simplified 3-bracket progressive system:
 * - 0% on $0 - $3,560
 * - 3% on $3,561 - $17,830
 * - 6.2% on $17,831+
 */

import { describe, it, expect } from 'vitest';
import { computeSC2025 } from '../../../../../src/engine/states/SC/2025/computeSC2025';
import type { StateTaxInput, FederalResult } from '../../../../../src/engine/types';

// Helper to convert dollars to cents
const $ = (dollars: number): number => Math.round(dollars * 100);

// Helper to create a minimal federal result
function createFederalResult(agi: number): FederalResult {
  return {
    agi,
    taxableIncome: agi,
    regularTax: 0,
    totalFederalTax: 0,
    effectiveRate: 0,
    marginalRate: 0,
    credits: {
      nonRefundableCredits: 0,
      refundableCredits: 0,
    },
    taxBeforeCredits: 0,
    refundOrOwe: 0,
    federalWithheld: 0,
    estimatedPayments: 0,
  } as FederalResult;
}

describe('South Carolina 2025 State Tax - Basic Tests', () => {
  describe('Progressive Tax Brackets - Single Filer', () => {
    it('should calculate zero tax in first bracket (0%)', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(20000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // SC AGI: $20,000
      // Standard deduction: $15,000
      // Personal exemption: $2,800
      // Taxable income: $20,000 - $15,000 - $2,800 = $2,200
      // All in 0% bracket (up to $3,560)
      expect(result.stateAGI).toBe($(20000));
      expect(result.stateTaxableIncome).toBe($(2200));
      expect(result.stateTax).toBe(0);
    });

    it('should calculate tax in second bracket (3%)', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // SC AGI: $30,000
      // Standard deduction: $15,000
      // Personal exemption: $2,800
      // Taxable income: $30,000 - $15,000 - $2,800 = $12,200
      // Bracket 1: $3,560 × 0% = $0
      // Bracket 2: $8,640 × 3% = $259
      expect(result.stateAGI).toBe($(30000));
      expect(result.stateTaxableIncome).toBe($(12200));
      expect(result.stateTax).toBeGreaterThan($(200));
      expect(result.stateTax).toBeLessThan($(300));
    });

    it('should calculate tax in third bracket (6.2%)', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(75000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // SC AGI: $75,000
      // Standard deduction: $15,000
      // Personal exemption: $2,800
      // Taxable income: $75,000 - $15,000 - $2,800 = $57,200
      // Bracket 1: $3,560 × 0% = $0
      // Bracket 2: $14,270 × 3% = $428
      // Bracket 3: $39,370 × 6.2% = $2,441
      // Total: ~$2,869
      expect(result.stateAGI).toBe($(75000));
      expect(result.stateTaxableIncome).toBe($(57200));
      expect(result.stateTax).toBeGreaterThan($(2800));
      expect(result.stateTax).toBeLessThan($(3000));
    });
  });

  describe('All Filing Statuses', () => {
    it('should calculate tax for single filer', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // Standard deduction: $15,000
      // Personal exemption: $2,800
      expect(result.stateTaxableIncome).toBe($(32200)); // $50k - $15k - $2.8k
      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.stateCredits?.personal_exemption).toBe($(2800));
    });

    it('should calculate tax for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(100000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // MFJ standard deduction: $30,000
      // MFJ personal exemption: $2,800 × 2 = $5,600
      // Taxable: $100,000 - $30,000 - $5,600 = $64,400
      expect(result.stateAGI).toBe($(100000));
      expect(result.stateTaxableIncome).toBe($(64400));
      expect(result.stateCredits?.personal_exemption).toBe($(5600));
    });

    it('should calculate tax for head of household', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // HOH standard deduction: $22,500
      // Personal exemption: $2,800
      expect(result.stateAGI).toBe($(60000));
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should calculate tax for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(45000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // MFS standard deduction: $15,000
      // Personal exemption: $2,800
      expect(result.stateAGI).toBe($(45000));
      expect(result.stateTaxableIncome).toBe($(27200)); // $45k - $15k - $2.8k
      expect(result.stateTax).toBeGreaterThan(0);
    });
  });

  describe('Dependent Exemption', () => {
    it('should apply dependent exemption for one dependent', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        stateDependents: 1,
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          numberOfDependents: 1,
        }
      };

      const result = computeSC2025(input);

      // Standard deduction: $15,000
      // Personal exemption: $2,800
      // Dependent exemption: $2,800 × 1 = $2,800
      // Taxable: $50,000 - $15,000 - $2,800 - $2,800 = $29,400
      expect(result.stateTaxableIncome).toBe($(29400));
      expect(result.stateCredits?.dependent_exemption).toBe($(2800));
    });

    it('should apply dependent exemption for multiple dependents', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'marriedJointly',
        stateDependents: 2,
        federalResult: createFederalResult($(100000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          numberOfDependents: 2,
        }
      };

      const result = computeSC2025(input);

      // Standard deduction: $30,000
      // Personal exemption: $5,600 (MFJ)
      // Dependent exemption: $2,800 × 2 = $5,600
      // Taxable: $100,000 - $30,000 - $5,600 - $5,600 = $58,800
      expect(result.stateTaxableIncome).toBe($(58800));
      expect(result.stateCredits?.dependent_exemption).toBe($(5600));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(40000)),
        stateWithheld: $(2000),
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      expect(result.stateWithheld).toBe($(2000));
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Should be refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(80000)),
        stateWithheld: $(1500),
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      expect(result.stateWithheld).toBe($(1500));
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Should owe
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: $(1000),
        stateEstPayments: $(1000)
      };

      const result = computeSC2025(input);

      expect(result.stateEstPayments).toBe($(1000));
      const totalPayments = result.stateWithheld + result.stateEstPayments;
      expect(totalPayments).toBe($(2000));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult(0),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      expect(result.stateAGI).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle income below standard deduction', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(15000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // $15,000 - $15,000 (SD) - $2,800 (PE) = negative → $0 taxable
      expect(result.stateAGI).toBe($(15000));
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high income', () => {
      const input: StateTaxInput = {
        state: 'SC',
        filingStatus: 'single',
        federalResult: createFederalResult($(500000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeSC2025(input);

      // Most income at top 6.2% rate
      expect(result.stateAGI).toBe($(500000));
      expect(result.stateTaxableIncome).toBe($(482200)); // $500k - $15k - $2.8k
      expect(result.stateTax).toBeGreaterThan($(29000)); // ~6.2% of ~$482k
    });
  });
});
