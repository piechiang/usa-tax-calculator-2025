/**
 * Tax Calculation Diagnostic Codes and Messages
 *
 * This system provides detailed error messages, warnings, and guidance
 * for tax professionals and users to quickly identify and resolve issues.
 *
 * Severity Levels:
 * - ERROR: Blocking issue that prevents accurate calculation
 * - WARNING: Potential issue that should be reviewed
 * - INFO: Informational message for awareness
 *
 * Each diagnostic includes:
 * - Unique code for reference
 * - Human-readable message
 * - IRS form/schedule reference
 * - Resolution guidance
 * - Relevant IRC section (where applicable)
 */

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface DiagnosticCode {
  code: string;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
  form?: string; // IRS form reference
  schedule?: string; // IRS schedule reference
  ircSection?: string; // IRC section reference
  resolution?: string; // How to resolve
  url?: string; // IRS guidance URL
}

/**
 * Income Validation Diagnostics
 */
export const INCOME_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  W2_EXCEEDS_WAGE_BASE: {
    code: 'INC001',
    severity: 'warning',
    title: 'W-2 Wages Exceed Social Security Wage Base',
    message: 'W-2 wages exceed the Social Security wage base for 2025 ($176,100). Verify that excess OASDI tax was withheld.',
    form: 'Form 1040',
    schedule: 'Schedule 3',
    resolution: 'If excess Social Security tax was withheld, you may be eligible for a credit on Schedule 3, Line 11.',
    url: 'https://www.irs.gov/forms-pubs/about-schedule-3-form-1040',
  },

  QUALIFIED_DIVIDENDS_EXCEED_ORDINARY: {
    code: 'INC002',
    severity: 'error',
    title: 'Qualified Dividends Exceed Ordinary Dividends',
    message: 'Qualified dividends cannot exceed total ordinary dividends.',
    form: 'Form 1040',
    resolution: 'Review Form 1099-DIV, Box 1a (ordinary dividends) and Box 1b (qualified dividends). Qualified dividends are a subset of ordinary dividends.',
  },

  NEGATIVE_CAPITAL_LOSS_CARRYOVER: {
    code: 'INC003',
    severity: 'info',
    title: 'Capital Loss Carryover Detected',
    message: 'Net capital loss exceeds $3,000 annual deduction limit. Excess carries forward to next year.',
    form: 'Schedule D',
    ircSection: '§1211',
    resolution: 'Complete Schedule D to calculate capital loss carryforward. Retain for next year\'s return.',
    url: 'https://www.irs.gov/forms-pubs/about-schedule-d-form-1040',
  },

  SSTB_HIGH_INCOME_NO_QBI: {
    code: 'INC004',
    severity: 'warning',
    title: 'SSTB Income Above Threshold',
    message: 'Specified Service Trade or Business (SSTB) income with taxable income above $247,300 (single) / $494,600 (MFJ) receives no QBI deduction.',
    form: 'Form 8995-A',
    ircSection: '§199A',
    resolution: 'Consider income timing strategies or entity restructuring. Consult tax professional for SSTB planning.',
  },
};

/**
 * Deduction Validation Diagnostics
 */
export const DEDUCTION_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  SALT_EXCEEDS_CAP: {
    code: 'DED001',
    severity: 'info',
    title: 'SALT Deduction Capped at $10,000',
    message: 'State and local tax deduction is limited to $10,000 ($5,000 if married filing separately).',
    schedule: 'Schedule A',
    ircSection: '§164(b)(6)',
    resolution: 'Maximum deduction applied. Consider state-specific workarounds (e.g., entity-level tax elections).',
  },

  MEDICAL_BELOW_THRESHOLD: {
    code: 'DED002',
    severity: 'info',
    title: 'Medical Expenses Below AGI Threshold',
    message: 'Medical expenses must exceed 7.5% of AGI to be deductible.',
    schedule: 'Schedule A',
    ircSection: '§213',
    resolution: 'Medical expenses below threshold provide no deduction. Consider timing elective procedures or using HSA/FSA.',
  },

  STANDARD_DEDUCTION_PREFERABLE: {
    code: 'DED003',
    severity: 'info',
    title: 'Standard Deduction Exceeds Itemized',
    message: 'Standard deduction is higher than itemized deductions. Standard deduction will be used.',
    form: 'Form 1040',
    resolution: 'Standard deduction automatically applied. Itemized deductions listed for reference only.',
  },

  QBI_WAGE_LIMITATION: {
    code: 'DED004',
    severity: 'warning',
    title: 'QBI Deduction Limited by W-2 Wages',
    message: 'QBI deduction reduced due to insufficient W-2 wages paid by business.',
    form: 'Form 8995-A',
    ircSection: '§199A(b)(2)',
    resolution: 'Consider increasing W-2 wages to owner-employees or acquiring depreciable property (UBIA) to increase deduction.',
  },

  EXCESS_BUSINESS_LOSS: {
    code: 'DED005',
    severity: 'warning',
    title: 'Excess Business Loss Limitation',
    message: 'Business losses exceed $305,000 (single) / $610,000 (MFJ) threshold. Excess becomes NOL carryforward.',
    form: 'Form 461',
    ircSection: '§461(l)',
    resolution: 'Complete Form 461 to calculate excess business loss. Loss carries forward indefinitely (limited to 80% of taxable income).',
  },
};

