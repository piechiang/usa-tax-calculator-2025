import { useCallback, lazy, Suspense } from 'react';

import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';

import { interviewQuestions } from '../../constants/interviewQuestions';
import { useTaxDataHandlers } from '../../hooks/useTaxDataHandlers';

import { UncontrolledInput } from '../ui/InputField';

// Lazy load heavy modal components for better performance
const ClientManager = lazy(() => import('../pro/ClientManager'));
const SpouseDialog = lazy(() => import('./SpouseDialog').then(m => ({ default: m.SpouseDialog })));
const AdvancedFeaturesModal = lazy(() => import('./AdvancedFeaturesModal').then(m => ({ default: m.AdvancedFeaturesModal })));
const AIAssistantModal = lazy(() => import('./AIAssistantModal').then(m => ({ default: m.AIAssistantModal })));
const ProModeModal = lazy(() => import('./ProModeModal').then(m => ({ default: m.ProModeModal })));
const ReviewAccuracyModal = lazy(() => import('./ReviewAccuracyModal').then(m => ({ default: m.ReviewAccuracyModal })));
const InterviewFlowModal = lazy(() => import('./InterviewFlowModal').then(m => ({ default: m.InterviewFlowModal })));
const WizardModal = lazy(() => import('./WizardModal').then(m => ({ default: m.WizardModal })));
const DataImportExportModal = lazy(() => import('./DataImportExportModal').then(m => ({ default: m.DataImportExportModal })));

export function ModalManager() {
  const { t } = useLanguageContext();

  const {
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data: _k1Data,
    businessDetails: _businessDetails,
    paymentsData,
    deductions,
    taxResult,
    filingComparison,
    taxOptimizations,
    handlePersonalInfoChange,
    handleSpouseInfoChange,
    handleIncomeChange,
    handlePaymentsChange: _handlePaymentsChange,
    handleDeductionChange,
    recalculate,
    getSnapshot,
    loadFromSnapshot
  } = useTaxContext();

  const {
    activeTab: _activeTab,
    setActiveTab,
    showSpouseDialog,
    setShowSpouseDialog,
    showClientManager,
    setShowClientManager,
    showInterviewFlow,
    setShowInterviewFlow,
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
    useClassicMode: _useClassicMode,
    setUseClassicMode,
    selectedState: _selectedState
  } = useUIContext();

  const { exportPDF, exportJSON, importData, exportData } = useTaxDataHandlers();

  const handleDataImport = useCallback(
    (data: unknown) => {
      importData(data);
      setShowDataImportExport(false);
    },
    [importData, setShowDataImportExport]
  );

  const handleInterviewComplete = useCallback(
    (data: Record<string, string>) => {
      if (data['filing-status']) {
        handlePersonalInfoChange('filingStatus', data['filing-status']);
      }
      if (data.firstName) handlePersonalInfoChange('firstName', data.firstName);
      if (data.lastName) handlePersonalInfoChange('lastName', data.lastName);
      if (data.ssn) handlePersonalInfoChange('ssn', data.ssn);
      if (data.address) handlePersonalInfoChange('address', data.address);
      setShowInterviewFlow(false);
    },
    [handlePersonalInfoChange, setShowInterviewFlow]
  );

  const handleWizardComplete = useCallback(
    (data: Record<string, string | number | boolean>) => {
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('personalInfo.')) {
          const field = key.replace('personalInfo.', '') as keyof typeof personalInfo;
          handlePersonalInfoChange(field, String(value));
        } else if (key.startsWith('income.')) {
          const field = key.replace('income.', '');
          handleIncomeChange(field, String(value));
        } else if (key.startsWith('deductions.')) {
          const field = key.replace('deductions.', '') as keyof typeof deductions;
          handleDeductionChange(field, String(value));
        }
      });
      recalculate();
      setShowEnhancedWizard(false);
    },
    [handlePersonalInfoChange, handleIncomeChange, handleDeductionChange, recalculate, setShowEnhancedWizard]
  );

  const handleReviewIssueFix = useCallback(
    (_issueId: string, fieldPath: string) => {
      setShowReviewAccuracy(false);

      if (fieldPath.includes('personalInfo')) {
        setActiveTab('personal');
        setUseClassicMode(true);
      } else if (fieldPath.includes('income')) {
        setActiveTab('income');
        setUseClassicMode(true);
      }
    },
    [setActiveTab, setShowReviewAccuracy, setUseClassicMode]
  );

  const handleReviewSuggestion = useCallback(
    (suggestionId: string) => {
      if (suggestionId === 'itemize-deductions') {
        handleDeductionChange('useStandardDeduction', false);
      }
    },
    [handleDeductionChange]
  );

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>}>
      {showClientManager && (
        <ClientManager
          isOpen={showClientManager}
          onClose={() => setShowClientManager(false)}
          getSnapshot={getSnapshot}
          loadFromSnapshot={loadFromSnapshot}
        />
      )}

      {showSpouseDialog && (
        <SpouseDialog
          show={showSpouseDialog}
          spouseInfo={spouseInfo}
          t={t}
          UncontrolledInput={UncontrolledInput}
          onClose={() => setShowSpouseDialog(false)}
          onSpouseInfoChange={handleSpouseInfoChange}
        />
      )}

      {showInterviewFlow && (
        <InterviewFlowModal
          isOpen={showInterviewFlow}
          questions={interviewQuestions}
          onComplete={handleInterviewComplete}
          onCancel={() => setShowInterviewFlow(false)}
          t={t}
        />
      )}

      <AdvancedFeaturesModal />

      {showAssistant && (
        <AIAssistantModal
          isOpen={showAssistant}
          onClose={() => setShowAssistant(false)}
          taxData={{ personalInfo, incomeData, deductions, paymentsData }}
          taxResult={taxResult}
          t={t}
        />
      )}

      {showProMode && (
        <ProModeModal
          isOpen={showProMode}
          onClose={() => setShowProMode(false)}
          t={t}
        />
      )}

      {showEnhancedWizard && (
        <WizardModal
          isOpen={showEnhancedWizard}
          onComplete={handleWizardComplete}
          onCancel={() => setShowEnhancedWizard(false)}
          onExportPDF={exportPDF}
          onExportJSON={exportJSON}
          personalInfo={personalInfo}
          incomeData={incomeData}
          deductions={deductions}
          paymentsData={paymentsData}
          taxResult={taxResult}
          filingComparison={filingComparison}
          taxOptimizations={taxOptimizations}
          t={t}
        />
      )}

      {showDataImportExport && (
        <DataImportExportModal
          isOpen={showDataImportExport}
          onClose={() => setShowDataImportExport(false)}
          onImport={handleDataImport}
          onExport={exportData}
          currentData={{
            personalInfo,
            incomeData,
            deductions,
            calculations: taxResult
          }}
          t={t}
        />
      )}

      {showReviewAccuracy && (
        <ReviewAccuracyModal
          isOpen={showReviewAccuracy}
          onClose={() => setShowReviewAccuracy(false)}
          taxData={{
            personalInfo,
            incomeSourcesEach: Object.entries(incomeData).map(([type, amount]) => ({
              type,
              amount: parseFloat(amount as string) || 0
            })),
            deductions,
            qualifyingChildren: [],
            educationExpenses: []
          }}
          taxResult={taxResult}
          onFixIssue={handleReviewIssueFix}
          onAcceptSuggestion={handleReviewSuggestion}
          t={t}
        />
      )}
    </Suspense>
  );
}
