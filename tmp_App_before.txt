import React, { useState } from 'react';
import { Calculator, FileText, User, DollarSign, Download, AlertCircle, MapPin, Globe, CheckCircle, Users, TrendingUp } from 'lucide-react';

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
    recalculate
  } = useTaxCalculator();

  const [activeTab, setActiveTab] = useState('personal');
  const [showSpouseDialog, setShowSpouseDialog] = useState(false);

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
                ✕
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
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Panel - Forms */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg">
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
      </div>
      
      {/* Modals */}
      <SpouseDialog />
    </div>
  );
}