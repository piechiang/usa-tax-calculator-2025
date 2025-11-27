# PDF Export Design Specification

## Overview

This document specifies the design for PDF export functionality, enabling users to generate professional tax summary reports.

## Goals

1. **Accountant-friendly reports**: Clean, professional format suitable for client records
2. **Privacy-first**: Generate PDFs client-side (no server upload)
3. **Comprehensive**: Include federal + state tax details, deductions, credits, payments
4. **Flexible**: Support multiple export formats (summary vs. detailed)
5. **Compliant**: Include necessary disclaimers and data sources

## Technology Selection

### Recommended: pdfmake (Client-side)

**Pros:**
- Pure client-side (no server required)
- Declarative document structure
- Good table support for tax schedules
- Small bundle size (~200KB)
- TypeScript support

**Cons:**
- Limited layout flexibility vs. HTML/CSS
- Custom fonts require embedding

**Alternative: jsPDF + autotable**
- More imperative API
- Good for simple documents
- Similar bundle size

**Not recommended: Puppeteer/Playwright**
- Requires Node.js backend
- Violates privacy-first principle
- Adds significant complexity

## Document Structure

### 1. Cover Page

```
USA TAX CALCULATOR 2025
TAX SUMMARY REPORT

Taxpayer: [First Name] [Last Name]
SSN: ***-**-[Last 4]
Filing Status: [Status]
Tax Year: 2025
State: [State]

Generated: [Date]
Disclaimer: This is an estimate, not an official tax return.
```

### 2. Executive Summary

```
┌─────────────────────────────────────────────────┐
│ TAX SUMMARY                                     │
├─────────────────────────────────────────────────┤
│ Total Income                    $XX,XXX         │
│ Adjusted Gross Income (AGI)     $XX,XXX         │
│ Taxable Income                  $XX,XXX         │
│                                                 │
│ Federal Tax                     $X,XXX          │
│ State Tax                       $X,XXX          │
│ Total Tax Liability             $X,XXX          │
│                                                 │
│ Total Payments                  $X,XXX          │
│ REFUND / AMOUNT OWED            $X,XXX          │
│                                                 │
│ Effective Tax Rate              XX.X%           │
└─────────────────────────────────────────────────┘
```

### 3. Income Detail

```
INCOME BREAKDOWN
─────────────────────────────────────────────────
Wages (W-2)                        $XX,XXX
Interest Income                    $X,XXX
Dividends                          $X,XXX
  ├─ Ordinary                      $X,XXX
  └─ Qualified                     $X,XXX
Capital Gains                      $X,XXX
  ├─ Short-term                    $X,XXX
  └─ Long-term                     $X,XXX
Business Income (Schedule C)       $X,XXX
Other Income                       $X,XXX
─────────────────────────────────────────────────
TOTAL INCOME                       $XX,XXX
```

### 4. Deductions & Adjustments

```
ADJUSTMENTS TO INCOME
─────────────────────────────────────────────────
Student Loan Interest              $X,XXX
IRA Contributions                  $X,XXX
HSA Contributions                  $X,XXX
Self-Employment Tax (½)            $X,XXX
─────────────────────────────────────────────────
TOTAL ADJUSTMENTS                  $X,XXX

ADJUSTED GROSS INCOME (AGI)        $XX,XXX

DEDUCTIONS
─────────────────────────────────────────────────
Standard Deduction                 $XX,XXX
  (OR Itemized Deductions)
  ├─ State/Local Taxes (SALT)      $X,XXX
  ├─ Mortgage Interest             $X,XXX
  ├─ Charitable Contributions      $X,XXX
  └─ Medical Expenses              $X,XXX
─────────────────────────────────────────────────
TAXABLE INCOME                     $XX,XXX
```

### 5. Tax Calculation