/**
 * Credit Validation Diagnostics
 */
export const CREDIT_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  EITC_INVESTMENT_INCOME_LIMIT: {
    code: 'CRD001',
    severity: 'error',
    title: 'EITC Investment Income Exceeds Limit',
    message: 'Investment income exceeds $11,600 limit for Earned Income Tax Credit.',
    form: 'Schedule EIC',
    ircSection: '§32(i)',
    resolution: 'EITC not available. Reduce investment income or consider income timing strategies for future years.',
    url: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit',
  },

  CTC_AGI_PHASE_OUT: {
    code: 'CRD002',
    severity: 'info',
    title: 'Child Tax Credit Phase-Out',
    message: 'Child Tax Credit is being phased out due to AGI exceeding $200,000 (single) / $400,000 (MFJ).',
    form: 'Schedule 8812',
    ircSection: '§24(h)',
    resolution: 'Partial credit applied based on phase-out calculation. Consider income deferral strategies.',
  },

  AOTC_NOT_AVAILABLE_GRADUATE: {
    code: 'CRD003',
    severity: 'warning',
    title: 'AOTC Not Available for Graduate Students',
    message: 'American Opportunity Tax Credit is only for first 4 years of undergraduate education.',
    form: 'Form 8863',
    ircSection: '§25A(i)',
    resolution: 'Consider Lifetime Learning Credit (LLC) instead, which is available for graduate students.',
  },

  SAVERS_CREDIT_STUDENT: {
    code: 'CRD004',
    severity: 'info',
    title: 'Saver\'s Credit Not Available - Full-Time Student',
    message: 'Saver\'s Credit is not available for full-time students (enrolled 5+ months).',
    form: 'Form 8880',
    ircSection: '§25B(c)',
    resolution: 'Credit available in years when not a full-time student. Retirement contributions still beneficial for long-term savings.',
  },

  CHILD_CARE_EARNED_INCOME: {
    code: 'CRD005',
    severity: 'warning',
    title: 'Child Care Credit Limited by Earned Income',
    message: 'Child care expenses exceed earned income. Credit limited to lesser of expenses or earned income.',
    form: 'Form 2441',
    ircSection: '§21(d)',
    resolution: 'Credit calculated on lower amount. Consider dependent care FSA for additional tax savings.',
  },
};

/**
 * Self-Employment Diagnostics
 */
export const SE_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  SE_HEALTH_INSURANCE_EXCEEDS_PROFIT: {
    code: 'SE001',
    severity: 'error',
    title: 'Health Insurance Deduction Exceeds Net Profit',
    message: 'Self-employed health insurance deduction cannot exceed net profit from business.',
    schedule: 'Schedule 1',
    ircSection: '§162(l)',
    resolution: 'Deduction limited to net SE income. Excess premiums may be deductible as itemized medical expenses (subject to 7.5% AGI floor).',
  },

  SE_RETIREMENT_EXCEEDS_LIMIT: {
    code: 'SE002',
    severity: 'error',
    title: 'Self-Employed Retirement Contribution Exceeds Limit',
    message: 'Self-employed retirement plan contribution exceeds maximum for plan type.',
    schedule: 'Schedule 1',
    form: 'Form 5500',
    ircSection: '§404',
    resolution: 'Reduce contribution to maximum allowed. For SEP IRA: 25% of net SE income (max $69,000). For Solo 401(k): $69,000 total ($76,500 if age 50+).',
    url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-contributions',
  },

  SE_QBI_NO_WAGES: {
    code: 'SE003',
    severity: 'warning',
    title: 'QBI Deduction Limited - No W-2 Wages',
    message: 'Sole proprietorship with QBI but no W-2 wages may face limitations above income threshold.',
    form: 'Form 8995-A',
    resolution: 'Consider S-Corp election to pay reasonable W-2 wages, or acquire depreciable property to increase UBIA.',
  },

  SE_TAX_SOCIAL_SECURITY_MAX: {
    code: 'SE004',
    severity: 'info',
    title: 'Social Security Tax at Maximum',
    message: 'Self-employment income subject to Social Security tax has reached the maximum wage base ($176,100).',
    schedule: 'Schedule SE',
    resolution: 'Additional SE income will only be subject to Medicare tax (2.9% plus 0.9% if applicable).',
  },
};

/**
 * AMT Diagnostics
 */
