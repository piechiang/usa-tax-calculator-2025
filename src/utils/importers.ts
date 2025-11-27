// Simple CSV utilities for W-2 and 1099-B summaries

export interface W2Row {
  wages?: number; // box 1
  federalWithholding?: number; // box 2
  stateWithholding?: number; // box 17
}

export interface B1099SummaryRow {
  proceeds?: number;
  costBasis?: number;
  term?: 'short' | 'long';
}

const parseNumber = (s: string) => {
  const n = Number(String(s).replace(/[$,]/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

export function importW2CSV(csv: string): W2Row[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const firstLine = lines[0];
  if (!firstLine) return [];
  const header = firstLine.toLowerCase();
  const hasHeader = /wage|box\s*1|federal|withholding|box\s*2/.test(header);
  const rows = (hasHeader ? lines.slice(1) : lines).map((l) => l.split(',').map((c) => c.trim()));
  return rows.map((cols) => ({
    wages: parseNumber(cols[0] || '0'),
    federalWithholding: parseNumber(cols[1] || '0'),
    stateWithholding: parseNumber(cols[2] || '0')
  }));
}

export function import1099BSummaryCSV(csv: string): B1099SummaryRow[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const firstLine = lines[0];
  if (!firstLine) return [];
  const header = firstLine.toLowerCase();
  const hasHeader = /proceeds|basis|term|short|long/.test(header);
  const rows = (hasHeader ? lines.slice(1) : lines).map((l) => l.split(',').map((c) => c.trim()));
  return rows.map((cols) => ({
    proceeds: parseNumber(cols[0] || '0'),
    costBasis: parseNumber(cols[1] || '0'),
    term: (String(cols[2] || '').toLowerCase().startsWith('s') ? 'short' : 'long')
  }));
}

