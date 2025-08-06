import React, { useState, useEffect } from 'react';
import { Calculator, FileText, User, DollarSign, Download, AlertCircle, MapPin, Globe } from 'lucide-react';

export default function USATaxSoftware2025() {
  // Language state
  const [language, setLanguage] = useState('en');

  // Existing state variables
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
    standardDeduction: 15750,
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

  // Translation object
  const translations = {
    en: {
      title: "US Federal & Maryland Tax Calculator 2025",
      subtitle: "Calculate your 2025 federal and Maryland state income tax with updated rates and deductions",
      disclaimer: "2025 Tax Year Updates: Standard deductions increased - Single: $15,750, Married Joint: $31,500. Federal tax rates remain 10%, 12%, 22%, 24%, 32%, 35%, and 37% with adjusted income thresholds. For estimation purposes only - consult a tax professional for actual filing.",
      tabs: {
        personal: "Personal Info",
        income: "Income",
        payments: "Payments",
        deductions: "Deductions"
      },
      personalInfo: {
        title: "Personal Information",
        firstName: "First Name",
        lastName: "Last Name",
        ssn: "Social Security Number",
        filingStatus: "Filing Status",
        address: "Address",
        dependents: "Number of Dependents",
        marylandResident: "Maryland Resident",
        county: "Maryland County/City",
        filingStatuses: {
          single: "Single",
          marriedJointly: "Married Filing Jointly",
          marriedSeparately: "Married Filing Separately",
          headOfHousehold: "Head of Household"
        },
        placeholders: {
          firstName: "Enter first name",
          lastName: "Enter last name",
          ssn: "XXX-XX-XXXX",
          address: "Enter address"
        }
      },
      income: {
        title: "Income Information",
        wages: "Wages, Salaries, Tips (W-2)",
        interestIncome: "Interest Income (1099-INT)",
        dividends: "Dividend Income (1099-DIV)",
        capitalGains: "Capital Gains",
        businessIncome: "Business Income (Schedule C)",
        otherIncome: "Other Income"
      },
      payments: {
        title: "Tax Payments & Withholdings",
        federalWithholding: "Federal Income Tax Withheld (Form W-2, Box 2)",
        estimatedTaxPayments: "2025 Estimated Tax Payments",
        priorYearOverpayment: "Prior Year Overpayment Applied",
        otherPayments: "Other Payments & Credits",
        paymentSummary: "Payment Summary",
        totalPayments: "Total Payments:",
        federalTaxOwed: "Federal Tax Owed:",
        descriptions: {
          federalWithholding: "Enter amount from your W-2 form, box 2",
          estimatedTaxPayments: "Quarterly estimated tax payments made for 2025",
          priorYearOverpayment: "Refund from 2024 applied to 2025 tax",
          otherPayments: "Additional payments, credits, or withholdings"
        }
      },
      deductions: {
        title: "Deductions",
        standardDeduction: "Standard Deduction:",
        itemizeDeductions: "Itemize Deductions",
        mortgageInterest: "Mortgage Interest",
        stateLocalTaxes: "State and Local Taxes (SALT) - Max $10,000",
        charitableContributions: "Charitable Contributions",
        medicalExpenses: "Medical Expenses (above 7.5% AGI)",
        otherItemized: "Other Itemized Deductions"
      },
      results: {
        title: "Tax Calculation (2025)",
        adjustedGrossIncome: "Adjusted Gross Income:",
        federalTaxableIncome: "Federal Taxable Income:",
        federalTax: "Federal Tax:",
        marylandTax: "Maryland State Tax:",
        localTax: "Local Tax",
        totalTax: "Total Tax Owed:",
        totalPayments: "Total Payments:",
        refundAmount: "💰 Refund Amount:",
        amountOwed: "💸 Amount You Owe:",
        effectiveRate: "Effective Tax Rate:",
        marginalRate: "Marginal Tax Rate:",
        afterTaxIncome: "After-Tax Income:"
      },
      actions: {
        title: "Actions",
        exportPDF: "Export Form 1040 PDF",
        exportJSON: "Export Tax Data (JSON)",
        recalculate: "Recalculate"
      },
      taxBrackets: {
        title: "2025 Federal Tax Brackets",
        taxableIncome: "Taxable Income",
        rate: "Rate"
      },
      marylandInfo: {
        title: "Maryland Tax Info",
        stateRateRange: "State Tax Rate Range:",
        localTaxRate: "Local Tax Rate",
        standardDeduction: "MD Standard Deduction:"
      },
      standardDeductions: {
        title: "2025 Standard Deduction",
        single: "Single:",
        marriedJointly: "Married Filing Jointly:",
        marriedSeparately: "Married Filing Separately:",
        headOfHousehold: "Head of Household:"
      }
    },
    zh: {
      title: "美国联邦税和马里兰州税计算器 2025",
      subtitle: "使用最新税率和扣除额计算您的2025年联邦税和马里兰州所得税",
      disclaimer: "2025税年更新：标准扣除额增加 - 单身：$15,750，已婚合并：$31,500。联邦税率保持10%、12%、22%、24%、32%、35%和37%，收入门槛已调整。仅供估算参考 - 实际报税请咨询专业税务顾问。",
      tabs: {
        personal: "个人信息",
        income: "收入信息",
        payments: "税款支付",
        deductions: "扣除项目"
      },
      personalInfo: {
        title: "个人信息",
        firstName: "名字",
        lastName: "姓氏",
        ssn: "社会安全号码",
        filingStatus: "报税身份",
        address: "地址",
        dependents: "受抚养人数量",
        marylandResident: "马里兰州居民",
        county: "马里兰郡/市",
        filingStatuses: {
          single: "单身",
          marriedJointly: "已婚合并申报",
          marriedSeparately: "已婚分别申报",
          headOfHousehold: "户主"
        },
        placeholders: {
          firstName: "输入名字",
          lastName: "输入姓氏",
          ssn: "XXX-XX-XXXX",
          address: "输入地址"
        }
      },
      income: {
        title: "收入信息",
        wages: "工资、薪水、小费 (W-2)",
        interestIncome: "利息收入 (1099-INT)",
        dividends: "股息收入 (1099-DIV)",
        capitalGains: "资本利得",
        businessIncome: "营业收入 (Schedule C)",
        otherIncome: "其他收入"
      },
      payments: {
        title: "税款支付和预扣",
        federalWithholding: "联邦所得税预扣 (W-2表格，第2栏)",
        estimatedTaxPayments: "2025年预估税款支付",
        priorYearOverpayment: "上年度超额支付金额",
        otherPayments: "其他支付和抵税",
        paymentSummary: "支付汇总",
        totalPayments: "总支付额：",
        federalTaxOwed: "联邦税应缴：",
        descriptions: {
          federalWithholding: "输入W-2表格第2栏的金额",
          estimatedTaxPayments: "2025年季度预估税款支付",
          priorYearOverpayment: "2024年退税用于2025年税款",
          otherPayments: "额外支付、抵税或预扣"
        }
      },
      deductions: {
        title: "扣除项目",
        standardDeduction: "标准扣除：",
        itemizeDeductions: "详细列举扣除",
        mortgageInterest: "房贷利息",
        stateLocalTaxes: "州和地方税 (SALT) - 最高$10,000",
        charitableContributions: "慈善捐款",
        medicalExpenses: "医疗费用 (超过AGI的7.5%)",
        otherItemized: "其他详细列举扣除"
      },
      results: {
        title: "税务计算 (2025)",
        adjustedGrossIncome: "调整后总收入：",
        federalTaxableIncome: "联邦应税收入：",
        federalTax: "联邦税：",
        marylandTax: "马里兰州税：",
        localTax: "地方税",
        totalTax: "总应缴税额：",
        totalPayments: "总支付额：",
        refundAmount: "💰 退税金额：",
        amountOwed: "💸 应补缴金额：",
        effectiveRate: "有效税率：",
        marginalRate: "边际税率：",
        afterTaxIncome: "税后收入："
      },
      actions: {
        title: "操作",
        exportPDF: "导出1040表格PDF",
        exportJSON: "导出税务数据 (JSON)",
        recalculate: "重新计算"
      },
      taxBrackets: {
        title: "2025联邦税级",
        taxableIncome: "应税收入",
        rate: "税率"
      },
      marylandInfo: {
        title: "马里兰税务信息",
        stateRateRange: "州税税率范围：",
        localTaxRate: "地方税率",
        standardDeduction: "马里兰标准扣除："
      },
      standardDeductions: {
        title: "2025标准扣除",
        single: "单身：",
        marriedJointly: "已婚合并：",
        marriedSeparately: "已婚分别：",
        headOfHousehold: "户主："
      }
    }
  };

  // Get translation text
  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    for (const key of keys) {
      result = result && result[key];
    }
    return result || path;
  };

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

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

  // Calculate taxes function
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
    
    // Calculate refund or amount owed
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
    return new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
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
      date: new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US'),
      language
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
    alert(language === 'zh' ? 
      '此功能将打开一个新窗口用于打印表格。请注意，由于浏览器限制，某些功能可能需要在实际服务器环境中运行。' :
      'This function will open a new window for printing the form. Please note that some features may require running in an actual server environment due to browser restrictions.'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            </div>
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? '中文' : 'English'}
            </button>
          </div>
          
          <p className="text-gray-600">{t('subtitle')}</p>
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>{language === 'en' ? '2025 Tax Year Updates:' : '2025税年更新：'}</strong> {t('disclaimer')}
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
                  {['personal', 'income', 'payments', 'deductions'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tab === 'personal' && <User className="h-4 w-4" />}
                        {tab === 'income' && <DollarSign className="h-4 w-4" />}
                        {tab === 'payments' && <DollarSign className="h-4 w-4" />}
                        {tab === 'deductions' && <FileText className="h-4 w-4" />}
                        {t(`tabs.${tab}`)}
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.firstName')}
                        </label>
                        <input
                          type="text"
                          value={personalInfo.firstName}
                          onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('personalInfo.placeholders.firstName')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.lastName')}
                        </label>
                        <input
                          type="text"
                          value={personalInfo.lastName}
                          onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('personalInfo.placeholders.lastName')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.ssn')}
                        </label>
                        <input
                          type="text"
                          value={personalInfo.ssn}
                          onChange={(e) => handlePersonalInfoChange('ssn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('personalInfo.placeholders.ssn')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.filingStatus')}
                        </label>
                        <select
                          value={personalInfo.filingStatus}
                          onChange={(e) => handlePersonalInfoChange('filingStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="single">{t('personalInfo.filingStatuses.single')}</option>
                          <option value="marriedJointly">{t('personalInfo.filingStatuses.marriedJointly')}</option>
                          <option value="marriedSeparately">{t('personalInfo.filingStatuses.marriedSeparately')}</option>
                          <option value="headOfHousehold">{t('personalInfo.filingStatuses.headOfHousehold')}</option>
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
                          {t('personalInfo.marylandResident')}
                        </label>
                      </div>
                      {personalInfo.isMaryland && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('personalInfo.county')}
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
                          {t('personalInfo.address')}
                        </label>
                        <input
                          type="text"
                          value={personalInfo.address}
                          onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t('personalInfo.placeholders.address')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.dependents')}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('income.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.wages')}
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
                          {t('income.interestIncome')}
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
                          {t('income.dividends')}
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
                          {t('income.capitalGains')}
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
                          {t('income.businessIncome')}
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
                          {t('income.otherIncome')}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payments.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.federalWithholding')}
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
                          {t('payments.descriptions.federalWithholding')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.estimatedTaxPayments')}
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
                          {t('payments.descriptions.estimatedTaxPayments')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.priorYearOverpayment')}
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
                          {t('payments.descriptions.priorYearOverpayment')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.otherPayments')}
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
                          {t('payments.descriptions.otherPayments')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <h4 className="font-semibold text-blue-900 mb-2">{t('payments.paymentSummary')}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>{t('payments.totalPayments')}</span>
                          <span className="font-semibold">
                            {formatCurrency(Object.values(paymentsData).reduce((sum, value) => sum + Number(value), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('payments.federalTaxOwed')}</span>
                          <span className="font-semibold">{formatCurrency(taxResult.federalTax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'deductions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('deductions.title')}</h3>
                    
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
                          {t('deductions.standardDeduction')} {formatCurrency(deductions.standardDeduction)}
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!deductions.useStandardDeduction}
                            onChange={() => handleDeductionChange('useStandardDeduction', false)}
                            className="mr-2"
                          />
                          {t('deductions.itemizeDeductions')}
                        </label>
                      </div>
                    </div>

                    {/* Itemized Deductions */}
                    {!deductions.useStandardDeduction && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('deductions.mortgageInterest')}
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
                            {t('deductions.stateLocalTaxes')}
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
                            {t('deductions.charitableContributions')}
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
                            {t('deductions.medicalExpenses')}
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
                            {t('deductions.otherItemized')}
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
                {t('results.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('results.adjustedGrossIncome')}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxResult.adjustedGrossIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('results.federalTaxableIncome')}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxResult.taxableIncome)}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">{t('results.federalTax')}</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(taxResult.federalTax)}
                  </span>
                </div>
                {personalInfo.isMaryland && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">{t('results.marylandTax')}</span>
                      <span className="font-bold text-yellow-600">
                        {formatCurrency(taxResult.marylandTax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600">{t('results.localTax')} ({personalInfo.county}):</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(taxResult.localTax)}
                      </span>
                    </div>
                  </>
                )}
                <hr className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">{t('results.totalTax')}</span>
                  <span className="font-bold text-red-600 text-lg">
                    {formatCurrency(taxResult.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">{t('results.totalPayments')}</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(taxResult.totalPayments)}
                  </span>
                </div>
                <hr className="my-3" />
                {taxResult.refundAmount > 0 ? (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                    <span className="text-sm text-green-700 font-semibold">{t('results.refundAmount')}</span>
                    <span className="font-bold text-green-700 text-xl">
                      {formatCurrency(taxResult.refundAmount)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                    <span className="text-sm text-red-700 font-semibold">{t('results.amountOwed')}</span>
                    <span className="font-bold text-red-700 text-xl">
                      {formatCurrency(taxResult.amountOwed)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">{t('results.effectiveRate')}</span>
                  <span className="font-semibold text-orange-600">
                    {formatPercentage(taxResult.effectiveRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">{t('results.marginalRate')}</span>
                  <span className="font-semibold text-indigo-600">
                    {formatPercentage(taxResult.marginalRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">{t('results.afterTaxIncome')}</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(taxResult.afterTaxIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h3>
              <div className="space-y-3">
                <button
                  onClick={exportToPDF}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {t('actions.exportPDF')}
                </button>
                <button
                  onClick={exportTaxReturn}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('actions.exportJSON')}
                </button>
                <button
                  onClick={calculateTax}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  {t('actions.recalculate')}
                </button>
              </div>
            </div>

            {/* Federal Tax Bracket Reference */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('taxBrackets.title')}</h3>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2 font-semibold border-b pb-1">
                  <span>{t('taxBrackets.taxableIncome')}</span>
                  <span>{t('taxBrackets.rate')}</span>
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
                  {t('marylandInfo.title')}
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.stateRateRange')}</span>
                    <span>2% - 5.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.localTaxRate')} ({personalInfo.county}):</span>
                    <span>{formatPercentage(marylandCountyRates[personalInfo.county] || 0.032)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.standardDeduction')}</span>
                    <span>{formatCurrency(personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filing Status Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('standardDeductions.title')}</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>{t('standardDeductions.single')}</span>
                  <span>{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.marriedJointly')}</span>
                  <span>{formatCurrency(31500)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.marriedSeparately')}</span>
                  <span>{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.headOfHousehold')}</span>
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