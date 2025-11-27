import { describe, expect, it } from 'vitest';
import { ReportBuilder } from '../../../src/utils/reports/ReportBuilder';
import { buildFederalInput } from '../../helpers/buildFederalInput';
import type { FederalResult2025 } from '../../../src/engine/types';
import type { StateResult } from '../../../src/engine/types/stateTax';

const mockFederalResult = (): FederalResult2025 => ({
  agi: 8500000,
  taxableIncome: 5500000,
  standardDeduction: 3000000,
  taxBeforeCredits: 1200000,
  credits: {
    ctc: 200000,
    aotc: 50000,
    llc: 0,
    eitc: 0,
    otherNonRefundable: 0,
    otherRefundable: 30000,
  },
  additionalTaxes: {
    seTax: 150000,
    niit: 0,
    medicareSurtax: 0,
    amt: 0,
  },
  totalTax: 950000,
  totalPayments: 1100000,
  refundOrOwe: 150000,
  diagnostics: {
    warnings: [],
    errors: [],
  },
});

const mockStateResult = (): StateResult => ({
  state: 'CA',
  taxYear: 2025,
  stateAGI: 8400000,
  stateTaxableIncome: 6300000,
  stateTax: 450000,
  localTax: 0,
  totalStateLiability: 450000,
  stateWithheld: 400000,
  stateRefundOrOwe: -50000,
  stateDeduction: 500000,
  stateCredits: {
    earned_income: 0,
    nonRefundableCredits: 25000,
    refundableCredits: 0
  },
  stateEstPayments: 100000,
  calculationNotes: ['CalEITC not applicable']
});

const mockInput = () =>
  buildFederalInput({
    filingStatus: 'marriedJointly',
    primary: {
      ssn: '123-45-6789',
    },
    dependents: 2,
  });

describe('ReportBuilder', () => {
  it('builds summary report with combined totals', () => {
    const builder = new ReportBuilder(mockFederalResult(), mockStateResult(), mockInput());
    const report = builder.build('summary');

    expect(report.summary.totalTax).toBe(950000 + 450000);
    expect(report.summary.totalPayments).toBe(1100000 + 400000 + 100000);
    expect(report.summary.refundOrOwe).toBe(150000 - 50000);
    expect(report.metadata.taxpayerName).toBe('Primary Taxpayer');
    // Updated to match new Unicode-safe format (***-**-XXXX instead of ••••XXXX)
    expect(report.metadata.ssnLast4).toBe('***-**-6789');
    expect(report.sections.length).toBeGreaterThan(1);
  });

  it('includes detailed sections when requested', () => {
    const builder = new ReportBuilder(mockFederalResult(), mockStateResult(), mockInput());
    const report = builder.build('detailed');

    const paymentsSection = report.sections.find(section => section.title === 'Payments & Balances');
    expect(paymentsSection).toBeDefined();
    expect(paymentsSection?.rows.some(row => row.label === 'State Refund / Balance Due')).toBe(true);
  });

  it('handles missing state gracefully', () => {
    const builder = new ReportBuilder(mockFederalResult(), null, mockInput());
    const report = builder.build('summary');

    expect(report.metadata.state).toBeUndefined();
    expect(report.sections.length).toBe(1);
  });
});
