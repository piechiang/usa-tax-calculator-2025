import { lazy, Suspense } from 'react';

import type { TaxContextValue } from '../../contexts/TaxContext';

const TaxWizard = lazy(() =>
  import('../wizard/TaxWizard').then(m => ({ default: m.TaxWizard }))
);

interface WizardModalProps {
  isOpen: boolean;
  onComplete: (data: Record<string, string | number | boolean>) => void;
  onCancel: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  personalInfo: TaxContextValue['personalInfo'];
  incomeData: TaxContextValue['incomeData'];
  deductions: TaxContextValue['deductions'];
  paymentsData: TaxContextValue['paymentsData'];
  taxResult: TaxContextValue['taxResult'];
  filingComparison: TaxContextValue['filingComparison'];
  taxOptimizations: TaxContextValue['taxOptimizations'];
  t: (key: string) => string;
}

export function WizardModal({
  isOpen,
  onComplete,
  onCancel,
  onExportPDF,
  onExportJSON,
  personalInfo,
  incomeData,
  deductions,
  paymentsData,
  taxResult,
  filingComparison,
  taxOptimizations,
  t
}: WizardModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <TaxWizard
        onComplete={onComplete}
        onCancel={onCancel}
        onExportPDF={onExportPDF}
        onExportJSON={onExportJSON}
        personalInfo={personalInfo}
        incomeData={incomeData}
        deductions={deductions}
        paymentsData={paymentsData}
        taxResult={taxResult}
        filingComparison={filingComparison}
        taxOptimizations={taxOptimizations}
        t={t}
      />
    </Suspense>
  );
}
