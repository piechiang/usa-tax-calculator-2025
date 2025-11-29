import React from 'react';
import { Calculator, Download, Shield, Target, MessageCircle, Users, Zap } from 'lucide-react';

import { useUIContext } from '../../contexts/UIContext';
import { useLanguageContext } from '../../contexts/LanguageContext';

export function ActionButtons() {
  const {
    useClassicMode,
    setUseClassicMode,
    setShowEnhancedWizard,
    setShowDataImportExport,
    setShowReviewAccuracy,
    setShowInterviewFlow,
    setShowAdvancedFeatures,
    setShowAssistant,
    setShowProMode
  } = useUIContext();

  const { t } = useLanguageContext();

  return (
    <div className="space-y-3 mt-4">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setShowEnhancedWizard(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium shadow-lg transform hover:scale-105 transition-all"
        >
          <Zap className="h-5 w-5" />
          {t('actions.startWizard')}
        </button>
        <button
          onClick={() => setUseClassicMode(!useClassicMode)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-md transition-all ${
            useClassicMode
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Calculator className="h-4 w-4" />
          {useClassicMode ? t('actions.exitClassicMode') : t('actions.useClassicMode')}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setShowDataImportExport(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs font-medium"
        >
          <Download className="h-4 w-4" />
          {t('actions.importExport')}
        </button>
        <button
          onClick={() => setShowReviewAccuracy(true)}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium"
        >
          <Shield className="h-4 w-4" />
          {t('actions.reviewCheck')}
        </button>
        <button
          onClick={() => setShowInterviewFlow(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          {t('actions.quickInterview')}
        </button>
        <button
          onClick={() => setShowAdvancedFeatures(true)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium"
        >
          <Target className="h-4 w-4" />
          {t('actions.advanced')}
        </button>
        <button
          onClick={() => setShowAssistant(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          {t('actions.aiHelp')}
        </button>
        <button
          onClick={() => setShowProMode(true)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-medium"
        >
          <Users className="h-4 w-4" />
          {t('actions.proMode')}
        </button>
      </div>
    </div>
  );
}
