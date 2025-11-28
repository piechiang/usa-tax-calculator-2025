/**
 * Script to generate basic test files for new states
 * Usage: node scripts/generate-state-tests.js
 */

const fs = require('fs');
const path = require('path');

const stateTestTemplate = (stateCode, stateName) => `/**
 * ${stateName} (${stateCode}) Tax Calculation Tests - 2025
 *
 * Tests ${stateName}'s state tax system.
 */

import { describe, it, expect } from 'vitest';
import { compute${stateCode}2025 } from '../../../../../src/engine/states/${stateCode}/2025/compute${stateCode}2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';

describe('${stateName} 2025 Tax Calculations', () => {
  it('Single filer - Basic scenario', () => {
    const federalInput = buildFederalInput({
      filingStatus: 'single',
      income: { wages: 50000 },
      dependents: 0
    });

    const federalResult = computeFederal2025(federalInput);

    const stateInput: StateTaxInput = {
      federalResult,
      state: '${stateCode}',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 150000, // $1,500
      stateEstPayments: 0
    };

    const result = compute${stateCode}2025(stateInput);

    expect(result.stateAGI).toBe(federalResult.agi);
    expect(result.stateDeduction).toBeGreaterThan(0);
    expect(result.stateTaxableIncome).toBeLessThan(result.stateAGI);
    expect(result.stateTax).toBeGreaterThan(0);
    expect(result.state).toBe('${stateCode}');
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
      state: '${stateCode}',
      filingStatus: 'marriedJointly',
      stateDependents: 2,
      stateWithheld: 350000, // $3,500
      stateEstPayments: 0
    };

    const result = compute${stateCode}2025(stateInput);

    expect(result.state).toBe('${stateCode}');
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
      state: '${stateCode}',
      filingStatus: 'headOfHousehold',
      stateDependents: 2,
      stateWithheld: 200000, // $2,000
      stateEstPayments: 0
    };

    const result = compute${stateCode}2025(stateInput);

    expect(result.state).toBe('${stateCode}');
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
      state: '${stateCode}',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 1200000, // $12,000
      stateEstPayments: 0
    };

    const result = compute${stateCode}2025(stateInput);

    expect(result.stateTax).toBeGreaterThan(800000); // Should be over $8,000
    expect(result.state).toBe('${stateCode}');
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
      state: '${stateCode}',
      filingStatus: 'single',
      stateDependents: 0,
      stateWithheld: 0,
      stateEstPayments: 0
    };

    const result = compute${stateCode}2025(stateInput);

    expect(result.stateTax).toBeLessThan(150000); // Less than $1,500
    expect(result.state).toBe('${stateCode}');
  });
});
`;

// States that need tests (already have AR and DE)
const statesToGenerate = [
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'KS', name: 'Kansas' },
  { code: 'ME', name: 'Maine' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MT', name: 'Montana' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'WV', name: 'West Virginia' }
];

statesToGenerate.forEach(({ code, name }) => {
  const testDir = path.join(__dirname, '..', 'tests', 'golden', 'states', code.toLowerCase(), '2025');
  const testFile = path.join(testDir, 'basic.spec.ts');

  // Create directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Write test file
  fs.writeFileSync(testFile, stateTestTemplate(code, name), 'utf-8');
  console.log(`✅ Created test for ${name} (${code})`);
});

console.log('\n✨ Test generation complete!');
