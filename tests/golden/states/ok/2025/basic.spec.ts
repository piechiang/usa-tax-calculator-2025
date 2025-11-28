/**
 * Oklahoma (OK) Tax Calculation Tests - 2025
 *
 * Tests Oklahoma's state tax system.
 */

import { describe, it, expect } from 'vitest';
import { computeOK2025 } from '../../../../../src/engine/states/OK/2025/computeOK2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';

describe('Oklahoma 2025 Tax Calculations', () => {
  it('Single filer - Basic scenario', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 50000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'OK',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 150000, // $1,500
      stateEstPayments: 0
    };

    const result = computeOK2025(stateInput);

    expect(result.stateAGI).toBe(federalResult.agi);
    expect(result.stateDeduction).toBeGreaterThan(0);
    expect(result.stateTaxableIncome).toBeLessThan(result.stateAGI);
    expect(result.stateTax).toBeGreaterThan(0);
    expect(result.state).toBe('OK');
    expect(result.taxYear).toBe(2025);
  });

  it('Married filing jointly - With dependents', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'marriedJointly',
      income: { wages: 85000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'OK',
      filingStatus: 'marriedJointly',
      stateDependents: 2,
      stateWithheld: 350000, // $3,500
      stateEstPayments: 0
    };

    const result = computeOK2025(stateInput);

    expect(result.state).toBe('OK');
    expect(result.stateTax).toBeGreaterThan(0);
  });

  it('Head of household - With dependents', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'headOfHousehold',
      income: { wages: 60000 },
      dependents: 2
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'OK',
      filingStatus: 'headOfHousehold',
      stateDependents: 2,
      stateWithheld: 200000, // $2,000
      stateEstPayments: 0
    };

    const result = computeOK2025(stateInput);

    expect(result.state).toBe('OK');
    expect(result.stateTax).toBeGreaterThan(0);
  });

  it('High income - Top bracket', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 250000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'OK',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 1200000, // $12,000
      stateEstPayments: 0
    };

    const result = computeOK2025(stateInput);

    expect(result.stateTax).toBeGreaterThan(800000); // Should be over $8,000
    expect(result.state).toBe('OK');
  });

  it('Low income - Minimal tax', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 25000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: 'OK',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = computeOK2025(stateInput);

    expect(result.stateTax).toBeLessThan(150000); // Less than $1,500
    expect(result.state).toBe('OK');
  });
});
