/**
 * Tax Optimization Suggestions
 * Uses tax engine v2 for accurate calculations with cents-based calculations
 *
 * NOTE: UITaxResult fields are in DOLLARS, engine calculations are in CENTS
 */
import { calculateTaxResultsWithEngine, UITaxResult } from './engineAdapter';
import type {
  UIPersonalInfo,
  UIIncomeData,
  UIK1Data,
  UIBusinessDetails,
  UIPaymentsData,
  UIDeductions,
  UISpouseInfo,
} from './engineAdapter';
import { centsToDollars, dollarsToCents } from '../engine/util/money';

// Localized text constants
const OPTIMIZATION_TEXT = {
  charitable: {
    titleEn: 'Charitable Donation Optimization',
    titleEs: 'Optimización de Donaciones Caritativas',
    titleZh: '慈善捐款优化',
    descriptionEn: (amount: string, savings: string) => `Adding ${amount} in charitable donations could save ${savings} in taxes`,
    descriptionEs: (amount: string, savings: string) => `Agregar ${amount} en donaciones caritativas podría ahorrar ${savings} en impuestos`,
    descriptionZh: (amount: string, savings: string) => `增加${amount}的慈善捐款可节省${savings}的税款`,
  },
  deduction: {
    titleEn: 'Itemized Deduction Opportunity',
    titleEs: 'Oportunidad de Deducción Detallada',
    titleZh: '逐项扣除机会',
    descriptionEn: (gap: string, needed: string, savings: string) =>
      `You're ${gap} away from benefiting from itemized deductions. Adding ${needed} in deductible expenses could save ${savings}`,
    descriptionEs: (gap: string, needed: string, savings: string) =>
      `Estás a ${gap} de beneficiarte de deducciones detalladas. Agregar ${needed} en gastos deducibles podría ahorrar ${savings}`,
    descriptionZh: (gap: string, needed: string, savings: string) =>
      `您距离逐项扣除还差${gap}。增加${needed}的可扣除费用可节省${savings}`,
  },
  business: {
    titleEn: 'Business Expense Optimization',
    titleEs: 'Optimización de Gastos Comerciales',
    titleZh: '商业费用优化',
    descriptionEn: (amount: string, savings: string) =>
      `Consider additional legitimate business expenses of ${amount} to potentially save ${savings} in taxes`,
    descriptionEs: (amount: string, savings: string) =>
      `Considere gastos comerciales legítimos adicionales de ${amount} para potencialmente ahorrar ${savings} en impuestos`,
    descriptionZh: (amount: string, savings: string) =>
      `考虑增加${amount}的合法商业费用，可能节省${savings}的税款`,
  },
  retirement: {
    titleEn: 'Retirement Savings Optimization',
    titleEs: 'Optimización de Ahorros para la Jubilación',
    titleZh: '退休储蓄优化',
    descriptionEn: (amount: string, savings: string) =>
      `Consider contributing ${amount} to 401k to save ${savings} in current taxes`,
    descriptionEs: (amount: string, savings: string) =>
      `Considere contribuir ${amount} a 401k para ahorrar ${savings} en impuestos actuales`,
    descriptionZh: (amount: string, savings: string) =>
      `考虑向401k缴纳${amount}以节省${savings}的当前税款`,
  },
};

interface TaxOptimization {
  type: string;
  title: string;
  titleEn: string;
  titleEs: string;
  description: string;
  descriptionEn: string;
  descriptionEs: string;
  amount: number; // In cents
  savings: number; // In cents
  netCost?: number; // In cents
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

// Helper to format currency from cents
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centsToDollars(cents));
};

// Helper to calculate tax using the new engine
const calculateTax = (
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  paymentsData: UIPaymentsData,
  deductions: UIDeductions,
  spouseInfo: UISpouseInfo,
): UITaxResult => {
  const result = calculateTaxResultsWithEngine(
    personalInfo,
    incomeData,
    k1Data,
    businessDetails,
    paymentsData,
    deductions,
    spouseInfo
  );
  return result.result;
};

