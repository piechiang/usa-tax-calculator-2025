/**
 * Structured Federal Tax Diagnostic Codes
 *
 * These codes provide machine-readable error/warning information
 * for tax calculation diagnostics.
 *
 * Code format: [CATEGORY]-[SEVERITY]-[NUMBER]
 *
 * Categories:
 * - INPUT: Input validation issues
 * - CALC: Calculation issues or edge cases
 * - CREDIT: Credit-specific issues
 * - FORM: Form/filing issues
 *
 * Severity:
 * - E: Error (prevents calculation)
 * - W: Warning (calculation continues, but user should review)
 * - I: Info (informational message)
 */

export type DiagnosticCode =
  // Input Validation Errors
  | 'INPUT-E-001' // Missing required field
  | 'INPUT-E-002' // Invalid filing status
  | 'INPUT-E-003' // Invalid date format
  | 'INPUT-E-004' // Negative value in non-negative field
  | 'INPUT-E-005' // Income exceeds reasonable limits

  // Input Validation Warnings
  | 'INPUT-W-001' // Unusual income ratio (e.g., wages >> AGI)
  | 'INPUT-W-002' // Missing dependent information
  | 'INPUT-W-003' // Estimated tax payment seems low
  | 'INPUT-W-004' // Withholding seems unusually high/low
  | 'INPUT-W-005' // Multiple income sources without proper documentation

  // Calculation Warnings
  | 'CALC-W-001' // Alternative Minimum Tax (AMT) may apply
  | 'CALC-W-002' // Net Investment Income Tax (NIIT) applies
  | 'CALC-W-003' // Additional Medicare Tax applies
  | 'CALC-W-004' // Self-employment tax calculation triggered
  | 'CALC-W-005' // Qualified Business Income (QBI) deduction limited
  | 'CALC-W-006' // SALT deduction capped at $10,000
  | 'CALC-W-007' // Itemized deductions less than standard deduction
  | 'CALC-W-008' // Forced itemized overrides higher standard deduction

  // Payment Warnings
  | 'PAYMENT-W-001' // Payments significantly exceed tax liability
  | 'PAYMENT-W-002' // Large refund — possible overwithholding
  | 'PAYMENT-W-003' // Significant balance owed — possible underpayment penalty

  // NOL Warnings
  | 'NOL-W-001' // Excess NOL carried forward to future years

  // Schedule 1 Adjustment Warnings
  | 'CALC-W-010' // Educator expenses capped at maximum
  | 'CALC-W-011' // IRA deduction reduced due to income phaseout
  | 'CALC-W-012' // IRA deduction fully phased out
  | 'CALC-W-013' // Student loan interest reduced due to income phaseout
  | 'CALC-W-014' // Student loan interest not allowed for MFS
  | 'CALC-W-015' // SEP/SIMPLE contribution limited by income
  | 'CALC-W-016' // Self-employed health insurance limited to net profit
  | 'CALC-W-017' // Alimony not deductible for post-2018 divorce
  | 'CALC-W-018' // HSA contribution may exceed limits
  | 'CALC-W-019' // NOL deduction limited to 80% of taxable income

  // Calculation Info
  | 'CALC-I-001' // Standard deduction used
  | 'CALC-I-002' // Itemized deductions used
  | 'CALC-I-003' // Capital gains preferential rate applied
  | 'CALC-I-004' // Qualified dividends preferential rate applied

  // Credit Warnings
  | 'CREDIT-W-001' // Child Tax Credit phase-out applies
  | 'CREDIT-W-002' // Earned Income Tax Credit (EITC) phase-out applies
  | 'CREDIT-W-003' // Education credit phase-out applies
  | 'CREDIT-W-004' // Cannot claim both AOTC and LLC for same student
  | 'CREDIT-W-005' // EITC requires valid SSN for all dependents
  | 'CREDIT-W-006' // Child Tax Credit requires child under 17

  // Credit Info
  | 'CREDIT-I-001' // EITC claimed
  | 'CREDIT-I-002' // Child Tax Credit claimed
  | 'CREDIT-I-003' // American Opportunity Tax Credit claimed
  | 'CREDIT-I-004' // Lifetime Learning Credit claimed
  | 'CREDIT-I-005' // Dependent care credit available but not claimed

  // Filing Warnings
  | 'FORM-W-001' // May need to file Schedule C (business income)
  | 'FORM-W-002' // May need to file Schedule D (capital gains)
  | 'FORM-W-003' // May need to file Schedule E (rental income)
  | 'FORM-W-004' // May need to file Form 8949 (investment sales)
  | 'FORM-W-005' // May need to file Schedule SE (self-employment)
  | 'FORM-W-006' // May need to file Form 8959 (Additional Medicare Tax)
  | 'FORM-W-007' // May need to file Form 8960 (Net Investment Income Tax)

  // Filing Info
  | 'FORM-I-001' // Standard Form 1040 sufficient
  | 'FORM-I-002' // Filing deadline April 15, 2026
  | 'FORM-I-003'; // Extension available until October 15, 2026;

