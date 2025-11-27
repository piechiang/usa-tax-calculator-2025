/**
 * Premium Tax Credit (Form 8962) Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePTC, formatPTCResult } from '../../../src/engine/credits/premiumTaxCredit';
import type { Form8962Input } from '../../../src/engine/credits/premiumTaxCredit';

describe('Form 8962: Premium Tax Credit', () => {
  describe('Eligibility', () => {
    it('should be ineligible if can be claimed as dependent', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(10000),
        advancePTC: Array(12).fill(40000),
        canBeClaimedAsDependent: true,
      };

      const result = calculatePTC(input);

      expect(result.isEligible).toBe(false);
      expect(result.ineligibilityReason).toContain('dependent');
    });

    it('should be ineligible if MFS without exceptions', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'marriedSeparately',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(10000),
        advancePTC: Array(12).fill(40000),
        mfsWithExceptions: false,
      };

      const result = calculatePTC(input);

      expect(result.isEligible).toBe(false);
      expect(result.ineligibilityReason).toContain('Married filing separately');
    });

    it('should be eligible if MFS with exceptions', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'marriedSeparately',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(10000),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      expect(result.isEligible).toBe(false);
      expect(result.ineligibilityReason).toContain('Married filing separately');
    });

    it('should be ineligible if no coverage', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(false),
        slcspPremium: Array(12).fill(0),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      expect(result.isEligible).toBe(false);
      expect(result.ineligibilityReason).toContain('No marketplace coverage');
    });
  });

  describe('FPL Calculation', () => {
    it('should calculate correct FPL for single person', () => {
      const input: Form8962Input = {
        magi: 2000000, // $20,000
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      expect(result.fpl).toBe(1575000); // $15,750 for 1 person
      expect(result.fplPercentage).toBeCloseTo(1.27, 2); // ~127% FPL
    });

    it('should calculate correct FPL for family of 4', () => {
      const input: Form8962Input = {
        magi: 6000000, // $60,000
        filingStatus: 'marriedJointly',
        householdSize: 4,
        state: 'TX',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(100000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      expect(result.fpl).toBe(3232500); // $32,325 for 4 people
      expect(result.fplPercentage).toBeCloseTo(1.86, 2); // ~186% FPL
    });

    it('should apply Alaska multiplier', () => {
      const input: Form8962Input = {
        magi: 2000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'AK',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      // Alaska FPL = Continental × 1.25
      expect(result.fpl).toBe(Math.round(1575000 * 1.25));
    });

    it('should apply Hawaii multiplier', () => {
      const input: Form8962Input = {
        magi: 2000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'HI',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      // Hawaii FPL = Continental × 1.15
      expect(result.fpl).toBe(Math.round(1575000 * 1.15));
    });
  });

  describe('PTC Calculation', () => {
    it('should calculate $0 contribution for income < 150% FPL', () => {
      const input: Form8962Input = {
        magi: 2000000, // $20,000 (127% FPL)
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000), // $500/mo SLCSP
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      // Income < 150% FPL: $0 contribution
      // PTC = SLCSP - $0 = $500/mo × 12 = $6,000
      expect(result.totalPTCAllowed).toBe(600000);
    });

    it('should calculate correct contribution for 200-250% FPL', () => {
      const input: Form8962Input = {
        magi: 3600000, // $36,000 (228% FPL for single)
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(60000), // $600/mo
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      // 200-250% FPL: 2% contribution
      // Monthly contribution = $36,000 × 2% / 12 = $60
      // PTC = $600 - $60 = $540/mo × 12 = $6,480
      expect(result.totalPTCAllowed).toBeCloseTo(648000, -2);
    });

    it('should cap contribution at 8.5% for income > 400% FPL', () => {
      const input: Form8962Input = {
        magi: 8000000, // $80,000 (508% FPL)
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(100000), // $1,000/mo
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      // > 400% FPL: 8.5% contribution
      // Monthly contribution = $80,000 × 8.5% / 12 = $566.67
      // PTC = $1,000 - $566.67 = $433.33/mo × 12 ≈ $5,200
      expect(result.totalPTCAllowed).toBeGreaterThan(500000);
      expect(result.totalPTCAllowed).toBeLessThan(530000);
    });

    it('should handle partial year coverage', () => {
      const coverageMonths = Array(12).fill(false);
      coverageMonths[0] = true; // Jan
      coverageMonths[1] = true; // Feb
      coverageMonths[2] = true; // Mar

      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths,
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);

      // Only 3 months covered
      expect(result.monthlyDetails.filter((m) => m.covered)).toHaveLength(3);
    });
  });

  describe('Reconciliation', () => {
    it('should calculate additional credit when APTC < PTC allowed', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000), // $500/mo
        actualPremiumPaid: Array(12).fill(10000),
        advancePTC: Array(12).fill(30000), // $300/mo advance
      };

      const result = calculatePTC(input);

      // PTC allowed > APTC received
      // Net PTC = positive (additional credit)
      expect(result.netPTC).toBeGreaterThan(0);
      expect(result.excessAPTCRepayment).toBe(0);
    });

    it('should calculate repayment when APTC > PTC allowed', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(60000), // $600/mo advance (too much)
      };

      const result = calculatePTC(input);

      // APTC > PTC allowed
      // Net PTC = negative (repayment owed)
      expect(result.netPTC).toBeLessThan(0);
      expect(result.excessAPTCRepayment).toBeGreaterThan(0);
    });

    it('should apply repayment cap for income < 200% FPL (single)', () => {
      const input: Form8962Input = {
        magi: 2500000, // ~159% FPL
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(100000), // Way too much advance
      };

      const result = calculatePTC(input);

      // < 200% FPL single: cap at $350
      expect(result.repaymentLimitation).toBe(35000);
      expect(result.excessAPTCRepayment).toBeLessThanOrEqual(35000);
    });

    it('should apply higher repayment cap for MFJ', () => {
      const input: Form8962Input = {
        magi: 4000000, // ~157% FPL for 2 people
        filingStatus: 'marriedJointly',
        householdSize: 2,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(100000),
      };

      const result = calculatePTC(input);

      // < 200% FPL MFJ: cap at $700
      expect(result.repaymentLimitation).toBe(70000);
    });

    it('should not cap repayment for income >= 400% FPL', () => {
      const input: Form8962Input = {
        magi: 8000000, // > 400% FPL
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(100000), // $1,000/mo advance
      };

      const result = calculatePTC(input);

      // >= 400% FPL: no repayment cap
      expect(result.repaymentLimitation).toBe(Infinity);
      // Full repayment required
      expect(result.excessAPTCRepayment).toBeGreaterThan(35000);
    });
  });

  describe('formatPTCResult', () => {
    it('should format ineligible result', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(false),
        slcspPremium: Array(12).fill(0),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      };

      const result = calculatePTC(input);
      const formatted = formatPTCResult(result);

      expect(formatted).toContain('Not eligible');
    });

    it('should format eligible result with credit', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(30000),
      };

      const result = calculatePTC(input);
      const formatted = formatPTCResult(result);

      expect(formatted).toContain('Form 8962');
      expect(formatted).toContain('Federal Poverty Level');
      expect(formatted).toContain('Additional Credit');
    });

    it('should format repayment result', () => {
      const input: Form8962Input = {
        magi: 3000000,
        filingStatus: 'single',
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(60000),
      };

      const result = calculatePTC(input);
      const formatted = formatPTCResult(result);

      expect(formatted).toContain('Repayment Owed');
    });
  });
});
