import { lazy, Suspense } from 'react';
import { X } from 'lucide-react';

import type { TaxContextValue } from '../../contexts/TaxContext';

const DataImportExport = lazy(() => import('../import/DataImportExport'));

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown) => void;
  onExport: (format: string) => Promise<void>;
  currentData: {
    personalInfo: TaxContextValue['personalInfo'];
    incomeData: TaxContextValue['incomeData'];
    deductions: TaxContextValue['deductions'];
    calculations: TaxContextValue['taxResult'];
  };
  t: (key: string) => string;
}

export function DataImportExportModal({
  isOpen,
  onClose,
  onImport,
  onExport,
  currentData,
  t
}: DataImportExportModalProps) {
  if (!isOpen) {
    return null;
  }

  const titleKey = t('importExport.title');
  const resolvedTitle =
    titleKey && titleKey !== 'importExport.title' ? titleKey : 'Import & Export Tax Data';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">{resolvedTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close import/export modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <DataImportExport onImport={onImport} onExport={onExport} currentData={currentData} t={t} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
