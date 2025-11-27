import React, { useState, useMemo, useCallback } from 'react';
import { Shield, AlertTriangle, Eye, BarChart3, CheckCircle, XCircle, Info, Target } from 'lucide-react';

import type { TaxContextValue } from '../../contexts/TaxContext';

type AuditView = 'overview' | 'factors' | 'recommendations' | 'protection';

interface RiskFactor {
  id: string;
  category: 'income' | 'deductions' | 'credits' | 'business' | 'schedule' | 'behavior';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 1-10 scale
  likelihood: number; // 0-1 probability
  currentValue?: number;
  benchmark?: number;
  recommendation: string;
  evidence: string[];
}

interface AuditProfile {
  overallRisk: number; // 0-1 scale
  riskLevel: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  auditProbability: number;
  primaryConcerns: RiskFactor[];
  protectiveFactors: string[];
  recommendations: string[];
  complianceScore: number;
}

interface AuditRiskAssessmentFormData {
  personalInfo: TaxContextValue['personalInfo'];
  incomeData: TaxContextValue['incomeData'];
  deductions: TaxContextValue['deductions'];
  businessDetails?: Partial<TaxContextValue['businessDetails']>;
  hasForeignAccounts?: boolean;
}

interface AuditRiskAssessmentProps {
  formData: AuditRiskAssessmentFormData;
  taxResult: TaxContextValue['taxResult'];
  t: (key: string) => string;
}

