/**
 * Delaware (DE) Tax Calculation Tests - 2025
 *
 * Tests Delaware's progressive tax system with standard deductions.
 */

import { describe, it, expect } from 'vitest';
import { computeDE2025 } from '../../../../../src/engine/states/DE/2025/computeDE2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';

describe('Delaware 2025 Tax Calculations', () => {
  it('Single filer - Basic scenario', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 45000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DE',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 150000,
      stateEstPayments: 0
    };

    const result = computeDE2025(stateInput);

    expect(result.stateAGI).toBe(federalResult.agi);
    expect(result.stateDeduction).toBeGreaterThan(0);
    expect(result.stateTaxableIncome).toBeLessThan(result.stateAGI);
    expect(result.stateTax).toBeGreaterThan(0);
    expect(result.state).toBe('DE');
    expect(result.taxYear).toBe(2025);
  });

  it('Married filing jointly - With dependents', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'marriedJointly',
      income: { wages: 80000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DE',
      filingStatus: 'marriedJointly',
      stateDependents: 2,
      stateWithheld: 300000,
      stateEstPayments: 0
    };

    const result = computeDE2025(stateInput);

    expect(result.state).toBe('DE');
    expect(result.stateTax).toBeGreaterThan(0);
  });

  it('High income - Top bracket', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 200000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'DE',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 1000000,
      stateEstPayments: 0
    };

    const result = computeDE2025(stateInput);

    expect(result.stateTax).toBeGreaterThan(500000);
    expect(result.state).toBe('DE');
  });
});
