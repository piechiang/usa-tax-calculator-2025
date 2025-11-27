import React, { useState } from 'react';
import { Shield, FileCheck, Download, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

import type { TaxContextValue } from '../../contexts/TaxContext';

type AuditSupportTab = 'documentation' | 'report' | 'checklist';

interface AuditDocument {
  id: string;
  title: string;
  category: 'income' | 'deductions' | 'credits' | 'payments' | 'other';
  required: boolean;
  description: string;
  status: 'missing' | 'uploaded' | 'verified';
}

type DocumentStatus = 'missing' | 'uploaded' | 'verified';

interface AuditSupportFormData {
  personalInfo: TaxContextValue['personalInfo'];
  incomeData: TaxContextValue['incomeData'];
  deductions: TaxContextValue['deductions'];
  paymentsData: TaxContextValue['paymentsData'];
}

interface AuditSupportProps {
  formData: AuditSupportFormData;
  taxResult: TaxContextValue['taxResult'];
  t: (key: string) => string;
}

export const AuditSupport: React.FC<AuditSupportProps> = ({
  formData,
  taxResult,
  t
}) => {
  const [activeTab, setActiveTab] = useState<AuditSupportTab>('documentation');
  const [documentStatus, setDocumentStatus] = useState<Record<string, DocumentStatus>>({});

  const getRequiredDocuments = (): AuditDocument[] => {
    const documents: AuditDocument[] = [];
    const income = formData.incomeData || {};
    const deductions = formData.deductions || {};
    const payments = formData.paymentsData || {};

    // Income documentation
    if (parseFloat(income.wages || '0') > 0) {
      documents.push({
        id: 'w2-forms',
        title: 'W-2 Forms',
        category: 'income',
        required: true,
        description: 'All W-2 forms from employers',
        status: documentStatus['w2-forms'] || 'missing'
      });
    }

    if (parseFloat(income.interestIncome || '0') > 10) {
      documents.push({
        id: '1099-int',
        title: '1099-INT Forms',
        category: 'income',
        required: true,
        description: 'Interest income statements',
        status: documentStatus['1099-int'] || 'missing'
      });
    }

    if (parseFloat(income.dividends || '0') > 10) {
      documents.push({
        id: '1099-div',
        title: '1099-DIV Forms',
        category: 'income',
        required: true,
        description: 'Dividend income statements',
        status: documentStatus['1099-div'] || 'missing'
      });
    }

    if (parseFloat(income.capitalGains || '0') !== 0) {
      documents.push({
        id: '1099-b',
        title: '1099-B Forms',
        category: 'income',
        required: true,
        description: 'Brokerage statements for capital gains/losses',
        status: documentStatus['1099-b'] || 'missing'
      });
    }

    if (parseFloat(income.businessIncome || '0') > 0) {
      documents.push({
        id: 'business-records',
        title: 'Business Income Records',
        category: 'income',
        required: true,
        description: 'Business income and expense records',
        status: documentStatus['business-records'] || 'missing'
      });
    }

    // Deduction documentation
    if (!deductions.useStandardDeduction) {
      if (parseFloat(deductions.mortgageInterest || '0') > 0) {
        documents.push({
          id: '1098-mortgage',
          title: '1098 Mortgage Interest',
          category: 'deductions',
          required: true,
          description: 'Mortgage interest statements',
          status: documentStatus['1098-mortgage'] || 'missing'
        });
      }

      if (parseFloat(deductions.charitableContributions || '0') > 250) {
        documents.push({
          id: 'charity-receipts',
          title: 'Charitable Contribution Receipts',
          category: 'deductions',
          required: true,
          description: 'Receipts for charitable donations over $250',
          status: documentStatus['charity-receipts'] || 'missing'
        });
      }

      if (parseFloat(deductions.medicalExpenses || '0') > 0) {
        documents.push({
          id: 'medical-receipts',
          title: 'Medical Expense Receipts',
          category: 'deductions',
          required: true,
          description: 'Medical and dental expense receipts',
          status: documentStatus['medical-receipts'] || 'missing'
        });
      }

      if (parseFloat(deductions.stateLocalTaxes || '0') > 0) {
        documents.push({
          id: 'property-tax',
          title: 'Property Tax Statements',
          category: 'deductions',
          required: true,
          description: 'Property tax and state income tax records',
          status: documentStatus['property-tax'] || 'missing'
        });
      }
    }

    // Payment documentation
    if (parseFloat(payments.federalWithholding || '0') > 0) {
      documents.push({
        id: 'withholding-statements',
        title: 'Tax Withholding Statements',
        category: 'payments',
        required: true,
        description: 'Federal and state tax withholding records',
        status: documentStatus['withholding-statements'] || 'missing'
      });
    }

    if (parseFloat(payments.estimatedTaxPayments || '0') > 0) {
      documents.push({
        id: 'estimated-payments',
        title: 'Estimated Tax Payment Records',
        category: 'payments',
        required: true,
        description: 'Quarterly estimated tax payment confirmations',
        status: documentStatus['estimated-payments'] || 'missing'
      });
    }

    // General documents
    documents.push(
      {
        id: 'social-security-card',
        title: 'Social Security Card',
        category: 'other',
        required: true,
        description: 'Social Security card for taxpayer and dependents',
        status: documentStatus['social-security-card'] || 'missing'
      },
      {
        id: 'birth-certificates',
        title: 'Birth Certificates',
        category: 'other',
        required: formData.personalInfo?.dependents > 0,
        description: 'Birth certificates for dependents',
        status: documentStatus['birth-certificates'] || 'missing'
      },
      {
        id: 'prior-year-return',
        title: 'Prior Year Tax Return',
        category: 'other',
        required: false,
        description: 'Previous year tax return for reference',
        status: documentStatus['prior-year-return'] || 'missing'
      }
    );

    return documents;
  };

  const updateDocumentStatus = (id: string, status: DocumentStatus) => {
    setDocumentStatus(prev => ({ ...prev, [id]: status }));
  };

  const generateAuditReport = () => {
    const report = {
      taxpayerInfo: {
        name: `${formData.personalInfo?.firstName} ${formData.personalInfo?.lastName}`,
        ssn: formData.personalInfo?.ssn,
        filingStatus: formData.personalInfo?.filingStatus,
        address: formData.personalInfo?.address
      },
      taxSummary: {
        adjustedGrossIncome: taxResult.adjustedGrossIncome,
        taxableIncome: taxResult.taxableIncome,
        totalTax: taxResult.totalTax,
        totalPayments: taxResult.totalPayments,
        balance: taxResult.balance
      },
      incomeBreakdown: {
        wages: parseFloat(formData.incomeData?.wages || '0'),
        interestIncome: parseFloat(formData.incomeData?.interestIncome || '0'),
        dividends: parseFloat(formData.incomeData?.dividends || '0'),
        capitalGains: parseFloat(formData.incomeData?.capitalGains || '0'),
        businessIncome: parseFloat(formData.incomeData?.businessIncome || '0'),
        otherIncome: parseFloat(formData.incomeData?.otherIncome || '0')
      },
      deductions: formData.deductions,
      payments: formData.paymentsData,
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(report, null, 2);
  };

  const downloadAuditReport = () => {
    const report = generateAuditReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${new Date().getFullYear()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const auditChecklist = [
    {
      item: 'Verify all income sources are reported',
      completed: Object.values(formData.incomeData || {}).some(value => parseFloat(String(value) || '0') > 0)
    },
    {
      item: 'Ensure all deductions are properly documented',
      completed: getRequiredDocuments().filter(d => d.category === 'deductions').every(d => d.status === 'verified')
    },
    {
      item: 'Confirm tax payments and withholdings',
      completed: Object.values(formData.paymentsData || {}).some(value => parseFloat(String(value) || '0') > 0)
    },
    {
      item: 'Review filing status and dependents',
      completed: formData.personalInfo?.filingStatus && formData.personalInfo?.firstName
    },
    {
      item: 'Double-check all calculations',
      completed: taxResult.totalTax > 0
    }
  ];

  const tabItems: Array<{
    id: AuditSupportTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'documentation', label: t('audit.documentation'), icon: FileCheck },
    { id: 'report', label: t('audit.report'), icon: Download },
    { id: 'checklist', label: t('audit.checklist'), icon: CheckCircle }
  ];

  const renderDocumentationTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{t('audit.requiredDocuments')}</h4>
        <div className="text-sm text-gray-600">
          {getRequiredDocuments().filter(d => d.status === 'verified').length} / {getRequiredDocuments().length} verified
        </div>
      </div>

      {['income', 'deductions', 'payments', 'other'].map(category => {
        const categoryDocs = getRequiredDocuments().filter(d => d.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <div key={category} className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3 capitalize">{category}</h5>
            <div className="space-y-2">
              {categoryDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doc.title}</span>
                      {doc.required && <span className="text-red-500 text-xs">*Required</span>}
                    </div>
                    <div className="text-sm text-gray-600">{doc.description}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={doc.status}
                      onChange={e => updateDocumentStatus(doc.id, e.target.value as DocumentStatus)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="missing">Missing</option>
                      <option value="uploaded">Uploaded</option>
                      <option value="verified">Verified</option>
                    </select>

                    {doc.status === 'missing' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {doc.status === 'uploaded' && <Eye className="w-4 h-4 text-yellow-500" />}
                    {doc.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderReportTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{t('audit.auditReport')}</h4>
        <button
          onClick={downloadAuditReport}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Taxpayer Information</h5>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-600">Name:</span> {formData.personalInfo?.firstName} {formData.personalInfo?.lastName}</div>
            <div><span className="text-gray-600">SSN:</span> {formData.personalInfo?.ssn}</div>
            <div><span className="text-gray-600">Filing Status:</span> {formData.personalInfo?.filingStatus}</div>
            <div><span className="text-gray-600">Address:</span> {formData.personalInfo?.address}</div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Tax Summary</h5>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-600">AGI:</span> ${taxResult.adjustedGrossIncome?.toLocaleString()}</div>
            <div><span className="text-gray-600">Taxable Income:</span> ${taxResult.taxableIncome?.toLocaleString()}</div>
            <div><span className="text-gray-600">Total Tax:</span> ${taxResult.totalTax?.toLocaleString()}</div>
            <div><span className="text-gray-600">Payments:</span> ${taxResult.totalPayments?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-3">Income Breakdown</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-600">Wages:</span> ${parseFloat(formData.incomeData?.wages || '0').toLocaleString()}</div>
          <div><span className="text-gray-600">Interest:</span> ${parseFloat(formData.incomeData?.interestIncome || '0').toLocaleString()}</div>
          <div><span className="text-gray-600">Dividends:</span> ${parseFloat(formData.incomeData?.dividends || '0').toLocaleString()}</div>
          <div><span className="text-gray-600">Capital Gains:</span> ${parseFloat(formData.incomeData?.capitalGains || '0').toLocaleString()}</div>
          <div><span className="text-gray-600">Business:</span> ${parseFloat(formData.incomeData?.businessIncome || '0').toLocaleString()}</div>
          <div><span className="text-gray-600">Other:</span> ${parseFloat(formData.incomeData?.otherIncome || '0').toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  const renderChecklistTab = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-4">{t('audit.preparationChecklist')}</h4>

      <div className="space-y-3">
        {auditChecklist.map((item, index) => (
          <div key={index} className={`flex items-center gap-3 p-3 rounded ${item.completed ? 'bg-green-50' : 'bg-red-50'}`}>
            {item.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span className={item.completed ? 'text-green-800' : 'text-red-800'}>{item.item}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">{t('audit.auditTips')}</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>{t('audit.tips.tip1')}</li>
          <li>{t('audit.tips.tip2')}</li>
          <li>{t('audit.tips.tip3')}</li>
          <li>{t('audit.tips.tip4')}</li>
          <li>{t('audit.tips.tip5')}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-green-600" />
        {t('audit.title')}
      </h3>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'documentation' && renderDocumentationTab()}
      {activeTab === 'report' && renderReportTab()}
      {activeTab === 'checklist' && renderChecklistTab()}
    </div>
  );
};
