/**
 * Federal Trace Integration Tests - updated to use correct nested FederalInput2025 structure
 */

import { describe, it, expect } from 'vitest';
import { createFederalTrace } from '../../../src/engine/trace/federalTrace';
import type { FederalInput2025, FederalResult2025 } from '../../../src/engine/types';

function baseIncome(): FederalInput2025['income'] {
  return {
    wages: 0,
    interest: 0,
    dividends: { ordinary: 0, qualified: 0 },
    capGainsNet: 0,
    capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
    scheduleCNet: 0,
    k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
    other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
  };
}

function makeInput(overrides: Partial<FederalInput2025> = {}): FederalInput2025 {
  return {
    filingStatus: 'single',
    primary: {},
    dependents: 0,
    qualifyingChildren: [],
    qualifyingRelatives: [],
    educationExpenses: [],
    income: baseIncome(),
    adjustments: {
      businessExpenses: 0,
      hsaDeduction: 0,
      seTaxDeduction: 0,
      iraDeduction: 0,
      studentLoanInterest: 0,
    },
    itemized: { stateLocalTaxes: 0, mortgageInterest: 0, charitable: 0, medical: 0, other: 0 },
    payments: { federalWithheld: 0, estPayments: 0, eitcAdvance: 0 },
    ...overrides,
  } as FederalInput2025;
}

function makeResult(overrides: Partial<FederalResult2025> = {}): FederalResult2025 {
  return {
    agi: 0,
    taxableIncome: 0,
    deductionType: 'standard',
    standardDeduction: 0,
    taxBeforeCredits: 0,
    credits: {},
    totalTax: 0,
    totalPayments: 0,
    refundOrOwe: 0,
    diagnostics: { warnings: [], errors: [] },
    ...overrides,
  } as FederalResult2025;
}