export const generateTaxOptimizations = (
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  paymentsData: UIPaymentsData,
  deductions: UIDeductions,
  spouseInfo: UISpouseInfo,
): TaxOptimization[] => {
  const currentResults = calculateTax(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);
  const suggestions: TaxOptimization[] = [];

  // 1. Charitable Contributions Optimization
  const charitableOptimization = calculateCharitableOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo, currentResults
  );
  if (charitableOptimization) {
    suggestions.push(charitableOptimization);
  }

  // 2. Standard vs Itemized Deduction Optimization
  const deductionOptimization = calculateDeductionOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo, currentResults
  );
  if (deductionOptimization) {
    suggestions.push(deductionOptimization);
  }

  // 3. Business Expense Optimization
  const businessOptimization = calculateBusinessOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo, currentResults
  );
  if (businessOptimization) {
    suggestions.push(businessOptimization);
  }

  // 4. Retirement Contribution Optimization
  const retirementOptimization = calculateRetirementOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo, currentResults
  );
  if (retirementOptimization) {
    suggestions.push(retirementOptimization);
  }

  return suggestions;
};

const calculateCharitableOptimization = (
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  paymentsData: UIPaymentsData,
  deductions: UIDeductions,
  spouseInfo: UISpouseInfo,
  currentResults: UITaxResult
): TaxOptimization | null => {
  // Only suggest if not using standard deduction or if itemizing would be better
  const currentCharitable = Number(deductions.charitableContributions) || 0;

  // Test scenarios: $500, $1000, $2000, $5000 additional charitable donations
  const testAmounts = [500, 1000, 2000, 5000];
  const bestSuggestion = { amount: 0, savings: 0, netCost: 0 };

  testAmounts.forEach(additionalAmount => {
    const newCharitable = currentCharitable + additionalAmount;
    const newDeductions: UIDeductions = {
      ...deductions,
      charitableContributions: newCharitable.toString(),
      itemizeDeductions: true, // Explicitly enable itemized deductions
    };

    const newResults = calculateTax(personalInfo, incomeData, k1Data, businessDetails, paymentsData, newDeductions, spouseInfo);

    // Convert dollars to cents for comparison (UITaxResult fields are in dollars)
    const currentTaxCents = dollarsToCents(currentResults.totalTax);
    const newTaxCents = dollarsToCents(newResults.totalTax);
    const taxSavings = currentTaxCents - newTaxCents;

    if (taxSavings > bestSuggestion.savings && taxSavings > 0) {
      bestSuggestion.amount = dollarsToCents(additionalAmount);
      bestSuggestion.savings = taxSavings;
      bestSuggestion.netCost = dollarsToCents(additionalAmount) - taxSavings;
    }
  });

  if (bestSuggestion.savings > 0) {
    const amountStr = formatCurrency(bestSuggestion.amount);
    const savingsStr = formatCurrency(bestSuggestion.savings);

    return {
      type: 'charitable',
      title: OPTIMIZATION_TEXT.charitable.titleEn,
      titleEn: OPTIMIZATION_TEXT.charitable.titleEn,
      titleEs: OPTIMIZATION_TEXT.charitable.titleEs,
      description: OPTIMIZATION_TEXT.charitable.descriptionEn(amountStr, savingsStr),
      descriptionEn: OPTIMIZATION_TEXT.charitable.descriptionEn(amountStr, savingsStr),
      descriptionEs: OPTIMIZATION_TEXT.charitable.descriptionEs(amountStr, savingsStr),
      amount: bestSuggestion.amount, // In cents
      savings: bestSuggestion.savings, // In cents
      netCost: bestSuggestion.netCost, // In cents
      priority: bestSuggestion.savings > bestSuggestion.amount * 0.2 ? 'high' : 'medium',
      icon: 'HEART',
    };
  }

  return null;
};

