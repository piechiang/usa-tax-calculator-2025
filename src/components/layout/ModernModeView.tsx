import React from 'react';
import { Calculator, Download, Shield, Target, Zap } from 'lucide-react';

import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Smart Tax Filing</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our intelligent wizard guides you through your tax return step-by-step, ensuring you don't miss
            deductions and credits while keeping everything simple.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Smart Guidance</h3>
              <p className="text-sm text-gray-600">Contextual help and tips as you go</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Accuracy Check</h3>
              <p className="text-sm text-gray-600">Built-in validation and optimization</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Easy Import</h3>
              <p className="text-sm text-gray-600">Import from previous year or documents</p>
            </div>
          </div>

          <button
            onClick={() => setShowEnhancedWizard(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all"
          >
            Start Your Tax Return {'\u2192'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setShowDataImportExport(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Download className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Import Data</h3>
          <p className="text-sm text-gray-600">From last year or documents</p>
        </button>

        <button
          onClick={() => setShowReviewAccuracy(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Shield className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Review & Check</h3>
          <p className="text-sm text-gray-600">Accuracy and optimization</p>
        </button>

        <button
          onClick={() => setShowAdvancedFeatures(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Target className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Advanced Tools</h3>
          <p className="text-sm text-gray-600">Power features for complex returns</p>
        </button>

        <button
          onClick={() => setUseClassicMode(true)}
          className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
        >
          <Calculator className="w-6 h-6 text-indigo-600 mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Classic Mode</h3>
          <p className="text-sm text-gray-600">Jump to detailed tab-based entry</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold">Current Tax Snapshot</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Refund / Balance Due</p>
            <p className={`text-2xl font-semibold ${taxResult.balance > 0 ? 'text-green-600' : taxResult.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {taxResult.balance > 0 ? 'Refund: ' : taxResult.balance < 0 ? 'Owe: ' : ''}
              {formatCurrency(Math.abs(taxResult.balance ?? 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Tax</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(taxResult.totalTax ?? 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Effective Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {((taxResult.effectiveRate ?? 0) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
