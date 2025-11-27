/**
 * Washington State Tax 2025 - Basic Test Suite
 *
 * Tests Washington's NO income tax on wages/salaries.
 * Note: Washington has a 7% capital gains tax (2022+) on gains > $262,000,
 * but this is not a general income tax.
 */

import { describe, it, expect } from 'vitest';
import { computeWA2025 } from '../../../../../src/engine/states/WA/2025/computeWA2025';
import type { WashingtonInput2025 } from '../../../../../src/engine/states/WA/2025/computeWA2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('Washington 2025 State Tax - Basic Tests', () => {
  describe('No Income Tax on Wages/Salaries', () => {
    it('should return zero tax for all wage income levels', () => {
      const testCases = [
        { agi: 4000000, label: 'low income' },
        { agi: 10000000, label: 'middle income' },
        { agi: 30000000, label: 'high income' },
        { agi: 100000000, label: 'very high income' },
      ];

      testCases.forEach(({ agi, label }) => {
        const result = computeWA2025({
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
        const result = computeWA2025({
          filingStatus: status,
          federalAGI: dollarsToCents(150000),
        });

        expect(result.stateTax, `${status} should have zero tax`).toBe(0);
      });
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeWA2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(120000),
      });

      expect(result.state).toBe('WA');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
      expect(result.stateDeduction).toBe(0);
      expect(result.stateExemptions).toBe(0);
    });

    it('should mention Washington has never had traditional income tax', () => {
      const result = computeWA2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(120000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('never had a traditional income tax');
      expect(notesText).toContain('NO state income tax');
    });

    it('should mention capital gains tax separately', () => {
      const result = computeWA2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(120000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Capital gains tax');
      expect(notesText).toContain('7%');
      expect(notesText).toContain('$262,000');
    });

    it('should mention constitutional prohibition', () => {
      const result = computeWA2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(120000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Constitutional prohibition');
    });

    it('should mention tech hub status', () => {
      const result = computeWA2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(120000),
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('Tech hub');
      expect(notesText).toContain('Seattle');
    });
  });

  describe('Federal AGI Preservation', () => {
    it('should preserve federal AGI as state AGI', () => {
      const testAGI = dollarsToCents(200000);
      const result = computeWA2025({
        filingStatus: 'marriedJointly',
        federalAGI: testAGI,
      });

      expect(result.stateAGI).toBe(testAGI);
    });
  });

  describe('High Income Scenarios', () => {
    it('should return zero wage/salary tax even for very high earners', () => {
      const result = computeWA2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(1000000), // $1M
      });

      expect(result.stateTax).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });
});