/**
 * Diagnostic message templates
 */
export const DIAGNOSTIC_MESSAGES: Record<DiagnosticCode, string> = {
  // Input Errors
  'INPUT-E-001': 'Required field is missing: {field}',
  'INPUT-E-002': 'Invalid filing status: {value}',
  'INPUT-E-003': 'Invalid date format for {field}: {value}',
  'INPUT-E-004': 'Field {field} cannot be negative',
  'INPUT-E-005': 'Income value {field} exceeds reasonable limit: {value}',

  // Input Warnings
  'INPUT-W-001': 'Unusual income ratio detected: {description}',
  'INPUT-W-002': 'Missing information for {count} dependents',
  'INPUT-W-003': 'Estimated tax payments ({amount}) may be insufficient',
  'INPUT-W-004': 'Withholding ({amount}) appears unusual for income level',
  'INPUT-W-005': 'Multiple income sources detected - ensure all forms are included',

  // Calculation Warnings
  'CALC-W-001': 'Alternative Minimum Tax (AMT) calculation triggered - verify deductions',
  'CALC-W-002': 'Net Investment Income Tax (3.8%) applies to {amount} of investment income',
  'CALC-W-003': 'Additional Medicare Tax (0.9%) applies to {amount} above threshold',
  'CALC-W-004': 'Self-employment tax calculated on {amount} of net profit',
  'CALC-W-005': 'Qualified Business Income deduction limited to {amount}',
  'CALC-W-006': 'State and local tax (SALT) deduction capped at $10,000',
  'CALC-W-007': 'Standard deduction ({stdAmount}) exceeds itemized deductions ({itemAmount})',
  'CALC-W-008':
    'Forced itemized deduction ({itemAmount}) is less than standard deduction ({stdAmount})',

  // Payment Warnings
  'PAYMENT-W-001':
    'Payments ({payments}) significantly exceed tax liability ({tax}) — verify withholding accuracy',
  'PAYMENT-W-002': 'Large refund detected ({refund}) — consider adjusting withholding',
  'PAYMENT-W-003':
    'Significant balance owed ({owed}) — may be subject to underpayment penalty (Form 2210)',

  // NOL Warnings
  'NOL-W-001': '{carryforward} NOL will carry forward to future years',

  // Schedule 1 Adjustment Warnings
  'CALC-W-010': 'Educator expenses capped at {max} (requested {requested})',
  'CALC-W-011': 'IRA deduction reduced from {requested} to {allowed} due to income phaseout',
  'CALC-W-012': 'IRA deduction fully phased out - income exceeds {threshold}',
  'CALC-W-013':
    'Student loan interest deduction reduced from {requested} to {allowed} due to income phaseout',
  'CALC-W-014': 'Student loan interest deduction not allowed for Married Filing Separately',
  'CALC-W-015': 'SEP/SIMPLE/401(k) contribution limited to {allowed} (25% of net SE income)',
  'CALC-W-016': 'Self-employed health insurance deduction limited to {allowed} (net profit)',
  'CALC-W-017': 'Alimony paid is not deductible for divorce agreements after 2018',
  'CALC-W-018': 'HSA contribution ({amount}) may exceed annual limits - verify eligibility',
  'CALC-W-019': 'NOL deduction limited to 80% of taxable income: {amount}',

  // Calculation Info
  'CALC-I-001': 'Using standard deduction of {amount}',
  'CALC-I-002': 'Using itemized deductions totaling {amount}',
  'CALC-I-003': 'Preferential capital gains rate applied to {amount}',
  'CALC-I-004': 'Qualified dividends taxed at preferential rate: {amount}',

  // Credit Warnings
  'CREDIT-W-001': 'Child Tax Credit reduced by {amount} due to income phase-out',
  'CREDIT-W-002': 'EITC reduced by {amount} due to income phase-out',
  'CREDIT-W-003': 'Education credit reduced by {amount} due to income phase-out',
  'CREDIT-W-004': 'Cannot claim both AOTC and LLC for student: {studentName}',
  'CREDIT-W-005': 'EITC requires valid SSN for dependents - verify documentation',
  'CREDIT-W-006': 'Child Tax Credit not available for children 17 or older',

  // Credit Info
  'CREDIT-I-001': 'Earned Income Tax Credit claimed: {amount}',
  'CREDIT-I-002': 'Child Tax Credit claimed: {amount} for {count} children',
  'CREDIT-I-003': 'American Opportunity Tax Credit claimed: {amount}',
  'CREDIT-I-004': 'Lifetime Learning Credit claimed: {amount}',
  'CREDIT-I-005': 'Dependent care credit may be available - see Form 2441',

  // Form Warnings
  'FORM-W-001': 'Schedule C (Profit or Loss from Business) may be required',
  'FORM-W-002': 'Schedule D (Capital Gains and Losses) required for {count} transactions',
  'FORM-W-003': 'Schedule E (Rental Income) required',
  'FORM-W-004': 'Form 8949 (Sales of Capital Assets) required',
  'FORM-W-005': 'Schedule SE (Self-Employment Tax) required',
  'FORM-W-006': 'Form 8959 (Additional Medicare Tax) required',
  'FORM-W-007': 'Form 8960 (Net Investment Income Tax) required',

  // Form Info
  'FORM-I-001': 'Standard Form 1040 is sufficient for this return',
  'FORM-I-002': 'Filing deadline: April 15, 2026',
  'FORM-I-003': 'Extension available until October 15, 2026 (file Form 4868)',
};

