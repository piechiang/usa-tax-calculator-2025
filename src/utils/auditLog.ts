/**
 * Audit Logging for PII Access
 *
 * Provides audit trail for client data access operations.
 * Essential for compliance with data protection requirements.
 *
 * @module auditLog
 */

const AUDIT_LOG_KEY = 'utc:audit:log';
const MAX_LOG_ENTRIES = 1000;

export enum AuditAction {
  // Client operations
  LIST_CLIENTS = 'LIST_CLIENTS',
  LOAD_CLIENT = 'LOAD_CLIENT',
  SAVE_CLIENT = 'SAVE_CLIENT',
  DELETE_CLIENT = 'DELETE_CLIENT',
  MIGRATE_CLIENT = 'MIGRATE_CLIENT',

  // Encryption operations
  ENCRYPT_DATA = 'ENCRYPT_DATA',
  DECRYPT_DATA = 'DECRYPT_DATA',
  SET_ENCRYPTION_KEY = 'SET_ENCRYPTION_KEY',
  CLEAR_ENCRYPTION_KEY = 'CLEAR_ENCRYPTION_KEY',

  // Export operations
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA',

  // View operations
  VIEW_SSN = 'VIEW_SSN',
  VIEW_PII = 'VIEW_PII',

  // Error operations
  ACCESS_DENIED = 'ACCESS_DENIED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
}

export interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  details?: Record<string, unknown>;
  sessionId?: string;
  userAgent?: string;
}

/**
 * Generate a session ID for tracking operations within a browser session
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('utc:audit:sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('utc:audit:sessionId', sessionId);
  }
  return sessionId;
}

/**
 * Read the audit log from storage
 */
function readAuditLog(): AuditLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Write the audit log to storage
 */
function writeAuditLog(entries: AuditLogEntry[]): void {
  // Keep only the most recent entries
  const trimmed = entries.slice(-MAX_LOG_ENTRIES);
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed));
}

/**
 * Log an audit event
 *
 * @param action - The action being performed
 * @param details - Additional details about the action
 *
 * @example
 * ```typescript
 * auditLog(AuditAction.LOAD_CLIENT, { clientId: '123', decrypted: true });
 * ```
 */
export function auditLog(
  action: AuditAction,
  details?: Record<string, unknown>
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    details: sanitizeDetails(details),
    sessionId: getSessionId(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  const log = readAuditLog();
  log.push(entry);
  writeAuditLog(log);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Audit]', action, details);
  }
}

/**
 * Sanitize details to ensure no PII is logged
 */
function sanitizeDetails(
  details: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!details) return undefined;

  const sanitized: Record<string, unknown> = {};

  for (const key in details) {
    const value = details[key];
    const lowerKey = key.toLowerCase();

    // Never log actual SSNs or sensitive data
    if (
      lowerKey.includes('ssn') ||
      lowerKey.includes('password') ||
      lowerKey.includes('key') ||
      lowerKey.includes('secret')
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 100) {
      // Truncate long strings
      sanitized[key] = value.substring(0, 100) + '...';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Get the audit log entries
 *
 * @param options - Filter options
 * @returns Filtered audit log entries
 */
export function getAuditLog(options?: {
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
  limit?: number;
}): AuditLogEntry[] {
  let entries = readAuditLog();

  if (options?.action) {
    entries = entries.filter((e) => e.action === options.action);
  }

  if (options?.startDate) {
    const start = options.startDate.toISOString();
    entries = entries.filter((e) => e.timestamp >= start);
  }

  if (options?.endDate) {
    const end = options.endDate.toISOString();
    entries = entries.filter((e) => e.timestamp <= end);
  }

  if (options?.clientId) {
    entries = entries.filter(
      (e) => e.details?.clientId === options.clientId
    );
  }

  if (options?.limit) {
    entries = entries.slice(-options.limit);
  }

  // Log that audit log was accessed
  auditLog(AuditAction.VIEW_PII, { type: 'audit_log_access', count: entries.length });

  return entries;
}

/**
 * Clear old audit log entries
 *
 * @param olderThanDays - Remove entries older than this many days
 */
export function clearOldAuditEntries(olderThanDays: number = 90): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  const cutoffStr = cutoff.toISOString();

  const entries = readAuditLog();
  const filtered = entries.filter((e) => e.timestamp >= cutoffStr);

  const removed = entries.length - filtered.length;
  writeAuditLog(filtered);

  return removed;
}

/**
 * Export audit log for compliance review
 */
export function exportAuditLog(): string {
  const entries = readAuditLog();
  auditLog(AuditAction.EXPORT_DATA, { type: 'audit_log', entries: entries.length });
  return JSON.stringify(entries, null, 2);
}

/**
 * Get statistics about data access
 */
export function getAccessStatistics(): {
  totalAccesses: number;
  byAction: Record<string, number>;
  recentAccesses: AuditLogEntry[];
} {
  const entries = readAuditLog();

  const byAction: Record<string, number> = {};
  for (const entry of entries) {
    byAction[entry.action] = (byAction[entry.action] || 0) + 1;
  }

  return {
    totalAccesses: entries.length,
    byAction,
    recentAccesses: entries.slice(-10),
  };
}
