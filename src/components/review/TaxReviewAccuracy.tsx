import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, Calculator, DollarSign, Eye, FileText, Shield, Target, BarChart3, Minus, Plus, Check, Dot } from 'lucide-react';
import type {
  AccuracyCheck,
  DeductionComparison,
  TaxScenario,
  TaxDataSnapshot,
  TaxCalculationOutput,
  TranslationFunction
} from '../../types/CommonTypes';

interface TaxReviewAccuracyProps {
  taxData: TaxDataSnapshot;
  calculations: TaxCalculationOutput;
  onFixIssue: (issueId: string, fieldPath: string) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  t: TranslationFunction;
}

export const TaxReviewAccuracy: React.FC<TaxReviewAccuracyProps> = ({
  taxData,
  calculations,
  onFixIssue,
  onAcceptSuggestion,
  t
}) => {
  const [activeSection, setActiveSection] = useState<'accuracy' | 'comparison' | 'scenarios' | 'audit'>('accuracy');
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  // Perform comprehensive accuracy checks
  const accuracyChecks = useMemo((): AccuracyCheck[] => {
    const checks: AccuracyCheck[] = [];

    // Income verification checks
    if (taxData.incomeSourcesEach) {
      const totalIncome = taxData.incomeSourcesEach.reduce((sum: number, income: any) => sum + (income.amount || 0), 0);

      if (totalIncome === 0) {
        checks.push({
          id: 'no-income',
          category: 'warning',
          title: 'No Income Reported',
          description: 'You haven\'t reported any income. Make sure to include all W-2s, 1099s, and other income sources.',
          impact: 'high',
          actionRequired: true,
          fieldPath: 'incomeSourcesEach'
        });
      }

      if (totalIncome > 100000 && !taxData.hasRetirementContributions) {
        checks.push({
          id: 'retirement-suggestion',
          category: 'suggestion',
          title: 'Maximize Retirement Contributions',
          description: 'With your income level, you could benefit from maximizing 401(k) and IRA contributions.',
          impact: 'medium',
          potentialSavings: totalIncome * 0.22 * 0.19, // Rough estimate
          suggestion: 'Consider contributing the maximum to tax-advantaged retirement accounts'
        });
      }
    }

    // Filing status optimization
    if (taxData.personalInfo?.filingStatus === 'marriedJointly' && calculations?.filingComparison) {
      const { joint, separate } = calculations.filingComparison;
      if (separate.totalTax < joint.totalTax) {
        checks.push({
          id: 'filing-status-optimization',
          category: 'suggestion',
          title: 'Consider Filing Separately',
          description: 'Filing separately might save you money compared to joint filing.',
          impact: 'high',
          potentialSavings: joint.totalTax - separate.totalTax,
          suggestion: 'Switch to Married Filing Separately'
        });
      }
    }

    // Deduction optimization
    if (taxData.deductions) {
      const standardDed = getStandardDeduction(taxData.personalInfo?.filingStatus);
      const itemizedTotal = calculateItemizedTotal(taxData.deductions);

      if (itemizedTotal > standardDed + 1000 && taxData.deductions.useStandardDeduction) {
        checks.push({
          id: 'itemize-deductions',
          category: 'suggestion',
          title: 'Consider Itemizing Deductions',
          description: 'Your itemized deductions may exceed the standard deduction.',
          impact: 'medium',
          potentialSavings: (itemizedTotal - standardDed) * 0.22, // Rough tax rate
          suggestion: 'Switch to itemized deductions'
        });
      }
    }

    // Common error checks
    if (taxData.personalInfo?.ssn && !isValidSSN(taxData.personalInfo.ssn)) {
      checks.push({
        id: 'invalid-ssn',
        category: 'error',
        title: 'Invalid Social Security Number',
        description: 'The SSN format appears to be incorrect. Please verify and correct.',
        impact: 'high',
        actionRequired: true,
        fieldPath: 'personalInfo.ssn'
      });
    }

    // Dependent optimization
    if (taxData.qualifyingChildren?.length > 0) {
      const childTaxCreditEligible = taxData.qualifyingChildren.filter((child: any) =>
        calculateAge(child.dateOfBirth) < 17
      );

      if (childTaxCreditEligible.length > 0 && !taxData.claimedChildTaxCredit) {
        checks.push({
          id: 'child-tax-credit',
          category: 'suggestion',
          title: 'Claim Child Tax Credit',
          description: `You may be eligible for Child Tax Credit for ${childTaxCreditEligible.length} child(ren).`,
          impact: 'high',
          potentialSavings: childTaxCreditEligible.length * 2000,
          suggestion: 'Claim Child Tax Credit'
        });
      }
    }

    // Education credit checks
    if (taxData.educationExpenses?.length > 0 && !taxData.claimedEducationCredits) {
      checks.push({
        id: 'education-credits',
        category: 'suggestion',
        title: 'Education Credits Available',
        description: 'You may qualify for American Opportunity or Lifetime Learning credits.',
        impact: 'medium',
        potentialSavings: 2500, // AOTC maximum
        suggestion: 'Claim education credits'
      });
    }

    // State tax optimization
    if (taxData.hasMultiStateIncome && !taxData.optimizedStateTaxes) {
      checks.push({
        id: 'state-tax-optimization',
        category: 'suggestion',
        title: 'Multi-State Tax Optimization',
        description: 'With income in multiple states, ensure you\'re optimizing state tax strategies.',
        impact: 'medium',
        suggestion: 'Review multi-state tax planning'
      });
    }

    // Estimated tax payment checks
    if (calculations?.estimatedTaxDue > 1000 && !taxData.madeEstimatedPayments) {
      checks.push({
        id: 'estimated-tax-penalty',
        category: 'warning',
        title: 'Potential Estimated Tax Penalty',
        description: 'You may owe penalties for not making estimated tax payments.',
        impact: 'medium',
        suggestion: 'Consider making estimated payments for next year'
      });
    }

    return checks;
  }, [taxData, calculations]);

  // Calculate deduction comparison
  const deductionComparison = useMemo((): DeductionComparison => {
    const standardDeduction = getStandardDeduction(taxData.personalInfo?.filingStatus);
    const itemizedDeduction = calculateItemizedTotal(taxData.deductions);

    const recommended = itemizedDeduction > standardDeduction ? 'itemized' : 'standard';
    const savings = Math.abs(itemizedDeduction - standardDeduction);

    return {
      standardDeduction,
      itemizedDeduction,
      recommended,
      savings,
      breakdown: [
        { category: 'Mortgage Interest', amount: taxData.deductions?.mortgageInterestAmount || 0 },
        { category: 'State & Local Taxes', amount: Math.min(taxData.deductions?.saltAmount || 0, 10000), limit: 10000 },
        { category: 'Charitable Contributions', amount: taxData.deductions?.charitableAmount || 0 },
        { category: 'Medical Expenses', amount: taxData.deductions?.medicalExpenses || 0 }
      ]
    };
  }, [taxData]);

  // Generate tax scenarios
  const taxScenarios = useMemo((): TaxScenario[] => {
    const baseScenario = {
      id: 'current',
      name: 'Current Situation',
      description: 'Your tax situation as currently entered',
      taxOwed: calculations?.totalTax || 0,
      refund: calculations?.refund || 0,
      changes: []
    };

    const scenarios = [baseScenario];

    // Scenario: Maximize retirement contributions
    if (taxData.incomeSourcesEach?.length > 0) {
      const currentIncome = taxData.incomeSourcesEach.reduce((sum: number, income: any) => sum + (income.amount || 0), 0);
      const maxRetirementContrib = Math.min(23000, currentIncome * 0.1); // 2025 401k limit
      const taxSavings = maxRetirementContrib * 0.22; // Approximate marginal rate

      scenarios.push({
        id: 'max-retirement',
        name: 'Maximize Retirement',
        description: 'Contribute maximum to 401(k) and IRA',
        taxOwed: Math.max(0, (calculations?.totalTax || 0) - taxSavings),
        refund: (calculations?.refund || 0) + taxSavings,
        changes: [`Contribute $${maxRetirementContrib.toLocaleString()} to retirement accounts`]
      });
    }

    // Scenario: Itemize deductions
    if (deductionComparison.recommended === 'itemized' && taxData.deductions?.useStandardDeduction) {
      const additionalDeduction = deductionComparison.itemizedDeduction - deductionComparison.standardDeduction;
      const taxSavings = additionalDeduction * 0.22;

      scenarios.push({
        id: 'itemize',
        name: 'Itemize Deductions',
        description: 'Use itemized deductions instead of standard',
        taxOwed: Math.max(0, (calculations?.totalTax || 0) - taxSavings),
        refund: (calculations?.refund || 0) + taxSavings,
        changes: ['Switch to itemized deductions', `Additional deduction: $${additionalDeduction.toLocaleString()}`]
      });
    }

    return scenarios;
  }, [taxData, calculations, deductionComparison]);

  const toggleExpanded = (checkId: string) => {
    setExpandedChecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkId)) {
        newSet.delete(checkId);
      } else {
        newSet.add(checkId);
      }
      return newSet;
    });
  };

  const getCheckIcon = (category: string) => {
    switch (category) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'suggestion': return TrendingUp;
      case 'info': return Info;
      default: return CheckCircle;
    }
  };

  const getCheckColor = (category: string) => {
    switch (category) {
      case 'error': return 'red';
      case 'warning': return 'amber';
      case 'suggestion': return 'green';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      red: {
        border: 'border-red-400',
        bg: 'bg-red-50',
        text: 'text-red-600',
        textDark: 'text-red-900',
        textLight: 'text-red-700',
        bgDark: 'bg-red-100',
        button: 'bg-red-600',
        buttonHover: 'hover:bg-red-700',
        hover: 'hover:text-red-800'
      },
      amber: {
        border: 'border-amber-400',
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        textDark: 'text-amber-900',
        textLight: 'text-amber-700',
        bgDark: 'bg-amber-100',
        button: 'bg-amber-600',
        buttonHover: 'hover:bg-amber-700',
        hover: 'hover:text-amber-800'
      },
      green: {
        border: 'border-green-400',
        bg: 'bg-green-50',
        text: 'text-green-600',
        textDark: 'text-green-900',
        textLight: 'text-green-700',
        bgDark: 'bg-green-100',
        button: 'bg-green-600',
        buttonHover: 'hover:bg-green-700',
        hover: 'hover:text-green-800'
      },
      blue: {
        border: 'border-blue-400',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        textDark: 'text-blue-900',
        textLight: 'text-blue-700',
        bgDark: 'bg-blue-100',
        button: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        hover: 'hover:text-blue-800'
      },
      gray: {
        border: 'border-gray-400',
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        textDark: 'text-gray-900',
        textLight: 'text-gray-700',
        bgDark: 'bg-gray-100',
        button: 'bg-gray-600',
        buttonHover: 'hover:bg-gray-700',
        hover: 'hover:text-gray-800'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const renderAccuracyChecks = () => {
    const errorChecks = accuracyChecks.filter(check => check.category === 'error');
    const warningChecks = accuracyChecks.filter(check => check.category === 'warning');
    const suggestionChecks = accuracyChecks.filter(check => check.category === 'suggestion');
    const infoChecks = accuracyChecks.filter(check => check.category === 'info');

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Accuracy Check Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorChecks.length}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{warningChecks.length}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{suggestionChecks.length}</div>
              <div className="text-sm text-gray-600">Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(suggestionChecks.reduce((sum, check) => sum + (check.potentialSavings || 0), 0)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </div>
          </div>
        </div>

        {/* Error Checks */}
        {errorChecks.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Errors Requiring Attention
            </h4>
            <div className="space-y-3">
              {errorChecks.map(check => renderCheck(check))}
            </div>
          </div>
        )}

        {/* Warning Checks */}
        {warningChecks.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-amber-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Warnings
            </h4>
            <div className="space-y-3">
              {warningChecks.map(check => renderCheck(check))}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {suggestionChecks.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Optimization Suggestions
            </h4>
            <div className="space-y-3">
              {suggestionChecks.map(check => renderCheck(check))}
            </div>
          </div>
        )}

        {/* All clear message */}
        {accuracyChecks.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No issues found with your tax return.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCheck = (check: AccuracyCheck) => {
    const IconComponent = getCheckIcon(check.category);
    const color = getCheckColor(check.category);
    const colorClasses = getColorClasses(color);
    const isExpanded = expandedChecks.has(check.id);

    return (
      <div key={check.id} className={`border-l-4 ${colorClasses.border} ${colorClasses.bg} rounded-r-lg`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 ${colorClasses.text} mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className={`font-medium ${colorClasses.textDark}`}>{check.title}</h5>
                  <p className={`text-sm ${colorClasses.textLight} mt-1`}>{check.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {check.potentialSavings && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        ${Math.round(check.potentialSavings).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">potential savings</div>
                    </div>
                  )}
                  <button
                    onClick={() => toggleExpanded(check.id)}
                    className={`${colorClasses.text} ${colorClasses.hover}`}
                  >
                    {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3">
                  {check.suggestion && (
                    <div className={`${colorClasses.bgDark} rounded p-3`}>
                      <h6 className={`font-medium ${colorClasses.textDark} mb-1`}>Suggested Action:</h6>
                      <p className={`text-sm ${colorClasses.textLight}`}>{check.suggestion}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {check.actionRequired && check.fieldPath && (
                      <button
                        onClick={() => onFixIssue(check.id, check.fieldPath)}
                        className={`px-3 py-1 ${colorClasses.button} text-white rounded text-sm ${colorClasses.buttonHover}`}
                      >
                        Fix Issue
                      </button>
                    )}
                    {check.category === 'suggestion' && (
                      <button
                        onClick={() => onAcceptSuggestion(check.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Apply Suggestion
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeductionComparison = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Deduction Strategy Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg border-2 ${deductionComparison.recommended === 'standard' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <h4 className="font-medium text-gray-900 mb-2">Standard Deduction</h4>
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${deductionComparison.standardDeduction.toLocaleString()}
            </div>
            {deductionComparison.recommended === 'standard' && (
              <div className="text-sm text-green-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Recommended
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${deductionComparison.recommended === 'itemized' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <h4 className="font-medium text-gray-900 mb-2">Itemized Deductions</h4>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              ${deductionComparison.itemizedDeduction.toLocaleString()}
            </div>
            {deductionComparison.recommended === 'itemized' && (
              <div className="text-sm text-green-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Recommended
              </div>
            )}
          </div>
        </div>

        {deductionComparison.recommended === 'itemized' && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>Potential Additional Tax Savings:</strong> ${Math.round(deductionComparison.savings * 0.22).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Itemized Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Itemized Deduction Breakdown</h4>
        <div className="space-y-3">
          {deductionComparison.breakdown?.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700">{item.category}</span>
              <div className="text-right">
                <span className="font-medium">${item.amount.toLocaleString()}</span>
                {item.limit && item.amount >= item.limit && (
                  <div className="text-xs text-amber-600">Limited to ${item.limit.toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTaxScenarios = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tax Optimization Scenarios</h3>
        </div>
        <p className="text-gray-600">
          Compare different strategies to minimize your tax liability and maximize your refund.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {taxScenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className={`border rounded-lg p-4 ${index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          >
            <h4 className="font-medium text-gray-900 mb-2">{scenario.name}</h4>
            <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Tax Owed</div>
                <div className="text-lg font-bold text-red-600">
                  ${scenario.taxOwed.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Refund</div>
                <div className="text-lg font-bold text-green-600">
                  ${scenario.refund.toLocaleString()}
                </div>
              </div>
            </div>

            {scenario.changes.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Changes:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {scenario.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-center gap-2">
                      <Dot className="w-3 h-3" /> {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {index === 0 && (
              <div className="mt-3 text-sm text-blue-700 font-medium">Current Selection</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditRisk = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">Audit Risk Assessment</h3>
        </div>
        <p className="text-gray-600">
          Analysis of factors that might increase your audit risk and recommendations to reduce it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">Low</div>
            <div className="text-sm text-gray-600">Overall Risk</div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">0.8%</div>
            <div className="text-sm text-gray-600">Audit Rate for Your Income Level</div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 mb-2">3</div>
            <div className="text-sm text-gray-600">Risk Factors Present</div>
          </div>
        </div>
      </div>

      {/* Risk factors */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Risk Factors Analysis</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <span className="text-green-800">Income within normal range</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <span className="text-green-800">Deductions appear reasonable</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded">
            <span className="text-amber-800">High charitable deductions (monitor trend)</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Audit Protection Recommendations</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <Dot className="w-3 h-3" /> Keep detailed records of all charitable contributions
          </li>
          <li className="flex items-center gap-2">
            <Dot className="w-3 h-3" /> Maintain receipts for business expenses over $75
          </li>
          <li className="flex items-center gap-2">
            <Dot className="w-3 h-3" /> Document any unusual income or deduction items
          </li>
          <li className="flex items-center gap-2">
            <Dot className="w-3 h-3" /> Consider professional tax preparation for complex situations
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'accuracy', label: 'Accuracy Check', icon: Shield },
            { id: 'comparison', label: 'Deduction Analysis', icon: Calculator },
            { id: 'scenarios', label: 'Tax Scenarios', icon: Target },
            { id: 'audit', label: 'Audit Risk', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeSection === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeSection === 'accuracy' && renderAccuracyChecks()}
        {activeSection === 'comparison' && renderDeductionComparison()}
        {activeSection === 'scenarios' && renderTaxScenarios()}
        {activeSection === 'audit' && renderAuditRisk()}
      </div>
    </div>
  );
};

// Helper functions
const getStandardDeduction = (filingStatus?: string): number => {
  const deductions = {
    single: 15750,
    marriedJointly: 31500,
    marriedSeparately: 15750,
    headOfHousehold: 23350,
    qualifyingSurvivingSpouse: 31500
  };
  return deductions[filingStatus as keyof typeof deductions] || 15750;
};

const calculateItemizedTotal = (deductions: any): number => {
  if (!deductions) return 0;

  return (
    (deductions.mortgageInterestAmount || 0) +
    (Math.min(deductions.saltAmount || 0, 10000)) +
    (deductions.charitableAmount || 0) +
    (deductions.medicalExpenses || 0)
  );
};

const isValidSSN = (ssn: string): boolean => {
  return /^\d{3}-\d{2}-\d{4}$/.test(ssn);
};

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  return today.getFullYear() - birth.getFullYear();
};

export default TaxReviewAccuracy;