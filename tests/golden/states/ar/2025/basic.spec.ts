/**
 * Arkansas (AR) Tax Calculation Tests - 2025
 *
 * Tests Arkansas's 5-bracket progressive tax (2%-4.7%), standard deductions,
 * and personal exemptions ($29 per exemption).
 */

import { describe, it, expect } from 'vitest';
import { computeAR2025 } from '../../../../../src/engine/states/AR/2025/computeAR2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';

describe('Arkansas 2025 Tax Calculations', () => {
  it('Single filer - Basic scenario with moderate income', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 40000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'AR',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 100000, // $1,000
      stateEstPayments: 0
    };

    const result = computeAR2025(stateInput);

    // AR AGI should equal federal AGI
    expect(result.stateAGI).toBe(federalResult.agi);

    // Verify standard deduction is applied
    expect(result.stateDeduction).toBeGreaterThan(0);

    // Taxable income should be less than AGI
    expect(result.stateTaxableIncome).toBeLessThan(result.stateAGI);

    // Should have some tax liability with 5 brackets (2%-4.7%)
    expect(result.stateTax).toBeGreaterThan(0);

    expect(result.state).toBe('AR');
    expect(result.taxYear).toBe(2025);
  });

  it('Married filing jointly - With dependents', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'marriedJointly',
      income: { wages: 70000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'AR',
      filingStatus: 'marriedJointly',
      stateDependents: 2,
      stateWithheld: 200000, // $2,000
      stateEstPayments: 0
    };

    const result = computeAR2025(stateInput);

    // Personal exemptions: 2 (couple) + 2 (dependents) = 4 exemptions @ $29 each
    const expectedExemptions = 4 * 2900; // $116 total
    expect(result.stateCredits.personal_exemption).toBe(expectedExemptions);

    // Standard deduction for MFJ should be higher than single
    expect(result.stateDeduction).toBeGreaterThan(0);

    expect(result.state).toBe('AR');
    expect(result.stateTax).toBeGreaterThan(0);
  });

  it('Single filer - High income (top bracket)', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 150000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'AR',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 600000, // $6,000
      stateEstPayments: 0
    };

    const result = computeAR2025(stateInput);

    // High income should hit top bracket (4.7%)
    expect(result.stateTax).toBeGreaterThan(400000); // Should be over $4,000

    expect(result.state).toBe('AR');
  });

  it('Head of household - With dependents', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'headOfHousehold',
      income: { wages: 55000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'AR',
      filingStatus: 'headOfHousehold',
      stateDependents: 2,
      stateWithheld: 150000, // $1,500
      stateEstPayments: 0
    };

    const result = computeAR2025(stateInput);

    // 1 (taxpayer) + 2 (dependents) = 3 exemptions
    const expectedExemptions = 3 * 2900; // $87
    expect(result.stateCredits.personal_exemption).toBe(expectedExemptions);

    expect(result.state).toBe('AR');
  });

  it('Low income - Should have minimal tax', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 20000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'AR',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = computeAR2025(stateInput);

    // Low income should have low or zero tax after deductions
    expect(result.stateTax).toBeLessThan(100000); // Less than $1,000

    expect(result.state).toBe('AR');
  });

  it('No local tax - Arkansas has no local income tax', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 50000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'AR',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = computeAR2025(stateInput);

    // Arkansas has no state-administered local income tax
    expect(result.localTax).toBe(0);

    expect(result.state).toBe('AR');
  });
});
