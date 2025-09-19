import { useState, useEffect, useRef, useCallback } from 'react';
import { useTaxCalculator } from './useTaxCalculator';

interface RealTimeCalculatorState {
  isCalculating: boolean;
  lastCalculated: Date | null;
  previousTaxResult: any;
  calculationCount: number;
  averageCalculationTime: number;
  realTimeEnabled: boolean;
  debounceDelay: number;
}

export const useRealTimeTaxCalculator = () => {
  const taxCalculator = useTaxCalculator();

  const [realTimeState, setRealTimeState] = useState<RealTimeCalculatorState>({
    isCalculating: false,
    lastCalculated: null,
    previousTaxResult: null,
    calculationCount: 0,
    averageCalculationTime: 0,
    realTimeEnabled: true,
    debounceDelay: 500 // 500ms debounce by default
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const calculationStartTime = useRef<number>();
  const previousDataRef = useRef<string>('');

  // Debounced calculation function
  const debouncedCalculate = useCallback(() => {
    if (!realTimeState.realTimeEnabled) return;

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set calculating state
    setRealTimeState(prev => ({ ...prev, isCalculating: true }));
    calculationStartTime.current = Date.now();

    // Start debounced calculation
    debounceRef.current = setTimeout(() => {
      // Store previous result before calculating
      setRealTimeState(prev => ({
        ...prev,
        previousTaxResult: taxCalculator.taxResult
      }));

      // Perform calculation
      taxCalculator.recalculate();

      // Update calculation metrics
      const calculationTime = Date.now() - (calculationStartTime.current || 0);
      setRealTimeState(prev => {
        const newCount = prev.calculationCount + 1;
        const newAverageTime = (prev.averageCalculationTime * prev.calculationCount + calculationTime) / newCount;

        return {
          ...prev,
          isCalculating: false,
          lastCalculated: new Date(),
          calculationCount: newCount,
          averageCalculationTime: newAverageTime
        };
      });
    }, realTimeState.debounceDelay);
  }, [taxCalculator, realTimeState.realTimeEnabled, realTimeState.debounceDelay]);

  // Monitor data changes for real-time calculation
  useEffect(() => {
    const currentData = JSON.stringify({
      personalInfo: taxCalculator.personalInfo,
      incomeData: taxCalculator.incomeData,
      deductions: taxCalculator.deductions,
      paymentsData: taxCalculator.paymentsData,
      k1Data: taxCalculator.k1Data,
      businessDetails: taxCalculator.businessDetails,
      spouseInfo: taxCalculator.spouseInfo
    });

    // Only calculate if data has actually changed
    if (currentData !== previousDataRef.current && realTimeState.realTimeEnabled) {
      previousDataRef.current = currentData;
      debouncedCalculate();
    }
  }, [
    taxCalculator.personalInfo,
    taxCalculator.incomeData,
    taxCalculator.deductions,
    taxCalculator.paymentsData,
    taxCalculator.k1Data,
    taxCalculator.businessDetails,
    taxCalculator.spouseInfo,
    debouncedCalculate,
    realTimeState.realTimeEnabled
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Enhanced change handlers that trigger real-time calculation
  const enhancedHandlers = {
    handlePersonalInfoChange: (field: any, value: any) => {
      taxCalculator.handlePersonalInfoChange(field, value);
      // Real-time calculation will be triggered by useEffect
    },

    handleIncomeChange: (field: string, value: string) => {
      taxCalculator.handleIncomeChange(field, value);
      // Real-time calculation will be triggered by useEffect
    },

    handleDeductionChange: (field: any, value: any) => {
      taxCalculator.handleDeductionChange(field, value);
      // Real-time calculation will be triggered by useEffect
    },

    handlePaymentsChange: (field: string, value: string) => {
      taxCalculator.handlePaymentsChange(field, value);
      // Real-time calculation will be triggered by useEffect
    },

    handleSpouseInfoChange: (field: any, value: any) => {
      taxCalculator.handleSpouseInfoChange(field, value);
      // Real-time calculation will be triggered by useEffect
    },

    handleK1Change: (field: string, value: string) => {
      taxCalculator.handleK1Change(field, value);
      // Real-time calculation will be triggered by useEffect
    },

    handleBusinessDetailsChange: (field: any, value: string) => {
      taxCalculator.handleBusinessDetailsChange(field, value);
      // Real-time calculation will be triggered by useEffect
    }
  };

  // Real-time control functions
  const toggleRealTime = () => {
    setRealTimeState(prev => ({ ...prev, realTimeEnabled: !prev.realTimeEnabled }));
  };

  const setDebounceDelay = (delay: number) => {
    setRealTimeState(prev => ({ ...prev, debounceDelay: Math.max(100, Math.min(2000, delay)) }));
  };

  const forceCalculation = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setRealTimeState(prev => ({ ...prev, isCalculating: true }));
    calculationStartTime.current = Date.now();

    // Store previous result
    setRealTimeState(prev => ({
      ...prev,
      previousTaxResult: taxCalculator.taxResult
    }));

    taxCalculator.recalculate();

    const calculationTime = Date.now() - (calculationStartTime.current || 0);
    setRealTimeState(prev => {
      const newCount = prev.calculationCount + 1;
      const newAverageTime = (prev.averageCalculationTime * prev.calculationCount + calculationTime) / newCount;

      return {
        ...prev,
        isCalculating: false,
        lastCalculated: new Date(),
        calculationCount: newCount,
        averageCalculationTime: newAverageTime
      };
    });
  };

  const resetCalculationMetrics = () => {
    setRealTimeState(prev => ({
      ...prev,
      calculationCount: 0,
      averageCalculationTime: 0,
      lastCalculated: null
    }));
  };

  return {
    // Original tax calculator properties
    ...taxCalculator,

    // Enhanced handlers for real-time calculation
    ...enhancedHandlers,

    // Real-time specific state and controls
    realTimeState,
    toggleRealTime,
    setDebounceDelay,
    forceCalculation,
    resetCalculationMetrics,

    // Convenience properties
    isCalculating: realTimeState.isCalculating,
    lastCalculated: realTimeState.lastCalculated,
    previousTaxResult: realTimeState.previousTaxResult,
    realTimeEnabled: realTimeState.realTimeEnabled
  };
};