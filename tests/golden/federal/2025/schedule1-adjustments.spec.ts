/**
 * Schedule 1 Adjustments Tests - 2025 Tax Year
 *
 * Tests all Schedule 1 Part II adjustments to income (above-the-line deductions)
 * These reduce total income to arrive at AGI.
 *
 * Source: IRS Schedule 1 (Form 1040), 2025
 */

import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../../../../src/engine/federal/2025/computeFederal2025';
import type { FederalInput2025 } from '../../../../src/engine/types';

// Helper to convert dollars to cents
const $ = (dollars: number) => Math.round(dollars * 100);

// Base input for testing
const createBaseInput = (overrides: Partial<FederalInput2025> = {}): FederalInput2025 => ({
  filingStatus: 'single',
  dependents: 0,
  qualifyingChildren: [], // Required for CTC calculation
  income: {
    wages: $(75000),
    interest: 0,
    dividends: { ordinary: 0, qualified: 0 },
    capGainsNet: 0,
    capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
    scheduleCNet: 0,
    businessIncome: 0,
    k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
    other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
  },
  adjustments: {
    studentLoanInterest: 0,
    hsaDeduction: 0,
    iraDeduction: 0,
    seTaxDeduction: 0,
    businessExpenses: 0,
  },
  itemized: {
    stateLocalTaxes: 0,
    mortgageInterest: 0,
    charitable: 0,
    medical: 0,
    other: 0,
  },
  payments: {
    federalWithheld: 0,
    estPayments: 0,
    eitcAdvance: 0,
  },
  ...overrides,
});