```
FEDERAL TAX CALCULATION
─────────────────────────────────────────────────
Regular Income Tax                 $X,XXX
  ├─ Ordinary income @ brackets    $X,XXX
  ├─ Qualified dividends @ 0%      $0
  ├─ Long-term gains @ 15%         $X,XXX
  └─ Long-term gains @ 20%         $X,XXX

Additional Taxes
  ├─ Self-Employment Tax           $X,XXX
  ├─ Net Investment Income Tax     $X,XXX
  └─ Additional Medicare Tax       $X,XXX
─────────────────────────────────────────────────
TOTAL TAX BEFORE CREDITS           $X,XXX

Tax Credits
  ├─ Child Tax Credit              ($X,XXX)
  ├─ Earned Income Credit          ($X,XXX)
  ├─ Education Credits             ($X,XXX)
  └─ Other Credits                 ($X,XXX)
─────────────────────────────────────────────────
FEDERAL TAX LIABILITY              $X,XXX
```

### 6. State Tax Section

```
[STATE NAME] TAX CALCULATION
─────────────────────────────────────────────────
State AGI                          $XX,XXX
State Deduction                    $XX,XXX
State Taxable Income               $XX,XXX

State Tax                          $X,XXX
Local Tax (County/City)            $X,XXX
State Credits                      ($X,XXX)
─────────────────────────────────────────────────
STATE TAX LIABILITY                $X,XXX
```

### 7. Payments & Balance

```
PAYMENTS AND WITHHOLDING
─────────────────────────────────────────────────
Federal Withholding                $X,XXX
State Withholding                  $X,XXX
Estimated Tax Payments             $X,XXX
Refundable Credits                 $X,XXX
─────────────────────────────────────────────────
TOTAL PAYMENTS                     $X,XXX

FINAL CALCULATION
─────────────────────────────────────────────────
Total Tax Liability                $X,XXX
Total Payments                     ($X,XXX)
─────────────────────────────────────────────────
REFUND / AMOUNT OWED               $X,XXX
═════════════════════════════════════════════════
```

### 8. Footer/Disclaimer

```
─────────────────────────────────────────────────
IMPORTANT DISCLAIMERS

This tax summary is an estimate generated by USA Tax Calculator 2025.
It is NOT an official tax return and cannot be used for e-filing.

This calculator is provided for informational purposes only and does
not constitute professional tax advice. Consult a licensed tax
professional for your specific situation.

Data Sources:
- IRS Rev. Proc. 2024-40 (2025 inflation adjustments)
- IRS Form 1040 and related schedules
- [State] Tax Authority official publications

Generated: [Timestamp]
Calculator Version: 1.0.0
```

## Implementation Architecture

### Phase 1: Report Builder

Create a `ReportBuilder` class that transforms calculation results into an intermediate format:

```typescript
// src/utils/reports/ReportBuilder.ts

interface ReportData {
  metadata: {
    taxpayerName: string;
    ssnLast4: string;
    filingStatus: string;
    taxYear: number;
    state: string;
    generatedDate: string;
  };
  summary: SummarySection;
  income: IncomeSection;
  deductions: DeductionSection;
  federalTax: FederalTaxSection;
  stateTax?: StateTaxSection;
  payments: PaymentsSection;
}

export class ReportBuilder {
  constructor(
    private federalResult: FederalResult2025,
    private stateResult: StateResult | null,
    private input: TaxPayerInput
  ) {}

  build(format: 'summary' | 'detailed'): ReportData {
    // Transform calculation results into report structure
  }
}
```

### Phase 2: PDF Renderer

Create PDF renderer using pdfmake:

```typescript
// src/utils/reports/PDFRenderer.ts

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export class PDFRenderer {
  render(reportData: ReportData): void {
    const docDefinition = this.buildDocDefinition(reportData);
    pdfMake.createPdf(docDefinition).download(this.generateFilename(reportData));
  }

  private buildDocDefinition(data: ReportData) {
    return {
      pageSize: 'LETTER',
      pageMargins: [60, 60, 60, 60],
      content: [
        this.renderCoverPage(data.metadata),
        this.renderSummary(data.summary),
        this.renderIncome(data.income),
        // ... other sections
      ],
      styles: this.getStyles(),
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      }
    };
  }

  private generateFilename(data: ReportData): string {
    const { taxpayerName, taxYear, state } = data.metadata;
    const sanitized = taxpayerName.replace(/[^a-zA-Z0-9]/g, '_');
    return `TaxSummary_${sanitized}_${state}_${taxYear}.pdf`;
  }
}
```

### Phase 3: UI Integration

Add export button to results page:

