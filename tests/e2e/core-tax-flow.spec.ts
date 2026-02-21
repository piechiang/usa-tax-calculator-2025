/**
 * E2E Tests: Core Tax Calculation Flow
 *
 * These tests simulate complete user scenarios from input to results,
 * ensuring the entire tax calculation pipeline works correctly.
 */

import { describe, it, expect } from 'vitest';
import {
  computeFederal2025,
  dollarsToCents,
  getStateCalculator,
  getSupportedStates,
} from '../../src/engine';
import type { FederalInput2025, FilingStatus } from '../../src/engine';

const $ = (dollars: number) => dollarsToCents(dollars);

/**
 * Helper to create a minimal valid federal input
 */
function createBasicInput(overrides: Partial<FederalInput2025> = {}): FederalInput2025 {
  const base: FederalInput2025 = {
    filingStatus: 'single',
    primary: {},
    dependents: 0,
    qualifyingChildren: [],
    qualifyingRelatives: [],
    educationExpenses: [],
    income: {
      wages: 0,
      interest: 0,
      dividends: { ordinary: 0, qualified: 0 },
      capGainsNet: 0,
      capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
      scheduleCNet: 0,
      k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
      other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
    },
    adjustments: {
      businessExpenses: 0,
      hsaDeduction: 0,
      seTaxDeduction: 0,
      iraDeduction: 0,
      studentLoanInterest: 0,
    },
    itemized: {
      stateLocalTaxes: 0,
      mortgageInterest: 0,
      charitable: 0,
      medical: 0,
      other: 0,
    },
    payments: {
      federalWithheld: 0,
      estPayments: 0,
      eitcAdvance: 0,
    },
  };

  // Deep merge overrides
  return {
    ...base,
    ...overrides,
    income: { ...base.income, ...(overrides.income || {}) },
    adjustments: { ...base.adjustments, ...(overrides.adjustments || {}) },
    itemized: { ...base.itemized, ...(overrides.itemized || {}) },
    payments: { ...base.payments, ...(overrides.payments || {}) },
  };
}

