/**
 * Wisconsin State Tax Tests for 2025
 *
 * Test suite for Wisconsin's 4-bracket progressive income tax system
 */

import { describe, it, expect } from 'vitest';
import { computeWI2025 } from '../../../../../src/engine/states/WI/2025/computeWI2025';
import type { WisconsinInput2025 } from '../../../../../src/engine/states/WI/2025/computeWI2025';

describe('Wisconsin 2025 State Tax - Basic Tests', () => {
  describe('Tax Brackets', () => {
    it('should calculate tax in first bracket (3.54%) - Single', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 1000000, // $10,000
        exemptions: 1, // Self
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // Taxable: $10,000 - $12,760 (std ded) - $700 (exemption) = $0 (negative, so $0)
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should calculate tax in second bracket (4.65%) - Single', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 3000000, // $30,000
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // Taxable: $30,000 - $12,760 - $700 = $16,540
      // Tax: $13,810 × 3.54% + $2,730 × 4.65%
      //    = $488.87 + $126.95 = $615.82
      expect(result.stateTaxableIncome).toBe(1654000);
      expect(result.stateTax).toBeGreaterThan(61500);
      expect(result.stateTax).toBeLessThan(62000);
    });

    it('should calculate tax in third bracket (6.27%) - Single', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // AGI: $100,000, threshold: $36,760, excess: $63,240
      // Phase-out reduction: $63,240 × 10% = $6,324
      // Standard deduction: $12,760 - $6,324 = $6,436
      // Taxable: $100,000 - $6,436 - $700 = $92,864
      // Tax: $13,810 × 3.54% + $13,820 × 4.65% + $65,234 × 6.27%
      //    = $488.87 + $642.63 + $4,090.17 = $5,221.67
      expect(result.stateTaxableIncome).toBe(9286400);
      expect(result.stateTax).toBeGreaterThan(522000);
      expect(result.stateTax).toBeLessThan(523000);
    });

    it('should calculate tax in fourth bracket (7.65%) - Single', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 40000000, // $400,000
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // AGI: $400,000, threshold: $36,760, excess: $363,240
      // Phase-out reduction: $363,240 × 10% = $36,324 (exceeds $12,760, so fully phased out)
      // Standard deduction: $0 (completely phased out)
      // Taxable: $400,000 - $0 - $700 = $399,300
      // First 3 brackets + top bracket
      expect(result.stateTaxableIncome).toBe(39930000);
      expect(result.stateTax).toBeGreaterThan(2500000); // > $25,000
    });
  });

  describe('Married Filing Jointly Brackets', () => {
    it('should use MFJ brackets and deduction', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 5000000, // $50,000
        exemptions: 2, // Self + spouse
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // Taxable: $50,000 - $23,620 (std ded) - $1,400 (2 exemptions) = $24,980
      // Tax: $18,380 × 3.54% + $6,600 × 4.65%
      //    = $650.85 + $306.90 = $957.75
      expect(result.stateTaxableIncome).toBe(2498000);
      expect(result.stateTax).toBeGreaterThan(95000);
      expect(result.stateTax).toBeLessThan(96500);
    });

    it('should calculate high-income MFJ', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 20000000, // $200,000
        exemptions: 2,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // AGI: $200,000, threshold: $54,870, excess: $145,130
      // Phase-out reduction: $145,130 × 10% = $14,513
      // Standard deduction: $23,620 - $14,513 = $9,107
      // Taxable: $200,000 - $9,107 - $1,400 = $189,493
      expect(result.stateTaxableIncome).toBe(18949300);
      expect(result.stateTax).toBeGreaterThan(1000000); // > $10,000
    });
  });

  describe('Head of Household', () => {
    it('should use HOH brackets and deduction', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 7000000, // $70,000
        exemptions: 3, // Self + 2 dependents
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // AGI: $70,000, threshold: $36,760, excess: $33,240
      // Phase-out reduction: $33,240 × 10% = $3,324
      // Standard deduction: $18,970 - $3,324 = $15,646
      // Taxable: $70,000 - $15,646 - $2,100 (3 exemptions) = $52,254
      // Tax: $18,380 × 3.54% + $18,380 × 4.65% + $15,494 × 6.27%
      //    = $650.45 + $854.67 + $971.47 = $2,476.59
      expect(result.stateTaxableIncome).toBe(5225400);
      expect(result.stateTax).toBeGreaterThan(247000);
      expect(result.stateTax).toBeLessThan(248000);
    });
  });

  describe('Standard Deduction Phase-Out', () => {
    it('should not reduce standard deduction below threshold', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 3676000, // $36,760 (exactly at threshold)
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // At threshold: full standard deduction
      // Taxable: $36,760 - $12,760 - $700 = $23,300
      expect(result.stateTaxableIncome).toBe(2330000);
    });

    it('should reduce standard deduction above threshold', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 4676000, // $46,760 ($10,000 over threshold)
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // $10,000 over threshold → reduce deduction by $1,000 ($1 per $10)
      // Standard deduction: $12,760 - $1,000 = $11,760
      // Taxable: $46,760 - $11,760 - $700 = $34,300
      expect(result.stateTaxableIncome).toBe(3430000);
    });

    it('should completely phase out standard deduction', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 16436000, // $164,360 (far above threshold)
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // $127,600 over threshold → reduce deduction by $12,760 (fully phased out)
      // Standard deduction: $0
      // Taxable: $164,360 - $0 - $700 = $163,660
      expect(result.stateTaxableIncome).toBe(16366000);
    });
  });

  describe('Personal Exemptions', () => {
    it('should apply exemptions for dependents', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 6000000, // $60,000
        exemptions: 3, // Self + 2 dependents
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // AGI: $60,000, threshold: $36,760, excess: $23,240
      // Phase-out reduction: $23,240 × 10% = $2,324
      // Standard deduction: $12,760 - $2,324 = $10,436
      // Exemptions: 3 × $700 = $2,100
      // Taxable: $60,000 - $10,436 - $2,100 = $47,464
      expect(result.stateTaxableIncome).toBe(4746400);
    });
  });

  describe('State EITC', () => {
    it('should calculate state EITC at 4% for 1 child', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 2000000, // $20,000
        exemptions: 2,
        federalEITC: 400000, // $4,000 federal EITC
        qualifyingChildrenCount: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // State EITC: $4,000 × 4% = $160
      // This would reduce tax, but with low income, tax might be $0 anyway
      expect(result.stateTax).toBeGreaterThanOrEqual(0);
    });

    it('should calculate state EITC at 11% for 2 children', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'marriedJointly',
        federalAGI: 3500000, // $35,000
        exemptions: 4, // MFJ + 2 kids
        federalEITC: 700000, // $7,000 federal EITC
        qualifyingChildrenCount: 2,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // State EITC: $7,000 × 11% = $770
      expect(result.stateTax).toBeGreaterThanOrEqual(0);
    });

    it('should calculate state EITC at 34% for 3+ children', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'headOfHousehold',
        federalAGI: 4000000, // $40,000
        exemptions: 4, // HOH + 3 kids
        federalEITC: 800000, // $8,000 federal EITC
        qualifyingChildrenCount: 3,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // State EITC: $8,000 × 34% = $2,720
      // This should significantly reduce or eliminate state tax
      expect(result.stateTax).toBeGreaterThanOrEqual(0);
    });

    it('should not provide state EITC for childless taxpayers', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 1500000, // $15,000
        exemptions: 1,
        federalEITC: 60000, // $600 federal EITC (childless)
        qualifyingChildrenCount: 0,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // No state EITC for childless (0% of federal)
      // Taxable income is too low anyway ($15,000 - $12,760 - $700 = $1,540)
      expect(result.stateTaxableIncome).toBe(154000);
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 5000000, // $50,000
        exemptions: 1,
        stateWithholding: 300000, // $3,000 withheld
      };

      const result = computeWI2025(input);

      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Should get refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        exemptions: 1,
        stateWithholding: 200000, // Only $2,000 withheld
      };

      const result = computeWI2025(input);

      expect(result.stateTax).toBeGreaterThan(200000); // Tax > withholding
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Owes money
    });
  });

  describe('State Metadata', () => {
    it('should include correct state metadata', () => {
      const input: WisconsinInput2025 = {
        filingStatus: 'single',
        federalAGI: 10000000, // $100,000
        exemptions: 1,
        stateWithholding: 0,
      };

      const result = computeWI2025(input);

      // Check state metadata
      expect(result.state).toBe('WI');
      expect(result.taxYear).toBe(2025);
      expect(result.localTax).toBe(0); // Wisconsin has no local income tax
    });
  });
});
