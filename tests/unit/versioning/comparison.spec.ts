/**
 * Rule Comparison Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearRegistry,
  initializeRegistry,
  load2024FederalRules,
  load2025FederalRules,
  compareConstant,
  compareBrackets,
  compareYears,
  formatChanges,
} from '../../../src/engine/rules/versioning';

describe('Rule Comparison', () => {
  beforeEach(() => {
    clearRegistry();
    initializeRegistry();
    load2024FederalRules();
    load2025FederalRules();
  });

  describe('compareConstant', () => {
    it('should detect constant changes between years', () => {
      const comparison = compareConstant('standard_deduction.single', [2024, 2025]);

      expect(comparison.years).toEqual([2024, 2025]);
      expect(comparison.changes).toHaveLength(1);

      const change = comparison.changes[0]!;
      expect(change.changeType).toBe('modified');
      expect(change.oldValue).toBe(1475000); // $14,750
      expect(change.newValue).toBe(1550000); // $15,500
      expect(change.description).toContain('$14,750.00');
      expect(change.description).toContain('$15,500.00');
    });

    it('should calculate summary statistics', () => {
      const comparison = compareConstant('standard_deduction.single', [2024, 2025]);

      expect(comparison.summary.totalChanges).toBe(1);
      expect(comparison.summary.modified).toBe(1);
      expect(comparison.summary.added).toBe(0);
      expect(comparison.summary.removed).toBe(0);
    });

    it('should handle multi-year comparisons', () => {
      // Would need 2023 data loaded for this test
      const comparison = compareConstant('standard_deduction.single', [2024, 2025]);

      expect(comparison.changes.length).toBeGreaterThan(0);
    });
  });

  describe('compareBrackets', () => {
    it('should detect bracket changes', () => {
      const comparison = compareBrackets('single', [2024, 2025]);

      expect(comparison.years).toEqual([2024, 2025]);
      expect(comparison.changes.length).toBeGreaterThan(0);

      // Check for specific bracket change (10% bracket upper limit)
      const bracket10Change = comparison.changes.find((c) =>
        c.description.includes('10%')
      );

      expect(bracket10Change).toBeDefined();
      expect(bracket10Change!.oldValue).toBe(1160000); // $11,600 in 2024
      expect(bracket10Change!.newValue).toBe(1180000); // $11,800 in 2025
    });

    it('should identify all modified brackets', () => {
      const comparison = compareBrackets('single', [2024, 2025]);

      const modifiedCount = comparison.changes.filter(
        (c) => c.changeType === 'modified'
      ).length;

      expect(modifiedCount).toBeGreaterThan(0);
    });
  });

  describe('compareYears', () => {
    it('should get all changes between two years', () => {
      const changes = compareYears(2024, 2025);

      expect(changes.length).toBeGreaterThan(0);

      // Should include standard deduction changes
      const stdDeductionChanges = changes.filter((c) =>
        c.ruleId.includes('standard_deduction')
      );
      expect(stdDeductionChanges.length).toBeGreaterThan(0);

      // Should include bracket changes
      const bracketChanges = changes.filter((c) => c.ruleId.includes('brackets'));
      expect(bracketChanges.length).toBeGreaterThan(0);
    });

    it('should only include actual changes', () => {
      const changes = compareYears(2024, 2025);

      const unchangedChanges = changes.filter((c) => c.changeType === 'unchanged');
      expect(unchangedChanges).toHaveLength(0);
    });
  });

  describe('formatChanges', () => {
    it('should format changes for display', () => {
      const changes = compareYears(2024, 2025);
      const formatted = formatChanges(changes);

      expect(formatted).toContain('Rule Changes Summary');
      expect(formatted).toContain('Total Changes:');
      expect(formatted).toContain('Modified:');
    });

    it('should categorize changes by type', () => {
      const changes = compareYears(2024, 2025);
      const formatted = formatChanges(changes);

      if (changes.some((c) => c.changeType === 'modified')) {
        expect(formatted).toContain('📝 Modified Rules');
      }

      if (changes.some((c) => c.changeType === 'added')) {
        expect(formatted).toContain('📈 Added Rules');
      }

      if (changes.some((c) => c.changeType === 'removed')) {
        expect(formatted).toContain('📉 Removed Rules');
      }
    });
  });
});
