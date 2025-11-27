# Calculation Trace Guide

## Overview

The Calculation Trace system provides **detailed audit trails** for tax calculations, enabling:
- ✅ IRS form/worksheet reconciliation
- ✅ Professional review and sign-off
- ✅ Client explanation and transparency
- ✅ Compliance documentation
- ✅ Error diagnosis and debugging

## Quick Start

### Basic Usage

```typescript
import { computeFederal2025 } from './engine/federal/2025/computeFederal2025';
import { createFederalTrace, TraceFormatter } from './engine/trace';

// 1. Calculate taxes
const result = computeFederal2025(input);

// 2. Generate trace
const trace = createFederalTrace(input, result);

// 3. Format and display
console.log(TraceFormatter.formatTrace({
  metadata: {
    taxYear: 2025,
    calculatedAt: new Date().toISOString(),
    engineVersion: '1.0.0',
    filingStatus: input.filingStatus,
  },
  federal: {
    sections: trace,
    summary: {
      agi: result.agi,
      taxableIncome: result.taxableIncome,
      totalTax: result.totalTax,
      totalPayments: result.totalPayments,
      refundOrOwe: result.refundOrOwe,
    },
  },
  diagnostics: result.diagnostics.errors.concat(result.diagnostics.warnings),
}));
```

### Example Output

```
TAX CALCULATION TRACE
Tax Year: 2025
Filing Status: single
Calculated: 2025-11-21T10:00:00.000Z
Engine: 1.0.0
============================================================

FEDERAL INCOME TAX

Income (Form 1040, Lines 1-9)
============================================================
  Wages, salaries, tips
    └─ Form 1040, Line 1
    └─ Inputs:
       • w2Wages: 5000000
    └─ Result: $50,000.00

  Total Income
    └─ Form 1040, Line 9
    └─ Result: $50,000.00

Adjusted Gross Income (Form 1040, Line 11)
============================================================
  Adjusted Gross Income
    └─ Form 1040, Line 11
    └─ Formula: Total Income - Adjustments
    └─ Inputs:
       • totalIncome: 5000000
       • adjustments: 0
    └─ Result: $50,000.00

...
```

## Architecture

### Core Types

```typescript
// Trace Entry - Single calculation step
interface TraceEntry {
  step: string;                    // Unique ID (e.g., "agi", "line_12a")
  description: string;             // Human-readable description
  formReference?: string;          // IRS form reference
  formula?: string;                // Calculation formula
  inputs?: Record<string, any>;   // Input values
  result: number;                  // Result in cents
  resultFormatted?: string;        // Display format
  citation?: string;               // Tax law citation
  timestamp: string;               // ISO timestamp
}

// Trace Section - Group of related entries
interface TraceSection {
  id: string;                      // Section ID
  title: string;                   // Section title
  formReference?: string;          // Form/schedule reference
  entries: TraceEntry[];           // Ordered entries
  total?: number;                  // Section total
}

// Complete Trace
interface CalculationTrace {
  metadata: {...};                 // Tax year, taxpayer, etc.
  federal: {
    sections: TraceSection[];
    summary: {...};
  };
  state?: {
    stateCode: string;
    sections: TraceSection[];
    summary: {...};
  };
  diagnostics: Array<{...}>;
}
```

### TraceBuilder API

```typescript
const builder = new TraceBuilder();

builder
  .startSection('income', 'Income', 'Form 1040, Lines 1-9')
  .addEntry({
    step: 'wages',
    description: 'Wages from W-2',
    formReference: 'Form 1040, Line 1',
    inputs: { w2Count: 2, totalWages: 5000000 },
    result: 5000000,
  })
  .addEntry({
    step: 'interest',
    description: 'Taxable interest',
    formReference: 'Form 1040, Line 2b',
    result: 10000,
  })
  .setSectionTotal(5010000);

const sections = builder.getSections();
```

## Federal Trace Sections

The `createFederalTrace` function generates traces with these sections:

| Section ID | Title | Form Reference | Contains |
|------------|-------|----------------|----------|
| `income` | Income | Form 1040, Lines 1-9 | W-2 wages, interest, dividends, capital gains, business income |
| `adjustments` | Adjustments to Income | Schedule 1, Part II | Educator expenses, HSA, IRA, student loan, SE health insurance |
| `agi` | Adjusted Gross Income | Form 1040, Line 11 | AGI calculation |
| `deductions` | Deductions | Form 1040, Line 12 | Standard vs itemized |
| `taxable_income` | Taxable Income | Form 1040, Line 15 | Taxable income |
| `tax` | Tax Calculation | Form 1040, Line 16 | Ordinary income tax, LTCG tax |
| `other_taxes` | Other Taxes | Schedule 2 | SE tax, AMT, NIIT |
| `credits` | Tax Credits | Form 1040, Lines 19-20 | CTC, EITC, education credits |
| `total_tax` | Total Tax | Form 1040, Line 24 | Final tax liability |
| `payments` | Payments | Form 1040, Lines 25-31 | Withholding, estimated payments |
| `refund_owe` | Refund or Amount Owed | Form 1040, Lines 34-37 | Final refund/owe |

## Export Formats

### JSON Export
```typescript
import { exportTraceToJSON } from './engine/trace';

const json = exportTraceToJSON(trace);
// Save to file or send to API
```

