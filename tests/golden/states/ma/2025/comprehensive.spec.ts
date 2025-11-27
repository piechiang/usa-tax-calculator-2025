import { describe, it, expect } from 'vitest';
import { computeMA2025 } from '../../../../../src/engine/states/MA/2025/computeMA2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';
import type { MAStateSpecific } from '../../../../../src/engine/rules/2025/states/ma';

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

describe('Massachusetts State Tax 2025 - Comprehensive Tests', () => {
  describe('Basic Tax Calculation (5% Flat Rate)', () => {
    it('should calculate 5% tax for single filer under surtax threshold', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $50,000
      // Personal exemption: $4,400
      // Taxable: $50,000 - $4,400 = $45,600
      // Base tax: $45,600 × 5% = $2,280.00
      // Surtax: $0 (under threshold)
      // Total tax: $2,280.00
      expect(result.agiState).toBe($(50000));
      expect(result.taxableIncomeState).toBe($(45600));
      expect(result.stateTax).toBe($(2280.00));
    });

    it('should calculate 5% tax for married filing jointly with dependents', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(100000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $100,000
      // Personal exemption: $8,800
      // Dependent exemptions: 2 × $1,000 = $2,000
      // Total exemptions: $8,800 + $2,000 = $10,800
      // Taxable: $100,000 - $10,800 = $89,200
      // Base tax: $89,200 × 5% = $4,460.00
      // Surtax: $0 (under threshold)
      // Total tax: $4,460.00
      expect(result.agiState).toBe($(100000));
      expect(result.taxableIncomeState).toBe($(89200));
      expect(result.stateTax).toBe($(4460.00));
    });

    it('should calculate 5% tax for high earner under surtax threshold', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(500000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $500,000
      // Personal exemption: $4,400
      // Taxable: $500,000 - $4,400 = $495,600
      // Base tax: $495,600 × 5% = $24,780.00
      // Surtax: $0 (under $1.08M threshold)
      // Total tax: $24,780.00
      expect(result.agiState).toBe($(500000));
      expect(result.taxableIncomeState).toBe($(495600));
      expect(result.stateTax).toBe($(24780.00));
    });
  });

  describe('Millionaire Surtax (4% on Income Over ~$1.08M)', () => {
    it('should apply 4% surtax on income exceeding $1.08M threshold', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(1200000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $1,200,000
      // Personal exemption: $4,400
      // Taxable: $1,200,000 - $4,400 = $1,195,600
      // Base tax: $1,195,600 × 5% = $59,780.00
      // Surtax: ($1,195,600 - $1,080,000) × 4% = $115,600 × 4% = $4,624.00
      // Total tax: $59,780.00 + $4,624.00 = $64,404.00
      expect(result.agiState).toBe($(1200000));
      expect(result.taxableIncomeState).toBe($(1195600));
      expect(result.stateTax).toBe($(64404.00));
    });

    it('should calculate combined 9% effective rate on income over threshold', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(2000000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $2,000,000
      // Personal exemption: $4,400
      // Taxable: $2,000,000 - $4,400 = $1,995,600
      // Base tax: $1,995,600 × 5% = $99,780.00
      // Surtax: ($1,995,600 - $1,080,000) × 4% = $915,600 × 4% = $36,624.00
      // Total tax: $99,780.00 + $36,624.00 = $136,404.00
      expect(result.agiState).toBe($(2000000));
      expect(result.taxableIncomeState).toBe($(1995600));
      expect(result.stateTax).toBe($(136404.00));
    });

    it('should apply surtax only to portion exceeding threshold', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(1100000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $1,100,000
      // Personal exemption: $4,400
      // Taxable: $1,100,000 - $4,400 = $1,095,600
      // Base tax: $1,095,600 × 5% = $54,780.00
      // Excess over threshold: $1,095,600 - $1,080,000 = $15,600
      // Surtax: $15,600 × 4% = $624.00
      // Total tax: $54,780.00 + $624.00 = $55,404.00
      expect(result.agiState).toBe($(1100000));
      expect(result.taxableIncomeState).toBe($(1095600));
      expect(result.stateTax).toBe($(55404.00));
    });

    it('should handle income exactly at surtax threshold', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(1084400)), // Exactly at threshold after exemption
      };

      const result = computeMA2025(input);

      // MA AGI: $1,084,400
      // Personal exemption: $4,400
      // Taxable: $1,084,400 - $4,400 = $1,080,000 (exactly at threshold)
      // Base tax: $1,080,000 × 5% = $54,000.00
      // Surtax: $0 (not over threshold)
      // Total tax: $54,000.00
      expect(result.agiState).toBe($(1084400));
      expect(result.taxableIncomeState).toBe($(1080000));
      expect(result.stateTax).toBe($(54000.00));
    });
  });

  describe('Personal Exemptions', () => {
    it('should apply $4,400 personal exemption for single filer', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
      };

      const result = computeMA2025(input);

      // Taxable: $60,000 - $4,400 = $55,600
      expect(result.taxableIncomeState).toBe($(55600));
    });

    it('should apply $8,800 personal exemption for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(120000)),
      };

      const result = computeMA2025(input);

      // Taxable: $120,000 - $8,800 = $111,200
      expect(result.taxableIncomeState).toBe($(111200));
    });

    it('should apply $4,400 personal exemption for head of household', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'headOfHousehold',
        dependents: 1,
        federalResult: createFederalResult($(70000)),
      };

      const result = computeMA2025(input);

      // Personal exemption: $4,400
      // Dependent exemption: $1,000
      // Total: $5,400
      // Taxable: $70,000 - $5,400 = $64,600
      expect(result.taxableIncomeState).toBe($(64600));
    });
  });

  describe('Dependent Exemptions', () => {
    it('should apply $1,000 exemption per dependent', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 3,
        federalResult: createFederalResult($(80000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $80,000
      // Personal exemption: $4,400
      // Dependent exemptions: 3 × $1,000 = $3,000
      // Total exemptions: $7,400
      // Taxable: $80,000 - $7,400 = $72,600
      expect(result.taxableIncomeState).toBe($(72600));
    });

    it('should handle zero dependents', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(90000)),
      };

      const result = computeMA2025(input);

      // Only personal exemption: $8,800
      // Taxable: $90,000 - $8,800 = $81,200
      expect(result.taxableIncomeState).toBe($(81200));
    });

    it('should handle many dependents', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 5,
        federalResult: createFederalResult($(150000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $150,000
      // Personal exemption: $8,800
      // Dependent exemptions: 5 × $1,000 = $5,000
      // Total exemptions: $13,800
      // Taxable: $150,000 - $13,800 = $136,200
      expect(result.taxableIncomeState).toBe($(136200));
    });
  });

  describe('Age Exemption (65+)', () => {
    it('should apply $700 age exemption for single filer age 65+', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          taxpayerAge: 68,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $50,000
      // Personal exemption: $4,400
      // Age exemption: $700
      // Total exemptions: $5,100
      // Taxable: $50,000 - $5,100 = $44,900
      expect(result.taxableIncomeState).toBe($(44900));
    });

    it('should apply $700 age exemption for each spouse age 65+ (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          taxpayerAge: 70,
          spouseAge: 72,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $100,000
      // Personal exemption: $8,800
      // Age exemptions: 2 × $700 = $1,400
      // Total exemptions: $10,200
      // Taxable: $100,000 - $10,200 = $89,800
      expect(result.taxableIncomeState).toBe($(89800));
    });

    it('should not apply age exemption if under 65', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          taxpayerAge: 64, // Under 65
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // Only personal exemption: $4,400
      // Taxable: $50,000 - $4,400 = $45,600
      expect(result.taxableIncomeState).toBe($(45600));
    });

    it('should apply age exemption for one spouse only if other under 65 (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          taxpayerAge: 70,
          spouseAge: 62, // Under 65
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $100,000
      // Personal exemption: $8,800
      // Age exemptions: 1 × $700 = $700 (only taxpayer qualifies)
      // Total exemptions: $9,500
      // Taxable: $100,000 - $9,500 = $90,500
      expect(result.taxableIncomeState).toBe($(90500));
    });
  });

  describe('Blind Exemption', () => {
    it('should apply $2,200 blind exemption for single filer', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          taxpayerBlind: true,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $50,000
      // Personal exemption: $4,400
      // Blind exemption: $2,200
      // Total exemptions: $6,600
      // Taxable: $50,000 - $6,600 = $43,400
      expect(result.taxableIncomeState).toBe($(43400));
    });

    it('should apply $2,200 blind exemption for each blind spouse (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          taxpayerBlind: true,
          spouseBlind: true,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $100,000
      // Personal exemption: $8,800
      // Blind exemptions: 2 × $2,200 = $4,400
      // Total exemptions: $13,200
      // Taxable: $100,000 - $13,200 = $86,800
      expect(result.taxableIncomeState).toBe($(86800));
    });

    it('should combine age and blind exemptions', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          taxpayerAge: 70,
          taxpayerBlind: true,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $60,000
      // Personal exemption: $4,400
      // Age exemption: $700
      // Blind exemption: $2,200
      // Total exemptions: $7,300
      // Taxable: $60,000 - $7,300 = $52,700
      expect(result.taxableIncomeState).toBe($(52700));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(0)),
      };

      const result = computeMA2025(input);

      expect(result.agiState).toBe($(0));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should handle income less than exemptions', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(3000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $3,000
      // Personal exemption: $4,400 (exceeds AGI)
      // Taxable: max(0, $3,000 - $4,400) = $0
      expect(result.agiState).toBe($(3000));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should calculate withholding and refund', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          stateWithheld: $(3000),
          stateEstPayments: $(500),
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // Tax: $2,280.00 (from earlier test)
      // Total payments: $3,000 + $500 = $3,500
      // Refund: $3,500 - $2,280 = $1,220
      expect(result.stateTax).toBe($(2280.00));
      expect(result.stateWithheld).toBe($(3000));
      expect(result.stateRefundOrOwe).toBe($(1220.00));
    });
  });

  describe('Combined Scenarios', () => {
    it('should handle millionaire with dependents and exemptions', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 3,
        federalResult: createFederalResult($(1500000)),
        stateSpecific: {
          taxpayerAge: 68,
          spouseAge: 66,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $1,500,000
      // Personal exemption: $8,800
      // Dependent exemptions: 3 × $1,000 = $3,000
      // Age exemptions: 2 × $700 = $1,400
      // Total exemptions: $13,200
      // Taxable: $1,500,000 - $13,200 = $1,486,800
      // Base tax: $1,486,800 × 5% = $74,340.00
      // Surtax: ($1,486,800 - $1,080,000) × 4% = $406,800 × 4% = $16,272.00
      // Total tax: $74,340.00 + $16,272.00 = $90,612.00
      expect(result.agiState).toBe($(1500000));
      expect(result.taxableIncomeState).toBe($(1486800));
      expect(result.stateTax).toBe($(90612.00));
    });

    it('should handle elderly blind couple with many dependents', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'marriedJointly',
        dependents: 4,
        federalResult: createFederalResult($(120000)),
        stateSpecific: {
          taxpayerAge: 72,
          spouseAge: 70,
          taxpayerBlind: true,
          spouseBlind: false,
        } as MAStateSpecific,
      };

      const result = computeMA2025(input);

      // MA AGI: $120,000
      // Personal exemption: $8,800
      // Dependent exemptions: 4 × $1,000 = $4,000
      // Age exemptions: 2 × $700 = $1,400
      // Blind exemption: 1 × $2,200 = $2,200
      // Total exemptions: $16,400
      // Taxable: $120,000 - $16,400 = $103,600
      // Base tax: $103,600 × 5% = $5,180.00
      expect(result.taxableIncomeState).toBe($(103600));
      expect(result.stateTax).toBe($(5180.00));
    });

    it('should handle ultra-high earner with surtax', () => {
      const input: StateTaxInput = {
        state: 'MA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(5000000)),
      };

      const result = computeMA2025(input);

      // MA AGI: $5,000,000
      // Personal exemption: $4,400
      // Taxable: $5,000,000 - $4,400 = $4,995,600
      // Base tax: $4,995,600 × 5% = $249,780.00
      // Surtax: ($4,995,600 - $1,080,000) × 4% = $3,915,600 × 4% = $156,624.00
      // Total tax: $249,780.00 + $156,624.00 = $406,404.00
      expect(result.stateTax).toBe($(406404.00));
    });
  });
});
