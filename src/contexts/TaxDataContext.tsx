/**
 * Fine-grained Tax Data Contexts
 *
 * This module splits the monolithic TaxContext into smaller, focused contexts
 * to prevent unnecessary re-renders. Components can subscribe only to the
 * specific data they need.
 *
 * Architecture:
 * - PersonalInfoContext: Personal and spouse information
 * - IncomeContext: All income-related data (W-2, K-1, business, payments)
 * - DeductionContext: Deductions data and handlers
 * - TaxResultContext: Calculated tax results and optimizations
 * - ValidationContext: Form errors and touched state
 */

import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { usePersonalInfoState } from '../hooks/usePersonalInfoState';
import { useIncomeState } from '../hooks/useIncomeState';
import { useDeductionState } from '../hooks/useDeductionState';
import { useTaxResults } from '../hooks/useTaxResults';
import { useFormValidation } from '../hooks/useFormValidation';
import type { PersonalInfo, SpouseInfo } from '../types/CommonTypes';
import type { Deductions } from '../hooks/useDeductionState';
import type { TaxResult, FilingComparison, TaxOptimization } from '../hooks/useTaxResults';
import type {
  UIIncomeData as IncomeData,
  UIK1Data as K1Data,
  UIBusinessDetails as BusinessDetails,
  UIPaymentsData as PaymentsData,
} from '../utils/engineAdapter';
import type { FederalDiagnostics2025, FederalResult2025 } from '../engine/types';
import type { TraceSection } from '../engine/trace/types';
import {
  DEFAULT_TAX_YEAR,
  type SupportedTaxYear,
  getAvailableTaxYears,
} from '../engine/rules/taxYearConfig';

// ============================================================================
// Personal Info Context
// ============================================================================

interface PersonalInfoContextValue {
  personalInfo: PersonalInfo;
  spouseInfo: SpouseInfo;
  standardDeduction: number;
  handlePersonalInfoChange: (
    field: keyof PersonalInfo,
    value: string | boolean | number | Record<string, unknown>
  ) => void;
  handleSpouseInfoChange: (field: keyof SpouseInfo, value: string | boolean) => void;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  setSpouseInfo: React.Dispatch<React.SetStateAction<SpouseInfo>>;
}

const PersonalInfoContext = createContext<PersonalInfoContextValue | undefined>(undefined);

export const usePersonalInfoContext = (): PersonalInfoContextValue => {
  const context = useContext(PersonalInfoContext);
  if (!context) {
    throw new Error('usePersonalInfoContext must be used within TaxDataProvider');
  }
  return context;
};

// Selector hooks for fine-grained subscriptions
export const usePersonalInfo = () => usePersonalInfoContext().personalInfo;
export const useSpouseInfo = () => usePersonalInfoContext().spouseInfo;

// ============================================================================
// Income Context
// ============================================================================

interface IncomeContextValue {
  incomeData: IncomeData;
  k1Data: K1Data;
  businessDetails: BusinessDetails;
  paymentsData: PaymentsData;
  handleIncomeChange: (field: string, value: string) => void;
  handleK1Change: (field: string, value: string) => void;
  handleBusinessDetailsChange: (field: string, value: string) => void;
  handlePaymentsChange: (field: string, value: string) => void;
  setIncomeData: React.Dispatch<React.SetStateAction<IncomeData>>;
  setK1Data: React.Dispatch<React.SetStateAction<K1Data>>;
  setBusinessDetails: React.Dispatch<React.SetStateAction<BusinessDetails>>;
  setPaymentsData: React.Dispatch<React.SetStateAction<PaymentsData>>;
}

const IncomeContext = createContext<IncomeContextValue | undefined>(undefined);

export const useIncomeContext = (): IncomeContextValue => {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error('useIncomeContext must be used within TaxDataProvider');
  }
  return context;
};

// Selector hooks
export const useIncomeData = () => useIncomeContext().incomeData;
export const useK1Data = () => useIncomeContext().k1Data;
export const useBusinessDetails = () => useIncomeContext().businessDetails;
export const usePaymentsData = () => useIncomeContext().paymentsData;

