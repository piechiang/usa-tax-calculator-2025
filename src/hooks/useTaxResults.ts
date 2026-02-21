import { useState, useEffect, useCallback } from 'react';
import {
  calculateTaxResultsWithEngine,
  calculateFilingComparisonWithEngine,
} from '../utils/engineAdapter';
import { generateTaxOptimizations } from '../utils/taxOptimization';
import { useTaxDataHash } from './useDependencyHash';
import { logger } from '../utils/logger';
import type { PersonalInfo, SpouseInfo, TaxResult } from '../types/CommonTypes';
import type { Deductions } from './useDeductionState';
import type { FederalDiagnostics2025, FederalResult2025 } from '../engine/types';
import type { TraceSection } from '../engine/trace/types';

// Type definitions for income-related state
interface IncomeData {
  [key: string]: string | undefined;
}

interface K1Data {
  [key: string]: string | undefined;
}

interface BusinessDetails {
  [key: string]: string | undefined;
}

interface PaymentsData {
  [key: string]: string | undefined;
}

interface FilingComparison {
  joint: {
    totalTax: number;
    federalTax: number;
    stateTax: number;
  };
  separate: {
    totalTax: number;
    federalTax: number;
    stateTax: number;
  };
  recommended: 'joint' | 'separate';
  savings: number;
}

