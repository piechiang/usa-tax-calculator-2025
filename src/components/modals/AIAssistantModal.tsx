import React from 'react';
import { X } from 'lucide-react';
import { TaxAssistant } from '../assistant/TaxAssistant';

interface TaxData {
  [key: string]: unknown;
}

interface TaxResult {
  [key: string]: unknown;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxData: TaxData;
  taxResult: TaxResult;
  t: (key: string) => string;
}

/**
 * AI 税务助手模态框
 * 提供智能税务咨询和建议
 */
export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  taxData,
  taxResult,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
          <h3 className="text-xl font-semibold text-white">AI Tax Assistant</h3>
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
          <TaxAssistant
            formData={taxData}
            taxResult={taxResult}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};
