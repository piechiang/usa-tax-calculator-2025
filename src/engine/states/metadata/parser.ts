/**
 * State Tax Configuration Parser and Validator
 *
 * Parses YAML/JSON state tax configuration files and validates them
 * against the schema. Provides detailed error messages for debugging.
 *
 * @module parser
 */

import type {
  StateTaxConfig,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  TaxBracket,
  FilingStatus
} from './schema';
import { dollarsToCents } from '../../util/money';

/**
 * Parse and validate state tax configuration from YAML/JSON object
 *
 * @param config - Raw configuration object (from YAML.parse or JSON.parse)
 * @param stateCode - Expected state code for validation
 * @returns Parsed and validated configuration with amounts converted to cents
 */
export function parseStateTaxConfig(
  config: any,
  stateCode?: string
): { config: StateTaxConfig | null; validation: ConfigValidationResult } {
  const errors: ConfigValidationError[] = [];
  const warnings: ConfigValidationWarning[] = [];

  // Validate required top-level fields
  if (!config.metadata) {
    errors.push({
      code: 'MISSING_METADATA',
      message: 'Configuration must include metadata section',
      path: 'metadata',
      expected: 'object with stateCode, stateName, taxYear, etc.'
    });
  }

  if (!config.structure) {
    errors.push({
      code: 'MISSING_STRUCTURE',
      message: 'Configuration must specify tax structure',
      path: 'structure',
      expected: "'flat', 'progressive', or 'hybrid'"
    });
  }

  // If basic validation failed, return early
  if (errors.length > 0) {
    return {
      config: null,
      validation: { valid: false, errors, warnings }
    };
  }

  // Validate metadata
  validateMetadata(config.metadata, stateCode, errors, warnings);

  // Validate structure
  validateStructure(config, errors, warnings);

  // Validate brackets (if progressive)
  if (config.structure === 'progressive' || config.structure === 'hybrid') {
    validateBrackets(config.brackets, errors, warnings);
  }

  // Validate deductions
  if (config.standardDeduction) {
    validateDeductions(config.standardDeduction, errors, warnings);
  }

  // Validate AGI modifications
  if (config.agiModifications) {
    validateAGIModifications(config.agiModifications, errors, warnings);
  }

  // Validate credits
  if (config.credits) {
    validateCredits(config.credits, errors, warnings);
  }

  // Validate documentation
  if (config.documentation) {
    validateDocumentation(config.documentation, errors, warnings);
  }

  // If validation passed, convert dollar amounts to cents
  let processedConfig: StateTaxConfig | null = null;
  if (errors.length === 0) {
    try {
      processedConfig = convertAmountsToCents(config);
    } catch (error) {
      errors.push({
        code: 'CONVERSION_ERROR',
        message: `Error converting amounts to cents: ${error}`,
        path: 'root'
      });
    }
  }

  return {
    config: processedConfig,
    validation: {
      valid: errors.length === 0,
      errors,
      warnings
    }
  };
}

/**
 * Validate metadata section
 */
