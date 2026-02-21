/**
 * Security Audit Module
 *
 * Provides comprehensive logging and auditing for sensitive data operations.
 * Designed for compliance with tax data handling requirements.
 *
 * Features:
 * - Audit trail for PII access
 * - Session tracking
 * - Export/print logging
 * - Automatic PII redaction in logs
 * - Retention policy support
 */

import { logger } from './logger';
import { redactPII } from './piiMasking';

// ============================================================================
// Types
// ============================================================================

export type AuditEventType =
  | 'PII_ACCESS'
  | 'PII_MODIFY'
  | 'PII_EXPORT'
  | 'PII_PRINT'
  | 'PII_DELETE'
  | 'SESSION_START'
  | 'SESSION_END'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'DATA_IMPORT'
  | 'DATA_EXPORT'
  | 'REPORT_GENERATE'
  | 'TAX_CALCULATE'
  | 'ERROR';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  action: string;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditConfig {
  /** Enable/disable audit logging */
  enabled: boolean;
  /** Minimum severity to log */
  minSeverity: AuditSeverity;
  /** Automatically redact PII from details */
  redactPII: boolean;
  /** Maximum events to keep in memory */
  maxEvents: number;
  /** Callback for external audit system integration */
  onEvent?: (event: AuditEvent) => void;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: AuditConfig = {
  enabled: true,
  minSeverity: 'low',
  redactPII: true,
  maxEvents: 1000,
};

// ============================================================================
// Audit Logger Class
// ============================================================================

class SecurityAuditLogger {
  private config: AuditConfig;
  private events: AuditEvent[] = [];
  private sessionId: string | null = null;
  private userId: string | null = null;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start a new audit session
   */
  startSession(userId?: string): string {
    this.sessionId = this.generateId();
    this.userId = userId || null;

    this.log({
      type: 'SESSION_START',
      severity: 'low',
      action: 'Session started',
      success: true,
    });

    return this.sessionId;
  }

  /**
   * End the current audit session
   */
  endSession(): void {
    if (this.sessionId) {
      this.log({
        type: 'SESSION_END',
        severity: 'low',
        action: 'Session ended',
        success: true,
      });

      this.sessionId = null;
      this.userId = null;
    }
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp' | 'userId' | 'sessionId'>): void {
    if (!this.config.enabled) return;

    if (!this.shouldLog(event.severity)) return;

    const fullEvent: AuditEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      sessionId: this.sessionId || undefined,
      details:
        event.details && this.config.redactPII
          ? redactPII(event.details as Record<string, unknown>)
          : event.details,
    };

    // Store in memory
    this.events.push(fullEvent);

    // Trim if over limit
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }

    // Log to console/logger
    this.logToConsole(fullEvent);

    // Call external handler if configured
    if (this.config.onEvent) {
      try {
        this.config.onEvent(fullEvent);
      } catch (error) {
        logger.error('Audit event handler failed:', error instanceof Error ? error : undefined);
      }
    }
  }

  /**
   * Log PII access event
   */
  logPIIAccess(resource: string, fields: string[], details?: Record<string, unknown>): void {
    this.log({
      type: 'PII_ACCESS',
      severity: 'medium',
      action: `Accessed PII fields: ${fields.join(', ')}`,
      resource,
      details: {
        fields,
        ...details,
      },
      success: true,
    });
  }

  /**
   * Log PII modification event
   */
  logPIIModify(resource: string, fields: string[], details?: Record<string, unknown>): void {
    this.log({
      type: 'PII_MODIFY',
      severity: 'high',
      action: `Modified PII fields: ${fields.join(', ')}`,
      resource,
      details: {
        fields,
        ...details,
      },
      success: true,
    });
  }

  /**
   * Log data export event
   */
  logDataExport(format: string, includesPII: boolean, details?: Record<string, unknown>): void {
    this.log({
      type: 'DATA_EXPORT',
      severity: includesPII ? 'high' : 'medium',
      action: `Data exported as ${format}`,
      details: {
        format,
        includesPII,
        ...details,
      },
      success: true,
    });
  }

  /**
   * Log report generation event
   */
  logReportGenerate(reportType: string, details?: Record<string, unknown>): void {
    this.log({
      type: 'REPORT_GENERATE',
      severity: 'medium',
      action: `Generated ${reportType} report`,
      details: {
        reportType,
        ...details,
      },
      success: true,
    });
  }

  /**
   * Log tax calculation event
   */
  logTaxCalculation(
    taxYear: number,
    filingStatus: string,
    details?: Record<string, unknown>
  ): void {
    this.log({
      type: 'TAX_CALCULATE',
      severity: 'low',
      action: `Calculated taxes for ${taxYear}`,
      details: {
        taxYear,
        filingStatus,
        ...details,
      },
      success: true,
    });
  }

  /**
   * Log error event
   */
  logError(error: Error | string, context?: Record<string, unknown>): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.log({
      type: 'ERROR',
      severity: 'high',
      action: 'Error occurred',
      details: {
        error: errorMessage,
        stack: errorStack,
        ...context,
      },
      success: false,
      errorMessage,
    });
  }

  /**
   * Get all audit events
   */
  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AuditEventType): AuditEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: AuditSeverity): AuditEvent[] {
    return this.events.filter((e) => e.severity === severity);
  }

  /**
   * Get events in date range
   */
  getEventsInRange(startDate: Date, endDate: Date): AuditEvent[] {
    const start = startDate.getTime();
    const end = endDate.getTime();

    return this.events.filter((e) => {
      const eventTime = new Date(e.timestamp).getTime();
      return eventTime >= start && eventTime <= end;
    });
  }

  /**
   * Clear all events (use with caution)
   */
  clearEvents(): void {
    this.log({
      type: 'PII_DELETE',
      severity: 'critical',
      action: 'Audit log cleared',
      success: true,
    });
    this.events = [];
  }

  /**
   * Export audit log for compliance
   */
  exportAuditLog(): string {
    this.log({
      type: 'DATA_EXPORT',
      severity: 'high',
      action: 'Audit log exported',
      success: true,
    });

    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Update configuration
   */
  configure(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Private methods

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private shouldLog(severity: AuditSeverity): boolean {
    const severityOrder: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];
    const minIndex = severityOrder.indexOf(this.config.minSeverity);
    const eventIndex = severityOrder.indexOf(severity);
    return eventIndex >= minIndex;
  }

  private logToConsole(event: AuditEvent): void {
    const prefix = `[AUDIT:${event.type}]`;
    const message = `${prefix} ${event.action}`;

    switch (event.severity) {
      case 'critical':
      case 'high':
        logger.warn(message, event as unknown as Record<string, unknown>);
        break;
      case 'medium':
        logger.info(message);
        break;
      case 'low':
      default:
        logger.debug(message);
        break;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const securityAudit = new SecurityAuditLogger();

// ============================================================================
// React Hook for Audit Logging
// ============================================================================

/**
 * Hook to access security audit logger
 * Usage: const audit = useSecurityAudit();
 */
export const useSecurityAudit = () => securityAudit;

// ============================================================================
// Decorator for Auditing Class Methods
// ============================================================================

/**
 * Method decorator to automatically audit PII access
 * Usage: @auditPIIAccess('resource-name', ['field1', 'field2'])
 */
export function auditPIIAccess(resource: string, fields: string[]) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      securityAudit.logPIIAccess(resource, fields);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Method decorator to automatically audit PII modification
 * Usage: @auditPIIModify('resource-name', ['field1', 'field2'])
 */
export function auditPIIModify(resource: string, fields: string[]) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const result = originalMethod.apply(this, args);
      securityAudit.logPIIModify(resource, fields);
      return result;
    };

    return descriptor;
  };
}
