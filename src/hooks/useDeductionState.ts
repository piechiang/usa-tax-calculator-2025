import { useState } from 'react';
import type { UIDeductions } from '../utils/engineAdapter';

// Extend UIDeductions with UI-specific fields
interface Deductions extends Omit<UIDeductions, 'itemizeDeductions'> {
  useStandardDeduction: boolean;
  standardDeduction: number;
  itemizedTotal: number;
}

/**
 * Hook for managing deductions state with auto-calculation
 * Automatically calculates itemized total when individual deduction fields change
 */
export const useDeductionState = (initialStandardDeduction: number) => {
  const [deductions, setDeductions] = useState<Deductions>({
    useStandardDeduction: true,
    standardDeduction: initialStandardDeduction,
    itemizedTotal: 0,
    mortgageInterest: "",
    stateLocalTaxes: "",
    charitableContributions: "",
    medicalExpenses: "",
    otherItemized: ""
  });

  const handleDeductionChange = (
    field: keyof Deductions,
    value: string | number | boolean
  ) => {
    setDeductions(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate itemizedTotal when any itemized deduction field changes
      if (
        field === 'mortgageInterest' ||
        field === 'stateLocalTaxes' ||
        field === 'charitableContributions' ||
        field === 'medicalExpenses' ||
        field === 'otherItemized'
      ) {
        updated.itemizedTotal =
          (Number(updated.mortgageInterest) || 0) +
          (Number(updated.stateLocalTaxes) || 0) +
          (Number(updated.charitableContributions) || 0) +
          (Number(updated.medicalExpenses) || 0) +
          (Number(updated.otherItemized) || 0);
      }

      return updated;
    });
  };

  // Update standard deduction when it changes externally (e.g., filing status change)
  const updateStandardDeduction = (newStandardDeduction: number) => {
    setDeductions(prev => ({
      ...prev,
      standardDeduction: newStandardDeduction
    }));
  };

  return {
    deductions,
    setDeductions,
    handleDeductionChange,
    updateStandardDeduction,
  };
};

export type { Deductions };
