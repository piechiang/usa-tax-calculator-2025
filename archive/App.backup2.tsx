import React, { useState, useEffect } from 'react';
import { Calculator, Download, MapPin, Shield, Target, Zap, X } from 'lucide-react';

// Hooks
import { useTaxCalculator } from './hooks/useTaxCalculator';
import { useLanguage } from './hooks/useLanguage';

// Layout Components
import { NavigationBar } from './components/layout/NavigationBar';
import { AppHeader } from './components/layout/AppHeader';
import { ActionButtons } from './components/layout/ActionButtons';
// import { MainLayout, ContentWrapper, TabContainer } from './components/layout/MainLayout'; // 待使用

// Components
import PersonalInfoForm from './components/forms/PersonalInfoForm';
import IncomeForm from './components/forms/IncomeForm';
import PaymentsForm from './components/forms/PaymentsForm';
import DeductionsForm from './components/forms/DeductionsForm';
import TaxResults from './components/ui/TaxResults';
import TaxBurdenChart from './components/ui/TaxBurdenChart';
import TaxOptimization from './components/ui/TaxOptimization';
import { FilingComparisonCard } from './components/ui/FilingComparisonCard';
import { ValidatedInput, UncontrolledInput as UncontrolledInputComponent } from './components/ui/InputField';
import ClientManager from './components/pro/ClientManager';
import { StateTaxSelector } from './components/forms/StateTaxSelector';

// Modal Components
import { SpouseDialog } from './components/modals/SpouseDialog';
import { AdvancedFeaturesModal } from './components/modals/AdvancedFeaturesModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { ReviewAccuracyModal } from './components/modals/ReviewAccuracyModal';
import { ProModeModal } from './components/modals/ProModeModal';

// New TurboTax-like Components
import { InterviewFlow } from './components/interview/InterviewFlow';

// Enhanced Wizard Components
import { TaxWizard } from './components/wizard/TaxWizard';
import DataImportExport from './components/import/DataImportExport';

// Constants
import { federalTaxBrackets, marylandCountyRates, standardDeductions } from './constants/taxBrackets';
import { interviewQuestions } from './constants/interviewQuestions';

// Utils
import { formatCurrency, formatPercentage } from './utils/formatters';
import { exportToPDF, exportToJSON } from './utils/exportUtils';

const UncontrolledInput = UncontrolledInputComponent as React.ComponentType<any>;