// ============================================================================
// Deduction Context
// ============================================================================

interface DeductionContextValue {
  deductions: Deductions;
  handleDeductionChange: (field: keyof Deductions, value: string | boolean) => void;
  setDeductions: React.Dispatch<React.SetStateAction<Deductions>>;
}

const DeductionContext = createContext<DeductionContextValue | undefined>(undefined);

export const useDeductionContext = (): DeductionContextValue => {
  const context = useContext(DeductionContext);
  if (!context) {
    throw new Error('useDeductionContext must be used within TaxDataProvider');
  }
  return context;
};

// Selector hook
export const useDeductions = () => useDeductionContext().deductions;

// ============================================================================
// Tax Result Context
// ============================================================================

interface TaxResultContextValue {
  taxResult: TaxResult;
  filingComparison: FilingComparison | null;
  taxOptimizations: TaxOptimization[];
  recalculate: () => void;
  // Engine diagnostics for audit/review
  diagnostics: FederalDiagnostics2025 | null;
  trace: TraceSection[] | null;
  federalDetails: FederalResult2025 | null;
  hasWarnings: boolean;
  hasErrors: boolean;
  diagnosticsCount: number;
}

const TaxResultContext = createContext<TaxResultContextValue | undefined>(undefined);

export const useTaxResultContext = (): TaxResultContextValue => {
  const context = useContext(TaxResultContext);
  if (!context) {
    throw new Error('useTaxResultContext must be used within TaxDataProvider');
  }
  return context;
};

// Selector hooks
export const useTaxResult = () => useTaxResultContext().taxResult;
export const useFilingComparison = () => useTaxResultContext().filingComparison;
export const useTaxOptimizations = () => useTaxResultContext().taxOptimizations;
export const useDiagnostics = () => useTaxResultContext().diagnostics;
export const useTrace = () => useTaxResultContext().trace;
export const useFederalDetails = () => useTaxResultContext().federalDetails;

// ============================================================================
// Validation Context
// ============================================================================

interface ValidationContextValue {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setError: (field: string, error: string) => void;
  setFieldTouched: (field: string) => void;
}

const ValidationContext = createContext<ValidationContextValue | undefined>(undefined);

export const useValidationContext = (): ValidationContextValue => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidationContext must be used within TaxDataProvider');
  }
  return context;
};

// ============================================================================
// Tax Year Context
// ============================================================================

interface TaxYearContextValue {
  taxYear: SupportedTaxYear;
  setTaxYear: (year: SupportedTaxYear) => void;
  availableYears: number[];
  isCurrentYearSupported: boolean;
}

const TaxYearContext = createContext<TaxYearContextValue | undefined>(undefined);

export const useTaxYearContext = (): TaxYearContextValue => {
  const context = useContext(TaxYearContext);
  if (!context) {
    throw new Error('useTaxYearContext must be used within TaxDataProvider');
  }
  return context;
};

// Selector hooks
export const useTaxYear = () => useTaxYearContext().taxYear;
export const useAvailableTaxYears = () => useTaxYearContext().availableYears;

// ============================================================================
// Snapshot Context (for save/load functionality)
// ============================================================================

export interface TaxCalculatorSnapshot {
  personalInfo: PersonalInfo;
  spouseInfo: SpouseInfo;
  incomeData: IncomeData;
  k1Data: K1Data;
  businessDetails: BusinessDetails;
  paymentsData: PaymentsData;
  deductions: Deductions;
  taxResult: TaxResult;
}

interface SnapshotContextValue {
  getSnapshot: () => TaxCalculatorSnapshot;
  loadFromSnapshot: (snapshot: Partial<TaxCalculatorSnapshot>) => void;
}

const SnapshotContext = createContext<SnapshotContextValue | undefined>(undefined);

