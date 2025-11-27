/**
 * Rule Versioning Types
 *
 * Enables multi-year tax rule support with:
 * - Year-specific rule snapshots
 * - Effective/expiration dates
 * - Source/authority tracking
 * - Deprecation warnings
 */

/**
 * Rule version metadata
 */
export interface RuleMetadata {
  /** Unique rule identifier (e.g., "federal.brackets.single") */
  id: string;

  /** Human-readable name */
  name: string;

  /** Tax year this rule applies to */
  taxYear: number;

  /** When this rule becomes effective (ISO date) */
  effectiveDate: string;

  /** When this rule expires (ISO date, null if current) */
  expirationDate: string | null;

  /** Authoritative source (IRS Rev. Proc., state law reference) */
  source: string;

  /** Source URL for verification */
  sourceUrl?: string;

  /** Last verified date */
  lastVerified: string;

  /** Rule version (for tracking changes within a year) */
  version: string;

  /** Whether rule is deprecated */
  deprecated: boolean;

  /** Deprecation message if applicable */
  deprecationMessage?: string;

  /** Related/superseded rule IDs */
  supersedes?: string[];

  /** Tags for categorization */
  tags: string[];
}

/**
 * Versioned tax bracket
 */
export interface VersionedBracket {
  metadata: RuleMetadata;
  brackets: Array<{
    min: number;
    max: number;
    rate: number;
  }>;
}

/**
 * Versioned constant value
 */
export interface VersionedConstant {
  metadata: RuleMetadata;
  value: number;
}

/**
 * Versioned phaseout range
 */
export interface VersionedPhaseout {
  metadata: RuleMetadata;
  thresholds: {
    start: number;
    end: number;
  };
  rate: number; // Phaseout rate per dollar
}

/**
 * Rule version registry
 */
export interface RuleRegistry {
  /** Registry metadata */
  metadata: {
    engineVersion: string;
    lastUpdated: string;
    ruleCount: number;
  };

  /** Indexed by rule ID, then tax year */
  rules: {
    [ruleId: string]: {
      [taxYear: number]: RuleMetadata;
    };
  };

  /** Tax brackets by year and filing status */
  brackets: {
    federal: {
      [year: number]: {
        [filingStatus: string]: VersionedBracket;
      };
    };
    states: {
      [stateCode: string]: {
        [year: number]: {
          [filingStatus: string]: VersionedBracket;
        };
      };
    };
  };

  /** Constants by year */
  constants: {
    [year: number]: {
      [constantId: string]: VersionedConstant;
    };
  };

  /** Phaseouts by year */
  phaseouts: {
    [year: number]: {
      [phaseoutId: string]: VersionedPhaseout;
    };
  };
}

/**
 * Rule query filters
 */
export interface RuleQuery {
  /** Rule ID to query */
  id?: string;

  /** Tax year */
  taxYear: number;

  /** Specific date to check (defaults to Dec 31 of tax year) */
  asOfDate?: string;

  /** Include deprecated rules */
  includeDeprecated?: boolean;

  /** Filter by tags */
  tags?: string[];
}

/**
 * Rule validation result
 */
export interface RuleValidationResult {
  /** Whether rule is valid */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];

  /** Rule metadata if valid */
  metadata?: RuleMetadata;
}

/**
 * Rule change tracking
 */
export interface RuleChange {
  /** Rule ID */
  ruleId: string;

  /** From tax year */
  fromYear: number;

  /** To tax year */
  toYear: number;

  /** Change type */
  changeType: 'added' | 'modified' | 'removed' | 'unchanged';

  /** Description of change */
  description: string;

  /** Old value (if applicable) */
  oldValue?: unknown;

  /** New value (if applicable) */
  newValue?: unknown;

  /** Source of change */
  source: string;
}

/**
 * Multi-year rule comparison
 */
export interface RuleComparison {
  /** Rules compared */
  ruleId: string;

  /** Years compared */
  years: number[];

  /** Changes detected */
  changes: RuleChange[];

  /** Summary statistics */
  summary: {
    totalChanges: number;
    added: number;
    modified: number;
    removed: number;
  };
}
