import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Download,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TaxResult } from '../../types/CommonTypes';
import type { FederalDiagnostics2025 } from '../../engine/types';

interface TaxResultsProps {
  taxResult: TaxResult;
  language: string;
  t: (key: string) => string;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onRecalculate: () => void;
  selectedState?: string; // Optional: state code for dynamic labeling
  diagnostics?: FederalDiagnostics2025 | null; // Optional: calculation diagnostics
}

const TaxResults: React.FC<TaxResultsProps> = ({
  taxResult,
  language: _language,
  t,
  onExportPDF,
  onExportJSON,
  onRecalculate,
  selectedState,
  diagnostics,
}) => {
  const [showDiagnosticsDetails, setShowDiagnosticsDetails] = useState(false);
  // Memoize expensive calculations
  const { isRefund, amount } = useMemo(
    () => ({
      isRefund: taxResult.balance > 0,
      amount: Math.abs(taxResult.balance),
    }),
    [taxResult.balance]
  );

  // Get state tax label dynamically
  const stateTaxLabel = useMemo(() => {
    if (!selectedState || selectedState === '') {
      return t('results.stateTax') || 'State Tax';
    }
    // Map state codes to names
    const stateNames: Record<string, string> = {
      MD: 'Maryland',
      NY: 'New York',
      PA: 'Pennsylvania',
      CA: 'California',
      // Add other states as needed
    };
    const stateName = stateNames[selectedState.toUpperCase()] || selectedState.toUpperCase();
    return `${stateName} Tax`;
  }, [selectedState, t]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('results.title')}</h3>

      {/* Diagnostics Alert Section */}
      {diagnostics && (diagnostics.warnings.length > 0 || diagnostics.errors.length > 0) && (
        <div className="space-y-3">
          {/* Errors Card */}
          {diagnostics.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="text-sm font-semibold text-red-800">
                  Calculation Errors ({diagnostics.errors.length})
                </h4>
              </div>
              <ul className="space-y-1 text-sm text-red-700">
                {diagnostics.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings Card */}
          {diagnostics.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <button
                onClick={() => setShowDiagnosticsDetails(!showDiagnosticsDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h4 className="text-sm font-semibold text-amber-800">
                    Calculation Warnings ({diagnostics.warnings.length})
                  </h4>
                </div>
                {showDiagnosticsDetails ? (
                  <ChevronUp className="h-4 w-4 text-amber-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-amber-600" />
                )}
              </button>
              {showDiagnosticsDetails && (
                <ul className="mt-3 space-y-1 text-sm text-amber-700">
                  {diagnostics.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{warning.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Results Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.adjustedGrossIncome')}</span>
            <span className="font-semibold">{formatCurrency(taxResult.adjustedGrossIncome)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.federalTaxableIncome')}</span>
            <span className="font-semibold">{formatCurrency(taxResult.taxableIncome)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.federalTax')}</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(taxResult.federalTax)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{stateTaxLabel}</span>
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.stateTax)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.localTax')}</span>
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.localTax)}</span>
          </div>

          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-semibold">{t('results.totalTax')}</span>
            <span className="font-bold text-red-600">{formatCurrency(taxResult.totalTax)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.totalPayments')}</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(taxResult.totalPayments)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-semibold">
              {isRefund ? t('results.refundAmount') : t('results.amountOwed')}
            </span>
            <span className={`font-bold text-lg ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Deduction Method Indicator */}
        {(taxResult.standardDeduction || taxResult.itemizedDeduction) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Deduction Method</h4>
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className={`px-4 py-2 rounded-lg border-2 ${
                  taxResult.deductionType === 'standard'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600 mb-1">Standard Deduction</div>
                <div
                  className={`font-semibold ${
                    taxResult.deductionType === 'standard' ? 'text-blue-700' : 'text-gray-500'
                  }`}
                >
                  {formatCurrency(taxResult.standardDeduction || 0)}
                </div>
              </div>

              <div className="text-gray-400 font-bold">vs</div>

              <div
                className={`px-4 py-2 rounded-lg border-2 ${
                  taxResult.deductionType === 'itemized'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600 mb-1">Itemized Deductions</div>
                <div
                  className={`font-semibold ${
                    taxResult.deductionType === 'itemized' ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {formatCurrency(taxResult.itemizedDeduction || 0)}
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs">
                  <span className="font-medium text-blue-800">
                    Using {taxResult.deductionType === 'standard' ? 'Standard' : 'Itemized'}{' '}
                    Deduction
                  </span>
                  <span className="text-blue-600 ml-1">
                    (
                    {formatCurrency(
                      taxResult.deductionType === 'standard'
                        ? taxResult.standardDeduction
                        : taxResult.itemizedDeduction
                    )}
                    )
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Credits Breakdown */}
        {((taxResult.childTaxCredit ?? 0) > 0 ||
          (taxResult.earnedIncomeCredit ?? 0) > 0 ||
          (taxResult.educationCredits ?? 0) > 0) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Credits Applied</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(taxResult.childTaxCredit ?? 0) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Child Tax Credit</div>
                  <div className="font-semibold text-green-700 text-lg">
                    {formatCurrency(taxResult.childTaxCredit ?? 0)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Reduces tax liability</div>
                </div>
              )}

              {(taxResult.earnedIncomeCredit ?? 0) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Earned Income Tax Credit</div>
                  <div className="font-semibold text-blue-700 text-lg">
                    {formatCurrency(taxResult.earnedIncomeCredit ?? 0)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Refundable credit</div>
                </div>
              )}

              {(taxResult.educationCredits ?? 0) > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Education Credits</div>
                  <div className="font-semibold text-purple-700 text-lg">
                    {formatCurrency(taxResult.educationCredits ?? 0)}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">AOTC / Lifetime Learning</div>
                </div>
              )}
            </div>

            {/* Total Credits Summary */}
            <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-indigo-900">Total Credits Applied:</span>
                <span className="text-lg font-bold text-indigo-700">
                  {formatCurrency(
                    (taxResult.childTaxCredit ?? 0) +
                      (taxResult.earnedIncomeCredit ?? 0) +
                      (taxResult.educationCredits ?? 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Tax Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-600">{t('results.effectiveRate')}</div>
              <div className="font-semibold text-blue-600">
                {formatPercentage(taxResult.effectiveRate)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-600">{t('results.marginalRate')}</div>
              <div className="font-semibold text-purple-600">
                {formatPercentage(taxResult.marginalRate || 0)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-600">{t('results.afterTaxIncome')}</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(taxResult.afterTaxIncome)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onExportPDF}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            {t('actions.exportPDF')}
          </button>

          <button
            onClick={onExportJSON}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            {t('actions.exportJSON')}
          </button>

          <button
            onClick={onRecalculate}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Calculator className="h-4 w-4" />
            {t('actions.recalculate')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(TaxResults);
