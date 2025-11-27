import React, { useState, useEffect } from 'react';
import { Calculator, Target, Lightbulb, BarChart3, DollarSign } from 'lucide-react';

interface FormData {
  incomeData?: {
    wages?: string;
    capitalGains?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TaxResult {
  totalTax: number;
  [key: string]: unknown;
}

interface TaxScenario {
  id: string;
  name: string;
  description: string;
  changes: Record<string, unknown>;
  projectedSavings: number;
  feasibility: 'high' | 'medium' | 'low';
}

interface TaxPlannerProps {
  formData: FormData;
  taxResult: TaxResult;
  t: (key: string) => string;
}

export const TaxPlanner: React.FC<TaxPlannerProps> = ({
  formData,
  taxResult,
  t
}) => {
  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [_customScenario, _setCustomScenario] = useState<Record<string, unknown>>({});

  useEffect(() => {
    generateTaxScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, taxResult]);

  const generateTaxScenarios = () => {
    const income = parseFloat(formData.incomeData?.wages || '0');
    const _currentTax = taxResult.totalTax;
    const scenarios: TaxScenario[] = [];

    // Scenario 1: Maximize 401k contribution
    if (income > 30000) {
      const max401k = Math.min(23000, income * 0.2); // 2025 limit
      const taxSavings = max401k * 0.22; // Approximate tax bracket
      scenarios.push({
        id: '401k-max',
        name: 'Maximize 401(k) Contribution',
        description: `Contribute $${max401k.toLocaleString()} to 401(k)`,
        changes: { retirement401k: max401k },
        projectedSavings: taxSavings,
        feasibility: income > 100000 ? 'high' : 'medium'
      });
    }

    // Scenario 2: HSA Contribution
    if (income > 25000) {
      const hsaMax = 4300; // 2025 individual limit
      const taxSavings = hsaMax * 0.22;
      scenarios.push({
        id: 'hsa-max',
        name: 'Maximize HSA Contribution',
        description: `Contribute $${hsaMax.toLocaleString()} to HSA`,
        changes: { hsaContribution: hsaMax },
        projectedSavings: taxSavings,
        feasibility: 'high'
      });
    }

    // Scenario 3: Charitable giving
    const suggestedCharity = Math.min(income * 0.05, 10000);
    if (income > 50000) {
      scenarios.push({
        id: 'charity',
        name: 'Strategic Charitable Giving',
        description: `Donate $${suggestedCharity.toLocaleString()} to qualified charities`,
        changes: { charitableContributions: suggestedCharity },
        projectedSavings: suggestedCharity * 0.22,
        feasibility: 'medium'
      });
    }

    // Scenario 4: Energy efficient home improvements
    if (income > 40000) {
      scenarios.push({
        id: 'energy-credits',
        name: 'Energy Efficiency Credits',
        description: 'Install solar panels or energy-efficient systems',
        changes: { energyCredits: 7500 },
        projectedSavings: 7500,
        feasibility: 'medium'
      });
    }

    // Scenario 5: Tax loss harvesting
    const capitalGains = parseFloat(formData.incomeData?.capitalGains || '0');
    if (capitalGains > 0) {
      const harvestAmount = Math.min(capitalGains, 3000);
      scenarios.push({
        id: 'tax-loss-harvesting',
        name: 'Tax Loss Harvesting',
        description: `Realize $${harvestAmount.toLocaleString()} in capital losses`,
        changes: { capitalLosses: harvestAmount },
        projectedSavings: harvestAmount * 0.15,
        feasibility: 'high'
      });
    }

    // Scenario 6: Roth IRA conversion
    if (income < 153000) { // 2025 Roth IRA phase-out starts
      scenarios.push({
        id: 'roth-ira',
        name: 'Roth IRA Contribution',
        description: 'Contribute $7,000 to Roth IRA (tax-free growth)',
        changes: { rothIRA: 7000 },
        projectedSavings: 0, // No immediate tax benefit, but long-term savings
        feasibility: 'high'
      });
    }

    setScenarios(scenarios);
  };

  const calculateScenarioImpact = (scenario: TaxScenario) => {
    // Simplified calculation - in reality, this would use the tax engine
    const currentTax = taxResult.totalTax;
    const projectedTax = currentTax - scenario.projectedSavings;

    return {
      currentTax,
      projectedTax,
      savings: scenario.projectedSavings,
      savingsPercentage: (scenario.projectedSavings / currentTax) * 100
    };
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const yearlyProjection = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

    return years.map(year => ({
      year,
      currentPath: taxResult.totalTax * Math.pow(1.03, year - currentYear), // 3% inflation
      optimizedPath: (taxResult.totalTax - 5000) * Math.pow(1.03, year - currentYear) // Assume $5k annual savings
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tax Planning Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {t('planning.title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${taxResult.totalTax.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{t('planning.currentTax')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${scenarios.reduce((sum, s) => sum + s.projectedSavings, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{t('planning.potentialSavings')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {((scenarios.reduce((sum, s) => sum + s.projectedSavings, 0) / taxResult.totalTax) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">{t('planning.savingsRate')}</div>
          </div>
        </div>
      </div>

      {/* Tax Strategies */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          {t('planning.strategies')}
        </h4>

        <div className="space-y-3">
          {scenarios.map(scenario => {
            const impact = calculateScenarioImpact(scenario);

            return (
              <div
                key={scenario.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedScenario === scenario.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{scenario.name}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFeasibilityColor(scenario.feasibility)}`}>
                        {scenario.feasibility} feasibility
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>

                    {selectedScenario === scenario.id && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Current Tax:</span>
                            <span className="ml-2 font-medium">${impact.currentTax.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Projected Tax:</span>
                            <span className="ml-2 font-medium">${impact.projectedTax.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Savings:</span>
                            <span className="ml-2 font-medium text-green-600">
                              ${impact.savings.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Reduction:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {impact.savingsPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${scenario.projectedSavings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{t('planning.annualSavings')}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Year Projection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          {t('planning.fiveYearProjection')}
        </h4>

        <div className="space-y-3">
          {yearlyProjection().map((projection) => (
            <div key={projection.year} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium">{projection.year}</span>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Current Path:</span>
                  <span className="ml-2 font-medium">${projection.currentPath.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Optimized:</span>
                  <span className="ml-2 font-medium text-green-600">${projection.optimizedPath.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Savings:</span>
                  <span className="ml-2 font-medium text-green-600">
                    ${(projection.currentPath - projection.optimizedPath).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">{t('planning.totalProjectedSavings')}</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            ${yearlyProjection().reduce((sum, p) => sum + (p.currentPath - p.optimizedPath), 0).toLocaleString()}
          </div>
          <div className="text-sm text-green-600 mt-1">
            {t('planning.overFiveYears')}
          </div>
        </div>
      </div>

      {/* Implementation Checklist */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-600" />
          {t('planning.implementationChecklist')}
        </h4>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">{t('planning.checklist.reviewStrategies')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">{t('planning.checklist.consultProfessional')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">{t('planning.checklist.setReminders')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">{t('planning.checklist.trackProgress')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};