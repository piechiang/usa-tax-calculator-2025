import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { ReportData, ReportRow, ReportSection } from './types';

type PdfMakeModule = typeof import('pdfmake/build/pdfmake');

interface RenderOptions {
  downloadFileName?: string;
  openInNewTab?: boolean;
  pdfMake?: PdfMakeModule;
}

export class PDFRenderer {
  private currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  toDocumentDefinition(report: ReportData): TDocumentDefinitions {
    const generatedDate = new Date(report.metadata.generatedAt);

    return {
      info: {
        title: `${report.metadata.taxYear} Tax Summary`,
        subject: 'Tax Summary Report',
        author: 'USA Tax Calculator 2025'
      },
      content: this.buildContent(report, generatedDate),
      styles: {
        header: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 10, color: '#666666' },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 12, 0, 6] },
        tableHeader: { bold: true, fillColor: '#f3f4f6' },
        labelCell: { margin: [0, 2, 8, 2] },
        valueCell: { margin: [0, 2, 0, 2], alignment: 'right' },
        notesCell: { italics: true, color: '#444444', alignment: 'left' }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  async render(report: ReportData, options: RenderOptions = {}): Promise<unknown> {
    const pdfMake = options.pdfMake ?? await this.loadPdfMake();
    const docDefinition = this.toDocumentDefinition(report);
    const pdfDoc = pdfMake.createPdf(docDefinition);

    if (options.downloadFileName) {
      pdfDoc.download(options.downloadFileName);
    } else if (options.openInNewTab) {
      pdfDoc.open();
    }

    return pdfDoc;
  }

  private buildContent(report: ReportData, generatedDate: Date): Content[] {
    const content: Content[] = [
      { text: `${report.metadata.taxYear} Tax Summary`, style: 'header' },
      {
        text: `Generated on ${generatedDate.toLocaleString()}`,
        style: 'subheader',
        margin: [0, 0, 0, 16]
      },
      this.buildMetadataTable(report) as Content,
      { text: 'Summary', style: 'sectionHeader' },
      this.buildSummaryTable(report) as Content
    ];

    for (const section of report.sections) {
      if (section.pageBreakBefore) {
        content.push({ text: '', pageBreak: 'before' } as Content);
      }
      content.push({ text: section.title, style: 'sectionHeader' });
      content.push(this.buildSectionTable(section) as Content);
    }

    return content;
  }

  private buildMetadataTable(report: ReportData) {
    const metadataRows: Array<[unknown, unknown]> = [
      [{ text: 'Taxpayer', style: 'tableHeader' }, { text: report.metadata.taxpayerName }],
      [{ text: 'Filing Status', style: 'tableHeader' }, { text: this.formatFilingStatus(report.metadata.filingStatus) }],
      [
        { text: 'Tax Year', style: 'tableHeader' },
        { text: String(report.metadata.taxYear) }
      ]
    ];

    if (report.metadata.state) {
      metadataRows.push([{ text: 'State', style: 'tableHeader' }, { text: report.metadata.state }]);
    }

    if (report.metadata.ssnLast4) {
      metadataRows.push([{ text: 'SSN (Last 4)', style: 'tableHeader' }, { text: report.metadata.ssnLast4 }]);
    }

    return {
      style: 'metadataTable',
      table: {
        widths: ['*', '*'],
        body: metadataRows
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    };
  }

  private buildSummaryTable(report: ReportData) {
    const rows: Array<[unknown, unknown]> = [
      [{ text: 'Adjusted Gross Income', style: 'labelCell' }, { text: this.formatCurrency(report.summary.adjustedGrossIncome), style: 'valueCell' }],
      [{ text: 'Taxable Income', style: 'labelCell' }, { text: this.formatCurrency(report.summary.taxableIncome), style: 'valueCell' }],
      [{ text: 'Total Tax', style: 'labelCell' }, { text: this.formatCurrency(report.summary.totalTax), style: 'valueCell' }],
      [{ text: 'Total Payments', style: 'labelCell' }, { text: this.formatCurrency(report.summary.totalPayments), style: 'valueCell' }],
      [{ text: 'Refund / Balance Due', style: 'labelCell' }, { text: this.formatCurrency(report.summary.refundOrOwe), style: 'valueCell' }]
    ];

    return {
      table: {
        widths: ['*', 'auto'],
        body: rows
      },
      layout: 'lightHorizontalLines'
    };
  }

  private buildSectionTable(section: ReportSection) {
    const rows = section.rows.map(row => {
      if (row.format === 'text') {
        const value = typeof row.value === 'string' ? row.value : String(row.value ?? '');
        return [
          { text: row.label, style: 'labelCell' },
          { text: value, style: 'notesCell', alignment: 'left' }
        ];
      }

      return [
        { text: row.label, style: 'labelCell' },
        this.buildValueCell(row)
      ];
    });

    if (!rows.length) {
      rows.push([{ text: 'No data available', colSpan: 2, alignment: 'center', margin: [0, 4, 0, 4] }, {}]);
    }

    return {
      table: {
        widths: ['*', 'auto'],
        body: rows
      },
      layout: 'lightHorizontalLines'
    };
  }

  private formatRowValue(row: ReportRow): string {
    if (row.format === 'currency' && typeof row.value === 'number') {
      return this.formatCurrency(row.value);
    }

    if (row.format === 'percent' && typeof row.value === 'number') {
      return `${(row.value * 100).toFixed(2)}%`;
    }

    return String(row.value ?? '');
  }

  private formatCurrency(cents: number): string {
    return this.currencyFormatter.format((cents || 0) / 100);
  }

  private buildValueCell(row: ReportRow) {
    const baseValue = this.formatRowValue(row);

    if (row.footnote) {
      return {
        style: 'valueCell',
        stack: [
          { text: baseValue, alignment: 'right' },
          { text: row.footnote, style: 'notesCell', margin: [0, 2, 0, 0], alignment: 'left' }
        ]
      };
    }

    const cell: Record<string, unknown> = {
      text: baseValue,
      style: 'valueCell'
    };

    if (row.format === 'percent') {
      cell.alignment = 'right';
    }

    return cell;
  }

  private formatFilingStatus(status: string): string {
    switch (status) {
      case 'single':
        return 'Single';
      case 'marriedJointly':
        return 'Married Filing Jointly';
      case 'marriedSeparately':
        return 'Married Filing Separately';
      case 'headOfHousehold':
        return 'Head of Household';
      default:
        return status;
    }
  }

  private async loadPdfMake(): Promise<PdfMakeModule> {
    const [pdfMakeModule, pdfFonts] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts')
    ]);

    const pdfMake = (pdfMakeModule as unknown as { default?: PdfMakeModule }).default ?? (pdfMakeModule as PdfMakeModule);
    const { pdfMake: fontsWrapper } = pdfFonts as unknown as { pdfMake: { vfs: Record<string, string> } };
    pdfMake.vfs = fontsWrapper.vfs;
    return pdfMake;
  }
}
