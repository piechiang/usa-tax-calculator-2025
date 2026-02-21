/**
 * TaxContext - Backward-compatible wrapper for the tax calculator state
 *
 * This module provides backward compatibility for existing code that uses
 * the original TaxContext API. New code should prefer using the fine-grained
 * contexts from TaxDataContext.tsx for better performance.
 *
 * Migration guide:
 * - Instead of useTaxContext().personalInfo, use usePersonalInfo()
 * - Instead of useTaxContext().incomeData, use useIncomeData()
 * - Instead of useTaxContext().taxResult, use useTaxResult()
 * - etc.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import {
  TaxDataProvider,
  usePersonalInfoContext,
  useIncomeContext,
  useDeductionContext,
  useTaxResultContext,
  useValidationContext,
  useSnapshotContext,
  TaxCalculatorSnapshot,
} from './TaxDataContext';

// Re-export types for backward compatibility
export type { TaxCalculatorSnapshot } from './TaxDataContext';

// Re-export fine-grained hooks for new code
export {
  usePersonalInfoContext,
  useIncomeContext,
  useDeductionContext,
  useTaxResultContext,
  useValidationContext,
  useSnapshotContext,
  usePersonalInfo,
  useSpouseInfo,
  useIncomeData,
  useK1Data,
  useBusinessDetails,
  usePaymentsData,
  useDeductions,
  useTaxResult,
  useFilingComparison,
  useTaxOptimizations,
  useDiagnostics,
  useTrace,
  useFederalDetails,
} from './TaxDataContext';

// Legacy TaxContextValue type - combines all context values
export interface TaxContextValue {
  // Personal Info
  personalInfo: ReturnType<typeof usePersonalInfoContext>['personalInfo'];
  spouseInfo: ReturnType<typeof usePersonalInfoContext>['spouseInfo'];
  handlePersonalInfoChange: ReturnType<typeof usePersonalInfoContext>['handlePersonalInfoChange'];
  handleSpouseInfoChange: ReturnType<typeof usePersonalInfoContext>['handleSpouseInfoChange'];

  // Income
  incomeData: ReturnType<typeof useIncomeContext>['incomeData'];
  k1Data: ReturnType<typeof useIncomeContext>['k1Data'];
  businessDetails: ReturnType<typeof useIncomeContext>['businessDetails'];
  paymentsData: ReturnType<typeof useIncomeContext>['paymentsData'];
  handleIncomeChange: ReturnType<typeof useIncomeContext>['handleIncomeChange'];
  handleK1Change: ReturnType<typeof useIncomeContext>['handleK1Change'];
  handleBusinessDetailsChange: ReturnType<typeof useIncomeContext>['handleBusinessDetailsChange'];
  handlePaymentsChange: ReturnType<typeof useIncomeContext>['handlePaymentsChange'];

  // Deductions
  deductions: ReturnType<typeof useDeductionContext>['deductions'];
  handleDeductionChange: ReturnType<typeof useDeductionContext>['handleDeductionChange'];

  // Tax Results
  taxResult: ReturnType<typeof useTaxResultContext>['taxResult'];
  filingComparison: ReturnType<typeof useTaxResultContext>['filingComparison'];
  taxOptimizations: ReturnType<typeof useTaxResultContext>['taxOptimizations'];
  recalculate: ReturnType<typeof useTaxResultContext>['recalculate'];
  // Engine diagnostics
  diagnostics: ReturnType<typeof useTaxResultContext>['diagnostics'];
  trace: ReturnType<typeof useTaxResultContext>['trace'];
  federalDetails: ReturnType<typeof useTaxResultContext>['federalDetails'];
  hasWarnings: ReturnType<typeof useTaxResultContext>['hasWarnings'];
  hasErrors: ReturnType<typeof useTaxResultContext>['hasErrors'];
  diagnosticsCount: ReturnType<typeof useTaxResultContext>['diagnosticsCount'];

  // Validation
  errors: ReturnType<typeof useValidationContext>['errors'];
  touched: ReturnType<typeof useValidationContext>['touched'];
  setError: ReturnType<typeof useValidationContext>['setError'];
  setFieldTouched: ReturnType<typeof useValidationContext>['setFieldTouched'];

  // Snapshot
  getSnapshot: () => TaxCalculatorSnapshot;
  loadFromSnapshot: (snapshot: Partial<TaxCalculatorSnapshot>) => void;
}

const TaxContext = createContext<TaxContextValue | undefined>(undefined);

/**
 * Legacy hook for backward compatibility
 * @deprecated Use fine-grained hooks instead for better performance
 */
export const useTaxContext = (): TaxContextValue => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTaxContext must be used within TaxProvider');
  }
  return context;
};

// Internal component that bridges fine-grained contexts to legacy context
const LegacyContextBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const personalInfoCtx = usePersonalInfoContext();
  const incomeCtx = useIncomeContext();
  const deductionCtx = useDeductionContext();
  const taxResultCtx = useTaxResultContext();
  const validationCtx = useValidationContext();
  const snapshotCtx = useSnapshotContext();

  const value = useMemo<TaxContextValue>(
    () => ({
      // Personal Info
      personalInfo: personalInfoCtx.personalInfo,
      spouseInfo: personalInfoCtx.spouseInfo,
      handlePersonalInfoChange: personalInfoCtx.handlePersonalInfoChange,
      handleSpouseInfoChange: personalInfoCtx.handleSpouseInfoChange,

      // Income
      incomeData: incomeCtx.incomeData,
      k1Data: incomeCtx.k1Data,
      businessDetails: incomeCtx.businessDetails,
      paymentsData: incomeCtx.paymentsData,
      handleIncomeChange: incomeCtx.handleIncomeChange,
      handleK1Change: incomeCtx.handleK1Change,
      handleBusinessDetailsChange: incomeCtx.handleBusinessDetailsChange,
      handlePaymentsChange: incomeCtx.handlePaymentsChange,

      // Deductions
      deductions: deductionCtx.deductions,
      handleDeductionChange: deductionCtx.handleDeductionChange,

      // Tax Results
      taxResult: taxResultCtx.taxResult,
      filingComparison: taxResultCtx.filingComparison,
      taxOptimizations: taxResultCtx.taxOptimizations,
      recalculate: taxResultCtx.recalculate,
      // Engine diagnostics
      diagnostics: taxResultCtx.diagnostics,
      trace: taxResultCtx.trace,
      federalDetails: taxResultCtx.federalDetails,
      hasWarnings: taxResultCtx.hasWarnings,
      hasErrors: taxResultCtx.hasErrors,
      diagnosticsCount: taxResultCtx.diagnosticsCount,

      // Validation
      errors: validationCtx.errors,
      touched: validationCtx.touched,
      setError: validationCtx.setError,
      setFieldTouched: validationCtx.setFieldTouched,

      // Snapshot
      getSnapshot: snapshotCtx.getSnapshot,
      loadFromSnapshot: snapshotCtx.loadFromSnapshot,
    }),
    [personalInfoCtx, incomeCtx, deductionCtx, taxResultCtx, validationCtx, snapshotCtx]
  );

  return <TaxContext.Provider value={value}>{children}</TaxContext.Provider>;
};

interface TaxProviderProps {
  children: ReactNode;
}

/**
 * TaxProvider - Provides both legacy and fine-grained contexts
 */
export const TaxProvider: React.FC<TaxProviderProps> = ({ children }) => {
  return (
    <TaxDataProvider>
      <LegacyContextBridge>{children}</LegacyContextBridge>
    </TaxDataProvider>
  );
};
