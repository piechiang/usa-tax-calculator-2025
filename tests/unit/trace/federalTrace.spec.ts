/**
 * Federal Trace Integration Tests
 */

import { describe, it, expect } from 'vitest';
import { createFederalTrace } from '../../../src/engine/trace/federalTrace';
import type { FederalInput2025, FederalResult2025 } from '../../../src/engine/types';

describe('createFederalTrace', () => {
  it('should create trace for simple tax return', () => {
    const input: Partial<FederalInput2025> = {
      filingStatus: 'single',
      wages: 5000000, // $50,000
      taxableInterest: 10000, // $100
      federalWithholding: 500000, // $5,000
      qualifyingChildren: [],
      qualifyingRelatives: [],
    };

    const result: Partial<FederalResult2025> = {
      totalIncome: 5010000,
      agi: 5010000,
      standardDeduction: 1500000,
      itemizedDeductions: 0,
      totalDeduction: 1500000,
      taxableIncome: 3510000,
      incomeTax: 385000,
      totalTax: 385000,
      totalPayments: 500000,
      refundOrOwe: 115000, // $1,150 refund
    };

    const trace = createFederalTrace(
      input as FederalInput2025,
      result as FederalResult2025
    );

    // Should have multiple sections
    expect(trace.length).toBeGreaterThan(5);

    // Income section
    const incomeSection = trace.find((s) => s.id === 'income');
    expect(incomeSection).toBeDefined();
    expect(incomeSection!.entries.length).toBeGreaterThan(0);

    // AGI section
    const agiSection = trace.find((s) => s.id === 'agi');
    expect(agiSection).toBeDefined();
    expect(agiSection!.entries[0]!.result).toBe(5010000);

    // Taxable income section
    const taxableSection = trace.find((s) => s.id === 'taxable_income');
    expect(taxableSection).toBeDefined();
    expect(taxableSection!.entries[0]!.result).toBe(3510000);

    // Total tax section
    const taxSection = trace.find((s) => s.id === 'total_tax');
    expect(taxSection).toBeDefined();
    expect(taxSection!.entries[0]!.result).toBe(385000);

    // Payments section
    const paymentsSection = trace.find((s) => s.id === 'payments');
    expect(paymentsSection).toBeDefined();

    // Refund section
    const refundSection = trace.find((s) => s.id === 'refund_owe');
    expect(refundSection).toBeDefined();
    expect(refundSection!.entries[0]!.result).toBe(115000);
  });

  it('should include Schedule 1 adjustments in trace', () => {
    const input: Partial<FederalInput2025> = {
      filingStatus: 'single',
      wages: 6000000,
      adjustments: {
        businessExpenses: 0,
        hsaDeduction: 200000, // $2,000 HSA
        iraDeduction: 650000, // $6,500 IRA
        studentLoanInterest: 250000, // $2,500
        seTaxDeduction: 0,
      },
      federalWithholding: 600000,
      qualifyingChildren: [],
      qualifyingRelatives: [],
    };

    const result: Partial<FederalResult2025> = {
      totalIncome: 6000000,
      adjustments: 1100000, // $11,000
      agi: 4900000,
      standardDeduction: 1500000,
      itemizedDeductions: 0,
      totalDeduction: 1500000,
      taxableIncome: 3400000,
      incomeTax: 375000,
      totalTax: 375000,
      totalPayments: 600000,
      refundOrOwe: 225000,
    };

    const trace = createFederalTrace(
      input as FederalInput2025,
      result as FederalResult2025
    );

    // Should have adjustments section
    const adjustmentsSection = trace.find((s) => s.id === 'adjustments');
    expect(adjustmentsSection).toBeDefined();
    expect(adjustmentsSection!.title).toContain('Adjustments');
    expect(adjustmentsSection!.formReference).toContain('Schedule 1');

    // Adjustments entry should show all components
    const entry = adjustmentsSection!.entries[0]!;
    expect(entry.inputs).toBeDefined();
    expect(entry.inputs!.hsaDeduction).toBe(200000);
    expect(entry.inputs!.iraDeduction).toBe(650000);
    expect(entry.inputs!.studentLoanInterest).toBe(250000);
    expect(entry.result).toBe(1100000);
  });

  it('should include capital gains in trace', () => {
    const input: Partial<FederalInput2025> = {
      filingStatus: 'single',
      wages: 5000000,
      capitalGains: {
        shortTermGain: 100000,
        longTermGain: 500000,
        totalCapitalGain: 600000,
      },
      federalWithholding: 600000,
      qualifyingChildren: [],
      qualifyingRelatives: [],
    };

    const result: Partial<FederalResult2025> = {
      totalIncome: 5600000,
      agi: 5600000,
      standardDeduction: 1500000,
      itemizedDeductions: 0,
      totalDeduction: 1500000,
      taxableIncome: 4100000,
      ordinaryIncomeTax: 400000,
      capitalGainsTax: 50000,
      incomeTax: 450000,
      totalTax: 450000,
      totalPayments: 600000,
      refundOrOwe: 150000,
    };

    const trace = createFederalTrace(
      input as FederalInput2025,
      result as FederalResult2025
    );

    // Income section should include capital gains entry
    const incomeSection = trace.find((s) => s.id === 'income');
    const cgEntry = incomeSection!.entries.find((e) => e.step === 'capital_gains');
    expect(cgEntry).toBeDefined();
    expect(cgEntry!.inputs).toEqual({
      shortTerm: 100000,
      longTerm: 500000,
    });
    expect(cgEntry!.result).toBe(600000);

    // Tax section should separate ordinary and LTCG tax
    const taxSection = trace.find((s) => s.id === 'tax');
    const ordinaryTaxEntry = taxSection!.entries.find((e) => e.step === 'ordinary_tax');
    const ltcgTaxEntry = taxSection!.entries.find((e) => e.step === 'ltcg_tax');

    expect(ordinaryTaxEntry).toBeDefined();
    expect(ltcgTaxEntry).toBeDefined();
    expect(ltcgTaxEntry!.result).toBe(50000);
  });

  it('should include self-employment tax in trace', () => {
    const input: Partial<FederalInput2025> = {
      filingStatus: 'single',
      businessIncome: 5000000, // $50,000 SE income
      federalWithholding: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
    };

    const result: Partial<FederalResult2025> = {
      totalIncome: 5000000,
      agi: 4647000, // After SE tax deduction
      standardDeduction: 1500000,
      itemizedDeductions: 0,
      totalDeduction: 1500000,
      taxableIncome: 3147000,
      incomeTax: 330000,
      selfEmploymentTax: 706000, // ~$7,060
      totalTax: 1036000,
      totalPayments: 0,
      refundOrOwe: -1036000,
    };

    const trace = createFederalTrace(
      input as FederalInput2025,
      result as FederalResult2025
    );

    // Should have other_taxes section for SE tax
    const otherTaxesSection = trace.find((s) => s.id === 'other_taxes');
    expect(otherTaxesSection).toBeDefined();

    const seEntry = otherTaxesSection!.entries.find((e) => e.step === 'se_tax');
    expect(seEntry).toBeDefined();
    expect(seEntry!.formReference).toContain('Schedule 2');
    expect(seEntry!.result).toBe(706000);
  });

  it('should include Child Tax Credit in trace', () => {
    const input: Partial<FederalInput2025> = {
      filingStatus: 'marriedJointly',
      wages: 8000000,
      qualifyingChildren: [
        {
          birthDate: '2015-01-01',
          relationship: 'son',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
        {
          birthDate: '2017-06-15',
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ],
      qualifyingRelatives: [],
      federalWithholding: 1000000,
    };

    const result: Partial<FederalResult2025> = {
      totalIncome: 8000000,
      agi: 8000000,
      standardDeduction: 2980000,
      itemizedDeductions: 0,
      totalDeduction: 2980000,
      taxableIncome: 5020000,
      incomeTax: 550000,
      childTaxCredit: 400000, // $4,000 for 2 children
      totalTax: 150000,
      totalPayments: 1000000,
      refundOrOwe: 850000,
    };

    const trace = createFederalTrace(
      input as FederalInput2025,
      result as FederalResult2025
    );

    // Should have credits section
    const creditsSection = trace.find((s) => s.id === 'credits');
    expect(creditsSection).toBeDefined();

    const ctcEntry = creditsSection!.entries.find((e) => e.step === 'ctc');
    expect(ctcEntry).toBeDefined();
    expect(ctcEntry!.formReference).toContain('Schedule 8812');
    expect(ctcEntry!.inputs!.qualifyingChildren).toBe(2);
    expect(ctcEntry!.result).toBe(400000);
  });

  it('should include all form references', () => {
    const input: Partial<FederalInput2025> = {
      filingStatus: 'single',
      wages: 5000000,
      taxableInterest: 10000,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      federalWithholding: 500000,
    };

    const result: Partial<FederalResult2025> = {
      totalIncome: 5010000,
      agi: 5010000,
      standardDeduction: 1500000,
      itemizedDeductions: 0,
      totalDeduction: 1500000,
      taxableIncome: 3510000,
      incomeTax: 385000,
      totalTax: 385000,
      totalPayments: 500000,
      refundOrOwe: 115000,
    };

    const trace = createFederalTrace(
      input as FederalInput2025,
      result as FederalResult2025
    );

    // Check that all entries have form references
    const allEntries = trace.flatMap((section) => section.entries);
    const entriesWithFormRefs = allEntries.filter((e) => e.formReference);

    expect(entriesWithFormRefs.length).toBeGreaterThan(0);

    // Spot check some key form references
    const hasForm1040Line1 = allEntries.some((e) =>
      e.formReference?.includes('Form 1040, Line 1')
    );
    const hasForm1040Line11 = allEntries.some((e) =>
      e.formReference?.includes('Form 1040, Line 11')
    );
    const hasForm1040Line15 = allEntries.some((e) =>
      e.formReference?.includes('Form 1040, Line 15')
    );

    expect(hasForm1040Line1).toBe(true);
    expect(hasForm1040Line11).toBe(true);
    expect(hasForm1040Line15).toBe(true);
  });
});