### Text Export
```typescript
import { exportTraceToText } from './engine/trace';

const text = exportTraceToText(trace);
console.log(text);
```

### Download to File
```typescript
import { downloadTrace } from './engine/trace/exporters';

// Download as text file
downloadTrace(trace, 'txt');

// Download as JSON
downloadTrace(trace, 'json');
```

## Use Cases

### 1. Professional Tax Review

```typescript
// Tax preparer reviews calculation before e-filing
const trace = createFederalTrace(input, result);

// Check for red flags
const hasUnusualDeductions = trace
  .find(s => s.id === 'deductions')
  ?.entries.some(e => e.result > 100000_00); // Over $100k

if (hasUnusualDeductions) {
  console.warn('Review: Large deduction detected');
}

// Export for client review
downloadTrace(trace, 'txt');
```

### 2. IRS Audit Support

```typescript
// Generate trace for audit defense
const trace = createFederalTrace(input, result);

// Find specific line items
const ctcSection = trace.find(s => s.id === 'credits');
const ctcEntry = ctcSection?.entries.find(e => e.step === 'ctc');

console.log('CTC Calculation:');
console.log(TraceFormatter.formatEntry(ctcEntry));
// Shows: qualifying children, MAGI, phaseout logic
```

### 3. Client Explanation

```typescript
// Show client where refund comes from
const refundSection = trace.find(s => s.id === 'refund_owe');
const refundEntry = refundSection?.entries[0];

console.log(`
Your refund breakdown:
- Total Tax: ${TraceFormatter.formatCurrency(refundEntry.inputs.totalTax)}
- Total Payments: ${TraceFormatter.formatCurrency(refundEntry.inputs.totalPayments)}
- Refund: ${TraceFormatter.formatCurrency(refundEntry.result)}
`);
```

### 4. Debugging Tax Calculations

```typescript
// Find why tax is higher than expected
const taxSection = trace.find(s => s.id === 'tax');

taxSection.entries.forEach(entry => {
  console.log(TraceFormatter.formatEntry(entry));
});

// Check if AMT applied
const amtSection = trace.find(s => s.id === 'other_taxes');
const amtEntry = amtSection?.entries.find(e => e.step === 'amt');
if (amtEntry && amtEntry.result > 0) {
  console.log('AMT applied:', TraceFormatter.formatCurrency(amtEntry.result));
}
```

## Advanced Features

### Custom Formatters

```typescript
// Create custom trace display
function formatForEmail(trace: CalculationTrace): string {
  let html = '<h2>Your Tax Summary</h2>';

  trace.federal.sections.forEach(section => {
    html += `<h3>${section.title}</h3><ul>`;
    section.entries.forEach(entry => {
      html += `<li>${entry.description}: ${entry.resultFormatted}</li>`;
    });
    html += '</ul>';
  });

  return html;
}
```

### Filtering Traces

```typescript
// Show only entries above threshold
function filterSignificantEntries(trace: TraceSection[], minAmount: number) {
  return trace.map(section => ({
    ...section,
    entries: section.entries.filter(e => e.result >= minAmount),
  })).filter(s => s.entries.length > 0);
}

const significant = filterSignificantEntries(trace, 1000_00); // $1,000+
```

### Trace Comparison

```typescript
// Compare two tax scenarios
function compareTraces(trace1: TraceSection[], trace2: TraceSection[]) {
  const differences = [];

  for (const section of trace1) {
    const section2 = trace2.find(s => s.id === section.id);
    if (!section2) continue;

    for (const entry of section.entries) {
      const entry2 = section2.entries.find(e => e.step === entry.step);
      if (entry2 && entry.result !== entry2.result) {
        differences.push({
          step: entry.step,
          description: entry.description,
          scenario1: entry.result,
          scenario2: entry2.result,
          difference: entry2.result - entry.result,
        });
      }
    }
  }

  return differences;
}
```

## Best Practices

1. **Always include form references** for professional use
2. **Add formulas** for complex calculations (phaseouts, limitations)
3. **Include input values** to show what went into each step
4. **Use citations** for special rules (e.g., TCJA changes)
5. **Format currency** consistently (use TraceFormatter)
6. **Group logically** - follow IRS form flow
7. **Add timestamps** for audit trail
8. **Mask PII** when exporting (use piiMasking utilities)

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { createFederalTrace } from './engine/trace/federalTrace';

it('should create trace with all required sections', () => {
  const trace = createFederalTrace(input, result);

  expect(trace.find(s => s.id === 'income')).toBeDefined();
  expect(trace.find(s => s.id === 'agi')).toBeDefined();
  expect(trace.find(s => s.id === 'taxable_income')).toBeDefined();
  expect(trace.find(s => s.id === 'total_tax')).toBeDefined();
});
```

## Future Enhancements

- [ ] PDF export with pdfmake integration
- [ ] State tax trace generation
- [ ] Trace diff/comparison UI
- [ ] Interactive trace explorer
- [ ] Automatic audit flag detection
- [ ] Multi-year trace comparison
- [ ] Tax law citation links

## Related Documentation

- [Security Guide](../README.md#security) - PII masking for traces
- [Engine Architecture](../src/engine/README.md) - Calculation flow
- [Federal Calculator](../src/engine/federal/2025/README.md) - Federal tax logic

---
*Last updated: 2025-11-21*