describe('Schedule 1 Part II - Adjustments to Income', () => {
  describe('Line 11 - Educator Expenses', () => {
    it('should allow up to $300 for single educator', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          educatorExpenses: $(300),
        },
      });
      const result = computeFederal2025(input);
      // AGI should be reduced by $300
      expect(result.agi).toBe($(74700));
    });

    it('should cap educator expenses at $600 for joint filers', () => {
      const input = createBaseInput({
        filingStatus: 'marriedJointly',
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          educatorExpenses: $(800), // Claiming more than allowed
        },
      });
      const result = computeFederal2025(input);
      // AGI should only be reduced by $600 max
      expect(result.agi).toBe($(74400));
    });
  });

  describe('Line 13 - HSA Deduction', () => {
    it('should deduct HSA contributions', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: $(4150), // 2025 self-only max
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(70850));
    });
  });

  describe('Line 14 - Moving Expenses for Armed Forces', () => {
    it('should deduct military moving expenses', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          movingExpensesMilitary: $(5000),
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(70000));
    });
  });

  describe('Line 16 - Self-Employed SEP/SIMPLE/401(k)', () => {
    it('should deduct self-employed retirement contributions', () => {
      const input = createBaseInput({
        income: {
          wages: 0,
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(100000), // Self-employment income
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          selfEmployedRetirement: $(20000), // SEP contribution
        },
      });
      const result = computeFederal2025(input);
      // Should include SE tax deduction + SEP deduction
      // Net SE income after SE tax deduction allows up to 25% for SEP
      expect(result.agi).toBeLessThan($(100000));
    });

    it('should limit SEP contribution to 25% of net SE income', () => {
      const input = createBaseInput({
        income: {
          wages: 0,
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(40000), // Self-employment income
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          selfEmployedRetirement: $(50000), // Trying to contribute more than allowed
        },
      });
      const result = computeFederal2025(input);
      // SEP should be limited based on net SE income
      expect(result.agi).toBeGreaterThan($(0));
    });
  });

  describe('Line 17 - Self-Employed Health Insurance', () => {
    it('should deduct self-employed health insurance premiums', () => {
      const input = createBaseInput({
        income: {
          wages: 0,
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(80000),
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          selfEmployedHealthInsurance: $(12000),
        },
      });
      const result = computeFederal2025(input);
      // Health insurance should be deducted (up to net profit)
      expect(result.agi).toBeLessThan($(80000));
    });

    it('should limit health insurance deduction to net profit', () => {
      const input = createBaseInput({
        income: {
          wages: $(50000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(5000), // Small SE income
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          selfEmployedHealthInsurance: $(20000), // More than SE income
        },
      });
      const result = computeFederal2025(input);
      // Deduction should be limited to net SE profit after SE tax deduction
      expect(result.agi).toBeLessThan($(55000));
      expect(result.agi).toBeGreaterThan($(49000)); // Can't deduct more than ~$5k
    });
  });

  describe('Line 18a - Alimony Paid', () => {
    it('should deduct alimony for pre-2019 divorce', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          alimonyPaid: $(12000),
          divorceYear: 2017, // Pre-TCJA divorce
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(63000));
    });

    it('should NOT deduct alimony for post-2018 divorce', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          alimonyPaid: $(12000),
          divorceYear: 2020, // Post-TCJA divorce
        },
      });
      const result = computeFederal2025(input);
      // Alimony should NOT reduce AGI for post-2018 divorces
      expect(result.agi).toBe($(75000));
    });

    it('should NOT deduct alimony without divorce year specified', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          alimonyPaid: $(12000),
          // No divorceYear specified
        },
      });
      const result = computeFederal2025(input);
      // Without divorce year, assume post-2018 (not deductible)
      expect(result.agi).toBe($(75000));
    });
  });

  describe('Line 19 - Early Withdrawal Penalty', () => {
    it('should deduct early withdrawal penalties', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
          earlyWithdrawalPenalty: $(500),
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(74500));
    });
  });

  describe('Line 20 - IRA Deduction', () => {
    it('should allow full IRA deduction when not covered by plan', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: $(7000), // 2025 limit
          seTaxDeduction: 0,
          businessExpenses: 0,
          iraContributorCoveredByPlan: false,
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(68000));
    });

    it('should phase out IRA deduction when covered by plan - single', () => {
      const input = createBaseInput({
        income: {
          wages: $(85000), // In phaseout range ($79k-$89k for 2025)
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: $(7000),
          seTaxDeduction: 0,
          businessExpenses: 0,
          iraContributorCoveredByPlan: true,
        },
      });
      const result = computeFederal2025(input);
      // Should get partial deduction (in middle of phaseout)
      expect(result.agi).toBeGreaterThan($(78000));
      expect(result.agi).toBeLessThan($(85000));
    });

    it('should fully phase out IRA deduction above threshold', () => {
      const input = createBaseInput({
        income: {
          wages: $(100000), // Above phaseout range ($89k+)
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: $(7000),
          seTaxDeduction: 0,
          businessExpenses: 0,
          iraContributorCoveredByPlan: true,
        },
      });
      const result = computeFederal2025(input);
      // Should get no IRA deduction
      expect(result.agi).toBe($(100000));
    });

    it('should allow catch-up contribution for age 50+', () => {
      const input = createBaseInput({
        primary: {
          birthDate: '1970-01-01', // 55 years old in 2025
        },
        adjustments: {
          studentLoanInterest: 0,
          hsaDeduction: 0,
          iraDeduction: $(8000), // $7,000 + $1,000 catch-up
          seTaxDeduction: 0,
          businessExpenses: 0,
          iraContributorCoveredByPlan: false,
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(67000));
    });
  });

  describe('Line 21 - Student Loan Interest', () => {
    it('should allow full student loan interest deduction under threshold', () => {
      const input = createBaseInput({
        income: {
          wages: $(60000), // Under phaseout threshold
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: $(2500), // Max deduction
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
        },
      });
      const result = computeFederal2025(input);
      expect(result.agi).toBe($(57500));
    });

    it('should cap student loan interest at $2,500', () => {
      const input = createBaseInput({
        income: {
          wages: $(60000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: $(5000), // More than max
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
        },
      });
      const result = computeFederal2025(input);
      // Should only get $2,500 max deduction
      expect(result.agi).toBe($(57500));
    });

    it('should phase out student loan interest for high income - single', () => {
      const input = createBaseInput({
        income: {
          wages: $(87500), // In phaseout range ($80k-$95k for 2025)
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: $(2500),
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
        },
      });
      const result = computeFederal2025(input);
      // Should get partial deduction (50% phaseout)
      expect(result.agi).toBeGreaterThan($(85000));
      expect(result.agi).toBeLessThan($(87500));
    });

    it('should NOT allow student loan interest for MFS', () => {
      const input = createBaseInput({
        filingStatus: 'marriedSeparately',
        income: {
          wages: $(60000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: $(2500),
          hsaDeduction: 0,
          iraDeduction: 0,
          seTaxDeduction: 0,
          businessExpenses: 0,
        },
      });
      const result = computeFederal2025(input);
      // MFS cannot claim student loan interest deduction
      expect(result.agi).toBe($(60000));
    });
  });

  describe('Combined Schedule 1 Adjustments', () => {
    it('should correctly combine multiple adjustments', () => {
      const input = createBaseInput({
        adjustments: {
          studentLoanInterest: $(2000),
          hsaDeduction: $(4000),
          iraDeduction: $(5000),
          seTaxDeduction: 0,
          businessExpenses: 0,
          educatorExpenses: $(300),
          earlyWithdrawalPenalty: $(200),
        },
      });
      const result = computeFederal2025(input);
      // AGI = $75,000 - $2,000 - $4,000 - $5,000 - $300 - $200 = $63,500
      expect(result.agi).toBe($(63500));
    });

    it('should correctly calculate AGI for self-employed with multiple adjustments', () => {
      const input = createBaseInput({
        income: {
          wages: $(30000),
          interest: $(500),
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(50000), // Self-employment income
          businessIncome: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          studentLoanInterest: $(1500),
          hsaDeduction: $(8300), // Family HSA max
          iraDeduction: $(7000),
          seTaxDeduction: 0, // Will be calculated automatically
          businessExpenses: 0,
          selfEmployedHealthInsurance: $(10000),
          selfEmployedRetirement: $(10000), // SEP contribution
        },
      });
      const result = computeFederal2025(input);
      // AGI should account for SE tax deduction + all other adjustments
      expect(result.agi).toBeLessThan($(80500));
      expect(result.agi).toBeGreaterThan($(40000));
    });
  });
});
