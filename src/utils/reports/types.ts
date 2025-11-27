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