describe('createFederalTrace', () => {
  it('should create trace for simple tax return', () => {
    const input = makeInput({
      income: { ...baseIncome(), wages: 5000000, interest: 10000 },
      payments: { federalWithheld: 500000, estPayments: 0, eitcAdvance: 0 },
    });
    const result = makeResult({
      agi: 5010000,
      standardDeduction: 1500000,
      taxableIncome: 3510000,
      taxBeforeCredits: 385000,
      totalTax: 385000,
      totalPayments: 500000,
      refundOrOwe: 115000,
    });
    const trace = createFederalTrace(input, result);
    expect(trace.length).toBeGreaterThan(5);
    expect(trace.find((s) => s.id === 'income')).toBeDefined();
    expect(trace.find((s) => s.id === 'agi')!.entries[0]!.result).toBe(5010000);
    expect(trace.find((s) => s.id === 'taxable_income')!.entries[0]!.result).toBe(3510000);
    expect(trace.find((s) => s.id === 'total_tax')!.entries[0]!.result).toBe(385000);
    expect(trace.find((s) => s.id === 'payments')).toBeDefined();
    expect(trace.find((s) => s.id === 'refund_owe')!.entries[0]!.result).toBe(115000);
  });

  it('should include Schedule 1 adjustments in trace', () => {
    const input = makeInput({
      income: { ...baseIncome(), wages: 6000000 },
      adjustments: {
        businessExpenses: 0,
        seTaxDeduction: 0,
        hsaDeduction: 200000,
        iraDeduction: 650000,
        studentLoanInterest: 250000,
      },
      payments: { federalWithheld: 600000, estPayments: 0, eitcAdvance: 0 },
    });
    const result = makeResult({
      agi: 4900000,
      standardDeduction: 1500000,
      taxableIncome: 3400000,
      taxBeforeCredits: 375000,
      totalTax: 375000,
      totalPayments: 600000,
      refundOrOwe: 225000,
    });
    const trace = createFederalTrace(input, result);
    const adj = trace.find((s) => s.id === 'adjustments');
    expect(adj).toBeDefined();
    expect(adj!.title).toContain('Adjustments');
    expect(adj!.formReference).toContain('Schedule 1');
    expect(adj!.entries[0]!.inputs!.hsaDeduction).toBe(200000);
    expect(adj!.entries[0]!.inputs!.iraDeduction).toBe(650000);
    expect(adj!.entries[0]!.inputs!.studentLoanInterest).toBe(250000);
  });

  it('should include capital gains in trace', () => {
    const input = makeInput({
      income: {
        ...baseIncome(),
        wages: 5000000,
        capGainsNet: 600000,
        capitalGainsDetail: { shortTerm: 100000, longTerm: 500000 },
      },
      payments: { federalWithheld: 600000, estPayments: 0, eitcAdvance: 0 },
    });
    const result = makeResult({
      agi: 5600000,
      standardDeduction: 1500000,
      taxableIncome: 4100000,
      taxBeforeCredits: 450000,
      totalTax: 450000,
      totalPayments: 600000,
      refundOrOwe: 150000,
    });
    const trace = createFederalTrace(input, result);
    const incSection = trace.find((s) => s.id === 'income')!;
    const cgEntry = incSection.entries.find((e) => e.step === 'capital_gains');
    expect(cgEntry).toBeDefined();
    expect(cgEntry!.inputs).toEqual({ shortTerm: 100000, longTerm: 500000 });
    expect(cgEntry!.result).toBe(600000);
  });

  it('should include self-employment tax in trace', () => {
    const input = makeInput({
      income: { ...baseIncome(), scheduleCNet: 5000000 },
      payments: { federalWithheld: 0, estPayments: 0, eitcAdvance: 0 },
    });
    const result = makeResult({
      agi: 4647000,
      standardDeduction: 1500000,
      taxableIncome: 3147000,
      taxBeforeCredits: 330000,
      additionalTaxes: { seTax: 706000 },
      totalTax: 1036000,
      totalPayments: 0,
      refundOrOwe: -1036000,
    });
    const trace = createFederalTrace(input, result);
    const otherTax = trace.find((s) => s.id === 'other_taxes');
    expect(otherTax).toBeDefined();
    const seEntry = otherTax!.entries.find((e) => e.step === 'se_tax');
    expect(seEntry).toBeDefined();
    expect(seEntry!.formReference).toContain('Schedule 2');
    expect(seEntry!.result).toBe(706000);
  });

  it('should include Child Tax Credit in trace', () => {
    const input = makeInput({
      filingStatus: 'marriedJointly',
      income: { ...baseIncome(), wages: 8000000 },
      qualifyingChildren: [
        { birthDate: '2015-01-01', relationship: 'son', monthsLivedWithTaxpayer: 12 },
        { birthDate: '2017-06-15', relationship: 'daughter', monthsLivedWithTaxpayer: 12 },
      ],
      payments: { federalWithheld: 1000000, estPayments: 0, eitcAdvance: 0 },
    });
    const result = makeResult({
      agi: 8000000,
      standardDeduction: 2980000,
      taxableIncome: 5020000,
      taxBeforeCredits: 550000,
      credits: { ctc: 400000 },
      totalTax: 150000,
      totalPayments: 1000000,
      refundOrOwe: 850000,
    });
    const trace = createFederalTrace(input, result);
    const creditsSection = trace.find((s) => s.id === 'credits');
    expect(creditsSection).toBeDefined();
    const ctcEntry = creditsSection!.entries.find((e) => e.step === 'ctc');
    expect(ctcEntry).toBeDefined();
    expect(ctcEntry!.formReference).toContain('Schedule 8812');
    expect(ctcEntry!.inputs!.qualifyingChildren).toBe(2);
    expect(ctcEntry!.result).toBe(400000);
  });

  it('should include all form references', () => {
    const input = makeInput({
      income: { ...baseIncome(), wages: 5000000, interest: 10000 },
      payments: { federalWithheld: 500000, estPayments: 0, eitcAdvance: 0 },
    });
    const result = makeResult({
      agi: 5010000,
      standardDeduction: 1500000,
      taxableIncome: 3510000,
      taxBeforeCredits: 385000,
      totalTax: 385000,
      totalPayments: 500000,
      refundOrOwe: 115000,
    });
    const trace = createFederalTrace(input, result);
    const allEntries = trace.flatMap((s) => s.entries);
    expect(allEntries.filter((e) => e.formReference).length).toBeGreaterThan(0);
    expect(allEntries.some((e) => e.formReference?.includes('Form 1040, Line 1'))).toBe(true);
    expect(allEntries.some((e) => e.formReference?.includes('Form 1040, Line 11'))).toBe(true);
    expect(allEntries.some((e) => e.formReference?.includes('Form 1040, Line 15'))).toBe(true);
  });
});
