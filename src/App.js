import React, { useState, useEffect } from 'react';
import { Calculator, FileText, User, DollarSign, Download, AlertCircle, MapPin } from 'lucide-react';

export default function USATaxSoftware2025() {
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

  const [incomeData, setIncomeData] = useState({
    wages: 0,
    interestIncome: 0,
    dividends: 0,
    capitalGains: 0,
    businessIncome: 0,
    otherIncome: 0
  });

  const [paymentsData, setPaymentsData] = useState({
    federalWithholding: 0,
    estimatedTaxPayments: 0,
    priorYearOverpayment: 0,
    otherPayments: 0
  });

  const [deductions, setDeductions] = useState({
    useStandardDeduction: true,
    standardDeduction: 15750, // 2025 single filer
    itemizedTotal: 0,
    mortgageInterest: 0,
    stateLocalTaxes: 0,
    charitableContributions: 0,
    medicalExpenses: 0,
    otherItemized: 0
  });

  const [taxResult, setTaxResult] = useState({
    adjustedGrossIncome: 0,
    taxableIncome: 0,
    federalTax: 0,
    marylandTax: 0,
    localTax: 0,
    totalTax: 0,
    totalPayments: 0,
    refundAmount: 0,
    amountOwed: 0,
    effectiveRate: 0,
    marginalRate: 0,
    afterTaxIncome: 0
  });

  const [activeTab, setActiveTab] = useState('personal');

  // 2025 Tax Year - Federal Tax Brackets (updated for inflation)
  const federalTaxBrackets = {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 }
    ],
    marriedJointly: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: Infinity, rate: 0.37 }
    ],
    marriedSeparately: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 375800, rate: 0.35 },
      { min: 375800, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 }
    ]
  };

  // 2025 Standard Deductions (updated)
  const standardDeductions = {
    single: 15750,
    marriedJointly: 31500,
    marriedSeparately: 15750,
    headOfHousehold: 23625
  };

  // Maryland Tax Brackets 2025
  const marylandTaxBrackets = [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 2000, rate: 0.03 },
    { min: 2000, max: 3000, rate: 0.04 },
    { min: 3000, max: 100000, rate: 0.0475 },
    { min: 100000, max: 125000, rate: 0.05 },
    { min: 125000, max: 150000, rate: 0.0525 },
    { min: 150000, max: 250000, rate: 0.055 },
    { min: 250000, max: Infinity, rate: 0.0575 }
  ];

  // Maryland Counties Local Tax Rates 2025
  const marylandCountyRates = {
    'Allegany': 0.0305,
    'Anne Arundel': 0.0281,
    'Baltimore City': 0.032,
    'Baltimore County': 0.032,
    'Calvert': 0.032,
    'Caroline': 0.0263,
    'Carroll': 0.032,
    'Cecil': 0.0274,
    'Charles': 0.029,
    'Dorchester': 0.0262,
    'Frederick': 0.0296,
    'Garrett': 0.0265,
    'Harford': 0.0306,
    'Howard': 0.032,
    'Kent': 0.0285,
    'Montgomery': 0.032,
    'Prince Georges': 0.032,
    'Queen Annes': 0.0285,
    'Somerset': 0.032,
    'St. Marys': 0.032,
    'Talbot': 0.0240,
    'Washington': 0.028,
    'Wicomico': 0.032,
    'Worcester': 0.0125
  };

  // Calculate taxes
  const calculateTax = () => {
    const totalIncome = Object.values(incomeData).reduce((sum, value) => sum + Number(value), 0);
    const adjustedGrossIncome = totalIncome;
    
    // Federal tax calculation
    const standardDed = standardDeductions[personalInfo.filingStatus];
    const itemizedTotal = Object.values(deductions).slice(2).reduce((sum, value) => sum + Number(value), 0);
    const actualDeduction = deductions.useStandardDeduction ? standardDed : Math.max(itemizedTotal, standardDed);
    
    const federalTaxableIncome = Math.max(0, adjustedGrossIncome - actualDeduction);
    
    // Calculate federal tax
    const federalBrackets = federalTaxBrackets[personalInfo.filingStatus];
    let federalTax = 0;
    let marginalRate = 0;
    
    for (let i = 0; i < federalBrackets.length; i++) {
      const bracket = federalBrackets[i];
      if (federalTaxableIncome > bracket.min) {
        const taxableInBracket = Math.min(federalTaxableIncome - bracket.min, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        marginalRate = bracket.rate;
      }
    }
    
    // Maryland tax calculation
    let marylandTax = 0;
    let localTax = 0;
    
    if (personalInfo.isMaryland) {
      // Maryland standard deduction is $2,400 for single, $4,850 for joint
      const mdStandardDeduction = personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400;
      const marylandTaxableIncome = Math.max(0, adjustedGrossIncome - mdStandardDeduction);
      
      // Calculate Maryland state tax
      for (let i = 0; i < marylandTaxBrackets.length; i++) {
        const bracket = marylandTaxBrackets[i];
        if (marylandTaxableIncome > bracket.min) {
          const taxableInBracket = Math.min(marylandTaxableIncome - bracket.min, bracket.max - bracket.min);
          marylandTax += taxableInBracket * bracket.rate;
        }
      }
      
      // Calculate local tax
      const localRate = marylandCountyRates[personalInfo.county] || 0.032;
      localTax = marylandTaxableIncome * localRate;
    }
    
    const totalTax = federalTax + marylandTax + localTax;
    
    // Calculate total payments
    const totalPayments = Object.values(paymentsData).reduce((sum, value) => sum + Number(value), 0);
    
    // Calculate refund or amount owed (based on federal tax only for this calculation)
    const refundAmount = Math.max(0, totalPayments - federalTax);
    const amountOwed = Math.max(0, federalTax - totalPayments);
    
    const effectiveRate = adjustedGrossIncome > 0 ? totalTax / adjustedGrossIncome : 0;
    const afterTaxIncome = adjustedGrossIncome - totalTax;

    setTaxResult({
      adjustedGrossIncome,
      taxableIncome: federalTaxableIncome,
      federalTax,
      marylandTax,
      localTax,
      totalTax,
      totalPayments,
      refundAmount,
      amountOwed,
      effectiveRate,
      marginalRate,
      afterTaxIncome
    });
  };

  useEffect(() => {
    // Update standard deduction when filing status changes
    setDeductions(prev => ({
      ...prev,
      standardDeduction: standardDeductions[personalInfo.filingStatus]
    }));
    calculateTax();
  }, [personalInfo, incomeData, deductions, paymentsData]);

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleIncomeChange = (field, value) => {
    setIncomeData(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleDeductionChange = (field, value) => {
    if (field === 'useStandardDeduction') {
      setDeductions(prev => ({ ...prev, [field]: value }));
    } else {
      setDeductions(prev => ({ ...prev, [field]: Number(value) || 0 }));
    }
  };

  const handlePaymentsChange = (field, value) => {
    setPaymentsData(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (rate) => {
    return (rate * 100).toFixed(1) + '%';
  };

  const exportTaxReturn = () => {
    const taxReturn = {
      personalInfo,
      incomeData,
      deductions,
      taxResult,
      taxYear: '2025',
      date: new Date().toLocaleDateString('en-US')
    };
    
    const dataStr = JSON.stringify(taxReturn, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Tax_Return_${personalInfo.lastName}_${personalInfo.firstName}_2025.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToPDF = () => {
    // Create a new window with the 1040 form
    const printWindow = window.open('', '_blank');
    const form1040HTML = generateForm1040HTML();
    
    printWindow.document.write(form1040HTML);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateForm1040HTML = () => {
    const standardDed = standardDeductions[personalInfo.filingStatus];
    const itemizedTotal = Object.values(deductions).slice(2).reduce((sum, value) => sum + Number(value), 0);
    const actualDeduction = deductions.useStandardDeduction ? standardDed : Math.max(itemizedTotal, standardDed);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Form 1040 - ${personalInfo.firstName} ${personalInfo.lastName}</title>
        <style>
            @page {
                size: 8.5in 11in;
                margin: 0.5in;
            }
            body {
                font-family: 'Courier New', monospace;
                font-size: 10px;
                line-height: 1.2;
                margin: 0;
                padding: 0;
            }
            .form-header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .form-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .form-subtitle {
                font-size: 12px;
                margin-bottom: 10px;
            }
            .tax-year {
                font-size: 14px;
                font-weight: bold;
            }
            .section {
                margin-bottom: 15px;
                border: 1px solid #000;
                padding: 10px;
            }
            .section-title {
                font-weight: bold;
                margin-bottom: 10px;
                background-color: #f0f0f0;
                padding: 5px;
                border-bottom: 1px solid #000;
            }
            .line-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                padding: 2px 0;
                border-bottom: 1px dotted #ccc;
            }
            .line-number {
                font-weight: bold;
                width: 30px;
            }
            .line-description {
                flex: 1;
                padding: 0 10px;
            }
            .line-amount {
                width: 100px;
                text-align: right;
                font-family: monospace;
            }
            .checkbox {
                display: inline-block;
                width: 12px;
                height: 12px;
                border: 1px solid #000;
                margin-right: 5px;
                text-align: center;
                line-height: 12px;
            }
            .signature-section {
                margin-top: 30px;
                border-top: 2px solid #000;
                padding-top: 20px;
            }
            .signature-line {
                border-bottom: 1px solid #000;
                width: 200px;
                height: 20px;
                display: inline-block;
                margin-right: 20px;
            }
            .total-line {
                border-top: 2px solid #000;
                border-bottom: 2px solid #000;
                font-weight: bold;
                background-color: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <div class="form-header">
            <div class="form-title">Form 1040</div>
            <div class="form-subtitle">U.S. Individual Income Tax Return</div>
            <div class="tax-year">2025</div>
        </div>

        <!-- Personal Information Section -->
        <div class="section">
            <div class="section-title">Filing Information</div>
            <div class="line-item">
                <span class="line-description">Your first name and middle initial</span>
                <span class="line-amount">${personalInfo.firstName}</span>
            </div>
            <div class="line-item">
                <span class="line-description">Last name</span>
                <span class="line-amount">${personalInfo.lastName}</span>
            </div>
            <div class="line-item">
                <span class="line-description">Your social security number</span>
                <span class="line-amount">${personalInfo.ssn}</span>
            </div>
            <div class="line-item">
                <span class="line-description">Home address</span>
                <span class="line-amount">${personalInfo.address}</span>
            </div>
            <div class="line-item">
                <span class="line-description">Filing Status:</span>
                <span class="line-amount">
                    <span class="${personalInfo.filingStatus === 'single' ? 'checkbox' : 'checkbox'}">
                        ${personalInfo.filingStatus === 'single' ? 'X' : ''}
                    </span> Single
                    <span class="${personalInfo.filingStatus === 'marriedJointly' ? 'checkbox' : 'checkbox'}">
                        ${personalInfo.filingStatus === 'marriedJointly' ? 'X' : ''}
                    </span> Married filing jointly
                    <span class="${personalInfo.filingStatus === 'marriedSeparately' ? 'checkbox' : 'checkbox'}">
                        ${personalInfo.filingStatus === 'marriedSeparately' ? 'X' : ''}
                    </span> Married filing separately
                    <span class="${personalInfo.filingStatus === 'headOfHousehold' ? 'checkbox' : 'checkbox'}">
                        ${personalInfo.filingStatus === 'headOfHousehold' ? 'X' : ''}
                    </span> Head of household
                </span>
            </div>
        </div>

        <!-- Income Section -->
        <div class="section">
            <div class="section-title">Income</div>
            <div class="line-item">
                <span class="line-number">1a</span>
                <span class="line-description">Wages, salaries, tips, etc.</span>
                <span class="line-amount">${formatCurrency(incomeData.wages)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">2a</span>
                <span class="line-description">Tax-exempt interest</span>
                <span class="line-amount">${formatCurrency(incomeData.interestIncome)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">3a</span>
                <span class="line-description">Qualified dividends</span>
                <span class="line-amount">${formatCurrency(incomeData.dividends)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">4</span>
                <span class="line-description">IRA distributions</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">5</span>
                <span class="line-description">Pensions and annuities</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">6</span>
                <span class="line-description">Social security benefits</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">7</span>
                <span class="line-description">Capital gain or (loss)</span>
                <span class="line-amount">${formatCurrency(incomeData.capitalGains)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">8</span>
                <span class="line-description">Other income from Schedule 1</span>
                <span class="line-amount">${formatCurrency(incomeData.businessIncome + incomeData.otherIncome)}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">9</span>
                <span class="line-description">Add lines 1a through 8. This is your total income</span>
                <span class="line-amount">${formatCurrency(taxResult.adjustedGrossIncome)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">10</span>
                <span class="line-description">Adjustments to income from Schedule 1</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">11</span>
                <span class="line-description">Adjusted gross income. Subtract line 10 from line 9</span>
                <span class="line-amount">${formatCurrency(taxResult.adjustedGrossIncome)}</span>
            </div>
        </div>

        <!-- Standard Deduction and Taxable Income -->
        <div class="section">
            <div class="section-title">Standard Deduction and Taxable Income</div>
            <div class="line-item">
                <span class="line-number">12</span>
                <span class="line-description">
                    ${deductions.useStandardDeduction ? 'Standard deduction' : 'Itemized deductions from Schedule A'}
                </span>
                <span class="line-amount">${formatCurrency(actualDeduction)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">13</span>
                <span class="line-description">Qualified business income deduction</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">14</span>
                <span class="line-description">Add lines 12 and 13</span>
                <span class="line-amount">${formatCurrency(actualDeduction)}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">15</span>
                <span class="line-description">Taxable income. Subtract line 14 from line 11</span>
                <span class="line-amount">${formatCurrency(taxResult.taxableIncome)}</span>
            </div>
        </div>

        <!-- Tax and Credits -->
        <div class="section">
            <div class="section-title">Tax and Credits</div>
            <div class="line-item">
                <span class="line-number">16</span>
                <span class="line-description">Tax (see instructions)</span>
                <span class="line-amount">${formatCurrency(taxResult.federalTax)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">17</span>
                <span class="line-description">Amount from Schedule 2</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">18</span>
                <span class="line-description">Add lines 16 and 17</span>
                <span class="line-amount">${formatCurrency(taxResult.federalTax)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">19</span>
                <span class="line-description">Child tax credit and credit for other dependents</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">20</span>
                <span class="line-description">Amount from Schedule 3</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">21</span>
                <span class="line-description">Add lines 19 and 20</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">22</span>
                <span class="line-description">Subtract line 21 from line 18</span>
                <span class="line-amount">${formatCurrency(taxResult.federalTax)}</span>
            </div>
        </div>

        <!-- Other Taxes -->
        <div class="section">
            <div class="section-title">Other Taxes</div>
            <div class="line-item">
                <span class="line-number">23</span>
                <span class="line-description">Amount from Schedule 2</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">24</span>
                <span class="line-description">Add lines 22 and 23. This is your total tax</span>
                <span class="line-amount">${formatCurrency(taxResult.federalTax)}</span>
            </div>
        </div>

        <!-- Payments -->
        <div class="section">
            <div class="section-title">Payments</div>
            <div class="line-item">
                <span class="line-number">25a</span>
                <span class="line-description">Federal income tax withheld</span>
                <span class="line-amount">${formatCurrency(paymentsData.federalWithholding)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">26</span>
                <span class="line-description">2025 estimated tax payments</span>
                <span class="line-amount">${formatCurrency(paymentsData.estimatedTaxPayments)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">27</span>
                <span class="line-description">Earned income credit (EIC)</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">28</span>
                <span class="line-description">Additional child tax credit</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">29</span>
                <span class="line-description">American opportunity credit</span>
                <span class="line-amount">$0.00</span>
            </div>
            <div class="line-item">
                <span class="line-number">30</span>
                <span class="line-description">Amount from Schedule 3</span>
                <span class="line-amount">${formatCurrency(paymentsData.priorYearOverpayment + paymentsData.otherPayments)}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">31</span>
                <span class="line-description">Add lines 25a through 30. These are your total payments</span>
                <span class="line-amount">${formatCurrency(taxResult.totalPayments)}</span>
            </div>
        </div>

        <!-- Refund or Amount You Owe -->
        <div class="section">
            <div class="section-title">Refund or Amount You Owe</div>
            ${taxResult.refundAmount > 0 ? `
            <div class="line-item total-line">
                <span class="line-number">32</span>
                <span class="line-description">If line 31 is more than line 24, subtract line 24 from line 31. This is the amount you overpaid</span>
                <span class="line-amount">${formatCurrency(taxResult.refundAmount)}</span>
            </div>
            <div class="line-item">
                <span class="line-number">33a</span>
                <span class="line-description">Amount of line 32 you want refunded to you</span>
                <span class="line-amount">${formatCurrency(taxResult.refundAmount)}</span>
            </div>
            ` : `
            <div class="line-item total-line">
                <span class="line-number">37</span>
                <span class="line-description">Amount you owe. Subtract line 31 from line 24</span>
                <span class="line-amount">${formatCurrency(taxResult.amountOwed)}</span>
            </div>
            `}
        </div>

        ${personalInfo.isMaryland ? `
        <!-- Maryland State Tax Summary -->
        <div class="section">
            <div class="section-title">Maryland State Tax Summary (Not part of Federal Form 1040)</div>
            <div class="line-item">
                <span class="line-description">Maryland State Income Tax</span>
                <span class="line-amount">${formatCurrency(taxResult.marylandTax)}</span>
            </div>
            <div class="line-item">
                <span class="line-description">Local Tax (${personalInfo.county})</span>
                <span class="line-amount">${formatCurrency(taxResult.localTax)}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-description">Total Maryland Tax</span>
                <span class="line-amount">${formatCurrency(taxResult.marylandTax + taxResult.localTax)}</span>
            </div>
        </div>
        ` : ''}

        <!-- Tax Summary -->
        <div class="section">
            <div class="section-title">Tax Summary</div>
            <div class="line-item">
                <span class="line-description">Federal Tax</span>
                <span class="line-amount">${formatCurrency(taxResult.federalTax)}</span>
            </div>
            ${personalInfo.isMaryland ? `
            <div class="line-item">
                <span class="line-description">Maryland State + Local Tax</span>
                <span class="line-amount">${formatCurrency(taxResult.marylandTax + taxResult.localTax)}</span>
            </div>
            ` : ''}
            <div class="line-item total-line">
                <span class="line-description">Total Tax Liability</span>
                <span class="line-amount">${formatCurrency(taxResult.totalTax)}</span>
            </div>
            <div class="line-item">
                <span class="line-description">Effective Tax Rate</span>
                <span class="line-amount">${formatPercentage(taxResult.effectiveRate)}</span>
            </div>
            <div class="line-item">
                <span class="line-description">After-Tax Income</span>
                <span class="line-amount">${formatCurrency(taxResult.afterTaxIncome)}</span>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <p><strong>Under penalties of perjury, I declare that I have examined this return and accompanying schedules and statements, and to the best of my knowledge and belief, they are true, correct, and complete.</strong></p>
            <br/>
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <span class="signature-line"></span><br/>
                    <small>Your signature</small>
                </div>
                <div>
                    <span class="signature-line"></span><br/>
                    <small>Date</small>
                </div>
                <div>
                    <span class="signature-line"></span><br/>
                    <small>Your occupation</small>
                </div>
            </div>
            <br/>
            <p style="text-align: center; margin-top: 30px;">
                <small>This form was generated by Tax Calculator Software on ${new Date().toLocaleDateString('en-US')}</small><br/>
                <small>This is for estimation purposes only. Use official IRS forms for actual filing.</small>
            </p>
        </div>
    </body>
    </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <MapPin className="h-6 w-6 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">US Federal & Maryland Tax Calculator 2025</h1>
          </div>
          <p className="text-gray-600">Calculate your 2025 federal and Maryland state income tax with updated rates and deductions</p>
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>2025 Tax Year Updates:</strong> Standard deductions increased - Single: $15,750, Married Joint: $31,500. 
                Federal tax rates remain 10%, 12%, 22%, 24%, 32%, 35%, and 37% with adjusted income thresholds.
                For estimation purposes only - consult a tax professional for actual filing.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-6 py-3 font-medium text-sm ${
                      activeTab === 'personal'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Info
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('income')}
                    className={`px-6 py-3 font-medium text-sm ${
                      activeTab === 'income'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Income
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-6 py-3 font-medium text-sm ${
                      activeTab === 'payments'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Payments
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('deductions')}
                    className={`px-6 py-3 font-medium text-sm ${
                      activeTab === 'deductions'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Deductions
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={personalInfo.firstName}
                          onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={personalInfo.lastName}
                          onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Social Security Number
                        </label>
                        <input
                          type="text"
                          value={personalInfo.ssn}
                          onChange={(e) => handlePersonalInfoChange('ssn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="XXX-XX-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filing Status
                        </label>
                        <select
                          value={personalInfo.filingStatus}
                          onChange={(e) => handlePersonalInfoChange('filingStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="single">Single</option>
                          <option value="marriedJointly">Married Filing Jointly</option>
                          <option value="marriedSeparately">Married Filing Separately</option>
                          <option value="headOfHousehold">Head of Household</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <input
                            type="checkbox"
                            checked={personalInfo.isMaryland}
                            onChange={(e) => handlePersonalInfoChange('isMaryland', e.target.checked)}
                            className="mr-2"
                          />
                          Maryland Resident
                        </label>
                      </div>
                      {personalInfo.isMaryland && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maryland County/City
                          </label>
                          <select
                            value={personalInfo.county}
                            onChange={(e) => handlePersonalInfoChange('county', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.keys(marylandCountyRates).map(county => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={personalInfo.address}
                          onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Dependents
                        </label>
                        <input
                          type="number"
                          value={personalInfo.dependents}
                          onChange={(e) => handlePersonalInfoChange('dependents', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'income' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wages, Salaries, Tips (W-2)
                        </label>
                        <input
                          type="number"
                          value={incomeData.wages}
                          onChange={(e) => handleIncomeChange('wages', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Income (1099-INT)
                        </label>
                        <input
                          type="number"
                          value={incomeData.interestIncome}
                          onChange={(e) => handleIncomeChange('interestIncome', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dividend Income (1099-DIV)
                        </label>
                        <input
                          type="number"
                          value={incomeData.dividends}
                          onChange={(e) => handleIncomeChange('dividends', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capital Gains
                        </label>
                        <input
                          type="number"
                          value={incomeData.capitalGains}
                          onChange={(e) => handleIncomeChange('capitalGains', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Income (Schedule C)
                        </label>
                        <input
                          type="number"
                          value={incomeData.businessIncome}
                          onChange={(e) => handleIncomeChange('businessIncome', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Income
                        </label>
                        <input
                          type="number"
                          value={incomeData.otherIncome}
                          onChange={(e) => handleIncomeChange('otherIncome', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Payments & Withholdings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Federal Income Tax Withheld (Form W-2, Box 2)
                        </label>
                        <input
                          type="number"
                          value={paymentsData.federalWithholding}
                          onChange={(e) => handlePaymentsChange('federalWithholding', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter amount from your W-2 form, box 2
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          2025 Estimated Tax Payments
                        </label>
                        <input
                          type="number"
                          value={paymentsData.estimatedTaxPayments}
                          onChange={(e) => handlePaymentsChange('estimatedTaxPayments', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Quarterly estimated tax payments made for 2025
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prior Year Overpayment Applied
                        </label>
                        <input
                          type="number"
                          value={paymentsData.priorYearOverpayment}
                          onChange={(e) => handlePaymentsChange('priorYearOverpayment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Refund from 2024 applied to 2025 tax
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Payments & Credits
                        </label>
                        <input
                          type="number"
                          value={paymentsData.otherPayments}
                          onChange={(e) => handlePaymentsChange('otherPayments', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Additional payments, credits, or withholdings
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <h4 className="font-semibold text-blue-900 mb-2">Payment Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Total Payments:</span>
                          <span className="font-semibold">
                            {formatCurrency(Object.values(paymentsData).reduce((sum, value) => sum + Number(value), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Federal Tax Owed:</span>
                          <span className="font-semibold">{formatCurrency(taxResult.federalTax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'deductions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
                    
                    {/* Standard vs Itemized */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-4 mb-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={deductions.useStandardDeduction}
                            onChange={() => handleDeductionChange('useStandardDeduction', true)}
                            className="mr-2"
                          />
                          Standard Deduction: {formatCurrency(deductions.standardDeduction)}
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!deductions.useStandardDeduction}
                            onChange={() => handleDeductionChange('useStandardDeduction', false)}
                            className="mr-2"
                          />
                          Itemize Deductions
                        </label>
                      </div>
                    </div>

                    {/* Itemized Deductions */}
                    {!deductions.useStandardDeduction && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mortgage Interest
                          </label>
                          <input
                            type="number"
                            value={deductions.mortgageInterest}
                            onChange={(e) => handleDeductionChange('mortgageInterest', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State and Local Taxes (SALT) - Max $10,000
                          </label>
                          <input
                            type="number"
                            value={deductions.stateLocalTaxes}
                            onChange={(e) => handleDeductionChange('stateLocalTaxes', Math.min(10000, e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            max="10000"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Charitable Contributions
                          </label>
                          <input
                            type="number"
                            value={deductions.charitableContributions}
                            onChange={(e) => handleDeductionChange('charitableContributions', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medical Expenses (above 7.5% AGI)
                          </label>
                          <input
                            type="number"
                            value={deductions.medicalExpenses}
                            onChange={(e) => handleDeductionChange('medicalExpenses', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Itemized Deductions
                          </label>
                          <input
                            type="number"
                            value={deductions.otherItemized}
                            onChange={(e) => handleDeductionChange('otherItemized', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Tax Calculation Results */}
          <div className="space-y-6">
            {/* Tax Calculation Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Tax Calculation (2025)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Adjusted Gross Income:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxResult.adjustedGrossIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Federal Taxable Income:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxResult.taxableIncome)}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Federal Tax:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(taxResult.federalTax)}
                  </span>
                </div>
                {personalInfo.isMaryland && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">Maryland State Tax:</span>
                      <span className="font-bold text-yellow-600">
                        {formatCurrency(taxResult.marylandTax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600">Local Tax ({personalInfo.county}):</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(taxResult.localTax)}
                      </span>
                    </div>
                  </>
                )}
                <hr className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Total Tax Owed:</span>
                  <span className="font-bold text-red-600 text-lg">
                    {formatCurrency(taxResult.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Total Payments:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(taxResult.totalPayments)}
                  </span>
                </div>
                <hr className="my-3" />
                {taxResult.refundAmount > 0 ? (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                    <span className="text-sm text-green-700 font-semibold">💰 Refund Amount:</span>
                    <span className="font-bold text-green-700 text-xl">
                      {formatCurrency(taxResult.refundAmount)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                    <span className="text-sm text-red-700 font-semibold">💸 Amount You Owe:</span>
                    <span className="font-bold text-red-700 text-xl">
                      {formatCurrency(taxResult.amountOwed)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">Effective Tax Rate:</span>
                  <span className="font-semibold text-orange-600">
                    {formatPercentage(taxResult.effectiveRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Marginal Tax Rate:</span>
                  <span className="font-semibold text-indigo-600">
                    {formatPercentage(taxResult.marginalRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">After-Tax Income:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(taxResult.afterTaxIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={exportToPDF}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export Form 1040 PDF
                </button>
                <button
                  onClick={exportTaxReturn}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Tax Data (JSON)
                </button>
                <button
                  onClick={calculateTax}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Recalculate
                </button>
              </div>
            </div>

            {/* Federal Tax Bracket Reference */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Federal Tax Brackets</h3>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2 font-semibold border-b pb-1">
                  <span>Taxable Income</span>
                  <span>Rate</span>
                </div>
                {federalTaxBrackets[personalInfo.filingStatus]?.map((bracket, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 text-gray-600">
                    <span>
                      {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                    </span>
                    <span>{formatPercentage(bracket.rate)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maryland Tax Info */}
            {personalInfo.isMaryland && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-600" />
                  Maryland Tax Info
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>State Tax Rate Range:</span>
                    <span>2% - 5.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Tax Rate ({personalInfo.county}):</span>
                    <span>{formatPercentage(marylandCountyRates[personalInfo.county] || 0.032)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MD Standard Deduction:</span>
                    <span>{formatCurrency(personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filing Status Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Standard Deduction</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Single:</span>
                  <span>{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Married Filing Jointly:</span>
                  <span>{formatCurrency(31500)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Married Filing Separately:</span>
                  <span>{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Head of Household:</span>
                  <span>{formatCurrency(23625)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}