interface TaxOptimization {
  type: string;
  title: string;
  titleEn: string;
  titleEs: string;
  description: string;
  descriptionEn: string;
  descriptionEs: string;
  amount: number;
  savings: number;
  netCost?: number;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface UseTaxResultsParams {
  personalInfo: PersonalInfo;
  spouseInfo: SpouseInfo;
  incomeData: IncomeData;
  k1Data: K1Data;
  businessDetails: BusinessDetails;
  paymentsData: PaymentsData;
  deductions: Deductions;
  taxYear?: number;
}

/**
 * Hook for calculating tax results and related computations
 * Automatically recalculates when inputs change
 * Handles filing comparison and optimization suggestions
 */
export const useTaxResults = ({
  personalInfo,
  spouseInfo,
  incomeData,
  k1Data,
  businessDetails,
  paymentsData,
  deductions,
  taxYear,
}: UseTaxResultsParams) => {
  const [taxResult, setTaxResult] = useState<TaxResult>({
    adjustedGrossIncome: 0,
    taxableIncome: 0,
    federalTax: 0,
    stateTax: 0,
    marylandTax: 0,
    localTax: 0,
    totalTax: 0,
    totalPayments: 0,
    balance: 0,
    effectiveRate: 0,
    afterTaxIncome: 0,
    standardDeduction: 0,
    itemizedDeduction: 0,
    marginalRate: 0,
  });

  const [filingComparison, setFilingComparison] = useState<FilingComparison | null>(null);
  const [taxOptimizations, setTaxOptimizations] = useState<TaxOptimization[]>([]);

  // Engine diagnostics and calculation trace for audit/review
  const [diagnostics, setDiagnostics] = useState<FederalDiagnostics2025 | null>(null);
  const [trace, setTrace] = useState<TraceSection[] | null>(null);
  const [federalDetails, setFederalDetails] = useState<FederalResult2025 | null>(null);

  // Create a stable hash of all tax-relevant data
  // This is more efficient than deep comparison as it only computes a string hash
  const dataHash = useTaxDataHash(
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions
  );

  // Calculate tax results whenever the data hash changes
  // Using hash-based dependency tracking for better performance
  useEffect(() => {
    // Use new tax engine
    const engineResults = calculateTaxResultsWithEngine(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo,
      taxYear
    );

    if (engineResults.success && engineResults.result) {
      const result = engineResults.result;
      setTaxResult({
        adjustedGrossIncome: result.adjustedGrossIncome || 0,
        taxableIncome: result.taxableIncome || 0,
        federalTax: result.federalTax || 0,
        stateTax: result.stateTax || result.marylandTax || 0,
        marylandTax: result.marylandTax || 0,
        localTax: result.localTax || 0,
        totalTax: result.totalTax || 0,
        totalPayments: result.totalPayments || 0,
        balance: result.balance || 0,
        effectiveRate: result.effectiveRate || 0,
        afterTaxIncome: result.afterTaxIncome || 0,
        // Deduction details (from Phase 2 fixes)
        standardDeduction: result.standardDeduction || 0,
        itemizedDeduction: result.itemizedDeduction || 0,
        deductionType: result.deductionType,
        // Tax rates
        marginalRate: result.marginalRate || 0,
        // Credits breakdown
        childTaxCredit: result.childTaxCredit,
        earnedIncomeCredit: result.earnedIncomeCredit,
        educationCredits: result.educationCredits,
        // Additional taxes
        selfEmploymentTax: result.selfEmploymentTax,
        netInvestmentIncomeTax: result.netInvestmentIncomeTax,
        additionalMedicareTax: result.additionalMedicareTax,
      });

      // Extract diagnostics and trace from engine results for audit/review
      if (engineResults.federalDetails) {
        setFederalDetails(engineResults.federalDetails);
        setDiagnostics(engineResults.federalDetails.diagnostics);
        setTrace(engineResults.federalDetails.trace ?? null);
      }
    } else {
      logger.error('Tax calculation failed', new Error(engineResults.error || 'Unknown error'));
      // Clear diagnostics on error
      setDiagnostics(null);
      setTrace(null);
      setFederalDetails(null);
      // Set empty result on error
      setTaxResult({
        adjustedGrossIncome: 0,
        taxableIncome: 0,
        federalTax: 0,
        stateTax: 0,
        marylandTax: 0,
        localTax: 0,
        totalTax: 0,
        totalPayments: 0,
        balance: 0,
        effectiveRate: 0,
        afterTaxIncome: 0,
        // Deduction details
        standardDeduction: 0,
        itemizedDeduction: 0,
        deductionType: undefined,
        // Tax rates
        marginalRate: 0,
        // Credits breakdown
        childTaxCredit: undefined,
        earnedIncomeCredit: undefined,
        educationCredits: undefined,
        // Additional taxes
        selfEmploymentTax: undefined,
        netInvestmentIncomeTax: undefined,
        additionalMedicareTax: undefined,
      });
    }

    // Calculate filing comparison for married couples
    if (personalInfo.filingStatus === 'marriedJointly') {
      const engineComparison = calculateFilingComparisonWithEngine(
        personalInfo,
        incomeData,
        spouseInfo,
        paymentsData,
        taxYear
      );

      setFilingComparison(engineComparison);
    } else {
      setFilingComparison(null);
    }

    // Generate tax optimization suggestions
    const optimizations = generateTaxOptimizations(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo
    );
    setTaxOptimizations(optimizations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataHash]);

  const recalculate = useCallback(() => {
    // Force recalculation

    // Use new tax engine v2
    const engineResults = calculateTaxResultsWithEngine(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo,
      taxYear
    );

    if (engineResults.success && engineResults.result) {
      const result = engineResults.result;
      setTaxResult({
        adjustedGrossIncome: result.adjustedGrossIncome || 0,
        taxableIncome: result.taxableIncome || 0,
        federalTax: result.federalTax || 0,
        stateTax: result.stateTax || result.marylandTax || 0,
        marylandTax: result.marylandTax || 0,
        localTax: result.localTax || 0,
        totalTax: result.totalTax || 0,
        totalPayments: result.totalPayments || 0,
        balance: result.balance || 0,
        effectiveRate: result.effectiveRate || 0,
        afterTaxIncome: result.afterTaxIncome || 0,
        // Deduction details (from Phase 2 fixes)
        standardDeduction: result.standardDeduction || 0,
        itemizedDeduction: result.itemizedDeduction || 0,
        deductionType: result.deductionType,
        // Tax rates
        marginalRate: result.marginalRate || 0,
        // Credits breakdown
        childTaxCredit: result.childTaxCredit,
        earnedIncomeCredit: result.earnedIncomeCredit,
        educationCredits: result.educationCredits,
        // Additional taxes
        selfEmploymentTax: result.selfEmploymentTax,
        netInvestmentIncomeTax: result.netInvestmentIncomeTax,
        additionalMedicareTax: result.additionalMedicareTax,
      });

      // Extract diagnostics and trace
      if (engineResults.federalDetails) {
        setFederalDetails(engineResults.federalDetails);
        setDiagnostics(engineResults.federalDetails.diagnostics);
        setTrace(engineResults.federalDetails.trace ?? null);
      }
    } else {
      logger.error(
        'Tax calculation failed (recalculate)',
        new Error(engineResults.error || 'Unknown error')
      );
      setDiagnostics(null);
      setTrace(null);
      setFederalDetails(null);
      setTaxResult({
        adjustedGrossIncome: 0,
        taxableIncome: 0,
        federalTax: 0,
        stateTax: 0,
        marylandTax: 0,
        localTax: 0,
        totalTax: 0,
        totalPayments: 0,
        balance: 0,
        effectiveRate: 0,
        afterTaxIncome: 0,
        // Deduction details
        standardDeduction: 0,
        itemizedDeduction: 0,
        deductionType: undefined,
        // Tax rates
        marginalRate: 0,
        // Credits breakdown
        childTaxCredit: undefined,
        earnedIncomeCredit: undefined,
        educationCredits: undefined,
        // Additional taxes
        selfEmploymentTax: undefined,
        netInvestmentIncomeTax: undefined,
        additionalMedicareTax: undefined,
      });
    }
  }, [
    personalInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    spouseInfo,
    taxYear,
  ]);

  /**
   * Check if there are any warnings from the calculation engine.
   */
  const hasWarnings = diagnostics && diagnostics.warnings.length > 0;

  /**
   * Check if there are any errors from the calculation engine.
   */
  const hasErrors = diagnostics && diagnostics.errors.length > 0;

  /**
   * Get the count of diagnostic messages.
   */
  const diagnosticsCount = diagnostics
    ? diagnostics.warnings.length + diagnostics.errors.length
    : 0;

  return {
    taxResult,
    filingComparison,
    taxOptimizations,
    setTaxResult,
    recalculate,
    // Engine diagnostics and trace for audit/review
    diagnostics,
    trace,
    federalDetails,
    // Convenience flags
    hasWarnings,
    hasErrors,
    diagnosticsCount,
  };
};

export type { TaxResult, FilingComparison, TaxOptimization };
export type { FederalDiagnostics2025 as TaxDiagnostics } from '../engine/types';
export type { TraceSection as TaxTrace } from '../engine/trace/types';
