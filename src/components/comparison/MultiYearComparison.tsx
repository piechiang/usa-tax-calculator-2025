import React, { useState, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, Calendar, ArrowUpDown } from 'lucide-react';

import type { TaxContextValue } from '../../contexts/TaxContext';

interface YearData {
  year: number;
  income: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  refund: number;
  deductions: number;
}

interface CurrentYearData {
  taxResult?: Partial<TaxContextValue['taxResult']>;
  deductions?: Partial<TaxContextValue['deductions']>;
}

interface MultiYearComparisonProps {
  currentYearData: CurrentYearData;
  t: (key: string) => string;
}

export const MultiYearComparison: React.FC<MultiYearComparisonProps> = ({
  currentYearData,
  t
}) => {
  const [selectedMetric, setSelectedMetric] = useState<keyof YearData>('totalTax');
  const [comparisonPeriod, setComparisonPeriod] = useState<3 | 5 | 10>(5);

  // Memoize marginal rate calculation
  const getMarginalRate = useCallback((income: number): number => {
    // 2025 tax brackets (simplified)
    if (income <= 11600) return 10;
    if (income <= 47150) return 12;
    if (income <= 100525) return 22;
    if (income <= 191950) return 24;
    if (income <= 243725) return 32;
    if (income <= 609350) return 35;
    return 37;
  }, []);

  // Memoize historical data generation
  const historicalData = useMemo((): YearData[] => {
    const currentYear = new Date().getFullYear();
    const years: YearData[] = [];
    const currentTaxResult = currentYearData.taxResult ?? {};
    const currentDeductions = currentYearData.deductions ?? {};

    // Generate sample historical data (in a real app, this would come from stored data)
    for (let i = comparisonPeriod - 1; i >= 0; i--) {
      const year = currentYear - i;
      const isCurrentYear = i === 0;

      if (isCurrentYear) {
        // Use actual current year data
        years.push({
          year,
          income: currentTaxResult.adjustedGrossIncome ?? 0,
          totalTax: currentTaxResult.totalTax ?? 0,
          effectiveRate: currentTaxResult.effectiveRate ?? 0,
          marginalRate: getMarginalRate(currentTaxResult.adjustedGrossIncome ?? 0),
          refund: currentTaxResult.balance && currentTaxResult.balance < 0 ? Math.abs(currentTaxResult.balance) : 0,
          deductions: currentDeductions.useStandardDeduction
            ? Number(currentDeductions.standardDeduction ?? 0)
            : Number(currentDeductions.itemizedTotal ?? 0)
        });
      } else {
        // Generate realistic historical data with some variation
        const baseIncome = (currentTaxResult.adjustedGrossIncome ?? 50000) * (0.95 + Math.random() * 0.1);
        const baseTax = baseIncome * 0.18; // Approximate tax rate

        years.push({
          year,
          income: baseIncome,
          totalTax: baseTax,
          effectiveRate: (baseTax / baseIncome) * 100,
          marginalRate: getMarginalRate(baseIncome),
          refund: Math.random() > 0.6 ? Math.random() * 3000 : 0,
          deductions: 12000 + Math.random() * 8000 // Varies between standard and some itemized
        });
      }
    }

    return years;
  }, [currentYearData, comparisonPeriod, getMarginalRate]);

  // Memoize trends calculation
  const trends = useMemo(() => {
    if (historicalData.length < 2) return null;

    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    if (!latest || !previous) return null;

    const computePercentageChange = (current: number, prior: number): number => {
      if (prior === 0) {
        return 0;
      }
      return ((current - prior) / prior) * 100;
    };

    const averageRefund =
      historicalData.reduce((sum, year) => sum + year.refund, 0) / historicalData.length;

    return {
      incomeChange: computePercentageChange(latest.income, previous.income),
      taxChange: computePercentageChange(latest.totalTax, previous.totalTax),
      effectiveRateChange: latest.effectiveRate - previous.effectiveRate,
      averageRefund
    };
  }, [historicalData]);

  // Memoize max value calculation
  const getMaxValue = useCallback((metric: keyof YearData): number => {
    if (historicalData.length === 0) {
      return 0;
    }
    return Math.max(...historicalData.map(year => year[metric]));
  }, [historicalData]);

  // Memoize format value function
  const formatValue = useCallback((value: number, metric: keyof YearData): string => {
    switch (metric) {
      case 'effectiveRate':
      case 'marginalRate':
        return `${value.toFixed(1)}%`;
      case 'year':
        return value.toString();
      default:
        return `$${value.toLocaleString()}`;
    }
  }, []);

  // Memoize metric color function
  const getMetricColor = useCallback((metric: keyof YearData): string => {
    switch (metric) {
      case 'income': return 'bg-blue-500';
      case 'totalTax': return 'bg-red-500';
      case 'effectiveRate': return 'bg-yellow-500';
      case 'marginalRate': return 'bg-purple-500';
      case 'refund': return 'bg-green-500';
      case 'deductions': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {t('comparison.multiYear.title')}
        </h3>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('comparison.multiYear.period')}
            </label>
            <select
              value={comparisonPeriod}
              onChange={(e) => setComparisonPeriod(Number(e.target.value) as 3 | 5 | 10)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={3}>3 Years</option>
              <option value={5}>5 Years</option>
              <option value={10}>10 Years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('comparison.multiYear.metric')}
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as keyof YearData)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="totalTax">Total Tax</option>
              <option value="income">Income</option>
              <option value="effectiveRate">Effective Rate</option>
              <option value="marginalRate">Marginal Rate</option>
              <option value="refund">Refund</option>
              <option value="deductions">Deductions</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64 bg-gray-50 rounded-lg p-4">
          <div className="flex items-end justify-between h-full">
            {historicalData.map((yearData) => {
              const value = yearData[selectedMetric] as number;
              const maxValue = getMaxValue(selectedMetric);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

              return (
                <div key={yearData.year} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-600 mb-1">
                    {formatValue(value, selectedMetric)}
                  </div>
                  <div
                    className={`w-8 ${getMetricColor(selectedMetric)} rounded-t transition-all duration-300`}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="text-xs text-gray-700 mt-1 font-medium">
                    {yearData.year}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trends Summary */}
      {trends && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t('comparison.multiYear.trends')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${trends.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.incomeChange >= 0 ? '+' : ''}{trends.incomeChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{t('comparison.multiYear.incomeChange')}</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className={`text-2xl font-bold ${trends.taxChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {trends.taxChange >= 0 ? '+' : ''}{trends.taxChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{t('comparison.multiYear.taxChange')}</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className={`text-2xl font-bold ${trends.effectiveRateChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {trends.effectiveRateChange >= 0 ? '+' : ''}{trends.effectiveRateChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{t('comparison.multiYear.rateChange')}</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${trends.averageRefund.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t('comparison.multiYear.avgRefund')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          {t('comparison.multiYear.detailedComparison')}
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-900">Year</th>
                <th className="text-right py-2 font-medium text-gray-900">Income</th>
                <th className="text-right py-2 font-medium text-gray-900">Total Tax</th>
                <th className="text-right py-2 font-medium text-gray-900">Effective Rate</th>
                <th className="text-right py-2 font-medium text-gray-900">Marginal Rate</th>
                <th className="text-right py-2 font-medium text-gray-900">Deductions</th>
                <th className="text-right py-2 font-medium text-gray-900">Refund</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map((yearData, index) => {
                const isCurrentYear = index === historicalData.length - 1;

                return (
                  <tr
                    key={yearData.year}
                    className={`border-b border-gray-100 ${isCurrentYear ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-2 font-medium">
                      {yearData.year}
                      {isCurrentYear && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="text-right py-2">${yearData.income.toLocaleString()}</td>
                    <td className="text-right py-2">${yearData.totalTax.toLocaleString()}</td>
                    <td className="text-right py-2">{yearData.effectiveRate.toFixed(1)}%</td>
                    <td className="text-right py-2">{yearData.marginalRate}%</td>
                    <td className="text-right py-2">${yearData.deductions.toLocaleString()}</td>
                    <td className="text-right py-2">
                      {yearData.refund > 0 ? `$${yearData.refund.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Efficiency Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-orange-600" />
          {t('comparison.multiYear.efficiency')}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-3">{t('comparison.multiYear.bestYear')}</h5>
            {(() => {
              const bestYear = historicalData.reduce((best, current) =>
                current.effectiveRate < best.effectiveRate ? current : best
              );

              return (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-800">{bestYear.year}</div>
                  <div className="text-sm text-green-700">
                    Effective Rate: {bestYear.effectiveRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">
                    Total Tax: ${bestYear.totalTax.toLocaleString()}
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <h5 className="font-medium text-gray-800 mb-3">{t('comparison.multiYear.worstYear')}</h5>
            {(() => {
              const worstYear = historicalData.reduce((worst, current) =>
                current.effectiveRate > worst.effectiveRate ? current : worst
              );

              return (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="font-bold text-red-800">{worstYear.year}</div>
                  <div className="text-sm text-red-700">
                    Effective Rate: {worstYear.effectiveRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-700">
                    Total Tax: ${worstYear.totalTax.toLocaleString()}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h6 className="font-medium text-gray-800 mb-2">{t('comparison.multiYear.insights')}</h6>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• {historicalData.length > 0 && `Average effective rate over ${comparisonPeriod} years: ${(historicalData.reduce((sum, year) => sum + year.effectiveRate, 0) / historicalData.length).toFixed(1)}%`}</li>
            <li>• {trends && `Income ${trends.incomeChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(trends.incomeChange).toFixed(1)}% from last year`}</li>
            <li>• {trends && `Tax burden ${trends.taxChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(trends.taxChange).toFixed(1)}% from last year`}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