function validateMetadata(
  metadata: any,
  expectedStateCode: string | undefined,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  // Required fields
  const requiredFields = ['stateCode', 'stateName', 'taxYear', 'version', 'lastUpdated', 'sources'];

  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push({
        code: 'MISSING_METADATA_FIELD',
        message: `Metadata missing required field: ${field}`,
        path: `metadata.${field}`,
        expected: 'non-empty value'
      });
    }
  }

  // Validate state code format
  if (metadata.stateCode && !/^[A-Z]{2}$/.test(metadata.stateCode)) {
    errors.push({
      code: 'INVALID_STATE_CODE',
      message: 'State code must be two uppercase letters',
      path: 'metadata.stateCode',
      expected: 'Two uppercase letters (e.g., "CA", "NY")',
      actual: metadata.stateCode
    });
  }

  // Validate expected state code matches
  if (expectedStateCode && metadata.stateCode !== expectedStateCode) {
    errors.push({
      code: 'STATE_CODE_MISMATCH',
      message: `Expected state code ${expectedStateCode}, got ${metadata.stateCode}`,
      path: 'metadata.stateCode',
      expected: expectedStateCode,
      actual: metadata.stateCode
    });
  }

  // Validate tax year
  if (metadata.taxYear) {
    const year = Number(metadata.taxYear);
    if (isNaN(year) || year < 2020 || year > 2030) {
      errors.push({
        code: 'INVALID_TAX_YEAR',
        message: 'Tax year must be between 2020 and 2030',
        path: 'metadata.taxYear',
        expected: 'Year between 2020 and 2030',
        actual: metadata.taxYear
      });
    }
  }

  // Validate sources is array
  if (metadata.sources && !Array.isArray(metadata.sources)) {
    errors.push({
      code: 'INVALID_SOURCES',
      message: 'Sources must be an array of strings',
      path: 'metadata.sources',
      expected: 'Array of strings',
      actual: typeof metadata.sources
    });
  }
}

/**
 * Validate tax structure
 */
function validateStructure(
  config: any,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  const validStructures = ['flat', 'progressive', 'hybrid'];

  if (!validStructures.includes(config.structure)) {
    errors.push({
      code: 'INVALID_STRUCTURE',
      message: `Invalid tax structure: ${config.structure}`,
      path: 'structure',
      expected: validStructures.join(', '),
      actual: config.structure
    });
  }

  // Validate flat rate if structure is flat
  if (config.structure === 'flat') {
    if (config.flatRate === undefined || config.flatRate === null) {
      errors.push({
        code: 'MISSING_FLAT_RATE',
        message: 'Flat tax structure requires flatRate field',
        path: 'flatRate',
        expected: 'Decimal rate (e.g., 0.0307 for 3.07%)'
      });
    } else if (typeof config.flatRate !== 'number' || config.flatRate <= 0 || config.flatRate >= 1) {
      errors.push({
        code: 'INVALID_FLAT_RATE',
        message: 'Flat rate must be between 0 and 1',
        path: 'flatRate',
        expected: 'Decimal between 0 and 1',
        actual: config.flatRate
      });
    }
  }

  // Validate brackets if structure is progressive
  if ((config.structure === 'progressive' || config.structure === 'hybrid') && !config.brackets) {
    errors.push({
      code: 'MISSING_BRACKETS',
      message: 'Progressive/hybrid structure requires brackets',
      path: 'brackets',
      expected: 'Bracket schedule with rates by filing status'
    });
  }
}

/**
 * Validate tax brackets
 */
