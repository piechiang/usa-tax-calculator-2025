/**
 * 2025年IRS税务常量和参数
 * 
 * 数据来源: Rev. Proc. 2024-40 (2025年度通胀调整)
 * 最后更新: 2024年12月
 * 最后校验: 2025年1月
 * 
 * 注意: 
 * - 所有金额单位为美元
 * - 税率以小数形式表示 (例如: 0.10 = 10%)
 * - 收入阈值适用于税年2025年
 */

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface FilingStatus {
  single: number;
  marriedFilingJointly: number;
  marriedFilingSeparately: number;
  headOfHousehold: number;
}

export interface IRSConstants2025 {
  // 标准扣除额 (Rev. Proc. 2024-40, Section 3.01)
  standardDeductions: FilingStatus;
  
  // 个人免税额 (2025年仍为$0, TCJA期间暂停)
  personalExemption: number;
  
  // 联邦所得税税率表 (Rev. Proc. 2024-40, Section 3.02)
  taxBrackets: {
    single: TaxBracket[];
    marriedFilingJointly: TaxBracket[];
    marriedFilingSeparately: TaxBracket[];
    headOfHousehold: TaxBracket[];
  };
  
  // 社会保险税 (Social Security Tax)
  socialSecurity: {
    employeeRate: number;  // 6.2%
    employerRate: number;  // 6.2%
    wageBase: number;      // 2025年工资基数上限
  };
  
  // 医疗保险税 (Medicare Tax)
  medicare: {
    employeeRate: number;  // 1.45%
    employerRate: number;  // 1.45%
    additionalRate: number; // 0.9% (高收入附加税)
    additionalThreshold: FilingStatus; // 附加税起征点
  };
  
  // 自雇税 (Self-Employment Tax)
  selfEmploymentTax: {
    socialSecurityRate: number; // 12.4%
    medicareRate: number;       // 2.9%
    wageBase: number;          // 社会保险税基数上限
    netEarningsMultiplier: number; // 0.9235 (扣除雇主部分)
  };
  
  // 替代最低税 (Alternative Minimum Tax)
  amt: {
    exemption: FilingStatus;
    phaseoutThreshold: FilingStatus;
    phaseoutRate: number; // 25%
    taxRates: {
      lower: number; // 26%
      upper: number; // 28%
      threshold: number; // 分界点
    };
  };
  
  // 净投资收入税 (Net Investment Income Tax)
  niit: {
    rate: number; // 3.8%
    threshold: FilingStatus;
  };
  
  // 儿童税收抵免 (Child Tax Credit)
  childTaxCredit: {
    maxCredit: number; // $2,000 per child
    refundableLimit: number; // $1,700 (Additional CTC)
    phaseoutThreshold: FilingStatus;
    phaseoutRate: number; // $50 per $1,000 over threshold
    qualifyingAge: number; // Under 17
  };
  
  // 劳动所得税收抵免 (Earned Income Tax Credit)
  eitc: {
    maxCredits: {
      noChildren: number;
      oneChild: number;
      twoChildren: number;
      threeOrMoreChildren: number;
    };
    incomeThresholds: {
      single: {
        noChildren: { phaseIn: number; max: number; phaseOut: number; };
        oneChild: { phaseIn: number; max: number; phaseOut: number; };
        twoChildren: { phaseIn: number; max: number; phaseOut: number; };
        threeOrMoreChildren: { phaseIn: number; max: number; phaseOut: number; };
      };
      married: {
        noChildren: { phaseIn: number; max: number; phaseOut: number; };
        oneChild: { phaseIn: number; max: number; phaseOut: number; };
        twoChildren: { phaseIn: number; max: number; phaseOut: number; };
        threeOrMoreChildren: { phaseIn: number; max: number; phaseOut: number; };
      };
    };
    phaseInRates: {
      noChildren: number;      // 7.65%
      oneChild: number;        // 34%
      twoChildren: number;     // 40%
      threeOrMoreChildren: number; // 45%
    };
    phaseOutRates: {
      noChildren: number;      // 7.65%
      oneChild: number;        // 15.98%
      twoChildren: number;     // 21.06%
      threeOrMoreChildren: number; // 21.06%
    };
  };
  
