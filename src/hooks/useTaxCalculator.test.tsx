import { renderHook, waitFor, act } from '@testing-library/react';
import { useTaxCalculator } from './useTaxCalculator';

describe('useTaxCalculator', () => {
  it('initializes taxResult with zeros', async () => {
    const { result } = renderHook(() => useTaxCalculator());

    // Wait for initial state to be set
    await waitFor(() => {
      expect(result.current.taxResult).toBeDefined();
    });

    expect(result.current.taxResult.totalTax).toBe(0);
    expect(result.current.taxResult.federalTax).toBe(0);
    expect(result.current.taxResult.adjustedGrossIncome).toBe(0);
  });

  it('calculates tax when personal info is updated', async () => {
    const { result } = renderHook(() => useTaxCalculator());

    // Update personal info wrapped in act
    await act(async () => {
      result.current.handlePersonalInfoChange('filingStatus', 'single');
    });

    // Wait for calculation to complete
    await waitFor(() => {
      expect(result.current.personalInfo.filingStatus).toBe('single');
    });
  });

  it('updates income data correctly', async () => {
    const { result } = renderHook(() => useTaxCalculator());

    // Update income wrapped in act
    await act(async () => {
      result.current.handleIncomeChange('wages', '50000');
    });

    // Wait for state update
    await waitFor(() => {
      expect(result.current.incomeData.wages).toBe('50000');
    });
  });
});
