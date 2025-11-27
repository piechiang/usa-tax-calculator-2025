/**
 * Rule Registry Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeRegistry,
  clearRegistry,
  registerRule,
  queryRule,
  getRulesForYear,
  validateRule,
  registerConstant,
  getConstant,
  registerFederalBrackets,
  getFederalBrackets,
} from '../../../src/engine/rules/versioning';
import type { RuleMetadata, VersionedConstant, VersionedBracket } from '../../../src/engine/rules/versioning';

describe('Rule Registry', () => {
  beforeEach(() => {
    clearRegistry();
    initializeRegistry();
  });

  describe('registerRule and queryRule', () => {
    it('should register and retrieve a rule', () => {
      const metadata: RuleMetadata = {
        id: 'test.rule',
        name: 'Test Rule',
        taxYear: 2025,
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        source: 'Test Source',
        lastVerified: '2024-11-01',
        version: '1.0.0',
        deprecated: false,
        tags: ['test'],
      };

      registerRule(metadata);

      const retrieved = queryRule({ id: 'test.rule', taxYear: 2025 });
      expect(retrieved).toEqual(metadata);
    });

    it('should return null for non-existent rule', () => {
      const retrieved = queryRule({ id: 'nonexistent', taxYear: 2025 });
      expect(retrieved).toBeNull();
    });

    it('should handle multiple versions of same rule', () => {
      const metadata2024: RuleMetadata = {
        id: 'test.rule',
        name: 'Test Rule 2024',
        taxYear: 2024,
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        source: 'Test Source',
        lastVerified: '2023-11-01',
        version: '1.0.0',
        deprecated: false,
        tags: ['test'],
      };

      const metadata2025: RuleMetadata = {
        id: 'test.rule',
        name: 'Test Rule 2025',
        taxYear: 2025,
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        source: 'Test Source',
        lastVerified: '2024-11-01',
        version: '1.0.0',
        deprecated: false,
        tags: ['test'],
      };

      registerRule(metadata2024);
      registerRule(metadata2025);

      const rule2024 = queryRule({ id: 'test.rule', taxYear: 2024 });
      const rule2025 = queryRule({ id: 'test.rule', taxYear: 2025 });

      expect(rule2024?.name).toBe('Test Rule 2024');
      expect(rule2025?.name).toBe('Test Rule 2025');
    });

    it('should filter deprecated rules by default', () => {
      const metadata: RuleMetadata = {
        id: 'deprecated.rule',
        name: 'Deprecated Rule',
        taxYear: 2025,
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        source: 'Test Source',
        lastVerified: '2024-11-01',
        version: '1.0.0',
        deprecated: true,
        deprecationMessage: 'This rule is deprecated',
        tags: ['test'],
      };

      registerRule(metadata);

      const withoutDeprecated = queryRule({ id: 'deprecated.rule', taxYear: 2025 });
      const withDeprecated = queryRule({
        id: 'deprecated.rule',
        taxYear: 2025,
        includeDeprecated: true,
      });

      expect(withoutDeprecated).toBeNull();
      expect(withDeprecated).toEqual(metadata);
    });

    it('should filter by tags', () => {
      const metadata: RuleMetadata = {
        id: 'tagged.rule',
        name: 'Tagged Rule',
        taxYear: 2025,
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        source: 'Test Source',
        lastVerified: '2024-11-01',
        version: '1.0.0',
        deprecated: false,
        tags: ['federal', 'deduction', 'standard'],
      };

      registerRule(metadata);

      const withCorrectTags = queryRule({
        id: 'tagged.rule',
        taxYear: 2025,
        tags: ['federal', 'deduction'],
      });

      const withIncorrectTags = queryRule({
        id: 'tagged.rule',
        taxYear: 2025,
        tags: ['state', 'credit'],
      });

      expect(withCorrectTags).toEqual(metadata);
      expect(withIncorrectTags).toBeNull();
    });
  });

  describe('getRulesForYear', () => {
    it('should get all rules for a tax year', () => {
      const rules: RuleMetadata[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          taxYear: 2025,
          effectiveDate: '2025-01-01',
          expirationDate: '2025-12-31',
          source: 'Test',
          lastVerified: '2024-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['test'],
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          taxYear: 2025,
          effectiveDate: '2025-01-01',
          expirationDate: '2025-12-31',
          source: 'Test',
          lastVerified: '2024-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['test'],
        },
        {
          id: 'rule3',
          name: 'Rule 3',
          taxYear: 2024,
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          source: 'Test',
          lastVerified: '2023-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['test'],
        },
      ];

      rules.forEach(registerRule);

      const rules2025 = getRulesForYear(2025);
      const rules2024 = getRulesForYear(2024);

      expect(rules2025).toHaveLength(2);
      expect(rules2024).toHaveLength(1);
    });
  });

  describe('validateRule', () => {
    it('should validate a valid rule', () => {
      const metadata: RuleMetadata = {
        id: 'valid.rule',
        name: 'Valid Rule',
        taxYear: 2025,
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        source: 'IRS Rev. Proc. 2024-40',
        sourceUrl: 'https://www.irs.gov/test',
        lastVerified: '2024-11-01',
        version: '1.0.0',
        deprecated: false,
        tags: ['test'],
      };

      const result = validateRule(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const metadata = {
        id: '',
        name: '',
        taxYear: 0,
      } as RuleMetadata;

      const result = validateRule(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn for missing source URL', () => {
      const metadata: RuleMetadata = {
        id: 'rule.without.url',
        name: 'Rule Without URL',
        taxYear: 2025,
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        source: 'Test Source',
        lastVerified: '2024-11-01',
        version: '1.0.0',
        deprecated: false,
        tags: ['test'],
      };

      const result = validateRule(metadata);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Source URL not provided');
    });
  });

  describe('registerConstant and getConstant', () => {
    it('should register and retrieve a constant', () => {
      const constant: VersionedConstant = {
        metadata: {
          id: 'test.constant',
          name: 'Test Constant',
          taxYear: 2025,
          effectiveDate: '2025-01-01',
          expirationDate: '2025-12-31',
          source: 'Test',
          lastVerified: '2024-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['test'],
        },
        value: 1000000, // $10,000
      };

      registerConstant(2025, 'test.constant', constant);

      const value = getConstant(2025, 'test.constant');
      expect(value).toBe(1000000);
    });

    it('should return null for non-existent constant', () => {
      const value = getConstant(2025, 'nonexistent');
      expect(value).toBeNull();
    });

    it('should handle constants across different years', () => {
      const constant2024: VersionedConstant = {
        metadata: {
          id: 'year.constant',
          name: 'Year Constant',
          taxYear: 2024,
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          source: 'Test',
          lastVerified: '2023-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['test'],
        },
        value: 1000000,
      };

      const constant2025: VersionedConstant = {
        metadata: {
          id: 'year.constant',
          name: 'Year Constant',
          taxYear: 2025,
          effectiveDate: '2025-01-01',
          expirationDate: '2025-12-31',
          source: 'Test',
          lastVerified: '2024-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['test'],
        },
        value: 1100000,
      };

      registerConstant(2024, 'year.constant', constant2024);
      registerConstant(2025, 'year.constant', constant2025);

      expect(getConstant(2024, 'year.constant')).toBe(1000000);
      expect(getConstant(2025, 'year.constant')).toBe(1100000);
    });
  });

  describe('registerFederalBrackets and getFederalBrackets', () => {
    it('should register and retrieve tax brackets', () => {
      const bracket: VersionedBracket = {
        metadata: {
          id: 'federal.brackets.single.2025',
          name: 'Federal Brackets - Single (2025)',
          taxYear: 2025,
          effectiveDate: '2025-01-01',
          expirationDate: '2025-12-31',
          source: 'IRS Rev. Proc. 2024-40',
          lastVerified: '2024-11-01',
          version: '1.0.0',
          deprecated: false,
          tags: ['federal', 'brackets'],
        },
        brackets: [
          { min: 0, max: 1180000, rate: 0.10 },
          { min: 1180000, max: 4780000, rate: 0.12 },
        ],
      };

      registerFederalBrackets(2025, 'single', bracket);

      const retrieved = getFederalBrackets(2025, 'single');
      expect(retrieved).toEqual(bracket);
    });

    it('should return null for non-existent brackets', () => {
      const retrieved = getFederalBrackets(2025, 'nonexistent');
      expect(retrieved).toBeNull();
    });
  });
});
