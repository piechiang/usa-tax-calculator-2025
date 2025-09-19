import { federalTaxBrackets, standardDeductions, marylandTaxBrackets, marylandCountyRates } from '../constants/taxBrackets';

export const calculateTax = (taxableIncome, brackets) => {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
    }
  }
  return tax;
};

export const calculateFilingComparison = (personalInfo, incomeData, spouseInfo, paymentsData) => {
  if (personalInfo.filingStatus !== 'marriedJointly') return null;

  const taxpayerIncome = Object.values(incomeData).reduce((sum, value) => sum + Number(value || 0), 0);
  const spouseIncome = Number(spouseInfo.wages || 0) +
                       Number(spouseInfo.interestIncome || 0) +
                       Number(spouseInfo.dividends || 0) +
                       Number(spouseInfo.capitalGains || 0) +
                       Number(spouseInfo.businessIncome || 0) +
                       Number(spouseInfo.otherIncome || 0);
  const totalIncome = taxpayerIncome + spouseIncome;

  const taxpayerPayments = Object.values(paymentsData).reduce((sum, value) => sum + Number(value || 0), 0);
  const spousePayments = Number(spouseInfo.federalWithholding || 0) + Number(spouseInfo.stateWithholding || 0);
  const totalPayments = taxpayerPayments + spousePayments;

  // Calculate joint filing
  const jointStandardDeduction = standardDeductions.marriedJointly;
  const jointTaxableIncome = Math.max(0, totalIncome - jointStandardDeduction);
  
  const jointFederalTax = calculateTax(jointTaxableIncome, federalTaxBrackets.marriedJointly);
  
  let jointMarylandTax = 0;
  if (personalInfo.isMaryland) {
    const marylandTaxableIncome = Math.max(0, totalIncome - (personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400));
    jointMarylandTax = calculateTax(marylandTaxableIncome, marylandTaxBrackets);
    
    const localRate = marylandCountyRates[personalInfo.county] || 0.032;
    jointMarylandTax += marylandTaxableIncome * localRate;
  }

  const jointTotalTax = jointFederalTax + jointMarylandTax;
  const jointBalance = totalPayments - jointTotalTax;

  // Calculate separate filing
  const separateStandardDeduction = standardDeductions.marriedSeparately;
  const taxpayerTaxableIncome = Math.max(0, taxpayerIncome - separateStandardDeduction);
  const spouseTaxableIncome = Math.max(0, spouseIncome - separateStandardDeduction);

  const taxpayerFederalTax = calculateTax(taxpayerTaxableIncome, federalTaxBrackets.marriedSeparately);
  const spouseFederalTax = calculateTax(spouseTaxableIncome, federalTaxBrackets.marriedSeparately);

  let taxpayerMarylandTax = 0;
  let spouseMarylandTax = 0;
  if (personalInfo.isMaryland) {
    const taxpayerMarylandTaxableIncome = Math.max(0, taxpayerIncome - 2400);
    const spouseMarylandTaxableIncome = Math.max(0, spouseIncome - 2400);
    
    taxpayerMarylandTax = calculateTax(taxpayerMarylandTaxableIncome, marylandTaxBrackets);
    spouseMarylandTax = calculateTax(spouseMarylandTaxableIncome, marylandTaxBrackets);
    
    const localRate = marylandCountyRates[personalInfo.county] || 0.032;
    taxpayerMarylandTax += taxpayerMarylandTaxableIncome * localRate;
    spouseMarylandTax += spouseMarylandTaxableIncome * localRate;
  }

  const separateTotalTax = taxpayerFederalTax + spouseFederalTax + taxpayerMarylandTax + spouseMarylandTax;
  const separateBalance = totalPayments - separateTotalTax;

  return {
    joint: {
      totalTax: jointTotalTax,
      balance: jointBalance,
      savings: separateTotalTax - jointTotalTax
    },
    separate: {
      totalTax: separateTotalTax,
      balance: separateBalance,
      savings: jointTotalTax - separateTotalTax
    },
    recommended: jointTotalTax < separateTotalTax ? 'joint' : 'separate'
  };
};

export const calculateTaxResults = (personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo = null) => {
  // Calculate AGI
  const totalIncome = Object.values(incomeData).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalK1Income = Object.values(k1Data).reduce((sum, value) => sum + Number(value || 0), 0);
  const businessIncome = Number(businessDetails.grossReceipts || 0) - Number(businessDetails.costOfGoodsSold || 0) - Number(businessDetails.businessExpenses || 0);

  // Include spouse income if filing jointly
  let spouseIncome = 0;
  if (personalInfo.filingStatus === 'marriedJointly' && spouseInfo) {
    spouseIncome = Number(spouseInfo.wages || 0) +
                   Number(spouseInfo.interestIncome || 0) +
                   Number(spouseInfo.dividends || 0) +
                   Number(spouseInfo.capitalGains || 0) +
                   Number(spouseInfo.businessIncome || 0) +
                   Number(spouseInfo.otherIncome || 0);
  }

  const adjustedGrossIncome = totalIncome + totalK1Income + businessIncome + spouseIncome;

  // Calculate federal taxable income
  const federalDeduction = deductions.useStandardDeduction 
    ? standardDeductions[personalInfo.filingStatus] 
    : deductions.itemizedTotal;
  
  const federalTaxableIncome = Math.max(0, adjustedGrossIncome - federalDeduction);

  // Calculate federal tax
  const federalBrackets = federalTaxBrackets[personalInfo.filingStatus];
  const federalTax = calculateTax(federalTaxableIncome, federalBrackets);

  // Calculate Maryland tax
  let marylandTax = 0;
  let localTax = 0;
  if (personalInfo.isMaryland) {
    const marylandDeduction = personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400;
    const marylandTaxableIncome = Math.max(0, adjustedGrossIncome - marylandDeduction);
    
    marylandTax = calculateTax(marylandTaxableIncome, marylandTaxBrackets);
    
    const localRate = marylandCountyRates[personalInfo.county] || 0.032;
    localTax = marylandTaxableIncome * localRate;
  }

  const totalTax = federalTax + marylandTax + localTax;

  // Include spouse payments if filing jointly
  let spousePayments = 0;
  if (personalInfo.filingStatus === 'marriedJointly' && spouseInfo) {
    spousePayments = Number(spouseInfo.federalWithholding || 0) + Number(spouseInfo.stateWithholding || 0);
  }

  const totalPayments = Object.values(paymentsData).reduce((sum, value) => sum + Number(value || 0), 0) + spousePayments;
  const balance = totalPayments - totalTax;
  
  const effectiveRate = adjustedGrossIncome > 0 ? (totalTax / adjustedGrossIncome) : 0;
  const afterTaxIncome = adjustedGrossIncome - totalTax;

  return {
    adjustedGrossIncome,
    taxableIncome: federalTaxableIncome,
    federalTax,
    marylandTax,
    localTax,
    totalTax,
    totalPayments,
    balance,
    effectiveRate,
    afterTaxIncome
  };
};