function validateBrackets(
  brackets: any,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  if (!brackets) return;

  // Check required fields
  if (!brackets.byFilingStatus) {
    errors.push({
      code: 'MISSING_FILING_STATUS_BRACKETS',
      message: 'Brackets must include byFilingStatus field',
      path: 'brackets.byFilingStatus',
      expected: 'Object with brackets for each filing status'
    });
    return;
  }

  const requiredFilingStatuses: FilingStatus[] = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'];

  // Validate each filing status has brackets
  for (const status of requiredFilingStatuses) {
    if (!brackets.byFilingStatus[status]) {
      errors.push({
        code: 'MISSING_BRACKETS_FOR_STATUS',
        message: `Missing brackets for filing status: ${status}`,
        path: `brackets.byFilingStatus.${status}`,
        expected: 'Array of tax brackets'
      });
      continue;
    }

    const statusBrackets = brackets.byFilingStatus[status];

    if (!Array.isArray(statusBrackets)) {
      errors.push({
        code: 'INVALID_BRACKETS_FORMAT',
        message: `Brackets for ${status} must be an array`,
        path: `brackets.byFilingStatus.${status}`,
        expected: 'Array of bracket objects'
      });
      continue;
    }

    // Validate individual brackets
    for (let i = 0; i < statusBrackets.length; i++) {
      const bracket = statusBrackets[i];
      const bracketPath = `brackets.byFilingStatus.${status}[${i}]`;

      // Check required bracket fields
      if (bracket.min === undefined || bracket.min === null) {
        errors.push({
          code: 'MISSING_BRACKET_MIN',
          message: `Bracket missing min field`,
          path: `${bracketPath}.min`
        });
      }

      if (bracket.max === undefined || bracket.max === null) {
        errors.push({
          code: 'MISSING_BRACKET_MAX',
          message: `Bracket missing max field`,
          path: `${bracketPath}.max`
        });
      }

      if (bracket.rate === undefined || bracket.rate === null) {
        errors.push({
          code: 'MISSING_BRACKET_RATE',
          message: `Bracket missing rate field`,
          path: `${bracketPath}.rate`
        });
      }

      // Validate bracket values
      if (typeof bracket.min === 'number' && bracket.min < 0) {
        errors.push({
          code: 'INVALID_BRACKET_MIN',
          message: `Bracket min cannot be negative`,
          path: `${bracketPath}.min`,
          actual: bracket.min
        });
      }

      if (typeof bracket.rate === 'number' && (bracket.rate < 0 || bracket.rate > 1)) {
        errors.push({
          code: 'INVALID_BRACKET_RATE',
          message: `Bracket rate must be between 0 and 1`,
          path: `${bracketPath}.rate`,
          expected: 'Decimal between 0 and 1',
          actual: bracket.rate
        });
      }

      // Validate bracket continuity
      if (i > 0) {
        const prevBracket = statusBrackets[i - 1];
        if (bracket.min !== prevBracket.max) {
          warnings.push({
            code: 'BRACKET_GAP',
            message: `Bracket ${i} min (${bracket.min}) doesn't match previous bracket max (${prevBracket.max})`,
            path: `${bracketPath}.min`,
            suggestion: `Ensure brackets are continuous without gaps`
          });
        }
      }
    }
  }

  // Validate top rate
  if (brackets.topRate !== undefined) {
    if (typeof brackets.topRate !== 'number' || brackets.topRate <= 0 || brackets.topRate > 1) {
      errors.push({
        code: 'INVALID_TOP_RATE',
        message: 'Top rate must be between 0 and 1',
        path: 'brackets.topRate',
        actual: brackets.topRate
      });
    }
  }
}

/**
 * Validate standard deduction configuration
 */
function validateDeductions(
  deduction: any,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  if (!deduction.amounts) {
    errors.push({
      code: 'MISSING_DEDUCTION_AMOUNTS',
      message: 'Standard deduction must include amounts by filing status',
      path: 'standardDeduction.amounts'
    });
    return;
  }

  const requiredStatuses: FilingStatus[] = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'];

  for (const status of requiredStatuses) {
    if (deduction.amounts[status] === undefined) {
      errors.push({
        code: 'MISSING_DEDUCTION_AMOUNT',
        message: `Missing standard deduction for ${status}`,
        path: `standardDeduction.amounts.${status}`
      });
    } else if (typeof deduction.amounts[status] !== 'number' || deduction.amounts[status] < 0) {
      errors.push({
        code: 'INVALID_DEDUCTION_AMOUNT',
        message: `Invalid deduction amount for ${status}`,
        path: `standardDeduction.amounts.${status}`,
        expected: 'Non-negative number',
        actual: deduction.amounts[status]
      });
    }
  }
}

/**
 * Validate AGI modifications
 */
function validateAGIModifications(
  modifications: any,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  // Validate additions
  if (modifications.additions && Array.isArray(modifications.additions)) {
    validateModificationRules(modifications.additions, 'additions', errors, warnings);
  }

  // Validate subtractions
  if (modifications.subtractions && Array.isArray(modifications.subtractions)) {
    validateModificationRules(modifications.subtractions, 'subtractions', errors, warnings);
  }
}

/**
 * Validate individual AGI modification rules
 */
