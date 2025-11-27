import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import {
  calculateTaxResultsWithEngine,
  calculateFilingComparisonWithEngine,
} from '../utils/engineAdapter';
import { generateTaxOptimizations } from '../utils/taxOptimization';
import type { PersonalInfo, SpouseInfo, TaxResult } from '../types/CommonTypes';
import type { Deductions } from './useDeductionState';

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
  recommended: string;
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

  // Calculate tax results whenever relevant data changes (deep comparison)
  // Using useDeepCompareEffect instead of JSON.stringify for better performance
  useDeepCompareEffect(() => {

    // Use new tax engine
    const engineResults = calculateTaxResultsWithEngine(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo
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
    } else {
      console.error('Tax calculation failed:', engineResults.error);
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
        paymentsData
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
  }, [personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo]);

  const recalculate = () => {
    // Force recalculation

    // Use new tax engine v2
    const engineResults = calculateTaxResultsWithEngine(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo
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
    } else {
      console.error('Tax calculation failed:', engineResults.error);
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
  };

  return {
    taxResult,
    filingComparison,
    taxOptimizations,
    setTaxResult,
    recalculate,
  };
};

export type { TaxResult, FilingComparison, TaxOptimization };
