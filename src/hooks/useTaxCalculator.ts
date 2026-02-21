import { useEffect } from 'react';
import { usePersonalInfoState } from './usePersonalInfoState';
import { useIncomeState } from './useIncomeState';
import { useDeductionState } from './useDeductionState';
import { useTaxResults } from './useTaxResults';
import { useFormValidation } from './useFormValidation';
import type { PersonalInfo, SpouseInfo } from '../types/CommonTypes';
import type { Deductions } from './useDeductionState';
import type { TaxResult, FilingComparison, TaxOptimization } from './useTaxResults';

// Re-export types for backward compatibility
export type {
  UIIncomeData as IncomeData,
  UIK1Data as K1Data,
  UIBusinessDetails as BusinessDetails,
  UIPaymentsData as PaymentsData,
} from '../utils/engineAdapter';

export type { Deductions, TaxResult, FilingComparison, TaxOptimization };

export interface TaxCalculatorSnapshot {
  personalInfo: PersonalInfo;
  spouseInfo: SpouseInfo;
  incomeData: Record<string, string | undefined>;
  k1Data: Record<string, string | undefined>;
  businessDetails: Record<string, string | undefined>;
  paymentsData: Record<string, string | undefined>;
  deductions: Deductions;
  taxResult: TaxResult;
}

/**
 * Main tax calculator hook
 * Composes multiple focused hooks for better organization and testability
 *
 * This hook manages:
 * - Personal information and spouse data
 * - Income data (W-2, K-1, business, payments)
 * - Deductions with auto-calculation
 * - Tax results and optimizations
 * - Form validation state
 */
export const useTaxCalculator = () => {
  // Personal information and spouse data
  const {
    personalInfo,
    spouseInfo,
    standardDeduction,
    setPersonalInfo,
    setSpouseInfo,
    handlePersonalInfoChange,
    handleSpouseInfoChange,
  } = usePersonalInfoState();

  // Income-related state
  const {
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    setIncomeData,
    setK1Data,
    setBusinessDetails,
    setPaymentsData,
    handleIncomeChange,
    handleK1Change,
    handleBusinessDetailsChange,
    handlePaymentsChange,
  } = useIncomeState();

  // Deductions state
  const { deductions, setDeductions, handleDeductionChange, updateStandardDeduction } =
    useDeductionState(standardDeduction);

  // Update deductions' standard deduction when it changes
  useEffect(() => {
    updateStandardDeduction(standardDeduction);
  }, [standardDeduction, updateStandardDeduction]);

  // Tax results and calculations
  const { taxResult, filingComparison, taxOptimizations, setTaxResult, recalculate } =
    useTaxResults({
      personalInfo,
      spouseInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
    });

  // Form validation
  const { errors, touched, setError, setFieldTouched } = useFormValidation();

  // Snapshot functionality for save/load
  const getSnapshot = (): TaxCalculatorSnapshot => ({
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult,
  });

  const loadFromSnapshot = (s: Partial<TaxCalculatorSnapshot>) => {
    if (s?.personalInfo) setPersonalInfo(s.personalInfo);
    if (s?.spouseInfo) setSpouseInfo(s.spouseInfo);
    if (s?.incomeData) setIncomeData(s.incomeData);
    if (s?.k1Data) setK1Data(s.k1Data);
    if (s?.businessDetails) setBusinessDetails(s.businessDetails);
    if (s?.paymentsData) setPaymentsData(s.paymentsData);
    if (s?.deductions) setDeductions(s.deductions);
    // taxResult is derived; allow setting for immediate display but will be recalculated by effects
    if (s?.taxResult) setTaxResult(s.taxResult);
  };

  return {
    // State
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult,
    filingComparison,
    taxOptimizations,
    errors,
    touched,

    // Handlers
    handlePersonalInfoChange,
    handleSpouseInfoChange,
    handleIncomeChange,
    handleK1Change,
    handleBusinessDetailsChange,
    handlePaymentsChange,
    handleDeductionChange,
    setError,
    setFieldTouched,
    recalculate,
    getSnapshot,
    loadFromSnapshot,
  };
};