const calculateDeductionOptimization = (
  personalInfo: UIPersonalInfo,
  _incomeData: UIIncomeData,
  _k1Data: UIK1Data,
  _businessDetails: UIBusinessDetails,
  _paymentsData: UIPaymentsData,
  deductions: UIDeductions,
  _spouseInfo: UISpouseInfo,
  currentResults: UITaxResult
): TaxOptimization | null => {
  const currentItemizedTotal = calculateItemizedTotal(deductions);
  const standardDeductionDollars = currentResults.standardDeduction; // Already in dollars

  // NOTE: The tax engine AUTOMATICALLY chooses the better deduction method
  // (standard vs itemized), so we can't suggest switching - it's already optimal.
  // Instead, we suggest increasing itemized deductions to exceed standard.

  // If itemized is close to standard, suggest additional deductions to push it over
  const gap = standardDeductionDollars - currentItemizedTotal; // In dollars
  if (gap > 0 && gap < 5000) {
    // Within $5000 of standard
    const marginalRate = calculateMarginalRate(
      dollarsToCents(currentResults.taxableIncome),
      personalInfo.filingStatus
    );
    const additionalNeeded = Math.ceil(gap) + 100; // Add $100 buffer (in dollars)
    const potentialSavings = dollarsToCents(additionalNeeded * marginalRate); // Convert to cents

    if (potentialSavings > dollarsToCents(50)) {
      // Only suggest if meaningful
      const gapStr = formatCurrency(dollarsToCents(gap));
      const neededStr = formatCurrency(dollarsToCents(additionalNeeded));
      const savingsStr = formatCurrency(potentialSavings);

      return {
        type: 'deduction',
        title: OPTIMIZATION_TEXT.deduction.titleEn,
        titleEn: OPTIMIZATION_TEXT.deduction.titleEn,
        titleEs: OPTIMIZATION_TEXT.deduction.titleEs,
        description: OPTIMIZATION_TEXT.deduction.descriptionEn(gapStr, neededStr, savingsStr),
        descriptionEn: OPTIMIZATION_TEXT.deduction.descriptionEn(gapStr, neededStr, savingsStr),
        descriptionEs: OPTIMIZATION_TEXT.deduction.descriptionEs(gapStr, neededStr, savingsStr),
        amount: dollarsToCents(additionalNeeded), // In cents
        savings: potentialSavings, // In cents
        priority: 'medium',
        icon: 'CHECKBOX',
      };
    }
  }

  return null;
};

const calculateBusinessOptimization = (
  personalInfo: UIPersonalInfo,
  _incomeData: UIIncomeData,
  _k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  _paymentsData: UIPaymentsData,
  _deductions: UIDeductions,
  _spouseInfo: UISpouseInfo,
  currentResults: UITaxResult
): TaxOptimization | null => {
  const currentBusinessIncome = Number(businessDetails.grossReceipts) || 0;

  if (currentBusinessIncome > 0) {
    // Suggest additional business expenses that could reduce tax
    const additionalExpenses = Math.min(currentBusinessIncome * 0.1, 5000); // Up to 10% or $5000 (in dollars)
    const marginalRate = calculateMarginalRate(
      dollarsToCents(currentResults.taxableIncome),
      personalInfo.filingStatus
    );
    const potentialSavings = dollarsToCents(additionalExpenses * (marginalRate + 0.153)); // Include self-employment tax

    if (potentialSavings > dollarsToCents(100)) {
      const amountStr = formatCurrency(dollarsToCents(additionalExpenses));
      const savingsStr = formatCurrency(potentialSavings);

      return {
        type: 'business',
        title: OPTIMIZATION_TEXT.business.titleEn,
        titleEn: OPTIMIZATION_TEXT.business.titleEn,
        titleEs: OPTIMIZATION_TEXT.business.titleEs,
        description: OPTIMIZATION_TEXT.business.descriptionEn(amountStr, savingsStr),
        descriptionEn: OPTIMIZATION_TEXT.business.descriptionEn(amountStr, savingsStr),
        descriptionEs: OPTIMIZATION_TEXT.business.descriptionEs(amountStr, savingsStr),
        amount: dollarsToCents(additionalExpenses), // In cents
        savings: potentialSavings, // In cents
        priority: 'medium',
        icon: 'DIAMOND',
      };
    }
  }

  return null;
};

