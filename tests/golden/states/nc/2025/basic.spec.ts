/**
 * Basic Golden Tests for North Carolina State Tax 2025
 *
 * Tests cover:
 * - Flat 4.25% tax rate
 * - Standard deduction ($12,750 single / $25,500 MFJ / $19,125 HOH)
 * - No personal exemptions
 * - All filing statuses
 * - MFS spouse itemizing rule
 */

import { describe, it, expect } from 'vitest';
import { computeNC2025 } from '../../../../../src/engine/states/NC/2025/computeNC2025';
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

describe('North Carolina 2025 State Tax - Basic Tests', () => {
  describe('Basic Tax Calculation - Flat Rate', () => {
    it('should calculate tax for single filer with moderate income', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $50,000
      // Standard deduction: $12,750
      // Taxable income: $50,000 - $12,750 = $37,250
      // Tax: $37,250 × 4.25% = $1,583.13 (rounded)
      expect(result.stateAGI).toBe($(50000));
      expect(result.stateDeduction).toBe($(12750));
      expect(result.stateTaxableIncome).toBe($(37250));
      expect(result.stateTax).toBe($(1583.13));
    });

    it('should calculate tax for high earner', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $150,000
      // Standard deduction: $12,750
      // Taxable income: $150,000 - $12,750 = $137,250
      // Tax: $137,250 × 4.25% = $5,833.13 (rounded)
      expect(result.stateTaxableIncome).toBe($(137250));
      expect(result.stateTax).toBe($(5833.13));
    });

    it('should calculate no tax when income is below standard deduction', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(10000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $10,000
      // Standard deduction: $12,750
      // Taxable income: $0 (cannot be negative)
      // Tax: $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('Standard Deduction - All Filing Statuses', () => {
    it('should apply $12,750 standard deduction for single filer', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      expect(result.stateDeduction).toBe($(12750));
    });

    it('should apply $25,500 standard deduction for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(80000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $80,000
      // Standard deduction: $25,500
      // Taxable income: $80,000 - $25,500 = $54,500
      // Tax: $54,500 × 4.25% = $2,316.25
      expect(result.stateDeduction).toBe($(25500));
      expect(result.stateTaxableIncome).toBe($(54500));
      expect(result.stateTax).toBe($(2316.25));
    });

    it('should apply $19,125 standard deduction for head of household', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $60,000
      // Standard deduction: $19,125
      // Taxable income: $60,000 - $19,125 = $40,875
      // Tax: $40,875 × 4.25% = $1,737.19
      expect(result.stateDeduction).toBe($(19125));
      expect(result.stateTaxableIncome).toBe($(40875));
      expect(result.stateTax).toBe($(1737.19));
    });

    it('should apply $12,750 standard deduction for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(40000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      expect(result.stateDeduction).toBe($(12750));
    });
  });

  describe('Married Filing Separately - Spouse Itemizing Rule', () => {
    it('should apply $0 standard deduction if spouse is itemizing', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(40000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          spouseItemizing: true
        }
      };

      const result = computeNC2025(input);

      // AGI: $40,000
      // Standard deduction: $0 (spouse is itemizing)
      // Taxable income: $40,000
      // Tax: $40,000 × 4.25% = $1,700
      expect(result.stateDeduction).toBe(0);
      expect(result.stateTaxableIncome).toBe($(40000));
      expect(result.stateTax).toBe($(1700));
    });

    it('should apply standard deduction if spouse is NOT itemizing', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(40000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          spouseItemizing: false
        }
      };

      const result = computeNC2025(input);

      // Standard deduction should apply
      expect(result.stateDeduction).toBe($(12750));
      expect(result.stateTaxableIncome).toBe($(27250));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: $(2000),
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // Tax: $1,583.13 (calculated earlier)
      // Withholding: $2,000
      // Refund: $2,000 - $1,583.13 = $416.87
      expect(result.stateTax).toBe($(1583.13));
      expect(result.stateRefundOrOwe).toBe($(416.87));
    });

    it('should calculate amount owed when withholding is less than tax', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000)),
        stateWithheld: $(5000),
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // Tax: $5,833.13 (calculated earlier)
      // Withholding: $5,000
      // Owe: $5,000 - $5,833.13 = -$833.13 (negative = amount owed)
      expect(result.stateTax).toBe($(5833.13));
      expect(result.stateRefundOrOwe).toBe($(-833.13));
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(75000)),
        stateWithheld: $(1500),
        stateEstPayments: $(1000)
      };

      const result = computeNC2025(input);

      // AGI: $75,000
      // Taxable: $75,000 - $12,750 = $62,250
      // Tax: $62,250 × 4.25% = $2,645.63
      // Total payments: $1,500 + $1,000 = $2,500
      // Owe: $2,500 - $2,645.63 = -$145.63
      expect(result.stateTax).toBe($(2645.63));
      expect(result.stateWithheld).toBe($(1500));
      expect(result.stateEstPayments).toBe($(1000));
      expect(result.stateRefundOrOwe).toBe($(-145.63));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult(0),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
    });

    it('should handle income exactly at standard deduction', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(12750)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $12,750
      // Standard deduction: $12,750
      // Taxable income: $0
      // Tax: $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high income (millionaire)', () => {
      const input: StateTaxInput = {
        state: 'NC',
        filingStatus: 'single',
        federalResult: createFederalResult($(1000000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeNC2025(input);

      // AGI: $1,000,000
      // Standard deduction: $12,750
      // Taxable income: $987,250
      // Tax: $987,250 × 4.25% = $41,958.13
      expect(result.stateTaxableIncome).toBe($(987250));
      expect(result.stateTax).toBe($(41958.13));
    });
  });
});
