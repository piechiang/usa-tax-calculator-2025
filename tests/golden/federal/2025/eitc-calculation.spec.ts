import { describe, it, expect } from 'vitest';
import { computeEITC2025 } from '../../../../src/engine/credits/eitc2025';
import { EITC_INVESTMENT_INCOME_LIMIT_2025 } from '../../../../src/engine/rules/2025/federal/eitc';

const $ = (amount: number) => Math.round(amount * 100);

describe('EITC 2025 Calculations', () => {
  describe('Investment income test', () => {
    it('should disqualify taxpayer when investment income exceeds limit', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(20000),
        agi: $(20000),
        qualifyingChildren: 1,
        investmentIncome: $(12000) // Over $11,950 limit
      });

      expect(result.eitc).toBe(0);
      expect(result.disqualified).toBe(true);
      expect(result.phase).toBe('zero');
    });

    it('should allow EITC when investment income is at limit', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(20000),
        agi: $(20000), 
        qualifyingChildren: 1,
        investmentIncome: EITC_INVESTMENT_INCOME_LIMIT_2025 // Exactly at limit
      });

      expect(result.eitc).toBeGreaterThan(0);
      expect(result.disqualified).toBe(false);
    });
  });

  describe('Phase-in calculation', () => {
    it('should calculate phase-in credit for low earned income (1 child)', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(6000), // Below $12,730 plateau amount
        agi: $(6000),
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      expect(result.phase).toBe('phase-in');
      expect(result.eitc).toBeGreaterThan(0);
      expect(result.eitc).toBeLessThan($(4328)); // Less than max credit
      
      // Should be roughly proportional to earned income
      const expectedRatio = $(6000) / $(12730); // earnedIncome / earnedIncomeAmount
      const expectedCredit = Math.round($(4328) * expectedRatio);
      expect(result.eitc).toBeCloseTo(expectedCredit, 0);
    });

    it('should reach maximum credit at plateau (2 children)', () => {
      const result = computeEITC2025({
        filingStatus: 'marriedJointly',
        earnedIncome: $(17880), // At plateau amount for 2 children
        agi: $(17880),
        qualifyingChildren: 2,
        investmentIncome: 0
      });

      expect(result.phase).toBe('plateau');
      expect(result.eitc).toBe($(7152)); // Max credit for 2 children
    });
  });

  describe('Plateau phase', () => {
    it('should maintain max credit in plateau phase (MFJ with 3+ children)', () => {
      const result = computeEITC2025({
        filingStatus: 'marriedJointly',
        earnedIncome: $(25000),
        agi: $(25000), // Between plateau start and phaseout ($30,470)
        qualifyingChildren: 3,
        investmentIncome: 0
      });

      expect(result.phase).toBe('plateau');
      expect(result.eitc).toBe($(8046)); // Max credit for 3+ children
    });
  });

  describe('Phase-out calculation', () => {
    it('should phase out EITC for higher income (single, no children)', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(15000), // Between $10,620 and $19,104 (phase-out range)
        agi: $(15000),
        qualifyingChildren: 0,
        investmentIncome: 0
      });

      expect(result.phase).toBe('phase-out');
      expect(result.eitc).toBeGreaterThan(0);
      expect(result.eitc).toBeLessThan($(649)); // Less than max credit
    });

    it('should eliminate EITC when income exceeds complete phase-out', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(60000), // Well above complete phase-out point
        agi: $(60000),
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      expect(result.eitc).toBe(0);
      expect(result.phase).toBe('zero');
    });
  });

  describe('Filing status differences', () => {
    it('should have higher phase-out threshold for MFJ vs single (same children)', () => {
      const singleResult = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(25000),
        agi: $(25000),
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      const mfjResult = computeEITC2025({
        filingStatus: 'marriedJointly',
        earnedIncome: $(25000),
        agi: $(25000),
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      // MFJ should get higher credit due to higher thresholds
      expect(mfjResult.eitc).toBeGreaterThanOrEqual(singleResult.eitc);
    });
  });

  describe('AGI vs earned income priority', () => {
    it('should use higher of AGI or earned income for phase-out calculation', () => {
      // Case where AGI > earned income (has passive income)
      const result1 = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(15000),   // Lower earned income
        agi: $(25000),           // Higher AGI due to other income
        qualifyingChildren: 1,
        investmentIncome: $(5000) // Under limit
      });

      // Case where earned income > AGI (has deductions)
      const result2 = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(25000),   // Higher earned income
        agi: $(15000),           // Lower AGI due to deductions
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      // Both should use $25,000 for phase-out calculation
      expect(result1.details.incomeUsedForCalculation).toBe($(25000));
      expect(result2.details.incomeUsedForCalculation).toBe($(25000));
    });
  });

  describe('Boundary conditions', () => {
    it('should handle zero earned income', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: 0,
        agi: $(5000), // Has AGI from other sources
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      expect(result.eitc).toBe(0); // No EITC without earned income
    });

    it('should handle exact threshold boundaries', () => {
      // Test exactly at phase-out threshold for single with 1 child
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(23350), // Exactly at phase-out threshold
        agi: $(23350),
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      expect(result.eitc).toBe($(4328)); // Should still get max credit
      expect(result.phase).toBe('plateau');
    });

    it('should handle income $1 over threshold', () => {
      const result = computeEITC2025({
        filingStatus: 'single',
        earnedIncome: $(23351), // $1 over threshold
        agi: $(23351),
        qualifyingChildren: 1,
        investmentIncome: 0
      });

      expect(result.eitc).toBeLessThan($(4328)); // Should start phasing out
      expect(result.phase).toBe('phase-out');
    });
  });
});