const calculateRetirementOptimization = (
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  _k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  _paymentsData: UIPaymentsData,
  _deductions: UIDeductions,
  _spouseInfo: UISpouseInfo,
  currentResults: UITaxResult
): TaxOptimization | null => {
  const wages = Number(incomeData.wages) || 0;
  const businessIncome =
    Number(businessDetails.grossReceipts) -
    Number(businessDetails.costOfGoodsSold) -
    Number(businessDetails.businessExpenses);

  if (wages > 0 || businessIncome > 0) {
    // 401k contribution limits for 2025
    // Calculate age from birthDate if available
    let age = 0;
    if (personalInfo.birthDate) {
      const birthDate = new Date(personalInfo.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    const maxContribution = age >= 50 ? 31000 : 23500;
    const suggestedContribution = Math.min(maxContribution, (wages + Math.max(0, businessIncome)) * 0.15); // In dollars

    const marginalRate = calculateMarginalRate(
      dollarsToCents(currentResults.taxableIncome),
      personalInfo.filingStatus
    );
    const taxSavings = dollarsToCents(suggestedContribution * marginalRate); // Convert to cents

    if (taxSavings > dollarsToCents(500)) {
      const amountStr = formatCurrency(dollarsToCents(suggestedContribution));
      const savingsStr = formatCurrency(taxSavings);

      return {
        type: 'retirement',
        title: OPTIMIZATION_TEXT.retirement.titleEn,
        titleEn: OPTIMIZATION_TEXT.retirement.titleEn,
        titleEs: OPTIMIZATION_TEXT.retirement.titleEs,
        description: OPTIMIZATION_TEXT.retirement.descriptionEn(amountStr, savingsStr),
        descriptionEn: OPTIMIZATION_TEXT.retirement.descriptionEn(amountStr, savingsStr),
        descriptionEs: OPTIMIZATION_TEXT.retirement.descriptionEs(amountStr, savingsStr),
        amount: dollarsToCents(suggestedContribution), // In cents
        savings: taxSavings, // In cents
        priority: 'high',
        icon: 'SECTION',
      };
    }
  }

  return null;
};

const calculateItemizedTotal = (deductions: UIDeductions): number => {
  return (
    (Number(deductions.mortgageInterest) || 0) +
    (Number(deductions.stateLocalTaxes) || 0) +
    (Number(deductions.charitableContributions) || 0) +
    (Number(deductions.medicalExpenses) || 0) +
    (Number(deductions.otherItemized) || 0)
  );
};

/**
 * Calculate marginal tax rate based on taxable income (in cents) and filing status
 * Returns decimal rate (e.g., 0.22 for 22%)
 */
const calculateMarginalRate = (taxableIncomeCents: number, filingStatus: string): number => {
  const taxableIncomeDollars = centsToDollars(taxableIncomeCents);
  if (taxableIncomeDollars <= 0) return 0;

  // 2025 Federal Tax Brackets (amounts in dollars)
  interface Bracket {
    max: number;
    rate: number;
  }

  const brackets: Record<string, Bracket[]> = {
    single: [
      { max: 11925, rate: 0.1 },
      { max: 48475, rate: 0.12 },
      { max: 103350, rate: 0.22 },
      { max: 197300, rate: 0.24 },
      { max: 250525, rate: 0.32 },
      { max: 626350, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    marriedJointly: [
      { max: 23850, rate: 0.1 },
      { max: 96950, rate: 0.12 },
      { max: 206700, rate: 0.22 },
      { max: 394600, rate: 0.24 },
      { max: 501050, rate: 0.32 },
      { max: 751600, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    marriedSeparately: [
      { max: 11925, rate: 0.1 },
      { max: 48475, rate: 0.12 },
      { max: 103350, rate: 0.22 },
      { max: 197300, rate: 0.24 },
      { max: 250525, rate: 0.32 },
      { max: 375800, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    headOfHousehold: [
      { max: 17000, rate: 0.1 },
      { max: 64850, rate: 0.12 },
      { max: 103350, rate: 0.22 },
      { max: 197300, rate: 0.24 },
      { max: 250500, rate: 0.32 },
      { max: 626350, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
  };

  const statusBrackets = brackets[filingStatus];
  if (!statusBrackets) {
    // Fallback to single if filing status not found
    return calculateMarginalRate(taxableIncomeCents, 'single');
  }

  for (const bracket of statusBrackets) {
    if (taxableIncomeDollars <= bracket.max) {
      return bracket.rate;
    }
  }

  // Should never reach here due to Infinity bracket, but return max rate as fallback
  return 0.37;
};
