import { describe, it, expect } from 'vitest';
import { computePA2025 } from '../../../../../src/engine/states/PA/2025/computePA2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

/**
 * Pennsylvania 2025 Tax Calculation Tests
 *
 * TODO: Add comprehensive test cases based on Pennsylvania tax instructions
 */

describe('Pennsylvania 2025 State Tax Calculation', () => {

  it('should calculate basic Pennsylvania tax for single filer', () => {
    const federalResult: FederalResult2025 = {
      agi: 50000_00,
      taxableIncome: 35000_00,
      standardDeduction: 15000_00,
      taxBeforeCredits: 4000_00,
      totalTax: 4000_00,
      totalPayments: 0,
      credits: {
        ctc: 0,
        eitc: 0,
        aotc: 0,
        llc: 0,
        otherNonRefundable: 0,
        otherRefundable: 0
      },
      refundOrOwe: -4000_00,
      diagnostics: {
        warnings: [],
        errors: []
      }
    };

    const input: StateTaxInput = {
      federalResult,
      state: 'PA',
      filingStatus: 'single',
      stateWithheld: 2000_00,
      stateEstPayments: 0
    };

    const result = computePA2025(input);

    // TODO: Add specific assertions based on Pennsylvania tax rules
    expect(result.state).toBe('PA');
    expect(result.taxYear).toBe(2025);
    expect(result.stateAGI).toBeGreaterThan(0);
    expect(result.stateTaxableIncome).toBeGreaterThan(0);
    expect(result.stateTax).toBeGreaterThanOrEqual(0);
  });

  it('should calculate Pennsylvania tax with married filing jointly', () => {
    const federalResult: FederalResult2025 = {
      agi: 100000_00,
      taxableIncome: 70000_00,
      standardDeduction: 30000_00,
      taxBeforeCredits: 8000_00,
      totalTax: 8000_00,
      totalPayments: 0,
      credits: {
        ctc: 2000_00,
        eitc: 0,
        aotc: 0,
        llc: 0,
        otherNonRefundable: 2000_00,
        otherRefundable: 0
      },
      refundOrOwe: -6000_00,
      diagnostics: {
        warnings: [],
        errors: []
      }
    };

    const input: StateTaxInput = {
      federalResult,
      state: 'PA',
      filingStatus: 'marriedJointly',
      stateWithheld: 4000_00,
      stateEstPayments: 0
    };

    const result = computePA2025(input);

    expect(result.state).toBe('PA');
    // TODO: Add specific assertions
  });

  

  

  // TODO: Add more test cases:
  // - Different income levels
  // - With deductions
  // - With various credits
  // - Edge cases (zero income, very high income)
  // - Pennsylvania-specific scenarios
});
