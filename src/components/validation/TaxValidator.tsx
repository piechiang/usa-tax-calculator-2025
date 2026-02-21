import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface TaxFormData {
  ssn?: string;
  filingStatus?: string;
  wages?: number | string;
  mortgageInterest?: number | string;
  stateLocalTaxes?: number | string;
  charitableContributions?: number | string;
  adjustedGrossIncome?: number;
  businessIncome?: number | string;
  grossReceipts?: number | string;
  businessExpenses?: number | string;
  federalWithholding?: number | string;
  capitalGains?: number | string;
  personalInfo?: {
    ssn?: string;
    filingStatus?: string;
    [key: string]: unknown;
  };
  spouseInfo?: {
    ssn?: string;
    [key: string]: unknown;
  };
  incomeData?: {
    wages?: string | number;
    businessIncome?: string | number;
    capitalGains?: string | number;
    [key: string]: unknown;
  };
  businessDetails?: {
    grossReceipts?: string | number;
    businessExpenses?: string | number;
    [key: string]: unknown;
  };
  paymentsData?: {
    federalWithholding?: string | number;
    [key: string]: unknown;
  };
  deductions?: {
    mortgageInterest?: number | string;
    stateLocalTaxes?: number | string;
    charitableContributions?: number | string;
    [key: string]: unknown;
  };
  taxResult?: {
    balance?: number;
    adjustedGrossIncome?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ValidationRule {
  field: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  condition: (data: TaxFormData) => boolean;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationRule[];
  warnings: ValidationRule[];
  info: ValidationRule[];
}

export const TAX_VALIDATION_RULES: ValidationRule[] = [
  // SSN Validation
  {
    field: 'personalInfo.ssn',
    type: 'error',
    message: 'SSN must be in format XXX-XX-XXXX',
    condition: (data) => {
      const ssn = data.personalInfo?.ssn;
      return !ssn || !/^\d{3}-\d{2}-\d{4}$/.test(ssn);
    },
  },
  {
    field: 'spouseInfo.ssn',
    type: 'error',
    message: 'Spouse SSN must be in format XXX-XX-XXXX',
    condition: (data) => {
      const ssn = data.spouseInfo?.ssn;
      const isMarried = data.personalInfo?.filingStatus?.includes('married') ?? false;
      return Boolean(isMarried && ssn && !/^\d{3}-\d{2}-\d{4}$/.test(ssn));
    },
  },

  // Income Validation
  {
    field: 'incomeData.wages',
    type: 'warning',
    message: 'Wages seem unusually high',
    condition: (data) => parseFloat(String(data.incomeData?.wages ?? '0')) > 500000,
    suggestion: 'Verify W-2 forms for accuracy',
  },
  {
    field: 'incomeData.wages',
    type: 'info',
    message: 'Consider contributing to retirement accounts',
    condition: (data) => parseFloat(String(data.incomeData?.wages ?? '0')) > 50000,
    suggestion: '401(k) and IRA contributions can reduce taxable income',
  },

  // Deduction Validation
  {
    field: 'deductions.mortgageInterest',
    type: 'warning',
    message: 'Mortgage interest exceeds typical limits',
    condition: (data) => parseFloat(String(data.deductions?.mortgageInterest ?? '0')) > 100000,
    suggestion: 'Mortgage interest is limited for loans over $750,000',
  },
  {
    field: 'deductions.stateLocalTaxes',
    type: 'warning',
    message: 'SALT deduction limited to $10,000',
    condition: (data) => parseFloat(String(data.deductions?.stateLocalTaxes ?? '0')) > 10000,
    suggestion: 'State and local tax deduction is capped at $10,000',
  },
  {
    field: 'deductions.charitableContributions',
    type: 'info',
    message: 'Large charitable contributions may require documentation',
    condition: (data) => {
      const contributions = parseFloat(String(data.deductions?.charitableContributions ?? '0'));
      const agi = data.taxResult?.adjustedGrossIncome ?? 0;
      return contributions > agi * 0.6;
    },
    suggestion: 'Keep receipts and acknowledgments for charitable gifts',
  },

  // Business Income Validation
  {
    field: 'incomeData.businessIncome',
    type: 'info',
    message: 'Business income may require Schedule C',
    condition: (data) => parseFloat(String(data.incomeData?.businessIncome ?? '0')) > 0,
    suggestion: 'File Schedule C for business profit or loss',
  },
  {
    field: 'businessDetails.grossReceipts',
    type: 'warning',
    message: 'Business expenses exceed receipts',
    condition: (data) => {
      const receipts = parseFloat(String(data.businessDetails?.grossReceipts ?? '0'));
      const expenses = parseFloat(String(data.businessDetails?.businessExpenses ?? '0'));
      return expenses > receipts && receipts > 0;
    },
    suggestion: 'Review business expense calculations',
  },

  // Payment Validation
  {
    field: 'paymentsData.federalWithholding',
    type: 'warning',
    message: 'Federal withholding seems low for income level',
    condition: (data) => {
      const withholding = parseFloat(String(data.paymentsData?.federalWithholding ?? '0'));
      const wages = parseFloat(String(data.incomeData?.wages ?? '0'));
      return wages > 50000 && withholding < wages * 0.1;
    },
    suggestion: 'You may owe taxes if withholding is insufficient',
  },

  // Capital Gains Validation
  {
    field: 'incomeData.capitalGains',
    type: 'info',
    message: 'Capital gains may qualify for preferential rates',
    condition: (data) => parseFloat(String(data.incomeData?.capitalGains ?? '0')) > 1000,
    suggestion: 'Long-term capital gains have lower tax rates',
  },

  // Filing Status Validation
  {
    field: 'personalInfo.filingStatus',
    type: 'info',
    message: 'Consider comparing filing jointly vs separately',
    condition: (data) => data.personalInfo?.filingStatus === 'marriedJointly',
    suggestion: 'Sometimes filing separately results in lower taxes',
  },

  // Estimated Tax Validation
  {
    field: 'taxResult.balance',
    type: 'warning',
    message: 'Large balance due may result in penalties',
    condition: (data) => (data.taxResult?.balance ?? 0) > 1000,
    suggestion: 'Consider making estimated tax payments for next year',
  },
];

interface TaxValidatorProps {
  formData: TaxFormData;
  t: (key: string) => string;
}

export const TaxValidator: React.FC<TaxValidatorProps> = ({ formData, t }) => {
  const validateTaxData = (data: TaxFormData): ValidationResult => {
    const errors: ValidationRule[] = [];
    const warnings: ValidationRule[] = [];
    const info: ValidationRule[] = [];

    TAX_VALIDATION_RULES.forEach((rule) => {
      if (rule.condition(data)) {
        switch (rule.type) {
          case 'error':
            errors.push(rule);
            break;
          case 'warning':
            warnings.push(rule);
            break;
          case 'info':
            info.push(rule);
            break;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  };

  const validation = validateTaxData(formData);

  const renderValidationItem = (item: ValidationRule, index: number) => {
    const icons = {
      error: <AlertCircle className="w-4 h-4 text-red-500" />,
      warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      info: <Info className="w-4 h-4 text-blue-500" />,
    };

    const colors = {
      error: 'border-red-200 bg-red-50',
      warning: 'border-yellow-200 bg-yellow-50',
      info: 'border-blue-200 bg-blue-50',
    };

    return (
      <div key={index} className={`p-3 border rounded-lg ${colors[item.type]}`}>
        <div className="flex items-start gap-2">
          {icons[item.type]}
          <div className="flex-1">
            <div className="font-medium text-gray-900">{item.message}</div>
            {item.suggestion && <div className="text-sm text-gray-600 mt-1">{item.suggestion}</div>}
          </div>
        </div>
      </div>
    );
  };

  if (
    validation.errors.length === 0 &&
    validation.warnings.length === 0 &&
    validation.info.length === 0
  ) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <h3 className="font-semibold">{t('validation.allClear')}</h3>
        </div>
        <p className="text-gray-600 mt-2">{t('validation.noIssuesFound')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        {t('validation.title')}
      </h3>

      <div className="space-y-6">
        {validation.errors.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {t('validation.errors')} ({validation.errors.length})
            </h4>
            <div className="space-y-2">{validation.errors.map(renderValidationItem)}</div>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div>
            <h4 className="font-medium text-yellow-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('validation.warnings')} ({validation.warnings.length})
            </h4>
            <div className="space-y-2">{validation.warnings.map(renderValidationItem)}</div>
          </div>
        )}

        {validation.info.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('validation.suggestions')} ({validation.info.length})
            </h4>
            <div className="space-y-2">{validation.info.map(renderValidationItem)}</div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">{t('validation.reminder')}</span>
        </div>
        <p className="text-sm text-gray-600">{t('validation.reminderText')}</p>
      </div>
    </div>
  );
};
