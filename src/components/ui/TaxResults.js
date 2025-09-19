import React from 'react';
import { Calculator, Download, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const TaxResults = ({ 
  taxResult, 
  language, 
  t,
  onExportPDF,
  onExportJSON,
  onRecalculate 
}) => {
  const isRefund = taxResult.balance > 0;
  const amount = Math.abs(taxResult.balance);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('results.title')}</h3>
      
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
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.federalTax)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.marylandTax')}</span>
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.marylandTax)}</span>
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
            <span className="font-semibold text-green-600">{formatCurrency(taxResult.totalPayments)}</span>
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-semibold">
              {isRefund ? t('results.refundAmount') : t('results.amountOwed')}
            </span>
            <span className={`font-bold text-lg ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
              {isRefund ? t('results.refundAmount') : t('results.amountOwed')} {formatCurrency(amount)}
            </span>
          </div>
        </div>
        
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
                {/* This would need to be calculated based on the tax bracket */}
                {formatPercentage(0.24)} {/* Placeholder */}
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

export default TaxResults;