describe('E2E: Core Tax Calculation Flow', () => {
  describe('Scenario 1: Single W-2 Employee', () => {
    it('should calculate correct tax for single filer with $60,000 wages', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(60000),
          interest: $(200),
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        payments: {
          federalWithheld: $(8000),
          estPayments: 0,
          eitcAdvance: 0,
        },
      });

      const result = computeFederal2025(input);

      // Verify the calculation flow
      expect(result.agi).toBe($(60200)); // wages + interest
      expect(result.standardDeduction).toBeGreaterThan(0); // Should have standard deduction
      expect(result.taxableIncome).toBeLessThan(result.agi); // AGI minus deduction
      expect(result.taxBeforeCredits).toBeGreaterThan(0);
    });

    it('should handle zero income correctly', () => {
      const input = createBasicInput({
        filingStatus: 'single',
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.taxBeforeCredits).toBe(0);
    });
  });

  describe('Scenario 2: Married Filing Jointly', () => {
    it('should calculate correct tax for MFJ with dual income', () => {
      const input = createBasicInput({
        filingStatus: 'marriedJointly',
        income: {
          wages: $(120000), // Combined wages
          interest: $(1500),
          dividends: { ordinary: $(500), qualified: $(1000) },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        payments: {
          federalWithheld: $(15000),
          estPayments: 0,
          eitcAdvance: 0,
        },
      });

      const result = computeFederal2025(input);

      // MFJ should have higher standard deduction
      expect(result.standardDeduction).toBe($(30000)); // 2025 MFJ standard deduction
      expect(result.agi).toBe($(123000)); // Total income
      expect(result.taxableIncome).toBe($(93000)); // AGI - deduction
    });

    it('should apply MFJ tax brackets correctly', () => {
      const input = createBasicInput({
        filingStatus: 'marriedJointly',
        income: {
          wages: $(200000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
      });

      const result = computeFederal2025(input);

      // MFJ at $200k should be in 22% bracket
      expect(result.taxBeforeCredits).toBeGreaterThan(0);
      // Effective tax rate should be reasonable
      const effectiveRate = result.taxBeforeCredits / $(200000);
      expect(effectiveRate).toBeGreaterThan(0.1);
      expect(effectiveRate).toBeLessThan(0.25);
    });
  });

  describe('Scenario 3: Self-Employed Individual', () => {
    it('should calculate self-employment tax correctly', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: 0,
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(80000), // Self-employment income
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
      });

      const result = computeFederal2025(input);

      // Should have SE tax calculated
      expect(result.additionalTaxes?.seTax).toBeGreaterThan(0);
    });

    it('should deduct half of SE tax from AGI', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: 0,
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: $(50000),
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
      });

      const result = computeFederal2025(input);

      // AGI should be less than gross SE income (due to SE tax deduction)
      expect(result.agi).toBeLessThan($(50000));
    });
  });

  describe('Scenario 4: Head of Household with Dependents', () => {
    it('should calculate correct deduction for HoH', () => {
      const input = createBasicInput({
        filingStatus: 'headOfHousehold',
        income: {
          wages: $(75000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
      });

      const result = computeFederal2025(input);

      // HoH has higher standard deduction than single
      expect(result.standardDeduction).toBe($(22500)); // 2025 HoH standard deduction
    });

    it('should apply Child Tax Credit when eligible', () => {
      const input = createBasicInput({
        filingStatus: 'headOfHousehold',
        dependents: 1,
        income: {
          wages: $(50000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        qualifyingChildren: [
          {
            birthDate: '2018-05-15', // Under 17
            relationship: 'son',
            monthsLivedWithTaxpayer: 12,
          },
        ],
      });

      const result = computeFederal2025(input);

      // Should have CTC applied
      expect(result.credits.ctc).toBeGreaterThan(0);
    });
  });

  describe('Scenario 5: Investment Income', () => {
    it('should calculate tax with qualified dividends', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(50000),
          interest: 0,
          dividends: { ordinary: $(1000), qualified: $(10000) },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
      });

      const result = computeFederal2025(input);

      // AGI should include all dividends
      expect(result.agi).toBe($(61000)); // wages + ordinary + qualified
    });

    it('should handle long-term capital gains correctly', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(100000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: $(50000),
          capitalGainsDetail: { shortTerm: $(10000), longTerm: $(40000) },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(150000));
    });
  });

  describe('Scenario 6: Itemized Deductions', () => {
    it('should use itemized when higher than standard', () => {
      const input = createBasicInput({
        filingStatus: 'marriedJointly',
        income: {
          wages: $(200000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        itemized: {
          stateLocalTaxes: $(10000), // SALT cap
          mortgageInterest: $(15000),
          charitable: $(10000),
          medical: $(5000), // May not be fully deductible due to AGI floor
          other: 0,
        },
      });

      const result = computeFederal2025(input);

      // Itemized ($35k+) should exceed standard for MFJ ($30,000)
      expect(result.deductionType).toBe('itemized');
    });

    it('should use standard when itemized is lower', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(60000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        itemized: {
          stateLocalTaxes: $(3000),
          mortgageInterest: $(2000),
          charitable: $(1000),
          medical: 0,
          other: 0,
        },
      });

      const result = computeFederal2025(input);

      // Standard deduction ($15,000) should be used
      expect(result.standardDeduction).toBe($(15000));
      expect(result.deductionType).toBe('standard');
    });

    it('should enforce SALT cap of $10,000', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(150000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        itemized: {
          stateLocalTaxes: $(25000), // Way over cap
          mortgageInterest: $(10000),
          charitable: 0,
          medical: 0,
          other: 0,
        },
      });

      const result = computeFederal2025(input);

      // SALT should be capped at $10,000, so itemized = $20,000
      // Which is still higher than single standard ($15,000)
      expect(result.deductionType).toBe('itemized');
      // Total deduction should be around $20,000 (10k SALT + 10k mortgage)
      expect(result.itemizedDeduction).toBe($(20000));
    });
  });

  describe('Scenario 7: Adjustments to Income', () => {
    it('should apply student loan interest deduction', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(55000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          businessExpenses: 0,
          hsaDeduction: 0,
          seTaxDeduction: 0,
          iraDeduction: 0,
          studentLoanInterest: $(2500), // Max deduction
        },
      });

      const result = computeFederal2025(input);

      // AGI should be reduced by student loan interest
      expect(result.agi).toBe($(52500)); // 55000 - 2500
    });

    it('should apply HSA deduction', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(70000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        adjustments: {
          businessExpenses: 0,
          hsaDeduction: $(4300), // 2025 individual HSA limit
          seTaxDeduction: 0,
          iraDeduction: 0,
          studentLoanInterest: 0,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(65700)); // 70000 - 4300
    });
  });

  describe('Scenario 8: Tax Liability Comparison', () => {
    it('should calculate reasonable tax for moderate income', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(40000),
          interest: 0,
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        payments: {
          federalWithheld: $(6000), // Over-withheld
          estPayments: 0,
          eitcAdvance: 0,
        },
      });

      const result = computeFederal2025(input);

      // Taxable income = $40,000 - $15,000 = $25,000
      expect(result.taxableIncome).toBe($(25000));
      // Tax should be reasonable
      expect(result.taxBeforeCredits).toBeGreaterThan(0);
      expect(result.taxBeforeCredits).toBeLessThan($(10000));
    });

    it('should calculate reasonable tax for higher income', () => {
      const input = createBasicInput({
        filingStatus: 'single',
        income: {
          wages: $(80000),
          interest: $(5000),
          dividends: { ordinary: 0, qualified: 0 },
          capGainsNet: 0,
          capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
          scheduleCNet: 0,
          k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
          other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
        },
        payments: {
          federalWithheld: $(5000), // Under-withheld
          estPayments: 0,
          eitcAdvance: 0,
        },
      });

      const result = computeFederal2025(input);

      // Tax should be calculated correctly
      expect(result.taxBeforeCredits).toBeGreaterThan($(10000));
    });
  });
});

