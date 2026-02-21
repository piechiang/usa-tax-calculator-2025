import React from 'react';
import { X } from 'lucide-react';
import TaxReviewAccuracy from '../review/TaxReviewAccuracy';
import type { TaxDataSnapshot, TaxCalculationOutput } from '../../types/CommonTypes';

interface ReviewAccuracyModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxData: Record<string, unknown>;
  taxResult: Record<string, unknown>;
  onFixIssue: (issueId: string, fieldPath: string) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  t: (key: string) => string;
}

/**
 * 税务审核准确性模态框
 * 检查税务数据的准确性并提供建议
 */
export const ReviewAccuracyModal: React.FC<ReviewAccuracyModalProps> = ({
  isOpen,
  onClose,
  taxData,
  taxResult,
  onFixIssue,
  onAcceptSuggestion,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-green-600 to-teal-600">
          <h3 className="text-xl font-semibold text-white">税务审核与准确性检查</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <TaxReviewAccuracy
            taxData={taxData as unknown as TaxDataSnapshot}
            calculations={taxResult as unknown as TaxCalculationOutput}
            onFixIssue={onFixIssue}
            onAcceptSuggestion={onAcceptSuggestion}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};
