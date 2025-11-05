/**
 * Oregon State Tax Tests for 2025
 *
 * Tests Oregon's 4-bracket progressive system with:
 * - Federal tax deduction
 * - Personal exemption credit
 * - Standard deduction with elderly/blind additions
 * - Progressive rates: 4.75%, 6.75%, 8.75%, 9.90%
 */

import { describe, it, expect } from 'vitest';
import { computeOR2025 } from '../../../../../src/engine/states/OR/2025/computeOR2025';
import type { StateTaxInput, FederalResult } from '../../../../../src/engine/types';

// Helper to convert dollars to cents
const $ = (dollars: number): number => Math.round(dollars * 100);

// Helper to create a minimal federal result
function createFederalResult(agi: number, federalTax: number = 0): FederalResult {
  return {
    agi,
    taxableIncome: agi,
    regularTax: federalTax,
    totalFederalTax: federalTax,
    effectiveRate: 0,
    marginalRate: 0,
    credits: {
      nonRefundableCredits: 0,
      refundableCredits: 0,
    },
    taxBeforeCredits: federalTax,
    refundOrOwe: 0,
    federalWithheld: 0,
    estimatedPayments: 0,
  } as FederalResult;
}

describe('Oregon 2025 State Tax - Basic Tests', () => {
  describe('Progressive Tax Brackets - Single Filer', () => {
    it('should calculate tax in first bracket (4.75%)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(3000), $(300)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(300),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // OR AGI: $3,000
      // Federal tax deduction: $300
      // Standard deduction: $2,835
      // Taxable income: $3,000 - $300 - $2,835 = -$135 → $0
      // Tax: $0
      // Personal exemption credit: $256 (but no tax to credit against)
      expect(result.stateAGI).toBe($(3000));
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
    });

    it('should calculate tax in second bracket (6.75%)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(15000), $(1500)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(1500),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // OR AGI: $15,000
      // Federal tax deduction: $1,500
      // Standard deduction: $2,835
      // Taxable income: $15,000 - $1,500 - $2,835 = $10,665
      // Bracket 1: $4,400 × 4.75% = $209
      // Bracket 2: $6,265 × 6.75% = $423
      // Tax before credits: $632
      // Personal exemption credit: $256
      // Tax after credits: $632 - $256 = $376
      expect(result.stateAGI).toBe($(15000));
      expect(result.stateTaxableIncome).toBe($(10665));
      expect(result.stateTax).toBeGreaterThan($(300));
      expect(result.stateTax).toBeLessThan($(400));
    });

    it('should calculate tax in third bracket (8.75%)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000), $(5000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(5000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // OR AGI: $50,000
      // Federal tax deduction: $5,000
      // Standard deduction: $2,835
      // Taxable income: $50,000 - $5,000 - $2,835 = $42,165
      // Bracket 1: $4,400 × 4.75% = $209
      // Bracket 2: $6,650 × 6.75% = $449
      // Bracket 3: $31,115 × 8.75% = $2,723
      // Tax before credits: $3,381
      // Personal exemption credit: $256
      // Tax after credits: $3,125
      expect(result.stateAGI).toBe($(50000));
      expect(result.stateTaxableIncome).toBe($(42165));
      expect(result.stateTax).toBeGreaterThan($(3000));
      expect(result.stateTax).toBeLessThan($(3200));
    });

    it('should calculate tax in fourth bracket (9.90%)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000), $(25000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(25000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // OR AGI: $150,000
      // Federal tax deduction: $6,100 (capped)
      // Standard deduction: $2,835
      // Taxable income: $150,000 - $6,100 - $2,835 = $141,065
      // Bracket 1: $4,400 × 4.75% = $209
      // Bracket 2: $6,650 × 6.75% = $449
      // Bracket 3: $113,950 × 8.75% = $9,971
      // Bracket 4: $16,065 × 9.90% = $1,590
      // Tax before credits: $12,219
      // Personal exemption credit: $0 (AGI > $100k)
      // Tax after credits: $12,219
      expect(result.stateAGI).toBe($(150000));
      expect(result.stateTaxableIncome).toBe($(141065));
      expect(result.stateTax).toBeGreaterThan($(12000));
      expect(result.stateTax).toBeLessThan($(12500));
      expect(result.stateCredits?.personal_exemption).toBe(0); // Phased out
    });
  });

  describe('All Filing Statuses', () => {
    it('should calculate tax for single filer', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(40000), $(4000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(4000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      expect(result.stateTaxableIncome).toBe($(33165)); // $40k - $4k - $2,835
      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.stateCredits?.personal_exemption).toBe($(256));
    });

    it('should calculate tax for married filing jointly', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(80000), $(8000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(8000),
          numberOfExemptions: 2, // 2 filers
        }
      };

      const result = computeOR2025(input);

      // MFJ has higher brackets and standard deduction ($5,670)
      // Federal tax deduction: $8,000
      // Standard deduction: $5,670
      // Taxable income: $80,000 - $8,000 - $5,670 = $66,330
      expect(result.stateAGI).toBe($(80000));
      expect(result.stateTaxableIncome).toBe($(66330));
      expect(result.stateCredits?.personal_exemption).toBe($(512)); // $256 × 2
    });

    it('should calculate tax for head of household', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'headOfHousehold',
        stateDependents: 1,
        federalResult: createFederalResult($(60000), $(6000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(6000),
          numberOfExemptions: 2, // Filer + 1 dependent
        }
      };

      const result = computeOR2025(input);

      // HOH has different brackets and standard deduction ($4,560)
      // Federal tax deduction: $6,000
      // Standard deduction: $4,560
      // Taxable income: $60,000 - $6,000 - $4,560 = $49,440
      expect(result.stateAGI).toBe($(60000));
      expect(result.stateTaxableIncome).toBe($(49440));
      expect(result.stateCredits?.personal_exemption).toBe($(512)); // $256 × 2
    });

    it('should calculate tax for married filing separately', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedSeparately',
        federalResult: createFederalResult($(35000), $(3500)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(3500),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // MFS uses same brackets as single, same standard deduction
      // Federal tax deduction: $3,500
      // Standard deduction: $2,835
      // Taxable income: $35,000 - $3,500 - $2,835 = $28,665
      expect(result.stateAGI).toBe($(35000));
      expect(result.stateTaxableIncome).toBe($(28665));
      expect(result.stateCredits?.personal_exemption).toBe($(256));
    });
  });

  describe('Federal Tax Deduction', () => {
    it('should deduct federal tax paid up to the limit', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000), $(5000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(5000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // Federal tax deduction should be $5,000 (below $6,100 limit)
      expect(result.stateDeduction).toBe($(5000) + $(2835)); // Fed tax + standard deduction
    });

    it('should cap federal tax deduction at maximum ($6,100 single)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(200000), $(40000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(40000), // Way above limit
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // Federal tax deduction should be capped at $6,100
      expect(result.stateDeduction).toBe($(6100) + $(2835)); // Fed tax cap + standard deduction
    });

    it('should cap federal tax deduction at maximum ($12,200 MFJ)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(300000), $(60000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(60000), // Way above limit
          numberOfExemptions: 2,
        }
      };

      const result = computeOR2025(input);

      // Federal tax deduction should be capped at $12,200
      expect(result.stateDeduction).toBe($(12200) + $(5670)); // Fed tax cap + standard deduction
    });
  });

  describe('Personal Exemption Credit', () => {
    it('should apply personal exemption credit below income limit', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000), $(5000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(5000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // AGI $50k < $100k limit, should get $256 credit
      expect(result.stateCredits?.personal_exemption).toBe($(256));
    });

    it('should phase out personal exemption credit above income limit (single)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(150000), $(25000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(25000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // AGI $150k > $100k limit, no credit
      expect(result.stateCredits?.personal_exemption).toBe(0);
    });

    it('should apply personal exemption credit for multiple exemptions', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(100000), $(10000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(10000),
          numberOfExemptions: 4, // 2 filers + 2 dependents
        }
      };

      const result = computeOR2025(input);

      // AGI $100k < $200k limit for MFJ, should get $256 × 4 = $1,024
      expect(result.stateCredits?.personal_exemption).toBe($(1024));
    });
  });

  describe('Elderly and Blind Additional Deduction', () => {
    it('should apply additional standard deduction for elderly (single)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000), $(3000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(3000),
          numberOfExemptions: 1,
          age65OrOlder: 1, // Taxpayer is 65+
        }
      };

      const result = computeOR2025(input);

      // Standard deduction: $2,835 + $1,200 (elderly) = $4,035
      // Taxable income: $30,000 - $3,000 - $4,035 = $22,965
      expect(result.stateDeduction).toBe($(3000) + $(4035)); // Fed tax + enhanced standard deduction
      expect(result.stateTaxableIncome).toBe($(22965));
    });

    it('should apply additional standard deduction for blind (single)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000), $(3000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(3000),
          numberOfExemptions: 1,
          isBlind: 1, // Taxpayer is blind
        }
      };

      const result = computeOR2025(input);

      // Standard deduction: $2,835 + $1,200 (blind) = $4,035
      expect(result.stateDeduction).toBe($(3000) + $(4035));
      expect(result.stateTaxableIncome).toBe($(22965));
    });

    it('should apply additional standard deduction for elderly and blind (single)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000), $(3000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(3000),
          numberOfExemptions: 1,
          age65OrOlder: 1, // Taxpayer is 65+
          isBlind: 1,      // AND blind
        }
      };

      const result = computeOR2025(input);

      // Standard deduction: $2,835 + $1,200 (elderly) + $1,200 (blind) = $5,235
      expect(result.stateDeduction).toBe($(3000) + $(5235));
      expect(result.stateTaxableIncome).toBe($(21765));
    });

    it('should apply additional standard deduction for both spouses elderly (MFJ)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(60000), $(6000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(6000),
          numberOfExemptions: 2,
          age65OrOlder: 2, // Both spouses are 65+
        }
      };

      const result = computeOR2025(input);

      // Standard deduction: $5,670 + $1,000 (spouse 1) + $1,000 (spouse 2) = $7,670
      expect(result.stateDeduction).toBe($(6000) + $(7670));
      expect(result.stateTaxableIncome).toBe($(46330));
    });
  });

  describe('Withholding and Refunds', () => {
    it('should calculate refund when withholding exceeds tax', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(30000), $(3000)),
        stateWithheld: $(2000),
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(3000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // Tax should be around $1,800-$2,000
      // Withholding: $2,000
      // Should get refund
      expect(result.stateWithheld).toBe($(2000));
      expect(result.stateRefundOrOwe).toBeGreaterThan(0); // Positive = refund
    });

    it('should calculate amount owed when tax exceeds withholding', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(50000), $(5000)),
        stateWithheld: $(2000),
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(5000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // Tax should be around $3,125
      // Withholding: $2,000
      // Should owe money
      expect(result.stateWithheld).toBe($(2000));
      expect(result.stateRefundOrOwe).toBeLessThan(0); // Negative = owe
    });

    it('should handle estimated tax payments', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(40000), $(4000)),
        stateWithheld: $(1000),
        stateEstPayments: $(1500),
        stateSpecific: {
          federalTaxPaid: $(4000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      expect(result.stateEstPayments).toBe($(1500));
      // Total payments = $1,000 + $1,500 = $2,500
      const totalPayments = result.stateWithheld + result.stateEstPayments;
      expect(totalPayments).toBe($(2500));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult(0, 0),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: 0,
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      expect(result.stateAGI).toBe(0);
      expect(result.stateTaxableIncome).toBe(0);
      expect(result.stateTax).toBe(0);
      expect(result.stateRefundOrOwe).toBe(0);
    });

    it('should handle very high income (millionaire)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'single',
        federalResult: createFederalResult($(1000000), $(300000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(300000),
          numberOfExemptions: 1,
        }
      };

      const result = computeOR2025(input);

      // Federal tax deduction capped at $6,100
      // Standard deduction: $2,835
      // Taxable: $1,000,000 - $6,100 - $2,835 = $991,065
      // Tax at high bracket: ~$96,369
      expect(result.stateAGI).toBe($(1000000));
      expect(result.stateTaxableIncome).toBe($(991065));
      expect(result.stateTax).toBeGreaterThan($(96000));
      expect(result.stateTax).toBeLessThan($(97000));
      expect(result.stateCredits?.personal_exemption).toBe(0); // Phased out
    });

    it('should handle MFJ at exactly $250,000 (top bracket threshold)', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(250000), $(50000)),
        stateWithheld: 0,
        stateEstPayments: 0,
        stateSpecific: {
          federalTaxPaid: $(50000),
          numberOfExemptions: 2,
        }
      };

      const result = computeOR2025(input);

      // Federal tax deduction: $12,200 (capped)
      // Standard deduction: $5,670
      // Taxable: $250,000 - $12,200 - $5,670 = $232,130
      // This should be at the boundary of the third bracket
      expect(result.stateAGI).toBe($(250000));
      expect(result.stateTaxableIncome).toBe($(232130));
      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.stateCredits?.personal_exemption).toBe(0); // Phased out (AGI > $200k)
    });
  });

  describe('Combined Features', () => {
    it('should apply all features together: federal tax deduction, standard deduction, elderly, exemption credits', () => {
      const input: StateTaxInput = {
        state: 'OR',
        filingStatus: 'marriedJointly',
        federalResult: createFederalResult($(100000), $(12000)),
        stateWithheld: $(5000),
        stateEstPayments: $(1000),
        stateSpecific: {
          federalTaxPaid: $(12000),
          numberOfExemptions: 3, // 2 filers + 1 dependent
          age65OrOlder: 2,       // Both spouses 65+
        }
      };

      const result = computeOR2025(input);

      // Should have:
      // - Federal tax deduction: $12,000 (below $12,200 limit)
      // - Standard deduction: $5,670 + $1,000 + $1,000 = $7,670
      // - Personal exemption credit: $256 × 3 = $768
      expect(result.stateDeduction).toBe($(12000) + $(7670));
      expect(result.stateCredits?.personal_exemption).toBe($(768));
      expect(result.stateTax).toBeGreaterThan(0);
    });
  });
});
