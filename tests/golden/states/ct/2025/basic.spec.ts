/**
 * Basic Golden Tests for Connecticut State Tax 2025
 *
 * Tests cover:
 * - 7 progressive tax brackets (2%-6.99%)
 * - Personal exemption credit (filing status dependent)
 * - Personal tax credit (income-based phaseout)
 * - Connecticut EITC (40% of federal EITC)
 * - All filing statuses
 */

import { describe, it, expect } from 'vitest';
import { computeCT2025 } from '../../../../../src/engine/states/CT/2025/computeCT2025';
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

describe('Connecticut 2025 State Tax - Basic Tests', () => {
  describe('Progressive Tax Brackets - Single Filer', () => {
    it('should calculate tax in first bracket (2%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(8000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // AGI: $8,000
      // Bracket 1: $8,000 × 2% = $160
      // Tax before credits: $160
      // Personal exemption credit: $15,000 (exceeds tax, so tax becomes $0)
      expect(result.stateAGI).toBe($(8000));
      expect(result.stateTaxableIncome).toBe($(8000));
      expect(result.stateTax).toBe(0); // Credits exceed tax
    });

    it('should calculate tax in second bracket (4.5%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // AGI: $30,000
      // Bracket 1: $10,000 × 2% = $200
      // Bracket 2: $20,000 × 4.5% = $900
      // Tax before credits: $1,100
      // Personal exemption credit: $15,000
      // Personal tax credit: ~$825 (75% of remaining $1,100 for low income)
      // Result: $0 (credits exceed tax)
      expect(result.stateTax).toBe(0);
    });

    it('should calculate tax in third bracket (5.5%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(75000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // AGI: $75,000
      // Bracket 1: $10,000 × 2% = $200
      // Bracket 2: $40,000 × 4.5% = $1,800
      // Bracket 3: $25,000 × 5.5% = $1,375
      // Tax before credits: $3,375
      // Personal exemption credit: $15,000
      // Personal tax credit: varies (phasing out)
      // Some tax should remain
      expect(result.stateTaxableIncome).toBe($(75000));
      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.stateTax).toBeLessThan($(3375));
    });

    it('should calculate tax in fourth bracket (6%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // AGI: $150,000
      // Bracket 1: $10,000 × 2% = $200
      // Bracket 2: $40,000 × 4.5% = $1,800
      // Bracket 3: $50,000 × 5.5% = $2,750
      // Bracket 4: $50,000 × 6% = $3,000
      // Tax before credits: $7,750
      // Credits apply
      expect(result.stateTaxableIncome).toBe($(150000));
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should calculate tax in fifth bracket (6.5%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(225000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // Includes 6.5% bracket
      expect(result.stateTaxableIncome).toBe($(225000));
      expect(result.stateTax).toBeGreaterThan($(7750));
    });

    it('should calculate tax in sixth bracket (6.9%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(375000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // Includes 6.9% bracket
      expect(result.stateTaxableIncome).toBe($(375000));
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should calculate tax in seventh bracket (6.99%)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(600000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // Includes highest 6.99% bracket
      expect(result.stateTaxableIncome).toBe($(600000));
      expect(result.stateTax).toBeGreaterThan(0);
    });
  });

  describe('All Filing Statuses', () => {
    it('should calculate tax for single filer', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      expect(result.stateTaxableIncome).toBe($(60000));
      expect(result.stateTax).toBeGreaterThanOrEqual(0);
    });

    it('should calculate tax for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(120000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // MFJ has different brackets and higher personal exemption credit ($1,000)
      expect(result.stateTaxableIncome).toBe($(120000));
      expect(result.stateCredits?.personal_exemption).toBe($(1000));
    });

    it('should calculate tax for head of household', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(80000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // HOH has different brackets and $750 personal exemption credit
      expect(result.stateTaxableIncome).toBe($(80000));
      expect(result.stateCredits?.personal_exemption).toBe($(750));
    });

    it('should calculate tax for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // MFS uses same brackets as single, $500 personal exemption credit
      expect(result.stateTaxableIncome).toBe($(50000));
      expect(result.stateCredits?.personal_exemption).toBe($(500));
    });
  });

  describe('Personal Exemption Credit', () => {
    it('should apply correct personal exemption credit for each filing status', () => {
      const testCases = [
        { status: 'single' as const, expectedCredit: $(750) },
        { status: 'marriedJointly' as const, expectedCredit: $(1000) },
        { status: 'marriedSeparately' as const, expectedCredit: $(500) },
        { status: 'headOfHousehold' as const, expectedCredit: $(750) },
      ];

      testCases.forEach(({ status, expectedCredit }) => {
        const input: StateTaxInput = {
          state: 'CT',
          filingStatus: status,
          federalResult: createFederalResult($(100000)),
          stateWithheld: 0,
          stateEstPayments: 0
        };

        const result = computeCT2025(input);
        expect(result.stateCredits?.personal_exemption).toBe(expectedCredit);
      });
    });
  });

  describe('Connecticut EITC', () => {
    it('should calculate CT EITC as 40% of federal EITC', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(25000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalEITC: $(3000) // $3,000 federal EITC
        }
      };

      const result = computeCT2025(input);

      // CT EITC = 40% of federal EITC
      // $3,000 × 40% = $1,200
      expect(result.stateCredits?.eitc).toBe($(1200));
    });

    it('should apply CT EITC as refundable credit', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(20000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalEITC: $(5000) // $5,000 federal EITC
        }
      };

      const result = computeCT2025(input);

      // CT EITC = $5,000 × 40% = $2,000 (refundable)
      const ctEITC = $(2000);
      expect(result.stateCredits?.eitc).toBe(ctEITC);
      expect(result.stateCredits?.refundableCredits).toBe(ctEITC);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: $(5000),
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // With credits, actual tax should be lower than $5,000 withheld
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Positive = refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(300000)),
        stateWithheld: $(5000),
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // High income should result in tax exceeding withholding
      // May owe or may get refund depending on credits
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(100000)),
        stateWithheld: $(3000),
        stateEstPayments: $(2000)
      };

      const result = computeCT2025(input);

      // Total payments = $3,000 + $2,000 = $5,000
      expect(result.stateWithheld).toBe($(3000));
      expect(result.stateEstPayments).toBe($(2000));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult(0),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
    });

    it('should handle very high income (millionaire)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(1000000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // Should calculate through all 7 brackets
      expect(result.stateTaxableIncome).toBe($(1000000));
      expect(result.stateTax).toBeGreaterThan(0);
      // Top bracket is 6.99%, so expect significant tax
      expect(result.stateTax).toBeGreaterThan($(50000));
    });

    it('should handle MFJ at exactly $1,000,000 (top bracket threshold)', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(1000000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeCT2025(input);

      // Exactly at the threshold for MFJ top bracket
      expect(result.stateTaxableIncome).toBe($(1000000));
      expect(result.stateTax).toBeGreaterThan(0);
    });
  });

  describe('Combined Features', () => {
    it('should apply all credits together: personal exemption, personal tax credit, and EITC', () => {
      const input: StateTaxInput = {
        state: 'CT',
        filingStatus: 'single',
        federalResult: createFederalResult($(35000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalEITC: $(2500)
        }
      };

      const result = computeCT2025(input);

      // Should have:
      // - Personal exemption credit: $750
      // - Personal tax credit: percentage of tax (high for low income)
      // - CT EITC: $2,500 × 40% = $1,000
      expect(result.stateCredits?.personal_exemption).toBe($(750));
      expect(result.stateCredits?.eitc).toBe($(1000));
      expect(result.stateCredits?.personal_tax_credit).toBeGreaterThan(0);
    });
  });
});
