/**
 * Basic Golden Tests for Arizona State Tax 2025
 *
 * Tests cover:
 * - Flat 2.5% tax rate
 * - Standard deduction ($15,750 single / $31,500 MFJ)
 * - Age 65+ additional deduction ($6,000 with income limits)
 * - Dependent exemptions ($1,000/$500/$300 based on AGI)
 * - Charitable contribution deduction increase (33%)
 * - All filing statuses
 */

import { describe, it, expect } from 'vitest';
import { computeAZ2025 } from '../../../../../src/engine/states/AZ/2025/computeAZ2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

/**
 * Helper to create a minimal FederalResult2025 for testing
 */
function createFederalResult(agi: number): FederalResult2025 {
  return {
    agi,
    taxableIncome: agi,
    standardDeduction: 0,
    taxBeforeCredits: 0,
    credits: {},
    totalTax: 0,
    totalPayments: 0,
    refundOrOwe: 0,
    diagnostics: {
      warnings: [],
      errors: []
    }
  };
}

/**
 * Dollar amount helper for readability
 */
const $ = (amount: number): number => Math.round(amount * 100);

describe('Arizona 2025 State Tax - Basic Tests', () => {
  describe('Basic Tax Calculation - Flat Rate', () => {
    it('should calculate tax for single filer with moderate income', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $50,000
      // Standard deduction: $15,750
      // Taxable income: $50,000 - $15,750 = $34,250
      // Tax: $34,250 × 2.5% = $856.25
      expect(result.stateAGI).toBe($(50000));
      expect(result.stateDeduction).toBe($(15750));
      expect(result.stateTaxableIncome).toBe($(34250));
      expect(result.stateTax).toBe($(856.25));
    });

    it('should calculate tax for high earner', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $150,000
      // Standard deduction: $15,750
      // Taxable income: $150,000 - $15,750 = $134,250
      // Tax: $134,250 × 2.5% = $3,356.25
      expect(result.stateTaxableIncome).toBe($(134250));
      expect(result.stateTax).toBe($(3356.25));
    });

    it('should calculate no tax when income is below standard deduction', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(12000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $12,000
      // Standard deduction: $15,750
      // Taxable income: $0 (cannot be negative)
      // Tax: $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });
  });

  describe('Age 65+ Additional Deduction', () => {
    it('should apply $6,000 additional deduction for age 65+ under income limit', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          age: 67 // Age 65+
        }
      };

      const result = computeAZ2025(input);

      // AGI: $60,000 (below $75k limit)
      // Standard deduction: $15,750 + $6,000 = $21,750
      // Taxable income: $60,000 - $21,750 = $38,250
      // Tax: $38,250 × 2.5% = $956.25
      expect(result.stateDeduction).toBe($(21750));
      expect(result.stateTaxableIncome).toBe($(38250));
      expect(result.stateTax).toBe($(956.25));
    });

    it('should NOT apply age 65+ deduction when income exceeds limit', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(80000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          age: 67 // Age 65+
        }
      };

      const result = computeAZ2025(input);

      // AGI: $80,000 (exceeds $75k limit)
      // Standard deduction: $15,750 (no age 65+ bonus)
      // Taxable income: $80,000 - $15,750 = $64,250
      // Tax: $64,250 × 2.5% = $1,606.25
      expect(result.stateDeduction).toBe($(15750));
      expect(result.stateTaxableIncome).toBe($(64250));
      expect(result.stateTax).toBe($(1606.25));
    });

    it('should apply $12,000 additional deduction for MFJ both age 65+', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(120000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          age: 68,
          spouseAge: 66
        }
      };

      const result = computeAZ2025(input);

      // AGI: $120,000 (below $150k limit)
      // Standard deduction: $31,500 + $12,000 = $43,500
      // Taxable income: $120,000 - $43,500 = $76,500
      // Tax: $76,500 × 2.5% = $1,912.50
      expect(result.stateDeduction).toBe($(43500));
      expect(result.stateTaxableIncome).toBe($(76500));
      expect(result.stateTax).toBe($(1912.50));
    });
  });

  describe('Dependent Exemptions', () => {
    it('should apply $1,000 per dependent for AGI ≤ $50,000', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        stateDependents: 2,
        federalResult: createFederalResult($(40000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $40,000 (≤ $50,000)
      // Standard deduction: $15,750
      // Dependent exemptions: 2 × $1,000 = $2,000
      // Total deductions: $15,750 + $2,000 = $17,750
      // Taxable income: $40,000 - $17,750 = $22,250
      // Tax: $22,250 × 2.5% = $556.25
      expect(result.stateExemptions).toBe($(2000));
      expect(result.stateTaxableIncome).toBe($(22250));
      expect(result.stateTax).toBe($(556.25));
    });

    it('should apply $500 per dependent for $50,000 < AGI ≤ $100,000', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        stateDependents: 2,
        federalResult: createFederalResult($(75000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $75,000 ($50k < AGI ≤ $100k)
      // Standard deduction: $15,750
      // Dependent exemptions: 2 × $500 = $1,000
      // Total deductions: $15,750 + $1,000 = $16,750
      // Taxable income: $75,000 - $16,750 = $58,250
      // Tax: $58,250 × 2.5% = $1,456.25
      expect(result.stateExemptions).toBe($(1000));
      expect(result.stateTaxableIncome).toBe($(58250));
      expect(result.stateTax).toBe($(1456.25));
    });

    it('should apply $300 per dependent for AGI > $100,000', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        stateDependents: 2,
        federalResult: createFederalResult($(150000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $150,000 (> $100,000)
      // Standard deduction: $15,750
      // Dependent exemptions: 2 × $300 = $600
      // Total deductions: $15,750 + $600 = $16,350
      // Taxable income: $150,000 - $16,350 = $133,650
      // Tax: $133,650 × 2.5% = $3,341.25
      expect(result.stateExemptions).toBe($(600));
      expect(result.stateTaxableIncome).toBe($(133650));
      expect(result.stateTax).toBe($(3341.25));
    });
  });

  describe('Charitable Contribution Deduction Increase', () => {
    it('should add 33% of charitable contributions to standard deduction', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          charitableContributions: $(6000) // $6,000 in contributions
        }
      };

      const result = computeAZ2025(input);

      // AGI: $60,000
      // Standard deduction: $15,750
      // Charitable increase: $6,000 × 33% = $1,980
      // Total deduction: $15,750 + $1,980 = $17,730
      // Taxable income: $60,000 - $17,730 = $42,270
      // Tax: $42,270 × 2.5% = $1,056.75
      expect(result.stateDeduction).toBe($(17730));
      expect(result.stateTaxableIncome).toBe($(42270));
      expect(result.stateTax).toBe($(1056.75));
    });
  });

  describe('Combined Features', () => {
    it('should apply all features together: age 65+, dependents, and charitable', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'marriedJointly',
        stateDependents: 1,
        federalResult: createFederalResult($(100000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          age: 70,
          spouseAge: 68,
          charitableContributions: $(3000)
        }
      };

      const result = computeAZ2025(input);

      // AGI: $100,000 (below $150k limit)
      // Standard deduction: $31,500
      // Age 65+ additional: $12,000 (both age 65+)
      // Charitable increase: $3,000 × 33% = $990
      // Total SD: $31,500 + $12,000 + $990 = $44,490
      // Dependent exemption: 1 × $500 = $500 (AGI = $100k)
      // Total deductions: $44,490 + $500 = $44,990
      // Taxable income: $100,000 - $44,990 = $55,010
      // Tax: $55,010 × 2.5% = $1,375.25
      expect(result.stateDeduction).toBe($(44490));
      expect(result.stateExemptions).toBe($(500));
      expect(result.stateTaxableIncome).toBe($(55010));
      expect(result.stateTax).toBe($(1375.25));
    });
  });

  describe('All Filing Statuses', () => {
    it('should calculate tax for single filer', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(60000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // Taxable: $60,000 - $15,750 = $44,250
      // Tax: $44,250 × 2.5% = $1,106.25
      expect(result.stateTax).toBe($(1106.25));
    });

    it('should calculate tax for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(100000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // Taxable: $100,000 - $31,500 = $68,500
      // Tax: $68,500 × 2.5% = $1,712.50
      expect(result.stateTax).toBe($(1712.50));
    });

    it('should calculate tax for head of household', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(75000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $75,000
      // Standard deduction: $23,700 (HOH)
      // Dependent exemption: $500 (AGI $75k)
      // Total deductions: $23,700 + $500 = $24,200
      // Taxable: $75,000 - $24,200 = $50,800
      // Tax: $50,800 × 2.5% = $1,270.00
      expect(result.stateTax).toBe($(1270.00));
    });

    it('should calculate tax for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(50000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // Taxable: $50,000 - $15,750 = $34,250
      // Tax: $34,250 × 2.5% = $856.25
      expect(result.stateTax).toBe($(856.25));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000)),
        stateWithheld: $(1000),
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // Tax: $856.25 (calculated earlier)
      // Withholding: $1,000
      // Refund: $1,000 - $856.25 = $143.75
      expect(result.stateTax).toBe($(856.25));
      expect(result.stateRefundOrOwe).toBe($(143.75));
    });

    it('should calculate amount owed when withholding is less than tax', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000)),
        stateWithheld: $(3000),
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // Tax: $3,356.25 (calculated earlier)
      // Withholding: $3,000
      // Owe: $3,000 - $3,356.25 = -$356.25
      expect(result.stateTax).toBe($(3356.25));
      expect(result.stateRefundOrOwe).toBe($(-356.25));
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(80000)),
        stateWithheld: $(1500),
        stateEstPayments: $(500)
      };

      const result = computeAZ2025(input);

      // Taxable: $80,000 - $15,750 = $64,250
      // Tax: $64,250 × 2.5% = $1,606.25
      // Total payments: $1,500 + $500 = $2,000
      // Refund: $2,000 - $1,606.25 = $393.75
      expect(result.stateTax).toBe($(1606.25));
      expect(result.stateWithheld).toBe($(1500));
      expect(result.stateEstPayments).toBe($(500));
      expect(result.stateRefundOrOwe).toBe($(393.75));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult(0),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      expect(result.stateTax).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
    });

    it('should handle income exactly at standard deduction', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(15750)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $15,750
      // Standard deduction: $15,750
      // Taxable income: $0
      // Tax: $0
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should handle very high income (millionaire)', () => {
      const input: StateTaxInput = {
        state: 'AZ',
        filingStatus: 'single',
        federalResult: createFederalResult($(1000000)),
        stateWithheld: 0,
        stateEstPayments: 0
      };

      const result = computeAZ2025(input);

      // AGI: $1,000,000
      // Standard deduction: $15,750
      // Taxable income: $984,250
      // Tax: $984,250 × 2.5% = $24,606.25
      expect(result.stateTaxableIncome).toBe($(984250));
      expect(result.stateTax).toBe($(24606.25));
    });
  });
});
