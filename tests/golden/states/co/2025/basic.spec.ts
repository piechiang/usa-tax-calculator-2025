/**
 * Basic Golden Tests for Colorado State Tax 2025
 *
 * Tests cover:
 * - Flat 4.40% tax rate
 * - Federal taxable income as base (no state standard deduction)
 * - State income tax addback for high earners
 * - No personal exemptions
 * - All filing statuses
 */

import { describe, it, expect } from 'vitest';
import { computeCO2025 } from '../../../../../src/engine/states/CO/2025/computeCO2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

/**
 * Helper to create a minimal FederalResult2025 for testing
 */
function createFederalResult(agi: number, standardDeduction: number = 0): FederalResult2025 {
  return {
    agi,
    taxableIncome: Math.max(0, agi - standardDeduction),
    standardDeduction,
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

describe('Colorado 2025 State Tax - Basic Tests', () => {
  describe('Basic Tax Calculation - Flat Rate', () => {
    it('should calculate tax for single filer with moderate income', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600) // 2025 federal standard deduction (single)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $50,000
      // Federal standard deduction: $14,600
      // Federal taxable income: $50,000 - $14,600 = $35,400
      // No addback (AGI < $300k)
      // Colorado taxable income: $35,400
      // Tax: $35,400 × 4.40% = $1,557.60
      expect(result.stateAGI).toBe($(50000));
      expect(result.stateTaxableIncome).toBe($(35400));
      expect(result.stateTax).toBe($(1557.60));
    });

    it('should calculate tax for high earner without addback', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $150,000
      // Federal standard deduction: $14,600
      // Federal taxable income: $135,400
      // No addback (AGI < $300k)
      // Tax: $135,400 × 4.40% = $5,957.60
      expect(result.stateTaxableIncome).toBe($(135400));
      expect(result.stateTax).toBe($(5957.60));
    });

    it('should calculate no tax when federal taxable income is zero', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(10000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $10,000
      // Federal standard deduction: $14,600
      // Federal taxable income: $0 (cannot be negative)
      // Tax: $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Income Tax Addback - High Earners', () => {
    it('should apply addback for single filer with AGI > $300k and deduction > $12k', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(350000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $350,000 (exceeds $300k threshold)
      // Federal standard deduction: $14,600
      // Federal taxable income: $335,400
      // Addback: $14,600 - $12,000 = $2,600 (excess deduction)
      // Colorado taxable income: $335,400 + $2,600 = $338,000
      // Tax: $338,000 × 4.40% = $14,872
      expect(result.stateTaxableIncome).toBe($(338000));
      expect(result.stateTax).toBe($(14872));
    });

    it('should apply addback for married filing jointly with AGI > $1M and deduction > $16k', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(1200000), $(29200)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(29200) // 2025 federal standard deduction (MFJ)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $1,200,000 (exceeds $1M threshold)
      // Federal standard deduction: $29,200
      // Federal taxable income: $1,170,800
      // Addback: $29,200 - $16,000 = $13,200 (excess deduction)
      // Colorado taxable income: $1,170,800 + $13,200 = $1,184,000
      // Tax: $1,184,000 × 4.40% = $52,096
      expect(result.stateTaxableIncome).toBe($(1184000));
      expect(result.stateTax).toBe($(52096));
    });

    it('should NOT apply addback when AGI is below threshold', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(250000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $250,000 (below $300k threshold)
      // No addback applies
      // Federal taxable income: $235,400
      // Colorado taxable income: $235,400 (no addback)
      // Tax: $235,400 × 4.40% = $10,357.60
      expect(result.stateTaxableIncome).toBe($(235400));
      expect(result.stateTax).toBe($(10357.60));
    });

    it('should NOT apply addback when deduction is below limit', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(350000), $(10000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(10000) // Below $12k limit
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $350,000 (exceeds $300k threshold)
      // Federal deduction: $10,000 (below $12k limit)
      // No addback (deduction <= limit)
      // Federal taxable income: $340,000
      // Colorado taxable income: $340,000
      // Tax: $340,000 × 4.40% = $14,960
      expect(result.stateTaxableIncome).toBe($(340000));
      expect(result.stateTax).toBe($(14960));
    });
  });

  describe('All Filing Statuses', () => {
    it('should calculate tax for single filer', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal taxable: $60,000 - $14,600 = $45,400
      // Tax: $45,400 × 4.40% = $1,997.60
      expect(result.stateTax).toBe($(1997.60));
    });

    it('should calculate tax for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(100000), $(29200)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(29200)
        }
      };

      const result = computeCO2025(input);

      // Federal taxable: $100,000 - $29,200 = $70,800
      // Tax: $70,800 × 4.40% = $3,115.20
      expect(result.stateTax).toBe($(3115.20));
    });

    it('should calculate tax for head of household', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(75000), $(21900)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(21900) // 2025 federal standard deduction (HOH)
        }
      };

      const result = computeCO2025(input);

      // Federal taxable: $75,000 - $21,900 = $53,100
      // Tax: $53,100 × 4.40% = $2,336.40
      expect(result.stateTax).toBe($(2336.40));
    });

    it('should calculate tax for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(50000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal taxable: $50,000 - $14,600 = $35,400
      // Tax: $35,400 × 4.40% = $1,557.60
      expect(result.stateTax).toBe($(1557.60));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000), $(14600)),
        stateWithheld: $(2000),
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Tax: $1,557.60 (calculated earlier)
      // Withholding: $2,000
      // Refund: $2,000 - $1,557.60 = $442.40
      expect(result.stateTax).toBe($(1557.60));
      expect(result.stateRefundOrOwe).toBe($(442.40));
    });

    it('should calculate amount owed when withholding is less than tax', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000), $(14600)),
        stateWithheld: $(5000),
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Tax: $5,957.60 (calculated earlier)
      // Withholding: $5,000
      // Owe: $5,000 - $5,957.60 = -$957.60 (negative = amount owed)
      expect(result.stateTax).toBe($(5957.60));
      expect(result.stateRefundOrOwe).toBe($(-957.60));
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(80000), $(14600)),
        stateWithheld: $(2000),
        stateEstPayments: $(1000),
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal taxable: $80,000 - $14,600 = $65,400
      // Tax: $65,400 × 4.40% = $2,877.60
      // Total payments: $2,000 + $1,000 = $3,000
      // Refund: $3,000 - $2,877.60 = $122.40
      expect(result.stateTax).toBe($(2877.60));
      expect(result.stateWithheld).toBe($(2000));
      expect(result.stateEstPayments).toBe($(1000));
      expect(result.stateRefundOrOwe).toBe($(122.40));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult(0, 0),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: 0
        }
      };

      const result = computeCO2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
    });

    it('should handle income exactly at federal standard deduction', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(14600), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $14,600
      // Federal standard deduction: $14,600
      // Federal taxable income: $0
      // Tax: $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high income (millionaire)', () => {
      const input: StateTaxInput = {
        state: 'CO',
        filingStatus: 'single',
        federalResult: createFederalResult($(2000000), $(14600)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalDeduction: $(14600)
        }
      };

      const result = computeCO2025(input);

      // Federal AGI: $2,000,000 (exceeds $300k threshold)
      // Federal standard deduction: $14,600
      // Federal taxable income: $1,985,400
      // Addback: $14,600 - $12,000 = $2,600
      // Colorado taxable income: $1,985,400 + $2,600 = $1,988,000
      // Tax: $1,988,000 × 4.40% = $87,472
      expect(result.stateTaxableIncome).toBe($(1988000));
      expect(result.stateTax).toBe($(87472));
    });
  });
});
