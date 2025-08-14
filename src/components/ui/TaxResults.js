import React, { useState } from 'react';
import { Calculator, Download, DollarSign, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const TaxResults = ({ 
  taxResult, 
  language, 
  t,
  onExportPDF,
  onExportJSON,
  onRecalculate,
  calculationDetails = null  // New prop for detailed calculation steps
}) => {
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const isRefund = taxResult.balance > 0;
  const amount = Math.abs(taxResult.balance);

  // Create 1040 line reconciliation data
  const lineReconciliation = createLineReconciliation(taxResult, calculationDetails);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('results.title')}</h3>
      
      {/* Main Results Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.adjustedGrossIncome')}</span>
            <span className="font-semibold">{formatCurrency(taxResult.adjustedGrossIncome)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.federalTaxableIncome')}</span>
            <span className="font-semibold">{formatCurrency(taxResult.taxableIncome)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.federalTax')}</span>
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.federalTax)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.marylandTax')}</span>
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.marylandTax)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.localTax')}</span>
            <span className="font-semibold text-red-600">{formatCurrency(taxResult.localTax)}</span>
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-semibold">{t('results.totalTax')}</span>
            <span className="font-bold text-red-600">{formatCurrency(taxResult.totalTax)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">{t('results.totalPayments')}</span>
            <span className="font-semibold text-green-600">{formatCurrency(taxResult.totalPayments)}</span>
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-semibold">
              {isRefund ? t('results.refundAmount') : t('results.amountOwed')}
            </span>
            <span className={`font-bold text-lg ${isRefund ? 'text-green-600' : 'text-red-600'}`}>
              {isRefund ? t('results.refundAmount') : t('results.amountOwed')} {formatCurrency(amount)}
            </span>
          </div>
        </div>
        
        {/* Additional Tax Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-600">{t('results.effectiveRate')}</div>
              <div className="font-semibold text-blue-600">
                {formatPercentage(taxResult.effectiveRate)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-600">{t('results.marginalRate')}</div>
              <div className="font-semibold text-purple-600">
                {/* This would need to be calculated based on the tax bracket */}
                {formatPercentage(0.24)} {/* Placeholder */}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-600">{t('results.afterTaxIncome')}</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(taxResult.afterTaxIncome)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1040 Line Number Reconciliation */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              {language === 'zh' ? '1040表格行号对账' : '1040 Line Number Reconciliation'}
            </h4>
            <div className="relative group">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-6 left-0 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {language === 'zh' ? '查看计算如何对应到1040表格各行' : 'See how calculations map to 1040 form lines'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
          >
            {showLineNumbers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showLineNumbers ? 
              (language === 'zh' ? '隐藏详情' : 'Hide Details') : 
              (language === 'zh' ? '显示详情' : 'Show Details')
            }
          </button>
        </div>

        {showLineNumbers && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {language === 'zh' ? '说明' : 'Explanation'}
                </span>
              </div>
              <p>
                {language === 'zh' 
                  ? '以下表格显示了您的税务计算如何对应到IRS 1040表格的具体行号，帮助您理解"为什么是这个数"。'
                  : 'The table below shows how your tax calculations correspond to specific line numbers on IRS Form 1040, helping you understand "why this number".'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">
                      {language === 'zh' ? '行号' : 'Line #'}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">
                      {language === 'zh' ? '项目描述' : 'Description'}
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">
                      {language === 'zh' ? '金额' : 'Amount'}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">
                      {language === 'zh' ? '计算公式/来源' : 'Formula/Source'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineReconciliation.map((line, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono text-blue-600 font-medium">
                        {line.lineNumber}
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <div className="font-medium text-gray-900">{line.description}</div>
                          {line.englishDescription && language === 'zh' && (
                            <div className="text-xs text-gray-500 mt-1">{line.englishDescription}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        <span className={`font-medium ${line.amount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {line.amount > 0 ? formatCurrency(line.amount) : '—'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {line.formula}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-md text-sm">
              <div className="flex items-center gap-2 text-green-800">
                <span className="font-medium">
                  {language === 'zh' ? '💡 客服提示' : '💡 Customer Service Tip'}
                </span>
              </div>
              <p className="text-green-700 mt-1">
                {language === 'zh' 
                  ? '如有疑问，您可以引用上述行号和公式向客服或税务专家咨询具体计算逻辑。'
                  : 'If you have questions, you can reference the line numbers and formulas above when consulting with customer service or tax professionals.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onExportPDF}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            {t('actions.exportPDF')}
          </button>
          
          <button
            onClick={onExportJSON}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            {t('actions.exportJSON')}
          </button>
          
          <button
            onClick={onRecalculate}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Calculator className="h-4 w-4" />
            {t('actions.recalculate')}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Create 1040 line number reconciliation data
 * Maps tax calculations to specific 1040 form line numbers with explanations
 */
function createLineReconciliation(taxResult, calculationDetails) {
  const lines = [];

  // Income Section (Lines 1-9)
  if (taxResult.adjustedGrossIncome > 0) {
    lines.push({
      lineNumber: '1a',
      description: '工资、薪金和小费',
      englishDescription: 'Wages, salaries, and tips',
      amount: taxResult.wages || 0,
      formula: 'W-2 Box 1 + 其他工资收入 / W-2 Box 1 + other wage income'
    });

    if (taxResult.interestIncome > 0) {
      lines.push({
        lineNumber: '2a',
        description: '应税利息收入',
        englishDescription: 'Taxable interest',
        amount: taxResult.interestIncome,
        formula: '1099-INT Box 1 总和 / Sum of 1099-INT Box 1'
      });
    }

    if (taxResult.dividends > 0) {
      lines.push({
        lineNumber: '3a',
        description: '普通股息',
        englishDescription: 'Ordinary dividends',
        amount: taxResult.dividends,
        formula: '1099-DIV Box 1a 总和 / Sum of 1099-DIV Box 1a'
      });
    }

    if (taxResult.capitalGains > 0) {
      lines.push({
        lineNumber: '7',
        description: '资本利得或(损失)',
        englishDescription: 'Capital gain or (loss)',
        amount: taxResult.capitalGains,
        formula: 'Schedule D 或 1099-B 净收益 / Schedule D or 1099-B net gain'
      });
    }

    lines.push({
      lineNumber: '11',
      description: '调整总收入 (AGI)',
      englishDescription: 'Adjusted gross income',
      amount: taxResult.adjustedGrossIncome,
      formula: '第1-10行总和减去调整项 / Sum of lines 1-10 minus adjustments'
    });
  }

  // Deductions Section (Lines 12-13)
  const standardDeduction = taxResult.standardDeduction || 0;
  const itemizedDeduction = taxResult.itemizedDeduction || 0;
  const deductionUsed = Math.max(standardDeduction, itemizedDeduction);

  if (deductionUsed > 0) {
    lines.push({
      lineNumber: '12',
      description: deductionUsed === standardDeduction ? '标准扣除额' : '逐项扣除额',
      englishDescription: deductionUsed === standardDeduction ? 'Standard deduction' : 'Itemized deductions',
      amount: deductionUsed,
      formula: deductionUsed === standardDeduction 
        ? `基于报税身份的固定金额 / Fixed amount based on filing status`
        : 'Schedule A 第17行 / Schedule A line 17'
    });
  }

  // QBI Deduction (Line 13)
  if (taxResult.qbiDeduction > 0) {
    lines.push({
      lineNumber: '13',
      description: '合格商业收入扣除 (QBI)',
      englishDescription: 'Qualified business income deduction',
      amount: taxResult.qbiDeduction,
      formula: 'Form 8995 或 8995-A / Form 8995 or 8995-A'
    });
  }

  // Taxable Income (Line 15)
  if (taxResult.taxableIncome >= 0) {
    lines.push({
      lineNumber: '15',
      description: '应税收入',
      englishDescription: 'Taxable income',
      amount: taxResult.taxableIncome,
      formula: '第11行 - 第12行 - 第13行 / Line 11 - Line 12 - Line 13'
    });
  }

  // Tax Calculation Section (Lines 16-23)
  if (taxResult.federalTax > 0) {
    lines.push({
      lineNumber: '16',
      description: '税前抵免税额',
      englishDescription: 'Tax before credits',
      amount: taxResult.taxBeforeCredits || taxResult.federalTax + (taxResult.childTaxCredit || 0) + (taxResult.earnedIncomeCredit || 0),
      formula: '税率表或合格股息工作表 / Tax table or Qualified Dividends Worksheet'
    });
  }

  // Credits Section (Lines 19-21)
  if (taxResult.childTaxCredit > 0) {
    lines.push({
      lineNumber: '19',
      description: '子女税收抵免',
      englishDescription: 'Child tax credit',
      amount: taxResult.childTaxCredit,
      formula: 'Schedule 8812 / Form 8812'
    });
  }

  if (taxResult.educationCredits > 0) {
    lines.push({
      lineNumber: '20',
      description: '教育抵免',
      englishDescription: 'Education credits',
      amount: taxResult.educationCredits,
      formula: 'Form 8863 (AOTC/LLC)'
    });
  }

  if (taxResult.earnedIncomeCredit > 0) {
    lines.push({
      lineNumber: '27a',
      description: '劳动所得税收抵免 (EITC)',
      englishDescription: 'Earned income credit',
      amount: taxResult.earnedIncomeCredit,
      formula: 'EITC表格或工作表 / EITC table or worksheet'
    });
  }

  // Additional Taxes Section (Lines 17-18)
  if (taxResult.selfEmploymentTax > 0) {
    lines.push({
      lineNumber: '17',
      description: '自雇税',
      englishDescription: 'Self-employment tax',
      amount: taxResult.selfEmploymentTax,
      formula: 'Schedule SE 第12行 / Schedule SE line 12'
    });
  }

  if (taxResult.netInvestmentIncomeTax > 0) {
    lines.push({
      lineNumber: '17',
      description: '净投资收入税 (NIIT)',
      englishDescription: 'Net investment income tax',
      amount: taxResult.netInvestmentIncomeTax,
      formula: 'Form 8960 (3.8%税率) / Form 8960 (3.8% rate)'
    });
  }

  if (taxResult.additionalMedicareTax > 0) {
    lines.push({
      lineNumber: '17',
      description: '附加医疗保险税',
      englishDescription: 'Additional Medicare tax',
      amount: taxResult.additionalMedicareTax,
      formula: 'Form 8959 (0.9%税率) / Form 8959 (0.9% rate)'
    });
  }

  // Total Tax (Line 24)
  if (taxResult.federalTax > 0) {
    lines.push({
      lineNumber: '24',
      description: '联邦税总额',
      englishDescription: 'Total tax',
      amount: taxResult.federalTax,
      formula: '第16行 + 第17行 - 抵免额 / Line 16 + Line 17 - Credits'
    });
  }

  // Payments Section (Lines 25-33)
  if (taxResult.totalPayments > 0) {
    lines.push({
      lineNumber: '25a',
      description: '联邦预扣税',
      englishDescription: 'Federal income tax withheld',
      amount: taxResult.federalWithholding || 0,
      formula: 'W-2 Box 2 + 1099 预扣税总和 / Sum of W-2 Box 2 + 1099 withholding'
    });

    if (taxResult.estimatedPayments > 0) {
      lines.push({
        lineNumber: '26',
        description: '估算税款',
        englishDescription: 'Estimated tax payments',
        amount: taxResult.estimatedPayments,
        formula: '季度估算税款总和 / Sum of quarterly estimated payments'
      });
    }

    lines.push({
      lineNumber: '33',
      description: '支付总额',
      englishDescription: 'Total payments',
      amount: taxResult.totalPayments,
      formula: '第25-32行总和 / Sum of lines 25-32'
    });
  }

  // Refund or Amount Owed (Lines 34-37)
  const balance = taxResult.refundOrOwe || taxResult.balance || (taxResult.totalPayments - taxResult.federalTax);
  if (balance !== 0) {
    const isRefund = balance > 0;
    lines.push({
      lineNumber: isRefund ? '34' : '37',
      description: isRefund ? '退税金额' : '应补税额',
      englishDescription: isRefund ? 'Refund' : 'Amount you owe',
      amount: Math.abs(balance),
      formula: isRefund 
        ? '第33行 - 第24行 (如果为正) / Line 33 - Line 24 (if positive)'
        : '第24行 - 第33行 (如果为正) / Line 24 - Line 33 (if positive)'
    });
  }

  // Sort by line number for proper 1040 sequence
  return lines.sort((a, b) => {
    const getLineNum = (line) => {
      const num = parseFloat(line.replace(/[a-z]/i, ''));
      return isNaN(num) ? 999 : num;
    };
    return getLineNum(a.lineNumber) - getLineNum(b.lineNumber);
  });
}

export default TaxResults;