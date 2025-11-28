/**
 * Error Logging Utility
 *
 * Centralized error logging for the application.
 * Can be extended to send errors to external services (Sentry, LogRocket, etc.)
 */

import type { ErrorInfo } from 'react';

export interface ErrorLog {
  timestamp: Date;
  error: Error;
  errorInfo?: ErrorInfo;
  context?: Record<string, unknown>;
  userAgent: string;
  url: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private readonly MAX_LOGS = 50;

  /**
   * Log an error
   */
  log(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      error,
      errorInfo,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to in-memory logs
    this.logs.push(errorLog);

    // Keep only the last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Logged');
      console.error('Error:', error);
      if (errorInfo) {
        console.error('Component Stack:', errorInfo.componentStack);
      }
      if (context) {
        console.log('Context:', context);
      }
      console.groupEnd();
    }

    // In production, you could send to an error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo, ...context } });
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get error summary for debugging
   */
  getSummary(): string {
    return this.logs
      .map(log => `[${log.timestamp.toISOString()}] ${log.error.message}`)
      .join('\n');
  }

  /**
   * Download error logs as JSON file
   */
  downloadLogs(): void {
    const data = JSON.stringify(
      this.logs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        message: log.error.message,
        stack: log.error.stack,
        componentStack: log.errorInfo?.componentStack,
        context: log.context,
        userAgent: log.userAgent,
        url: log.url
      })),
      null,
      2
    );

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Global error handler for unhandled errors
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.log(event.error || new Error(event.message), undefined, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      undefined,
      { type: 'unhandledRejection' }
    );
  });
}