```typescript
// src/components/results/TaxResults.tsx

function TaxResults({ federalResult, stateResult, input }) {
  const handleExportPDF = () => {
    const reportBuilder = new ReportBuilder(federalResult, stateResult, input);
    const reportData = reportBuilder.build('detailed');
    const renderer = new PDFRenderer();
    renderer.render(reportData);
  };

  return (
    <div>
      {/* Existing results display */}
      <Button onClick={handleExportPDF} icon={<DownloadOutlined />}>
        Export PDF Summary
      </Button>
    </div>
  );
}
```

## Privacy & Security

### Data Handling

1. **Client-side only**: All PDF generation happens in browser
2. **No server upload**: PDFs never leave user's machine
3. **SSN masking**: Only show last 4 digits by default
4. **Optional full SSN**: Checkbox to include full SSN (default: OFF)

### User Controls

```typescript
interface ExportOptions {
  format: 'summary' | 'detailed';
  includeSensitiveData: boolean;  // SSN, bank info
  includeCalculationDetails: boolean;
  includeNotes: boolean;
}
```

## Styling & Branding

### Color Scheme

- Primary: #1890ff (Ant Design blue)
- Success (refund): #52c41a
- Error (owed): #ff4d4f
- Text: #262626
- Border: #d9d9d9

### Typography

- Headers: Bold, 14-16pt
- Body: Regular, 10pt
- Tables: 9pt
- Footnotes: 8pt

### Tables

Use consistent table styling:

```typescript
{
  table: {
    headerRows: 1,
    widths: ['*', 'auto'],
    body: [
      [{ text: 'Description', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }],
      ['Wages', formatCurrency(50000)],
      // ...
    ]
  },
  layout: {
    hLineWidth: (i) => (i === 0 || i === 1) ? 1 : 0.5,
    vLineWidth: () => 0,
    paddingLeft: () => 10,
    paddingRight: () => 10
  }
}
```

## Testing

### Unit Tests

```typescript
describe('ReportBuilder', () => {
  it('should build summary report with correct totals', () => {
    const builder = new ReportBuilder(mockFederal, mockState, mockInput);
    const report = builder.build('summary');
    expect(report.summary.totalTax).toBe(federalTax + stateTax);
  });
});
```

### Integration Tests

```typescript
describe('PDF Export', () => {
  it('should generate PDF without errors', () => {
    const builder = new ReportBuilder(mockFederal, null, mockInput);
    const report = builder.build('detailed');
    const renderer = new PDFRenderer();
    expect(() => renderer.render(report)).not.toThrow();
  });
});
```

### Visual Regression

- Capture PDF screenshots
- Compare against baseline
- Tools: pdf-to-image + pixelmatch

## Performance

### Bundle Size

- pdfmake: ~200KB gzipped
- Fonts: ~100KB (Roboto Regular + Bold)
- Total impact: ~300KB

### Optimization

1. **Lazy load**: Only import PDF library when export button clicked
2. **Code splitting**: Separate chunk for PDF export
3. **Font subsetting**: Include only ASCII characters

```typescript
// Lazy load PDF export
const ExportButton = () => {
  const handleExport = async () => {
    const { PDFRenderer } = await import('./utils/reports/PDFRenderer');
    // ... generate PDF
  };
};
```

## Future Enhancements

### Phase 2 Features

- [ ] Email PDF directly from app
- [ ] Save PDF to local file system API
- [ ] Print optimization (separate print CSS)
- [ ] Multi-year comparison reports
- [ ] Client batch export (for accountants)

### Phase 3 Features

- [ ] Custom branding (accountant logo/letterhead)
- [ ] Interactive PDFs (fillable fields)
- [ ] Attach supporting documents (W-2 scans, etc.)
- [ ] IRS Form 1040 generation (simplified)

## Rollout Plan

1. **Week 1**: Implement ReportBuilder and data transformation
2. **Week 2**: Implement PDFRenderer with basic styling
3. **Week 3**: Add UI integration and user controls
4. **Week 4**: Testing, refinement, and documentation
5. **Week 5**: Beta release with select users
6. **Week 6**: General availability

## References

- pdfmake documentation: http://pdfmake.org
- IRS Form 1040: https://www.irs.gov/pub/irs-pdf/f1040.pdf
- Tax document design best practices: Various CPA firm samples
