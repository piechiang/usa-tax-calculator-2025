import { useEffect, useCallback } from 'react';

// Contexts
import { useTaxContext } from './contexts/TaxContext';
import { useLanguageContext } from './contexts/LanguageContext';
import { useUIContext } from './contexts/UIContext';

// Layout Components
import { AppHeader } from './components/layout/AppHeader';
import { ActionButtons } from './components/layout/ActionButtons';
import { ClassicModeView } from './components/layout/ClassicModeView';
import { ModernModeView } from './components/layout/ModernModeView';

import { ModalManager } from './components/modals/ModalManager';

// Utils
import { exportToPDF, exportToJSON } from './utils/exportUtils';

// Types
import type { PersonalInfo } from './types/CommonTypes';

export default function USATaxSoftware2025() {
  // Use contexts instead of direct hooks
  const {
    language,
    showLanguageMenu,
    t,
    changeLanguage,
    toggleLanguageMenu,
    currentLanguageInfo
  } = useLanguageContext();

  const {
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult,
    filingComparison,
    taxOptimizations,
    handlePersonalInfoChange,
    handleSpouseInfoChange,
    handleIncomeChange,
    handleK1Change,
    handleBusinessDetailsChange,
    handlePaymentsChange,
    handleDeductionChange,
    recalculate,
    getSnapshot,
    loadFromSnapshot
  } = useTaxContext();

  const {
    activeTab,
    setActiveTab,
    showSpouseDialog,
    setShowSpouseDialog,
    showClientManager,
    setShowClientManager,
    showInterviewFlow,
    setShowInterviewFlow,
    showAdvancedFeatures,
    setShowAdvancedFeatures,
    advancedTab,
    setAdvancedTab,
    showProMode,
    setShowProMode,
    showAssistant,
    setShowAssistant,
    showEnhancedWizard,
    setShowEnhancedWizard,
    showDataImportExport,
    setShowDataImportExport,
    showReviewAccuracy,
    setShowReviewAccuracy,
    useClassicMode,
    setUseClassicMode,
    selectedState,
    setSelectedState
  } = useUIContext();

  // Sync selectedState with personalInfo changes
  useEffect(() => {
    if (personalInfo.isMaryland) {
      setSelectedState('MD');
    } else {
      setSelectedState('');
    }
  }, [personalInfo.isMaryland, setSelectedState]);

  // Export handlers - memoized to prevent recreating on every render
  const handleExportToPDF = useCallback(() => {
    exportToPDF(taxResult, t);
  }, [taxResult, t]);

  const handleExportToJSON = useCallback(() => {
    exportToJSON(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      taxResult
    );
  }, [personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, taxResult]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <AppHeader
          t={t}
          language={language}
          showLanguageMenu={showLanguageMenu}
          currentLanguageInfo={currentLanguageInfo}
          toggleLanguageMenu={toggleLanguageMenu}
          changeLanguage={changeLanguage}
        />

        {/* Action Buttons */}
        <ActionButtons
          useClassicMode={useClassicMode}
          onToggleClassicMode={() => setUseClassicMode(!useClassicMode)}
          onShowWizard={() => setShowEnhancedWizard(true)}
          onShowImportExport={() => setShowDataImportExport(true)}
          onShowReview={() => setShowReviewAccuracy(true)}
          onShowInterview={() => setShowInterviewFlow(true)}
          onShowAdvanced={() => setShowAdvancedFeatures(true)}
          onShowAssistant={() => setShowAssistant(true)}
          onShowProMode={() => setShowProMode(true)}
        />

        {/* Conditional Rendering: Classic Mode vs Modern Experience */}
        {useClassicMode ? (
          <ClassicModeView
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSwitchToModern={() => setUseClassicMode(false)}
            personalInfo={personalInfo}
            spouseInfo={spouseInfo}
            incomeData={incomeData}
            k1Data={k1Data}
            businessDetails={businessDetails}
            paymentsData={paymentsData}
            deductions={deductions}
            taxResult={taxResult}
            filingComparison={filingComparison}
            taxOptimizations={taxOptimizations}
            selectedState={selectedState}
            language={language}
            t={t}
            onPersonalInfoChange={handlePersonalInfoChange}
            onSpouseInfoChange={handleSpouseInfoChange}
            onIncomeChange={handleIncomeChange}
            onK1Change={handleK1Change}
            onBusinessDetailsChange={handleBusinessDetailsChange}
            onPaymentsChange={handlePaymentsChange}
            onDeductionChange={handleDeductionChange}
            onShowSpouseDialog={() => setShowSpouseDialog(true)}
            onExportPDF={handleExportToPDF}
            onExportJSON={handleExportToJSON}
            onRecalculate={recalculate}
            onStateChange={setSelectedState}
          />
        ) : (
          <ModernModeView
            taxResult={taxResult}
            onShowWizard={() => setShowEnhancedWizard(true)}
            onShowImportExport={() => setShowDataImportExport(true)}
            onShowReview={() => setShowReviewAccuracy(true)}
            onSwitchToClassic={() => setUseClassicMode(true)}
            onShowAdvanced={() => setShowAdvancedFeatures(true)}
          />
        )}
      </div>
      
      {/* Pro: Client Manager button */}
      <button
        className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded shadow"
        onClick={() => setShowClientManager(true)}
      >
        Clients
      </button>

      <ModalManager />
    </div>
  );
}
