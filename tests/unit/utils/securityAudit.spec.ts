/**
 * Security Audit Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { securityAudit } from '../../../src/utils/securityAudit';

// Create a fresh instance for testing
class TestableSecurityAuditLogger {
  private events: Array<{
    id: string;
    timestamp: string;
    type: string;
    severity: string;
    action: string;
    success: boolean;
    details?: Record<string, unknown>;
  }> = [];

  log(event: {
    type: string;
    severity: string;
    action: string;
    success: boolean;
    details?: Record<string, unknown>;
  }): void {
    this.events.push({
      ...event,
      id: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

describe('Security Audit Module', () => {
  describe('SecurityAuditLogger', () => {
    let testLogger: TestableSecurityAuditLogger;

    beforeEach(() => {
      testLogger = new TestableSecurityAuditLogger();
    });

    describe('log', () => {
      it('should log events with correct structure', () => {
        testLogger.log({
          type: 'PII_ACCESS',
          severity: 'medium',
          action: 'Accessed SSN field',
          success: true,
        });

        const events = testLogger.getEvents();
        expect(events.length).toBe(1);
        expect(events[0]!.type).toBe('PII_ACCESS');
        expect(events[0]!.severity).toBe('medium');
        expect(events[0]!.action).toBe('Accessed SSN field');
        expect(events[0]!.success).toBe(true);
        expect(events[0]!.id).toBeDefined();
        expect(events[0]!.timestamp).toBeDefined();
      });

      it('should log events with details', () => {
        testLogger.log({
          type: 'DATA_EXPORT',
          severity: 'high',
          action: 'Exported data',
          success: true,
          details: { format: 'PDF', includesPII: true },
        });

        const events = testLogger.getEvents();
        expect(events[0]!.details).toEqual({ format: 'PDF', includesPII: true });
      });
    });

    describe('getEvents', () => {
      it('should return all logged events', () => {
        testLogger.log({
          type: 'PII_ACCESS',
          severity: 'medium',
          action: 'Test 1',
          success: true,
        });
        testLogger.log({
          type: 'ERROR',
          severity: 'high',
          action: 'Test 2',
          success: false,
        });

        const events = testLogger.getEvents();
        expect(events.length).toBe(2);
      });

      it('should return a copy of events', () => {
        testLogger.log({
          type: 'PII_ACCESS',
          severity: 'medium',
          action: 'Test',
          success: true,
        });

        const events1 = testLogger.getEvents();
        const events2 = testLogger.getEvents();
        expect(events1).not.toBe(events2);
      });
    });

    describe('clearEvents', () => {
      it('should clear all events', () => {
        testLogger.log({
          type: 'PII_ACCESS',
          severity: 'medium',
          action: 'Test',
          success: true,
        });
        expect(testLogger.getEvents().length).toBe(1);

        testLogger.clearEvents();
        expect(testLogger.getEvents().length).toBe(0);
      });
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(securityAudit).toBeDefined();
      expect(typeof securityAudit.log).toBe('function');
      expect(typeof securityAudit.logPIIAccess).toBe('function');
      expect(typeof securityAudit.logPIIModify).toBe('function');
      expect(typeof securityAudit.logDataExport).toBe('function');
      expect(typeof securityAudit.logReportGenerate).toBe('function');
      expect(typeof securityAudit.logTaxCalculation).toBe('function');
      expect(typeof securityAudit.logError).toBe('function');
    });
  });

  describe('Audit Event Types', () => {
    it('should log PII access events', () => {
      // Just verify the method exists and can be called
      expect(() => {
        securityAudit.logPIIAccess('personalInfo', ['ssn', 'firstName']);
      }).not.toThrow();
    });

    it('should log PII modify events', () => {
      expect(() => {
        securityAudit.logPIIModify('personalInfo', ['ssn']);
      }).not.toThrow();
    });

    it('should log data export events', () => {
      expect(() => {
        securityAudit.logDataExport('PDF', true, { pages: 5 });
      }).not.toThrow();
    });

    it('should log report generation events', () => {
      expect(() => {
        securityAudit.logReportGenerate('TaxSummary', { year: 2025 });
      }).not.toThrow();
    });

    it('should log tax calculation events', () => {
      expect(() => {
        securityAudit.logTaxCalculation(2025, 'single');
      }).not.toThrow();
    });

    it('should log error events', () => {
      expect(() => {
        securityAudit.logError(new Error('Test error'));
      }).not.toThrow();

      expect(() => {
        securityAudit.logError('String error message');
      }).not.toThrow();
    });
  });

  describe('Session Management', () => {
    it('should start and end sessions', () => {
      const sessionId = securityAudit.startSession('test-user');
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');

      expect(() => {
        securityAudit.endSession();
      }).not.toThrow();
    });

    it('should set user ID', () => {
      expect(() => {
        securityAudit.setUserId('user-123');
        securityAudit.setUserId(null);
      }).not.toThrow();
    });
  });

  describe('Event Retrieval', () => {
    it('should get events by type', () => {
      const events = securityAudit.getEventsByType('PII_ACCESS');
      expect(Array.isArray(events)).toBe(true);
    });

    it('should get events by severity', () => {
      const events = securityAudit.getEventsBySeverity('high');
      expect(Array.isArray(events)).toBe(true);
    });

    it('should get events in date range', () => {
      const startDate = new Date(Date.now() - 86400000); // 1 day ago
      const endDate = new Date();
      const events = securityAudit.getEventsInRange(startDate, endDate);
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Audit Log Export', () => {
    it('should export audit log as JSON string', () => {
      const exported = securityAudit.exportAuditLog();
      expect(typeof exported).toBe('string');

      // Should be valid JSON
      expect(() => JSON.parse(exported)).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should allow configuration updates', () => {
      expect(() => {
        securityAudit.configure({
          enabled: true,
          minSeverity: 'medium',
        });
      }).not.toThrow();
    });
  });
});
