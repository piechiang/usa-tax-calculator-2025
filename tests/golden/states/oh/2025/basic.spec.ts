/**
 * Basic Golden Tests for Ohio State Tax 2025
 *
 * Tests cover:
 * - All 3 tax brackets (0%, 2.75%, 3.125%)
 * - Standard deduction ($2,400 single / $4,800 MFJ)
 * - Income-based personal exemptions ($2,350, $2,100, $1,850)
 * - $20 personal exemption credit (income < $30k)
 * - Joint filing credit for MFJ
 * - MAGI cap of $750,000
 */

import { describe, it, expect } from 'vitest';
import { computeOH2025 } from '../../../../../src/engine/states/OH/2025/computeOH2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

/**
 * Helper to create a minimal FederalResult2025 for testing
 */
function createFederalResult(agi: number): FederalResult2025 {
  return {
    agi,
    taxableIncome: agi,
    standardDeduction: 0,
    taxBeforeCredits: 0,
    credits: {},
    totalTax: 0,
    totalPayments: 0,
    refundOrOwe: 0,
    diagnostics: {
      warnings: [],
      errors: []
    }
  };
}

/**
 * Dollar amount helper for readability
 */
const $ = (amount: number): number => Math.round(amount * 100);

describe('Ohio 2025 State Tax - Basic Tests', () => {
  describe('Basic Tax Calculation - All Brackets', () => {
    it('should calculate no tax for income below $26,050 threshold', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(20000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // AGI: $20,000
      // Standard deduction: $2,400
      // Personal exemption: $2,350 (MAGI $20k ≤ $40k)
      // Total deductions: $4,750
      // Taxable income: $20,000 - $4,750 = $15,250
      // Tax: $15,250 × 0% = $0
      expect(result.stateTax).toBe(0);
      expect(result.stateAGI).toBe($(20000));
      expect(result.stateDeduction).toBe($(4750));
      expect(result.stateTaxableIncome).toBe($(15250));
    });

    it('should calculate tax in first taxable bracket (2.75%)', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // AGI: $50,000
      // Standard deduction: $2,400
      // Personal exemption: $2,100 (MAGI $50k > $40k but ≤ $80k)
      // Total deductions: $4,500
      // Taxable income: $50,000 - $4,500 = $45,500
      // Tax calculation:
      // - $0-$26,050: $26,050 × 0% = $0
      // - $26,051-$45,500: $19,450 × 2.75% = $534.875 → $534.88
      // Total: $534.88
      expect(result.stateTax).toBe($(534.88));
      expect(result.stateTaxableIncome).toBe($(45500));
    });

    it('should calculate tax in second bracket (3.125%)', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(150000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // AGI: $150,000
      // Standard deduction: $2,400
      // Personal exemption: $1,850 (MAGI $150k > $80k)
      // Total deductions: $4,250
      // Taxable income: $150,000 - $4,250 = $145,750
      // Tax calculation:
      // - $0-$26,050: $0
      // - $26,051-$100,000: ($100,000 - $26,050) = $73,950 × 2.75% = $2,033.625 → $2,033.63
      // - $100,001-$145,750: $45,750 × 3.125% = $1,429.6875 → $1,429.69
      // Total: $2,033.63 + $1,429.69 = $3,463.32
      expect(result.stateTax).toBe($(3463.32));
      expect(result.stateTaxableIncome).toBe($(145750));
    });
  });

  describe('Income-Based Personal Exemptions', () => {
    it('should apply $2,350 exemption for MAGI ≤ $40,000 (single)', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(35000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Personal exemption: $2,350 (MAGI $35k ≤ $40k)
      expect(result.stateExemptions).toBe($(2350));
    });

    it('should apply $2,100 exemption for $40,000 < MAGI ≤ $80,000', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Personal exemption: $2,100 (MAGI $60k > $40k but ≤ $80k)
      expect(result.stateExemptions).toBe($(2100));
    });

    it('should apply $1,850 exemption for MAGI > $80,000', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(120000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Personal exemption: $1,850 (MAGI $120k > $80k)
      expect(result.stateExemptions).toBe($(1850));
    });

    it('should deny exemptions for MAGI > $750,000', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(800000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // No exemptions due to MAGI cap
      expect(result.stateExemptions).toBe(0);
      // Only standard deduction applies
      expect(result.stateDeduction).toBe($(2400));
    });
  });

  describe('Married Filing Jointly', () => {
    it('should apply $4,800 standard deduction for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'marriedJointly',
        stateDependents: 0,
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Standard deduction: $4,800
      // Personal exemption: $2,100 × 2 = $4,200 (MAGI $60k, 2 people)
      expect(result.stateDeduction).toBe($(9000)); // $4,800 + $4,200
    });

    it('should apply joint filing credit for MFJ', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'marriedJointly',
        stateDependents: 0,
        federalResult: createFederalResult($(80000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Joint filing credit: $650 (MAGI < $750k)
      expect(result.stateCredits.nonRefundableCredits).toBe($(650));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(50000)),
        stateWithheld: $(1000),
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Tax: $534.88 (calculated earlier)
      // Withholding: $1,000
      // Refund: $1,000 - $534.88 = $465.12
      expect(result.stateTax).toBe($(534.88));
      expect(result.stateRefundOrOwe).toBe($(465.12));
    });

    it('should calculate amount owed when withholding is less than tax', () => {
      const input: StateTaxInput = {
        state: 'OH',
        filingStatus: 'single',
        stateDependents: 0,
        federalResult: createFederalResult($(150000)),
        stateWithheld: $(2000),
        stateEstPayments: 0
      };

      const result = computeOH2025(input);

      // Tax: $3,463.32 (calculated earlier)
      // Withholding: $2,000
      // Owe: $2,000 - $3,463.32 = -$1,463.32 (negative = amount owed)
      expect(result.stateTax).toBe($(3463.32));
      expect(result.stateRefundOrOwe).toBe($(-1463.32));
    });
  });
});
