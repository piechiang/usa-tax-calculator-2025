import { describe, expect, it, vi } from 'vitest';
import { ReportBuilder } from '../../../src/utils/reports/ReportBuilder';
import { PDFRenderer } from '../../../src/utils/reports/PDFRenderer';
import { buildFederalInput } from '../../helpers/buildFederalInput';
import type { FederalResult2025, StateResult } from '../../../src/engine/types';

const federalResult: FederalResult2025 = {
  agi: 6000000,
  taxableIncome: 4000000,
  standardDeduction: 3000000,
  taxBeforeCredits: 800000,
  credits: {
    ctc: 100000,
    aotc: 25000,
    llc: 0,
    eitc: 0,
    otherNonRefundable: 0,
    otherRefundable: 0
  },
  additionalTaxes: {
    seTax: 50000,
    niit: 0,
    medicareSurtax: 0,
    amt: 0
  },
  totalTax: 750000,
  totalPayments: 900000,
  refundOrOwe: 150000,
  diagnostics: {
    warnings: [],
    errors: [],
  },
};

const stateResult: StateResult = {
  state: 'MD',
  year: 2025,
  agiState: 5900000,
  taxableIncomeState: 3800000,
  stateTax: 200000,
  localTax: 100000,
  totalStateLiability: 300000,
  stateDeduction: 450000,
  stateCredits: {
    earned_income: 0,
    nonRefundableCredits: 5000,
    renters: 6000,
    refundableCredits: 0
  },
  stateWithheld: 250000,
  stateEstPayments: 50000,
  stateRefundOrOwe: 0,
  calculationNotes: ['Maryland poverty exemption not triggered']
};

const taxInput = buildFederalInput({
  filingStatus: 'marriedJointly',
  primary: {
    ssn: '987-65-4321',
  },
  dependents: 1,
});

describe('PDFRenderer', () => {
  it('creates document definition with metadata and sections', () => {
    const builder = new ReportBuilder(federalResult, stateResult, taxInput);
    const report = builder.build('summary');

    const renderer = new PDFRenderer();
    const docDefinition = renderer.toDocumentDefinition(report);

    expect(Array.isArray(docDefinition.content)).toBe(true);
    const summaryHeader = docDefinition.content?.find(
      item => typeof item === 'object' && item !== null && 'text' in item && (item as any).text === 'Summary'
    );
    expect(summaryHeader).toBeDefined();
  });

  it('applies detailed formatting with page breaks and footnotes', () => {
    const builder = new ReportBuilder(federalResult, stateResult, taxInput);
    const report = builder.build('detailed');

    const renderer = new PDFRenderer();
    const docDefinition = renderer.toDocumentDefinition(report);

    const hasPageBreak = docDefinition.content?.some(
      item => typeof item === 'object' && item !== null && (item as any).pageBreak === 'before'
    );
    expect(hasPageBreak).toBe(true);

    const rentersRow = JSON.stringify(docDefinition.content);
    expect(rentersRow).toContain('Includes renter and dependent credits limited by liability.');
  });

  it('supports dependency injection of pdfmake for rendering', async () => {
    const builder = new ReportBuilder(federalResult, stateResult, taxInput);
    const report = builder.build('summary');

    const createPdf = vi.fn().mockReturnValue({
      download: vi.fn(),
      open: vi.fn()
    });
    const pdfMakeStub = { createPdf } as unknown as typeof import('pdfmake/build/pdfmake');

    const renderer = new PDFRenderer();
    await renderer.render(report, { pdfMake: pdfMakeStub, downloadFileName: 'report.pdf' });

    expect(createPdf).toHaveBeenCalledWith(expect.any(Object));
  });
});
