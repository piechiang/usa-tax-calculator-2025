import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EnhancedTaxReturn,
  PersonalInformation,
  IncomeSource,
  TaxCalculationResult,
  UserProgress,
  ValidationError,
  TaxDataImport
} from '../types/EnhancedTaxTypes';

interface WizardState {
  data: Partial<EnhancedTaxReturn>;
  progress: UserProgress;
  validation: {
    errors: ValidationError[];
    warnings: ValidationError[];
  };
  calculations: TaxCalculationResult | null;
  isDirty: boolean;
  isCalculating: boolean;
  lastCalculated: Date | null;
}

interface UseEnhancedTaxWizardOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  autoCalculate?: boolean;
  enableBackup?: boolean;
  storageKey?: string;
}

interface UseEnhancedTaxWizardReturn {
  // State
  wizardState: WizardState;

  // Data Management
  updateData: (path: string, value: unknown) => void;
  getData: (path?: string) => unknown;
  resetData: () => void;

  // Validation
  validateField: (field: string) => ValidationError[];
  validateAll: () => ValidationError[];

  // Calculations
  calculate: () => Promise<void>;

  // Progress
  updateProgress: (section: string, completed: boolean) => void;
  getProgress: () => UserProgress;

  // Import/Export
  importData: (source: TaxDataImport) => Promise<void>;
  exportData: (format: 'json' | 'csv' | 'pdf') => Promise<Blob>;

  // Storage
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;

  // Backup & Restore
  createBackup: () => string;
  restoreFromBackup: (backup: string) => void;

  // Prior Year Data
  importPriorYear: (priorYearData: Partial<EnhancedTaxReturn>) => void;

  // Guidance & Help
  getGuidance: (field: string) => string[];
  getSuggestions: (context: Partial<EnhancedTaxReturn>) => string[];

  // Utility
  isDirty: boolean;
  isValid: boolean;
  canProceed: (section: string) => boolean;
}