function validateModificationRules(
  rules: any[],
  type: string,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const rulePath = `agiModifications.${type}[${i}]`;

    // Check required fields
    if (!rule.id) {
      errors.push({
        code: 'MISSING_MODIFICATION_ID',
        message: `AGI modification missing id`,
        path: `${rulePath}.id`
      });
    }

    if (!rule.name) {
      errors.push({
        code: 'MISSING_MODIFICATION_NAME',
        message: `AGI modification missing name`,
        path: `${rulePath}.name`
      });
    }

    if (!rule.category) {
      errors.push({
        code: 'MISSING_MODIFICATION_CATEGORY',
        message: `AGI modification missing category`,
        path: `${rulePath}.category`
      });
    }

    // Validate mutually exclusive fields
    if (rule.fullExemption && rule.exemptionPercentage) {
      warnings.push({
        code: 'CONFLICTING_EXEMPTION_TYPES',
        message: `Modification has both fullExemption and exemptionPercentage`,
        path: rulePath,
        suggestion: 'Use either fullExemption OR exemptionPercentage, not both'
      });
    }
  }
}

/**
 * Validate credits
 */
function validateCredits(
  credits: any[],
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  if (!Array.isArray(credits)) {
    errors.push({
      code: 'INVALID_CREDITS_FORMAT',
      message: 'Credits must be an array',
      path: 'credits',
      expected: 'Array of credit objects'
    });
    return;
  }

  for (let i = 0; i < credits.length; i++) {
    const credit = credits[i];
    const creditPath = `credits[${i}]`;

    // Required fields
    if (!credit.id) {
      errors.push({
        code: 'MISSING_CREDIT_ID',
        message: 'Credit missing id',
        path: `${creditPath}.id`
      });
    }

    if (!credit.name) {
      errors.push({
        code: 'MISSING_CREDIT_NAME',
        message: 'Credit missing name',
        path: `${creditPath}.name`
      });
    }

    if (!credit.type) {
      errors.push({
        code: 'MISSING_CREDIT_TYPE',
        message: 'Credit missing type',
        path: `${creditPath}.type`
      });
    } else if (!['nonRefundable', 'refundable', 'partiallyRefundable'].includes(credit.type)) {
      errors.push({
        code: 'INVALID_CREDIT_TYPE',
        message: `Invalid credit type: ${credit.type}`,
        path: `${creditPath}.type`,
        expected: 'nonRefundable, refundable, or partiallyRefundable'
      });
    }

    if (!credit.calculation) {
      errors.push({
        code: 'MISSING_CREDIT_CALCULATION',
        message: 'Credit missing calculation',
        path: `${creditPath}.calculation`
      });
    }
  }
}

/**
 * Validate documentation
 */
function validateDocumentation(
  documentation: any,
  errors: ConfigValidationError[],
  // warnings: ConfigValidationWarning[]
): void {
  if (!documentation.primaryForm) {
    errors.push({
      code: 'MISSING_PRIMARY_FORM',
      message: 'Documentation missing primaryForm',
      path: 'documentation.primaryForm'
    });
  }

  if (!documentation.authorityUrl) {
    warnings.push({
      code: 'MISSING_AUTHORITY_URL',
      message: 'Documentation missing authorityUrl',
      path: 'documentation.authorityUrl',
      suggestion: 'Add URL to state tax authority website'
    });
  }
}

/**
 * Convert all dollar amounts in configuration to cents
 */
