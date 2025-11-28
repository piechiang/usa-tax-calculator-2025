import React, { useState, useMemo } from 'react';
import { MapPin, Calculator, Info } from 'lucide-react';
import type { TranslationFunction } from '../../types/CommonTypes';
import { STATE_CONFIGS, getStateCalculator } from '../../engine/states/registry';

interface StateTaxSelectorProps {
  selectedState: string;
  onStateChange: (stateCode: string) => void;
  taxableIncome: number;
  filingStatus: string;
  t: TranslationFunction;
}

interface StateOption {
  code: string;
  name: string;
  hasTax: boolean;
  taxType: 'flat' | 'graduated' | 'none';
  implemented: boolean;
}

export const StateTaxSelector: React.FC<StateTaxSelectorProps> = ({
  selectedState,
  onStateChange,
  taxableIncome,
  filingStatus,
  t
}) => {
  const [showStateDetails, setShowStateDetails] = useState(false);

  // Get all states (both implemented and pending)
  const allStates = useMemo(() => {
    return Object.entries(STATE_CONFIGS)
      .map(([code, config]) => ({
        code,
        name: config.name,
        hasTax: config.hasTax,
        taxType: config.taxType,
        implemented: config.implemented
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Convert STATE_CONFIGS to array for dropdown (implemented only)
  const stateOptions: StateOption[] = useMemo(() => {
    return allStates.filter(s => s.implemented);
  }, [allStates]);

  // Calculate coverage statistics
  const coverageStats = useMemo(() => {
    const total = allStates.length;
    const implemented = stateOptions.length;
    const pending = total - implemented;
    const percentage = Math.round((implemented / total) * 100);
    return { total, implemented, pending, percentage };
  }, [allStates, stateOptions]);

  const selectedStateConfig = selectedState ? STATE_CONFIGS[selectedState.toUpperCase()] : null;
  const stateCalculator = selectedState ? getStateCalculator(selectedState.toUpperCase()) : null;

  const getStateIcon = (hasTax: boolean) => {
    // Removed emoji icons to prevent encoding issues
    return hasTax ? '[TAX]' : '[NO TAX]';
  };

  const getTaxTypeDisplay = (taxType: string) => {
    switch (taxType) {
      case 'flat':
        return 'Flat Rate';
      case 'graduated':
        return 'Progressive (Graduated)';
      case 'none':
        return 'No Income Tax';
      default:
        return taxType;
    }
  };

  // Group states by tax type
  const statesByType = useMemo(() => {
    const noTaxStates = stateOptions.filter(s => !s.hasTax);
    const flatTaxStates = stateOptions.filter(s => s.hasTax && s.taxType === 'flat');
    const graduatedTaxStates = stateOptions.filter(s => s.hasTax && s.taxType === 'graduated');

    return { noTaxStates, flatTaxStates, graduatedTaxStates };
  }, [stateOptions]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with Coverage Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('stateTaxSelector.title') || 'State Tax Information'}
          </h3>
        </div>

        {/* Coverage Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            coverageStats.percentage === 100
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {coverageStats.implemented}/{coverageStats.total} States ({coverageStats.percentage}%)
          </div>
        </div>
      </div>

      {/* Coverage Progress Bar */}
      {coverageStats.percentage < 100 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>State Coverage Progress</span>
            <span>{coverageStats.pending} states pending</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${coverageStats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* State Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('stateTaxSelector.selectState') || 'Select State'}
        </label>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{t('stateTaxSelector.chooseState') || 'Choose a state...'}</option>

          {/* No Income Tax States */}
          {statesByType.noTaxStates.length > 0 && (
            <optgroup label="--- No Income Tax States ---">
              {statesByType.noTaxStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </optgroup>
          )}

          {/* Flat Tax States */}
          {statesByType.flatTaxStates.length > 0 && (
            <optgroup label="--- Flat Tax States ---">
              {statesByType.flatTaxStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code}) - Flat Rate
                </option>
              ))}
            </optgroup>
          )}

          {/* Graduated Tax States */}
          {statesByType.graduatedTaxStates.length > 0 && (
            <optgroup label="--- Progressive Tax States ---">
              {statesByType.graduatedTaxStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code}) - Progressive
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Selected State Details */}
      {selectedStateConfig && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {getStateIcon(selectedStateConfig.hasTax)}
              {selectedStateConfig.name} Tax Information
            </h4>
            <button
              onClick={() => setShowStateDetails(!showStateDetails)}
              className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
            >
              <Info className="h-4 w-4" />
              {showStateDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Tax Type and Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-600 block text-xs mb-1">Tax System</span>
              <span className="font-medium">{getTaxTypeDisplay(selectedStateConfig.taxType)}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-gray-600 block text-xs mb-1">Income Tax</span>
              <span className="font-medium">
                {selectedStateConfig.hasTax ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* No Income Tax Message */}
          {!selectedStateConfig.hasTax && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
              <p className="text-sm text-green-800 font-medium">
                {selectedStateConfig.name} has no state income tax!
              </p>
              <p className="text-xs text-green-700 mt-1">
                You only need to pay federal income tax for this state.
              </p>
            </div>
          )}

          {/* State Tax Features */}
          {selectedStateConfig.hasTax && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Tax Features:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedStateConfig.hasStandardDeduction && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">+</span>
                    <span>Standard Deduction</span>
                  </div>
                )}
                {selectedStateConfig.hasPersonalExemption && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">+</span>
                    <span>Personal Exemption</span>
                  </div>
                )}
                {selectedStateConfig.hasStateEITC && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">+</span>
                    <span>State EITC ({(selectedStateConfig.stateEITCPercent || 0) * 100}% of federal)</span>
                  </div>
                )}
                {selectedStateConfig.hasLocalTax && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600 font-bold">*</span>
                    <span>Local Income Tax</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Information */}
          {showStateDetails && (
            <div className="mt-4 space-y-3 border-t pt-3">
              {/* Implementation Status */}
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-gray-900 mb-2 text-sm">Implementation Status</h5>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calculator:</span>
                    <span className={`font-medium ${stateCalculator ? 'text-green-600' : 'text-yellow-600'}`}>
                      {stateCalculator ? 'Implemented' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{selectedStateConfig.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Year:</span>
                    <span className="font-medium">{selectedStateConfig.taxYear}</span>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedStateConfig.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <h5 className="font-medium text-gray-900 mb-1 text-xs">Important Notes</h5>
                  <p className="text-xs text-gray-700">{selectedStateConfig.notes}</p>
                </div>
              )}

              {/* Official Source Link */}
              {selectedStateConfig.authoritativeSource && (
                <div className="text-xs">
                  <a
                    href={selectedStateConfig.authoritativeSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Official State Tax Authority Website
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <Calculator className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">States with no income tax ({statesByType.noTaxStates.length}):</p>
            <p className="text-gray-500">
              {statesByType.noTaxStates.map(s => s.name).join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
