/**
 * Alaska State Tax 2025 - Basic Test Suite
 *
 * Tests Alaska's NO income tax system.
 * Alaska has never had a state income tax and is unique for the
 * Permanent Fund Dividend (PFD) which pays residents annually from oil revenue.
 */

import { describe, it, expect } from 'vitest';
import { computeAK2025 } from '../../../../../src/engine/states/AK/2025/computeAK2025';
import type { AlaskaInput2025 } from '../../../../../src/engine/states/AK/2025/computeAK2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('Alaska 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for all income levels', () => {
      const testCases = [
        { agi: 2000000, label: 'low income' },
        { agi: 5000000, label: 'middle income' },
        { agi: 20000000, label: 'high income' },
        { agi: 100000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeAK2025({
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
        const result = computeAK2025({
          filingStatus: status,
          federalAGI: dollarsToCents(75000),
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeAK2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
      });

      expect(result.state).toBe('AK');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention Alaska has never had income tax', () => {
      const result = computeAK2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('never had');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention Permanent Fund Dividend (PFD)', () => {
      const result = computeAK2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Permanent Fund Dividend');
      expect(notesText).toContain('PFD');
    });

    it('should mention constitutional protection', () => {
      const result = computeAK2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Constitutional protection');
      expect(notesText).toContain('voter approval');
    });

    it('should mention oil revenue funding', () => {
      const result = computeAK2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('oil revenue');
    });
  });

  describe('Federal AGI Preservation', () => {
    it('should preserve federal AGI as state AGI', () => {
      const testAGI = dollarsToCents(125000);
      const result = computeAK2025({
        filingStatus: 'marriedJointly',
        federalAGI: testAGI,
      });

      expect(result.stateAGI).toBe(testAGI);
    });
  });
});
