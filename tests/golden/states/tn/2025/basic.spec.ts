/**
 * Tennessee State Tax 2025 - Basic Test Suite
 *
 * Tests Tennessee's NO income tax system.
 * Tennessee eliminated the Hall Tax (6% on investment income) on January 1, 2021,
 * making it one of 9 states with no income tax.
 */

import { describe, it, expect } from 'vitest';
import { computeTN2025 } from '../../../../../src/engine/states/TN/2025/computeTN2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

// Minimal FederalResult2025 satisfying all required fields
const BASE_FEDERAL: FederalResult2025 = {
  agi: 0,
  taxableIncome: 0,
  deductionType: 'standard',
  standardDeduction: 0,
  taxBeforeCredits: 0,
  credits: {},
  totalTax: 0,
  totalPayments: 0,
  refundOrOwe: 0,
  diagnostics: { warnings: [], errors: [] },
};

function makeInput(
  federalAGI: number,
  filingStatus: 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold' = 'single',
  overrides: Partial<StateTaxInput> = {}
): StateTaxInput {
  return {
    federalResult: { ...BASE_FEDERAL, agi: federalAGI },
    filingStatus,
    state: 'TN',
    stateWithheld: 0,
    ...overrides,
  };
}

describe('Tennessee 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for low income', () => {
      const result = computeTN2025(makeInput(2500000)); // $25,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for middle income', () => {
      const result = computeTN2025(makeInput(5000000)); // $50,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for high income', () => {
      const result = computeTN2025(makeInput(50000000)); // $500,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for married filing jointly', () => {
      const result = computeTN2025(makeInput(10000000, 'marriedJointly')); // $100,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for head of household', () => {
      const result = computeTN2025(makeInput(7500000, 'headOfHousehold')); // $75,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });

  describe('No Deductions or Exemptions', () => {
    it('should have zero standard deduction', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should have zero credits', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.stateCredits.nonRefundableCredits).toBe(0);
      expect(result.stateCredits.refundableCredits).toBe(0);
    });
  });

  describe('AGI Handling', () => {
    it('should preserve federal AGI as state AGI', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.stateAGI).toBe(5000000);
    });

    it('should handle zero AGI', () => {
      const result = computeTN2025(makeInput(0));

      expect(result.stateAGI).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high AGI', () => {
      const result = computeTN2025(makeInput(100000000)); // $1,000,000

      expect(result.stateAGI).toBe(100000000);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state code', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.state).toBe('TN');
    });

    it('should include correct tax year', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.taxYear).toBe(2025);
    });

    it('should include calculation notes about no income tax', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes!.length).toBeGreaterThan(0);
      expect(result.calculationNotes!.some((note) => note.includes('NO state income tax'))).toBe(
        true
      );
    });

    it('should have zero local tax', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.localTax).toBe(0);
    });
  });

  describe('Payments and Refunds', () => {
    it('should have zero withholding when none provided', () => {
      const result = computeTN2025(makeInput(5000000));

      expect(result.stateWithheld).toBe(0);
      expect(result.stateEstPayments).toBe(0);
      expect(result.stateRefundOrOwe).toBe(0);
    });

    it('should return full withholding as refund (no state tax owed)', () => {
      const result = computeTN2025(
        makeInput(5000000, 'single', { stateWithheld: 50000, stateEstPayments: 10000 })
      );

      expect(result.stateWithheld).toBe(50000);
      expect(result.stateEstPayments).toBe(10000);
      expect(result.stateRefundOrOwe).toBe(60000);
    });
  });
});
