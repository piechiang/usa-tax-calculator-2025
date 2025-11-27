/**
 * Rule Versioning Module
 *
 * Entry point for rule versioning functionality
 */

export type {
  RuleMetadata,
  RuleRegistry,
  RuleQuery,
  RuleValidationResult,
  RuleChange,
  RuleComparison,
  VersionedBracket,
  VersionedConstant,
  VersionedPhaseout,
} from './types';

export {
  initializeRegistry,
  getRegistry,
  registerRule,
  queryRule,
  getRulesForYear,
  validateRule,
  registerFederalBrackets,
  getFederalBrackets,
  registerConstant,
  getConstant,
  exportRegistry,
  importRegistry,
  clearRegistry,
} from './registry';

export {
  load2024FederalRules,
  load2025FederalRules,
  loadAllRules,
  getRuleStats,
} from './loader';

export {
  compareConstant,
  compareBrackets,
  compareYears,
  formatChanges,
} from './comparison';
