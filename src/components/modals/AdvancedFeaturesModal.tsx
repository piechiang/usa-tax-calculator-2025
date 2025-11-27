import React, { Suspense, lazy } from 'react';
import {
  X,
  Shield,
  BookOpen,
  ScanLine,
  AlertTriangle,
  FileText,
  Target,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Share2,
  Loader2
} from 'lucide-react';

import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';
import { useTaxDataHandlers } from '../../hooks/useTaxDataHandlers';

// Lazy-load heavy advanced components for better initial load performance
const TaxValidator = lazy(() => import('../validation/TaxValidator').then(m => ({ default: m.TaxValidator })));
const TaxFormGenerator = lazy(() => import('../forms/TaxFormGenerator').then(m => ({ default: m.TaxFormGenerator })));
const TaxPlanner = lazy(() => import('../planning/TaxPlanner').then(m => ({ default: m.TaxPlanner })));
const PortfolioOptimizer = lazy(() => import('../portfolio/PortfolioOptimizer').then(m => ({ default: m.PortfolioOptimizer })));
const AuditSupport = lazy(() => import('../audit/AuditSupport').then(m => ({ default: m.AuditSupport })));
const MultiYearComparison = lazy(() => import('../comparison/MultiYearComparison').then(m => ({ default: m.MultiYearComparison })));
const TaxLawNotifications = lazy(() => import('../notifications/TaxLawNotifications').then(m => ({ default: m.TaxLawNotifications })));
const DataBackupManager = lazy(() => import('../data/DataBackupManager').then(m => ({ default: m.DataBackupManager })));
const TaxEducationCenter = lazy(() => import('../education/TaxEducationCenter').then(m => ({ default: m.TaxEducationCenter })));
const CollaborativeTaxPrep = lazy(() => import('../collaboration/CollaborativeTaxPrep').then(m => ({ default: m.CollaborativeTaxPrep })));
const DocumentScanner = lazy(() => import('../ocr/DocumentScanner').then(m => ({ default: m.DocumentScanner })));
const AuditRiskAssessment = lazy(() => import('../audit/AuditRiskAssessment').then(m => ({ default: m.AuditRiskAssessment })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading component...</p>
    </div>
  </div>
);

const TABS: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'validator', label: 'Tax Validator', icon: Shield },
  { id: 'forms', label: 'Tax Forms', icon: FileText },
  { id: 'planner', label: 'Tax Planner', icon: Target },
  { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
  { id: 'audit', label: 'Audit Support', icon: Shield },
  { id: 'comparison', label: 'Multi-Year', icon: BarChart3 },
  { id: 'notifications', label: 'Tax Updates', icon: AlertCircle },
  { id: 'backup', label: 'Data Backup', icon: Shield },
  { id: 'education', label: 'Tax Education', icon: BookOpen },
  { id: 'collaboration', label: 'Collaboration', icon: Share2 },
  { id: 'scanner', label: 'Document Scanner', icon: ScanLine },
  { id: 'risk-assessment', label: 'Audit Risk', icon: AlertTriangle }
];

export function AdvancedFeaturesModal() {
  const { t } = useLanguageContext();
  const {
    personalInfo,
    incomeData,
    deductions,
    paymentsData,
    taxResult,
    spouseInfo,
    k1Data,
    businessDetails,
    handleIncomeChange,
    handlePaymentsChange
  } = useTaxContext();

  const {
    showAdvancedFeatures,
    setShowAdvancedFeatures,
    advancedTab,
    setAdvancedTab,
    selectedState
  } = useUIContext();

  const { restoreBackup } = useTaxDataHandlers();

  if (!showAdvancedFeatures) {
    return null;
  }

  const closeModal = () => setShowAdvancedFeatures(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Advanced Tools Center</h3>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close advanced tools"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdvancedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    advancedTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<LoadingFallback />}>
            {advancedTab === 'validator' && (
              <TaxValidator formData={{ personalInfo, incomeData, deductions, taxResult, paymentsData }} t={t} />
            )}

            {advancedTab === 'forms' && (
              <TaxFormGenerator
              formData={{
                personalInfo,
                incomeData,
                deductions,
                taxResult,
                spouseInfo,
                paymentsData
              }}
              t={t}
            />
          )}

          {advancedTab === 'planner' && (
            <TaxPlanner formData={{ personalInfo, incomeData, deductions, paymentsData }} taxResult={taxResult} t={t} />
          )}

          {advancedTab === 'portfolio' && (
            <PortfolioOptimizer formData={{ personalInfo, incomeData, deductions, paymentsData }} taxResult={taxResult} t={t} />
          )}

          {advancedTab === 'audit' && (
            <AuditSupport formData={{ personalInfo, incomeData, deductions, paymentsData }} taxResult={taxResult} t={t} />
          )}

          {advancedTab === 'comparison' && (
            <MultiYearComparison currentYearData={{ taxResult, deductions }} t={t} />
          )}

          {advancedTab === 'notifications' && (
            <TaxLawNotifications selectedState={selectedState} filingStatus={personalInfo.filingStatus} t={t} />
          )}

          {advancedTab === 'backup' && (
            <DataBackupManager
              formData={{
                personalInfo,
                incomeData,
                deductions,
                paymentsData,
                k1Data,
                businessDetails,
                spouseInfo
              }}
              taxResult={taxResult}
              onDataRestore={restoreBackup}
              t={t}
            />
          )}

          {advancedTab === 'education' && <TaxEducationCenter />}

          {advancedTab === 'collaboration' && (
            <CollaborativeTaxPrep
              currentUser={{
                id: personalInfo.ssn || `user-${Date.now()}`,
                name: [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' ') || 'User',
                email: 'user@example.com',
                role: 'owner'
              }}
              onDataChange={() => {
                /* Integrate shared updates here */
              }}
            />
          )}

          {advancedTab === 'scanner' && (
            <DocumentScanner
              onDataExtracted={(data: Record<string, unknown>, documentType: string) => {
                if (documentType === 'w2' && data) {
                  if (data.wages) handleIncomeChange('wages', String(data.wages));
                  if (data.federalWithholding) handlePaymentsChange('federalWithholding', String(data.federalWithholding));
                  if (data.stateWithholding) handlePaymentsChange('stateWithholding', String(data.stateWithholding));
                }

                if (documentType === '1099' && data) {
                  if (data.interest) handleIncomeChange('interestIncome', String(data.interest));
                  if (data.dividends) handleIncomeChange('dividends', String(data.dividends));
                }
              }}
              t={t}
            />
          )}

            {advancedTab === 'risk-assessment' && (
              <AuditRiskAssessment formData={{ personalInfo, incomeData, deductions, businessDetails }} taxResult={taxResult} t={t} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
