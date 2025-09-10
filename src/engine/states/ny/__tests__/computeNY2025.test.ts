import { describe, it, expect } from 'vitest';
import { computeNY2025 } from '../2025/computeNY2025';
import { NY_RULES_2025 } from '../../../rules/2025/states/ny';
import { FederalResult2025, TaxPayerInput } from '../../../types';

const baseFederal: FederalResult2025 = {
  agi: 6000000,
  taxableIncome: 6000000,
  standardDeduction: 0,
  taxBeforeCredits: 0,
  credits: {},
  totalTax: 0,
  totalPayments: 0,
  refundOrOwe: 0,
};

describe('computeNY2025', () => {
  it('calculates New York tax with standard deduction', () => {
    const input: TaxPayerInput = {
      filingStatus: 'single',
      primary: {},
      income: {},
      payments: {},
      state: 'NY',
    } as any;
    const result = computeNY2025(input, baseFederal);
    expect(result.state).toBe('NY');
    const expectedTaxable = baseFederal.agi - NY_RULES_2025.standardDeduction.single;
    expect(result.taxableIncomeState).toBe(expectedTaxable);
    expect(result.stateTax).toBeGreaterThan(0);
  });
});
