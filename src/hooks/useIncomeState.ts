import { useState } from 'react';
import type {
  UIIncomeData,
  UIK1Data,
  UIBusinessDetails,
  UIPaymentsData,
} from '../utils/engineAdapter';

// Use consolidated types from engineAdapter
type IncomeData = UIIncomeData;
type K1Data = UIK1Data;
type BusinessDetails = UIBusinessDetails;
type PaymentsData = UIPaymentsData;

/**
 * Hook for managing all income-related state
 * Handles W-2 income, K-1 income, business details, and payments/withholding
 */
export const useIncomeState = () => {
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

  return {
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
  };
};
