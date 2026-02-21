import React from 'react';
import { Calculator, Download, Shield, Target, Zap } from 'lucide-react';
import CountUp from 'react-countup';
import { TaxBreakdownChart } from '../analytics/TaxBreakdownChart';

import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';
import { useLanguageContext } from '../../contexts/LanguageContext';

export function ModernModeView() {
  const { taxResult } = useTaxContext();
  const {
    setShowEnhancedWizard,
    setShowDataImportExport,
    setShowReviewAccuracy,
    setUseClassicMode,
    setShowAdvancedFeatures,
  } = useUIContext();
  const { t } = useLanguageContext();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-surface-highlight via-surface-muted to-surface-highlight rounded-xl p-6 border border-brand-light/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('modernMode.welcome')}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {t('modernMode.welcomeDescription')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Zap className="w-8 h-8 text-brand mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.smartGuidance')}</h3>
              <p className="text-sm text-gray-600">{t('modernMode.smartGuidanceDesc')}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Shield className="w-8 h-8 text-status-success mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.accuracyCheck')}</h3>
              <p className="text-sm text-gray-600">{t('modernMode.accuracyCheckDesc')}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Download className="w-8 h-8 text-brand-dark mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.easyImport')}</h3>
              <p className="text-sm text-gray-600">{t('modernMode.easyImportDesc')}</p>
            </div>
          </div>

          <button
            onClick={() => setShowEnhancedWizard(true)}
            className="px-8 py-3 bg-gradient-to-r from-brand to-brand-dark text-white rounded-lg hover:from-brand-dark hover:to-brand font-medium shadow-lg transform hover:scale-105 transition-all"
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
          <Download className="w-6 h-6 text-status-success mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.importData')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.importDataDesc')}</p>
        </button>

        <button
          onClick={() => setShowReviewAccuracy(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Shield className="w-6 h-6 text-status-warning mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.reviewCheckTitle')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.reviewCheckDesc')}</p>
        </button>

        <button
          onClick={() => setShowAdvancedFeatures(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Target className="w-6 h-6 text-brand mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.advancedTools')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.advancedToolsDesc')}</p>
        </button>

        <button
          onClick={() => setUseClassicMode(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Calculator className="w-6 h-6 text-brand-dark mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">{t('modernMode.classicMode')}</h3>
          <p className="text-sm text-gray-600">{t('modernMode.classicModeDesc')}</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-brand to-brand-dark px-6 py-4 text-white flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('modernMode.currentSnapshot')}</h3>
          <div className="text-xs bg-white/20 px-2 py-1 rounded">2025 Estimate</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 items-center">
          {/* Left: Chart */}
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
              Tax Distribution
            </h4>
            <TaxBreakdownChart taxResult={taxResult} />
          </div>

          {/* Right: Stats with CountUp */}
          <div className="space-y-6">
            <div className="p-4 bg-surface-muted rounded-lg border border-slate-100">
              <p className="text-sm text-gray-500 mb-1">{t('modernMode.refundBalanceDue')}</p>
              <div
                className={`text-3xl font-bold ${taxResult.balance > 0 ? 'text-status-success' : taxResult.balance < 0 ? 'text-status-error' : 'text-gray-900'}`}
              >
                {taxResult.balance > 0
                  ? t('modernMode.refund')
                  : taxResult.balance < 0
                    ? t('modernMode.owe')
                    : ''}{' '}
                <CountUp
                  end={Math.abs(taxResult.balance ?? 0)}
                  prefix="$"
                  separator=","
                  decimals={2}
                  duration={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-100">
                <p className="text-sm text-gray-500 mb-1">{t('modernMode.totalTax')}</p>
                <div className="text-xl font-semibold text-gray-900">
                  <CountUp
                    end={taxResult.totalTax ?? 0}
                    prefix="$"
                    separator=","
                    decimals={2}
                    duration={1.5}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-100">
                <p className="text-sm text-gray-500 mb-1">{t('modernMode.effectiveRate')}</p>
                <div className="text-xl font-semibold text-brand">
                  <CountUp
                    end={(taxResult.effectiveRate ?? 0) * 100}
                    suffix="%"
                    decimals={2}
                    duration={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