export const useEnhancedTaxWizard = (
  options: UseEnhancedTaxWizardOptions = {}
): UseEnhancedTaxWizardReturn => {
  const {
    autoSave = true,
    autoSaveInterval = 30000,
    autoCalculate = true,
    storageKey = 'enhancedTaxWizard'
  } = options;

  const [wizardState, setWizardState] = useState<WizardState>({
    data: {},
    progress: {
      completedSections: [],
      currentSection: 'basic-info',
      overallProgress: 0,
      lastSaved: new Date(),
      estimatedTimeRemaining: 0
    },
    validation: {
      errors: [],
      warnings: []
    },
    calculations: null,
    isDirty: false,
    isCalculating: false,
    lastCalculated: null
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Storage functions
  const saveToStorage = useCallback(() => {
    try {
      const dataToSave = {
        data: wizardState.data,
        progress: wizardState.progress,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));

      setWizardState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          lastSaved: new Date()
        }
      }));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }, [wizardState.data, wizardState.progress, storageKey]);

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedData = JSON.parse(saved);
        setWizardState(prev => ({
          ...prev,
          data: parsedData.data || {},
          progress: parsedData.progress || prev.progress
        }));
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }, [storageKey]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Initialize from storage
  useEffect(() => {
    loadFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save setup
  useEffect(() => {
    if (autoSave && wizardState.isDirty) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        saveToStorage();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [wizardState.isDirty, autoSave, autoSaveInterval, saveToStorage]);

  // getData function
  const getData = useCallback((path?: string) => {
    if (!path) return wizardState.data;
    return getValueAtPath(wizardState.data, path);
  }, [wizardState.data]);

  // Calculate function
  const calculate = useCallback(async (): Promise<void> => {
    setWizardState(prev => ({ ...prev, isCalculating: true }));

    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Perform tax calculations based on current data
      const personalInfo = getData('personalInfo') as Partial<PersonalInformation>;
      const incomeSourcesEach = getData('incomeSourcesEach') as IncomeSource[] || [];

      const totalIncome = incomeSourcesEach.reduce((sum, income) => sum + (income.amount || 0), 0);
      const standardDeduction = getStandardDeduction(personalInfo?.filingStatus);
      const taxableIncome = Math.max(0, totalIncome - standardDeduction);
      const regularTax = calculateFederalTax(taxableIncome, personalInfo?.filingStatus);

      const result: TaxCalculationResult = {
        totalIncome,
        adjustedGrossIncome: totalIncome, // Simplified
        taxableIncome,
        totalAboveLineDeductions: 0,
        standardDeduction,
        totalItemizedDeductions: 0,
        deductionUsed: standardDeduction,
        regularTax,
        alternativeMinimumTax: 0,
        selfEmploymentTax: 0,
        netInvestmentIncomeTax: 0,
        additionalMedicareTax: 0,
        totalTaxBeforeCredits: regularTax,
        nonRefundableCredits: 0,
        refundableCredits: 0,
        totalTax: regularTax,
        totalPayments: 0,
        refundOrAmountDue: regularTax,
        effectiveTaxRate: totalIncome > 0 ? (regularTax / totalIncome) * 100 : 0,
        marginalTaxRate: getMarginalTaxRate(taxableIncome, personalInfo?.filingStatus),
        calculationDetails: [],
        optimizationSuggestions: [],
        warnings: [],
        errors: []
      };

      setWizardState(prev => ({
        ...prev,
        calculations: result,
        isCalculating: false,
        lastCalculated: new Date(),
        isDirty: false
      }));
    } catch (error) {
      console.error('Calculation error:', error);
      setWizardState(prev => ({
        ...prev,
        isCalculating: false,
        validation: {
          ...prev.validation,
          errors: [...prev.validation.errors, {
            field: 'calculation',
            message: 'Error occurred during tax calculation',
            severity: 'error' as const
          }]
        }
      }));
    }
  }, [getData]);

  // Auto-calculate setup
  useEffect(() => {
    if (autoCalculate && wizardState.isDirty && !wizardState.isCalculating) {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }

      calculationTimeoutRef.current = setTimeout(() => {
        calculate();
      }, 2000); // Debounce calculations
    }

    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [wizardState.isDirty, wizardState.isCalculating, autoCalculate, calculate]);

  const updateData = useCallback((path: string, value: unknown) => {
    setWizardState(prev => {
      const newData = { ...prev.data };
      setValueAtPath(newData, path, value);

      return {
        ...prev,
        data: newData,
        isDirty: true,
        validation: {
          ...prev.validation,
          errors: prev.validation.errors.filter(e => e.field !== path)
        }
      };
    });
  }, []);

  const resetData = useCallback(() => {
    setWizardState(prev => ({
      ...prev,
      data: {},
      isDirty: false,
      validation: { errors: [], warnings: [] },
      calculations: null,
      progress: {
        completedSections: [],
        currentSection: 'basic-info',
        overallProgress: 0,
        lastSaved: new Date(),
        estimatedTimeRemaining: 0
      }
    }));
    clearStorage();
  }, [clearStorage]);

  const validateField = useCallback((field: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    const value = getData(field);

    // Add validation logic based on field type and requirements
    if (field === 'personalInfo.ssn') {
      if (!value) {
        errors.push({
          field,
          message: 'Social Security Number is required',
          severity: 'error'
        });
      } else if (typeof value === 'string' && !/^\d{3}-\d{2}-\d{4}$/.test(value)) {
        errors.push({
          field,
          message: 'SSN must be in format XXX-XX-XXXX',
          severity: 'error'
        });
      }
    }

    if (field === 'personalInfo.dateOfBirth') {
      if (!value) {
        errors.push({
          field,
          message: 'Date of birth is required',
          severity: 'error'
        });
      } else if (typeof value === 'string' || typeof value === 'number') {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 0 || age > 150) {
          errors.push({
            field,
            message: 'Please enter a valid date of birth',
            severity: 'error'
          });
        }
      }
    }

    // Income validation
    if (field.includes('income') && value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        errors.push({
          field,
          message: 'Income must be a positive number',
          severity: 'error'
        });
      }
    }

    return errors;
  }, [getData]);

  const validateAll = useCallback((): ValidationError[] => {
    const allErrors: ValidationError[] = [];

    // Validate required fields based on current data
    const personalInfo = getData('personalInfo') as Partial<PersonalInformation>;

    if (personalInfo) {
      ['firstName', 'lastName', 'ssn', 'dateOfBirth'].forEach(field => {
        const fieldErrors = validateField(`personalInfo.${field}`);
        allErrors.push(...fieldErrors);
      });
    }

    // Validate filing status dependent fields
    const filingStatus = getData('personalInfo.filingStatus');
    if (filingStatus === 'marriedJointly' || filingStatus === 'marriedSeparately') {
      ['spouseInfo.firstName', 'spouseInfo.lastName', 'spouseInfo.ssn'].forEach(field => {
        const fieldErrors = validateField(field);
        allErrors.push(...fieldErrors);
      });
    }

    // Update validation state
    setWizardState(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        errors: allErrors
      }
    }));

    return allErrors;
  }, [getData, validateField]);

  const updateProgress = useCallback((section: string, completed: boolean) => {
    setWizardState(prev => {
      const completedSections = completed
        ? Array.from(new Set([...prev.progress.completedSections, section]))
        : prev.progress.completedSections.filter(s => s !== section);

      const totalSections = 8; // Total number of sections
      const overallProgress = (completedSections.length / totalSections) * 100;

      return {
        ...prev,
        progress: {
          ...prev.progress,
          completedSections,
          currentSection: section,
          overallProgress,
          estimatedTimeRemaining: Math.max(0, (totalSections - completedSections.length) * 5) // 5 min per section
        }
      };
    });
  }, []);

  const getProgress = useCallback(() => wizardState.progress, [wizardState.progress]);

  const importData = useCallback(async (source: TaxDataImport): Promise<void> => {
    try {
      // Handle different import sources
      if (source.source === 'previous-year' && source.importedData) {
        // Map previous year data to current year format
        const mappedData = mapPreviousYearData(source.importedData);
        setWizardState(prev => ({
          ...prev,
          data: { ...prev.data, ...mappedData },
          isDirty: true
        }));
      } else if (source.source === 'csv' || source.source === 'json') {
        // Handle structured data import
        if (source.importedData) {
          setWizardState(prev => ({
            ...prev,
            data: { ...prev.data, ...source.importedData },
            isDirty: true
          }));
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      throw new Error('Failed to import data');
    }
  }, []);

  const exportData = useCallback(async (format: 'json' | 'csv' | 'pdf'): Promise<Blob> => {
    switch (format) {
      case 'json':
        const jsonData = {
          data: wizardState.data,
          calculations: wizardState.calculations,
          timestamp: new Date().toISOString()
        };
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });

      case 'csv':
        const csvData = convertToCSV(wizardState.data);
        return new Blob([csvData], { type: 'text/csv' });

      case 'pdf':
        // Generate PDF would require a PDF library
        throw new Error('PDF export not yet implemented');

      default:
        throw new Error('Unsupported export format');
    }
  }, [wizardState]);

  const createBackup = useCallback((): string => {
    const backup = {
      data: wizardState.data,
      progress: wizardState.progress,
      calculations: wizardState.calculations,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(backup);
  }, [wizardState]);

  const restoreFromBackup = useCallback((backup: string) => {
    try {
      const parsedBackup = JSON.parse(backup);
      setWizardState(prev => ({
        ...prev,
        data: parsedBackup.data || {},
        progress: parsedBackup.progress || prev.progress,
        calculations: parsedBackup.calculations || null,
        isDirty: true
      }));
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error('Invalid backup data');
    }
  }, []);

  const importPriorYear = useCallback((priorYearData: Partial<EnhancedTaxReturn>) => {
    const mappedData = mapPreviousYearData(priorYearData);
    setWizardState(prev => ({
      ...prev,
      data: { ...prev.data, ...mappedData },
      isDirty: true
    }));
  }, []);

  const getGuidance = useCallback((field: string): string[] => {
    const guidance: Record<string, string[]> = {
      'personalInfo.filingStatus': [
        'Choose Single if you are unmarried or legally separated',
        'Choose Married Filing Jointly if married and want to file together',
        'Choose Head of Household if unmarried and support dependents'
      ],
      'personalInfo.ssn': [
        'Enter your Social Security Number in XXX-XX-XXXX format',
        'This number must match your Social Security card exactly'
      ],
      'incomeSourcesEach': [
        'Include all income from W-2s, 1099s, and other sources',
        'Don\'t forget about interest, dividends, and side income'
      ]
    };

    return guidance[field] || [];
  }, []);

  const getSuggestions = useCallback((_context: Partial<EnhancedTaxReturn>): string[] => {
    const suggestions: string[] = [];

    // Income-based suggestions
    const totalIncome = (getData('totalIncome') as number) || 0;
    if (totalIncome > 100000) {
      suggestions.push('Consider maximizing retirement contributions for tax savings');
    }

    // Deduction suggestions
    const itemizedDeductions = getData('itemizedDeductions') as Array<{ category: string }> | undefined;
    const hasCharitableGiving = itemizedDeductions?.some(d => d.category === 'charity');
    if (!hasCharitableGiving && totalIncome > 50000) {
      suggestions.push('Consider charitable contributions for additional deductions');
    }

    return suggestions;
  }, [getData]);

  const canProceed = useCallback((section: string): boolean => {
    const sectionRequirements: Record<string, string[]> = {
      'basic-info': ['personalInfo.firstName', 'personalInfo.lastName', 'personalInfo.ssn'],
      'income': ['incomeSourcesEach'],
      'deductions': ['useStandardDeduction'],
      'review': []
    };

    const requiredFields = sectionRequirements[section] || [];
    return requiredFields.every(field => {
      const value = getData(field);
      return value !== undefined && value !== '' && value !== null;
    });
  }, [getData]);

  return {
    wizardState,
    updateData,
    getData,
    resetData,
    validateField,
    validateAll,
    calculate,
    updateProgress,
    getProgress,
    importData,
    exportData,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    createBackup,
    restoreFromBackup,
    importPriorYear,
    getGuidance,
    getSuggestions,
    isDirty: wizardState.isDirty,
    isValid: wizardState.validation.errors.length === 0,
    canProceed
  };
};

