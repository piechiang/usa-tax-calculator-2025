import { useState, useEffect } from 'react';
import { calculateTaxResults, calculateFilingComparison } from '../utils/taxCalculations';
import {
  calculateTaxResultsWithEngine,
  calculateFilingComparisonWithEngine
} from '../utils/engineAdapter';
import { generateTaxOptimizations } from '../utils/taxOptimization';
import { standardDeductions } from '../constants/taxBrackets';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  ssn: string;
  filingStatus: string;
  address: string;
  dependents: number;
  isMaryland: boolean;
  county: string;
}

interface SpouseInfo {
  firstName: string;
  lastName: string;
  ssn: string;
  wages: string;
  interestIncome: string;
  dividends: string;
  capitalGains: string;
  businessIncome: string;
  otherIncome: string;
  federalWithholding: string;
  stateWithholding: string;
}

type IncomeData = Record<string, string>;
type K1Data = Record<string, string>;

interface BusinessDetails {
  grossReceipts: string;
  costOfGoodsSold: string;
  businessExpenses: string;
}

type PaymentsData = Record<string, string>;

interface Deductions {
  useStandardDeduction: boolean;
  standardDeduction: number;
  itemizedTotal: number;
  mortgageInterest: string;
  stateLocalTaxes: string;
  charitableContributions: string;
  medicalExpenses: string;
  otherItemized: string;
}

interface TaxResult {
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  marylandTax: number;
  localTax: number;
  totalTax: number;
  totalPayments: number;
  balance: number;
  effectiveRate: number;
  afterTaxIncome: number;
}

type Errors = Record<string, string>;
type Touched = Record<string, boolean>;

export const useTaxCalculator = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    ssn: '',
    filingStatus: 'single',
    address: '',
    dependents: 0,
    isMaryland: true,
    county: 'Baltimore City'
  });

  const [spouseInfo, setSpouseInfo] = useState<SpouseInfo>({
    firstName: '',
    lastName: '',
    ssn: '',
    wages: "",
    interestIncome: "",
    dividends: "",
    capitalGains: "",
    businessIncome: "",
    otherIncome: "",
    federalWithholding: "",
    stateWithholding: ""
  });

  const [incomeData, setIncomeData] = useState<IncomeData>({
    wages: "",
    interestIncome: "",
    dividends: "",
    capitalGains: "",
    businessIncome: "",
    otherIncome: ""
  });

  const [k1Data, setK1Data] = useState<K1Data>({
    ordinaryIncome: "",
    netRentalRealEstate: "",
    otherRentalIncome: "",
    guaranteedPayments: "",
    k1InterestIncome: "",
    k1Dividends: "",
    royalties: "",
    netShortTermCapitalGain: "",
    netLongTermCapitalGain: "",
    otherPortfolioIncome: ""
  });

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    grossReceipts: "",
    costOfGoodsSold: "",
    businessExpenses: ""
  });

  const [paymentsData, setPaymentsData] = useState<PaymentsData>({
    federalWithholding: "",
    stateWithholding: "",
    estimatedTaxPayments: "",
    priorYearOverpayment: "",
    otherPayments: ""
  });

  const [deductions, setDeductions] = useState<Deductions>({
    useStandardDeduction: true,
    standardDeduction: 15750,
    itemizedTotal: 0,
    mortgageInterest: "",
    stateLocalTaxes: "",
    charitableContributions: "",
    medicalExpenses: "",
    otherItemized: ""
  });

  const [taxResult, setTaxResult] = useState<TaxResult>({
    adjustedGrossIncome: 0,
    taxableIncome: 0,
    federalTax: 0,
    marylandTax: 0,
    localTax: 0,
    totalTax: 0,
    totalPayments: 0,
    balance: 0,
    effectiveRate: 0,
    afterTaxIncome: 0
  });

  const [filingComparison, setFilingComparison] = useState<any | null>(null);
  const [taxOptimizations, setTaxOptimizations] = useState<any[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  // Update standard deduction when filing status changes
  useEffect(() => {
    const newStandardDeduction = standardDeductions[personalInfo.filingStatus];
    setDeductions(prev => ({
      ...prev,
      standardDeduction: newStandardDeduction
    }));
  }, [personalInfo.filingStatus]);

  // Calculate tax results whenever relevant data changes
  useEffect(() => {
    const results = calculateTaxResults(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo
    );
    setTaxResult(results);

    // Calculate filing comparison for married couples
    if (personalInfo.filingStatus === 'marriedJointly') {
      // Try new engine first, fallback to old calculation
      const engineComparison = calculateFilingComparisonWithEngine(
        personalInfo,
        incomeData,
        spouseInfo,
        paymentsData
      );
      
      if (engineComparison) {
        setFilingComparison(engineComparison);
      } else {
        // Fallback to legacy calculation
        const comparison = calculateFilingComparison(
          personalInfo,
          incomeData,
          spouseInfo,
          paymentsData
        );
        setFilingComparison(comparison);
      }
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
      deductions
    );
    setTaxOptimizations(optimizations);
  }, [personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo]);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSpouseInfoChange = (field: keyof SpouseInfo, value: any) => {
    setSpouseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleIncomeChange = (field: string, value: string) => {
    setIncomeData(prev => ({ ...prev, [field]: value }));
  };

  const handleK1Change = (field: string, value: string) => {
    setK1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessDetailsChange = (field: keyof BusinessDetails, value: string) => {
    setBusinessDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentsChange = (field: string, value: string) => {
    setPaymentsData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeductionChange = (field: keyof Deductions, value: any) => {
    setDeductions(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate itemizedTotal when any itemized deduction field changes
      if (field === 'mortgageInterest' || field === 'stateLocalTaxes' ||
          field === 'charitableContributions' || field === 'medicalExpenses' ||
          field === 'otherItemized') {
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

  const setError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const setFieldTouched = (field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  };

  const recalculate = () => {
    // Try new engine first, fallback to old calculation
    const engineResults = calculateTaxResultsWithEngine(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo
    );
    
    if (engineResults.success) {
      setTaxResult(engineResults.result);
      console.log('Using new tax engine', { 
        federal: engineResults.federalDetails, 
        state: engineResults.stateDetails 
      });
    } else {
      // Fallback to legacy calculation
      console.warn('Engine calculation failed, using legacy method:', engineResults.error);
      const results = calculateTaxResults(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );
      setTaxResult(results);
    }
  };

  const getSnapshot = () => ({
    personalInfo,
    spouseInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    taxResult
  });

  const loadFromSnapshot = (s: any) => {
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
    loadFromSnapshot
  };
};
