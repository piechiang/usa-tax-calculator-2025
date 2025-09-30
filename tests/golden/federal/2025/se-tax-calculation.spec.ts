import { describe, it, expect } from 'vitest';
import { computeSETax2025 } from '../../../../src/engine/tax/seTax';
import { SS_WAGE_BASE_2025 } from '../../../../src/engine/rules/2025/federal/medicareSocialSecurity';

const $ = (amount: number) => Math.round(amount * 100);

describe('Self-Employment Tax 2025 Calculations', () => {
  describe('Pure SE income scenarios', () => {
    it('should calculate SE tax for moderate income under SS base', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: $(50000),
        w2SocialSecurityWages: 0,
        w2MedicareWages: 0
      });

      // Net earnings from SE: $50,000 × 92.35% = $46,175
      const expectedNESE = Math.round($(50000) * 0.9235);
      expect(result.netEarningsFromSE).toBe(expectedNESE);

      // OASDI: $46,175 × 12.4% = $5,725.70
      expect(result.oasdi).toBe(Math.round(expectedNESE * 0.124));
      
      // Medicare: $46,175 × 2.9% = $1,339.08  
      expect(result.medicare).toBe(Math.round(expectedNESE * 0.029));
      
      // No additional Medicare tax (under $200k threshold)
      expect(result.additionalMedicare).toBe(0);
      
      // Half deduction excludes additional Medicare tax
      const expectedHalf = Math.floor((result.oasdi + result.medicare) / 2);
      expect(result.halfDeduction).toBe(expectedHalf);
    });

    it('should cap OASDI at Social Security wage base', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: $(220000), // Above SS wage base and above Additional Medicare threshold
        w2SocialSecurityWages: 0,
        w2MedicareWages: 0
      });

      const nese = Math.round($(220000) * 0.9235); // $203,170
      expect(result.netEarningsFromSE).toBe(nese);

      // OASDI should be capped at SS wage base
      const maxOASDI = Math.round(SS_WAGE_BASE_2025 * 0.124);
      expect(result.oasdi).toBe(maxOASDI);

      // Medicare has no cap
      expect(result.medicare).toBe(Math.round(nese * 0.029));

      // Should trigger additional Medicare tax (nese $203,170 > $200k threshold)
      expect(result.additionalMedicare).toBeGreaterThan(0);
    });
  });

  describe('W-2 + SE coordination', () => {
    it('should reduce OASDI capacity when W-2 wages consume SS base', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: $(50000),
        w2SocialSecurityWages: $(150000), // Most of SS base used
        w2MedicareWages: $(150000)
      });

      // Remaining SS base: $176,100 - $150,000 = $26,100
      const nese = Math.round($(50000) * 0.9235); // $46,175
      const remainingBase = SS_WAGE_BASE_2025 - $(150000);
      const oasdiBase = Math.min(nese, remainingBase);
      
      expect(result.oasdi).toBe(Math.round(oasdiBase * 0.124));
      expect(result.oasdi).toBeLessThan(Math.round(nese * 0.124)); // Less than full rate
    });

    it('should eliminate OASDI when W-2 wages exceed SS base', () => {
      const result = computeSETax2025({
        filingStatus: 'single', 
        seNetProfit: $(50000),
        w2SocialSecurityWages: SS_WAGE_BASE_2025, // Exactly at wage base
        w2MedicareWages: $(176100)
      });

      // No remaining SS base capacity
      expect(result.oasdi).toBe(0);
      
      // Medicare still applies to SE income
      const nese = Math.round($(50000) * 0.9235);
      expect(result.medicare).toBe(Math.round(nese * 0.029));
    });
  });

  describe('Additional Medicare Tax', () => {
    it('should trigger 0.9% tax for high earners (single)', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: $(100000),
        w2SocialSecurityWages: 0,
        w2MedicareWages: $(150000) // Combined will exceed $200k threshold
      });

      const nese = Math.round($(100000) * 0.9235); // ~$92,350
      const combined = $(150000) + nese; // ~$242,350
      const excess = combined - $(200000); // ~$42,350
      
      expect(result.additionalMedicare).toBe(Math.round(excess * 0.009));
    });

    it('should use correct threshold for MFJ', () => {
      const result = computeSETax2025({
        filingStatus: 'marriedJointly',
        seNetProfit: $(100000),
        w2SocialSecurityWages: 0,
        w2MedicareWages: $(200000) // Combined will exceed $250k threshold for MFJ
      });

      const nese = Math.round($(100000) * 0.9235);
      const combined = $(200000) + nese;
      
      if (combined > $(250000)) {
        const excess = combined - $(250000);
        expect(result.additionalMedicare).toBe(Math.round(excess * 0.009));
      } else {
        expect(result.additionalMedicare).toBe(0);
      }
    });
  });

  describe('Half deduction calculation', () => {
    it('should exclude Additional Medicare Tax from half deduction', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: $(250000), // High income to trigger additional Medicare tax
        w2SocialSecurityWages: 0,
        w2MedicareWages: 0
      });

      // Half deduction should only include OASDI + Medicare, not Additional Medicare
      const baseSETax = result.oasdi + result.medicare;
      expect(result.halfDeduction).toBe(Math.floor(baseSETax / 2));
      
      // Verify Additional Medicare is not included
      expect(result.additionalMedicare).toBeGreaterThan(0);
      expect(result.halfDeduction).toBeLessThan(Math.floor(result.totalSETax / 2));
    });
  });

  describe('Edge cases', () => {
    it('should handle zero or negative SE profit', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: 0,
        w2SocialSecurityWages: $(50000),
        w2MedicareWages: $(50000)
      });

      expect(result.netEarningsFromSE).toBe(0);
      expect(result.oasdi).toBe(0);
      expect(result.medicare).toBe(0);
      expect(result.additionalMedicare).toBe(0);
      expect(result.halfDeduction).toBe(0);
    });

    it('should handle negative SE profit (loss)', () => {
      const result = computeSETax2025({
        filingStatus: 'single',
        seNetProfit: $(-10000), // Business loss
        w2SocialSecurityWages: $(100000),
        w2MedicareWages: $(100000)
      });

      expect(result.netEarningsFromSE).toBe(0); // Can't be negative
      expect(result.totalSETax).toBe(0);
    });
  });
});