function convertAmountsToCents(config: any): StateTaxConfig {
  const converted = JSON.parse(JSON.stringify(config)); // Deep clone

  // Convert standard deduction amounts
  if (converted.standardDeduction?.amounts) {
    for (const status of Object.keys(converted.standardDeduction.amounts)) {
      converted.standardDeduction.amounts[status] = dollarsToCents(
        converted.standardDeduction.amounts[status]
      );
    }

    if (converted.standardDeduction.additionalForAge) {
      converted.standardDeduction.additionalForAge = dollarsToCents(
        converted.standardDeduction.additionalForAge
      );
    }

    if (converted.standardDeduction.additionalForBlindness) {
      converted.standardDeduction.additionalForBlindness = dollarsToCents(
        converted.standardDeduction.additionalForBlindness
      );
    }
  }

  // Convert personal exemption
  if (converted.personalExemption?.amount) {
    converted.personalExemption.amount = dollarsToCents(converted.personalExemption.amount);
  }

  // Convert brackets
  if (converted.brackets?.byFilingStatus) {
    for (const status of Object.keys(converted.brackets.byFilingStatus)) {
      for (const bracket of converted.brackets.byFilingStatus[status]) {
        bracket.min = dollarsToCents(bracket.min);
        if (bracket.max !== Infinity && typeof bracket.max === 'number') {
          bracket.max = dollarsToCents(bracket.max);
        }
      }
    }
  }

  // Convert AGI modification limits
  if (converted.agiModifications) {
    for (const modifications of [converted.agiModifications.additions, converted.agiModifications.subtractions]) {
      if (Array.isArray(modifications)) {
        for (const mod of modifications) {
          if (mod.limit) {
            mod.limit = dollarsToCents(mod.limit);
          }
        }
      }
    }
  }

  // Convert credit amounts
  if (Array.isArray(converted.credits)) {
    for (const credit of converted.credits) {
      if (credit.maxCredit) {
        credit.maxCredit = dollarsToCents(credit.maxCredit);
      }

      if (credit.calculation) {
        if (credit.calculation.amount) {
          credit.calculation.amount = dollarsToCents(credit.calculation.amount);
        }

        if (credit.calculation.tiers) {
          for (const tier of credit.calculation.tiers) {
            tier.threshold = dollarsToCents(tier.threshold);
            if (tier.valueType === 'amount') {
              tier.value = dollarsToCents(tier.value);
            }
          }
        }

        if (credit.calculation.table?.entries) {
          for (const entry of credit.calculation.table.entries) {
            entry.min = dollarsToCents(entry.min);
            entry.max = dollarsToCents(entry.max);
            entry.credit = dollarsToCents(entry.credit);
          }
        }
      }
    }
  }

  return converted as StateTaxConfig;
}

/**
 * Export configuration validation result as human-readable report
 */
export function generateValidationReport(validation: ConfigValidationResult): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('STATE TAX CONFIGURATION VALIDATION REPORT');
  lines.push('='.repeat(80));
  lines.push('');

  if (validation.valid) {
    lines.push('✅ Configuration is VALID');
  } else {
    lines.push(`❌ Configuration has ${validation.errors.length} ERROR(S)`);
  }

  if (validation.warnings.length > 0) {
    lines.push(`⚠️  Configuration has ${validation.warnings.length} WARNING(S)`);
  }

  lines.push('');

  // Errors
  if (validation.errors.length > 0) {
    lines.push('ERRORS:');
    lines.push('-'.repeat(80));
    for (let i = 0; i < validation.errors.length; i++) {
      const error = validation.errors[i];
      lines.push(`${i + 1}. [${error.code}] ${error.message}`);
      lines.push(`   Path: ${error.path}`);
      if (error.expected) {
        lines.push(`   Expected: ${error.expected}`);
      }
      if (error.actual !== undefined) {
        lines.push(`   Actual: ${JSON.stringify(error.actual)}`);
      }
      lines.push('');
    }
  }

  // Warnings
  if (validation.warnings.length > 0) {
    lines.push('WARNINGS:');
    lines.push('-'.repeat(80));
    for (let i = 0; i < validation.warnings.length; i++) {
      const warning = validation.warnings[i];
      lines.push(`${i + 1}. [${warning.code}] ${warning.message}`);
      lines.push(`   Path: ${warning.path}`);
      if (warning.suggestion) {
        lines.push(`   Suggestion: ${warning.suggestion}`);
      }
      lines.push('');
    }
  }

  lines.push('='.repeat(80));

  return lines.join('\n');
}
