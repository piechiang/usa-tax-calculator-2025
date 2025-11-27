import { describe, it, expect } from 'vitest';
import { computeGA2025 } from '../../../../../src/engine/states/GA/2025/computeGA2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';
import type { GAStateSpecific } from '../../../../../src/engine/rules/2025/states/ga';

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

describe('Georgia State Tax 2025 - Comprehensive Tests', () => {
  describe('Basic Tax Calculation', () => {
    it('should calculate tax for single filer with no deductions or exclusions', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $50,000 (no exclusions)
      // Standard deduction: $12,000
      // Dependent exemptions: $0
      // Taxable: $50,000 - $12,000 = $38,000
      // Tax: $38,000 × 5.19% = $1,972.20
      expect(result.agiState).toBe($(50000));
      expect(result.taxableIncomeState).toBe($(38000));
      expect(result.stateTax).toBe($(1972.20));
    });

    it('should calculate tax for married filing jointly with dependents', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(100000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $100,000
      // Standard deduction: $24,000
      // Dependent exemptions: 2 × $4,000 = $8,000
      // Total deductions: $24,000 + $8,000 = $32,000
      // Taxable: $100,000 - $32,000 = $68,000
      // Tax: $68,000 × 5.19% = $3,529.20
      expect(result.agiState).toBe($(100000));
      expect(result.taxableIncomeState).toBe($(68000));
      expect(result.stateTax).toBe($(3529.20));
    });

    it('should calculate tax for high earner', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(250000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $250,000
      // Standard deduction: $12,000
      // Taxable: $250,000 - $12,000 = $238,000
      // Tax: $238,000 × 5.19% = $12,352.20
      expect(result.agiState).toBe($(250000));
      expect(result.taxableIncomeState).toBe($(238000));
      expect(result.stateTax).toBe($(12352.20));
    });
  });

  describe('Retirement Income Exclusion - Ages 62-64', () => {
    it('should apply $35,000 exclusion for single filer age 62-64', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(70000)),
        stateSpecific: {
          taxpayerAge: 63,
          retirementIncome: {
            pensionIncome: $(40000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $70,000 (includes $40k pension)
      // Retirement exclusion: min($40,000, $35,000) = $35,000
      // GA AGI: $70,000 - $35,000 = $35,000
      // Standard deduction: $12,000
      // Taxable: $35,000 - $12,000 = $23,000
      // Tax: $23,000 × 5.19% = $1,193.70
      expect(result.agiState).toBe($(35000));
      expect(result.taxableIncomeState).toBe($(23000));
      expect(result.stateTax).toBe($(1193.70));
    });

    it('should not apply exclusion if taxpayer is under age 62', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(70000)),
        stateSpecific: {
          taxpayerAge: 60,
          retirementIncome: {
            pensionIncome: $(30000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // No exclusion (under age 62)
      // GA AGI: $70,000
      // Standard deduction: $12,000
      // Taxable: $70,000 - $12,000 = $58,000
      // Tax: $58,000 × 5.19% = $3,010.20
      expect(result.agiState).toBe($(70000));
      expect(result.taxableIncomeState).toBe($(58000));
      expect(result.stateTax).toBe($(3010.20));
    });

    it('should apply separate $35,000 exclusions for MFJ (both spouses age 62-64)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(120000)),
        stateSpecific: {
          taxpayerAge: 63,
          spouseAge: 64,
          retirementIncome: {
            pensionIncome: $(80000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $120,000 (includes $80k pension)
      // Retirement exclusion: min($80,000, $35,000 + $35,000) = $70,000
      // GA AGI: $120,000 - $70,000 = $50,000
      // Standard deduction: $24,000
      // Taxable: $50,000 - $24,000 = $26,000
      // Tax: $26,000 × 5.19% = $1,349.40
      expect(result.agiState).toBe($(50000));
      expect(result.taxableIncomeState).toBe($(26000));
      expect(result.stateTax).toBe($(1349.40));
    });
  });

  describe('Retirement Income Exclusion - Ages 65+', () => {
    it('should apply $65,000 exclusion for single filer age 65+', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          taxpayerAge: 70,
          retirementIncome: {
            pensionIncome: $(70000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $100,000 (includes $70k pension)
      // Retirement exclusion: min($70,000, $65,000) = $65,000
      // GA AGI: $100,000 - $65,000 = $35,000
      // Standard deduction: $12,000
      // Taxable: $35,000 - $12,000 = $23,000
      // Tax: $23,000 × 5.19% = $1,193.70
      expect(result.agiState).toBe($(35000));
      expect(result.taxableIncomeState).toBe($(23000));
      expect(result.stateTax).toBe($(1193.70));
    });

    it('should apply separate $65,000 exclusions for MFJ (both spouses age 65+)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(180000)),
        stateSpecific: {
          taxpayerAge: 68,
          spouseAge: 72,
          retirementIncome: {
            pensionIncome: $(140000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $180,000 (includes $140k pension)
      // Retirement exclusion: min($140,000, $65,000 + $65,000) = $130,000
      // GA AGI: $180,000 - $130,000 = $50,000
      // Standard deduction: $24,000
      // Taxable: $50,000 - $24,000 = $26,000
      // Tax: $26,000 × 5.19% = $1,349.40
      expect(result.agiState).toBe($(50000));
      expect(result.taxableIncomeState).toBe($(26000));
      expect(result.stateTax).toBe($(1349.40));
    });

    it('should apply mixed exclusions for MFJ (one spouse 62-64, one 65+)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(150000)),
        stateSpecific: {
          taxpayerAge: 63,
          spouseAge: 68,
          retirementIncome: {
            pensionIncome: $(110000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $150,000 (includes $110k pension)
      // Retirement exclusion: min($110,000, $35,000 + $65,000) = $100,000
      // GA AGI: $150,000 - $100,000 = $50,000
      // Standard deduction: $24,000
      // Taxable: $50,000 - $24,000 = $26,000
      // Tax: $26,000 × 5.19% = $1,349.40
      expect(result.agiState).toBe($(50000));
      expect(result.taxableIncomeState).toBe($(26000));
      expect(result.stateTax).toBe($(1349.40));
    });
  });

  describe('Social Security and Railroad Retirement Exemption', () => {
    it('should fully exempt Social Security benefits (no age requirement)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          taxpayerAge: 55, // Under 62, but Social Security is still fully exempt
          retirementIncome: {
            socialSecurityBenefits: $(20000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $60,000 (includes $20k Social Security)
      // Social Security exemption: $20,000 (100% exempt, no age limit)
      // GA AGI: $60,000 - $20,000 = $40,000
      // Standard deduction: $12,000
      // Taxable: $40,000 - $12,000 = $28,000
      // Tax: $28,000 × 5.19% = $1,453.20
      expect(result.agiState).toBe($(40000));
      expect(result.taxableIncomeState).toBe($(28000));
      expect(result.stateTax).toBe($(1453.20));
    });

    it('should fully exempt Railroad Retirement benefits', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(70000)),
        stateSpecific: {
          taxpayerAge: 58,
          retirementIncome: {
            railroadRetirement: $(25000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $70,000 (includes $25k Railroad Retirement)
      // Railroad Retirement exemption: $25,000 (100% exempt)
      // GA AGI: $70,000 - $25,000 = $45,000
      // Standard deduction: $12,000
      // Taxable: $45,000 - $12,000 = $33,000
      // Tax: $33,000 × 5.19% = $1,712.70
      expect(result.agiState).toBe($(45000));
      expect(result.taxableIncomeState).toBe($(33000));
      expect(result.stateTax).toBe($(1712.70));
    });

    it('should combine Social Security exemption with age-based retirement exclusion', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(150000)),
        stateSpecific: {
          taxpayerAge: 68,
          spouseAge: 70,
          retirementIncome: {
            socialSecurityBenefits: $(40000), // Fully exempt
            pensionIncome: $(80000), // Subject to $65k + $65k exclusion
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $150,000 (includes $40k SS + $80k pension)
      // Social Security exemption: $40,000 (100% exempt)
      // Remaining AGI after SS: $150,000 - $40,000 = $110,000
      // Retirement exclusion: min($80,000, $130,000) = $80,000
      // GA AGI: $110,000 - $80,000 = $30,000
      // Standard deduction: $24,000
      // Taxable: $30,000 - $24,000 = $6,000
      // Tax: $6,000 × 5.19% = $311.40
      expect(result.agiState).toBe($(30000));
      expect(result.taxableIncomeState).toBe($(6000));
      expect(result.stateTax).toBe($(311.40));
    });
  });

  describe('Multiple Income Types in Retirement Exclusion', () => {
    it('should include pension, interest, dividends, and capital gains in exclusion', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(80000)),
        stateSpecific: {
          taxpayerAge: 67,
          retirementIncome: {
            pensionIncome: $(30000),
            interestIncome: $(5000),
            dividendIncome: $(10000),
            capitalGains: $(15000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $80,000
      // Qualifying retirement income: $30k + $5k + $10k + $15k = $60,000
      // Retirement exclusion: min($60,000, $65,000) = $60,000
      // GA AGI: $80,000 - $60,000 = $20,000
      // Standard deduction: $12,000
      // Taxable: $20,000 - $12,000 = $8,000
      // Tax: $8,000 × 5.19% = $415.20
      expect(result.agiState).toBe($(20000));
      expect(result.taxableIncomeState).toBe($(8000));
      expect(result.stateTax).toBe($(415.20));
    });

    it('should limit earned income to first $5,000 in retirement exclusion', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(75000)),
        stateSpecific: {
          taxpayerAge: 65,
          retirementIncome: {
            pensionIncome: $(30000),
            earnedIncome: $(15000), // Only $5,000 qualifies for exclusion
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $75,000
      // Qualifying retirement income: $30,000 + min($15,000, $5,000) = $35,000
      // Retirement exclusion: min($35,000, $65,000) = $35,000
      // GA AGI: $75,000 - $35,000 = $40,000
      // Standard deduction: $12,000
      // Taxable: $40,000 - $12,000 = $28,000
      // Tax: $28,000 × 5.19% = $1,453.20
      expect(result.agiState).toBe($(40000));
      expect(result.taxableIncomeState).toBe($(28000));
      expect(result.stateTax).toBe($(1453.20));
    });
  });

  describe('Military Retirement Exclusion', () => {
    it('should apply $17,500 military retirement exclusion (under age 62)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(70000)),
        stateSpecific: {
          taxpayerAge: 55,
          isMilitaryRetiree: true,
          retirementIncome: {
            pensionIncome: $(25000), // Military pension
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $70,000 (includes $25k military pension)
      // Military retirement exclusion: min($25,000, $17,500) = $17,500
      // GA AGI: $70,000 - $17,500 = $52,500
      // Standard deduction: $12,000
      // Taxable: $52,500 - $12,000 = $40,500
      // Tax: $40,500 × 5.19% = $2,101.95
      expect(result.agiState).toBe($(52500));
      expect(result.taxableIncomeState).toBe($(40500));
      expect(result.stateTax).toBe($(2101.95));
    });

    it('should not apply military exclusion if age 62+ (use regular retirement exclusion instead)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(70000)),
        stateSpecific: {
          taxpayerAge: 63,
          isMilitaryRetiree: true,
          retirementIncome: {
            pensionIncome: $(25000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $70,000 (includes $25k pension)
      // Age 63, so use regular retirement exclusion (age 62-64: $35,000)
      // Retirement exclusion: min($25,000, $35,000) = $25,000
      // GA AGI: $70,000 - $25,000 = $45,000
      // Standard deduction: $12,000
      // Taxable: $45,000 - $12,000 = $33,000
      // Tax: $33,000 × 5.19% = $1,712.70
      expect(result.agiState).toBe($(45000));
      expect(result.taxableIncomeState).toBe($(33000));
      expect(result.stateTax).toBe($(1712.70));
    });
  });

  describe('Dependent Exemptions', () => {
    it('should apply $4,000 exemption per dependent', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 3,
        federalResult: createFederalResult($(80000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $80,000
      // Standard deduction: $24,000
      // Dependent exemptions: 3 × $4,000 = $12,000
      // Total deductions: $24,000 + $12,000 = $36,000
      // Taxable: $80,000 - $36,000 = $44,000
      // Tax: $44,000 × 5.19% = $2,283.60
      expect(result.agiState).toBe($(80000));
      expect(result.taxableIncomeState).toBe($(44000));
      expect(result.stateTax).toBe($(2283.60));
    });

    it('should handle zero dependents', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(80000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $80,000
      // Standard deduction: $24,000
      // Dependent exemptions: 0 × $4,000 = $0
      // Total deductions: $24,000
      // Taxable: $80,000 - $24,000 = $56,000
      // Tax: $56,000 × 5.19% = $2,906.40
      expect(result.agiState).toBe($(80000));
      expect(result.taxableIncomeState).toBe($(56000));
      expect(result.stateTax).toBe($(2906.40));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(0)),
      };

      const result = computeGA2025(input);

      expect(result.agiState).toBe($(0));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should handle income less than standard deduction', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(10000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $10,000
      // Standard deduction: $12,000
      // Taxable: max(0, $10,000 - $12,000) = $0
      // Tax: $0 × 5.19% = $0
      expect(result.agiState).toBe($(10000));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should handle head of household filing status', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'headOfHousehold',
        dependents: 1,
        federalResult: createFederalResult($(60000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $60,000
      // Standard deduction: $12,000 (same as single)
      // Dependent exemptions: 1 × $4,000 = $4,000
      // Total deductions: $12,000 + $4,000 = $16,000
      // Taxable: $60,000 - $16,000 = $44,000
      // Tax: $44,000 × 5.19% = $2,283.60
      expect(result.agiState).toBe($(60000));
      expect(result.taxableIncomeState).toBe($(44000));
      expect(result.stateTax).toBe($(2283.60));
    });

    it('should calculate withholding and refund/owe', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          stateWithheld: $(2500),
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Tax: $1,972.20 (from first test)
      // Withholding: $2,500
      // Refund: $2,500 - $1,972.20 = $527.80
      expect(result.stateTax).toBe($(1972.20));
      expect(result.stateWithheld).toBe($(2500));
      expect(result.stateRefundOrOwe).toBe($(527.80));
    });
  });

  describe('Combined Scenarios', () => {
    it('should handle retiree couple with all income types', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(150000)),
        stateSpecific: {
          taxpayerAge: 70,
          spouseAge: 68,
          retirementIncome: {
            socialSecurityBenefits: $(35000), // Fully exempt
            pensionIncome: $(60000),
            interestIncome: $(8000),
            dividendIncome: $(12000),
            capitalGains: $(20000),
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $150,000
      // Social Security exemption: $35,000 (100% exempt)
      // Remaining AGI: $150,000 - $35,000 = $115,000
      // Qualifying retirement income: $60k + $8k + $12k + $20k = $100,000
      // Retirement exclusion: min($100,000, $65,000 + $65,000) = $100,000
      // GA AGI: $115,000 - $100,000 = $15,000
      // Standard deduction: $24,000
      // Taxable: max(0, $15,000 - $24,000) = $0
      // Tax: $0
      expect(result.agiState).toBe($(15000));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should handle working family with high income and dependents', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'marriedJointly',
        dependents: 4,
        federalResult: createFederalResult($(200000)),
      };

      const result = computeGA2025(input);

      // GA AGI: $200,000 (no exclusions)
      // Standard deduction: $24,000
      // Dependent exemptions: 4 × $4,000 = $16,000
      // Total deductions: $24,000 + $16,000 = $40,000
      // Taxable: $200,000 - $40,000 = $160,000
      // Tax: $160,000 × 5.19% = $8,304.00
      expect(result.agiState).toBe($(200000));
      expect(result.taxableIncomeState).toBe($(160000));
      expect(result.stateTax).toBe($(8304.00));
    });

    it('should handle partial retirement exclusion (income exceeds limit)', () => {
      const input: StateTaxInput = {
        state: 'GA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(120000)),
        stateSpecific: {
          taxpayerAge: 70,
          retirementIncome: {
            pensionIncome: $(90000), // Exceeds $65,000 limit
          },
        } as GAStateSpecific,
      };

      const result = computeGA2025(input);

      // Federal AGI: $120,000 (includes $90k pension)
      // Retirement exclusion: min($90,000, $65,000) = $65,000
      // GA AGI: $120,000 - $65,000 = $55,000
      // Standard deduction: $12,000
      // Taxable: $55,000 - $12,000 = $43,000
      // Tax: $43,000 × 5.19% = $2,231.70
      expect(result.agiState).toBe($(55000));
      expect(result.taxableIncomeState).toBe($(43000));
      expect(result.stateTax).toBe($(2231.70));
    });
  });
});
