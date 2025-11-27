/**
 * New Mexico State Tax 2025 - Basic Test Suite
 *
 * Tests New Mexico's 5-bracket progressive tax system with HB 252 (2024) reforms.
 * First major tax change since 2005.
 */

import { describe, it, expect } from 'vitest';
import { computeNM2025 } from '../../../../../src/engine/states/NM/2025/computeNM2025';
import type { NewMexicoInput2025 } from '../../../../../src/engine/states/NM/2025/computeNM2025';
import { dollarsToCents } from '../../../../../src/engine/util/money';

describe('New Mexico 2025 State Tax - Basic Tests', () => {
  describe('Progressive Tax Brackets (HB 252 Reform)', () => {
    it('should calculate tax in lowest 1.5% bracket', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(20000),
        dependents: 0,
      });

      // AGI $20,000 - standard deduction $15,000 - exemption $2,500 = $2,500 taxable
      // $2,500 × 1.5% = $37.50 tax
      expect(result.stateTaxableIncome).toBe(dollarsToCents(2500));
      expect(result.stateTax).toBe(dollarsToCents(37.5));
    });

    it('should calculate tax across first two brackets', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(35000),
        dependents: 0,
      });

      // AGI $35,000 - standard deduction $15,000 - exemption $2,500 = $17,500 taxable
      // First $8,000 × 1.5% = $120
      // Next $8,500 ($8,000-$16,500) × 4.3% = $365.50
      // Next $1,000 ($16,500-$17,500) × 4.7% = $47
      // Total: $120 + $365.50 + $47 = $532.50
      expect(result.stateTaxableIncome).toBe(dollarsToCents(17500));
      expect(result.stateTax).toBe(dollarsToCents(532.5));
    });

    it('should calculate tax for high income in top 5.9% bracket', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(300000),
        dependents: 0,
      });

      // AGI $300,000 - standard deduction $15,000 - exemption $2,500 = $282,500 taxable
      // Bracket 1: $8,000 × 1.5% = $120
      // Bracket 2: $8,500 × 4.3% = $365.50
      // Bracket 3: $17,000 × 4.7% = $799
      // Bracket 4: $186,500 × 4.9% = $9,138.50
      // Bracket 5: $62,500 × 5.9% = $3,687.50
      // Total: $120 + $365.50 + $799 + $9,138.50 + $3,687.50 = $14,110.50
      expect(result.stateTaxableIncome).toBe(dollarsToCents(282500));
      expect(result.stateTax).toBe(dollarsToCents(14110.5));
    });
  });

  describe('Standard Deductions', () => {
    it('should apply single standard deduction ($15,000)', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(30000),
        dependents: 0,
      });

      expect(result.stateDeduction).toBe(dollarsToCents(15000));
    });

    it('should apply MFJ standard deduction ($30,000)', () => {
      const result = computeNM2025({
        filingStatus: 'marriedJointly',
        federalAGI: dollarsToCents(60000),
        dependents: 0,
      });

      expect(result.stateDeduction).toBe(dollarsToCents(30000));
    });

    it('should apply head of household standard deduction ($22,500)', () => {
      const result = computeNM2025({
        filingStatus: 'headOfHousehold',
        federalAGI: dollarsToCents(50000),
        dependents: 1,
      });

      expect(result.stateDeduction).toBe(dollarsToCents(22500));
    });
  });

  describe('Personal Exemptions', () => {
    it('should apply personal exemption for single filer ($2,500)', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(25000),
        dependents: 0,
      });

      // Single: 1 taxpayer exemption = $2,500
      expect(result.stateExemptions).toBe(dollarsToCents(2500));
    });

    it('should apply personal exemptions for MFJ ($5,000)', () => {
      const result = computeNM2025({
        filingStatus: 'marriedJointly',
        federalAGI: dollarsToCents(50000),
        dependents: 0,
      });

      // MFJ: 2 taxpayer exemptions = $5,000
      expect(result.stateExemptions).toBe(dollarsToCents(5000));
    });

    it('should apply exemptions for taxpayer and dependents', () => {
      const result = computeNM2025({
        filingStatus: 'headOfHousehold',
        federalAGI: dollarsToCents(60000),
        dependents: 2,
      });

      // HOH: 1 taxpayer + 2 dependents = 3 × $2,500 = $7,500
      expect(result.stateExemptions).toBe(dollarsToCents(7500));
    });
  });

  describe('Complete Tax Calculations', () => {
    it('should handle married filing jointly with dependents', () => {
      const result = computeNM2025({
        filingStatus: 'marriedJointly',
        federalAGI: dollarsToCents(80000),
        dependents: 2,
      });

      // AGI $80,000 - standard deduction $30,000 - exemptions $10,000 (4 × $2,500) = $40,000 taxable
      // Bracket 1: $16,000 × 1.5% = $240
      // Bracket 2: $9,000 × 4.3% = $387
      // Bracket 3: $15,000 × 4.7% = $705
      // Total: $240 + $387 + $705 = $1,332
      expect(result.stateAGI).toBe(dollarsToCents(80000));
      expect(result.stateDeduction).toBe(dollarsToCents(30000));
      expect(result.stateExemptions).toBe(dollarsToCents(10000));
      expect(result.stateTaxableIncome).toBe(dollarsToCents(40000));
      expect(result.stateTax).toBe(dollarsToCents(1332));
      expect(result.totalStateLiability).toBe(dollarsToCents(1332));
    });

    it('should handle low income with minimal tax', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(18000),
        dependents: 0,
      });

      // AGI $18,000 - standard deduction $15,000 - exemption $2,500 = $500 taxable
      // $500 × 1.5% = $7.50
      expect(result.stateTaxableIncome).toBe(dollarsToCents(500));
      expect(result.stateTax).toBe(dollarsToCents(7.5));
    });

    it('should return zero tax when deductions exceed income', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(15000),
        dependents: 0,
      });

      // AGI $15,000 - standard deduction $15,000 - exemption $2,500 = -$2,500 (floor at 0)
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
      expect(result.totalStateLiability).toBe(0);
    });
  });

  describe('HB 252 Reform Features', () => {
    it('should use new 1.5% lowest rate (down from 1.7%)', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(25000),
        dependents: 0,
      });

      // With $7,500 taxable income (all in lowest bracket)
      // $7,500 × 1.5% = $112.50
      expect(result.stateTaxableIncome).toBe(dollarsToCents(7500));
      expect(result.stateTax).toBe(dollarsToCents(112.5));
    });

    it('should use new 4.3% middle bracket', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(32000),
        dependents: 0,
      });

      // AGI $32,000 - standard deduction $15,000 - exemption $2,500 = $14,500 taxable
      // First $8,000 × 1.5% = $120
      // Next $6,500 × 4.3% = $279.50
      // Total: $399.50
      expect(result.stateTaxableIncome).toBe(dollarsToCents(14500));
      expect(result.stateTax).toBe(dollarsToCents(399.5));
    });
  });

  describe('State Metadata', () => {
    it('should include correct state information', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
        dependents: 0,
      });

      expect(result.state).toBe('NM');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0);
    });

    it('should mention HB 252 reform in notes', () => {
      const result = computeNM2025({
        filingStatus: 'single',
        federalAGI: dollarsToCents(50000),
        dependents: 0,
      });

      const notesText = result.calculationNotes.join(' ');
      expect(notesText).toContain('HB 252');
      expect(notesText).toContain('2024');
    });
  });
});
