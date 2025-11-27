import React from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface FilingComparison {
  joint: { totalTax: number };
  separate: { totalTax: number };
  recommended: 'joint' | 'separate';
}

interface FilingComparisonCardProps {
  filingComparison: FilingComparison | null;
  t: (key: string) => string;
}

export const FilingComparisonCard: React.FC<FilingComparisonCardProps> = ({
  filingComparison,
  t,
}) => {
  if (!filingComparison) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-green-600" />
        {t('spouseInfo.filingComparison')}
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 ${
              filingComparison.recommended === 'joint'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium text-gray-700 mb-2">
              {t('personalInfo.filingStatuses.marriedJointly')}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(filingComparison.joint.totalTax)}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${
              filingComparison.recommended === 'separate'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
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
            <span className="font-medium text-yellow-800">
              {t('spouseInfo.recommendedFiling')}
            </span>
          </div>
          <div className="text-lg font-bold text-yellow-900">
            {filingComparison.recommended === 'joint'
              ? t('personalInfo.filingStatuses.marriedJointly')
              : t('personalInfo.filingStatuses.marriedSeparately')}
          </div>
          <div className="text-sm text-yellow-700 mt-1">
            💰 {t('spouseInfo.jointSavings')}:{' '}
            {formatCurrency(
              Math.abs(
                filingComparison.joint.totalTax - filingComparison.separate.totalTax
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
