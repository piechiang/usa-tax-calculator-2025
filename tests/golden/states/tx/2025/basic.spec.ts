/**
 * Texas State Tax 2025 - Basic Test Suite
 *
 * Tests Texas's NO income tax system.
 * Texas has never had a state income tax and is constitutionally
 * prohibited from implementing one without voter approval.
 */

import { describe, it, expect } from 'vitest';
import { computeTX2025 } from '../../../../../src/engine/states/TX/2025/computeTX2025';
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
    state: 'TX',
    stateWithheld: 0,
    ...overrides,
  };
}

describe('Texas 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for low income', () => {
      const result = computeTX2025(makeInput(2500000)); // $25,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for middle income', () => {
      const result = computeTX2025(makeInput(5000000)); // $50,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for high income', () => {
      const result = computeTX2025(makeInput(100000000)); // $1,000,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for married filing jointly', () => {
      const result = computeTX2025(makeInput(15000000, 'marriedJointly')); // $150,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });

    it('should return zero tax for head of household', () => {
      const result = computeTX2025(makeInput(7500000, 'headOfHousehold')); // $75,000

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });

  describe('No Deductions or Exemptions', () => {
    it('should have zero standard deduction', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should have zero credits', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.stateCredits.nonRefundableCredits).toBe(0);
      expect(result.stateCredits.refundableCredits).toBe(0);
    });
  });

  describe('AGI Handling', () => {
    it('should preserve federal AGI as state AGI', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.stateAGI).toBe(5000000);
    });

    it('should handle zero AGI', () => {
      const result = computeTX2025(makeInput(0));

      expect(result.stateAGI).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high AGI', () => {
      const result = computeTX2025(makeInput(500000000)); // $5,000,000

      expect(result.stateAGI).toBe(500000000);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('State Metadata', () => {
    it('should include correct state code', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.state).toBe('TX');
    });

    it('should include correct tax year', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.taxYear).toBe(2025);
    });

    it('should include calculation notes about no income tax', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.calculationNotes).toBeDefined();
      expect(result.calculationNotes!.length).toBeGreaterThan(0);
      expect(result.calculationNotes!.some((note) => note.includes('NO state income tax'))).toBe(
        true
      );
    });

    it('should mention constitutional protection', () => {
      const result = computeTX2025(makeInput(5000000));

      const notesText = result.calculationNotes!.join(' ');
      expect(notesText).toContain('Constitution');
    });

    it('should have zero local tax', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.localTax).toBe(0);
    });
  });

  describe('Payments and Refunds', () => {
    it('should have zero withholding when none provided', () => {
      const result = computeTX2025(makeInput(5000000));

      expect(result.stateWithheld).toBe(0);
      expect(result.stateEstPayments).toBe(0);
      expect(result.stateRefundOrOwe).toBe(0);
    });

    it('should return full withholding as refund (no state tax owed)', () => {
      const result = computeTX2025(
        makeInput(5000000, 'single', { stateWithheld: 50000, stateEstPayments: 10000 })
      );

      expect(result.stateWithheld).toBe(50000);
      expect(result.stateEstPayments).toBe(10000);
      expect(result.stateRefundOrOwe).toBe(60000);
    });
  });
});
