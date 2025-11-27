/**
 * Trace Builder Tests
 */

import { describe, it, expect } from 'vitest';
import { TraceBuilder, TraceFormatter } from '../../../src/engine/trace/types';

describe('TraceBuilder', () => {
  it('should create a trace section', () => {
    const builder = new TraceBuilder();

    builder.startSection('test', 'Test Section', 'Form 1040');

    const sections = builder.getSections();
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      id: 'test',
      title: 'Test Section',
      formReference: 'Form 1040',
      entries: [],
    });
  });

  it('should add entries to current section', () => {
    const builder = new TraceBuilder();

    builder
      .startSection('income', 'Income')
      .addEntry({
        step: 'wages',
        description: 'Wages from W-2',
        formReference: 'Form 1040, Line 1',
        result: 5000000, // $50,000
        resultFormatted: '$50,000.00',
      })
      .addEntry({
        step: 'interest',
        description: 'Taxable interest',
        formReference: 'Form 1040, Line 2b',
        result: 10000, // $100
        resultFormatted: '$100.00',
      });

    const sections = builder.getSections();
    expect(sections[0]!.entries).toHaveLength(2);
    expect(sections[0]!.entries[0]!.step).toBe('wages');
    expect(sections[0]!.entries[1]!.step).toBe('interest');
  });

  it('should set section total', () => {
    const builder = new TraceBuilder();

    builder
      .startSection('deductions', 'Deductions')
      .addEntry({
        step: 'standard',
        description: 'Standard deduction',
        result: 1500000,
      })
      .setSectionTotal(1500000);

    const sections = builder.getSections();
    expect(sections[0]!.total).toBe(1500000);
  });

  it('should create multiple sections', () => {
    const builder = new TraceBuilder();

    builder
      .startSection('income', 'Income')
      .addEntry({
        step: 'wages',
        description: 'Wages',
        result: 5000000,
      })
      .startSection('deductions', 'Deductions')
      .addEntry({
        step: 'standard',
        description: 'Standard deduction',
        result: 1500000,
      });

    const sections = builder.getSections();
    expect(sections).toHaveLength(2);
    expect(sections[0]!.id).toBe('income');
    expect(sections[1]!.id).toBe('deductions');
  });

  it('should throw error when adding entry without section', () => {
    const builder = new TraceBuilder();

    expect(() => {
      builder.addEntry({
        step: 'wages',
        description: 'Wages',
        result: 5000000,
      });
    }).toThrow('No active section');
  });

  it('should clear all sections', () => {
    const builder = new TraceBuilder();

    builder
      .startSection('test', 'Test')
      .addEntry({
        step: 'test',
        description: 'Test',
        result: 0,
      })
      .clear();

    expect(builder.getSections()).toHaveLength(0);
  });

  it('should include timestamp in entries', () => {
    const builder = new TraceBuilder();

    builder.startSection('test', 'Test').addEntry({
      step: 'test',
      description: 'Test entry',
      result: 100,
    });

    const sections = builder.getSections();
    const entry = sections[0]!.entries[0]!;

    expect(entry.timestamp).toBeDefined();
    expect(new Date(entry.timestamp).getTime()).toBeGreaterThan(Date.now() - 5000);
  });

  it('should support formula and inputs in entries', () => {
    const builder = new TraceBuilder();

    builder.startSection('calc', 'Calculation').addEntry({
      step: 'agi',
      description: 'Adjusted Gross Income',
      formula: 'Total Income - Adjustments',
      inputs: {
        totalIncome: 6000000,
        adjustments: 500000,
      },
      result: 5500000,
    });

    const entry = builder.getSections()[0]!.entries[0]!;
    expect(entry.formula).toBe('Total Income - Adjustments');
    expect(entry.inputs).toEqual({
      totalIncome: 6000000,
      adjustments: 500000,
    });
  });
});

describe('TraceFormatter', () => {
  it('should format currency correctly', () => {
    expect(TraceFormatter.formatCurrency(5000000)).toBe('$50,000.00');
    expect(TraceFormatter.formatCurrency(123456)).toBe('$1,234.56');
    expect(TraceFormatter.formatCurrency(0)).toBe('$0.00');
    expect(TraceFormatter.formatCurrency(-5000)).toBe('-$50.00');
  });

  it('should format percentage correctly', () => {
    expect(TraceFormatter.formatPercent(0.10)).toBe('10.00%');
    expect(TraceFormatter.formatPercent(0.2475)).toBe('24.75%');
    expect(TraceFormatter.formatPercent(0)).toBe('0.00%');
  });

  it('should format trace entry', () => {
    const entry = {
      step: 'wages',
      description: 'Wages from W-2',
      formReference: 'Form 1040, Line 1',
      formula: 'Sum of all W-2 box 1',
      inputs: { w2Count: 2, totalWages: 5000000 },
      result: 5000000,
      resultFormatted: '$50,000.00',
      timestamp: new Date().toISOString(),
    };

    const formatted = TraceFormatter.formatEntry(entry);

    expect(formatted).toContain('Wages from W-2');
    expect(formatted).toContain('Form 1040, Line 1');
    expect(formatted).toContain('Formula: Sum of all W-2 box 1');
    expect(formatted).toContain('w2Count: 2');
    expect(formatted).toContain('$50,000.00');
  });

  it('should format trace section', () => {
    const section = {
      id: 'income',
      title: 'Income',
      formReference: 'Form 1040, Lines 1-9',
      entries: [
        {
          step: 'wages',
          description: 'Wages',
          result: 5000000,
          timestamp: new Date().toISOString(),
        },
        {
          step: 'interest',
          description: 'Interest',
          result: 10000,
          timestamp: new Date().toISOString(),
        },
      ],
      total: 5010000,
    };

    const formatted = TraceFormatter.formatSection(section);

    expect(formatted).toContain('Income (Form 1040, Lines 1-9)');
    expect(formatted).toContain('Wages');
    expect(formatted).toContain('Interest');
    expect(formatted).toContain('Total: $50,100.00');
  });
});
