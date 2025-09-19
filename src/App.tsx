import React, { useState, useEffect } from 'react';
import { Calculator, FileText, User, DollarSign, Download, AlertCircle, MapPin, Globe, CheckCircle, Users, TrendingUp, Shield, Target, BarChart3, Zap, MessageCircle, ScanLine, Share2, AlertTriangle, X } from 'lucide-react';

// Hooks
import { useTaxCalculator } from './hooks/useTaxCalculator';
import { useLanguage } from './hooks/useLanguage';

// Components
import PersonalInfoForm from './components/forms/PersonalInfoForm';
import IncomeForm from './components/forms/IncomeForm';
import PaymentsForm from './components/forms/PaymentsForm';
import DeductionsForm from './components/forms/DeductionsForm';
import TaxResults from './components/ui/TaxResults';
import TaxBurdenChart from './components/ui/TaxBurdenChart';
import TaxOptimization from './components/ui/TaxOptimization';
import { ValidatedInput, UncontrolledInput as UncontrolledInputComponent } from './components/ui/InputField';
import ClientManager from './components/pro/ClientManager';
import { StateTaxSelector } from './components/forms/StateTaxSelector';

// New TurboTax-like Components
import { InterviewFlow } from './components/interview/InterviewFlow';
import { TaxFormGenerator } from './components/forms/TaxFormGenerator';
import { TaxValidator } from './components/validation/TaxValidator';
import { TaxPlanner } from './components/planning/TaxPlanner';
import { AuditSupport } from './components/audit/AuditSupport';
import { MultiYearComparison } from './components/comparison/MultiYearComparison';

// Enhanced Wizard Components
import { TaxWizard } from './components/wizard/TaxWizard';
import TaxGuidance from './components/guidance/TaxGuidance';
import DataImportExport from './components/import/DataImportExport';
import TaxReviewAccuracy from './components/review/TaxReviewAccuracy';

// Advanced Professional Components
import { TaxAssistant } from './components/assistant/TaxAssistant';
import { PortfolioOptimizer } from './components/portfolio/PortfolioOptimizer';
import { TaxPreparerMode } from './components/professional/TaxPreparerMode';

// New Advanced System Components
import { TaxLawNotifications } from './components/notifications/TaxLawNotifications';
import { DataBackupManager } from './components/data/DataBackupManager';
import { TaxEducationCenter } from './components/education/TaxEducationCenter';

// Latest Advanced Components
import { CollaborativeTaxPrep } from './components/collaboration/CollaborativeTaxPrep';
import { DocumentScanner } from './components/ocr/DocumentScanner';
import { AuditRiskAssessment } from './components/audit/AuditRiskAssessment';

const UncontrolledInput = UncontrolledInputComponent as React.ComponentType<any>;

// Constants
import { languages } from './constants/languages';
import { federalTaxBrackets, marylandCountyRates, standardDeductions } from './constants/taxBrackets';

