import { describe, it, expect } from 'vitest';
import { computePreferentialRatesTax2025 } from '../../../../src/engine/tax/longTermCapitalGains';

const $ = (amount: number) => Math.round(amount * 100);

describe('Long-Term Capital Gains 2025 Calculations', () => {
  describe('Single filer 0% bracket', () => {
    it('should tax QD/LTCG at 0% when ordinary income is low', () => {
      const result = computePreferentialRatesTax2025({
        filingStatus: 'single',
        taxableIncome: $(30000),        // $20k ordinary + $10k QD/LTCG
        qualifiedDividendsAndLTCG: $(10000)
      });

      // All $10k should be at 0% since total is under $48,350 threshold
      expect(result.at0Percent).toBe($(10000));
      expect(result.at15Percent).toBe(0);
      expect(result.at20Percent).toBe(0);
      expect(result.preferentialTax).toBe(0);
    });

    it('should split QD/LTCG between 0% and 15% at threshold boundary', () => {
      const result = computePreferentialRatesTax2025({
        filingStatus: 'single',
        taxableIncome: $(53350),        // $45k ordinary + $8,350 QD/LTCG  
        qualifiedDividendsAndLTCG: $(8350)
      });

      // $3,350 at 0% (to reach $48,350 threshold), $5,000 at 15%
      expect(result.at0Percent).toBe($(3350));  // $48,350 - $45,000 = $3,350
      expect(result.at15Percent).toBe($(5000)); // Remaining $5,000
      expect(result.at20Percent).toBe(0);
      expect(result.preferentialTax).toBe($(750)); // $5,000 × 15%
    });
  });

  describe('Married Filing Jointly 15% bracket', () => {
    it('should handle large QD/LTCG amounts crossing into 20% bracket', () => {
      const result = computePreferentialRatesTax2025({
        filingStatus: 'marriedJointly',
        taxableIncome: $(700000),       // $100k ordinary + $600k QD/LTCG
        qualifiedDividendsAndLTCG: $(600000)
      });

      // All ordinary income uses up 0% capacity
      // $500,050 at 15% (from $96,700 to $600,050 threshold)  
      // $99,950 at 20% (remaining)
      expect(result.at0Percent).toBe(0);
      expect(result.at15Percent).toBe($(503350)); // $600,050 - $96,700 = $503,350
      expect(result.at20Percent).toBe($(96650));  // $600,000 - $503,350 = $96,650
      
      const expectedTax = $(503350) * 0.15 + $(96650) * 0.20;
      expect(result.preferentialTax).toBe(Math.round(expectedTax));
    });
  });

  describe('Head of Household edge cases', () => {
    it('should handle case where all QD/LTCG is at 20%', () => {
      const result = computePreferentialRatesTax2025({
        filingStatus: 'headOfHousehold',
        taxableIncome: $(600000),       // $100k ordinary + $500k QD/LTCG
        qualifiedDividendsAndLTCG: $(500000)
      });

      // With $100k ordinary income, no 0% capacity left
      // 15% capacity: $566,700 - $100,000 = $466,700
      // So $466,700 at 15%, $33,300 at 20%
      expect(result.at0Percent).toBe(0);
      expect(result.at15Percent).toBe($(466700));
      expect(result.at20Percent).toBe($(33300));
    });
  });

  describe('Boundary conditions', () => {
    it('should handle zero QD/LTCG income', () => {
      const result = computePreferentialRatesTax2025({
        filingStatus: 'single',
        taxableIncome: $(50000),
        qualifiedDividendsAndLTCG: 0
      });

      expect(result.at0Percent).toBe(0);
      expect(result.at15Percent).toBe(0); 
      expect(result.at20Percent).toBe(0);
      expect(result.preferentialTax).toBe(0);
    });

    it('should handle taxable income less than QD/LTCG (edge case)', () => {
      // This shouldn't happen in practice but engine should handle gracefully
      const result = computePreferentialRatesTax2025({
        filingStatus: 'single',
        taxableIncome: $(10000),
        qualifiedDividendsAndLTCG: $(15000) // More QD/LTCG than total taxable income
      });

      // Should treat as if ordinary income is negative (not realistic but mathematically consistent)
      expect(result.at0Percent).toBe($(10000)); // All at 0% since under threshold
      expect(result.preferentialTax).toBe(0);
    });
  });
});