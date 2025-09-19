import React from 'react';
import { marylandCountyRates } from '../../constants/taxBrackets';

interface PersonalInfoFormProps {
  personalInfo: any;
  onChange: (field: string, value: any) => void;
  t: (key: string) => string;
  UncontrolledInput: React.ComponentType<any>;
  onShowSpouseDialog: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  personalInfo,
  onChange,
  t,
  UncontrolledInput,
  onShowSpouseDialog
}) => {
  const countyOptions = Object.keys(marylandCountyRates).sort();

  const handleInputChange = (field, value) => {
    onChange(field, value);
  };

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
            {t('personalInfo.ssn')} <span className="text-red-500">*</span>
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
            💡 {t('personalInfo.help.filingStatus')}
          </div>
          
          {/* Add Spouse Button for Married Filing Jointly */}
          {personalInfo.filingStatus === 'marriedJointly' && (
            <button
              onClick={() => onShowSpouseDialog(true)}
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
        
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={personalInfo.isMaryland}
              onChange={(e) => handleInputChange('isMaryland', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{t('personalInfo.marylandResident')}</span>
          </label>
        </div>
        
        {personalInfo.isMaryland && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('personalInfo.county')}
            </label>
            <select
              value={personalInfo.county}
              onChange={(e) => handleInputChange('county', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              {countyOptions.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoForm;