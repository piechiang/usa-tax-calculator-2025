/**
 * useDependencyHash - Optimized dependency tracking for tax calculations
 *
 * This hook provides a more efficient alternative to deep comparison by:
 * 1. Computing a stable hash of relevant data fields
 * 2. Only triggering updates when the hash changes
 * 3. Avoiding full object tree traversal on every render
 */

import { useMemo, useRef } from 'react';
import type { PersonalInfo, SpouseInfo } from '../types/CommonTypes';
import type { Deductions } from './useDeductionState';

/**
 * Creates a stable hash string from tax-relevant data
 * Only includes fields that affect tax calculations
 */
const createTaxDataHash = (
  personalInfo: PersonalInfo,
  spouseInfo: SpouseInfo,
  incomeData: Record<string, string | undefined>,
  k1Data: Record<string, string | undefined>,
  businessDetails: Record<string, string | undefined>,
  paymentsData: Record<string, string | undefined>,
  deductions: Deductions
): string => {
  // Extract only tax-relevant fields from personalInfo
  const personalFields = [
    personalInfo.filingStatus,
    personalInfo.state,
    personalInfo.county,
    personalInfo.dependents,
    personalInfo.age,
    personalInfo.isBlind ? '1' : '0',
    personalInfo.spouseAge,
    personalInfo.spouseIsBlind ? '1' : '0',
  ].join('|');

  // Extract spouse info fields
  const spouseFields = [
    spouseInfo.hasIncome ? '1' : '0',
    spouseInfo.wages || '',
    spouseInfo.selfEmploymentIncome || '',
    spouseInfo.federalWithholding || '',
    spouseInfo.stateWithholding || '',
  ].join('|');

  // Sort and join income data for stable hash
  const incomeFields = Object.entries(incomeData)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  // K1 data
  const k1Fields = Object.entries(k1Data)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  // Business details
  const businessFields = Object.entries(businessDetails)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  // Payments data
  const paymentFields = Object.entries(paymentsData)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');

  // Deductions - only include relevant fields
  const deductionFields = [
    deductions.useItemized ? '1' : '0',
    deductions.mortgageInterest || '',
    deductions.propertyTax || '',
    deductions.stateTaxPaid || '',
    deductions.charitableCash || '',
    deductions.charitableNonCash || '',
    deductions.medicalExpenses || '',
    deductions.studentLoanInterest || '',
    deductions.educatorExpenses || '',
    deductions.hsaContributions || '',
    deductions.iraContributions || '',
    deductions.selfEmployedHealthInsurance || '',
    deductions.selfEmployedRetirement || '',
  ].join('|');

  return `${personalFields}§${spouseFields}§${incomeFields}§${k1Fields}§${businessFields}§${paymentFields}§${deductionFields}`;
};

/**
 * Hook that returns a stable hash of tax calculation inputs
 * Use this hash as a dependency instead of deep comparing objects
 */
export const useTaxDataHash = (
  personalInfo: PersonalInfo,
  spouseInfo: SpouseInfo,
  incomeData: Record<string, string | undefined>,
  k1Data: Record<string, string | undefined>,
  businessDetails: Record<string, string | undefined>,
  paymentsData: Record<string, string | undefined>,
  deductions: Deductions
): string => {
  return useMemo(
    () =>
      createTaxDataHash(
        personalInfo,
        spouseInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions
      ),
    [personalInfo, spouseInfo, incomeData, k1Data, businessDetails, paymentsData, deductions]
  );
};

/**
 * Hook that tracks whether tax data has changed
 * Returns true only when data affecting calculations has changed
 */
export const useTaxDataChanged = (
  personalInfo: PersonalInfo,
  spouseInfo: SpouseInfo,
  incomeData: Record<string, string | undefined>,
  k1Data: Record<string, string | undefined>,
  businessDetails: Record<string, string | undefined>,
  paymentsData: Record<string, string | undefined>,
  deductions: Deductions
): boolean => {
  const currentHash = useTaxDataHash(
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions
  );

  const previousHashRef = useRef<string | null>(null);

  const hasChanged = previousHashRef.current !== null && previousHashRef.current !== currentHash;
  previousHashRef.current = currentHash;

  return hasChanged;
};

/**
 * Simple object hash for smaller objects
 * Uses JSON.stringify but with sorted keys for stability
 */
export const createStableHash = <T extends Record<string, unknown>>(obj: T): string => {
  const sortedEntries = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return sortedEntries.map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(',');
};

/**
 * Hook for tracking changes in smaller objects with primitive values
 */
export const useSimpleHash = <T extends Record<string, unknown>>(obj: T): string => {
  return useMemo(() => createStableHash(obj), [obj]);
};