// Helper functions
const setValueAtPath = (obj: Record<string, unknown>, path: string, value: unknown): void => {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key && (!(key in current) || typeof current[key] !== 'object')) {
      current[key] = {};
    }
    if (key) {
      current = current[key] as Record<string, unknown>;
    }
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
};

const getValueAtPath = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

const getStandardDeduction = (filingStatus?: string): number => {
  const standardDeductions = {
    single: 15750,
    marriedJointly: 31500,
    marriedSeparately: 15750,
    headOfHousehold: 23350,
    qualifyingSurvivingSpouse: 31500
  };

  return standardDeductions[filingStatus as keyof typeof standardDeductions] || 15750;
};

const calculateFederalTax = (taxableIncome: number, _filingStatus?: string): number => {
  // Simplified tax calculation for 2025
  const brackets = {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48375, rate: 0.12 },
      { min: 48375, max: 103350, rate: 0.22 },
      { min: 103350, max: 197950, rate: 0.24 },
      { min: 197950, max: 487450, rate: 0.32 },
      { min: 487450, max: 731200, rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 }
    ]
  };

  const applicableBrackets = brackets.single; // Simplified
  let tax = 0;

  for (const bracket of applicableBrackets) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
  }

  return Math.round(tax);
};

const getMarginalTaxRate = (taxableIncome: number, _filingStatus?: string): number => {
  // Return the marginal tax rate based on income
  if (taxableIncome <= 11925) return 10;
  if (taxableIncome <= 48375) return 12;
  if (taxableIncome <= 103350) return 22;
  if (taxableIncome <= 197950) return 24;
  if (taxableIncome <= 487450) return 32;
  if (taxableIncome <= 731200) return 35;
  return 37;
};

