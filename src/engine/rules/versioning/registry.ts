/**
 * Rule Version Registry
 *
 * Central registry for all versioned tax rules
 */

import type {
  RuleRegistry,
  RuleMetadata,
  RuleQuery,
  RuleValidationResult,
  VersionedBracket,
  VersionedConstant,
} from './types';

/**
 * Global rule registry instance
 */
let globalRegistry: RuleRegistry | null = null;

/**
 * Initialize rule registry
 */
export function initializeRegistry(): RuleRegistry {
  globalRegistry = {
    metadata: {
      engineVersion: '1.0.0',
      lastUpdated: new Date().toISOString(),
      ruleCount: 0,
    },
    rules: {},
    brackets: {
      federal: {},
      states: {},
    },
    constants: {},
    phaseouts: {},
  };

  return globalRegistry;
}

/**
 * Get current registry
 */
export function getRegistry(): RuleRegistry {
  if (!globalRegistry) {
    return initializeRegistry();
  }
  return globalRegistry;
}

/**
 * Register a rule
 */
export function registerRule(metadata: RuleMetadata): void {
  const registry = getRegistry();

  if (!registry.rules[metadata.id]) {
    registry.rules[metadata.id] = {};
  }

  registry.rules[metadata.id]![metadata.taxYear] = metadata;
  registry.metadata.ruleCount++;
  registry.metadata.lastUpdated = new Date().toISOString();
}

/**
 * Query rule by ID and year
 */
export function queryRule(query: RuleQuery): RuleMetadata | null {
  const registry = getRegistry();

  if (!query.id) {
    return null;
  }

  const ruleVersions = registry.rules[query.id];
  if (!ruleVersions) {
    return null;
  }

  const rule = ruleVersions[query.taxYear];
  if (!rule) {
    return null;
  }

  // Check deprecation
  if (rule.deprecated && !query.includeDeprecated) {
    return null;
  }

  // Check effective/expiration dates
  const asOfDate = query.asOfDate || `${query.taxYear}-12-31`;
  if (asOfDate < rule.effectiveDate) {
    return null;
  }

  if (rule.expirationDate && asOfDate > rule.expirationDate) {
    return null;
  }

  // Check tags
  if (query.tags && query.tags.length > 0) {
    const hasAllTags = query.tags.every((tag) => rule.tags.includes(tag));
    if (!hasAllTags) {
      return null;
    }
  }

  return rule;
}

/**
 * Get all rules for a tax year
 */
export function getRulesForYear(
  taxYear: number,
  includeDeprecated = false
): RuleMetadata[] {
  const registry = getRegistry();
  const results: RuleMetadata[] = [];

  for (const ruleId in registry.rules) {
    const rule = queryRule({ id: ruleId, taxYear, includeDeprecated });
    if (rule) {
      results.push(rule);
    }
  }

  return results;
}

/**
 * Validate rule metadata
 */
export function validateRule(metadata: RuleMetadata): RuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!metadata.id) {
    errors.push('Rule ID is required');
  }

  if (!metadata.name) {
    errors.push('Rule name is required');
  }

  if (!metadata.taxYear || metadata.taxYear < 2000 || metadata.taxYear > 2100) {
    errors.push('Invalid tax year');
  }

  if (!metadata.effectiveDate) {
    errors.push('Effective date is required');
  }

  if (!metadata.source) {
    errors.push('Source reference is required');
  }

  if (!metadata.lastVerified) {
    errors.push('Last verified date is required');
  }

  if (!metadata.version) {
    errors.push('Version is required');
  }

  // Warnings
  if (!metadata.sourceUrl) {
    warnings.push('Source URL not provided');
  }

  const lastVerified = new Date(metadata.lastVerified);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (lastVerified < oneYearAgo) {
    warnings.push('Rule has not been verified in over a year');
  }

  if (metadata.deprecated && !metadata.deprecationMessage) {
    warnings.push('Deprecated rule should have deprecation message');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: errors.length === 0 ? metadata : undefined,
  };
}

/**
 * Register federal tax brackets for a year
 */
export function registerFederalBrackets(
  year: number,
  filingStatus: string,
  bracket: VersionedBracket
): void {
  const registry = getRegistry();

  if (!registry.brackets.federal[year]) {
    registry.brackets.federal[year] = {};
  }

  registry.brackets.federal[year]![filingStatus] = bracket;
  registerRule(bracket.metadata);
}

/**
 * Get federal tax brackets
 */
export function getFederalBrackets(
  year: number,
  filingStatus: string
): VersionedBracket | null {
  const registry = getRegistry();
  return registry.brackets.federal[year]?.[filingStatus] || null;
}

/**
 * Register a constant
 */
export function registerConstant(
  year: number,
  constantId: string,
  constant: VersionedConstant
): void {
  const registry = getRegistry();

  if (!registry.constants[year]) {
    registry.constants[year] = {};
  }

  registry.constants[year]![constantId] = constant;
  registerRule(constant.metadata);
}

/**
 * Get a constant value
 */
export function getConstant(year: number, constantId: string): number | null {
  const registry = getRegistry();
  const constant = registry.constants[year]?.[constantId];
  return constant?.value ?? null;
}

/**
 * Export registry to JSON
 */
export function exportRegistry(): string {
  const registry = getRegistry();
  return JSON.stringify(registry, null, 2);
}

/**
 * Import registry from JSON
 */
export function importRegistry(json: string): void {
  const imported = JSON.parse(json) as RuleRegistry;

  // Validate structure
  if (!imported.metadata || !imported.rules) {
    throw new Error('Invalid registry format');
  }

  globalRegistry = imported;
}

/**
 * Clear registry (for testing)
 */
export function clearRegistry(): void {
  globalRegistry = null;
}
