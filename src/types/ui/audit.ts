/**
 * Centralized audit risk assessment type definitions
 * Used by AuditRiskAssessment and AuditSupport components
 */

import type { TaxContextValue } from '../../contexts/TaxContext';

/**
 * Audit view tabs
 */
export type AuditView = 'overview' | 'factors' | 'recommendations' | 'protection';

/**
 * Risk factor categories
 */
export type RiskCategory = 'income' | 'deductions' | 'credits' | 'business' | 'schedule' | 'behavior';

/**
 * Risk severity levels
 */
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Overall risk assessment levels
 */
export type RiskLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';

/**
 * Individual risk factor
 */
export interface RiskFactor {
  id: string;
  category: RiskCategory;
  name: string;
  description: string;
  severity: RiskSeverity;
  impact: number; // 1-10 scale
  likelihood: number; // 0-1 probability
  currentValue?: number;
  benchmark?: number;
  recommendation: string;
  evidence: string[];
}

/**
 * Complete audit risk profile
 */
export interface AuditProfile {
  overallRisk: number; // 0-1 scale
  riskLevel: RiskLevel;
  auditProbability: number;
  primaryConcerns: RiskFactor[];
  protectiveFactors: string[];
  recommendations: string[];
  complianceScore: number;
}

/**
 * Form data for audit assessment
 */
export interface AuditRiskAssessmentFormData {
  personalInfo: TaxContextValue['personalInfo'];
  incomeData: TaxContextValue['incomeData'];
  deductions: TaxContextValue['deductions'];
  businessDetails?: Partial<TaxContextValue['businessDetails']>;
  hasForeignAccounts?: boolean;
}

/**
 * Document status for audit preparation
 */
export interface DocumentStatus {
  type: string;
  required: boolean;
  status: 'missing' | 'partial' | 'complete';
  notes?: string;
}

/**
 * Audit preparation checklist item
 */
export interface AuditChecklistItem {
  id: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  documentLinks?: string[];
}
