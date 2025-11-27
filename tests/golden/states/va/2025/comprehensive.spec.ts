import { describe, it, expect } from 'vitest';
import { computeVA2025 } from '../../../../../src/engine/states/VA/2025/computeVA2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';
import type { VAStateSpecific } from '../../../../../src/engine/rules/2025/states/va';

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

describe('Virginia State Tax 2025 - Comprehensive Tests', () => {
  describe('Basic Tax Calculation with Progressive Brackets', () => {
    it('should calculate tax for single filer in first bracket (2%)', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(15000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $15,000
      // Standard deduction: $8,750
      // Personal exemptions: 1 × $930 = $930
      // Total deductions: $8,750 + $930 = $9,680
      // Taxable: $15,000 - $9,680 = $5,320
      // Tax calculation:
      //   First $3,000 @ 2% = $60.00
      //   Next $2,000 @ 3% = $60.00
      //   Next $320 @ 5% = $16.00
      //   Total tax = $136.00
      expect(result.agiState).toBe($(15000));
      expect(result.taxableIncomeState).toBe($(5320));
      expect(result.stateTax).toBe($(136.00));
    });

    it('should calculate tax for married filing jointly in multiple brackets', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(80000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $80,000
      // Standard deduction: $17,500
      // Personal exemptions: 4 × $930 = $3,720 (2 adults + 2 dependents)
      // Total deductions: $17,500 + $3,720 = $21,220
      // Taxable: $80,000 - $21,220 = $58,780
      // Tax calculation:
      //   First $3,000 @ 2% = $60.00
      //   Next $2,000 @ 3% = $60.00
      //   Next $12,000 @ 5% = $600.00
      //   Remaining $41,780 @ 5.75% = $2,402.35
      //   Total tax = $3,122.35
      expect(result.agiState).toBe($(80000));
      expect(result.taxableIncomeState).toBe($(58780));
      expect(result.stateTax).toBe($(3122.35));
    });

    it('should calculate tax for high earner in top bracket', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(200000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $200,000
      // Standard deduction: $8,750
      // Personal exemptions: 1 × $930 = $930
      // Total deductions: $8,750 + $930 = $9,680
      // Taxable: $200,000 - $9,680 = $190,320
      // Tax calculation:
      //   First $3,000 @ 2% = $60.00
      //   Next $2,000 @ 3% = $60.00
      //   Next $12,000 @ 5% = $600.00
      //   Remaining $173,320 @ 5.75% = $9,965.90
      //   Total tax = $10,685.90
      expect(result.agiState).toBe($(200000));
      expect(result.taxableIncomeState).toBe($(190320));
      expect(result.stateTax).toBe($(10685.90));
    });
  });

  describe('Standard Deduction vs Itemized Deductions', () => {
    it('should use standard deduction when not itemizing on federal', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          itemizedOnFederal: false,
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Should use standard deduction of $8,750
      // VA AGI: $50,000
      // Standard deduction: $8,750
      // Personal exemptions: $930
      // Total deductions: $9,680
      // Taxable: $50,000 - $9,680 = $40,320
      expect(result.taxableIncomeState).toBe($(40320));
    });

    it('should NOT use standard deduction when itemized on federal', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(50000)),
        stateSpecific: {
          itemizedOnFederal: true, // Cannot use standard deduction
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Cannot use standard deduction
      // VA AGI: $50,000
      // Standard deduction: $0 (itemized on federal)
      // Personal exemptions: $930
      // Total deductions: $930
      // Taxable: $50,000 - $930 = $49,070
      expect(result.taxableIncomeState).toBe($(49070));
    });
  });

  describe('Age Exemption ($800 per person age 65+)', () => {
    it('should apply $800 age exemption for single filer age 65+', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(40000)),
        stateSpecific: {
          taxpayerAge: 67,
          taxpayerBirthYear: 1958, // Not eligible for alternative deduction (born after 1939 but we need to specify)
          useAlternativeAgeDeduction: false, // Explicitly use $800 exemption
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // VA AGI: $40,000
      // Standard deduction: $8,750
      // Personal exemptions: $930
      // Age exemption: $800 (age 67)
      // Total deductions: $8,750 + $930 + $800 = $10,480
      // Taxable: $40,000 - $10,480 = $29,520
      expect(result.taxableIncomeState).toBe($(29520));
    });

    it('should apply $800 age exemption for both spouses age 65+ (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(80000)),
        stateSpecific: {
          taxpayerAge: 68,
          spouseAge: 70,
          taxpayerBirthYear: 1957,
          spouseBirthYear: 1955,
          useAlternativeAgeDeduction: false,
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // VA AGI: $80,000
      // Standard deduction: $17,500
      // Personal exemptions: 2 × $930 = $1,860
      // Age exemptions: 2 × $800 = $1,600 (both age 65+)
      // Total deductions: $17,500 + $1,860 + $1,600 = $20,960
      // Taxable: $80,000 - $20,960 = $59,040
      expect(result.taxableIncomeState).toBe($(59040));
    });

    it('should apply blind exemption ($800)', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(40000)),
        stateSpecific: {
          taxpayerAge: 55, // Under 65
          taxpayerBlind: true, // Qualifies for $800 exemption
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // VA AGI: $40,000
      // Standard deduction: $8,750
      // Personal exemptions: $930
      // Blind exemption: $800
      // Total deductions: $8,750 + $930 + $800 = $10,480
      // Taxable: $40,000 - $10,480 = $29,520
      expect(result.taxableIncomeState).toBe($(29520));
    });
  });

  describe('Alternative Age Deduction ($12,000)', () => {
    it('should apply $12,000 alternative age deduction for qualifying taxpayer', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          taxpayerAge: 70,
          taxpayerBirthYear: 1955, // Born after 1939, qualifies for $12,000
          useAlternativeAgeDeduction: true,
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // VA AGI: $60,000
      // Standard deduction: $8,750
      // Personal exemptions: $930
      // Alternative age deduction: $12,000 (instead of $800)
      // Total deductions: $8,750 + $930 + $12,000 = $21,680
      // Taxable: $60,000 - $21,680 = $38,320
      expect(result.taxableIncomeState).toBe($(38320));
    });

    it('should automatically choose $12,000 over $800 when beneficial', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          taxpayerAge: 70,
          taxpayerBirthYear: 1955, // Qualifies for both options
          // useAlternativeAgeDeduction not specified - should auto-select better option
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Should automatically choose $12,000 (better than $800)
      // Total deductions: $8,750 + $930 + $12,000 = $21,680
      // Taxable: $60,000 - $21,680 = $38,320
      expect(result.taxableIncomeState).toBe($(38320));
    });

    it('should not allow alternative deduction if born before 1939 cutoff', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(60000)),
        stateSpecific: {
          taxpayerAge: 90,
          taxpayerBirthYear: 1935, // Born BEFORE 1939 - does not qualify
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Only gets $800 age exemption (not eligible for $12,000)
      // Total deductions: $8,750 + $930 + $800 = $10,480
      // Taxable: $60,000 - $10,480 = $49,520
      expect(result.taxableIncomeState).toBe($(49520));
    });

    it('should apply $12,000 if either spouse qualifies (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'marriedJointly',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          taxpayerAge: 68,
          spouseAge: 90,
          taxpayerBirthYear: 1957, // Qualifies for $12,000
          spouseBirthYear: 1935, // Does NOT qualify (born before 1939)
          useAlternativeAgeDeduction: true,
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Taxpayer qualifies, so alternative deduction applies
      // VA AGI: $100,000
      // Standard deduction: $17,500
      // Personal exemptions: 2 × $930 = $1,860
      // Alternative age deduction: $12,000 (taxpayer qualifies)
      // Total deductions: $17,500 + $1,860 + $12,000 = $31,360
      // Taxable: $100,000 - $31,360 = $68,640
      expect(result.taxableIncomeState).toBe($(68640));
    });
  });

  describe('Personal and Dependent Exemptions', () => {
    it('should apply $930 exemption for each person (single + dependents)', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 3,
        federalResult: createFederalResult($(70000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $70,000
      // Standard deduction: $8,750
      // Personal exemptions: 4 × $930 = $3,720 (1 taxpayer + 3 dependents)
      // Total deductions: $8,750 + $3,720 = $12,470
      // Taxable: $70,000 - $12,470 = $57,530
      expect(result.taxableIncomeState).toBe($(57530));
    });

    it('should apply $930 exemption for married couple + dependents', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'marriedJointly',
        dependents: 4,
        federalResult: createFederalResult($(120000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $120,000
      // Standard deduction: $17,500
      // Personal exemptions: 6 × $930 = $5,580 (2 adults + 4 dependents)
      // Total deductions: $17,500 + $5,580 = $23,080
      // Taxable: $120,000 - $23,080 = $96,920
      expect(result.taxableIncomeState).toBe($(96920));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(0)),
      };

      const result = computeVA2025(input);

      expect(result.agiState).toBe($(0));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should handle income less than deductions', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(5000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $5,000
      // Standard deduction: $8,750
      // Personal exemptions: $930
      // Total deductions: $9,680 (exceeds AGI)
      // Taxable: max(0, $5,000 - $9,680) = $0
      expect(result.agiState).toBe($(5000));
      expect(result.taxableIncomeState).toBe($(0));
      expect(result.stateTax).toBe($(0));
    });

    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(30000)),
        stateSpecific: {
          stateWithheld: $(2000),
          stateEstPayments: $(500),
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Calculate expected tax
      // VA AGI: $30,000
      // Deductions: $8,750 + $930 = $9,680
      // Taxable: $30,000 - $9,680 = $20,320
      // Tax: $60 + $60 + $600 + $190.90 = $910.90
      // Total payments: $2,000 + $500 = $2,500
      // Refund: $2,500 - $910.90 = $1,589.10
      expect(result.stateTax).toBe($(910.90));
      expect(result.stateWithheld).toBe($(2000));
      expect(result.stateRefundOrOwe).toBe($(1589.10));
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(100000)),
        stateSpecific: {
          stateWithheld: $(3000),
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Tax will be significantly higher than $3,000
      // Refund/owe should be negative (amount owed)
      expect(result.stateTax).toBeGreaterThan($(3000));
      expect(result.stateRefundOrOwe).toBeLessThan($(0));
    });

    it('should handle head of household filing status', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'headOfHousehold',
        dependents: 1,
        federalResult: createFederalResult($(50000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $50,000
      // Standard deduction: $8,750 (same as single)
      // Personal exemptions: 2 × $930 = $1,860 (taxpayer + 1 dependent)
      // Total deductions: $8,750 + $1,860 = $10,610
      // Taxable: $50,000 - $10,610 = $39,390
      expect(result.taxableIncomeState).toBe($(39390));
    });
  });

  describe('Combined Scenarios', () => {
    it('should handle elderly couple with dependents and itemized deductions', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'marriedJointly',
        dependents: 2,
        federalResult: createFederalResult($(90000)),
        stateSpecific: {
          itemizedOnFederal: true, // Cannot use standard deduction
          taxpayerAge: 68,
          spouseAge: 70,
          taxpayerBirthYear: 1957,
          spouseBirthYear: 1955,
          useAlternativeAgeDeduction: true, // Use $12,000 instead of 2 × $800
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // VA AGI: $90,000
      // Standard deduction: $0 (itemized on federal)
      // Personal exemptions: 4 × $930 = $3,720 (2 adults + 2 dependents)
      // Alternative age deduction: $12,000
      // Total deductions: $0 + $3,720 + $12,000 = $15,720
      // Taxable: $90,000 - $15,720 = $74,280
      expect(result.taxableIncomeState).toBe($(74280));
    });

    it('should handle young family with multiple dependents', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'marriedJointly',
        dependents: 5,
        federalResult: createFederalResult($(150000)),
      };

      const result = computeVA2025(input);

      // VA AGI: $150,000
      // Standard deduction: $17,500
      // Personal exemptions: 7 × $930 = $6,510 (2 adults + 5 dependents)
      // Total deductions: $17,500 + $6,510 = $24,010
      // Taxable: $150,000 - $24,010 = $125,990
      // Tax: $60 + $60 + $600 + $6,266.93 = $6,986.93
      expect(result.agiState).toBe($(150000));
      expect(result.taxableIncomeState).toBe($(125990));
      expect(result.stateTax).toBe($(6986.93));
    });

    it('should handle blind elderly taxpayer choosing between exemption options', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(45000)),
        stateSpecific: {
          taxpayerAge: 72,
          taxpayerBirthYear: 1953,
          taxpayerBlind: true,
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // Should automatically choose better option:
      // Option 1: Age + blind = $800 + $800 = $1,600
      // Option 2: Alternative age = $12,000
      // Should choose $12,000
      // Total deductions: $8,750 + $930 + $12,000 = $21,680
      // Taxable: $45,000 - $21,680 = $23,320
      expect(result.taxableIncomeState).toBe($(23320));
    });
  });

  describe('Bracket Boundary Tests', () => {
    it('should correctly calculate tax at exact bracket boundaries', () => {
      const input: StateTaxInput = {
        state: 'VA',
        filingStatus: 'single',
        dependents: 0,
        federalResult: createFederalResult($(20000)),
        stateSpecific: {
          itemizedOnFederal: true, // Simplify - no standard deduction
        } as VAStateSpecific,
      };

      const result = computeVA2025(input);

      // VA AGI: $20,000
      // Personal exemptions: $930
      // Taxable: $20,000 - $930 = $19,070
      // Tax calculation:
      //   $0-$3,000 @ 2% = $60.00
      //   $3,001-$5,000 @ 3% = $60.00
      //   $5,001-$17,000 @ 5% = $600.00
      //   $17,001-$19,070 @ 5.75% = $119.03
      //   Total = $839.03
      expect(result.taxableIncomeState).toBe($(19070));
      expect(result.stateTax).toBe($(839.03));
    });
  });
});