/**
 * Get severity level from diagnostic code
 */
export function getSeverity(code: DiagnosticCode): 'error' | 'warning' | 'info' {
  if (code.includes('-E-')) return 'error';
  if (code.includes('-W-')) return 'warning';
  return 'info';
}

/**
 * Get category from diagnostic code
 */
export function getCategory(code: DiagnosticCode): 'INPUT' | 'CALC' | 'CREDIT' | 'FORM' {
  const category = code.split('-')[0];

  // Type-safe category extraction
  if (category === 'INPUT' || category === 'CALC' || category === 'CREDIT' || category === 'FORM') {
    return category;
  }

  // Fallback for unexpected categories
  throw new Error(`Invalid diagnostic code category: ${category}`);
}

/**
 * Format diagnostic message with context values
 */
export function formatDiagnosticMessage(
  code: DiagnosticCode,
  context?: Record<string, unknown>
): string {
  let message = DIAGNOSTIC_MESSAGES[code];

  // Safety check: if message is undefined, return a fallback
  if (!message) {
    return `Unknown diagnostic code: ${code}`;
  }

  if (context) {
    // Replace {field}, {value}, etc. with actual values
    Object.entries(context).forEach(([key, value]) => {
      // Safety check: ensure value is not null/undefined before converting to string
      const replacement = value != null ? String(value) : '';
      message = message.replace(`{${key}}`, replacement);
    });
  }

  return message;
}
