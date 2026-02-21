/**
 * Form 8962 Premium Tax Credit Integration Test
 *
 * Demonstrates PTC working in full federal calculation
 */

import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../../src/engine/federal/2025/computeFederal2025';
import type { FederalInput2025 } from '../../src/engine/types';

describe('Form 8962 PTC Integration', () => {
  const baseInput: FederalInput2025 = {
    filingStatus: 'single',
    primary: {
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1985-01-01',
    },
    dependents: 0,
    qualifyingChildren: [],
    income: {
      wages: 3000000, // $30,000
      interest: 0,
      dividends: { ordinary: 0, qualified: 0 },
      capGainsNet: 0,
      capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
      scheduleCNet: 0,
      k1: {
        ordinaryBusinessIncome: 0,
        passiveIncome: 0,
        portfolioIncome: 0,
      },
      other: {
        otherIncome: 0,
        royalties: 0,
        guaranteedPayments: 0,
      },
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

  it('should calculate additional PTC when APTC < PTC allowed', () => {
    const input: FederalInput2025 = {
      ...baseInput,
      form8962: {
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000), // $500/mo SLCSP
        actualPremiumPaid: Array(12).fill(10000), // $100/mo
        advancePTC: Array(12).fill(30000), // $300/mo advance
      },
    };

    const result = computeFederal2025(input);

    // AGI should be $30,000
    expect(result.agi).toBe(3000000);

    // Should have PTC credit (additional subsidy)
    expect(result.credits.ptc).toBeGreaterThan(0);
    expect(result.credits.ptcRepayment).toBe(0);

    // PTC should reduce tax liability
    expect(result.refundOrOwe).toBeGreaterThan(0); // Refund due to PTC
  });

  it('should calculate PTC repayment when APTC > PTC allowed', () => {
    const input: FederalInput2025 = {
      ...baseInput,
      income: {
        ...baseInput.income,
        wages: 5000000, // $50,000 (higher income = less subsidy)
      },
      form8962: {
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000), // $500/mo
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(60000), // $600/mo advance (too much)
      },
    };

    const result = computeFederal2025(input);

    // Should have repayment owed
    expect(result.credits.ptcRepayment).toBeGreaterThan(0);
    expect(result.credits.ptc).toBe(0);

    // Repayment should increase tax liability
    expect(result.totalTax).toBeGreaterThan(0);
  });

  it('should handle zero APTC (no advance payments)', () => {
    const input: FederalInput2025 = {
      ...baseInput,
      form8962: {
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000), // $500/mo
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0), // No advance
      },
    };

    const result = computeFederal2025(input);

    // Should receive full PTC at filing time
    expect(result.credits.ptc).toBeGreaterThan(0);
    expect(result.credits.ptcRepayment).toBe(0);

    // Should get substantial refund
    expect(result.refundOrOwe).toBeGreaterThan(300000); // > $3,000 PTC
  });

  it('should apply repayment cap for low-income taxpayers', () => {
    const input: FederalInput2025 = {
      ...baseInput,
      income: {
        ...baseInput.income,
        wages: 2500000, // ~159% FPL (low income)
      },
      form8962: {
        householdSize: 1,
        state: 'CA',
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(100000), // Way too much advance
      },
    };

    const result = computeFederal2025(input);

    // Repayment should be capped at $350 for <200% FPL single
    expect(result.credits.ptcRepayment).toBeLessThanOrEqual(35000); // $350
    expect(result.credits.ptcRepayment).toBeGreaterThan(0);
  });

  it('should handle partial year coverage', () => {
    const coverageMonths = Array(12).fill(false);
    coverageMonths[0] = true; // Jan
    coverageMonths[1] = true; // Feb
    coverageMonths[2] = true; // Mar

    const input: FederalInput2025 = {
      ...baseInput,
      form8962: {
        householdSize: 1,
        state: 'CA',
        coverageMonths,
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      },
    };

    const result = computeFederal2025(input);

    // Should have PTC for only 3 months
    expect(result.credits.ptc).toBeGreaterThan(0);
    expect(result.credits.ptc).toBeLessThan(200000); // < $2,000 (only 3 months)
  });

  it('should work with Alaska FPL multiplier', () => {
    const input: FederalInput2025 = {
      ...baseInput,
      income: {
        ...baseInput.income,
        wages: 2000000, // $20,000
      },
      form8962: {
        householdSize: 1,
        state: 'AK', // Alaska: 1.25x FPL
        coverageMonths: Array(12).fill(true),
        slcspPremium: Array(12).fill(50000),
        actualPremiumPaid: Array(12).fill(0),
        advancePTC: Array(12).fill(0),
      },
    };

    const result = computeFederal2025(input);

    // Alaska FPL is higher, so subsidy should be higher
    expect(result.credits.ptc).toBeGreaterThan(0);
  });
});
