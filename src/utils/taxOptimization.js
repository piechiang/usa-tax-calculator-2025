import { calculateTaxResults } from './taxCalculations';
import { formatCurrency } from './formatters';

export const generateTaxOptimizations = (personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions) => {
  const currentResults = calculateTaxResults(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions);
  const suggestions = [];

  // 1. Charitable Contributions Optimization
  const charitableOptimization = calculateCharitableOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults
  );
  if (charitableOptimization) {
    suggestions.push(charitableOptimization);
  }

  // 2. Standard vs Itemized Deduction Optimization
  const deductionOptimization = calculateDeductionOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults
  );
  if (deductionOptimization) {
    suggestions.push(deductionOptimization);
  }

  // 3. Business Expense Optimization
  const businessOptimization = calculateBusinessOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults
  );
  if (businessOptimization) {
    suggestions.push(businessOptimization);
  }

  // 4. Retirement Contribution Optimization
  const retirementOptimization = calculateRetirementOptimization(
    personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults
  );
  if (retirementOptimization) {
    suggestions.push(retirementOptimization);
  }

  return suggestions;
};

const calculateCharitableOptimization = (personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults) => {
  // Only suggest if not using standard deduction or if itemizing would be better
  const currentCharitable = Number(deductions.charitableContributions) || 0;
  const currentItemizedTotal = calculateItemizedTotal(deductions);
  
  // Test scenarios: $500, $1000, $2000, $5000 additional charitable donations
  const testAmounts = [500, 1000, 2000, 5000];
  const bestSuggestion = { amount: 0, savings: 0 };

  testAmounts.forEach(additionalAmount => {
    const newCharitable = currentCharitable + additionalAmount;
    const newDeductions = {
      ...deductions,
      charitableContributions: newCharitable.toString(),
      useStandardDeduction: false, // Force itemized to see benefit
      itemizedTotal: currentItemizedTotal + additionalAmount
    };

    const newResults = calculateTaxResults(personalInfo, incomeData, k1Data, businessDetails, paymentsData, newDeductions);
    const taxSavings = currentResults.totalTax - newResults.totalTax;
    const netBenefit = taxSavings - additionalAmount; // Net benefit after donation

    if (taxSavings > bestSuggestion.savings && taxSavings > 0) {
      bestSuggestion.amount = additionalAmount;
      bestSuggestion.savings = taxSavings;
      bestSuggestion.netCost = additionalAmount - taxSavings;
    }
  });

  if (bestSuggestion.savings > 0) {
    return {
      type: 'charitable',
      title: '慈善捐赠优化建议',
      titleEn: 'Charitable Donation Optimization',
      titleEs: 'Optimización de Donaciones Caritativas',
      description: `增加慈善捐赠 ${formatCurrency(bestSuggestion.amount)}，可节省税款 ${formatCurrency(bestSuggestion.savings)}`,
      descriptionEn: `Adding ${formatCurrency(bestSuggestion.amount)} in charitable donations could save ${formatCurrency(bestSuggestion.savings)} in taxes`,
      descriptionEs: `Agregar ${formatCurrency(bestSuggestion.amount)} en donaciones caritativas podría ahorrar ${formatCurrency(bestSuggestion.savings)} en impuestos`,
      amount: bestSuggestion.amount,
      savings: bestSuggestion.savings,
      netCost: bestSuggestion.netCost,
      priority: bestSuggestion.savings > bestSuggestion.amount * 0.2 ? 'high' : 'medium',
      icon: '♥'
    };
  }

  return null;
};

const calculateDeductionOptimization = (personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults) => {
  const currentItemizedTotal = calculateItemizedTotal(deductions);
  const standardDeduction = deductions.standardDeduction;

  // If currently using standard but itemized would be better
  if (deductions.useStandardDeduction && currentItemizedTotal > standardDeduction) {
    const newDeductions = { ...deductions, useStandardDeduction: false, itemizedTotal: currentItemizedTotal };
    const newResults = calculateTaxResults(personalInfo, incomeData, k1Data, businessDetails, paymentsData, newDeductions);
    const savings = currentResults.totalTax - newResults.totalTax;

    if (savings > 0) {
      return {
        type: 'deduction',
        title: '扣除方式优化建议',
        titleEn: 'Deduction Method Optimization',
        titleEs: 'Optimización del Método de Deducción',
        description: `使用分项扣除而非标准扣除，可节省税款 ${formatCurrency(savings)}`,
        descriptionEn: `Switch to itemized deductions instead of standard deduction to save ${formatCurrency(savings)}`,
        descriptionEs: `Cambiar a deducciones detalladas en lugar de deducción estándar para ahorrar ${formatCurrency(savings)}`,
        savings: savings,
        priority: 'high',
        icon: '□'
      };
    }
  }

  // If currently itemizing but standard would be better
  if (!deductions.useStandardDeduction && standardDeduction > currentItemizedTotal) {
    const savings = standardDeduction - currentItemizedTotal;
    const marginalRate = calculateMarginalRate(currentResults.adjustedGrossIncome, personalInfo.filingStatus);
    const taxSavings = savings * marginalRate;

    if (taxSavings > 10) { // Only suggest if meaningful savings
      return {
        type: 'deduction',
        title: '扣除方式优化建议',
        titleEn: 'Deduction Method Optimization',
        titleEs: 'Optimización del Método de Deducción',
        description: `使用标准扣除而非分项扣除，可节省税款约 ${formatCurrency(taxSavings)}`,
        descriptionEn: `Switch to standard deduction instead of itemized deductions to save approximately ${formatCurrency(taxSavings)}`,
        descriptionEs: `Cambiar a deducción estándar en lugar de deducciones detalladas para ahorrar aproximadamente ${formatCurrency(taxSavings)}`,
        savings: taxSavings,
        priority: 'medium',
        icon: '□'
      };
    }
  }

  return null;
};