export const AuditRiskAssessment: React.FC<AuditRiskAssessmentProps> = ({
  formData,
  taxResult,
  t
}) => {
  const translate = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  const [selectedView, setSelectedView] = useState<AuditView>('overview');

  // Memoize round number checking
  const checkForRoundNumbers = useCallback((): boolean => {
    const values = [
      formData.incomeData?.wages,
      formData.incomeData?.interestIncome,
      formData.deductions?.charitableContributions,
      formData.deductions?.medicalExpenses
    ].filter(value => value && parseFloat(String(value)) > 0);

    if (values.length === 0) {
      return false;
    }

    const roundNumbers = values.filter(value => parseFloat(String(value)) % 100 === 0).length;
    return roundNumbers > values.length * 0.6; // More than 60% round numbers
  }, [formData.incomeData, formData.deductions]);

  // Memoize risk factors calculation
  const riskFactors = useMemo((): RiskFactor[] => {
    const factors: RiskFactor[] = [];
    const income = taxResult.adjustedGrossIncome ?? 0;
    const deductions = formData.deductions;

    // High Income Risk
    if (income > 200000) {
      factors.push({
        id: 'high-income',
        category: 'income',
        name: 'High Income Earner',
        description: 'High-income taxpayers face increased audit scrutiny',
        severity: income > 500000 ? 'high' : 'medium',
        impact: 8,
        likelihood: income > 500000 ? 0.15 : 0.08,
        currentValue: income,
        benchmark: 200000,
        recommendation: 'Ensure all income sources are properly documented with supporting forms',
        evidence: ['W-2s', '1099s', 'Bank statements', 'Investment records']
      });
    }

    // Large Charitable Deductions
    const charitableDeductions = parseFloat(String(deductions.charitableContributions ?? '0'));
    if (charitableDeductions > income * 0.3) {
      factors.push({
        id: 'large-charitable',
        category: 'deductions',
        name: 'Unusually Large Charitable Deductions',
        description: 'Charitable deductions exceeding 30% of income may trigger review',
        severity: charitableDeductions > income * 0.5 ? 'high' : 'medium',
        impact: 7,
        likelihood: 0.12,
        currentValue: charitableDeductions,
        benchmark: income * 0.2,
        recommendation: 'Maintain detailed records of all charitable contributions including receipts and acknowledgment letters',
        evidence: ['Donation receipts', 'Bank records', 'Canceled checks', 'Acknowledgment letters']
      });
    }

    // Business Loss Patterns
    const businessIncome = parseFloat(String(formData.businessDetails?.grossReceipts ?? '0'));
    const businessExpenses = parseFloat(String(formData.businessDetails?.businessExpenses ?? '0'));
    if (businessIncome > 0 && businessExpenses > businessIncome) {
      factors.push({
        id: 'business-loss',
        category: 'business',
        name: 'Business Loss',
        description: 'Consistent business losses may raise questions about profit motive',
        severity: 'medium',
        impact: 6,
        likelihood: 0.09,
        currentValue: businessExpenses - businessIncome,
        recommendation: 'Document business purpose and profit motive with business plan and records',
        evidence: ['Business plan', 'Financial records', 'Marketing materials', 'Client contracts']
      });
    }

    // Home Office Deduction
    const homeOfficeDeduction = parseFloat(String(deductions.homeOffice ?? '0'));
    if (homeOfficeDeduction > 0) {
      factors.push({
        id: 'home-office',
        category: 'deductions',
        name: 'Home Office Deduction',
        description: 'Home office deductions are subject to strict requirements and scrutiny',
        severity: 'low',
        impact: 4,
        likelihood: 0.05,
        currentValue: homeOfficeDeduction,
        recommendation: 'Ensure exclusive business use of space and maintain detailed records',
        evidence: ['Floor plan', 'Photos', 'Usage logs', 'Utility bills']
      });
    }

    // Round Numbers Pattern
    const hasRoundNumbers = checkForRoundNumbers();
    if (hasRoundNumbers) {
      factors.push({
        id: 'round-numbers',
        category: 'behavior',
        name: 'Excessive Round Numbers',
        description: 'Too many round numbers may suggest estimates rather than actual records',
        severity: 'low',
        impact: 3,
        likelihood: 0.03,
        recommendation: 'Use actual amounts from receipts and records rather than estimates',
        evidence: ['Original receipts', 'Bank statements', 'Invoices']
      });
    }

    // Earned Income Tax Credit
    const eitc = (taxResult as { earnedIncomeCredit?: number }).earnedIncomeCredit || 0;
    if (eitc > 0) {
      factors.push({
        id: 'eitc-claim',
        category: 'credits',
        name: 'Earned Income Tax Credit',
        description: 'EITC claims are subject to higher audit rates due to compliance issues',
        severity: 'medium',
        impact: 5,
        likelihood: 0.10,
        currentValue: eitc,
        recommendation: 'Ensure all eligibility requirements are met and properly documented',
        evidence: ['Birth certificates', 'School records', 'Income documentation']
      });
    }

    // Foreign Accounts
    if (formData.hasForeignAccounts) {
      factors.push({
        id: 'foreign-accounts',
        category: 'income',
        name: 'Foreign Financial Accounts',
        description: 'Foreign accounts require additional reporting and face scrutiny',
        severity: 'medium',
        impact: 7,
        likelihood: 0.08,
        recommendation: 'Ensure proper FBAR and Form 8938 filing if required',
        evidence: ['Bank statements', 'FBAR filing', 'Form 8938']
      });
    }

    // Large Casualty Loss
    const casualtyLoss = parseFloat(String(deductions.casualtyLoss ?? '0'));
    if (casualtyLoss > 10000) {
      factors.push({
        id: 'casualty-loss',
        category: 'deductions',
        name: 'Large Casualty Loss',
        description: 'Significant casualty losses require substantial documentation',
        severity: 'medium',
        impact: 6,
        likelihood: 0.07,
        currentValue: casualtyLoss,
        recommendation: 'Maintain comprehensive documentation of loss including photos and appraisals',
        evidence: ['Insurance reports', 'Photos', 'Appraisals', 'Police reports']
      });
    }

    return factors;
  }, [formData, taxResult, checkForRoundNumbers]);

  // Memoize audit profile generation
  const auditProfile = useMemo((): AuditProfile => {
    // Calculate overall risk score
    const weightedRisk = riskFactors.reduce((total, factor) => {
      return total + (factor.impact * factor.likelihood);
    }, 0);

    const overallRisk = Math.min(1, weightedRisk / 50); // Normalize to 0-1

    let riskLevel: AuditProfile['riskLevel'];
    if (overallRisk < 0.1) riskLevel = 'very-low';
    else if (overallRisk < 0.25) riskLevel = 'low';
    else if (overallRisk < 0.5) riskLevel = 'moderate';
    else if (overallRisk < 0.75) riskLevel = 'high';
    else riskLevel = 'very-high';

    // Calculate audit probability based on income and risk factors
    const income = taxResult.adjustedGrossIncome ?? 0;
    let baseAuditRate = 0.006; // 0.6% baseline

    if (income > 1000000) baseAuditRate = 0.039;
    else if (income > 500000) baseAuditRate = 0.025;
    else if (income > 200000) baseAuditRate = 0.012;
    else if (income < 25000) baseAuditRate = 0.012; // Higher rate for EITC

    const auditProbability = Math.min(0.5, baseAuditRate * (1 + overallRisk * 3));

    // Generate recommendations
    const recommendations = [
      'Maintain organized records with proper documentation',
      'Keep receipts and supporting documents for all deductions',
      'Ensure all income sources are properly reported',
      'Consider professional tax preparation for complex situations',
      'Review return for accuracy before filing'
    ];

    // Add specific recommendations from high-risk factors
    riskFactors.filter(f => f.severity === 'high' || f.severity === 'critical')
      .forEach(f => recommendations.push(f.recommendation));

    const protectiveFactors = [
      'Complete and accurate documentation',
      'Professional tax preparation',
      'Consistent filing history',
      'Reasonable deduction amounts',
      'Proper business record keeping'
    ];

    const complianceScore = Math.max(0, 100 - (overallRisk * 50));

    return {
      overallRisk,
      riskLevel,
      auditProbability,
      primaryConcerns: riskFactors.filter(f => f.severity === 'high' || f.severity === 'critical'),
      protectiveFactors,
      recommendations,
      complianceScore
    };
  }, [riskFactors, taxResult]);

  const getRiskLevelColor = (level: AuditProfile['riskLevel']) => {
    switch (level) {
      case 'very-low': return 'text-green-600 bg-green-100';
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'very-high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: RiskFactor['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: RiskFactor['severity']) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const tabItems: Array<{
    id: AuditView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'overview', label: translate('audit.riskAssessment.tabs.overview', 'Overview'), icon: Eye },
    { id: 'factors', label: translate('audit.riskAssessment.tabs.factors', 'Risk Factors'), icon: AlertTriangle, count: riskFactors.length },
    { id: 'recommendations', label: translate('audit.riskAssessment.tabs.recommendations', 'Recommendations'), icon: Target },
    { id: 'protection', label: translate('audit.riskAssessment.tabs.protection', 'Protection Tips'), icon: Shield }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {translate('audit.riskAssessment.title', 'AI Audit Risk Assessment')}
        </h3>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-lg p-4 ${getRiskLevelColor(auditProfile.riskLevel)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4" />
            <span className="font-medium">
              {translate('audit.riskAssessment.overallRisk', 'Overall Risk Level')}
            </span>
          </div>
          <div className="text-2xl font-bold capitalize">
            {auditProfile.riskLevel.replace('-', ' ')}
          </div>
          <div className="text-sm opacity-80">
            {translate('audit.riskAssessment.riskScore', 'Risk Score')}:{' '}
            {(auditProfile.overallRisk * 100).toFixed(1)}/100
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-900">
              {translate('audit.riskAssessment.auditProbability', 'Audit Probability')}
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(auditProfile.auditProbability)}
          </div>
          <div className="text-sm text-purple-700">
            {translate('audit.riskAssessment.nationalAverage', 'National average: 0.6%')}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">
              {translate('audit.riskAssessment.complianceScore', 'Compliance Score')}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {auditProfile.complianceScore.toFixed(0)}/100
          </div>
          <div className="text-sm text-green-700">
            {auditProfile.complianceScore >= 80
              ? translate('audit.riskAssessment.compliance.excellent', 'Excellent')
              : auditProfile.complianceScore >= 60
                ? translate('audit.riskAssessment.compliance.good', 'Good')
                : translate('audit.riskAssessment.compliance.needsImprovement', 'Needs Improvement')}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              selectedView === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Assessment Summary</span>
            </div>
            <p className="text-sm text-blue-800">
              Our AI has analyzed your tax return for potential audit triggers and compliance issues.
              This assessment is based on IRS audit patterns, statistical analysis, and known risk factors.
            </p>
          </div>

          {auditProfile.primaryConcerns.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Primary Concerns</h4>
              <div className="space-y-3">
                {auditProfile.primaryConcerns.map((concern) => (
                  <div key={concern.id} className="border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getSeverityColor(concern.severity)}`}>
                        {getSeverityIcon(concern.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{concern.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(concern.severity)}`}>
                            {concern.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{concern.description}</p>
                        <p className="text-sm text-orange-700 font-medium">{concern.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Risk Factors:</span>
                  <span className="font-medium">{riskFactors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Priority Issues:</span>
                  <span className="font-medium text-orange-600">
                    {riskFactors.filter(f => f.severity === 'high' || f.severity === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Income Level:</span>
                  <span className="font-medium">
                    ${(taxResult.adjustedGrossIncome || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Distribution</h4>
              <div className="space-y-2">
                {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
                  const count = riskFactors.filter(f => f.severity === severity).length;
                  const percentage = riskFactors.length > 0 ? (count / riskFactors.length) * 100 : 0;

                  return (
                    <div key={severity} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(severity)} min-w-max`}>
                        {severity}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            severity === 'critical' ? 'bg-red-500' :
                            severity === 'high' ? 'bg-orange-500' :
                            severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-max">{count} items</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Factors Tab */}
      {selectedView === 'factors' && (
        <div className="space-y-4">
          {riskFactors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="text-lg font-medium text-gray-900">No Significant Risk Factors</p>
              <p className="text-sm">Your tax return appears to have minimal audit risk triggers</p>
            </div>
          ) : (
            riskFactors.map((factor) => (
              <div key={factor.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getSeverityColor(factor.severity)}`}>
                    {getSeverityIcon(factor.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{factor.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(factor.severity)}`}>
                        {factor.severity}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {factor.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{factor.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs font-medium text-gray-700">Impact Score:</span>
                        <div className="text-sm font-medium">{factor.impact}/10</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-700">Audit Likelihood:</span>
                        <div className="text-sm font-medium">{formatPercentage(factor.likelihood)}</div>
                      </div>
                      {factor.currentValue !== undefined && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Current Value:</span>
                          <div className="text-sm font-medium">${factor.currentValue.toLocaleString()}</div>
                        </div>
                      )}
                      {factor.benchmark !== undefined && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Benchmark:</span>
                          <div className="text-sm font-medium">${factor.benchmark.toLocaleString()}</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="text-xs font-medium text-blue-900 mb-1">Recommendation:</div>
                      <div className="text-sm text-blue-800">{factor.recommendation}</div>

                      {factor.evidence && factor.evidence.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-blue-900 mb-1">Required Documentation:</div>
                          <div className="flex flex-wrap gap-1">
                            {factor.evidence.map((doc, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedView === 'recommendations' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Personalized Recommendations</span>
            </div>
            <p className="text-sm text-green-800">
              Follow these recommendations to minimize audit risk and ensure compliance.
            </p>
          </div>

          <div className="space-y-3">
            {auditProfile.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protection Tips Tab */}
      {selectedView === 'protection' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Protective Factors</h4>
            <div className="space-y-3">
              {auditProfile.protectiveFactors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">If You're Audited</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="p-3 border rounded-lg">
                <strong className="text-gray-900">Stay Calm and Organized:</strong> Respond promptly to IRS correspondence and gather all requested documents.
              </div>
              <div className="p-3 border rounded-lg">
                <strong className="text-gray-900">Know Your Rights:</strong> You have the right to representation and to understand why you're being examined.
              </div>
              <div className="p-3 border rounded-lg">
                <strong className="text-gray-900">Get Professional Help:</strong> Consider hiring a tax professional or attorney experienced with audits.
              </div>
              <div className="p-3 border rounded-lg">
                <strong className="text-gray-900">Keep Records:</strong> Maintain copies of all correspondence and documents exchanged with the IRS.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
