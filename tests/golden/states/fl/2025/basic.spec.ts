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
import type { FloridaInput2025 } from '../../../../../src/engine/states/FL/2025/computeFL2025';

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
        const result = computeFL2025({
          filingStatus: 'single',
          federalAGI: agi,
        });

        expect(result.stateTax, `${label} should have zero tax`).toBe(0);
        expect(result.stateTaxableIncome).toBe(0);
        expect(result.totalStateLiability).toBe(0);
      });
    });

    it('should return zero tax for all filing statuses', () => {
      const filingStatuses = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'] as const;

      filingStatuses.forEach(status => {
        const result = computeFL2025({
          filingStatus: status,
          federalAGI: 10000000,
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeFL2025({
        filingStatus: 'single',
        federalAGI: 5000000,
      });

      expect(result.state).toBe('FL');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention constitutional prohibition in notes', () => {
      const result = computeFL2025({
        filingStatus: 'single',
        federalAGI: 5000000,
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Constitution');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention retirement destination', () => {
      const result = computeFL2025({
        filingStatus: 'single',
        federalAGI: 5000000,
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('retirement');
    });
  });
});
