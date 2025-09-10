import { describe, it, expect } from 'vitest';
import { computeCA2025 } from '../2025/computeCA2025';
import { CA_RULES_2025 } from '../../../rules/2025/states/ca';
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

describe('computeCA2025', () => {
  it('calculates California tax with standard deduction', () => {
    const input: TaxPayerInput = {
      filingStatus: 'single',
      primary: {},
      income: {},
      payments: {},
      state: 'CA',
    } as any;
    const result = computeCA2025(input, baseFederal);
    expect(result.state).toBe('CA');
    const expectedTaxable = baseFederal.agi - CA_RULES_2025.standardDeduction.single;
    expect(result.taxableIncomeState).toBe(expectedTaxable);
    expect(result.stateTax).toBeGreaterThan(0);
  });
});