describe('E2E: State Tax Integration', () => {
  it('should list all supported states', () => {
    const states = getSupportedStates();
    expect(states.length).toBeGreaterThan(40); // Should support most states
    // States array contains objects with code property
    const stateCodes = states.map((s: { code: string }) => s.code);
    expect(stateCodes).toContain('CA');
    expect(stateCodes).toContain('NY');
    expect(stateCodes).toContain('TX');
    expect(stateCodes).toContain('MD');
  });

  it('should get calculator for supported state', () => {
    const stateEntry = getStateCalculator('CA');
    expect(stateEntry).toBeDefined();
    expect(stateEntry?.calculator).toBeDefined();
    expect(stateEntry?.config).toBeDefined();
  });

  it('should calculate Maryland state tax correctly', () => {
    const input = createBasicInput({
      filingStatus: 'single',
      income: {
        wages: $(75000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const federalResult = computeFederal2025(input);
    const mdEntry = getStateCalculator('MD');

    if (mdEntry) {
      const mdResult = mdEntry.calculator({
        federalResult,
        filingStatus: 'single',
        state: 'MD',
        county: 'montgomery',
        stateWithheld: 0,
      });

      expect(mdResult.stateTax).toBeGreaterThan(0);
      expect(mdResult.localTax).toBeGreaterThan(0); // MD has local tax
    }
  });

  it('should handle states with no income tax', () => {
    // Create a mock federal result for testing
    const input = createBasicInput({
      filingStatus: 'single',
      income: {
        wages: $(100000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });
    const federalResult = computeFederal2025(input);

    const noTaxStates = ['TX', 'FL', 'WA', 'NV', 'WY', 'SD', 'AK'];

    for (const state of noTaxStates) {
      const stateEntry = getStateCalculator(state);
      if (stateEntry) {
        const result = stateEntry.calculator({
          federalResult,
          filingStatus: 'single',
          state,
          stateWithheld: 0,
        });
        expect(result.stateTax).toBe(0);
      }
    }
  });
});

describe('E2E: All Filing Statuses', () => {
  const filingStatuses: FilingStatus[] = [
    'single',
    'marriedJointly',
    'marriedSeparately',
    'headOfHousehold',
  ];

  const incomeLevel = $(100000);

  it.each(filingStatuses)('should calculate tax correctly for %s filer', (status) => {
    const input = createBasicInput({
      filingStatus: status,
      income: {
        wages: incomeLevel,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const result = computeFederal2025(input);

    expect(result.agi).toBe(incomeLevel);
    expect(result.standardDeduction).toBeGreaterThan(0);
    expect(result.taxableIncome).toBeLessThan(incomeLevel);
    expect(result.taxBeforeCredits).toBeGreaterThan(0);

    // Verify tax is reasonable (between 5% and 30% effective rate)
    const effectiveRate = result.taxBeforeCredits / incomeLevel;
    expect(effectiveRate).toBeGreaterThan(0.05);
    expect(effectiveRate).toBeLessThan(0.3);
  });

  it('should have MFJ with lower tax than single at same income', () => {
    const singleInput = createBasicInput({
      filingStatus: 'single',
      income: {
        wages: $(150000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const mfjInput = createBasicInput({
      filingStatus: 'marriedJointly',
      income: {
        wages: $(150000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const singleResult = computeFederal2025(singleInput);
    const mfjResult = computeFederal2025(mfjInput);

    // MFJ should pay less tax than single at same income
    expect(mfjResult.taxBeforeCredits).toBeLessThan(singleResult.taxBeforeCredits);
  });
});

describe('E2E: Edge Cases', () => {
  it('should handle very high income correctly', () => {
    const input = createBasicInput({
      filingStatus: 'single',
      income: {
        wages: $(1000000),
        interest: $(50000),
        dividends: { ordinary: $(10000), qualified: $(40000) },
        capGainsNet: $(200000),
        capitalGainsDetail: { shortTerm: $(50000), longTerm: $(150000) },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const result = computeFederal2025(input);

    // Should be in top bracket
    expect(result.agi).toBe($(1300000));
    expect(result.taxBeforeCredits).toBeGreaterThan($(300000)); // At least 25% effective

    // May trigger NIIT (3.8% on investment income over threshold)
    expect(result.additionalTaxes?.niit).toBeGreaterThanOrEqual(0);
  });

  it('should handle negative capital gains (losses)', () => {
    const input = createBasicInput({
      filingStatus: 'single',
      income: {
        wages: $(80000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: $(-3000), // Max deductible loss
        capitalGainsDetail: { shortTerm: $(-5000), longTerm: $(-8000) },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const result = computeFederal2025(input);

    // Capital loss deduction is limited to $3,000
    expect(result.agi).toBe($(77000)); // 80000 - 3000 loss
  });

  it('should not produce negative tax', () => {
    const input = createBasicInput({
      filingStatus: 'single',
      income: {
        wages: $(5000), // Very low income
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
    });

    const result = computeFederal2025(input);

    expect(result.taxableIncome).toBe(0); // Below standard deduction
    expect(result.taxBeforeCredits).toBe(0);
  });
});
