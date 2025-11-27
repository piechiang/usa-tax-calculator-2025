import React, { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Clock, Zap, AlertCircle } from 'lucide-react';

type NumericTaxSnapshot = Partial<Record<string, number>>;

interface RealTimeTaxDisplayProps {
  taxResult: NumericTaxSnapshot;
  previousTaxResult: NumericTaxSnapshot;
  isCalculating: boolean;
  lastCalculated: Date | null;
}

interface TaxChangeIndicator {
  field: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  isIncrease: boolean;
}

export const RealTimeTaxDisplay: React.FC<RealTimeTaxDisplayProps> = ({
  taxResult,
  previousTaxResult,
  isCalculating,
  lastCalculated
}) => {
  const [changes, setChanges] = useState<TaxChangeIndicator[]>([]);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const previousResultRef = useRef<NumericTaxSnapshot | null>(previousTaxResult);

  useEffect(() => {
    previousResultRef.current = previousTaxResult;
  }, [previousTaxResult]);

  useEffect(() => {
    if (!taxResult) {
      setChanges([]);
      return;
    }

    const previousSnapshot = previousResultRef.current ?? {};
    const newChanges: TaxChangeIndicator[] = [];

    const fieldsToTrack = [
      { key: 'federalTax', label: 'Federal Tax' },
      { key: 'totalTax', label: 'Total Tax' },
      { key: 'effectiveRate', label: 'Effective Rate' },
      { key: 'marginalRate', label: 'Marginal Rate' },
      { key: 'taxableIncome', label: 'Taxable Income' },
      { key: 'adjustedGrossIncome', label: 'Adjusted Gross Income' }
    ] as const;

    fieldsToTrack.forEach(({ key, label }) => {
      const current = Number(taxResult[key] ?? 0);
      const previous = Number(previousSnapshot[key] ?? 0);

      if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0 || current === previous) {
        return;
      }

      const change = current - previous;
      const changePercent = (change / previous) * 100;

      newChanges.push({
        field: label,
        currentValue: current,
        previousValue: previous,
        change,
        changePercent,
        isIncrease: change > 0
      });
    });

    setChanges(newChanges);
    setAnimationTrigger(prev => prev + 1);
    previousResultRef.current = taxResult;
  }, [taxResult]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getChangeColor = (isIncrease: boolean, field: string) => {
    // For tax amounts, increases are usually bad (red), decreases are good (green)
    // For income amounts, increases are usually good (green)
    const isIncomeField = field.includes('Income');

    if (isIncomeField) {
      return isIncrease ? 'text-green-600' : 'text-red-600';
    } else {
      return isIncrease ? 'text-red-600' : 'text-green-600';
    }
  };

  const getChangeIcon = (isIncrease: boolean) => {
    return isIncrease ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Tax Calculator</h3>
          {isCalculating && (
            <div className="flex items-center gap-1 text-blue-600">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-xs">Calculating...</span>
            </div>
          )}
        </div>
        {lastCalculated && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            Updated {lastCalculated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Main Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 transition-all duration-500 ${
          animationTrigger > 0 ? 'animate-pulse' : ''
        }`}>
          <div className="text-sm font-medium text-red-800 mb-1">Federal Tax</div>
          <div className="text-xl font-bold text-red-900">
            {formatCurrency(taxResult.federalTax || 0)}
          </div>
          <div className="text-xs text-red-700">
            Effective: {formatPercentage(taxResult.effectiveRate || 0)}
          </div>
        </div>

        <div className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 transition-all duration-500 ${
          animationTrigger > 0 ? 'animate-pulse' : ''
        }`}>
          <div className="text-sm font-medium text-blue-800 mb-1">Total Tax</div>
          <div className="text-xl font-bold text-blue-900">
            {formatCurrency(taxResult.totalTax || 0)}
          </div>
          <div className="text-xs text-blue-700">
            Marginal: {formatPercentage(taxResult.marginalRate || 0)}
          </div>
        </div>

        <div className={`bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 transition-all duration-500 ${
          animationTrigger > 0 ? 'animate-pulse' : ''
        }`}>
          <div className="text-sm font-medium text-green-800 mb-1">After-Tax Income</div>
          <div className="text-xl font-bold text-green-900">
            {formatCurrency((taxResult.adjustedGrossIncome || 0) - (taxResult.totalTax || 0))}
          </div>
          <div className="text-xs text-green-700">
            Take-home amount
          </div>
        </div>
      </div>

      {/* Change Indicators */}
      {changes.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Recent Changes
          </h4>
          <div className="space-y-1">
            {changes.slice(0, 3).map((change, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{change.field}:</span>
                <div className={`flex items-center gap-1 ${getChangeColor(change.isIncrease, change.field)}`}>
                  {getChangeIcon(change.isIncrease)}
                  <span className="font-medium">
                    {change.field.includes('Rate')
                      ? `${change.changePercent > 0 ? '+' : ''}${change.changePercent.toFixed(2)}%`
                      : `${change.change > 0 ? '+' : ''}${formatCurrency(Math.abs(change.change))}`
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Insights</h4>
        <div className="space-y-1 text-xs text-gray-600">
          {taxResult.effectiveRate > 0.25 && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="h-3 w-3" />
              High effective tax rate - consider tax optimization strategies
            </div>
          )}
          {taxResult.marginalRate > taxResult.effectiveRate * 1.5 && (
            <div className="flex items-center gap-1 text-blue-600">
              <DollarSign className="h-3 w-3" />
              High marginal rate - additional income will be taxed at {formatPercentage(taxResult.marginalRate)}
            </div>
          )}
          {(taxResult.adjustedGrossIncome || 0) > 400000 && (
            <div className="flex items-center gap-1 text-purple-600">
              <TrendingUp className="h-3 w-3" />
              High income bracket - consider advanced tax planning strategies
            </div>
          )}
        </div>
      </div>

      {/* Tax Breakdown Chart */}
      {taxResult.totalTax > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tax Breakdown</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Federal Tax</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (taxResult.federalTax / taxResult.totalTax) * 100)}%`
                    }}
                  ></div>
                </div>
                <span>{formatCurrency(taxResult.federalTax || 0)}</span>
              </div>
            </div>

            {taxResult.stateTax > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span>State Tax</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (taxResult.stateTax / taxResult.totalTax) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <span>{formatCurrency(taxResult.stateTax || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
