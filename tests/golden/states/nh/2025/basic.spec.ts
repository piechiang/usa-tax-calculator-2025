/**
 * New Hampshire State Tax 2025 - Basic Test Suite
 *
 * Tests New Hampshire's NO income tax system (2025+).
 * Major change: Interest & Dividends Tax REPEALED January 1, 2025.
 */

import { describe, it, expect } from 'vitest';
import { computeNH2025 } from '../../../../../src/engine/states/NH/2025/computeNH2025';
import type { NewHampshireInput2025 } from '../../../../../src/engine/states/NH/2025/computeNH2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('New Hampshire 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax (2025+)', () => {
    it('should return zero tax for all income levels', () => {
      const testCases = [
        { agi: 3500000, label: 'low income' },
        { agi: 8000000, label: 'middle income' },
        { agi: 25000000, label: 'high income' },
        { agi: 75000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeNH2025({
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
        const result = computeNH2025({
          filingStatus: status,
          federalAGI: dollarsToCents(95000),
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeNH2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(85000),
      });

      expect(result.state).toBe('NH');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention Interest & Dividends Tax repeal', () => {
      const result = computeNH2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(85000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Interest & Dividends Tax REPEALED');
      expect(notesText).toContain('January 1, 2025');
    });

    it('should mention no sales tax', () => {
      const result = computeNH2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(85000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('No sales tax');
    });

    it('should mention property taxes', () => {
      const result = computeNH2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(85000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Property taxes');
      expect(notesText).toContain('highest');
    });

    it('should mention "Live Free or Die"', () => {
      const result = computeNH2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(85000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Live Free or Die');
    });
  });

  describe('Federal AGI Preservation', () => {
    it('should preserve federal AGI as state AGI', () => {
      const testAGI = dollarsToCents(175000);
      const result = computeNH2025({
        filingStatus: 'marriedJointly',
        federalAGI: testAGI,
      });

      expect(result.stateAGI).toBe(testAGI);
    });
  });

  describe('2025 Tax Repeal', () => {
    it('should return zero tax on investment income (I&D tax repealed)', () => {
      const result = computeNH2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000), // Could include interest/dividends
      });

      expect(result.stateTax).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });
});
