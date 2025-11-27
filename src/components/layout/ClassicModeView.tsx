import React from 'react';

import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';
import { useTaxDataHandlers } from '../../hooks/useTaxDataHandlers';
import { StateTaxSelector } from '../forms/StateTaxSelector';
import DeductionsForm from '../forms/DeductionsForm';
import IncomeForm from '../forms/IncomeForm';
import PaymentsForm from '../forms/PaymentsForm';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import { TaxInfoPanels } from './TaxInfoPanels';
import { NavigationBar } from './NavigationBar';
import TaxResults from '../ui/TaxResults';
import TaxBurdenChart from '../ui/TaxBurdenChart';
import TaxOptimization from '../ui/TaxOptimization';
import { FilingComparisonCard } from '../ui/FilingComparisonCard';
import { ValidatedInput, UncontrolledInput } from '../ui/InputField';

export function ClassicModeView() {
  const { language, t } = useLanguageContext();
  const {
    personalInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult,
    filingComparison,
    taxOptimizations,
    handlePersonalInfoChange,
    handleIncomeChange,
    handleK1Change,
    handleBusinessDetailsChange,
    handlePaymentsChange,
    handleDeductionChange,
    recalculate
  } = useTaxContext();
  const {
    activeTab,
    setActiveTab,
    setShowSpouseDialog,
    setUseClassicMode,
    selectedState,
    setSelectedState
  } = useUIContext();
  const { exportPDF, exportJSON } = useTaxDataHandlers();

  // Handle state change - update both UI state and PersonalInfo.state to trigger recalculation
  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode); // Update UI context
    handlePersonalInfoChange('state', stateCode); // Update PersonalInfo.state to trigger tax recalculation
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="bg-gray-100 px-6 py-2 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Classic Tab-Based Mode</span>
              <button
                onClick={() => setUseClassicMode(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Switch to Smart Wizard {'\u2192'}
              </button>
            </div>
          </div>

          <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} t={t} />

          <div className="p-6">
            {activeTab === 'personal' && (
              <PersonalInfoForm
                personalInfo={personalInfo}
                onChange={handlePersonalInfoChange}
                UncontrolledInput={UncontrolledInput}
                onShowSpouseDialog={() => setShowSpouseDialog(true)}
                t={t}
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
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsForm
                paymentsData={paymentsData}
                personalInfo={personalInfo}
                onChange={handlePaymentsChange}
                ValidatedInput={ValidatedInput}
                t={t}
              />
            )}

            {activeTab === 'deductions' && (
              <DeductionsForm
                deductions={deductions}
                onChange={handleDeductionChange}
                ValidatedInput={ValidatedInput}
                t={t}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <TaxResults
          taxResult={taxResult}
          language={language}
          onExportPDF={exportPDF}
          onExportJSON={exportJSON}
          onRecalculate={recalculate}
          t={t}
          selectedState={selectedState}
        />

        <StateTaxSelector
          selectedState={selectedState}
          onStateChange={handleStateChange}
          taxableIncome={(taxResult.taxableIncome as number) || 0}
          filingStatus={personalInfo.filingStatus}
          t={t}
        />

        <TaxInfoPanels personalInfo={personalInfo} taxResult={taxResult} language={language} t={t} />

        <TaxBurdenChart taxResult={taxResult} language={language} />

        <FilingComparisonCard filingComparison={filingComparison} t={t} />

        <TaxOptimization suggestions={taxOptimizations} language={language} t={t} />
      </div>
    </div>
  );
}