const mapPreviousYearData = (priorYearData: Partial<EnhancedTaxReturn>): Partial<EnhancedTaxReturn> => {
  // Map previous year data to current year structure
  return {
    personalInfo: {
      firstName: priorYearData.personalInfo?.firstName || '',
      lastName: priorYearData.personalInfo?.lastName || '',
      address: priorYearData.personalInfo?.address || {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      // SSN should not be auto-filled for security
      ssn: '',
      dateOfBirth: '',
      filingStatus: 'single',
      isBlind: false,
      isOver65: false,
      canBeClaimedAsDependent: false,
      hasForeignAccounts: false,
      hasFBARRequirement: false,
      presidentialElectionFund: false,
      stateResident: '',
      hasMultiStateIncome: false
    } as PersonalInformation
  };
};

const convertToCSV = (data: Record<string, unknown>): string => {
  // Convert tax data to CSV format
  const headers = ['Field', 'Value'];
  const rows = [headers.join(',')];

  const flattenObject = (obj: Record<string, unknown>, prefix = ''): void => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value as Record<string, unknown>, fullKey);
      } else {
        rows.push(`"${fullKey}","${value !== null && value !== undefined ? String(value) : ''}"`);
      }
    });
  };

  flattenObject(data);
  return rows.join('\n');
};