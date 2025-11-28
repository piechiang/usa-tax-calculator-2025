/**
 * District of Columbia (DC) Tax Calculation Tests - 2025
 *
 * Tests DC progressive tax (4%-10.75%), standard deductions, personal exemptions,
 * and DC EITC (70% of federal, refundable).
 */

import { describe, it, expect } from 'vitest';
import { computeDC2025 } from '../../../../../src/engine/states/DC/2025/computeDC2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';

describe('DC 2025 Tax Calculations', () => {
  it('Single filer - Basic scenario with low income', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 35000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 120000, // $1,200
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // DC AGI should equal federal AGI
    expect(result.stateAGI).toBe(federalResult.agi);

    // Standard deduction: $13,825 + Personal exemption: $1,950
    const expectedDeduction = 1382500 + 195000; // $15,775
    expect(result.stateDeduction).toBe(expectedDeduction);

    // Taxable income = $35,000 - $15,775 = $19,225
    const expectedTaxable = 3500000 - expectedDeduction;
    expect(result.stateTaxableIncome).toBe(expectedTaxable);

    // Tax calculation:
    // $10,000 @ 4% = $400
    // $9,225 @ 6% = $553.50
    // Total: $953.50 = 95350 cents
    expect(result.stateTax).toBeGreaterThan(90000);
    expect(result.stateTax).toBeLessThan(100000);

    expect(result.state).toBe('DC');
    expect(result.taxYear).toBe(2025);
  });

  it('Married filing jointly - Middle income with EITC', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'marriedJointly',
      income: { wages: 50000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'marriedJointly',
      stateDependents: 2,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // Standard deduction: $27,650 + Personal exemptions: 4 * $1,950 = $7,800
    const expectedDeduction = 2765000 + (4 * 195000); // $35,450
    expect(result.stateDeduction).toBe(expectedDeduction);

    // If federal EITC > 0, DC EITC = 70% of federal
    if (federalResult.credits.eitc > 0) {
      const expectedDCEITC = Math.round(federalResult.credits.eitc * 0.70);
      expect(result.stateCredits.earned_income).toBe(expectedDCEITC);
      expect(result.stateCredits.refundableCredits).toBe(expectedDCEITC);
    }

    expect(result.state).toBe('DC');
  });

  it('Single filer - High income (top bracket)', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 2000000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 18000000, // $180,000
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // Standard deduction + exemption
    const expectedDeduction = 1382500 + 195000; // $15,775
    expect(result.stateDeduction).toBe(expectedDeduction);

    // Taxable income = $2,000,000 - $15,775 = $1,984,225
    const expectedTaxable = 200000000 - expectedDeduction;
    expect(result.stateTaxableIncome).toBe(expectedTaxable);

    // Top bracket (10.75%) applies to income over $1,000,000
    // Tax should be significant
    expect(result.stateTax).toBeGreaterThan(15000000); // Over $150,000

    expect(result.state).toBe('DC');
  });

  it('Head of household - With dependents', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'headOfHousehold',
      income: { wages: 75000 },
      dependents: 3
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'headOfHousehold',
      stateDependents: 3,
      stateWithheld: 300000, // $3,000
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // Standard deduction: $20,765 + Personal exemptions: 4 * $1,950 = $7,800
    const expectedDeduction = 2076500 + (4 * 195000); // $28,565
    expect(result.stateDeduction).toBe(expectedDeduction);

    // Taxable income = $75,000 - $28,565 = $46,435
    const expectedTaxable = 7500000 - expectedDeduction;
    expect(result.stateTaxableIncome).toBe(expectedTaxable);

    expect(result.state).toBe('DC');
    expect(result.stateTax).toBeGreaterThan(200000); // Should have some tax
  });

  it('Married filing separately - Low income', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'marriedSeparately',
      income: { wages: 25000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'marriedSeparately',
      stateDependents: 0,
      stateWithheld: 50000, // $500
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // Standard deduction: $13,825 + Personal exemption: $1,950
    const expectedDeduction = 1382500 + 195000; // $15,775
    expect(result.stateDeduction).toBe(expectedDeduction);

    // Taxable income = $25,000 - $15,775 = $9,225
    const expectedTaxable = 2500000 - expectedDeduction;
    expect(result.stateTaxableIncome).toBe(expectedTaxable);

    // Tax on $9,225 @ 4% = $369
    expect(result.stateTax).toBeGreaterThan(30000);
    expect(result.stateTax).toBeLessThan(40000);

    expect(result.state).toBe('DC');
  });

  it('No DC tax - Income below standard deduction + exemption', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 10000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // Standard deduction + exemption = $15,775 > income
    // No taxable income, no tax
    expect(result.stateTaxableIncome).toBe(0);
    expect(result.stateTax).toBe(0);
    expect(result.state).toBe('DC');
  });

  it('DC EITC calculation - 70% of federal', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'marriedJointly',
      income: { wages: 30000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'marriedJointly',
      stateDependents: 2,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // If federal EITC exists, DC EITC should be 70% of it
    if (federalResult.credits.eitc > 0) {
      const expectedDCEITC = Math.round(federalResult.credits.eitc * 0.70);
      expect(result.stateCredits.earned_income).toBe(expectedDCEITC);

      // DC EITC is refundable
      expect(result.stateCredits.refundableCredits).toBe(expectedDCEITC);

      // Refundable credit should increase refund
      expect(result.stateRefundOrOwe).toBeGreaterThanOrEqual(expectedDCEITC);
    }

    expect(result.state).toBe('DC');
  });

  it('Verify progressive bracket calculation', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 100000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DC',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 600000, // $6,000
      stateEstPayments: 0
    };

    const result = computeDC2025(stateInput);

    // Taxable income = $100,000 - $15,775 = $84,225
    const expectedTaxable = 10000000 - (1382500 + 195000);
    expect(result.stateTaxableIncome).toBe(expectedTaxable);

    // Tax should use multiple brackets (4%, 6%, 6.5%, 8.5%)
    // Approximate: $400 + $1,800 + $1,300 + $2,063 = $5,563
    expect(result.stateTax).toBeGreaterThan(500000);
    expect(result.stateTax).toBeLessThan(700000);

    expect(result.state).toBe('DC');
  });
});
