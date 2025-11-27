/**
 * Diagnostic Helper Functions
 *
 * Utilities for creating and managing structured diagnostics
 * during tax calculations.
 */

import type { FederalDiagnostics2025, FederalDiagnosticsMessage2025 } from '../types';
import type { DiagnosticCode } from './codes';
import { formatDiagnosticMessage, getSeverity } from './codes';

/**
 * Create a new diagnostics container
 */
export function createDiagnostics(): FederalDiagnostics2025 {
  return {
    warnings: [],
    errors: [],
  };
}

/**
 * Add a diagnostic message
 */
export function addDiagnostic(
  diagnostics: FederalDiagnostics2025,
  code: DiagnosticCode,
  context?: Record<string, unknown>,
  field?: string
): void {
  const message = formatDiagnosticMessage(code, context);
  const severity = getSeverity(code);

  // Info messages don't get added to diagnostics (just for informational purposes)
  if (severity === 'info') {
    return;
  }

  const diagnostic: FederalDiagnosticsMessage2025 = {
    code,
    message,
    field,
    severity, // Now guaranteed to be 'error' | 'warning'
    context,
  };

  if (severity === 'error') {
    diagnostics.errors.push(diagnostic);
  } else {
    diagnostics.warnings.push(diagnostic);
  }
}

/**
 * Add an error diagnostic (convenience method)
 */
export function addError(
  diagnostics: FederalDiagnostics2025,
  code: DiagnosticCode,
  context?: Record<string, unknown>,
  field?: string
): void {
  if (getSeverity(code) !== 'error') {
    throw new Error(`Code ${code} is not an error code`);
  }
  addDiagnostic(diagnostics, code, context, field);
}

/**
 * Add a warning diagnostic (convenience method)
 */
export function addWarning(
  diagnostics: FederalDiagnostics2025,
  code: DiagnosticCode,
  context?: Record<string, unknown>,
  field?: string
): void {
  if (getSeverity(code) !== 'warning') {
    throw new Error(`Code ${code} is not a warning code`);
  }
  addDiagnostic(diagnostics, code, context, field);
}

/**
 * Check if diagnostics contain any errors
 */
export function hasErrors(diagnostics: FederalDiagnostics2025): boolean {
  return diagnostics.errors.length > 0;
}

/**
 * Check if diagnostics contain any warnings
 */
export function hasWarnings(diagnostics: FederalDiagnostics2025): boolean {
  return diagnostics.warnings.length > 0;
}

/**
 * Get all diagnostic messages as a flat array
 */
export function getAllMessages(diagnostics: FederalDiagnostics2025): FederalDiagnosticsMessage2025[] {
  return [...diagnostics.errors, ...diagnostics.warnings];
}

/**
 * Get diagnostic messages by severity
 */
export function getMessagesBySeverity(
  diagnostics: FederalDiagnostics2025,
  severity: 'error' | 'warning'
): FederalDiagnosticsMessage2025[] {
  return severity === 'error' ? diagnostics.errors : diagnostics.warnings;
}

/**
 * Get diagnostic messages by category
 */
export function getMessagesByCategory(
  diagnostics: FederalDiagnostics2025,
  category: 'INPUT' | 'CALC' | 'CREDIT' | 'FORM'
): FederalDiagnosticsMessage2025[] {
  return getAllMessages(diagnostics).filter(msg => msg.code.startsWith(category));
}

/**
 * Format diagnostics for display
 */
export function formatDiagnostics(diagnostics: FederalDiagnostics2025): string {
  const lines: string[] = [];

  if (diagnostics.errors.length > 0) {
    lines.push('ERRORS:');
    diagnostics.errors.forEach(err => {
      lines.push(`  [${err.code}] ${err.message}`);
      if (err.field) lines.push(`    Field: ${err.field}`);
    });
  }

  if (diagnostics.warnings.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('WARNINGS:');
    diagnostics.warnings.forEach(warn => {
      lines.push(`  [${warn.code}] ${warn.message}`);
      if (warn.field) lines.push(`    Field: ${warn.field}`);
    });
  }

  return lines.join('\n');
}
