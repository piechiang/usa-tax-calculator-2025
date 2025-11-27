import { describe, it, expect } from 'vitest';
import { computeNY2025 } from '../../../../../src/engine/states/NY/2025/computeNY2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../../../src/engine/types';

/**
 * New York 2025 Tax Calculation Tests
 *
 * TODO: Add comprehensive test cases based on New York tax instructions
 */

describe('New York 2025 State Tax Calculation', () => {

  it('should calculate basic New York tax for single filer', () => {
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
      refundOrOwe: -4000_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: 'NY',
      filingStatus: 'single',
      stateWithheld: 2000_00,
      stateEstPayments: 0
    };

    const result = computeNY2025(input);

    // TODO: Add specific assertions based on New York tax rules
    expect(result.state).toBe('NY');
    expect(result.taxYear).toBe(2025);
    expect(result.stateAGI).toBeGreaterThan(0);
    expect(result.stateTaxableIncome).toBeGreaterThan(0);
    expect(result.stateTax).toBeGreaterThanOrEqual(0);
  });

  it('should calculate New York tax with married filing jointly', () => {
    const federalResult: FederalResult2025 = {
      agi: 100000_00,
      taxableIncome: 70000_00,
      standardDeduction: 15000_00,
      taxBeforeCredits:8000_00,
      totalTax: 8000_00,
      totalPayments: 0,
      credits: {
        ctc: 2000_00,
        eitc: 0,
        aotc: 0,
        llc: 0,
        otherNonRefundable:2000_00,
        otherRefundable: 0
      },
      refundOrOwe: -6000_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: 'NY',
      filingStatus: 'marriedJointly',
      stateWithheld: 4000_00,
      stateEstPayments: 0
    };

    const result = computeNY2025(input);

    expect(result.state).toBe('NY');
    expect(result.taxYear).toBe(2025);
    // TODO: Add specific assertions
  });

  
  it('should apply New York EITC correctly', () => {
    const federalResult: FederalResult2025 = {
      agi: 20000_00,
      taxableIncome: 5000_00,
      standardDeduction: 15000_00,
      taxBeforeCredits: 500_00,
      totalTax: 500_00,
      totalPayments: 3000_00,
      credits: {
        ctc: 0,
        eitc: 3000_00, // Federal EITC
        aotc: 0,
        llc: 0,
        otherNonRefundable: 0,
        otherRefundable: 3000_00
      },
      refundOrOwe: 2500_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: 'NY',
      filingStatus: 'single',
      stateWithheld: 200_00,
      stateEstPayments: 0
    };

    const result = computeNY2025(input);

    // New York EITC should be 30% of federal
    const expectedNYEITC = Math.round(3000_00 * 0.3);
    expect(result.stateCredits.earned_income).toBe(expectedNYEITC);
  });
  

  
  it('should calculate local tax correctly', () => {
    const federalResult: FederalResult2025 = {
      agi: 60000_00,
      taxableIncome: 45000_00,
      standardDeduction: 15000_00,
      taxBeforeCredits: 5000_00,
      totalTax: 5000_00,
      totalPayments: 0,
      credits: {
        ctc: 0,
        eitc: 0,
        aotc: 0,
        llc: 0,
        otherNonRefundable: 0,
        otherRefundable: 0
      },
      refundOrOwe: -5000_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: 'NY',
      county: 'TestCounty', // TODO: Use actual county name
      filingStatus: 'single',
      stateWithheld: 2500_00,
      stateEstPayments: 0
    };

    const result = computeNY2025(input);

    // Local tax should be calculated
    expect(result.localTax).toBeGreaterThanOrEqual(0);
    expect(result.totalStateLiability).toBe(result.stateTax + result.localTax);
  });
  

  // TODO: Add more test cases:
  // - Different income levels
  // - With deductions
  // - With various credits
  // - Edge cases (zero income, very high income)
  // - New York-specific scenarios
});
