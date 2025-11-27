/**
 * Calculation Trace Types
 *
 * Provides detailed audit trail for tax calculations, enabling:
 * - IRS worksheet reconciliation
 * - Professional review/sign-off
 * - Client explanation
 * - Compliance documentation
 */

/**
 * Trace entry for a single calculation step
 */
export interface TraceEntry {
  /** Unique step identifier (e.g., "agi", "standard_deduction", "line_12a") */
  step: string;

  /** Human-readable description */
  description: string;

  /** IRS form/line reference (e.g., "Form 1040, Line 11") */
  formReference?: string;

  /** Calculation formula or logic */
  formula?: string;

  /** Input values used */
  inputs?: Record<string, number | string | boolean>;

  /** Intermediate calculations */
  intermediates?: Record<string, number>;

  /** Final result (in cents) */
  result: number;

  /** Result formatted for display */
  resultFormatted?: string;

  /** Related regulation/law citation */
  citation?: string;

  /** Timestamp of calculation */
  timestamp: string;
}

/**
 * Trace section grouping related calculations
 */
export interface TraceSection {
  /** Section identifier (e.g., "income", "deductions", "credits") */
  id: string;

  /** Section title */
  title: string;

  /** IRS form/schedule reference */
  formReference?: string;

  /** Ordered trace entries in this section */
  entries: TraceEntry[];

  /** Total or summary value for section */
  total?: number;
}

/**
 * Complete calculation trace for a tax return
 */
export interface CalculationTrace {
  /** Trace metadata */
  metadata: {
    /** Tax year */
    taxYear: number;

    /** Calculation timestamp */
    calculatedAt: string;

    /** Engine version */
    engineVersion: string;

    /** Taxpayer identifier (masked) */
    taxpayerId?: string;

    /** Filing status */
    filingStatus: string;
  };

  /** Federal calculation trace */
  federal: {
    /** All sections in calculation order */
    sections: TraceSection[];

    /** Summary totals */
    summary: {
      agi: number;
      taxableIncome: number;
      totalTax: number;
      totalPayments: number;
      refundOrOwe: number;
    };
  };

  /** State calculation trace (if applicable) */
  state?: {
    /** State code */
    stateCode: string;

    /** State sections */
    sections: TraceSection[];

    /** State summary */
    summary: {
      stateAGI: number;
      stateTaxableIncome: number;
      stateTax: number;
      stateRefundOrOwe: number;
    };
  };

  /** Diagnostics and warnings */
  diagnostics: Array<{
    code: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    step?: string;
  }>;
}

/**
 * Trace builder for constructing calculation traces
 */
export class TraceBuilder {
  private sections: TraceSection[] = [];
  private currentSection: TraceSection | null = null;

  /**
   * Start a new trace section
   */
  startSection(id: string, title: string, formReference?: string): this {
    this.currentSection = {
      id,
      title,
      formReference,
      entries: [],
    };
    this.sections.push(this.currentSection);
    return this;
  }

  /**
   * Add a trace entry to the current section
   */
  addEntry(entry: Omit<TraceEntry, 'timestamp'>): this {
    if (!this.currentSection) {
      throw new Error('No active section. Call startSection() first.');
    }

    this.currentSection.entries.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });

    return this;
  }

  /**
   * Set the total for the current section
   */
  setSectionTotal(total: number): this {
    if (!this.currentSection) {
      throw new Error('No active section.');
    }
    this.currentSection.total = total;
    return this;
  }

  /**
   * Get all sections
   */
  getSections(): TraceSection[] {
    return this.sections;
  }

  /**
   * Clear all sections
   */
  clear(): this {
    this.sections = [];
    this.currentSection = null;
    return this;
  }
}

/**
 * Formatting utilities for trace display
 */
export class TraceFormatter {
  /**
   * Format currency in cents to dollars
   */
  static formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  }

  /**
   * Format percentage (decimal to %)
   */
  static formatPercent(decimal: number): string {
    return `${(decimal * 100).toFixed(2)}%`;
  }

  /**
   * Format trace entry for console output
   */
  static formatEntry(entry: TraceEntry, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let output = `${spaces}${entry.description}\n`;

    if (entry.formReference) {
      output += `${spaces}  └─ ${entry.formReference}\n`;
    }

    if (entry.formula) {
      output += `${spaces}  └─ Formula: ${entry.formula}\n`;
    }

    if (entry.inputs) {
      output += `${spaces}  └─ Inputs:\n`;
      for (const [key, value] of Object.entries(entry.inputs)) {
        output += `${spaces}     • ${key}: ${value}\n`;
      }
    }

    output += `${spaces}  └─ Result: ${entry.resultFormatted || TraceFormatter.formatCurrency(entry.result)}\n`;

    return output;
  }

  /**
   * Format entire trace section
   */
  static formatSection(section: TraceSection): string {
    let output = `\n${section.title}`;
    if (section.formReference) {
      output += ` (${section.formReference})`;
    }
    output += '\n' + '='.repeat(60) + '\n';

    for (const entry of section.entries) {
      output += TraceFormatter.formatEntry(entry, 1);
    }

    if (section.total !== undefined) {
      output += `\n  Total: ${TraceFormatter.formatCurrency(section.total)}\n`;
    }

    return output;
  }

  /**
   * Format complete calculation trace
   */
  static formatTrace(trace: CalculationTrace): string {
    let output = `
TAX CALCULATION TRACE
Tax Year: ${trace.metadata.taxYear}
Filing Status: ${trace.metadata.filingStatus}
Calculated: ${trace.metadata.calculatedAt}
Engine: ${trace.metadata.engineVersion}
${'='.repeat(60)}
`;

    // Federal sections
    output += '\nFEDERAL INCOME TAX\n';
    for (const section of trace.federal.sections) {
      output += TraceFormatter.formatSection(section);
    }

    // Federal summary
    output += `
FEDERAL SUMMARY
${'='.repeat(60)}
AGI:                ${TraceFormatter.formatCurrency(trace.federal.summary.agi)}
Taxable Income:     ${TraceFormatter.formatCurrency(trace.federal.summary.taxableIncome)}
Total Tax:          ${TraceFormatter.formatCurrency(trace.federal.summary.totalTax)}
Total Payments:     ${TraceFormatter.formatCurrency(trace.federal.summary.totalPayments)}
Refund/Owe:         ${TraceFormatter.formatCurrency(trace.federal.summary.refundOrOwe)}
`;

    // State sections (if any)
    if (trace.state) {
      output += `\n\nSTATE INCOME TAX (${trace.state.stateCode})\n`;
      for (const section of trace.state.sections) {
        output += TraceFormatter.formatSection(section);
      }

      output += `
STATE SUMMARY (${trace.state.stateCode})
${'='.repeat(60)}
State AGI:          ${TraceFormatter.formatCurrency(trace.state.summary.stateAGI)}
Taxable Income:     ${TraceFormatter.formatCurrency(trace.state.summary.stateTaxableIncome)}
State Tax:          ${TraceFormatter.formatCurrency(trace.state.summary.stateTax)}
Refund/Owe:         ${TraceFormatter.formatCurrency(trace.state.summary.stateRefundOrOwe)}
`;
    }

    // Diagnostics
    if (trace.diagnostics.length > 0) {
      output += `\nDIAGNOSTICS\n${'='.repeat(60)}\n`;
      for (const diag of trace.diagnostics) {
        const icon = diag.severity === 'error' ? '❌' : diag.severity === 'warning' ? '⚠️' : 'ℹ️';
        output += `${icon} [${diag.code}] ${diag.message}\n`;
      }
    }

    return output;
  }
}
