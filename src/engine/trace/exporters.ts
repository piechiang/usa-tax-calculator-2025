/**
 * Trace Export Utilities
 *
 * Export calculation traces to various formats for audit and review
 */

import type { CalculationTrace } from './types';
import { TraceFormatter } from './types';

/**
 * Export trace to JSON string
 */
export function exportTraceToJSON(trace: CalculationTrace): string {
  return JSON.stringify(trace, null, 2);
}

/**
 * Export trace to plain text format
 */
export function exportTraceToText(trace: CalculationTrace): string {
  return TraceFormatter.formatTrace(trace);
}

/**
 * Export trace to PDF (placeholder for future implementation)
 *
 * TODO: Integrate with pdfmake to generate professional PDF reports
 */
export function exportTraceToPDF(_trace: CalculationTrace): Uint8Array {
  throw new Error(
    'PDF export not yet implemented. Use exportTraceToText() or exportTraceToJSON() instead.'
  );
}

/**
 * Export trace to downloadable file (browser environments only).
 * Accesses DOM APIs via globalThis to remain compatible with non-browser builds.
 */
export function downloadTrace(trace: CalculationTrace, format: 'json' | 'txt' = 'txt'): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (typeof g.document === 'undefined' || typeof g.Blob === 'undefined') {
    throw new Error('downloadTrace() requires a browser environment');
  }

  const content = format === 'json' ? exportTraceToJSON(trace) : exportTraceToText(trace);
  const blob = new g.Blob([content], {
    type: format === 'json' ? 'application/json' : 'text/plain',
  }) as { size: number };
  const url = (g.URL.createObjectURL as (b: typeof blob) => string)(blob);

  const a = g.document.createElement('a') as { href: string; download: string; click(): void };
  a.href = url;
  a.download = `tax-trace-${trace.metadata.taxYear}-${trace.metadata.taxpayerId || 'unknown'}.${format}`;
  g.document.body.appendChild(a);
  a.click();
  g.document.body.removeChild(a);
  (g.URL.revokeObjectURL as (url: string) => void)(url);
}
