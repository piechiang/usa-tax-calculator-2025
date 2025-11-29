import React from 'react';
import { Calculator, Download, Shield, Target, Zap } from 'lucide-react';

import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';
import { useLanguageContext } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/formatters';

export function ModernModeView() {
  const { taxResult } = useTaxContext();
  const {
    setShowEnhancedWizard,
    setShowDataImportExport,
    setShowReviewAccuracy,
    setUseClassicMode,
    setShowAdvancedFeatures
  } = useUIContext();
  const { t } = useLanguageContext();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('modernMode.welcome')}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {t('modernMode.welcomeDescription')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.smartGuidance')}</h3>
              <p className="text-sm text-gray-600">{t('modernMode.smartGuidanceDesc')}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.accuracyCheck')}</h3>
              <p className="text-sm text-gray-600">{t('modernMode.accuracyCheckDesc')}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.easyImport')}</h3>
              <p className="text-sm text-gray-600">{t('modernMode.easyImportDesc')}</p>
            </div>
          </div>

          <button
            onClick={() => setShowEnhancedWizard(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all"
          >
            {t('modernMode.startTaxReturn')} {'\u2192'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setShowDataImportExport(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Download className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.importData')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.importDataDesc')}</p>
        </button>

        <button
          onClick={() => setShowReviewAccuracy(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Shield className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.reviewCheckTitle')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.reviewCheckDesc')}</p>
        </button>

        <button
          onClick={() => setShowAdvancedFeatures(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Target className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.advancedTools')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.advancedToolsDesc')}</p>
        </button>

        <button
          onClick={() => setUseClassicMode(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Calculator className="w-6 h-6 text-indigo-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.classicMode')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.classicModeDesc')}</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold">{t('modernMode.currentSnapshot')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('modernMode.refundBalanceDue')}</p>
            <p className={`text-2xl font-semibold ${taxResult.balance > 0 ? 'text-green-600' : taxResult.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {taxResult.balance > 0 ? t('modernMode.refund') + ' ' : taxResult.balance < 0 ? t('modernMode.owe') + ' ' : ''}
              {formatCurrency(Math.abs(taxResult.balance ?? 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('modernMode.totalTax')}</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(taxResult.totalTax ?? 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('modernMode.effectiveRate')}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {((taxResult.effectiveRate ?? 0) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
