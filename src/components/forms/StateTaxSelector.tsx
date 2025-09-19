import React, { useState } from 'react';
import { MapPin, Calculator } from 'lucide-react';
import { STATE_TAX_RULES, getStateTaxRules, calculateStateTax } from '../../constants/stateTaxRules';

interface StateTaxSelectorProps {
  selectedState: string;
  onStateChange: (stateCode: string) => void;
  taxableIncome: number;
  filingStatus: string;
  t: (key: string) => string;
}

export const StateTaxSelector: React.FC<StateTaxSelectorProps> = ({
  selectedState,
  onStateChange,
  taxableIncome,
  filingStatus,
  t
}) => {
  const [showStateDetails, setShowStateDetails] = useState(false);

  // Convert all states to array for dropdown
  const stateOptions = Object.entries(STATE_TAX_RULES).map(([code, rule]) => ({
    code,
    name: rule.state,
    hasIncomeTax: rule.hasIncomeTax,
    taxType: rule.taxType
  }));

  // Sort states alphabetically
  stateOptions.sort((a, b) => a.name.localeCompare(b.name));

  const selectedStateRule = getStateTaxRules(selectedState);
  const stateTaxAmount = selectedStateRule && taxableIncome > 0
    ? calculateStateTax(selectedState, taxableIncome, filingStatus)
    : 0;

  const getStateIcon = (hasIncomeTax: boolean) => {
    return hasIncomeTax ? '🏛️' : '🆓';
  };

  const getTaxTypeDisplay = (taxType: string) => {
    switch (taxType) {
      case 'flat': return 'Flat Rate';
      case 'progressive': return 'Progressive';
      case 'none': return 'No Income Tax';
      default: return taxType;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">State Tax Calculator</h3>
        <span className="text-sm text-gray-500">({stateOptions.length} states supported)</span>
      </div>

      {/* State Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Your State of Residence
        </label>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a state...</option>
          {stateOptions.map((state) => (
            <option key={state.code} value={state.code}>
              {getStateIcon(state.hasIncomeTax)} {state.name} ({state.code}) - {getTaxTypeDisplay(state.taxType)}
            </option>
          ))}
        </select>
      </div>

      {/* Selected State Details */}
      {selectedStateRule && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {getStateIcon(selectedStateRule.hasIncomeTax)}
              {selectedStateRule.state} Tax Information
            </h4>
            <button
              onClick={() => setShowStateDetails(!showStateDetails)}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              {showStateDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Tax Calculation Result */}
          {taxableIncome > 0 && (
            <div className="bg-white rounded-md p-3 mb-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Estimated {selectedStateRule.state} Tax:
                </span>
                <span className="text-lg font-bold text-green-600">
                  ${stateTaxAmount.toLocaleString()}
                </span>
              </div>
              {selectedStateRule.taxType === 'none' && (
                <p className="text-xs text-gray-600 mt-1">
                  🎉 Great news! {selectedStateRule.state} has no state income tax.
                </p>
              )}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tax Type:</span>
              <span className="ml-2 font-medium">{getTaxTypeDisplay(selectedStateRule.taxType)}</span>
            </div>
            <div>
              <span className="text-gray-600">Has Income Tax:</span>
              <span className="ml-2 font-medium">
                {selectedStateRule.hasIncomeTax ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>

          {/* Detailed Information */}
          {showStateDetails && selectedStateRule.hasIncomeTax && (
            <div className="mt-4 space-y-3 border-t pt-3">
              {/* Tax Brackets */}
              {selectedStateRule.brackets && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Tax Brackets</h5>
                  <div className="space-y-1">
                    {selectedStateRule.brackets.map((bracket, index) => (
                      <div key={index} className="flex justify-between text-xs bg-white p-2 rounded border">
                        <span>
                          ${bracket.min.toLocaleString()} - {bracket.max === Infinity ? '∞' : `$${bracket.max.toLocaleString()}`}
                        </span>
                        <span className="font-medium">{(bracket.rate * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Deductions */}
              {selectedStateRule.standardDeduction && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Standard Deductions</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border">
                      <div className="font-medium">Single</div>
                      <div>${selectedStateRule.standardDeduction.single.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="font-medium">Married Joint</div>
                      <div>${selectedStateRule.standardDeduction.marriedJointly.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="font-medium">Married Separate</div>
                      <div>${selectedStateRule.standardDeduction.marriedSeparately.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="font-medium">Head of Household</div>
                      <div>${selectedStateRule.standardDeduction.headOfHousehold.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Exemption */}
              {selectedStateRule.personalExemption && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Personal Exemption</h5>
                  <div className="text-sm bg-white p-2 rounded border">
                    ${selectedStateRule.personalExemption.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {selectedStateRule.additionalInfo && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Additional Information</h5>
                  <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {selectedStateRule.additionalInfo}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No Income Tax States Quick Reference */}
      <div className="mt-4">
        <button
          onClick={() => setShowStateDetails(!showStateDetails)}
          className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <Calculator className="h-3 w-3" />
          States with no income tax: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, Wyoming
        </button>
      </div>
    </div>
  );
};