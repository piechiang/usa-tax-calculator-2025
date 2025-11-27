import { useState, useEffect } from 'react';
import { standardDeductions } from '../constants/taxBrackets';
import type { PersonalInfo, SpouseInfo } from '../types/CommonTypes';

/**
 * Hook for managing personal information and spouse information state
 * Handles primary taxpayer and spouse data with change handlers
 *
 * Default state: Uses user's browser detected state if available,
 * otherwise defaults to no state selection (user must select)
 */
export const usePersonalInfoState = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    ssn: '',
    age: 0,
    filingStatus: 'single',
    address: '',
    dependents: 0,
    // No default state - user should select their state
    state: '',
    county: '',
    city: '',
    // Deprecated field for backward compatibility
    isMaryland: false
  });

  const [spouseInfo, setSpouseInfo] = useState<SpouseInfo>({
    firstName: '',
    lastName: '',
    ssn: '',
    wages: "",
    interestIncome: "",
    dividends: "",
    capitalGains: "",
    businessIncome: "",
    otherIncome: "",
    federalWithholding: "",
    stateWithholding: ""
  });

  // Track the current standard deduction based on filing status
  const [standardDeduction, setStandardDeduction] = useState<number>(
    standardDeductions.single
  );

  // Update standard deduction when filing status changes
  useEffect(() => {
    const newStandardDeduction =
      standardDeductions[personalInfo.filingStatus as keyof typeof standardDeductions]
      || standardDeductions.single;
    setStandardDeduction(newStandardDeduction);
  }, [personalInfo.filingStatus]);

  const handlePersonalInfoChange = (
    field: keyof PersonalInfo,
    value: string | number | boolean
  ) => {
    setPersonalInfo(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-sync isMaryland for backward compatibility
      if (field === 'state') {
        updated.isMaryland = value === 'MD';
      }

      return updated;
    });
  };

  const handleSpouseInfoChange = (field: keyof SpouseInfo, value: string) => {
    setSpouseInfo(prev => ({ ...prev, [field]: value }));
  };

  return {
    personalInfo,
    spouseInfo,
    standardDeduction,
    setPersonalInfo,
    setSpouseInfo,
    handlePersonalInfoChange,
    handleSpouseInfoChange,
  };
};
