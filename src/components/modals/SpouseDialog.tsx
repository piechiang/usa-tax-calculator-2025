import React from 'react';
import { Users, X } from 'lucide-react';
import type { SpouseInfo } from '../../types/CommonTypes';

interface InputProps {
  field?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (field: string, value: string) => void;
  placeholder?: string;
  type?: string;
  [key: string]: unknown;
}

interface SpouseDialogProps {
  show: boolean;
  spouseInfo: SpouseInfo;
  t: (key: string) => string;
  UncontrolledInput: React.ComponentType<InputProps>;
  onClose: () => void;
  onSpouseInfoChange: (field: string, value: string) => void;
}

export const SpouseDialog: React.FC<SpouseDialogProps> = ({
  show,
  spouseInfo,
  t,
  UncontrolledInput,
  onClose,
  onSpouseInfoChange,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {t('spouseInfo.title')}
              </h3>
            </div>
            <button
              onClick={onClose}
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
                onChange={onSpouseInfoChange}
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
                onChange={onSpouseInfoChange}
                placeholder={t('spouseInfo.lastName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('spouseInfo.ssn')}
              </label>
              <UncontrolledInput
                field="ssn"
                defaultValue={spouseInfo.ssn}
                onChange={onSpouseInfoChange}
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
                onChange={onSpouseInfoChange}
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
                onChange={onSpouseInfoChange}
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
                onChange={onSpouseInfoChange}
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
                onChange={onSpouseInfoChange}
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
                onChange={onSpouseInfoChange}
                type="number"
                placeholder="0"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
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
