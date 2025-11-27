import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Eye, DollarSign, Target, Zap } from 'lucide-react';

interface TaxResultData {
  totalTax?: number;
  adjustedGrossIncome?: number;
  marginalRate?: number;
  federalTax?: number;
  stateTax?: number;
  localTax?: number;
  taxableIncome?: number;
  standardDeduction?: number;
}

interface HistoricalDataPoint {
  year: number;
  totalTax: number;
  agi: number;
}

interface ExpenseItem {
  amount: number;
  isDeductible: boolean;
  category?: string;
}

interface TaxAnalyticsProps {
  taxResult: TaxResultData;
  historicalData?: HistoricalDataPoint[];
  expenses?: ExpenseItem[];
  t: (key: string) => string;
}

interface AnalysisReport {
  summary: {
    totalTax: number;
    effectiveRate: number;
    marginalRate: number;
    taxEfficiency: number;
    savingsOpportunities: number;
  };
  breakdown: {
    federal: number;
    state: number;
    local: number;
    fica: number;
  };
  comparisons: {
    national: { percentile: number; comparison: string };
    state: { percentile: number; comparison: string };
    bracket: { current: string; next: string; threshold: number };
  };
  projections: {
    nextYear: number;
    retirement: number;
    optimization: number;
  };
  recommendations: Array<{
    category: string;
    impact: number;
    priority: 'high' | 'medium' | 'low';
    description: string;
    implementation: string;
  }>;
}

