import type { FilingStatus } from '../../engine/types';

export type ReportMode = 'summary' | 'detailed';

export interface ReportMetadata {
  taxpayerName: string;
  filingStatus: FilingStatus;
  ssnLast4?: string;
  state?: string;
  taxYear: number;
  generatedAt: string;
}

export interface ReportSummary {
  adjustedGrossIncome: number;
  taxableIncome: number;
  totalTax: number;
  totalPayments: number;
  refundOrOwe: number;
}

export interface ReportRow {
  label: string;
  value: number | string;
  format?: 'currency' | 'text' | 'percent';
  footnote?: string;
}

export interface ReportSection {
  title: string;
  rows: ReportRow[];
  pageBreakBefore?: boolean;
}

export interface ReportData {
  mode: ReportMode;
  metadata: ReportMetadata;
  summary: ReportSummary;
  sections: ReportSection[];
}

/**
 * PDF Export Security Options
 * Controls privacy and security features for PDF generation
 */
export interface PDFSecurityOptions {
  /** Add watermark text to each page (e.g., 'DRAFT', 'CONFIDENTIAL') */
  watermark?: string | null;
  /** Watermark opacity (0-1, default 0.1) */
  watermarkOpacity?: number;
  /** Mask SSN to show only last 4 digits (default: true) */
  maskSSN?: boolean;
  /** Include client personal data in export (default: false for privacy) */
  includeClientData?: boolean;
  /** Password to open the PDF (requires pdfmake-wrapper or server-side) */
  userPassword?: string;
  /** Password for editing/printing restrictions */
  ownerPassword?: string;
  /** Allow printing (default: true) */
  allowPrinting?: boolean;
  /** Allow copying text (default: false for security) */
  allowCopying?: boolean;
}

/**
 * Default security options - privacy-first defaults
 */
export const DEFAULT_PDF_SECURITY: PDFSecurityOptions = {
  watermark: null,
  watermarkOpacity: 0.1,
  maskSSN: true,
  includeClientData: false,
  allowPrinting: true,
  allowCopying: false,
};
