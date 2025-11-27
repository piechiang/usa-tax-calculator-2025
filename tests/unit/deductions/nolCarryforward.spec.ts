/**
 * Net Operating Loss (NOL) Carryforward Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateNOLDeduction,
  validateNOLCarryforwards,
  calculateCurrentYearNOL,
  type NOLCarryforward,
  type NOLInput,
} from '../../../src/engine/deductions/nolCarryforward';

describe('NOL Carryforward', () => {
  describe('Basic NOL Deduction', () => {
    it('should calculate NOL deduction with 80% limit', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000, // $1,000
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 200000, // $2,000
            remainingNOL: 200000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // 80% of $1,000 = $800
      expect(result.eightyPercentLimit).toBe(80000);
      expect(result.nolDeduction).toBe(80000);
      expect(result.limitedByEightyPercent).toBe(true);

      // Should have $1,200 remaining
      expect(result.excessNOL).toBe(120000);
      expect(result.updatedCarryforwards[0].remainingNOL).toBe(120000);
    });

    it('should use full NOL if less than 80% limit', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000, // $1,000
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 50000, // $500
            remainingNOL: 50000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // Full $500 NOL can be used (< 80% of $1,000)
      expect(result.nolDeduction).toBe(50000);
      expect(result.limitedByEightyPercent).toBe(false);
      expect(result.excessNOL).toBe(0);
      expect(result.updatedCarryforwards).toHaveLength(0);
    });

    it('should return zero deduction if no taxable income', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 0,
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 100000,
            remainingNOL: 100000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      expect(result.nolDeduction).toBe(0);
      expect(result.excessNOL).toBe(100000);
      expect(result.updatedCarryforwards[0].remainingNOL).toBe(100000);
    });

    it('should return zero deduction if negative taxable income', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: -50000,
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 100000,
            remainingNOL: 100000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      expect(result.nolDeduction).toBe(0);
      expect(result.excessNOL).toBe(100000);
    });
  });

  describe('Multiple NOLs (FIFO)', () => {
    it('should use NOLs in chronological order (oldest first)', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000, // $1,000
        nolCarryforwards: [
          {
            taxYear: 2022,
            originalNOL: 30000, // $300 (oldest)
            remainingNOL: 30000,
            source: 'business',
          },
          {
            taxYear: 2024,
            originalNOL: 100000, // $1,000 (newest)
            remainingNOL: 100000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // 80% limit = $800
      expect(result.eightyPercentLimit).toBe(80000);
      expect(result.nolDeduction).toBe(80000);

      // Should use entire 2022 NOL ($300) and $500 from 2024 NOL
      expect(result.nolsUsed).toHaveLength(2);
      expect(result.nolsUsed[0]).toEqual({
        taxYear: 2022,
        amountUsed: 30000,
        remainingAfter: 0,
      });
      expect(result.nolsUsed[1]).toEqual({
        taxYear: 2024,
        amountUsed: 50000,
        remainingAfter: 50000,
      });

      // $500 remaining from 2024
      expect(result.excessNOL).toBe(50000);
      expect(result.updatedCarryforwards).toHaveLength(1);
      expect(result.updatedCarryforwards[0].taxYear).toBe(2024);
      expect(result.updatedCarryforwards[0].remainingNOL).toBe(50000);
    });

    it('should handle NOLs out of order (should sort them)', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 50000, // $500
        nolCarryforwards: [
          {
            taxYear: 2024, // Newer (provided first)
            originalNOL: 50000,
            remainingNOL: 50000,
            source: 'business',
          },
          {
            taxYear: 2022, // Older (provided second)
            originalNOL: 30000,
            remainingNOL: 30000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // Should still use 2022 first (FIFO)
      expect(result.nolsUsed[0].taxYear).toBe(2022);
      expect(result.nolsUsed[1].taxYear).toBe(2024);
    });

    it('should handle three NOLs across multiple years', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000, // $1,000
        nolCarryforwards: [
          {
            taxYear: 2020,
            originalNOL: 20000,
            remainingNOL: 20000,
            source: 'business',
          },
          {
            taxYear: 2022,
            originalNOL: 30000,
            remainingNOL: 30000,
            source: 'rental',
          },
          {
            taxYear: 2023,
            originalNOL: 40000,
            remainingNOL: 40000,
            source: 'farm',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // 80% limit = $800
      // Total NOL = $900, so limited to $800
      expect(result.nolDeduction).toBe(80000);

      // Should use: $200 (2020) + $300 (2022) + $300 from 2023
      expect(result.nolsUsed).toHaveLength(3);
      expect(result.nolsUsed[0].amountUsed).toBe(20000);
      expect(result.nolsUsed[1].amountUsed).toBe(30000);
      expect(result.nolsUsed[2].amountUsed).toBe(30000);

      // $100 remaining from 2023
      expect(result.excessNOL).toBe(10000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero NOL carryforwards', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000,
        nolCarryforwards: [],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      expect(result.nolDeduction).toBe(0);
      expect(result.excessNOL).toBe(0);
      expect(result.nolsUsed).toHaveLength(0);
    });

    it('should handle large NOL exceeding 80% limit', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000, // $1,000
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 10000000, // $100,000 (huge loss)
            remainingNOL: 10000000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // Can only use 80% = $800
      expect(result.nolDeduction).toBe(80000);
      expect(result.limitedByEightyPercent).toBe(true);

      // $99,200 remaining
      expect(result.excessNOL).toBe(9920000);
    });

    it('should handle partially used NOL from prior year', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 50000, // $500
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 100000, // Original $1,000
            remainingNOL: 60000, // Only $600 remaining (used $400 before)
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      // 80% of $500 = $400
      expect(result.nolDeduction).toBe(40000);

      // $200 remaining
      expect(result.excessNOL).toBe(20000);
      expect(result.updatedCarryforwards[0].remainingNOL).toBe(20000);
    });

    it('should handle exact 80% match', () => {
      const input: NOLInput = {
        taxableIncomeBeforeNOL: 100000, // $1,000
        nolCarryforwards: [
          {
            taxYear: 2023,
            originalNOL: 80000, // Exactly 80%
            remainingNOL: 80000,
            source: 'business',
          },
        ],
        taxYear: 2025,
        filingStatus: 'single',
      };

      const result = calculateNOLDeduction(input);

      expect(result.nolDeduction).toBe(80000);
      expect(result.excessNOL).toBe(0);
      expect(result.limitedByEightyPercent).toBe(false);
    });
  });

  describe('NOL Validation', () => {
    it('should validate correct NOL carryforwards', () => {
      const nols: NOLCarryforward[] = [
        {
          taxYear: 2023,
          originalNOL: 100000,
          remainingNOL: 80000,
          source: 'business',
        },
      ];

      const validation = validateNOLCarryforwards(nols, 2025);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject NOL from current or future year', () => {
      const nols: NOLCarryforward[] = [
        {
          taxYear: 2025, // Same as current year
          originalNOL: 100000,
          remainingNOL: 100000,
          source: 'business',
        },
      ];

      const validation = validateNOLCarryforwards(nols, 2025);

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('cannot be used in year 2025');
    });

    it('should reject remaining NOL exceeding original', () => {
      const nols: NOLCarryforward[] = [
        {
          taxYear: 2023,
          originalNOL: 100000,
          remainingNOL: 150000, // More than original!
          source: 'business',
        },
      ];

      const validation = validateNOLCarryforwards(nols, 2025);

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('exceeds original NOL');
    });

    it('should reject negative remaining NOL', () => {
      const nols: NOLCarryforward[] = [
        {
          taxYear: 2023,
          originalNOL: 100000,
          remainingNOL: -10000,
          source: 'business',
        },
      ];

      const validation = validateNOLCarryforwards(nols, 2025);

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('cannot be negative');
    });

    it('should reject zero or negative original NOL', () => {
      const nols: NOLCarryforward[] = [
        {
          taxYear: 2023,
          originalNOL: 0,
          remainingNOL: 0,
          source: 'business',
        },
      ];

      const validation = validateNOLCarryforwards(nols, 2025);

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('must be positive');
    });
  });

  describe('Current Year NOL Calculation', () => {
    it('should calculate NOL when deductions exceed income', () => {
      const totalIncome = 50000; // $500
      const totalDeductions = 150000; // $1,500
      const nonBusinessDeductions = 30000; // $300

      const nol = calculateCurrentYearNOL(
        totalIncome,
        totalDeductions,
        nonBusinessDeductions
      );

      // Business deductions = $1,500 - $300 = $1,200
      // NOL = $1,200 - $500 = $700
      expect(nol).toBe(70000);
    });

    it('should return zero NOL when income exceeds deductions', () => {
      const totalIncome = 100000; // $1,000
      const totalDeductions = 80000; // $800
      const nonBusinessDeductions = 20000; // $200

      const nol = calculateCurrentYearNOL(
        totalIncome,
        totalDeductions,
        nonBusinessDeductions
      );

      // Business deductions = $800 - $200 = $600
      // NOL = $600 - $1,000 = -$400 (no loss)
      expect(nol).toBe(0);
    });

    it('should handle zero non-business deductions', () => {
      const totalIncome = 50000;
      const totalDeductions = 100000;

      const nol = calculateCurrentYearNOL(totalIncome, totalDeductions, 0);

      // All deductions are business
      // NOL = $1,000 - $500 = $500
      expect(nol).toBe(50000);
    });
  });
});
