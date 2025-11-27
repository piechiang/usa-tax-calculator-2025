import { describe, it, expect } from 'vitest';
import { STANDARD_DEDUCTION_2025 } from '../../../../src/engine/rules/2025/federal/deductions';
import { FEDERAL_BRACKETS_2025 } from '../../../../src/engine/rules/2025/federal/federalBrackets';
import { EITC_2025, EITC_INVESTMENT_INCOME_LIMIT_2025 } from '../../../../src/engine/rules/2025/federal/eitc';
import { SS_WAGE_BASE_2025, ADDL_MEDICARE_THRESHOLDS_2025 } from '../../../../src/engine/rules/2025/federal/medicareSocialSecurity';

const $ = (amount: number) => Math.round(amount * 100); // Convert dollars to cents

describe('IRS 2025 Constants Verification', () => {
  describe('Standard Deductions', () => {
    it('should match IRS 2025 published amounts', () => {
      // Source: IRS news release IR-2024-273, Rev. Proc. 2024-40 (official 2025 amounts)
      expect(STANDARD_DEDUCTION_2025.single).toBe($(15000));
      expect(STANDARD_DEDUCTION_2025.marriedJointly).toBe($(30000));
      expect(STANDARD_DEDUCTION_2025.marriedSeparately).toBe($(15000));
      expect(STANDARD_DEDUCTION_2025.headOfHousehold).toBe($(22500));
    });
  });

  describe('Federal Tax Brackets', () => {
    it('should have correct 2025 single bracket thresholds', () => {
      const single = FEDERAL_BRACKETS_2025.single;
      
      // Verify 7 brackets total
      expect(single).toHaveLength(7);
      
      // Verify key thresholds (Rev. Proc. 2024-40)
      expect(single[0]).toEqual({ min: 0, max: $(11925), rate: 0.10 });
      expect(single[1]).toEqual({ min: $(11925), max: $(48475), rate: 0.12 });
      expect(single[2]).toEqual({ min: $(48475), max: $(103350), rate: 0.22 });
      expect(single[6].rate).toBe(0.37); // Top bracket
      expect(single[6].max).toBe(Infinity);
    });

    it('should have correct 2025 MFJ bracket thresholds', () => {
      const mfj = FEDERAL_BRACKETS_2025.marriedJointly;
      
      expect(mfj[0]).toEqual({ min: 0, max: $(23850), rate: 0.10 });
      expect(mfj[1]).toEqual({ min: $(23850), max: $(96950), rate: 0.12 });
      expect(mfj[6].rate).toBe(0.37); // Top bracket
    });

    it('should have monotonic bracket boundaries', () => {
      Object.values(FEDERAL_BRACKETS_2025).forEach(brackets => {
        for (let i = 1; i < brackets.length; i++) {
          expect(brackets[i].min).toBeGreaterThanOrEqual(brackets[i - 1].max as number);
          expect(brackets[i].rate).toBeGreaterThanOrEqual(brackets[i - 1].rate);
        }
      });
    });
  });

  describe('EITC Parameters', () => {
    it('should have correct 2025 investment income limit', () => {
      // Source: Rev. Proc. 2024-40 §2.06
      expect(EITC_INVESTMENT_INCOME_LIMIT_2025).toBe($(11950));
    });

    it('should have correct max credits by qualifying children', () => {
      expect(EITC_2025[0].maxCredit).toBe($(649));   // No children
      expect(EITC_2025[1].maxCredit).toBe($(4328));  // 1 child
      expect(EITC_2025[2].maxCredit).toBe($(7152));  // 2 children  
      expect(EITC_2025[3].maxCredit).toBe($(8046));  // 3+ children
    });

    it('should have higher phase-out thresholds for MFJ', () => {
      // MFJ gets higher thresholds to avoid marriage penalty
      for (let children = 0; children <= 3; children++) {
        const row = EITC_2025[children as 0 | 1 | 2 | 3];
        expect(row.thresholdPhaseoutMFJ).toBeGreaterThan(row.thresholdPhaseoutOther);
        expect(row.completedPhaseoutMFJ).toBeGreaterThan(row.completedPhaseoutOther);
      }
    });
  });

  describe('Social Security and Medicare', () => {
    it('should have correct 2025 Social Security wage base', () => {
      // Source: SSA announcement
      expect(SS_WAGE_BASE_2025).toBe($(176100));
    });

    it('should have correct Additional Medicare Tax thresholds', () => {
      // Source: IRS Topic 560
      expect(ADDL_MEDICARE_THRESHOLDS_2025.single).toBe($(200000));
      expect(ADDL_MEDICARE_THRESHOLDS_2025.headOfHousehold).toBe($(200000));
      expect(ADDL_MEDICARE_THRESHOLDS_2025.marriedJointly).toBe($(250000));
      expect(ADDL_MEDICARE_THRESHOLDS_2025.marriedSeparately).toBe($(125000));
    });
  });
});