export default function USATaxSoftware2025() {
  const { 
    language, 
    showLanguageMenu, 
    t, 
    changeLanguage, 
    toggleLanguageMenu, 
    currentLanguageInfo 
  } = useLanguage('en');

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
    errors,
    touched,
    handlePersonalInfoChange,
    handleSpouseInfoChange,
    handleIncomeChange,
    handleK1Change,
    handleBusinessDetailsChange,
    handlePaymentsChange,
    handleDeductionChange,
    setError,
    setFieldTouched,
    recalculate,
    getSnapshot,
    loadFromSnapshot
  } = useTaxCalculator();

  const [activeTab, setActiveTab] = useState('personal');
  const [showSpouseDialog, setShowSpouseDialog] = useState(false);
  const [showClientManager, setShowClientManager] = useState(false);
  const [showInterviewFlow, setShowInterviewFlow] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [advancedTab, setAdvancedTab] = useState('validator');
  const [showProMode, setShowProMode] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectedState, setSelectedState] = useState(personalInfo.isMaryland ? 'MD' : '');

  // Enhanced Wizard State
  const [showEnhancedWizard, setShowEnhancedWizard] = useState(false);
  const [showDataImportExport, setShowDataImportExport] = useState(false);
  const [showReviewAccuracy, setShowReviewAccuracy] = useState(false);
  const [useClassicMode, setUseClassicMode] = useState(false);

  // Sync selectedState with personalInfo changes
  useEffect(() => {
    if (personalInfo.isMaryland) {
      setSelectedState('MD');
    } else {
      setSelectedState('');
    }
  }, [personalInfo.isMaryland]);

  // Export handlers
  const handleExportToPDF = () => {
    exportToPDF(taxResult, t);
  };

  const handleExportToJSON = () => {
    exportToJSON(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      taxResult
    );
  };

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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Classic Left Panel - Forms */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-lg">
                {/* Mode Indicator */}
                <div className="bg-gray-100 px-6 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Classic Tab-Based Mode</span>
                    <button
                      onClick={() => setUseClassicMode(false)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Switch to Smart Wizard →
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <NavigationBar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  t={t}
                />

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'personal' && (
                  <PersonalInfoForm
                    personalInfo={personalInfo}
                    onChange={handlePersonalInfoChange}
                    t={t}
                    UncontrolledInput={UncontrolledInput}
                    onShowSpouseDialog={() => setShowSpouseDialog(true)}
                  />
                )}

                {activeTab === 'income' && (
                  <IncomeForm
                    incomeData={incomeData}
                    k1Data={k1Data}
                    businessDetails={businessDetails}
                    onIncomeChange={handleIncomeChange}
                    onK1Change={handleK1Change}
                    onBusinessDetailsChange={handleBusinessDetailsChange}
                    t={t}
                    UncontrolledInput={UncontrolledInput}
                  />
                )}

                {activeTab === 'payments' && (
                  <PaymentsForm
                    paymentsData={paymentsData}
                    personalInfo={personalInfo}
                    onChange={handlePaymentsChange}
                    t={t}
                    ValidatedInput={ValidatedInput}
                  />
                )}

                {activeTab === 'deductions' && (
                  <DeductionsForm
                    deductions={deductions}
                    onChange={handleDeductionChange}
                    t={t}
                    ValidatedInput={ValidatedInput}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            <TaxResults
              taxResult={taxResult}
              language={language}
              t={t}
              onExportPDF={handleExportToPDF}
              onExportJSON={handleExportToJSON}
              onRecalculate={recalculate}
            />

            {/* 50 State Tax Support */}
            <StateTaxSelector
              selectedState={selectedState}
              onStateChange={setSelectedState}
              taxableIncome={taxResult.taxableIncome || 0}
              filingStatus={personalInfo.filingStatus}
              t={t}
            />

            {/* Federal Tax Bracket Reference */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('taxBrackets.title')}</h3>
              <div className="text-xs space-y-1 overflow-x-auto">
                <div className="grid grid-cols-2 gap-2 font-semibold border-b pb-1 min-w-max">
                  <span>{t('taxBrackets.taxableIncome')}</span>
                  <span>{t('taxBrackets.rate')}</span>
                </div>
                {federalTaxBrackets[personalInfo.filingStatus as keyof typeof federalTaxBrackets]?.map((bracket, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 text-gray-600 min-w-max">
                    <span className="text-xs">
                      {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                    </span>
                    <span>{formatPercentage(bracket.rate)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maryland Tax Info */}
            {personalInfo.isMaryland && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-600" />
                  {t('marylandInfo.title')}
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.stateRateRange')}</span>
                    <span>2% - 5.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.localTaxRate')} ({personalInfo.county}):</span>
                    <span>{formatPercentage(marylandCountyRates[personalInfo.county] || 0.032)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.standardDeduction')}</span>
                    <span>{formatCurrency(personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Burden Chart */}
            <TaxBurdenChart taxResult={taxResult} language={language} />

            {/* Filing Comparison */}
            <FilingComparisonCard filingComparison={filingComparison} t={t} />

            {/* Tax Optimization Suggestions */}
            <TaxOptimization 
              suggestions={taxOptimizations} 
              language={language} 
              t={t} 
            />

            {/* Standard Deductions Info */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('standardDeductions.title')}</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>{t('standardDeductions.single')}</span>
                  <span>{formatCurrency(standardDeductions.single)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.marriedJointly')}</span>
                  <span>{formatCurrency(standardDeductions.marriedJointly)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.marriedSeparately')}</span>
                  <span>{formatCurrency(standardDeductions.marriedSeparately)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.headOfHousehold')}</span>
                  <span>{formatCurrency(standardDeductions.headOfHousehold)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* Modern Smart Experience */
          <div className="space-y-6">
            {/* Quick Start Welcome Card */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to Smart Tax Filing
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Our intelligent wizard guides you through your tax return step-by-step,
                  ensuring you don't miss deductions and credits while keeping everything simple.
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
                  Start Your Tax Return →
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
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
                onClick={() => setUseClassicMode(true)}
                className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <Calculator className="w-6 h-6 text-gray-600 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Classic Mode</h3>
                <p className="text-sm text-gray-600">Traditional tab-based interface</p>
              </button>

              <button
                onClick={() => setShowAdvancedFeatures(true)}
                className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <Target className="w-6 h-6 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Advanced Features</h3>
                <p className="text-sm text-gray-600">Professional tools and analysis</p>
              </button>
            </div>

            {/* Current Tax Summary (if data exists) */}
            {taxResult.adjustedGrossIncome > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tax Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(taxResult.adjustedGrossIncome)}
                    </div>
                    <div className="text-sm text-gray-600">Adjusted Gross Income</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(taxResult.totalTax)}
                    </div>
                    <div className="text-sm text-gray-600">Total Tax</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {taxResult.effectiveRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Effective Tax Rate</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setShowReviewAccuracy(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Review & Optimize →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Pro: Client Manager button */}
      <button
        className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded shadow"
        onClick={() => setShowClientManager(true)}
      >
        Clients
      </button>

      {/* Modals */}
      <ClientManager
        isOpen={showClientManager}
        onClose={() => setShowClientManager(false)}
        getSnapshot={getSnapshot}
        loadFromSnapshot={loadFromSnapshot}
      />
      <SpouseDialog
        show={showSpouseDialog}
        spouseInfo={spouseInfo}
        t={t}
        UncontrolledInput={UncontrolledInput}
        onClose={() => setShowSpouseDialog(false)}
        onSpouseInfoChange={handleSpouseInfoChange}
      />

      {/* Interview Flow */}
      {showInterviewFlow && (
        <InterviewFlow
          questions={interviewQuestions}
          onComplete={(data) => {
            // Process interview data and update form
            if (data['filing-status']) {
              handlePersonalInfoChange('filingStatus', data['filing-status']);
            }
            if (data.firstName) handlePersonalInfoChange('firstName', data.firstName);
            if (data.lastName) handlePersonalInfoChange('lastName', data.lastName);
            if (data.ssn) handlePersonalInfoChange('ssn', data.ssn);
            if (data.address) handlePersonalInfoChange('address', data.address);
            setShowInterviewFlow(false);
          }}
          onCancel={() => setShowInterviewFlow(false)}
          t={t}
        />
      )}

      {/* Advanced Features Modal */}
      <AdvancedFeaturesModal
        isOpen={showAdvancedFeatures}
        onClose={() => setShowAdvancedFeatures(false)}
        activeTab={advancedTab}
        onTabChange={setAdvancedTab}
        personalInfo={personalInfo}
        incomeData={incomeData}
        deductions={deductions}
        paymentsData={paymentsData}
        taxResult={taxResult}
        spouseInfo={spouseInfo}
        k1Data={k1Data}
        businessDetails={businessDetails}
        selectedState={selectedState}
        onDataChange={(_field: string, _value: any) => {
          // Handle real-time collaborative changes
          // Updates handled internally by the component
        }}
        onIncomeChange={handleIncomeChange}
        onPaymentsChange={handlePaymentsChange}
        onRestoreBackup={(data: any) => {
          // Restore all form data from backup
          try {
            if (data?.formData) {
              // Safely restore personal info
              const personalData = data.formData.personalInfo || {};
              Object.keys(personalData).forEach((key) => {
                const value = personalData[key];
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                  handlePersonalInfoChange(key as any, String(value));
                }
              });

              // Safely restore income data
              const incomeDataObj = data.formData.incomeData || {};
              Object.keys(incomeDataObj).forEach((key) => {
                const value = incomeDataObj[key];
                if (value !== undefined && value !== null) {
                  handleIncomeChange(key as any, String(value));
                }
              });

              // Safely restore deductions
              const deductionsObj = data.formData.deductions || {};
              Object.keys(deductionsObj).forEach((key) => {
                const value = deductionsObj[key];
                if (value !== undefined && value !== null) {
                  handleDeductionChange(key as any, String(value));
                }
              });

              // Safely restore payments
              const paymentsObj = data.formData.paymentsData || {};
              Object.keys(paymentsObj).forEach((key) => {
                const value = paymentsObj[key];
                if (value !== undefined && value !== null) {
                  handlePaymentsChange(key as any, String(value));
                }
              });

              // Safely restore spouse info
              if (data.formData.spouseInfo) {
                const spouseObj = data.formData.spouseInfo;
                Object.keys(spouseObj).forEach((key) => {
                  const value = spouseObj[key];
                  if (value !== undefined && value !== null) {
                    handleSpouseInfoChange(key as any, String(value));
                  }
                });
              }
            }
            recalculate();
          } catch (error) {
            console.error('Error restoring backup data:', error);
          }
        }}
        t={t}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        taxData={{ personalInfo, incomeData, deductions, paymentsData }}
        taxResult={taxResult}
        t={t}
      />

      {/* Professional Tax Preparer Mode */}
      <ProModeModal
        isOpen={showProMode}
        onClose={() => setShowProMode(false)}
        t={t}
      />

      {/* Enhanced Wizard Modal */}
      {showEnhancedWizard && (
        <TaxWizard
          onComplete={(data) => {
            // Handle wizard completion and update tax data

            // Map wizard data to existing hooks
            if (data.personalInfo) {
              Object.keys(data.personalInfo).forEach(key => {
                handlePersonalInfoChange(key as any, data.personalInfo[key]);
              });
            }

            if (data.incomeSourcesEach) {
              // Convert to existing income format
              const totalWages = data.incomeSourcesEach
                .filter((income: any) => income.type === 'wages')
                .reduce((sum: number, income: any) => sum + (income.amount || 0), 0);

              if (totalWages > 0) {
                handleIncomeChange('wages', totalWages.toString());
              }
            }

            setShowEnhancedWizard(false);
          }}
          onCancel={() => setShowEnhancedWizard(false)}
          initialData={{
            personalInfo,
            incomeData,
            deductions,
            paymentsData
          }}
          t={t}
        />
      )}

      {/* Data Import/Export Modal */}
      {showDataImportExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Import & Export Tax Data</h3>
              <button
                onClick={() => setShowDataImportExport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <DataImportExport
                onImport={(data) => {
                  // Handle imported data

                  if (data.personalInfo) {
                    Object.keys(data.personalInfo).forEach(key => {
                      if (data.personalInfo[key]) {
                        handlePersonalInfoChange(key as any, data.personalInfo[key]);
                      }
                    });
                  }

                  if (data.incomeData) {
                    Object.keys(data.incomeData).forEach(key => {
                      if (data.incomeData[key]) {
                        handleIncomeChange(key, data.incomeData[key]);
                      }
                    });
                  }
                }}
                onExport={async (format) => {
                  // Handle data export
                  const exportData = {
                    personalInfo,
                    incomeData,
                    k1Data,
                    businessDetails,
                    paymentsData,
                    deductions,
                    taxResult,
                    timestamp: new Date().toISOString()
                  };

                  if (format === 'json') {
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tax-data-${new Date().getFullYear()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}
                currentData={{
                  personalInfo,
                  incomeData,
                  deductions,
                  calculations: taxResult
                }}
                t={t}
              />
            </div>
          </div>
        </div>
      )}

      {/* Review & Accuracy Check Modal */}
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
        onFixIssue={(_issueId, fieldPath) => {
          // Handle fixing issues
          setShowReviewAccuracy(false);

          // Navigate to the appropriate section
          if (fieldPath.includes('personalInfo')) {
            setActiveTab('personal');
            setUseClassicMode(true);
          } else if (fieldPath.includes('income')) {
            setActiveTab('income');
            setUseClassicMode(true);
          }
        }}
        onAcceptSuggestion={(suggestionId) => {
          // Handle accepting suggestions

          // Implement specific suggestions
          if (suggestionId === 'itemize-deductions') {
            handleDeductionChange('useStandardDeduction', false);
          }
        }}
        t={t}
      />
    </div>
  );
}
