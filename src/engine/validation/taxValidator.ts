import { FederalInput2025, FederalDiagnosticsMessage2025 } from '../types';
import {
  INCOME_DIAGNOSTICS,
  DEDUCTION_DIAGNOSTICS,
  CREDIT_DIAGNOSTICS,
  SE_DIAGNOSTICS,
  DATA_INTEGRITY_DIAGNOSTICS,
  FILING_STATUS_DIAGNOSTICS,
} from '../diagnostics/diagnosticCodes';

/**
 * Tax Data Validation System
 *
 * Validates input data and generates diagnostic messages to help
 * tax professionals identify and resolve issues quickly.
 *
 * Validation Categories:
 * 1. Data Integrity - Missing or invalid required data
 * 2. Income Validation - Income data consistency checks
 * 3. Deduction Validation - Deduction limit and eligibility checks
 * 4. Credit Validation - Credit eligibility and calculation checks
 * 5. Self-Employment - SE tax and deduction validations
 * 6. Filing Status - Filing status appropriateness checks
 */

export interface ValidationResult {
  isValid: boolean; // Overall validation status
  errors: FederalDiagnosticsMessage2025[]; // Blocking errors
  warnings: FederalDiagnosticsMessage2025[]; // Non-blocking warnings
  info: FederalDiagnosticsMessage2025[]; // Informational messages
  hasBlockingErrors: boolean; // True if calculation cannot proceed
}

/**
 * Validate complete federal tax input
 *
 * @param input Federal tax input data
 * @returns Validation result with errors, warnings, and info
 */
export function validateFederalInput(input: FederalInput2025): ValidationResult {
  const errors: FederalDiagnosticsMessage2025[] = [];
  const warnings: FederalDiagnosticsMessage2025[] = [];
  const info: FederalDiagnosticsMessage2025[] = [];

  // 1. Data Integrity Validation
  validateDataIntegrity(input, errors, warnings);

  // 2. Income Validation
  validateIncome(input, errors, warnings, info);

  // 3. Deduction Validation
  validateDeductions(input, errors, warnings, info);

  // 4. Credit Validation (if we have enough data)
  if (errors.length === 0) {
    validateCredits(input, errors, warnings, info);
  }

  // 5. Self-Employment Validation
  validateSelfEmployment(input, errors, warnings, info);

  // 6. Filing Status Validation
  validateFilingStatus(input, errors, warnings, info);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    hasBlockingErrors: errors.some((e) => e.severity === 'error'),
  };
}

/**
 * Validate data integrity (missing or invalid required data)
 */