export const TaxAnalytics: React.FC<TaxAnalyticsProps> = ({
  taxResult,
  historicalData: _historicalData = [],
  expenses = [],
  t: _t
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'projections' | 'benchmarks'>('overview');
  const [_timeRange, _setTimeRange] = useState<'current' | '5years' | '10years'>('current');
  const [_showExport, _setShowExport] = useState(false);

  const analysisReport: AnalysisReport = useMemo(() => {
    const totalTax = taxResult.totalTax || 0;
    const adjustedGrossIncome = taxResult.adjustedGrossIncome || 0;
    const effectiveRate = adjustedGrossIncome > 0 ? totalTax / adjustedGrossIncome : 0;
    const marginalRate = taxResult.marginalRate || 0;

    // Calculate tax efficiency (lower is better)
    const standardDeduction = 15000; // Simplified
    const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);
    const idealTax = taxableIncome * 0.15; // Simplified ideal rate
    const taxEfficiency = idealTax > 0 ? (totalTax / idealTax) * 100 : 100;

    // Estimate savings opportunities from expenses
    const deductibleExpenses = expenses.filter((exp) => exp.isDeductible).reduce((sum, exp) => sum + exp.amount, 0);
    const savingsOpportunities = deductibleExpenses * marginalRate;

    return {
      summary: {
        totalTax,
        effectiveRate,
        marginalRate,
        taxEfficiency,
        savingsOpportunities
      },
      breakdown: {
        federal: taxResult.federalTax || 0,
        state: taxResult.stateTax || 0,
        local: taxResult.localTax || 0,
        fica: (adjustedGrossIncome * 0.0765) || 0 // Simplified FICA
      },
      comparisons: {
        national: {
          percentile: effectiveRate > 0.25 ? 85 : effectiveRate > 0.15 ? 65 : 35,
          comparison: effectiveRate > 0.25 ? 'above average' : effectiveRate > 0.15 ? 'average' : 'below average'
        },
        state: {
          percentile: 50, // Placeholder
          comparison: 'average'
        },
        bracket: {
          current: `${(marginalRate * 100).toFixed(0)}%`,
          next: `${((marginalRate + 0.05) * 100).toFixed(0)}%`,
          threshold: adjustedGrossIncome + 50000 // Simplified
        }
      },
      projections: {
        nextYear: totalTax * 1.03, // 3% inflation adjustment
        retirement: totalTax * 0.6, // Estimated 40% reduction in retirement
        optimization: totalTax - savingsOpportunities
      },
      recommendations: [
        {
          category: 'Retirement Planning',
          impact: Math.min(savingsOpportunities * 0.4, 10000),
          priority: 'high' as const,
          description: 'Maximize retirement contributions to reduce taxable income',
          implementation: 'Increase 401(k) contributions to the annual limit'
        },
        {
          category: 'Tax-Loss Harvesting',
          impact: Math.min(adjustedGrossIncome * 0.02, 5000),
          priority: 'medium' as const,
          description: 'Offset capital gains with investment losses',
          implementation: 'Review investment portfolio for loss harvesting opportunities'
        },
        {
          category: 'HSA Optimization',
          impact: Math.min(marginalRate * 4300, 2000),
          priority: 'high' as const,
          description: 'Maximize Health Savings Account contributions',
          implementation: 'Contribute the maximum annual HSA limit'
        }
      ]
    };
  }, [taxResult, expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency <= 100) return 'text-green-600';
    if (efficiency <= 120) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency <= 100) return 'Excellent';
    if (efficiency <= 120) return 'Good';
    if (efficiency <= 150) return 'Fair';
    return 'Needs Improvement';
  };

  const exportReport = () => {
    const reportData = {
      generatedDate: new Date().toISOString(),
      taxYear: new Date().getFullYear(),
      analysis: analysisReport,
      rawData: taxResult
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-analysis-${new Date().getFullYear()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tax Analytics & Insights</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* View Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
          { id: 'projections', label: 'Projections', icon: TrendingUp },
          { id: 'benchmarks', label: 'Benchmarks', icon: Target }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as 'overview' | 'detailed' | 'projections' | 'benchmarks')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              selectedView === view.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <view.icon className="h-4 w-4" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Total Tax</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {formatCurrency(analysisReport.summary.totalTax)}
              </div>
              <div className="text-xs text-red-700">
                {formatPercentage(analysisReport.summary.effectiveRate)} effective rate
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Marginal Rate</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatPercentage(analysisReport.summary.marginalRate)}
              </div>
              <div className="text-xs text-blue-700">
                Next dollar tax rate
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Tax Efficiency</span>
              </div>
              <div className={`text-2xl font-bold ${getEfficiencyColor(analysisReport.summary.taxEfficiency)}`}>
                {getEfficiencyLabel(analysisReport.summary.taxEfficiency)}
              </div>
              <div className="text-xs text-green-700">
                {analysisReport.summary.taxEfficiency.toFixed(0)}% of baseline
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Savings Potential</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(analysisReport.summary.savingsOpportunities)}
              </div>
              <div className="text-xs text-yellow-700">
                Through optimization
              </div>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Tax Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(analysisReport.breakdown).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{type} Tax</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (amount / analysisReport.summary.totalTax) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="font-medium w-20 text-right">{formatCurrency(amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recommendations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Optimization Opportunities</h4>
            <div className="space-y-3">
              {analysisReport.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="font-medium text-gray-900">{rec.category}</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      Save {formatCurrency(rec.impact)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{rec.description}</p>
                  <p className="text-xs text-gray-500">{rec.implementation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      {selectedView === 'detailed' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Income Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adjusted Gross Income</span>
                  <span className="font-medium">{formatCurrency(taxResult.adjustedGrossIncome || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxable Income</span>
                  <span className="font-medium">{formatCurrency(taxResult.taxableIncome || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard Deduction</span>
                  <span className="font-medium">{formatCurrency(taxResult.standardDeduction || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">After-Tax Income</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency((taxResult.adjustedGrossIncome || 0) - (taxResult.totalTax || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Rate Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Rate Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Effective Tax Rate</span>
                  <span className="font-medium">{formatPercentage(analysisReport.summary.effectiveRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Marginal Tax Rate</span>
                  <span className="font-medium">{formatPercentage(analysisReport.summary.marginalRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FICA Rate</span>
                  <span className="font-medium">7.65%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Tax Rate</span>
                  <span className="font-medium text-red-600">
                    {formatPercentage(analysisReport.summary.effectiveRate + 0.0765)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* All Recommendations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">All Recommendations</h4>
            <div className="space-y-3">
              {analysisReport.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="font-medium text-gray-900">{rec.category}</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      Save {formatCurrency(rec.impact)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{rec.description}</p>
                  <p className="text-xs text-gray-500">{rec.implementation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projections */}
      {selectedView === 'projections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Next Year</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(analysisReport.projections.nextYear)}
              </div>
              <div className="text-xs text-blue-700">
                With 3% inflation adjustment
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Retirement</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {formatCurrency(analysisReport.projections.retirement)}
              </div>
              <div className="text-xs text-green-700">
                Estimated retirement taxes
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Optimized</span>
              </div>
              <div className="text-xl font-bold text-purple-900">
                {formatCurrency(analysisReport.projections.optimization)}
              </div>
              <div className="text-xs text-purple-700">
                With all optimizations
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benchmarks */}
      {selectedView === 'benchmarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">National Comparison</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysisReport.comparisons.national.percentile}th
                </div>
                <div className="text-sm text-gray-600">
                  You pay more than {analysisReport.comparisons.national.percentile}% of taxpayers
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Your tax burden is {analysisReport.comparisons.national.comparison} compared to similar taxpayers
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Tax Bracket Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Bracket</span>
                  <span className="font-medium">{analysisReport.comparisons.bracket.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Bracket</span>
                  <span className="font-medium">{analysisReport.comparisons.bracket.next}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Income to Next Bracket</span>
                  <span className="font-medium">
                    {formatCurrency(analysisReport.comparisons.bracket.threshold - (taxResult.adjustedGrossIncome || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};