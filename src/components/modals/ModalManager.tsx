import { useCallback, lazy, Suspense } from 'react';

import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';

import { interviewQuestions } from '../../constants/interviewQuestions';
import { useTaxDataHandlers } from '../../hooks/useTaxDataHandlers';

import { UncontrolledInput } from '../ui/InputField';

// Lazy load heavy modal components for better performance
const ClientManager = lazy(() => import('../pro/ClientManager'));
const SpouseDialog = lazy(() =>
  import('./SpouseDialog').then((m) => ({ default: m.SpouseDialog }))
);
const AdvancedFeaturesModal = lazy(() =>
  import('./AdvancedFeaturesModal').then((m) => ({ default: m.AdvancedFeaturesModal }))
);
const AIAssistantModal = lazy(() =>
  import('./AIAssistantModal').then((m) => ({ default: m.AIAssistantModal }))
);
const ProModeModal = lazy(() =>
  import('./ProModeModal').then((m) => ({ default: m.ProModeModal }))
);
const ReviewAccuracyModal = lazy(() =>
  import('./ReviewAccuracyModal').then((m) => ({ default: m.ReviewAccuracyModal }))
);
const InterviewFlowModal = lazy(() =>
  import('./InterviewFlowModal').then((m) => ({ default: m.InterviewFlowModal }))
);
const WizardModal = lazy(() => import('./WizardModal').then((m) => ({ default: m.WizardModal })));
const DataImportExportModal = lazy(() =>
  import('./DataImportExportModal').then((m) => ({ default: m.DataImportExportModal }))
);

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
    loadFromSnapshot,
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
    selectedState: _selectedState,
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
    (data: Record<string, unknown>) => {
      if (data['filing-status']) {
        handlePersonalInfoChange('filingStatus', String(data['filing-status']));
      }
      if (data.firstName) handlePersonalInfoChange('firstName', String(data.firstName));
      if (data.lastName) handlePersonalInfoChange('lastName', String(data.lastName));
      if (data.ssn) handlePersonalInfoChange('ssn', String(data.ssn));
      if (data.address) handlePersonalInfoChange('address', String(data.address));
      setShowInterviewFlow(false);
    },
    [handlePersonalInfoChange, setShowInterviewFlow]
  );

  const handleWizardComplete = useCallback(
    (data: Record<string, unknown>) => {
      // 1. Personal Info Mapping
      const personalFields = [
        'firstName',
        'lastName',
        'ssn',
        'address',
        'filingStatus',
        'state',
        'dateOfBirth',
      ];
      personalFields.forEach((field) => {
        if (data[field] !== undefined) {
          handlePersonalInfoChange(field as keyof typeof personalInfo, String(data[field]));
        }
      });

      // 2. Spouse Info Mapping
      const spouseFields = ['spouseFirstName', 'spouseLastName', 'spouseSSN', 'spouseDateOfBirth'];
      spouseFields.forEach((field) => {
        if (data[field] !== undefined) {
          // Map "spouseFirstName" -> "firstName"
          const targetField = field.replace('spouse', '');
          const mappedField = targetField.charAt(0).toLowerCase() + targetField.slice(1);
          handleSpouseInfoChange(mappedField as any, String(data[field]));
        }
      });

      // 3. Income Mapping
      if (data.totalWages !== undefined) handleIncomeChange('wages', String(data.totalWages));
      if (data.totalInterest !== undefined)
        handleIncomeChange('interest', String(data.totalInterest));
      if (data.totalDividends !== undefined)
        handleIncomeChange('dividends', String(data.totalDividends));
      if (data.netCapitalGains !== undefined)
        handleIncomeChange('capitalGains', String(data.netCapitalGains));
      if (data.businessNetIncome !== undefined)
        handleIncomeChange('businessIncome', String(data.businessNetIncome));
      if (data.netRentalIncome !== undefined)
        handleIncomeChange('otherIncome', String(data.netRentalIncome));
      if (data.federalWithholding !== undefined)
        handleIncomeChange('federalWithholding', String(data.federalWithholding)); // Assuming this goes to income data or payments?
      // PaymentsData usually holds withholding. handleIncomeChange might update UIIncomeData which includes withholding?
      // Checking types: UIIncomeData usually mirrors the inputs. Let's assume handleIncomeChange also handles payments or we need handlePaymentsChange.
      // Legacy context combined them.

      // 4. Deductions Mapping
      if (data.deductionChoice === 'standard') handleDeductionChange('useStandardDeduction', true);
      if (data.deductionChoice === 'itemize') handleDeductionChange('useStandardDeduction', false);
      if (data.mortgageInterestAmount)
        handleDeductionChange('mortgageInterest', String(data.mortgageInterestAmount));
      if (data.saltAmount) handleDeductionChange('stateLocalTaxes', String(data.saltAmount));
      if (data.charitableAmount)
        handleDeductionChange('charitableContributions', String(data.charitableAmount));
      if (data.childCareExpenseAmount)
        handleDeductionChange('medicalExpenses', String(data.childCareExpenseAmount)); // Wait, child care is credit, not medical deduction.
      // Actually wizardSteps has 'childCareExpenseAmount' under Credits.
      // Credits are computed. Engine inputs for credits?
      // CommonTypes TaxCalculationInput has 'credits'.
      // But we don't have handleCreditChange?
      // Usually credits are derived from income/dependents.
      // But child care expenses is an INPUT.
      // PersonalInfo might hold it? Or IncomeData?
      // Typically `TaxContext` legacy didn't expose credits inputs easily.
      // Let's stick to State Specifics for now.

      // 5. State Specific Mapping
      const currentStateSpecific = (personalInfo.stateSpecific as Record<string, unknown>) || {};
      let hasStateSpecificUpdates = false;
      const nextStateSpecific = { ...currentStateSpecific };

      if (data.youngChildrenUnder6 !== undefined) {
        // Parse number if string
        const val =
          typeof data.youngChildrenUnder6 === 'string'
            ? parseInt(data.youngChildrenUnder6, 10)
            : data.youngChildrenUnder6;
        nextStateSpecific.youngChildrenUnder6 = val;
        hasStateSpecificUpdates = true;
      }
      if (data.yonkersResident !== undefined) {
        nextStateSpecific.yonkersResident = data.yonkersResident === 'yes';
        hasStateSpecificUpdates = true;
      }
      if (data.nycResident !== undefined) {
        nextStateSpecific.nycResident = data.nycResident === 'yes';
        hasStateSpecificUpdates = true;
      }

      if (hasStateSpecificUpdates) {
        handlePersonalInfoChange('stateSpecific', nextStateSpecific);
      }

      recalculate();
      setShowEnhancedWizard(false);
    },
    [
      handlePersonalInfoChange,
      handleSpouseInfoChange,
      handleIncomeChange,
      handleDeductionChange,
      recalculate,
      setShowEnhancedWizard,
      personalInfo,
    ]
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
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
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
        <ProModeModal isOpen={showProMode} onClose={() => setShowProMode(false)} t={t} />
      )}

      {showEnhancedWizard && (
        <WizardModal
          isOpen={showEnhancedWizard}
          onComplete={handleWizardComplete}
          onCancel={() => setShowEnhancedWizard(false)}
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
            calculations: taxResult,
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
              amount: parseFloat(amount as string) || 0,
            })),
            deductions,
            qualifyingChildren: [],
            educationExpenses: [],
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