function validateDataIntegrity(
  input: FederalInput2025,
  errors: FederalDiagnosticsMessage2025[],
  warnings: FederalDiagnosticsMessage2025[]
): void {
  // Check for missing spouse data if MFJ
  if (input.filingStatus === 'marriedJointly' && !input.spouse) {
    const diagnostic = DATA_INTEGRITY_DIAGNOSTICS.MISSING_SPOUSE_DATA!;
    errors.push({
      code: diagnostic.code,
      message: diagnostic.message,
      severity: 'error',
      field: 'spouse',
      context: {
        form: diagnostic.form,
        resolution: diagnostic.resolution,
      },
    });
  }

  // Check for incomplete dependent information
  if (input.qualifyingChildren) {
    input.qualifyingChildren.forEach((child, index) => {
      if (!child.birthDate) {
        errors.push({
          code: 'DATA006',
          message: `Qualifying child #${index + 1} is missing birth date`,
          severity: 'error',
          field: `qualifyingChildren[${index}].birthDate`,
        });
      }

      // Check for age consistency with CTC
      if (child.birthDate) {
        const age = calculateAge(child.birthDate, 2025);
        if (age >= 17) {
          const diagnostic = DATA_INTEGRITY_DIAGNOSTICS.DEPENDENT_AGE_MISMATCH!;
          warnings.push({
            code: diagnostic.code,
            message: `${child.name || 'Child'} is age ${age} and does not qualify for Child Tax Credit (must be under 17)`,
            severity: 'warning',
            field: `qualifyingChildren[${index}]`,
            context: {
              form: diagnostic.form,
              resolution: diagnostic.resolution,
            },
          });
        }
      }
    });
  }

  // Check for education expenses missing school info
  if (input.educationExpenses) {
    input.educationExpenses.forEach((expense, index) => {
      if (!expense.institutionName && expense.tuitionAndFees > 0) {
        const diagnostic = DATA_INTEGRITY_DIAGNOSTICS.EDUCATION_EXPENSES_MISSING_SCHOOL!;
        errors.push({
          code: diagnostic.code,
          message: diagnostic.message,
          severity: 'error',
          field: `educationExpenses[${index}].institutionName`,
          context: {
            form: diagnostic.form,
            resolution: diagnostic.resolution,
          },
        });
      }
    });
  }

  // Check QBI business information
  if (input.qbiBusinesses && input.qbiBusinesses.length > 0) {
    input.qbiBusinesses.forEach((business, index) => {
      if (business.qbi > 0 && (business.w2Wages === undefined || business.ubia === undefined)) {
        const diagnostic = DATA_INTEGRITY_DIAGNOSTICS.QBI_BUSINESS_MISSING_INFO!;
        warnings.push({
          code: diagnostic.code,
          message: `${business.businessName || 'Business #' + (index + 1)} is missing W-2 wages or UBIA information`,
          severity: 'warning',
          field: `qbiBusinesses[${index}]`,
          context: {
            form: diagnostic.form,
            resolution: diagnostic.resolution,
          },
        });
      }
    });
  }
}

/**
 * Validate income data
 */
function validateIncome(
  input: FederalInput2025,
  errors: FederalDiagnosticsMessage2025[],
  warnings: FederalDiagnosticsMessage2025[],
  info: FederalDiagnosticsMessage2025[]
): void {
  // Check qualified dividends vs ordinary dividends
  if (input.income.dividends.qualified > input.income.dividends.ordinary) {
    const diagnostic = INCOME_DIAGNOSTICS.QUALIFIED_DIVIDENDS_EXCEED_ORDINARY!;
    errors.push({
      code: diagnostic.code,
      message: diagnostic.message,
      severity: 'error',
      field: 'income.dividends.qualified',
      context: {
        form: diagnostic.form,
        resolution: diagnostic.resolution,
        qualifiedDividends: input.income.dividends.qualified,
        ordinaryDividends: input.income.dividends.ordinary,
      },
    });
  }

  // Check for capital loss carryover (info)
  if (input.income.capGainsNet < -300000) { // -$3,000 limit
    const diagnostic = INCOME_DIAGNOSTICS.NEGATIVE_CAPITAL_LOSS_CARRYOVER!;
    info.push({
      code: diagnostic.code,
      message: diagnostic.message,
      // severity: info (omitted - informational only)
      field: 'income.capGainsNet',
      context: {
        form: diagnostic.form,
        schedule: diagnostic.schedule,
        ircSection: diagnostic.ircSection,
        resolution: diagnostic.resolution,
        excessLoss: -input.income.capGainsNet - 300000,
      },
    });
  }

  // Check for SSTB high income
  if (input.qbiBusinesses) {
    const hasSSFTB = input.qbiBusinesses.some((b) => b.isSSTB);
    if (hasSSFTB) {
      // Will check against calculated taxable income in main calculation
      // For now, just flag if there are SSTBs
      const diagnostic = INCOME_DIAGNOSTICS.SSTB_HIGH_INCOME_NO_QBI!;
      info.push({
        code: diagnostic.code,
        message: diagnostic.message,
        // severity: info (omitted - informational only)
        context: {
          form: diagnostic.form,
          ircSection: diagnostic.ircSection,
          resolution: diagnostic.resolution,
        },
      });
    }
  }

  // Check W-2 wages exceeding SS wage base
  const SS_WAGE_BASE_2025 = 17610000; // $176,100 in cents
  if (input.income.wages > SS_WAGE_BASE_2025) {
    const diagnostic = INCOME_DIAGNOSTICS.W2_EXCEEDS_WAGE_BASE;
    warnings.push({
      code: diagnostic.code,
      message: diagnostic.message,
      severity: 'warning',
      field: 'income.wages',
      context: {
        form: diagnostic.form,
        schedule: diagnostic.schedule,
        resolution: diagnostic.resolution,
        wageBase: SS_WAGE_BASE_2025,
      },
    });
  }
}