  // 教育抵免
  educationCredits: {
    // 美国机会税收抵免 (American Opportunity Tax Credit)
    aotc: {
      maxCredit: number; // $2,500
      qualifiedExpensesRate: number; // 100% first $2,000, 25% next $2,000
      refundablePercentage: number; // 40%
      phaseoutThreshold: FilingStatus;
      phaseoutRange: number; // $10,000
      maxYears: number; // 4 years
    };
    
    // 终身学习抵免 (Lifetime Learning Credit)
    llc: {
      maxCredit: number; // $2,000
      qualifiedExpensesRate: number; // 20%
      phaseoutThreshold: FilingStatus;
      phaseoutRange: number; // $10,000
    };
  };
  
  // 退休账户限额
  retirementLimits: {
    // 传统和Roth IRA
    ira: {
      contributionLimit: number; // $7,000
      catchUpContribution: number; // $1,000 (age 50+)
      deductibilityPhaseout: {
        single: { start: number; end: number; };
        married: { start: number; end: number; };
        marriedSeparate: { start: number; end: number; };
      };
      rothPhaseout: {
        single: { start: number; end: number; };
        married: { start: number; end: number; };
        marriedSeparate: { start: number; end: number; };
      };
    };
    
    // 401(k) 计划
    plan401k: {
      employeeContribution: number; // $23,500
      catchUpContribution: number; // $7,500 (age 50+)
      totalContribution: number; // $70,000 (or $77,500 with catch-up)
      compensationLimit: number; // $350,000
      keyEmployeeLimit: number; // $155,000
    };
    
    // HSA (Health Savings Account)
    hsa: {
      selfOnlyContribution: number; // $4,150
      familyContribution: number; // $8,300
      catchUpContribution: number; // $1,000 (age 55+)
      minDeductible: {
        selfOnly: number; // $1,650
        family: number; // $3,300
      };
      maxOutOfPocket: {
        selfOnly: number; // $8,250
        family: number; // $16,500
      };
    };
  };
  
  // 其他重要阈值
  thresholds: {
    // 社会保险福利征税阈值
    socialSecurityTaxation: {
      single: { first: number; second: number; }; // $25,000, $34,000
      married: { first: number; second: number; }; // $32,000, $44,000
    };
    
    // 资本利得税优惠税率阈值
    capitalGains: {
      zeroPercent: FilingStatus; // 0% tax rate thresholds
      fifteenPercent: FilingStatus; // 15% tax rate thresholds
      // Above these thresholds: 20% + 3.8% NIIT
    };
    
    // 学生贷款利息扣除
    studentLoanInterest: {
      maxDeduction: number; // $2,500
      phaseoutThreshold: FilingStatus;
      phaseoutRange: number; // $15,000
    };
    
    // 州和地方税扣除限额 (SALT)
    saltDeductionLimit: number; // $10,000
    
    // 住房贷款利息扣除限额
    mortgageInterestLimit: {
      acquisitionDebt: number; // $750,000
      homeEquityDebt: number; // $100,000 (if used for home improvement)
    };
  };
}

/**
 * 2025年IRS常量数据
 * 基于Rev. Proc. 2024-40的通胀调整
 */
