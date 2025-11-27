import { describe, it, expect } from 'vitest';
import { computeIL2025 } from '../../../../../src/engine/states/IL/2025/computeIL2025';
import { dollarsToCents } from '../../../../../src/engine';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

const $ = dollarsToCents;

/**
 * Helper to create a minimal federal result for testing
 */
function createFederalResult(agi: number, eitc: number = 0): FederalResult2025 {
  return {
    agi,
    taxableIncome: agi,
    standardDeduction: 0,
    taxBeforeCredits: 0,
    credits: {
      eitc,
    },
    totalTax: 0,
    totalPayments: 0,
    refundOrOwe: 0,
    diagnostics: { errors: [], warnings: [], info: [] },
  } as FederalResult2025;
}

describe('Illinois State Tax 2025 - Comprehensive Tests', () => {
  describe('Basic Tax Calculation - Flat 4.95% Rate', () => {
    it('should calculate tax for single filer with no deductions', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
      };

      const result = computeIL2025(input);

      // IL AGI: $50,000
      // Exemption: $2,825 (single)
      // Taxable: $50,000 - $2,825 = $47,175
      // Tax: $47,175 × 4.95% = $2,335.16
      expect(result.agiState).toBe($(50000));
      expect(result.taxableIncomeState).toBe($(47175));
      expect(result.stateTax).toBe($(2335.16));
    });

    it('should calculate tax for married filing jointly with dependents', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(100000)),
      };

      const result = computeIL2025(input);

      // IL AGI: $100,000
      // Exemptions: $2,825 × 4 (taxpayer + spouse + 2 dependents) = $11,300
      // Taxable: $100,000 - $11,300 = $88,700
      // Tax: $88,700 × 4.95% = $4,390.65
      expect(result.agiState).toBe($(100000));
      expect(result.taxableIncomeState).toBe($(88700));
      expect(result.stateTax).toBe($(4390.65));
    });

    it('should calculate tax for high earner', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(200000)),
      };

      const result = computeIL2025(input);

      // IL AGI: $200,000
      // Exemption: $2,825 (within $250k limit)
      // Taxable: $200,000 - $2,825 = $197,175
      // Tax: $197,175 × 4.95% = $9,760.16
      expect(result.agiState).toBe($(200000));
      expect(result.taxableIncomeState).toBe($(197175));
      expect(result.stateTax).toBe($(9760.16));
    });
  });

  describe('Personal Exemptions', () => {
    it('should deny exemptions for single filer above $250k AGI', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(300000)),
      };

      const result = computeIL2025(input);

      // AGI > $250,000: No exemptions
      // Taxable: $300,000
      // Tax: $300,000 × 4.95% = $14,850
      expect(result.agiState).toBe($(300000));
      expect(result.taxableIncomeState).toBe($(300000));
      expect(result.stateTax).toBe($(14850));
    });

    it('should deny exemptions for MFJ above $500k AGI', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(600000)),
      };

      const result = computeIL2025(input);

      // AGI > $500,000: No exemptions
      // Taxable: $600,000
      // Tax: $600,000 × 4.95% = $29,700
      expect(result.agiState).toBe($(600000));
      expect(result.taxableIncomeState).toBe($(600000));
      expect(result.stateTax).toBe($(29700));
    });

    it('should calculate exemptions for family with multiple dependents', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 4,
        federalResult: createFederalResult($(120000)),
      };

      const result = computeIL2025(input);

      // Exemptions: $2,825 × 6 (2 adults + 4 kids) = $16,950
      // Taxable: $120,000 - $16,950 = $103,050
      // Tax: $103,050 × 4.95% = $5,100.98
      expect(result.taxableIncomeState).toBe($(103050));
      expect(result.stateTax).toBe($(5100.98));
    });
  });

  describe('Retirement Income Exemption', () => {
    it('should fully exempt Social Security benefits', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(40000)), // Includes SS
        stateSpecific: {
          retirementIncome: {
            socialSecurityBenefits: $(15000),
          },
        },
      };

      const result = computeIL2025(input);

      // IL AGI: $40,000 - $15,000 = $25,000
      // Exemption: $2,825
      // Taxable: $25,000 - $2,825 = $22,175
      // Tax: $22,175 × 4.95% = $1,097.66
      expect(result.agiState).toBe($(25000));
      expect(result.taxableIncomeState).toBe($(22175));
      expect(result.stateTax).toBe($(1097.66));
    });

    it('should fully exempt pension income', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          retirementIncome: {
            pensionIncome: $(30000),
          },
        },
      };

      const result = computeIL2025(input);

      // IL AGI: $60,000 - $30,000 = $30,000
      // Exemption: $2,825
      // Taxable: $30,000 - $2,825 = $27,175
      // Tax: $27,175 × 4.95% = $1,345.16
      expect(result.agiState).toBe($(30000));
      expect(result.stateTax).toBe($(1345.16));
    });

    it('should fully exempt IRA distributions', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(80000)),
        stateSpecific: {
          retirementIncome: {
            iraDistributions: $(25000),
          },
        },
      };

      const result = computeIL2025(input);

      // IL AGI: $80,000 - $25,000 = $55,000
      // Exemptions: $2,825 × 2 = $5,650
      // Taxable: $55,000 - $5,650 = $49,350
      // Tax: $49,350 × 4.95% = $2,442.83
      expect(result.agiState).toBe($(55000));
      expect(result.stateTax).toBe($(2442.83));
    });

    it('should exempt multiple retirement income sources', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          retirementIncome: {
            socialSecurityBenefits: $(20000),
            pensionIncome: $(15000),
            iraDistributions: $(10000),
            qualifiedPlanDistributions: $(5000),
          },
        },
      };

      const result = computeIL2025(input);

      // Total retirement: $50,000
      // IL AGI: $100,000 - $50,000 = $50,000
      // Exemptions: $5,650
      // Taxable: $50,000 - $5,650 = $44,350
      // Tax: $44,350 × 4.95% = $2,195.33
      expect(result.agiState).toBe($(50000));
      expect(result.stateTax).toBe($(2195.33));
    });
  });

  describe('Property Tax Credit', () => {
    it('should calculate 5% property tax credit for single filer', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(75000)),
        stateSpecific: {
          propertyTaxPaid: $(5000), // Paid $5,000 in property tax
        },
      };

      const result = computeIL2025(input);

      // Tax before credit: ($75,000 - $2,825) × 4.95% = $3,572.66
      // Property tax credit: $5,000 × 5% = $250
      // Final tax: $3,572.66 - $250 = $3,322.66
      expect(result.credits?.nonRefundableCredits).toBe($(250));
      expect(result.stateTax).toBe($(3322.66));
    });

    it('should calculate property tax credit for married couple', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(150000)),
        stateSpecific: {
          propertyTaxPaid: $(10000), // Paid $10,000 in property tax
        },
      };

      const result = computeIL2025(input);

      // Exemptions: $2,825 × 4 = $11,300
      // Taxable: $150,000 - $11,300 = $138,700
      // Tax before credit: $138,700 × 4.95% = $6,865.65
      // Property tax credit: $10,000 × 5% = $500
      // Final tax: $6,865.65 - $500 = $6,365.65
      expect(result.credits?.nonRefundableCredits).toBe($(500));
      expect(result.stateTax).toBe($(6365.65));
    });

    it('should deny property tax credit for single filer above $250k', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(300000)),
        stateSpecific: {
          propertyTaxPaid: $(8000),
        },
      };

      const result = computeIL2025(input);

      // AGI > $250,000: No property tax credit
      expect(result.credits?.nonRefundableCredits).toBe(0);
      expect(result.stateTax).toBe($(14850)); // No credit applied
    });

    it('should deny property tax credit for MFJ above $500k', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(550000)),
        stateSpecific: {
          propertyTaxPaid: $(12000),
        },
      };

      const result = computeIL2025(input);

      // AGI > $500,000: No property tax credit
      expect(result.credits?.nonRefundableCredits).toBe(0);
    });

    it('should handle zero property tax paid', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          propertyTaxPaid: 0,
        },
      };

      const result = computeIL2025(input);

      // No property tax paid: No credit
      expect(result.credits?.nonRefundableCredits).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult(0),
      };

      const result = computeIL2025(input);

      expect(result.agiState).toBe(0);
      expect(result.taxableIncomeState).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle income less than exemption', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(2000)),
      };

      const result = computeIL2025(input);

      // Taxable income: max(0, $2,000 - $2,825) = 0
      expect(result.taxableIncomeState).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle head of household status', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'headOfHousehold',
        dependents: 1,
        federalResult: createFederalResult($(55000)),
      };

      const result = computeIL2025(input);

      // Exemptions: $2,825 × 2 (taxpayer + 1 dependent) = $5,650
      // Taxable: $55,000 - $5,650 = $49,350
      // Tax: $49,350 × 4.95% = $2,442.83
      expect(result.taxableIncomeState).toBe($(49350));
      expect(result.stateTax).toBe($(2442.83));
    });

    it('should calculate withholding and refund/owe', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          stateWithheld: $(2500), // Had $2,500 withheld
        },
      };

      const result = computeIL2025(input);

      // Tax: $2,335.16
      // Withheld: $2,500
      // Refund: $2,500 - $2,335.16 = $164.84
      expect(result.stateTax).toBe($(2335.16));
      expect(result.stateWithheld).toBe($(2500));
      expect(result.stateRefundOrOwe).toBe($(164.84));
    });
  });

  describe('Combined Scenarios', () => {
    it('should handle retiree with property tax credit', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(70000)),
        stateSpecific: {
          retirementIncome: {
            socialSecurityBenefits: $(30000),
            pensionIncome: $(20000),
          },
          propertyTaxPaid: $(6000),
        },
      };

      const result = computeIL2025(input);

      // IL AGI: $70,000 - $50,000 = $20,000
      // Exemptions: $5,650
      // Taxable: $20,000 - $5,650 = $14,350
      // Tax before credit: $14,350 × 4.95% = $710.33
      // Property tax credit: $6,000 × 5% = $300
      // Final tax: $710.33 - $300 = $410.33
      expect(result.agiState).toBe($(20000));
      expect(result.credits?.nonRefundableCredits).toBe($(300));
      expect(result.stateTax).toBe($(410.33));
    });

    it('should handle high-income family with no credits', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'marriedJointly',
        dependents: 3,
        federalResult: createFederalResult($(600000)),
        stateSpecific: {
          propertyTaxPaid: $(15000),
        },
      };

      const result = computeIL2025(input);

      // AGI > $500,000: No exemptions, no credits
      // Tax: $600,000 × 4.95% = $29,700
      expect(result.taxableIncomeState).toBe($(600000));
      expect(result.credits?.nonRefundableCredits).toBe(0);
      expect(result.stateTax).toBe($(29700));
    });

    it('should handle worker with modest income and property', () => {
      const input: StateTaxInput = {
        state: 'IL',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(45000)),
        stateSpecific: {
          propertyTaxPaid: $(3500),
        },
      };

      const result = computeIL2025(input);

      // Taxable: $45,000 - $2,825 = $42,175
      // Tax before credit: $42,175 × 4.95% = $2,087.66
      // Property tax credit: $3,500 × 5% = $175
      // Final tax: $2,087.66 - $175 = $1,912.66
      expect(result.stateTax).toBe($(1912.66));
    });
  });
});
