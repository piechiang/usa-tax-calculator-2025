/**
 * South Dakota State Tax 2025 - Basic Test Suite
 *
 * Tests South Dakota's NO income tax system.
 * South Dakota has never had a state income tax and is known for
 * its trust industry and business-friendly environment.
 */

import { describe, it, expect } from 'vitest';
import { computeSD2025 } from '../../../../../src/engine/states/SD/2025/computeSD2025';
import type { SouthDakotaInput2025 } from '../../../../../src/engine/states/SD/2025/computeSD2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('South Dakota 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for all income levels', () => {
      const testCases = [
        { agi: 2500000, label: 'low income' },
        { agi: 6000000, label: 'middle income' },
        { agi: 20000000, label: 'high income' },
        { agi: 50000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeSD2025({
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
        const result = computeSD2025({
          filingStatus: status,
          federalAGI: dollarsToCents(80000),
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeSD2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(60000),
      });

      expect(result.state).toBe('SD');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention South Dakota has never had income tax', () => {
      const result = computeSD2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(60000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('never had');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention trust industry', () => {
      const result = computeSD2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(60000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('trust industry');
    });

    it('should mention business-friendly environment', () => {
      const result = computeSD2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(60000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Business-friendly');
    });

    it('should mention no corporate income tax', () => {
      const result = computeSD2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(60000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('No corporate income tax');
    });

    it('should mention no personal property tax', () => {
      const result = computeSD2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(60000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('no personal property tax');
    });
  });

  describe('Federal AGI Preservation', () => {
    it('should preserve federal AGI as state AGI', () => {
      const testAGI = dollarsToCents(150000);
      const result = computeSD2025({
        filingStatus: 'marriedJointly',
        federalAGI: testAGI,
      });

      expect(result.stateAGI).toBe(testAGI);
    });
  });
});