export const IRS_CONSTANTS_2025: IRSConstants2025 = {
  // 标准扣除额
  standardDeductions: {
    single: 15000,
    marriedFilingJointly: 30000,
    marriedFilingSeparately: 15000,
    headOfHousehold: 22500
  },
  
  // 个人免税额 (TCJA期间暂停)
  personalExemption: 0,
  
  // 联邦所得税税率表
  taxBrackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 }
    ],
    marriedFilingJointly: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: null, rate: 0.37 }
    ],
    marriedFilingSeparately: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 375800, rate: 0.35 },
      { min: 375800, max: null, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 }
    ]
  },
  
  // 社会保险税
  socialSecurity: {
    employeeRate: 0.062,
    employerRate: 0.062,
    wageBase: 174900 // 2025年预估，实际数据将在2024年10月发布
  },
  
  // 医疗保险税
  medicare: {
    employeeRate: 0.0145,
    employerRate: 0.0145,
    additionalRate: 0.009,
    additionalThreshold: {
      single: 200000,
      marriedFilingJointly: 250000,
      marriedFilingSeparately: 125000,
      headOfHousehold: 200000
    }
  },
  
  // 自雇税
  selfEmploymentTax: {
    socialSecurityRate: 0.124,
    medicareRate: 0.029,
    wageBase: 174900,
    netEarningsMultiplier: 0.9235
  },
  
  // 替代最低税
  amt: {
    exemption: {
      single: 85700,
      marriedFilingJointly: 133300,
      marriedFilingSeparately: 66650,
      headOfHousehold: 85700
    },
    phaseoutThreshold: {
      single: 609350,
      marriedFilingJointly: 1218700,
      marriedFilingSeparately: 609350,
      headOfHousehold: 609350
    },
    phaseoutRate: 0.25,
    taxRates: {
      lower: 0.26,
      upper: 0.28,
      threshold: 220700
    }
  },
  
  // 净投资收入税
  niit: {
    rate: 0.038,
    threshold: {
      single: 200000,
      marriedFilingJointly: 250000,
      marriedFilingSeparately: 125000,
      headOfHousehold: 200000
    }
  },
  
  // 儿童税收抵免
  childTaxCredit: {
    maxCredit: 2000,
    refundableLimit: 1700,
    phaseoutThreshold: {
      single: 200000,
      marriedFilingJointly: 400000,
      marriedFilingSeparately: 200000,
      headOfHousehold: 200000
    },
    phaseoutRate: 0.05, // $50 per $1000
    qualifyingAge: 17
  },
  
  // EITC (2025年数据，基于通胀调整)
  eitc: {
    maxCredits: {
      noChildren: 649,
      oneChild: 4328,
      twoChildren: 7152,
      threeOrMoreChildren: 8046
    },
    incomeThresholds: {
      single: {
        noChildren: { phaseIn: 8490, max: 10830, phaseOut: 17640 },
        oneChild: { phaseIn: 12730, max: 12730, phaseOut: 46560 },
        twoChildren: { phaseIn: 17890, max: 17890, phaseOut: 52918 },
        threeOrMoreChildren: { phaseIn: 17890, max: 17890, phaseOut: 56838 }
      },
      married: {
        noChildren: { phaseIn: 8490, max: 16480, phaseOut: 23290 },
        oneChild: { phaseIn: 12730, max: 18380, phaseOut: 52210 },
        twoChildren: { phaseIn: 17890, max: 23540, phaseOut: 58568 },
        threeOrMoreChildren: { phaseIn: 17890, max: 23540, phaseOut: 62488 }
      }
    },
    phaseInRates: {
      noChildren: 0.0765,
      oneChild: 0.34,
      twoChildren: 0.40,
      threeOrMoreChildren: 0.45
    },
    phaseOutRates: {
      noChildren: 0.0765,
      oneChild: 0.1598,
      twoChildren: 0.2106,
      threeOrMoreChildren: 0.2106
    }
  },
  
  // 教育抵免
  educationCredits: {
    aotc: {
      maxCredit: 2500,
      qualifiedExpensesRate: 1.0, // 100% first $2000, then 25% next $2000
      refundablePercentage: 0.40,
      phaseoutThreshold: {
        single: 80000,
        marriedFilingJointly: 160000,
        marriedFilingSeparately: 80000,
        headOfHousehold: 80000
      },
      phaseoutRange: 10000,
      maxYears: 4
    },
    llc: {
      maxCredit: 2000,
      qualifiedExpensesRate: 0.20,
      phaseoutThreshold: {
        single: 80000,
        marriedFilingJointly: 160000,
        marriedFilingSeparately: 80000,
        headOfHousehold: 80000
      },
      phaseoutRange: 10000
    }
  },
  
  // 退休账户限额
  retirementLimits: {
    ira: {
      contributionLimit: 7000,
      catchUpContribution: 1000,
      deductibilityPhaseout: {
        single: { start: 77000, end: 87000 },
        married: { start: 123000, end: 143000 },
        marriedSeparate: { start: 0, end: 10000 }
      },
      rothPhaseout: {
        single: { start: 138000, end: 153000 },
        married: { start: 218000, end: 228000 },
        marriedSeparate: { start: 0, end: 10000 }
      }
    },
    plan401k: {
      employeeContribution: 23500,
      catchUpContribution: 7500,
      totalContribution: 70000,
      compensationLimit: 350000,
      keyEmployeeLimit: 155000
    },
    hsa: {
      selfOnlyContribution: 4150,
      familyContribution: 8300,
      catchUpContribution: 1000,
      minDeductible: {
        selfOnly: 1650,
        family: 3300
      },
      maxOutOfPocket: {
        selfOnly: 8250,
        family: 16500
      }
    }
  },
  
  // 其他阈值
  thresholds: {
    socialSecurityTaxation: {
      single: { first: 25000, second: 34000 },
      married: { first: 32000, second: 44000 }
    },
    capitalGains: {
      zeroPercent: {
        single: 48475,
        marriedFilingJointly: 96950,
        marriedFilingSeparately: 48475,
        headOfHousehold: 64850
      },
      fifteenPercent: {
        single: 533400,
        marriedFilingJointly: 600050,
        marriedFilingSeparately: 300025,
        headOfHousehold: 566700
      }
    },
    studentLoanInterest: {
      maxDeduction: 2500,
      phaseoutThreshold: {
        single: 75000,
        marriedFilingJointly: 155000,
        marriedFilingSeparately: 75000,
        headOfHousehold: 75000
      },
      phaseoutRange: 15000
    },
    saltDeductionLimit: 10000,
    mortgageInterestLimit: {
      acquisitionDebt: 750000,
      homeEquityDebt: 100000
    }
  }
};

