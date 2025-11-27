import React from 'react';
import { MapPin } from 'lucide-react';
import { federalTaxBrackets, marylandCountyRates, standardDeductions } from '../../constants/taxBrackets';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import type { PersonalInfo } from '../../types/CommonTypes';

interface TaxInfoPanelsProps {
  personalInfo: PersonalInfo;
  taxResult: Record<string, number>;
  language: string;
  t: (key: string) => string;
}

export const TaxInfoPanels: React.FC<TaxInfoPanelsProps> = ({
  personalInfo,
  t,
}) => {
  return (
    <>
      {/* Federal Tax Bracket Reference */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('taxBrackets.title')}</h3>
        <div className="text-xs space-y-1 overflow-x-auto">
          <div className="grid grid-cols-2 gap-2 font-semibold border-b pb-1 min-w-max">
            <span>{t('taxBrackets.taxableIncome')}</span>
            <span>{t('taxBrackets.rate')}</span>
          </div>
          {federalTaxBrackets[personalInfo.filingStatus as keyof typeof federalTaxBrackets]?.map((bracket, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 text-gray-600 min-w-max">
              <span className="text-xs">
                {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
              </span>
              <span>{formatPercentage(bracket.rate)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Maryland Tax Info */}
      {personalInfo.isMaryland && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-600" />
            {t('marylandInfo.title')}
          </h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>{t('marylandInfo.stateRateRange')}</span>
              <span>2% - 5.75%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('marylandInfo.localTaxRate')} ({personalInfo.county}):</span>
              <span>{formatPercentage(marylandCountyRates[personalInfo.county] || 0.032)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('marylandInfo.standardDeduction')}</span>
              <span>{formatCurrency(personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Standard Deductions Info */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('standardDeductions.title')}</h3>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>{t('standardDeductions.single')}</span>
            <span>{formatCurrency(standardDeductions.single)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('standardDeductions.marriedJointly')}</span>
            <span>{formatCurrency(standardDeductions.marriedJointly)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('standardDeductions.marriedSeparately')}</span>
            <span>{formatCurrency(standardDeductions.marriedSeparately)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('standardDeductions.headOfHousehold')}</span>
            <span>{formatCurrency(standardDeductions.headOfHousehold)}</span>
          </div>
        </div>
      </div>
    </>
  );
};
