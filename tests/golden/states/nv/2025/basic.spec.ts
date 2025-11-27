/**
 * Nevada State Tax 2025 - Basic Test Suite
 *
 * Tests Nevada's NO income tax system.
 * Nevada has never had a state income tax and relies on
 * gaming (casino) revenue instead.
 */

import { describe, it, expect } from 'vitest';
import { computeNV2025 } from '../../../../../src/engine/states/NV/2025/computeNV2025';
import type { NevadaInput2025 } from '../../../../../src/engine/states/NV/2025/computeNV2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('Nevada 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax', () => {
    it('should return zero tax for all income levels', () => {
      const testCases = [
        { agi: 3000000, label: 'low income' },
        { agi: 7500000, label: 'middle income' },
        { agi: 25000000, label: 'high income' },
        { agi: 100000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeNV2025({
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
        const result = computeNV2025({
          filingStatus: status,
          federalAGI: dollarsToCents(100000),
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeNV2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(75000),
      });

      expect(result.state).toBe('NV');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention Nevada has never had income tax', () => {
      const result = computeNV2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(75000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('never had');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention gaming revenue', () => {
      const result = computeNV2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(75000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Gaming');
      expect(notesText).toContain('casino');
    });

    it('should mention constitutional protection', () => {
      const result = computeNV2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(75000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Constitutional protection');
    });

    it('should mention popularity for businesses and high-income individuals', () => {
      const result = computeNV2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(75000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('businesses');
      expect(notesText).toContain('high-income');
    });
  });

  describe('Federal AGI Preservation', () => {
    it('should preserve federal AGI as state AGI', () => {
      const testAGI = dollarsToCents(250000);
      const result = computeNV2025({
        filingStatus: 'marriedJointly',
        federalAGI: testAGI,
      });

      expect(result.stateAGI).toBe(testAGI);
    });
  });

  describe('High Income Scenarios', () => {
    it('should handle very high income with zero tax (attractive to wealthy)', () => {
      const result = computeNV2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(5000000), // $5M
      });

      expect(result.stateTax).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });
});
