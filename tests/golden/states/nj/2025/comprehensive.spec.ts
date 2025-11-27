import { describe, it, expect } from 'vitest';
import { computeNJ2025 } from '../../../../../src/engine/states/NJ/2025/computeNJ2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';
import type { NJStateSpecific } from '../../../../../src/engine/rules/2025/states/nj';

/**
 * Helper to create a minimal FederalResult2025 for testing
 */
function createFederalResult(agi: number): FederalResult2025 {
  return {
    agi,
    totalIncome: agi,
    adjustments: 0,
    deductions: 0,
    taxableIncome: agi,
    regularIncomeTax: 0,
    qualifiedIncomeTax: 0,
    totalIncomeTax: 0,
    selfEmploymentTax: 0,
    netInvestmentIncomeTax: 0,
    additionalMedicareTax: 0,
    totalTax: 0,
    credits: {
      ctc: 0,
      aotc: 0,
      llc: 0,
      eitc: 0,
      cdctc: 0,
      saverCredit: 0,
      ftc: 0,
      otherNonRefundable: 0,
      otherRefundable: 0,
    },
    totalCredits: 0,
    totalNonRefundableCredits: 0,
    totalRefundableCredits: 0,
    taxAfterCredits: 0,
    payments: 0,
    refundOrOwe: 0,
  };
}

/**
 * Dollar amount helper for readability
 */
const $ = (amount: number): number => Math.round(amount * 100);