/**
 * 获取指定报税身份的税率表
 */
export function getTaxBrackets(filingStatus: keyof FilingStatus): TaxBracket[] {
  const statusMap = {
    single: 'single',
    marriedFilingJointly: 'marriedFilingJointly',
    marriedFilingSeparately: 'marriedFilingSeparately',
    headOfHousehold: 'headOfHousehold'
  } as const;
  
  return IRS_CONSTANTS_2025.taxBrackets[statusMap[filingStatus]];
}

/**
 * 获取指定报税身份的标准扣除额
 */
export function getStandardDeduction(filingStatus: keyof FilingStatus): number {
  return IRS_CONSTANTS_2025.standardDeductions[filingStatus];
}

/**
 * 计算联邦所得税
 */
export function calculateFederalIncomeTax(taxableIncome: number, filingStatus: keyof FilingStatus): number {
  const brackets = getTaxBrackets(filingStatus);
  let tax = 0;
  
  for (const bracket of brackets) {
    const min = bracket.min;
    const max = bracket.max ?? Infinity;
    
    if (taxableIncome <= min) break;
    
    const taxableInThisBracket = Math.min(taxableIncome, max) - min;
    tax += taxableInThisBracket * bracket.rate;
  }
  
  return Math.round(tax);
}

/**
 * 检查是否需要缴纳净投资收入税
 */
export function isSubjectToNIIT(adjustedGrossIncome: number, filingStatus: keyof FilingStatus): boolean {
  return adjustedGrossIncome > IRS_CONSTANTS_2025.niit.threshold[filingStatus];
}

/**
 * 计算净投资收入税
 */
export function calculateNIIT(netInvestmentIncome: number, adjustedGrossIncome: number, filingStatus: keyof FilingStatus): number {
  if (!isSubjectToNIIT(adjustedGrossIncome, filingStatus)) {
    return 0;
  }
  
  const threshold = IRS_CONSTANTS_2025.niit.threshold[filingStatus];
  const excessIncome = adjustedGrossIncome - threshold;
  const taxableAmount = Math.min(netInvestmentIncome, excessIncome);
  
  return Math.round(taxableAmount * IRS_CONSTANTS_2025.niit.rate);
}

export default IRS_CONSTANTS_2025;