// Utils
import { formatCurrency, formatPercentage } from './utils/formatters';

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
    } else if (personalInfo.state) {
      setSelectedState(personalInfo.state);
    } else {
      setSelectedState('');
    }
  }, [personalInfo.isMaryland, personalInfo.state]);

  // Interview questions for guided input
  const interviewQuestions = [
    {
      id: 'filing-status',
      title: 'What is your filing status?',
      description: 'Choose the filing status that applies to your situation.',
      type: 'single' as const,
      required: true,
      options: [
        { value: 'single', label: 'Single', description: 'You are unmarried or legally separated' },
        { value: 'marriedJointly', label: 'Married Filing Jointly', description: 'You are married and filing together' },
        { value: 'marriedSeparately', label: 'Married Filing Separately', description: 'You are married but filing separately' },
        { value: 'headOfHousehold', label: 'Head of Household', description: 'You are unmarried and support dependents' }
      ]
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Please provide your basic information.',
      type: 'group' as const,
      required: true,
      inputs: [
        { field: 'firstName', label: 'First Name', type: 'text', required: true },
        { field: 'lastName', label: 'Last Name', type: 'text', required: true },
        { field: 'ssn', label: 'Social Security Number', type: 'text', placeholder: 'XXX-XX-XXXX', required: true },
        { field: 'address', label: 'Address', type: 'text', required: true }
      ]
    },
    {
      id: 'income-sources',
      title: 'What types of income did you have?',
      description: 'Select all income sources that apply to you.',
      type: 'multiple' as const,
      options: [
        { value: 'wages', label: 'Wages and Salaries', description: 'Income from employment (W-2)' },
        { value: 'interest', label: 'Interest Income', description: 'Bank interest, bonds, etc.' },
        { value: 'dividends', label: 'Dividend Income', description: 'Stock dividends' },
        { value: 'business', label: 'Business Income', description: 'Self-employment or business income' },
        { value: 'capital-gains', label: 'Capital Gains', description: 'Gains from selling investments' }
      ]
    }
  ];

  // Export functions
  const exportToPDF = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1>${t('title')}</h1>
      <div>
        <h2>${t('results.title')}</h2>
        <p>${t('results.adjustedGrossIncome')} ${formatCurrency(taxResult.adjustedGrossIncome)}</p>
        <p>${t('results.federalTax')} ${formatCurrency(taxResult.federalTax)}</p>
        <p>${t('results.totalTax')} ${formatCurrency(taxResult.totalTax)}</p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToJSON = () => {
    const data = {
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      taxResult,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-data-${new Date().getFullYear()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const FilingComparisonCard = () => {
    if (!filingComparison) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          {t('spouseInfo.filingComparison')}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              filingComparison.recommended === 'joint' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t('personalInfo.filingStatuses.marriedJointly')}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(filingComparison.joint.totalTax)}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              filingComparison.recommended === 'separate' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t('personalInfo.filingStatuses.marriedSeparately')}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(filingComparison.separate.totalTax)}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">{t('spouseInfo.recommendedFiling')}</span>
            </div>
            <div className="text-lg font-bold text-yellow-900">
              {filingComparison.recommended === 'joint' 
                ? t('personalInfo.filingStatuses.marriedJointly')
                : t('personalInfo.filingStatuses.marriedSeparately')
              }
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              💰 {t('spouseInfo.jointSavings')}: {formatCurrency(Math.abs(filingComparison.joint.totalTax - filingComparison.separate.totalTax))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SpouseDialog = () => {
    if (!showSpouseDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{t('spouseInfo.title')}</h3>
              </div>
              <button
                onClick={() => setShowSpouseDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">{t('spouseInfo.subtitle')}</p>
            
            {/* Spouse form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('spouseInfo.firstName')} <span className="text-red-500">*</span>
                </label>
                <UncontrolledInput
                  field="firstName"
                  defaultValue={spouseInfo.firstName}
                  onChange={handleSpouseInfoChange}
                  placeholder={t('spouseInfo.firstName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('spouseInfo.lastName')} <span className="text-red-500">*</span>
                </label>
                <UncontrolledInput
                  field="lastName"
                  defaultValue={spouseInfo.lastName}
                  onChange={handleSpouseInfoChange}
                  placeholder={t('spouseInfo.lastName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('spouseInfo.ssn')} <span className="text-red-500">*</span>
                </label>
                <UncontrolledInput
                  field="ssn"
                  defaultValue={spouseInfo.ssn}
                  onChange={handleSpouseInfoChange}
                  placeholder="XXX-XX-XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('spouseInfo.wages')}
                </label>
                <UncontrolledInput
                  field="wages"
                  defaultValue={spouseInfo.wages}
                  onChange={handleSpouseInfoChange}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('income.interestIncome')}
                </label>
                <UncontrolledInput
                  field="interestIncome"
                  defaultValue={spouseInfo.interestIncome}
                  onChange={handleSpouseInfoChange}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('income.dividends')}
                </label>
                <UncontrolledInput
                  field="dividends"
                  defaultValue={spouseInfo.dividends}
                  onChange={handleSpouseInfoChange}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payments.federalWithholding')}
                </label>
                <UncontrolledInput
                  field="federalWithholding"
                  defaultValue={spouseInfo.federalWithholding}
                  onChange={handleSpouseInfoChange}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payments.stateWithholding')}
                </label>
                <UncontrolledInput
                  field="stateWithholding"
                  defaultValue={spouseInfo.stateWithholding}
                  onChange={handleSpouseInfoChange}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSpouseDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSpouseDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {t('title')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base max-w-4xl mx-auto">
                {t('subtitle')}
              </p>
            </div>
            
            {/* Language Selector */}
            <div className="relative ml-4">
              <button
                onClick={toggleLanguageMenu}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                <Globe className="h-4 w-4" />
                <span>{currentLanguageInfo.flag} {currentLanguageInfo.name}</span>
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {language === lang.code && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs sm:text-sm text-yellow-800">
              {t('disclaimer')}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs sm:text-sm text-green-800">
              {t('privacyNotice')}
            </div>

            {/* Enhanced Tax Wizard Action Buttons */}
            <div className="space-y-3 mt-4">
              {/* Primary Actions */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setShowEnhancedWizard(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium shadow-lg transform hover:scale-105 transition-all"
                >
                  <Zap className="h-5 w-5" />
                  Start Smart Tax Wizard
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
                  {useClassicMode ? 'Exit Classic Mode' : 'Use Classic Mode'}
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setShowDataImportExport(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs font-medium"
                >
                  <Download className="h-4 w-4" />
                  Import/Export
                </button>
                <button
                  onClick={() => setShowReviewAccuracy(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium"
                >
                  <Shield className="h-4 w-4" />
                  Review & Check
                </button>
                <button
                  onClick={() => setShowInterviewFlow(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  Quick Interview
                </button>
                <button
                  onClick={() => setShowAdvancedFeatures(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium"
                >
                  <Target className="h-4 w-4" />
                  Advanced
                </button>
                <button
                  onClick={() => setShowAssistant(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Help
                </button>
                <button
                  onClick={() => setShowProMode(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-medium"
                >
                  <Users className="h-4 w-4" />
                  Pro Mode
                </button>
              </div>
            </div>
          </div>
        </div>

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
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {['personal', 'income', 'payments', 'deductions'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {tab === 'personal' && <User className="h-4 w-4" />}
                          {tab === 'income' && <DollarSign className="h-4 w-4" />}
                          {tab === 'payments' && <FileText className="h-4 w-4" />}
                          {tab === 'deductions' && <Calculator className="h-4 w-4" />}
                          {t(`tabs.${tab}`)}
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'personal' && (
                  <PersonalInfoForm
                    personalInfo={personalInfo}
                    onChange={handlePersonalInfoChange}
                    t={t}
                    UncontrolledInput={UncontrolledInput}
                    onShowSpouseDialog={setShowSpouseDialog}
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
              onExportPDF={exportToPDF}
              onExportJSON={exportToJSON}
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
                {federalTaxBrackets[personalInfo.filingStatus]?.map((bracket, index) => (
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
            <FilingComparisonCard />

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
            {taxResult.totalIncome > 0 && (
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
      <SpouseDialog />

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
      {showAdvancedFeatures && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Advanced Tax Features</h3>
              <button
                onClick={() => setShowAdvancedFeatures(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Features Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'validator', label: 'Tax Validator', icon: Shield },
                  { id: 'forms', label: 'Tax Forms', icon: FileText },
                  { id: 'planner', label: 'Tax Planner', icon: Target },
                  { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
                  { id: 'audit', label: 'Audit Support', icon: Shield },
                  { id: 'comparison', label: 'Multi-Year', icon: BarChart3 },
                  { id: 'notifications', label: 'Tax Updates', icon: AlertCircle },
                  { id: 'backup', label: 'Data Backup', icon: Shield },
                  { id: 'education', label: 'Tax Education', icon: FileText },
                  { id: 'collaboration', label: 'Collaboration', icon: Share2 },
                  { id: 'scanner', label: 'Document Scanner', icon: ScanLine },
                  { id: 'risk-assessment', label: 'Audit Risk', icon: AlertTriangle }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdvancedTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      advancedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Advanced Features Content */}
            <div className="p-6">
              {advancedTab === 'validator' && (
                <TaxValidator
                  formData={{ personalInfo, incomeData, deductions, taxResult, paymentsData }}
                  t={t}
                />
              )}

              {advancedTab === 'forms' && (
                <TaxFormGenerator
                  formData={{ personalInfo, incomeData, deductions, taxResult, spouseInfo, paymentsData }}
                  t={t}
                />
              )}

              {advancedTab === 'planner' && (
                <TaxPlanner
                  formData={{ personalInfo, incomeData, deductions, paymentsData }}
                  taxResult={taxResult}
                  t={t}
                />
              )}

              {advancedTab === 'portfolio' && (
                <PortfolioOptimizer
                  formData={{ personalInfo, incomeData, deductions, paymentsData }}
                  taxResult={taxResult}
                  t={t}
                />
              )}

              {advancedTab === 'audit' && (
                <AuditSupport
                  formData={{ personalInfo, incomeData, deductions, paymentsData }}
                  taxResult={taxResult}
                  t={t}
                />
              )}

              {advancedTab === 'comparison' && (
                <MultiYearComparison
                  currentYearData={{ taxResult, incomeData, deductions }}
                  t={t}
                />
              )}

              {advancedTab === 'notifications' && (
                <TaxLawNotifications
                  selectedState={selectedState}
                  filingStatus={personalInfo.filingStatus}
                  t={t}
                />
              )}

              {advancedTab === 'backup' && (
                <DataBackupManager
                  formData={{ personalInfo, incomeData, deductions, paymentsData, k1Data, businessDetails, spouseInfo }}
                  taxResult={taxResult}
                  onDataRestore={(data: any) => {
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
              )}

              {advancedTab === 'education' && (
                <TaxEducationCenter
                  t={t}
                />
              )}

              {advancedTab === 'collaboration' && (
                <CollaborativeTaxPrep
                  sessionId="main-session"
                  currentUser={{
                    id: personalInfo.ssn || 'user-' + Date.now(),
                    name: `${personalInfo.firstName} ${personalInfo.lastName}` || 'User',
                    email: personalInfo.email || 'user@example.com',
                    role: 'owner'
                  }}
                  onDataChange={(field: string, value: any) => {
                    // Handle real-time collaborative changes
                    console.log('Collaborative update:', field, value);
                  }}
                  t={t}
                />
              )}

              {advancedTab === 'scanner' && (
                <DocumentScanner
                  onDocumentScanned={(document) => {
                    // Auto-populate form fields from scanned documents
                    if (document.type === 'w2' && document.extractedData) {
                      const data = document.extractedData;
                      if (data.wages) handleIncomeChange('wages', String(data.wages));
                      if (data.federalWithholding) handlePaymentsChange('federalWithholding', String(data.federalWithholding));
                      if (data.stateWithholding) handlePaymentsChange('stateWithholding', String(data.stateWithholding));
                    }
                    if (document.type === '1099' && document.extractedData) {
                      const data = document.extractedData;
                      if (data.interest) handleIncomeChange('interestIncome', String(data.interest));
                      if (data.dividends) handleIncomeChange('dividends', String(data.dividends));
                    }
                  }}
                  t={t}
                />
              )}

              {advancedTab === 'risk-assessment' && (
                <AuditRiskAssessment
                  formData={{ personalInfo, incomeData, deductions, paymentsData }}
                  taxResult={taxResult}
                  onRecommendationApplied={(recommendation) => {
                    console.log('Applied audit recommendation:', recommendation);
                    // Apply the recommendation to improve audit protection
                  }}
                  t={t}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">AI Tax Assistant</h3>
              <button
                onClick={() => setShowAssistant(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[600px]">
              <TaxAssistant
                formData={{ personalInfo, incomeData, deductions, paymentsData }}
                taxResult={taxResult}
                t={t}
              />
            </div>
          </div>
        </div>
      )}

      {/* Professional Tax Preparer Mode */}
      {showProMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Professional Tax Preparer Mode</h3>
              <button
                onClick={() => setShowProMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0">
              <TaxPreparerMode t={t} />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Wizard Modal */}
      {showEnhancedWizard && (
        <TaxWizard
          onComplete={(data) => {
            // Handle wizard completion and update tax data
            console.log('Wizard completed with data:', data);

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
                  console.log('Importing data:', data);

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
      {showReviewAccuracy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Tax Review & Accuracy Check</h3>
              <button
                onClick={() => setShowReviewAccuracy(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <TaxReviewAccuracy
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
                calculations={taxResult}
                onFixIssue={(issueId, fieldPath) => {
                  // Handle fixing issues
                  console.log('Fix issue:', issueId, fieldPath);
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
                  console.log('Accept suggestion:', suggestionId);

                  // Implement specific suggestions
                  if (suggestionId === 'itemize-deductions') {
                    handleDeductionChange('useStandardDeduction', false);
                  }
                }}
                t={t}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
