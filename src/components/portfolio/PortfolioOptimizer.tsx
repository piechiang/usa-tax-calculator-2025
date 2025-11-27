import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, PieChart, Target, AlertTriangle, CheckCircle } from 'lucide-react';

import type { TaxContextValue } from '../../contexts/TaxContext';

interface Asset {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'crypto' | 'real-estate';
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  dividends?: number;
}

interface TaxStrategy {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  steps: string[];
}

interface PortfolioFormData {
  incomeData?: TaxContextValue['incomeData'];
}

interface PortfolioOptimizerProps {
  formData: PortfolioFormData;
}

export const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({
  formData
}) => {
  const [portfolio, _setPortfolio] = useState<Asset[]>([
    {
      id: '1',
      name: 'Apple Inc. (AAPL)',
      type: 'stock',
      shares: 100,
      purchasePrice: 150,
      currentPrice: 175,
      purchaseDate: '2023-01-15',
      dividends: 240
    },
    {
      id: '2',
      name: 'S&P 500 ETF (SPY)',
      type: 'etf',
      shares: 50,
      purchasePrice: 400,
      currentPrice: 420,
      purchaseDate: '2023-06-01',
      dividends: 150
    }
  ]);

  const [strategies, setStrategies] = useState<TaxStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  useEffect(() => {
    generateTaxStrategies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio]);

  const calculateGainLoss = (asset: Asset) => {
    const totalGain = (asset.currentPrice - asset.purchasePrice) * asset.shares;
    const totalValue = asset.currentPrice * asset.shares;
    const costBasis = asset.purchasePrice * asset.shares;
    const dividendIncome = asset.dividends || 0;

    return {
      totalGain,
      totalValue,
      costBasis,
      dividendIncome,
      gainPercentage: (totalGain / costBasis) * 100,
      isLongTerm: new Date().getTime() - new Date(asset.purchaseDate).getTime() > 365 * 24 * 60 * 60 * 1000
    };
  };

  const generateTaxStrategies = () => {
    const newStrategies: TaxStrategy[] = [];
    let totalLosses = 0;
    let longTermGains = 0;
    let shortTermGains = 0;

    portfolio.forEach(asset => {
      const analysis = calculateGainLoss(asset);
      if (analysis.totalGain > 0) {
        if (analysis.isLongTerm) {
          longTermGains += analysis.totalGain;
        } else {
          shortTermGains += analysis.totalGain;
        }
      } else {
        totalLosses += Math.abs(analysis.totalGain);
      }
    });

    // Tax-Loss Harvesting Strategy
    if (totalLosses > 0) {
      newStrategies.push({
        id: 'tax-loss-harvesting',
        title: 'Tax-Loss Harvesting',
        description: 'Realize capital losses to offset gains and reduce taxable income',
        potentialSavings: Math.min(totalLosses, 3000) * 0.22, // Assuming 22% tax bracket
        riskLevel: 'low',
        timeframe: 'immediate',
        steps: [
          'Identify assets with unrealized losses',
          'Sell losing positions before year-end',
          'Use losses to offset capital gains',
          'Carry forward excess losses to future years',
          'Avoid wash sale rules (30-day period)'
        ]
      });
    }

    // Long-term vs Short-term Gains Strategy
    if (shortTermGains > 0 && longTermGains > 0) {
      const shortTermTax = shortTermGains * 0.22; // Ordinary income rate
      const longTermTax = longTermGains * 0.15; // Capital gains rate
      const savings = shortTermTax - longTermTax;

      newStrategies.push({
        id: 'holding-period-optimization',
        title: 'Holding Period Optimization',
        description: 'Delay short-term gains to qualify for long-term capital gains rates',
        potentialSavings: savings,
        riskLevel: 'medium',
        timeframe: 'short-term',
        steps: [
          'Identify positions held less than 1 year',
          'Calculate tax savings of waiting',
          'Consider market risk vs tax savings',
          'Set calendar reminders for 1-year anniversary',
          'Monitor positions for optimal timing'
        ]
      });
    }

    // Asset Location Strategy
    newStrategies.push({
      id: 'asset-location',
      title: 'Asset Location Optimization',
      description: 'Place tax-inefficient investments in tax-advantaged accounts',
      potentialSavings: 2000, // Estimated based on typical scenarios
      riskLevel: 'low',
      timeframe: 'long-term',
      steps: [
        'Hold bonds and REITs in tax-deferred accounts',
        'Keep tax-efficient index funds in taxable accounts',
        'Use Roth accounts for high-growth investments',
        'Consider municipal bonds for high tax brackets',
        'Rebalance across account types tax-efficiently'
      ]
    });

    // Roth Conversion Strategy
    const currentIncome = parseFloat(formData.incomeData?.wages || '0');
    if (currentIncome < 100000) { // Lower income year opportunity
      newStrategies.push({
        id: 'roth-conversion',
        title: 'Roth IRA Conversion',
        description: 'Convert traditional IRA assets during lower income years',
        potentialSavings: 5000, // Long-term tax savings
        riskLevel: 'medium',
        timeframe: 'long-term',
        steps: [
          'Assess current vs future tax brackets',
          'Calculate conversion tax cost',
          'Spread conversions over multiple years',
          'Use portfolio losses to offset conversion income',
          'Consider Roth ladder strategy'
        ]
      });
    }

    // Dividend Optimization Strategy
    const totalDividends = portfolio.reduce((sum, asset) => sum + (asset.dividends || 0), 0);
    if (totalDividends > 1000) {
      newStrategies.push({
        id: 'dividend-optimization',
        title: 'Dividend Tax Optimization',
        description: 'Optimize dividend income for qualified dividend treatment',
        potentialSavings: totalDividends * 0.07, // Difference between ordinary and qualified rates
        riskLevel: 'low',
        timeframe: 'immediate',
        steps: [
          'Ensure 60-day holding period for qualified dividends',
          'Consider timing of dividend-paying stock purchases',
          'Use tax-deferred accounts for high-dividend stocks',
          'Review dividend reinvestment plans (DRIPs)',
          'Consider municipal bond funds for tax-free income'
        ]
      });
    }

    setStrategies(newStrategies);
  };

  const portfolioSummary = {
    totalValue: portfolio.reduce((sum, asset) => sum + (asset.currentPrice * asset.shares), 0),
    totalCostBasis: portfolio.reduce((sum, asset) => sum + (asset.purchasePrice * asset.shares), 0),
    totalGainLoss: portfolio.reduce((sum, asset) => {
      const analysis = calculateGainLoss(asset);
      return sum + analysis.totalGain;
    }, 0),
    totalDividends: portfolio.reduce((sum, asset) => sum + (asset.dividends || 0), 0)
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return 'text-blue-600 bg-blue-100';
      case 'short-term': return 'text-purple-600 bg-purple-100';
      case 'long-term': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-600" />
          Portfolio Tax Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${portfolioSummary.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${portfolioSummary.totalCostBasis.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Cost Basis</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className={`text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${portfolioSummary.totalGainLoss.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Unrealized Gain/Loss</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              ${portfolioSummary.totalDividends.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Annual Dividends</div>
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-900">Asset</th>
                <th className="text-right py-2 font-medium text-gray-900">Shares</th>
                <th className="text-right py-2 font-medium text-gray-900">Cost Basis</th>
                <th className="text-right py-2 font-medium text-gray-900">Current Value</th>
                <th className="text-right py-2 font-medium text-gray-900">Gain/Loss</th>
                <th className="text-right py-2 font-medium text-gray-900">Tax Status</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(asset => {
                const analysis = calculateGainLoss(asset);
                return (
                  <tr key={asset.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{asset.type}</div>
                      </div>
                    </td>
                    <td className="text-right py-2">{asset.shares}</td>
                    <td className="text-right py-2">${analysis.costBasis.toLocaleString()}</td>
                    <td className="text-right py-2">${analysis.totalValue.toLocaleString()}</td>
                    <td className={`text-right py-2 font-medium ${analysis.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${analysis.totalGain.toLocaleString()} ({analysis.gainPercentage.toFixed(1)}%)
                    </td>
                    <td className="text-right py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        analysis.isLongTerm ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                      }`}>
                        {analysis.isLongTerm ? 'Long-term' : 'Short-term'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Optimization Strategies */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Tax Optimization Strategies
        </h4>

        <div className="space-y-4">
          {strategies.map(strategy => (
            <div
              key={strategy.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedStrategy === strategy.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{strategy.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    ${strategy.potentialSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Potential Savings</div>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(strategy.riskLevel)}`}>
                  {strategy.riskLevel} risk
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getTimeframeColor(strategy.timeframe)}`}>
                  {strategy.timeframe}
                </span>
              </div>

              {selectedStrategy === strategy.id && (
                <div className="mt-4 p-4 bg-white rounded border">
                  <h6 className="font-medium text-gray-800 mb-2">Implementation Steps:</h6>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    {strategy.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tax Calendar */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Tax Calendar & Deadlines
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="font-medium text-orange-800">Q4 2025</div>
            <div className="text-sm text-orange-700 mt-1">
              • Tax-loss harvesting deadline: Dec 31
              <br />• Roth conversions: Dec 31
              <br />• Charitable contributions: Dec 31
            </div>
          </div>

          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="font-medium text-blue-800">Q1 2026</div>
            <div className="text-sm text-blue-700 mt-1">
              • IRA contributions: Apr 15
              <br />• Tax filing deadline: Apr 15
              <br />• Q1 estimated taxes: Apr 15
            </div>
          </div>

          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="font-medium text-green-800">Q2 2026</div>
            <div className="text-sm text-green-700 mt-1">
              • Q2 estimated taxes: Jun 15
              <br />• Mid-year tax planning review
              <br />• Rebalancing assessment
            </div>
          </div>

          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="font-medium text-purple-800">Q3 2026</div>
            <div className="text-sm text-purple-700 mt-1">
              • Q3 estimated taxes: Sep 15
              <br />• Year-end planning begins
              <br />• Strategy implementation
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Recommended Actions
        </h4>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Review holdings before year-end</div>
              <div className="text-sm text-green-700">Assess tax-loss harvesting opportunities</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">Monitor wash sale rules</div>
              <div className="text-sm text-yellow-700">Avoid repurchasing sold securities within 30 days</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-800">Maximize tax-advantaged accounts</div>
              <div className="text-sm text-blue-700">Consider increasing 401(k) and IRA contributions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


