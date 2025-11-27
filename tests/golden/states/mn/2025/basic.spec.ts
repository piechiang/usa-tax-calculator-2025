/**
 * Minnesota State Tax Tests for 2025
 *
 * Tests Minnesota's 4-bracket progressive system with:
 * - Standard deduction ($14,950 single / $29,900 MFJ)
 * - Dependent exemption
 * - Progressive rates: 5.35%, 6.80%, 7.85%, 9.85%
 */

import { describe, it, expect } from 'vitest';
import { computeMN2025 } from '../../../../../src/engine/states/MN/2025/computeMN2025';
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

describe('Minnesota 2025 State Tax - Basic Tests', () => {
  describe('Progressive Tax Brackets - Single Filer', () => {
    it('should calculate tax in first bracket (5.35%)', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(25000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // MN AGI: $25,000
      // Standard deduction: $14,950
      // Taxable income: $25,000 - $14,950 = $10,050
      // Tax: $10,050 × 5.35% = $538
      expect(result.stateAGI).toBe($(25000));
      expect(result.stateTaxableIncome).toBe($(10050));
      expect(result.stateTax).toBeGreaterThan($(500));
      expect(result.stateTax).toBeLessThan($(600));
    });

    it('should calculate tax in second bracket (6.80%)', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // MN AGI: $60,000
      // Standard deduction: $14,950
      // Taxable income: $60,000 - $14,950 = $45,050
      // Bracket 1: $32,570 × 5.35% = $1,742
      // Bracket 2: $12,480 × 6.80% = $849
      // Tax: ~$2,591
      expect(result.stateAGI).toBe($(60000));
      expect(result.stateTaxableIncome).toBe($(45050));
      expect(result.stateTax).toBeGreaterThan($(2500));
      expect(result.stateTax).toBeLessThan($(2700));
    });

    it('should calculate tax in third bracket (7.85%)', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // MN AGI: $150,000
      // Standard deduction: $14,950
      // Taxable income: $150,000 - $14,950 = $135,050
      expect(result.stateAGI).toBe($(150000));
      expect(result.stateTaxableIncome).toBe($(135050));
      expect(result.stateTax).toBeGreaterThan($(8000));
    });

    it('should calculate tax in fourth bracket (9.85%)', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(250000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // MN AGI: $250,000
      // Standard deduction: $14,950
      // Taxable income: $250,000 - $14,950 = $235,050
      // Includes top bracket income
      expect(result.stateAGI).toBe($(250000));
      expect(result.stateTaxableIncome).toBe($(235050));
      expect(result.stateTax).toBeGreaterThan($(15000));
    });
  });

  describe('All Filing Statuses', () => {
    it('should calculate tax for single filer', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      expect(result.stateTaxableIncome).toBe($(35050)); // $50k - $14,950
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should calculate tax for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(100000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // MFJ has higher standard deduction ($29,900)
      expect(result.stateAGI).toBe($(100000));
      expect(result.stateTaxableIncome).toBe($(70100)); // $100k - $29,900
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should calculate tax for head of household', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(75000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // HOH has different brackets and standard deduction
      expect(result.stateAGI).toBe($(75000));
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should calculate tax for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(45000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // MFS uses same standard deduction as single
      expect(result.stateAGI).toBe($(45000));
      expect(result.stateTaxableIncome).toBe($(30050)); // $45k - $14,950
      expect(result.stateTax).toBeGreaterThan(0);
    });
  });

  describe('Dependent Exemption', () => {
    it('should apply dependent exemption for one dependent', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        stateDependents: 1,
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          numberOfDependents: 1,
        }
      };

      const result = computeMN2025(input);

      // Standard deduction: $14,950
      // Dependent exemption: $4,900
      // Taxable: $50,000 - $14,950 - $4,900 = $30,150
      expect(result.stateTaxableIncome).toBe($(30150));
      expect(result.stateCredits?.dependent_exemption).toBe($(4900));
    });

    it('should apply dependent exemption for multiple dependents', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'marriedJointly',
        stateDependents: 3,
        federalResult: createFederalResult($(100000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          numberOfDependents: 3,
        }
      };

      const result = computeMN2025(input);

      // Standard deduction: $29,900
      // Dependent exemption: $4,900 × 3 = $14,700
      // Taxable: $100,000 - $29,900 - $14,700 = $55,400
      expect(result.stateTaxableIncome).toBe($(55400));
      expect(result.stateCredits?.dependent_exemption).toBe($(14700));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(40000)),
        stateWithheld: $(3000),
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      expect(result.stateWithheld).toBe($(3000));
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Should be refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(80000)),
        stateWithheld: $(2000),
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      expect(result.stateWithheld).toBe($(2000));
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Should owe
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: $(1000),
        stateEstPayments: $(1500)
      };

      const result = computeMN2025(input);

      expect(result.stateEstPayments).toBe($(1500));
      const totalPayments = result.stateWithheld + result.stateEstPayments;
      expect(totalPayments).toBe($(2500));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult(0),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      expect(result.stateAGI).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle income below standard deduction', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(10000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // $10,000 - $14,950 = negative → $0 taxable
      expect(result.stateAGI).toBe($(10000));
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high income', () => {
      const input: StateTaxInput = {
        state: 'MN',
        filingStatus: 'single',
        federalResult: createFederalResult($(500000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeMN2025(input);

      // Should be in top bracket (9.85%)
      expect(result.stateAGI).toBe($(500000));
      expect(result.stateTaxableIncome).toBe($(485050));
      expect(result.stateTax).toBeGreaterThan($(40000));
    });
  });
});
