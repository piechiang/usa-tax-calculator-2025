/**
 * Florida State Tax 2025 - Basic Test Suite
 *
 * Tests Florida's NO income tax system.
 * Florida has never had a state income tax and is constitutionally
 * prohibited from implementing one.
 * Popular retirement destination due to no tax on retirement income.
 */

import { describe, it, expect } from 'vitest';
import { computeFL2025 } from '../../../../../src/engine/states/FL/2025/computeFL2025';
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
    state: 'FL',
    stateWithheld: 0,
    ...overrides,
  };
}

describe('Florida 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for all income levels', () => {
      const testCases = [
        { agi: 2500000, label: 'low income' },
        { agi: 5000000, label: 'middle income' },
        { agi: 50000000, label: 'high income' },
        { agi: 500000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeFL2025(makeInput(agi));

        expect(result.stateTax, `${label} should have zero tax`).toBe(0);
        expect(result.stateTaxableIncome).toBe(0);
        expect(result.totalStateLiability).toBe(0);
      });
    });

    it('should return zero tax for all filing statuses', () => {
      const filingStatuses = [
        'single',
        'marriedJointly',
        'marriedSeparately',
        'headOfHousehold',
      ] as const;

      filingStatuses.forEach((status) => {
        const result = computeFL2025(makeInput(10000000, status));

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeFL2025(makeInput(5000000));

      expect(result.state).toBe('FL');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention constitutional prohibition in notes', () => {
      const result = computeFL2025(makeInput(5000000));

      const notesText = result.calculationNotes!.join(' ');
      expect(notesText).toContain('Constitution');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention retirement destination', () => {
      const result = computeFL2025(makeInput(5000000));

      const notesText = result.calculationNotes!.join(' ');
      expect(notesText).toContain('retirement');
    });
  });

  describe('AGI Handling', () => {
    it('should preserve federal AGI as state AGI', () => {
      const result = computeFL2025(makeInput(5000000));

      expect(result.stateAGI).toBe(5000000);
    });
  });

  describe('Payments and Refunds', () => {
    it('should have zero withholding when none provided', () => {
      const result = computeFL2025(makeInput(5000000));

      expect(result.stateWithheld).toBe(0);
      expect(result.stateEstPayments).toBe(0);
      expect(result.stateRefundOrOwe).toBe(0);
    });

    it('should return full withholding as refund (no state tax owed)', () => {
      const result = computeFL2025(
        makeInput(5000000, 'single', { stateWithheld: 50000, stateEstPayments: 10000 })
      );

      expect(result.stateWithheld).toBe(50000);
      expect(result.stateEstPayments).toBe(10000);
      expect(result.stateRefundOrOwe).toBe(60000);
    });
  });
});
