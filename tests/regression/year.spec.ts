import { describe, it, expect } from 'vitest';
import { computeFederal, computeMD } from '../../src/engine';

const baseInput = {
  filingStatus: 'single',
  primary: {},
  income: {
    wages: 60000,
  },
  payments: {},
  isMaryland: true,
  county: 'Baltimore City',
};

describe('Tax engine year regression', () => {
  it('federal calculations consistent across years', () => {
    const r2024 = computeFederal(2024, baseInput);
    const r2025 = computeFederal(2025, baseInput);
    const r2026 = computeFederal(2026, baseInput);
    expect(r2024.totalTax).toBe(r2025.totalTax);
    expect(r2026.totalTax).toBe(r2025.totalTax);
  });

  it('state calculations consistent across years', () => {
    const f2024 = computeFederal(2024, baseInput);
    const f2025 = computeFederal(2025, baseInput);
    const s2024 = computeMD(2024, baseInput, f2024);
    const s2025 = computeMD(2025, baseInput, f2025);
    const s2026 = computeMD(2026, baseInput, f2025);
    expect(s2024.totalStateLiability).toBe(s2025.totalStateLiability);
    expect(s2026.totalStateLiability).toBe(s2025.totalStateLiability);
  });
});