export const useSnapshotContext = (): SnapshotContextValue => {
  const context = useContext(SnapshotContext);
  if (!context) {
    throw new Error('useSnapshotContext must be used within TaxDataProvider');
  }
  return context;
};

// ============================================================================
// Combined Provider
// ============================================================================

interface TaxDataProviderProps {
  children: ReactNode;
}

export const TaxDataProvider: React.FC<TaxDataProviderProps> = ({ children }) => {
  // Tax year state
  const [taxYear, setTaxYear] = useState<SupportedTaxYear>(DEFAULT_TAX_YEAR);
  const availableYears = useMemo(() => getAvailableTaxYears(), []);
  const isCurrentYearSupported = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return availableYears.includes(currentYear);
  }, [availableYears]);

  // Initialize all state hooks
  const personalInfoState = usePersonalInfoState();
  const incomeState = useIncomeState();
  const deductionState = useDeductionState(personalInfoState.standardDeduction);

  // Tax results depend on all other state AND tax year
  const taxResultState = useTaxResults({
    personalInfo: personalInfoState.personalInfo,
    spouseInfo: personalInfoState.spouseInfo,
    incomeData: incomeState.incomeData,
    k1Data: incomeState.k1Data,
    businessDetails: incomeState.businessDetails,
    paymentsData: incomeState.paymentsData,
    deductions: deductionState.deductions,
    taxYear,
  });

  const validationState = useFormValidation();

  // Memoize context values to prevent unnecessary re-renders
  const personalInfoContextValue = useMemo<PersonalInfoContextValue>(
    () => ({
      personalInfo: personalInfoState.personalInfo,
      spouseInfo: personalInfoState.spouseInfo,
      standardDeduction: personalInfoState.standardDeduction,
      handlePersonalInfoChange: personalInfoState.handlePersonalInfoChange,
      handleSpouseInfoChange: personalInfoState.handleSpouseInfoChange,
      setPersonalInfo: personalInfoState.setPersonalInfo,
      setSpouseInfo: personalInfoState.setSpouseInfo,
    }),
    [
      personalInfoState.personalInfo,
      personalInfoState.spouseInfo,
      personalInfoState.standardDeduction,
      personalInfoState.handlePersonalInfoChange,
      personalInfoState.handleSpouseInfoChange,
      personalInfoState.setPersonalInfo,
      personalInfoState.setSpouseInfo,
    ]
  );

  const incomeContextValue = useMemo<IncomeContextValue>(
    () => ({
      incomeData: incomeState.incomeData,
      k1Data: incomeState.k1Data,
      businessDetails: incomeState.businessDetails,
      paymentsData: incomeState.paymentsData,
      handleIncomeChange: incomeState.handleIncomeChange,
      handleK1Change: incomeState.handleK1Change,
      handleBusinessDetailsChange: incomeState.handleBusinessDetailsChange,
      handlePaymentsChange: incomeState.handlePaymentsChange,
      setIncomeData: incomeState.setIncomeData,
      setK1Data: incomeState.setK1Data,
      setBusinessDetails: incomeState.setBusinessDetails,
      setPaymentsData: incomeState.setPaymentsData,
    }),
    [
      incomeState.incomeData,
      incomeState.k1Data,
      incomeState.businessDetails,
      incomeState.paymentsData,
      incomeState.handleIncomeChange,
      incomeState.handleK1Change,
      incomeState.handleBusinessDetailsChange,
      incomeState.handlePaymentsChange,
      incomeState.setIncomeData,
      incomeState.setK1Data,
      incomeState.setBusinessDetails,
      incomeState.setPaymentsData,
    ]
  );

  const deductionContextValue = useMemo<DeductionContextValue>(
    () => ({
      deductions: deductionState.deductions,
      handleDeductionChange: deductionState.handleDeductionChange,
      setDeductions: deductionState.setDeductions,
    }),
    [deductionState.deductions, deductionState.handleDeductionChange, deductionState.setDeductions]
  );

  const taxResultContextValue = useMemo<TaxResultContextValue>(
    () => ({
      taxResult: taxResultState.taxResult,
      filingComparison: taxResultState.filingComparison,
      taxOptimizations: taxResultState.taxOptimizations,
      recalculate: taxResultState.recalculate,
      // Engine diagnostics
      diagnostics: taxResultState.diagnostics,
      trace: taxResultState.trace,
      federalDetails: taxResultState.federalDetails,
      hasWarnings: taxResultState.hasWarnings ?? false,
      hasErrors: taxResultState.hasErrors ?? false,
      diagnosticsCount: taxResultState.diagnosticsCount,
    }),
    [
      taxResultState.taxResult,
      taxResultState.filingComparison,
      taxResultState.taxOptimizations,
      taxResultState.recalculate,
      taxResultState.diagnostics,
      taxResultState.trace,
      taxResultState.federalDetails,
      taxResultState.hasWarnings,
      taxResultState.hasErrors,
      taxResultState.diagnosticsCount,
    ]
  );

  const validationContextValue = useMemo<ValidationContextValue>(
    () => ({
      errors: validationState.errors,
      touched: validationState.touched,
      setError: validationState.setError,
      setFieldTouched: validationState.setFieldTouched,
    }),
    [
      validationState.errors,
      validationState.touched,
      validationState.setError,
      validationState.setFieldTouched,
    ]
  );

  const taxYearContextValue = useMemo<TaxYearContextValue>(
    () => ({
      taxYear,
      setTaxYear,
      availableYears,
      isCurrentYearSupported,
    }),
    [taxYear, availableYears, isCurrentYearSupported]
  );

  // Snapshot functions
  const getSnapshot = (): TaxCalculatorSnapshot => ({
    personalInfo: personalInfoState.personalInfo,
    spouseInfo: personalInfoState.spouseInfo,
    incomeData: incomeState.incomeData,
    k1Data: incomeState.k1Data,
    businessDetails: incomeState.businessDetails,
    paymentsData: incomeState.paymentsData,
    deductions: deductionState.deductions,
    taxResult: taxResultState.taxResult,
  });

  const loadFromSnapshot = (s: Partial<TaxCalculatorSnapshot>) => {
    if (s.personalInfo) personalInfoState.setPersonalInfo(s.personalInfo);
    if (s.spouseInfo) personalInfoState.setSpouseInfo(s.spouseInfo);
    if (s.incomeData) incomeState.setIncomeData(s.incomeData);
    if (s.k1Data) incomeState.setK1Data(s.k1Data);
    if (s.businessDetails) incomeState.setBusinessDetails(s.businessDetails);
    if (s.paymentsData) incomeState.setPaymentsData(s.paymentsData);
    if (s.deductions) deductionState.setDeductions(s.deductions);
    if (s.taxResult) taxResultState.setTaxResult(s.taxResult);
  };

  const snapshotContextValue = useMemo<SnapshotContextValue>(
    () => ({
      getSnapshot,
      loadFromSnapshot,
    }),
    [
      personalInfoState.personalInfo,
      personalInfoState.spouseInfo,
      incomeState.incomeData,
      incomeState.k1Data,
      incomeState.businessDetails,
      incomeState.paymentsData,
      deductionState.deductions,
      taxResultState.taxResult,
    ]
  );

  return (
    <TaxYearContext.Provider value={taxYearContextValue}>
      <PersonalInfoContext.Provider value={personalInfoContextValue}>
        <IncomeContext.Provider value={incomeContextValue}>
          <DeductionContext.Provider value={deductionContextValue}>
            <TaxResultContext.Provider value={taxResultContextValue}>
              <ValidationContext.Provider value={validationContextValue}>
                <SnapshotContext.Provider value={snapshotContextValue}>
                  {children}
                </SnapshotContext.Provider>
              </ValidationContext.Provider>
            </TaxResultContext.Provider>
          </DeductionContext.Provider>
        </IncomeContext.Provider>
      </PersonalInfoContext.Provider>
    </TaxYearContext.Provider>
  );
};
