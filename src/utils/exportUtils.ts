import { formatCurrency } from './formatters';
import type { PersonalInfo, TaxResult } from '../types/CommonTypes';

interface ExportData {
  personalInfo: PersonalInfo;
  incomeData: Record<string, string | number | undefined>;
  k1Data: Record<string, string | number | undefined>;
  businessDetails: Record<string, string | number | undefined>;
  paymentsData: Record<string, string | number | undefined>;
  deductions: Record<string, string | number | boolean | undefined>;
  taxResult: TaxResult;
  timestamp: string;
}

interface TranslationFunction {
  (key: string): string;
}

export const exportToPDF = (taxResult: TaxResult, t: TranslationFunction): void => {
  const printContent = document.createElement('div');
  printContent.innerHTML = `
    <h1>${t('title')}</h1>
    <div>
      <h2>${t('results.title')}</h2>
      <p>${t('results.adjustedGrossIncome')} ${formatCurrency(taxResult.adjustedGrossIncome)}</p>
      <p>${t('results.federalTax')} ${formatCurrency(taxResult.federalTax)}</p>
      <p>${t('results.totalTax')} ${formatCurrency(taxResult.totalTax)}</p>
    </div>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  }
};

export const exportToJSON = (
  personalInfo: PersonalInfo,
  incomeData: Record<string, string | number | undefined>,
  k1Data: Record<string, string | number | undefined>,
  businessDetails: Record<string, string | number | undefined>,
  paymentsData: Record<string, string | number | undefined>,
  deductions: Record<string, string | number | boolean | undefined>,
  taxResult: TaxResult
): void => {
  const data: ExportData = {
    personalInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult,
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tax-data-${new Date().getFullYear()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