const calculateBusinessOptimization = (personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults) => {
  const currentBusinessIncome = Number(businessDetails.grossReceipts) || 0;
  const currentExpenses = Number(businessDetails.businessExpenses) || 0;
  
  if (currentBusinessIncome > 0) {
    // Suggest additional business expenses that could reduce tax
    const additionalExpenses = Math.min(currentBusinessIncome * 0.1, 5000); // Up to 10% or $5000
    const marginalRate = calculateMarginalRate(currentResults.adjustedGrossIncome, personalInfo.filingStatus);
    const potentialSavings = additionalExpenses * (marginalRate + 0.153); // Include self-employment tax

    if (potentialSavings > 100) {
      return {
        type: 'business',
        title: '商业费用优化建议',
        titleEn: 'Business Expense Optimization',
        titleEs: 'Optimización de Gastos Comerciales',
        description: `考虑增加合理的商业费用支出 ${formatCurrency(additionalExpenses)}，可能节省税款 ${formatCurrency(potentialSavings)}`,
        descriptionEn: `Consider additional legitimate business expenses of ${formatCurrency(additionalExpenses)} to potentially save ${formatCurrency(potentialSavings)} in taxes`,
        descriptionEs: `Considere gastos comerciales legítimos adicionales de ${formatCurrency(additionalExpenses)} para potencialmente ahorrar ${formatCurrency(potentialSavings)} en impuestos`,
        amount: additionalExpenses,
        savings: potentialSavings,
        priority: 'medium',
        icon: '◆'
      };
    }
  }

  return null;
};

const calculateRetirementOptimization = (personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, currentResults) => {
  const wages = Number(incomeData.wages) || 0;
  const businessIncome = Number(businessDetails.grossReceipts) - Number(businessDetails.costOfGoodsSold) - Number(businessDetails.businessExpenses);
  
  if (wages > 0 || businessIncome > 0) {
    // 401k contribution limits for 2025
    const maxContribution = personalInfo.dependents >= 50 ? 31000 : 23500;
    const suggestedContribution = Math.min(maxContribution, (wages + Math.max(0, businessIncome)) * 0.15);
    
    const marginalRate = calculateMarginalRate(currentResults.adjustedGrossIncome, personalInfo.filingStatus);
    const taxSavings = suggestedContribution * marginalRate;

    if (taxSavings > 500) {
      return {
        type: 'retirement',
        title: '退休储蓄优化建议',
        titleEn: 'Retirement Savings Optimization',
        titleEs: 'Optimización de Ahorros para la Jubilación',
        description: `考虑401k缴费 ${formatCurrency(suggestedContribution)}，可节省当前税款 ${formatCurrency(taxSavings)}`,
        descriptionEn: `Consider contributing ${formatCurrency(suggestedContribution)} to 401k to save ${formatCurrency(taxSavings)} in current taxes`,
        descriptionEs: `Considere contribuir ${formatCurrency(suggestedContribution)} a 401k para ahorrar ${formatCurrency(taxSavings)} en impuestos actuales`,
        amount: suggestedContribution,
        savings: taxSavings,
        priority: 'high',
        icon: '§'
      };
    }
  }

  return null;
};

const calculateItemizedTotal = (deductions) => {
  return (Number(deductions.mortgageInterest) || 0) +
         (Number(deductions.stateLocalTaxes) || 0) +
         (Number(deductions.charitableContributions) || 0) +
         (Number(deductions.medicalExpenses) || 0) +
         (Number(deductions.otherItemized) || 0);
};

const calculateMarginalRate = (agi, filingStatus) => {
  // Simplified marginal rate calculation based on 2025 brackets
  if (filingStatus === 'single') {
    if (agi > 626350) return 0.37;
    if (agi > 250525) return 0.35;
    if (agi > 197300) return 0.32;
    if (agi > 103350) return 0.24;
    if (agi > 48475) return 0.22;
    if (agi > 11925) return 0.12;
    return 0.10;
  } else if (filingStatus === 'marriedJointly') {
    if (agi > 751600) return 0.37;
    if (agi > 501050) return 0.35;
    if (agi > 394600) return 0.32;
    if (agi > 206700) return 0.24;
    if (agi > 96950) return 0.22;
    if (agi > 23850) return 0.12;
    return 0.10;
  }
  // Default for other filing statuses
  return 0.22;
};