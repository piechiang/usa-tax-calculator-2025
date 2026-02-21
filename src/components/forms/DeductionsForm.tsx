import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface DeductionsFormProps {
  deductions: Record<string, string | number | boolean | undefined>;
  onChange: (field: string, value: string | number | boolean) => void;
  t: (key: string) => string;
  ValidatedInput: React.ComponentType<{
    field: string;
    value: string | number;
    onChange: (field: string, value: string) => void;
    section?: string;
    type?: string;
    placeholder?: string;
    [key: string]: unknown;
  }>;
}

const DeductionsForm: React.FC<DeductionsFormProps> = ({
  deductions,
  onChange,
  t,
  ValidatedInput,
}) => {
  // Use the itemizedTotal from state that's auto-calculated in the handler
  const itemizedTotal = Number(deductions.itemizedTotal) || 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('deductions.title')}</h3>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={Boolean(deductions.useStandardDeduction)}
              onChange={() => onChange('useStandardDeduction', true)}
              className="mr-2"
            />
            <span className="text-sm sm:text-base">
              {t('deductions.standardDeduction')}{' '}
              {formatCurrency(Number(deductions.standardDeduction) || 0)}
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!deductions.useStandardDeduction}
              onChange={() => onChange('useStandardDeduction', false)}
              className="mr-2"
            />
            <span className="text-sm sm:text-base">{t('deductions.itemizeDeductions')}</span>
          </label>
        </div>
      </div>

      {!deductions.useStandardDeduction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('deductions.mortgageInterest')}
            </label>
            <ValidatedInput
              field="mortgageInterest"
              value={String(deductions.mortgageInterest || '')}
              onChange={onChange}
              section="deductions"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('deductions.stateLocalTaxes')}
            </label>
            <ValidatedInput
              field="stateLocalTaxes"
              value={String(deductions.stateLocalTaxes || '')}
              onChange={onChange}
              section="deductions"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
              max="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('deductions.charitableContributions')}
            </label>
            <ValidatedInput
              field="charitableContributions"
              value={String(deductions.charitableContributions || '')}
              onChange={onChange}
              section="deductions"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('deductions.medicalExpenses')}
            </label>
            <ValidatedInput
              field="medicalExpenses"
              value={String(deductions.medicalExpenses || '')}
              onChange={onChange}
              section="deductions"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('deductions.otherItemized')}
            </label>
            <ValidatedInput
              field="otherItemized"
              value={String(deductions.otherItemized || '')}
              onChange={onChange}
              section="deductions"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded border-2 border-blue-300">
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Total Itemized Deductions
            </label>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(itemizedTotal)}</div>
            {itemizedTotal < (Number(deductions.standardDeduction) || 0) && (
              <div className="text-xs text-blue-600 mt-1">
                💡 Standard deduction is higher (
                {formatCurrency(Number(deductions.standardDeduction) || 0)})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(DeductionsForm);
