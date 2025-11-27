/**
 * Wyoming State Tax 2025 - Basic Test Suite
 *
 * Tests Wyoming's NO income tax system.
 * Wyoming has never had a state income tax and is the least populous state.
 */

import { describe, it, expect } from 'vitest';
import { computeWY2025 } from '../../../../../src/engine/states/WY/2025/computeWY2025';
import type { WyomingInput2025 } from '../../../../../src/engine/states/WY/2025/computeWY2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('Wyoming 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for all income levels', () => {
      const testCases = [
        { agi: 3000000, label: 'low income' },
        { agi: 7000000, label: 'middle income' },
        { agi: 15000000, label: 'high income' },
        { agi: 50000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeWY2025({
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
        const result = computeWY2025({
          filingStatus: status,
          federalAGI: dollarsToCents(70000),
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeWY2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(55000),
      });

      expect(result.state).toBe('WY');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention Wyoming has never had income tax', () => {
      const result = computeWY2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(55000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('never had');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention constitutional protection', () => {
      const result = computeWY2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(55000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Constitutional protection');
    });

    it('should mention mineral extraction revenue', () => {
      const result = computeWY2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(55000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('mineral extraction');
    });

    it('should mention lowest population', () => {
      const result = computeWY2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(55000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Lowest population');
    });
  });

  describe('Federal AGI Preservation', () => {
    it('should preserve federal AGI as state AGI', () => {
      const testAGI = dollarsToCents(120000);
      const result = computeWY2025({
        filingStatus: 'marriedJointly',
        federalAGI: testAGI,
      });

      expect(result.stateAGI).toBe(testAGI);
    });
  });
});
