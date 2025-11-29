import React, { useMemo } from 'react';
import { STATE_CONFIGS } from '../../engine/states/registry';
import { MD_RULES_2025 } from '../../engine/rules/2025/states/md';
import type { PersonalInfo } from '../../types/CommonTypes';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (field: keyof PersonalInfo, value: string | number | boolean) => void;
  t: (key: string) => string;
  UncontrolledInput: React.ComponentType<{
    field: string;
    defaultValue: string | number;
    onChange: (field: string, value: string) => void;
    type?: string;
    placeholder?: string;
    [key: string]: unknown;
  }>;
  onShowSpouseDialog: () => void;
}

// State-specific locality options
const STATE_LOCALITIES: Record<string, { type: 'county' | 'city'; options: string[] }> = {
  MD: {
    type: 'county',
    options: Object.keys(MD_RULES_2025.localRates || {}).sort()
  },
  NY: {
    type: 'city',
    options: ['New York City', 'NYC', 'Yonkers']
  },
  CA: {
    type: 'county',
    options: [] // California doesn't have local income tax
  },
  PA: {
    type: 'county',
    options: [] // Pennsylvania local taxes handled by municipalities
  }
};

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  personalInfo,
  onChange,
  t,
  UncontrolledInput,
  onShowSpouseDialog
}) => {
  // Get list of supported states
  const supportedStates = useMemo(() => {
    return Object.entries(STATE_CONFIGS)
      .filter(([_, config]) => config.implemented)
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .map(([code, config]) => ({ code, name: config.name, hasTax: config.hasTax }));
  }, []);

  // Get current state's locality options
  const currentStateLocalities = useMemo(() => {
    if (!personalInfo.state) return null;
    return STATE_LOCALITIES[personalInfo.state.toUpperCase()] || null;
  }, [personalInfo.state]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    // If state changes, clear county/city to avoid mismatched locality data
    if (field === 'state') {
      onChange('county', '');
      onChange('city', '');
    }
    onChange(field as keyof PersonalInfo, value);
  };

  // Get current state config
  const currentStateConfig = personalInfo.state ? STATE_CONFIGS[personalInfo.state.toUpperCase()] : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo.title')}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('personalInfo.firstName')} <span className="text-red-500">*</span>
          </label>
          <UncontrolledInput
            field="firstName"
            defaultValue={personalInfo.firstName}
            onChange={handleInputChange}
            placeholder={t('personalInfo.placeholders.firstName')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('personalInfo.lastName')} <span className="text-red-500">*</span>
          </label>
          <UncontrolledInput
            field="lastName"
            defaultValue={personalInfo.lastName}
            onChange={handleInputChange}
            placeholder={t('personalInfo.placeholders.lastName')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('personalInfo.ssn')}
          </label>
          <UncontrolledInput
            field="ssn"
            defaultValue={personalInfo.ssn}
            onChange={handleInputChange}
            placeholder={t('personalInfo.placeholders.ssn')}
            help={t('personalInfo.help.ssn')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('personalInfo.filingStatus')}
          </label>
          <select
            value={personalInfo.filingStatus}
            onChange={(e) => handleInputChange('filingStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="single">{t('personalInfo.filingStatuses.single')}</option>
            <option value="marriedJointly">{t('personalInfo.filingStatuses.marriedJointly')}</option>
            <option value="marriedSeparately">{t('personalInfo.filingStatuses.marriedSeparately')}</option>
            <option value="headOfHousehold">{t('personalInfo.filingStatuses.headOfHousehold')}</option>
          </select>
          <div className="text-gray-500 text-xs mt-1">
            <span className="inline-block mr-1" aria-label="info">ℹ️</span>
            {t('personalInfo.help.filingStatus')}
          </div>

          {/* Add Spouse Button for Married Filing Jointly */}
          {personalInfo.filingStatus === 'marriedJointly' && (
            <button
              onClick={onShowSpouseDialog}
              className="mt-2 flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('spouseInfo.addSpouse')}
            </button>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('personalInfo.address')} <span className="text-red-500">*</span>
          </label>
          <UncontrolledInput
            field="address"
            defaultValue={personalInfo.address}
            onChange={handleInputChange}
            placeholder={t('personalInfo.placeholders.address')}
          />
        </div>

        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State of Residence <span className="text-red-500">*</span>
          </label>
          <select
            value={personalInfo.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="">Select a state...</option>
            {supportedStates.map(({ code, name, hasTax }) => (
              <option key={code} value={code}>
                {name} {!hasTax ? '(No state income tax)' : ''}
              </option>
            ))}
          </select>
          {currentStateConfig && !currentStateConfig.hasTax && (
            <div className="text-green-600 text-xs mt-1">
              <span className="inline-block mr-1" aria-label="check">✓</span>
              This state has no income tax
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('personalInfo.dependents')}
          </label>
          <UncontrolledInput
            field="dependents"
            type="number"
            defaultValue={personalInfo.dependents}
            onChange={handleInputChange}
            min="0"
            max="20"
            help={t('personalInfo.help.dependents')}
          />
        </div>

        {/* County/City Selection - Only show if state has local tax */}
        {currentStateLocalities && currentStateLocalities.options.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentStateLocalities.type === 'county' ? 'County' : 'City'}
              {currentStateConfig?.hasLocalTax && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={currentStateLocalities.type === 'county' ? (personalInfo.county || '') : (personalInfo.city || '')}
              onChange={(e) => handleInputChange(currentStateLocalities.type === 'county' ? 'county' : 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Select {currentStateLocalities.type}...</option>
              {currentStateLocalities.options.map(locality => (
                <option key={locality} value={locality}>{locality}</option>
              ))}
            </select>
            {currentStateConfig?.hasLocalTax && (
              <div className="text-gray-500 text-xs mt-1">
                <span className="inline-block mr-1" aria-label="info">ℹ️</span>
                Local income tax applies in {personalInfo.state}
              </div>
            )}
          </div>
        )}

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Date
          </label>
          <UncontrolledInput
            field="birthDate"
            type="date"
            defaultValue={personalInfo.birthDate || ''}
            onChange={handleInputChange}
            help="Used for age-based credits and deductions"
          />
        </div>

        {/* Blind Status */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={personalInfo.isBlind || false}
              onChange={(e) => handleInputChange('isBlind', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Blind or Disabled</span>
          </label>
          <div className="text-gray-500 text-xs mt-1 ml-6">
            Additional standard deduction may apply
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(PersonalInfoForm);
