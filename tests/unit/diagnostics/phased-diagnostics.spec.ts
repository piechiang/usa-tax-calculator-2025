/**
 * Tests for Phase-Based Diagnostic System
 */

import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../../../src/engine/federal/2025/computeFederal2025';
import {
  getMessagesByPhase,
  getPhasesWithDiagnostics,
  formatDiagnosticsByPhase,
} from '../../../src/engine/diagnostics';
import type { FederalInput2025 } from '../../../src/engine/types';

describe('Phase-Based Diagnostics', () => {
  it('should categorize self-employment diagnostics by phase', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: {},
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 0,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        scheduleCNet: 50_000_00, // $50k self-employment income
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        educatorExpenses: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        hsaDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: 0,
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    // Should have self-employment phase diagnostics
    const sePhaseMessages = getMessagesByPhase(result.diagnostics, 'self-employment');
    expect(sePhaseMessages.length).toBeGreaterThan(0);

    // Verify all SE messages have the correct phase
    sePhaseMessages.forEach((msg) => {
      expect(msg.phase).toBe('self-employment');
    });
  });

  it('should categorize QBI deduction diagnostics by phase', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: {},
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 0,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        scheduleCNet: 100_000_00, // $100k business income
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        educatorExpenses: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        hsaDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: 0,
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [
        {
          businessName: 'Test LLC',
          qbi: 80_000_00,
          w2Wages: 0,
          ubia: 0,
        },
      ],
    };

    const result = computeFederal2025(input);

    // Should have QBI phase diagnostics (warning about wage limitation)
    const qbiPhaseMessages = getMessagesByPhase(result.diagnostics, 'qbi');
    expect(qbiPhaseMessages.length).toBeGreaterThan(0);

    // Verify all QBI messages have the correct phase
    qbiPhaseMessages.forEach((msg) => {
      expect(msg.phase).toBe('qbi');
    });
  });

  it('should categorize deduction diagnostics by phase', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: {},
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 100_000_00,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        educatorExpenses: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        hsaDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 15_000_00, // $15k SALT (over cap)
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: 0,
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    // Should have deduction phase diagnostics (SALT cap warning)
    const deductionPhaseMessages = getMessagesByPhase(result.diagnostics, 'deductions');
    expect(deductionPhaseMessages.length).toBeGreaterThan(0);

    // Verify all deduction messages have the correct phase
    deductionPhaseMessages.forEach((msg) => {
      expect(msg.phase).toBe('deductions');
    });
  });

  it('should list all phases with diagnostics', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: {},
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 0,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        scheduleCNet: 50_000_00,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        educatorExpenses: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        hsaDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: 0,
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    const phases = getPhasesWithDiagnostics(result.diagnostics);
    expect(phases).toBeInstanceOf(Array);
    expect(phases.length).toBeGreaterThan(0);

    // Should include self-employment phase
    expect(phases).toContain('self-employment');
  });

  it('should format diagnostics by phase correctly', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: {},
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 0,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        scheduleCNet: 50_000_00,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        educatorExpenses: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        hsaDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: 0,
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    const formatted = formatDiagnosticsByPhase(result.diagnostics);
    expect(formatted).toContain('SELF-EMPLOYMENT');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should maintain backward compatibility with non-phased diagnostics', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: {},
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 50_000_00,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        scheduleCNet: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        educatorExpenses: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        hsaDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: 0,
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    // Should still have warnings and errors arrays
    expect(result.diagnostics.warnings).toBeInstanceOf(Array);
    expect(result.diagnostics.errors).toBeInstanceOf(Array);

    // byPhase should be optional
    expect(result.diagnostics.byPhase).toBeDefined();
  });
});
