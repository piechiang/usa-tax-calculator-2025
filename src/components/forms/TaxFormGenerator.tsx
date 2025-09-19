import React, { useState } from 'react';
import { FileText, Download, Eye, Printer } from 'lucide-react';

interface FormData {
  personalInfo: any;
  incomeData: any;
  deductions: any;
  taxResult: any;
  spouseInfo?: any;
}

interface TaxFormGeneratorProps {
  formData: FormData;
  t: (key: string) => string;
}

export const TaxFormGenerator: React.FC<TaxFormGeneratorProps> = ({
  formData,
  t
}) => {
  const [selectedForms, setSelectedForms] = useState<string[]>(['1040']);
  const [previewForm, setPreviewForm] = useState<string | null>(null);

  const availableForms = [
    {
      id: '1040',
      name: 'Form 1040',
      description: 'U.S. Individual Income Tax Return',
      required: true
    },
    {
      id: 'schedule-a',
      name: 'Schedule A',
      description: 'Itemized Deductions',
      condition: !formData.deductions?.useStandardDeduction
    },
    {
      id: 'schedule-b',
      name: 'Schedule B',
      description: 'Interest and Ordinary Dividends',
      condition: (parseFloat(formData.incomeData?.interestIncome || '0') > 1500) ||
                (parseFloat(formData.incomeData?.dividends || '0') > 1500)
    },
    {
      id: 'schedule-c',
      name: 'Schedule C',
      description: 'Profit or Loss From Business',
      condition: parseFloat(formData.incomeData?.businessIncome || '0') > 0
    },
    {
      id: 'schedule-d',
      name: 'Schedule D',
      description: 'Capital Gains and Losses',
      condition: parseFloat(formData.incomeData?.capitalGains || '0') !== 0
    },
    {
      id: '8949',
      name: 'Form 8949',
      description: 'Sales and Other Dispositions of Capital Assets',
      condition: parseFloat(formData.incomeData?.capitalGains || '0') !== 0
    }
  ];

  const generateForm1040 = () => {
    const { personalInfo, incomeData, deductions, taxResult, spouseInfo } = formData;

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Form 1040</h1>
          <p>U.S. Individual Income Tax Return</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="taxpayer-info">
          <h2>Filing Information</h2>
          <div class="info-grid">
            <div>First Name: ${personalInfo.firstName}</div>
            <div>Last Name: ${personalInfo.lastName}</div>
            <div>SSN: ${personalInfo.ssn}</div>
            <div>Filing Status: ${personalInfo.filingStatus}</div>
            ${spouseInfo ? `
              <div>Spouse First Name: ${spouseInfo.firstName}</div>
              <div>Spouse Last Name: ${spouseInfo.lastName}</div>
              <div>Spouse SSN: ${spouseInfo.ssn}</div>
            ` : ''}
            <div>Address: ${personalInfo.address}</div>
            <div>Dependents: ${personalInfo.dependents}</div>
          </div>
        </div>

        <div class="income-section">
          <h2>Income</h2>
          <div class="line-items">
            <div class="line">1. Wages, salaries, tips: $${parseFloat(incomeData.wages || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">2a. Tax-exempt interest: $${parseFloat(incomeData.interestIncome || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">3a. Qualified dividends: $${parseFloat(incomeData.dividends || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">4. IRA distributions: $0.00</div>
            <div class="line">5. Pensions and annuities: $0.00</div>
            <div class="line">6. Social security benefits: $0.00</div>
            <div class="line">7. Capital gain or (loss): $${parseFloat(incomeData.capitalGains || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">8. Other income: $${parseFloat(incomeData.otherIncome || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line total">9. Total income: $${taxResult.adjustedGrossIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="deductions-section">
          <h2>Deductions</h2>
          <div class="line-items">
            <div class="line">10a. Adjustments to income: $0.00</div>
            <div class="line">11. Adjusted gross income: $${taxResult.adjustedGrossIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">12. ${deductions.useStandardDeduction ? 'Standard' : 'Itemized'} deduction: $${(deductions.useStandardDeduction ? deductions.standardDeduction : deductions.itemizedTotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">13. Qualified business income deduction: $0.00</div>
            <div class="line total">14. Taxable income: $${taxResult.taxableIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="tax-section">
          <h2>Tax and Credits</h2>
          <div class="line-items">
            <div class="line">15. Tax: $${taxResult.federalTax.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">16. Amount from Schedule 2: $0.00</div>
            <div class="line">17. Amount from Schedule 3: $0.00</div>
            <div class="line total">18. Total tax: $${taxResult.totalTax.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="payments-section">
          <h2>Payments</h2>
          <div class="line-items">
            <div class="line">19. Federal income tax withheld: $${formData.paymentsData?.federalWithholding ? parseFloat(formData.paymentsData.federalWithholding).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</div>
            <div class="line">20. Estimated tax payments: $${formData.paymentsData?.estimatedTaxPayments ? parseFloat(formData.paymentsData.estimatedTaxPayments).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</div>
            <div class="line total">21. Total payments: $${taxResult.totalPayments.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="refund-section">
          <h2>Refund or Amount Owed</h2>
          <div class="line-items">
            ${taxResult.balance >= 0 ?
              `<div class="line refund">22. Amount you owe: $${taxResult.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>` :
              `<div class="line refund">23. Overpaid amount (refund): $${Math.abs(taxResult.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>`
            }
          </div>
        </div>

        <div class="signature-section">
          <h2>Sign Here</h2>
          <div class="signature-grid">
            <div>Your signature: ___________________________ Date: ___________</div>
            ${spouseInfo ? '<div>Spouse signature: ___________________________ Date: ___________</div>' : ''}
            <div>Preparer signature: ___________________________ Date: ___________</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleA = () => {
    const { deductions } = formData;

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule A (Form 1040)</h1>
          <p>Itemized Deductions</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="medical-section">
          <h2>Medical and Dental Expenses</h2>
          <div class="line-items">
            <div class="line">1. Medical and dental expenses: $${parseFloat(deductions.medicalExpenses || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">2. AGI limitation (7.5%): $${(formData.taxResult.adjustedGrossIncome * 0.075).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="line">3. Deductible medical expenses: $${Math.max(0, parseFloat(deductions.medicalExpenses || '0') - (formData.taxResult.adjustedGrossIncome * 0.075)).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="taxes-section">
          <h2>Taxes You Paid</h2>
          <div class="line-items">
            <div class="line">5. State and local taxes (SALT): $${Math.min(10000, parseFloat(deductions.stateLocalTaxes || '0')).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="interest-section">
          <h2>Interest You Paid</h2>
          <div class="line-items">
            <div class="line">8. Home mortgage interest: $${parseFloat(deductions.mortgageInterest || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="charity-section">
          <h2>Gifts to Charity</h2>
          <div class="line-items">
            <div class="line">11. Charitable contributions: $${parseFloat(deductions.charitableContributions || '0').toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="total-section">
          <h2>Total Itemized Deductions</h2>
          <div class="line-items">
            <div class="line total">17. Total itemized deductions: $${deductions.itemizedTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          </div>
        </div>
      </div>
    `;
  };

  const getFormContent = (formId: string) => {
    switch (formId) {
      case '1040':
        return generateForm1040();
      case 'schedule-a':
        return generateScheduleA();
      default:
        return `<div class="tax-form"><p>Form ${formId} not yet implemented</p></div>`;
    }
  };

  const downloadForm = (formId: string) => {
    const content = getFormContent(formId);
    const printContent = `
      <html>
        <head>
          <title>${formId.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
            .tax-form { max-width: 8.5in; margin: 0 auto; }
            .form-header { text-align: center; margin-bottom: 20px; }
            .form-header h1 { font-size: 18px; margin: 0; }
            .form-header p { margin: 5px 0; }
            h2 { font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px; margin: 15px 0 10px 0; }
            .info-grid, .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
            .line-items { margin: 10px 0; }
            .line { padding: 3px 0; border-bottom: 1px dotted #ccc; display: flex; justify-content: space-between; }
            .line.total { font-weight: bold; border-bottom: 2px solid #000; }
            .line.refund { font-weight: bold; background-color: #f0f0f0; padding: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formId}-${new Date().getFullYear()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printForm = (formId: string) => {
    const content = getFormContent(formId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${formId.toUpperCase()}</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
              .tax-form { max-width: 8.5in; margin: 0 auto; }
              .form-header { text-align: center; margin-bottom: 20px; }
              .form-header h1 { font-size: 18px; margin: 0; }
              .form-header p { margin: 5px 0; }
              h2 { font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px; margin: 15px 0 10px 0; }
              .info-grid, .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
              .line-items { margin: 10px 0; }
              .line { padding: 3px 0; border-bottom: 1px dotted #ccc; display: flex; justify-content: space-between; }
              .line.total { font-weight: bold; border-bottom: 2px solid #000; }
              .line.refund { font-weight: bold; background-color: #f0f0f0; padding: 5px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        {t('forms.generator.title')}
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('forms.generator.availableForms')}</h4>
          <div className="space-y-2">
            {availableForms.map(form => {
              const isRequired = form.required;
              const meetsCondition = form.condition === undefined || form.condition;
              const isAvailable = isRequired || meetsCondition;

              return (
                <div
                  key={form.id}
                  className={`p-3 border rounded-lg ${
                    isAvailable ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedForms.includes(form.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForms(prev => [...prev, form.id]);
                          } else if (!isRequired) {
                            setSelectedForms(prev => prev.filter(id => id !== form.id));
                          }
                        }}
                        disabled={!isAvailable || isRequired}
                        className="mt-1"
                      />
                      <div>
                        <div className={`font-medium ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                          {form.name}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        <div className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                          {form.description}
                        </div>
                        {!isAvailable && (
                          <div className="text-xs text-gray-400 mt-1">
                            {t('forms.generator.notRequired')}
                          </div>
                        )}
                      </div>
                    </div>

                    {isAvailable && selectedForms.includes(form.id) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewForm(form.id)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title={t('forms.generator.preview')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadForm(form.id)}
                          className="p-1 text-gray-600 hover:text-green-600"
                          title={t('forms.generator.download')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printForm(form.id)}
                          className="p-1 text-gray-600 hover:text-purple-600"
                          title={t('forms.generator.print')}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => {
              selectedForms.forEach(formId => downloadForm(formId));
            }}
            disabled={selectedForms.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {t('forms.generator.downloadAll')}
          </button>
          <button
            onClick={() => {
              selectedForms.forEach(formId => printForm(formId));
            }}
            disabled={selectedForms.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            {t('forms.generator.printAll')}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{previewForm.toUpperCase()} Preview</h3>
              <button
                onClick={() => setPreviewForm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div
                dangerouslySetInnerHTML={{ __html: getFormContent(previewForm) }}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};