import React from 'react';
import { X } from 'lucide-react';
import { TaxPreparerMode } from '../professional/TaxPreparerMode';

interface ProModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

/**
 * 专业税务准备者模式模态框
 * 为税务专业人士提供客户管理和高级功能
 */
export const ProModeModal: React.FC<ProModeModalProps> = ({
  isOpen,
  onClose,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600">
          <h3 className="text-xl font-semibold text-white">
            Professional Tax Preparer Mode
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <TaxPreparerMode t={t} />
        </div>
      </div>
    </div>
  );
};