/**
 * Validate deductions
 */
function validateDeductions(
  input: FederalInput2025,
  errors: FederalDiagnosticsMessage2025[],
  warnings: FederalDiagnosticsMessage2025[],
  info: FederalDiagnosticsMessage2025[]
): void {
  const SALT_CAP = 1000000; // $10,000 in cents
  const SALT_CAP_MFS = 500000; // $5,000 in cents

  // Check SALT cap
  const saltCap = input.filingStatus === 'marriedSeparately' ? SALT_CAP_MFS : SALT_CAP;
  if (input.itemized.stateLocalTaxes > saltCap) {
    const diagnostic = DEDUCTION_DIAGNOSTICS.SALT_EXCEEDS_CAP!;
    info.push({
      code: diagnostic.code,
      message: diagnostic.message,
      // severity: info (omitted - informational only)
      field: 'itemized.stateLocalTaxes',
      context: {
        schedule: diagnostic.schedule,
        ircSection: diagnostic.ircSection,
        resolution: diagnostic.resolution,
        saltPaid: input.itemized.stateLocalTaxes,
        saltCap,
        excessSalt: input.itemized.stateLocalTaxes - saltCap,
      },
    });
  }
}

/**
 * Validate credits
 */
function validateCredits(
  input: FederalInput2025,
  errors: FederalDiagnosticsMessage2025[],
  warnings: FederalDiagnosticsMessage2025[],
  info: FederalDiagnosticsMessage2025[]
): void {
  // Check EITC investment income limit
  const EITC_INVESTMENT_LIMIT = 1160000; // $11,600 in cents
  const investmentIncome =
    input.income.interest +
    input.income.dividends.ordinary +
    Math.max(0, input.income.capGainsNet || 0);

  if (investmentIncome > EITC_INVESTMENT_LIMIT && input.income.wages > 0) {
    const diagnostic = CREDIT_DIAGNOSTICS.EITC_INVESTMENT_INCOME_LIMIT!;
    errors.push({
      code: diagnostic.code,
      message: diagnostic.message,
      severity: 'error',
      context: {
        form: diagnostic.form,
        ircSection: diagnostic.ircSection,
        resolution: diagnostic.resolution,
        investmentIncome,
        limit: EITC_INVESTMENT_LIMIT,
      },
    });
  }

  // Check AOTC for graduate students
  if (input.educationExpenses) {
    input.educationExpenses.forEach((expense) => {
      if (expense.yearsOfPostSecondaryEducation && expense.yearsOfPostSecondaryEducation > 4) {
        const diagnostic = CREDIT_DIAGNOSTICS.AOTC_NOT_AVAILABLE_GRADUATE!;
        warnings.push({
          code: diagnostic.code,
          message: `${expense.studentName} has completed more than 4 years of post-secondary education. Consider Lifetime Learning Credit instead.`,
          severity: 'warning',
          context: {
            form: diagnostic.form,
            ircSection: diagnostic.ircSection,
            resolution: diagnostic.resolution,
          },
        });
      }
    });
  }
}

/**
 * Validate self-employment items
 */
