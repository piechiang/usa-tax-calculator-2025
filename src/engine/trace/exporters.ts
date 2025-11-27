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
export function exportTraceToPDF(trace: CalculationTrace): Uint8Array {
  throw new Error('PDF export not yet implemented. Use exportTraceToText() or exportTraceToJSON() instead.');
}

/**
 * Export trace to downloadable file
 */
export function downloadTrace(trace: CalculationTrace, format: 'json' | 'txt' = 'txt'): void {
  const content = format === 'json' ? exportTraceToJSON(trace) : exportTraceToText(trace);
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `tax-trace-${trace.metadata.taxYear}-${trace.metadata.taxpayerId || 'unknown'}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
