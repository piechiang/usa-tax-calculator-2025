import { useState, useEffect } from 'react';
import { calculateTaxResults, calculateFilingComparison } from '../utils/taxCalculations';
import { 
  calculateTaxResultsWithEngine, 
  calculateFilingComparisonWithEngine 
} from '../utils/engineAdapter.ts';
import { generateTaxOptimizations } from '../utils/taxOptimization';
import { standardDeductions } from '../constants/taxBrackets';

export const useTaxCalculator = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    filingStatus: 'single',
    address: '',
    dependents: 0,
    isMaryland: true,
    county: 'Baltimore City'
  });

  const [spouseInfo, setSpouseInfo] = useState({
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

  const [incomeData, setIncomeData] = useState({
    wages: "",
    interestIncome: "",
    dividends: "",
    capitalGains: "",
    businessIncome: "",
    otherIncome: ""
  });

  const [k1Data, setK1Data] = useState({
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

  const [businessDetails, setBusinessDetails] = useState({
    grossReceipts: "",
    costOfGoodsSold: "",
    businessExpenses: ""
  });

  const [paymentsData, setPaymentsData] = useState({
    federalWithholding: "",
    stateWithholding: "",
    estimatedTaxPayments: "",
    priorYearOverpayment: "",
    otherPayments: ""
  });

  const [deductions, setDeductions] = useState({
    useStandardDeduction: true,
    standardDeduction: 15750,
    itemizedTotal: 0,
    mortgageInterest: "",
    stateLocalTaxes: "",
    charitableContributions: "",
    medicalExpenses: "",
    otherItemized: ""
  });

  const [taxResult, setTaxResult] = useState({
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

  const [filingComparison, setFilingComparison] = useState(null);
  const [taxOptimizations, setTaxOptimizations] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
      deductions
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

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSpouseInfoChange = (field, value) => {
    setSpouseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleIncomeChange = (field, value) => {
    setIncomeData(prev => ({ ...prev, [field]: value }));
  };

  const handleK1Change = (field, value) => {
    setK1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessDetailsChange = (field, value) => {
    setBusinessDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentsChange = (field, value) => {
    setPaymentsData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeductionChange = (field, value) => {
    setDeductions(prev => ({ ...prev, [field]: value }));
  };

  const setError = (field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const setFieldTouched = (field, isTouched = true) => {
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
        deductions
      );
      setTaxResult(results);
    }
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
    recalculate
  };
};