function validateSelfEmployment(
  input: FederalInput2025,
  errors: FederalDiagnosticsMessage2025[],
  warnings: FederalDiagnosticsMessage2025[],
  info: FederalDiagnosticsMessage2025[]
): void {
  const SE_INCOME = input.income.scheduleCNet;

  if (SE_INCOME <= 0) return; // No SE income

  // Check health insurance deduction
  // Note: This will be checked more thoroughly in calculation
  // Just flag if it seems excessive
  if (input.adjustments && SE_INCOME > 0) {
    // Health insurance check would go here if we had that field
    // For now, this is a placeholder for future enhancement
  }

  // Check if sole proprietor with high QBI but no wages
  if (input.qbiBusinesses) {
    const soleProps = input.qbiBusinesses.filter(
      (b) => b.businessType === 'soleProprietorship' && b.qbi > 0
    );
    if (soleProps.some((b) => b.w2Wages === 0)) {
      const diagnostic = SE_DIAGNOSTICS.SE_QBI_NO_WAGES!;
      warnings.push({
        code: diagnostic.code,
        message: diagnostic.message,
        severity: 'warning',
        context: {
          form: diagnostic.form,
          resolution: diagnostic.resolution,
        },
      });
    }
  }

  // Check if SE income exceeds SS max
  const SS_MAX = 17610000; // $176,100 in cents
  if (SE_INCOME > SS_MAX) {
    const diagnostic = SE_DIAGNOSTICS.SE_TAX_SOCIAL_SECURITY_MAX!;
    info.push({
      code: diagnostic.code,
      message: diagnostic.message,
      // severity: info (omitted - informational only)
      context: {
        schedule: diagnostic.schedule,
        resolution: diagnostic.resolution,
      },
    });
  }
}

/**
 * Validate filing status
 */
function validateFilingStatus(
  input: FederalInput2025,
  errors: FederalDiagnosticsMessage2025[],
  warnings: FederalDiagnosticsMessage2025[],
  info: FederalDiagnosticsMessage2025[]
): void {
  // Warn about MFS disadvantages
  if (input.filingStatus === 'marriedSeparately') {
    const diagnostic = FILING_STATUS_DIAGNOSTICS.MFS_DISADVANTAGE!;
    info.push({
      code: diagnostic.code,
      message: diagnostic.message,
      // severity: info (omitted - informational only)
      context: {
        form: diagnostic.form,
        resolution: diagnostic.resolution,
      },
    });
  }

  // Info about HoH requirements
  if (input.filingStatus === 'headOfHousehold') {
    const diagnostic = FILING_STATUS_DIAGNOSTICS.HOH_QUALIFICATION!;
    info.push({
      code: diagnostic.code,
      message: diagnostic.message,
      // severity: info (omitted - informational only)
      context: {
        form: diagnostic.form,
        ircSection: diagnostic.ircSection,
        resolution: diagnostic.resolution,
        url: diagnostic.url,
      },
    });
  }
}

/**
 * Helper: Calculate age at end of tax year
 */
function calculateAge(birthDate: string, taxYear: number): number {
  const parts = birthDate.split('-');
  const birthYear = parseInt(parts[0] || '0', 10);
  return taxYear - birthYear;
}

/**
 * Format validation results for display
 */
export function formatValidationResults(result: ValidationResult): string {
  let output = '';

  if (result.errors.length > 0) {
    output += '=== ERRORS (Blocking Issues) ===\n';
    result.errors.forEach((error) => {
      output += `[${error.code}] ${error.message}\n`;
      if (error.context?.resolution) {
        output += `  → Resolution: ${error.context.resolution}\n`;
      }
      output += '\n';
    });
  }

  if (result.warnings.length > 0) {
    output += '=== WARNINGS (Review Recommended) ===\n';
    result.warnings.forEach((warning) => {
      output += `[${warning.code}] ${warning.message}\n`;
      if (warning.context?.resolution) {
        output += `  → Resolution: ${warning.context.resolution}\n`;
      }
      output += '\n';
    });
  }

  if (result.info.length > 0) {
    output += '=== INFO (For Your Awareness) ===\n';
    result.info.forEach((info) => {
      output += `[${info.code}] ${info.message}\n`;
      if (info.context?.resolution) {
        output += `  → Note: ${info.context.resolution}\n`;
      }
      output += '\n';
    });
  }

  if (result.isValid) {
    output += '✓ Validation passed - no blocking errors\n';
  } else {
    output += `✗ Validation failed - ${result.errors.length} error(s) must be resolved\n`;
  }

  return output;
}