export const AMT_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  AMT_TRIGGERED: {
    code: 'AMT001',
    severity: 'warning',
    title: 'Alternative Minimum Tax Applies',
    message: 'Tentative minimum tax exceeds regular tax. AMT applies.',
    form: 'Form 6251',
    ircSection: '§55',
    resolution: 'AMT calculated and added to tax liability. Consider strategies to reduce AMT adjustments and preferences.',
    url: 'https://www.irs.gov/forms-pubs/about-form-6251',
  },

  AMT_ISO_SPREAD: {
    code: 'AMT002',
    severity: 'info',
    title: 'ISO Exercise Creates AMT Preference',
    message: 'Incentive Stock Option (ISO) bargain element creates AMT preference item.',
    form: 'Form 6251',
    ircSection: '§56(b)(3)',
    resolution: 'AMT credit may be available in future years when regular tax exceeds TMT. Consider exercising ISOs over multiple years.',
  },

  AMT_EXEMPTION_PHASEOUT: {
    code: 'AMT003',
    severity: 'info',
    title: 'AMT Exemption Being Phased Out',
    message: 'AMT exemption is reduced by 25% of AMTI exceeding threshold.',
    form: 'Form 6251',
    resolution: 'Higher income reduces AMT exemption. Consider income deferral or timing of AMT preference items.',
  },
};

/**
 * Data Integrity Diagnostics
 */
export const DATA_INTEGRITY_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  MISSING_SPOUSE_DATA: {
    code: 'DATA001',
    severity: 'error',
    title: 'Missing Spouse Information',
    message: 'Married filing jointly but spouse information is incomplete.',
    form: 'Form 1040',
    resolution: 'Provide spouse name, SSN, and date of birth for MFJ return.',
  },

  INVALID_SSN_FORMAT: {
    code: 'DATA002',
    severity: 'error',
    title: 'Invalid SSN Format',
    message: 'Social Security Number format is invalid.',
    form: 'Form 1040',
    resolution: 'SSN must be 9 digits in format XXX-XX-XXXX. Verify against Social Security card.',
  },

  DEPENDENT_AGE_MISMATCH: {
    code: 'DATA003',
    severity: 'warning',
    title: 'Dependent Age Inconsistency',
    message: 'Dependent claimed for CTC but age exceeds limit (17+).',
    form: 'Schedule 8812',
    resolution: 'Child Tax Credit only available for children under 17. Consider Other Dependent Credit if qualifying relative.',
  },

  EDUCATION_EXPENSES_MISSING_SCHOOL: {
    code: 'DATA004',
    severity: 'error',
    title: 'Education Expenses Missing School Information',
    message: 'Education credits require school name and EIN.',
    form: 'Form 8863',
    resolution: 'Obtain Form 1098-T from educational institution. Enter school name and EIN from Form 1098-T.',
  },

  QBI_BUSINESS_MISSING_INFO: {
    code: 'DATA005',
    severity: 'warning',
    title: 'QBI Business Information Incomplete',
    message: 'QBI deduction calculation requires W-2 wages and UBIA for businesses above income threshold.',
    form: 'Form 8995-A',
    resolution: 'Provide W-2 wages paid to employees and unadjusted basis of qualified property (UBIA) for each business.',
  },
};

/**
 * Filing Status Diagnostics
 */
export const FILING_STATUS_DIAGNOSTICS: Record<string, DiagnosticCode> = {
  MFS_DISADVANTAGE: {
    code: 'FS001',
    severity: 'info',
    title: 'Married Filing Separately May Be Disadvantageous',
    message: 'Married filing separately has lower income thresholds and phase-outs for most credits and deductions.',
    form: 'Form 1040',
    resolution: 'Consider married filing jointly unless specific reasons require MFS (e.g., injured spouse, separate liability).',
  },

  HOH_QUALIFICATION: {
    code: 'FS002',
    severity: 'warning',
    title: 'Verify Head of Household Qualification',
    message: 'Head of Household requires qualifying person and payment of more than half household costs.',
    form: 'Form 1040',
    ircSection: '§2(b)',
    resolution: 'Confirm qualifying person lived with you > 6 months and you paid > 50% of household maintenance costs.',
    url: 'https://www.irs.gov/filing/choose-the-right-filing-status',
  },
};

/**
 * Get all diagnostic codes as a flat array
 */
export function getAllDiagnosticCodes(): DiagnosticCode[] {
  return [
    ...Object.values(INCOME_DIAGNOSTICS),
    ...Object.values(DEDUCTION_DIAGNOSTICS),
    ...Object.values(CREDIT_DIAGNOSTICS),
    ...Object.values(SE_DIAGNOSTICS),
    ...Object.values(AMT_DIAGNOSTICS),
    ...Object.values(DATA_INTEGRITY_DIAGNOSTICS),
    ...Object.values(FILING_STATUS_DIAGNOSTICS),
  ];
}

/**
 * Get diagnostic by code
 */
export function getDiagnosticByCode(code: string): DiagnosticCode | undefined {
  return getAllDiagnosticCodes().find((d) => d.code === code);
}

/**
 * Get diagnostics by severity
 */
export function getDiagnosticsBySeverity(
  severity: DiagnosticSeverity
): DiagnosticCode[] {
  return getAllDiagnosticCodes().filter((d) => d.severity === severity);
}