describe('New Jersey State Tax 2025 - Comprehensive Tests', () => {
  describe('Basic Tax Calculation - Single Filers (7 Brackets)', () => {
    it('should calculate tax in first bracket (1.4%)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(15000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $15,000
      // Standard deduction: $1,000
      // Taxable: $15,000 - $1,000 = $14,000
      // Tax: $14,000 × 1.4% = $196.00
      expect(result.agiState).toBe($(15000));
      expect(result.taxableIncomeState).toBe($(14000));
      expect(result.stateTax).toBe($(196.00));
    });

    it('should calculate tax across multiple brackets (single)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $50,000
      // Standard deduction: $1,000
      // Taxable: $50,000 - $1,000 = $49,000
      // Tax calculation:
      //   $0-$20,000 @ 1.4% = $280.00
      //   $20,001-$35,000 @ 1.75% = $262.50
      //   $35,001-$40,000 @ 3.5% = $175.00
      //   $40,001-$49,000 @ 5.525% = $497.25
      //   Total = $1,214.75
      expect(result.taxableIncomeState).toBe($(49000));
      expect(result.stateTax).toBe($(1214.75));
    });

    it('should calculate tax for high earner reaching top bracket (single)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(1200000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $1,200,000
      // Standard deduction: $1,000
      // Taxable: $1,200,000 - $1,000 = $1,199,000
      // Tax calculation (7 brackets):
      //   $0-$20,000 @ 1.4% = $280.00
      //   $20,001-$35,000 @ 1.75% = $262.50
      //   $35,001-$40,000 @ 3.5% = $175.00
      //   $40,001-$75,000 @ 5.525% = $1,933.75
      //   $75,001-$500,000 @ 6.37% = $27,072.50
      //   $500,001-$1,000,000 @ 8.97% = $44,850.00
      //   $1,000,001-$1,199,000 @ 10.75% = $21,392.50
      //   Total = $95,966.25
      expect(result.taxableIncomeState).toBe($(1199000));
      expect(result.stateTax).toBe($(95966.25));
    });
  });

  describe('Basic Tax Calculation - Married Filing Jointly (8 Brackets)', () => {
    it('should calculate tax in first brackets (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(40000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $40,000
      // Standard deduction: $2,000
      // Taxable: $40,000 - $2,000 = $38,000
      // Tax calculation (8-bracket structure):
      //   $0-$20,000 @ 1.4% = $280.00
      //   $20,001-$38,000 @ 1.75% = $315.00
      //   Total = $595.00
      expect(result.taxableIncomeState).toBe($(38000));
      expect(result.stateTax).toBe($(595.00));
    });

    it('should calculate tax across multiple brackets (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(120000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $120,000
      // Standard deduction: $2,000
      // Dependent exemptions: 2 × $1,500 = $3,000
      // Total deductions: $5,000
      // Taxable: $120,000 - $5,000 = $115,000
      // Tax calculation (8 brackets):
      //   $0-$20,000 @ 1.4% = $280.00
      //   $20,001-$50,000 @ 1.75% = $525.00
      //   $50,001-$70,000 @ 2.45% = $490.00
      //   $70,001-$80,000 @ 3.5% = $350.00
      //   $80,001-$115,000 @ 5.525% = $1,933.75
      //   Total = $3,578.75
      expect(result.taxableIncomeState).toBe($(115000));
      expect(result.stateTax).toBe($(3578.75));
    });

    it('should calculate tax for millionaire (MFJ top bracket)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(1500000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $1,500,000
      // Standard deduction: $2,000
      // Taxable: $1,500,000 - $2,000 = $1,498,000
      // Tax calculation (8 brackets):
      //   $0-$20,000 @ 1.4% = $280.00
      //   $20,001-$50,000 @ 1.75% = $525.00
      //   $50,001-$70,000 @ 2.45% = $490.00
      //   $70,001-$80,000 @ 3.5% = $350.00
      //   $80,001-$150,000 @ 5.525% = $3,867.50
      //   $150,001-$500,000 @ 6.37% = $22,295.00
      //   $500,001-$1,000,000 @ 8.97% = $44,850.00
      //   $1,000,001-$1,498,000 @ 10.75% = $53,535.00
      //   Total = $126,192.50
      expect(result.taxableIncomeState).toBe($(1498000));
      expect(result.stateTax).toBe($(126192.50));
    });
  });

  describe('Standard Deduction', () => {
    it('should apply $1,000 standard deduction for single', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(30000)),
      };

      const result = computeNJ2025(input);

      // Taxable: $30,000 - $1,000 = $29,000
      expect(result.taxableIncomeState).toBe($(29000));
    });

    it('should apply $2,000 standard deduction for MFJ', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
      };

      const result = computeNJ2025(input);

      // Taxable: $60,000 - $2,000 = $58,000
      expect(result.taxableIncomeState).toBe($(58000));
    });

    it('should apply $2,000 standard deduction for head of household', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'headOfHousehold',
        dependents: 1,
        federalResult: createFederalResult($(50000)),
      };

      const result = computeNJ2025(input);

      // Standard deduction: $2,000
      // Dependent exemption: $1,500
      // Total: $3,500
      // Taxable: $50,000 - $3,500 = $46,500
      expect(result.taxableIncomeState).toBe($(46500));
    });
  });

  describe('Dependent Exemptions', () => {
    it('should apply $1,500 exemption per dependent', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 2,
        federalResult: createFederalResult($(60000)),
      };

      const result = computeNJ2025(input);

      // NJ AGI: $60,000
      // Standard deduction: $1,000
      // Dependent exemptions: 2 × $1,500 = $3,000
      // Total deductions: $4,000
      // Taxable: $60,000 - $4,000 = $56,000
      expect(result.taxableIncomeState).toBe($(56000));
    });

    it('should handle many dependents', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 5,
        federalResult: createFederalResult($(100000)),
      };

      const result = computeNJ2025(input);

      // Standard deduction: $2,000
      // Dependent exemptions: 5 × $1,500 = $7,500
      // Total: $9,500
      // Taxable: $100,000 - $9,500 = $90,500
      expect(result.taxableIncomeState).toBe($(90500));
    });
  });

  describe('Age Exemption (65+)', () => {
    it('should apply $1,000 age exemption for single filer age 65+', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          taxpayerAge: 70,
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $1,000
      // Age exemption: $1,000
      // Total: $2,000
      // Taxable: $50,000 - $2,000 = $48,000
      expect(result.taxableIncomeState).toBe($(48000));
    });

    it('should apply $1,000 age exemption for each spouse age 65+ (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(80000)),
        stateSpecific: {
          taxpayerAge: 68,
          spouseAge: 72,
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $2,000
      // Age exemptions: 2 × $1,000 = $2,000
      // Total: $4,000
      // Taxable: $80,000 - $4,000 = $76,000
      expect(result.taxableIncomeState).toBe($(76000));
    });

    it('should not apply age exemption if under 65', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          taxpayerAge: 64,
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Only standard deduction: $1,000
      // Taxable: $50,000 - $1,000 = $49,000
      expect(result.taxableIncomeState).toBe($(49000));
    });
  });

  describe('Property Tax Deduction', () => {
    it('should deduct property taxes paid (up to $15,000)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(80000)),
        stateSpecific: {
          propertyTaxPaid: $(10000),
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $1,000
      // Property tax deduction: $10,000
      // Total: $11,000
      // Taxable: $80,000 - $11,000 = $69,000
      expect(result.taxableIncomeState).toBe($(69000));
    });

    it('should cap property tax deduction at $15,000', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(150000)),
        stateSpecific: {
          propertyTaxPaid: $(20000), // Exceeds $15,000 cap
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $2,000
      // Property tax deduction: $15,000 (capped)
      // Total: $17,000
      // Taxable: $150,000 - $17,000 = $133,000
      expect(result.taxableIncomeState).toBe($(133000));
    });

    it('should calculate property tax for renters (18% of rent)', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          rentPaid: $(24000), // Annual rent
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Property tax (renter): $24,000 × 18% = $4,320
      // Standard deduction: $1,000
      // Total: $5,320
      // Taxable: $60,000 - $5,320 = $54,680
      expect(result.taxableIncomeState).toBe($(54680));
    });
  });

  describe('Property Tax Credit ($50 Refundable)', () => {
    it('should apply $50 property tax credit instead of deduction', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(30000)),
        stateSpecific: {
          propertyTaxPaid: $(5000),
          usePropertyTaxCredit: true, // Use credit instead of deduction
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $1,000 (property tax NOT deducted)
      // Taxable: $30,000 - $1,000 = $29,000
      // Tax before credit: calculated from $29,000
      // Credit: $50 (refundable)
      expect(result.taxableIncomeState).toBe($(29000));
      expect(result.credits.refundableCredits).toBe($(50));
    });

    it('should not use deduction when credit is selected', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          propertyTaxPaid: $(10000),
          usePropertyTaxCredit: true,
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Property tax NOT deducted (using credit instead)
      // Only standard deduction: $1,000
      // Taxable: $50,000 - $1,000 = $49,000
      expect(result.taxableIncomeState).toBe($(49000));
      expect(result.credits.refundableCredits).toBe($(50));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(0)),
      };

      const result = computeNJ2025(input);

      expect(result.agiState).toBe($(0));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should handle income less than deductions', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(500)),
      };

      const result = computeNJ2025(input);

      // Standard deduction $1,000 exceeds income
      // Taxable: $0
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should calculate withholding and refund', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(40000)),
        stateSpecific: {
          stateWithheld: $(1500),
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Tax will be calculated
      // Refund = withholding - tax
      expect(result.stateWithheld).toBe($(1500));
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Should have refund
    });
  });

  describe('Combined Scenarios', () => {
    it('should handle elderly couple with dependents and property tax', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 3,
        federalResult: createFederalResult($(120000)),
        stateSpecific: {
          taxpayerAge: 70,
          spouseAge: 68,
          propertyTaxPaid: $(12000),
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $2,000
      // Dependent exemptions: 3 × $1,500 = $4,500
      // Age exemptions: 2 × $1,000 = $2,000
      // Property tax deduction: $12,000
      // Total deductions: $20,500
      // Taxable: $120,000 - $20,500 = $99,500
      expect(result.taxableIncomeState).toBe($(99500));
    });

    it('should handle high earner with maximum property tax deduction', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(600000)),
        stateSpecific: {
          propertyTaxPaid: $(25000), // Will be capped at $15,000
        } as NJStateSpecific,
      };

      const result = computeNJ2025(input);

      // Standard deduction: $2,000
      // Dependent exemptions: 2 × $1,500 = $3,000
      // Property tax deduction: $15,000 (capped)
      // Total: $20,000
      // Taxable: $600,000 - $20,000 = $580,000
      expect(result.taxableIncomeState).toBe($(580000));
    });

    it('should handle millionaire in top bracket', () => {
      const input: StateTaxInput = {
        state: 'NJ',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(2000000)),
      };

      const result = computeNJ2025(input);

      // AGI: $2,000,000
      // Standard deduction: $1,000
      // Taxable: $1,999,000
      // Most income taxed at 10.75% (top bracket)
      expect(result.taxableIncomeState).toBe($(1999000));
      expect(result.stateTax).toBeGreaterThan($(100000)); // Substantial tax
    });
  });
});
