#!/usr/bin/env node
/**
 * State Tax Engine Generator
 * 州税引擎生成器
 *
 * This script creates a complete state tax engine skeleton with all necessary files
 * 此脚本创建一个完整的州税引擎骨架，包含所有必要文件
 *
 * Usage: npx tsx scripts/createStateEngine.ts <STATE_CODE> [options]
 * Example: npx tsx scripts/createStateEngine.ts NY --name "New York" --type graduated
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration / 配置
// ============================================================================

interface StateEngineConfig {
  code: string;              // Two-letter code (e.g., "NY")
  name: string;              // Full name (e.g., "New York")
  taxType: 'flat' | 'graduated' | 'none';
  hasLocalTax: boolean;
  hasStateEITC: boolean;
  stateEITCPercent?: number;
  authoritativeSource: string;
}

// ============================================================================
// Template Generators / 模板生成器
// ============================================================================

/**
 * Generate main calculator file
 */
function generateCalculatorTemplate(config: StateEngineConfig, year: number): string {
  const { code, name } = config;
  const codeLower = code.toLowerCase();
  const codeUpper = code.toUpperCase();

  return `import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import type { FederalResult2025 } from '../../../types';
import { ${codeUpper}_RULES_${year} } from '../../../rules/${year}/states/${codeLower}';
import {
  addCents,
  max0,
  multiplyCents
} from '../../../util/money';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

/**
 * Compute ${name} state tax for ${year}
 *
 * TODO: Add description of ${name}'s tax system
 *
 * Sources:
 * - ${config.authoritativeSource}
 * - ${name} Tax Forms and Instructions
 *
 * Key Features:
 * - TODO: Document key features of ${name} tax system
 *
 * @param input State tax input with federal results
 * @returns ${name} state tax calculation result
 */
export function compute${codeUpper}${year}(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus } = input;

  // Step 1: Calculate ${name} AGI
  const ${codeLower}AGI = calculate${codeUpper}AGI(input);

  // Step 2: Calculate deductions and exemptions
  const deductionsAndExemptions = calculate${codeUpper}DeductionsAndExemptions(input, ${codeLower}AGI);

  // Step 3: Calculate ${name} taxable income
  const ${codeLower}TaxableIncome = max0(${codeLower}AGI - deductionsAndExemptions);

  // Step 4: Calculate ${name} state tax
  const ${codeLower}StateTax = calculateTaxFromBrackets(${codeLower}TaxableIncome, ${codeUpper}_RULES_${year}.brackets);

  // Step 5: Calculate local tax (if applicable)
  const localTax = ${config.hasLocalTax ? `calculate${codeUpper}LocalTax(input.county, ${codeLower}TaxableIncome)` : '0'};

  // Step 6: Calculate ${name} credits
  const credits = calculate${codeUpper}Credits(input, federalResult, ${codeLower}AGI, ${codeLower}StateTax);

  // Step 7: Calculate net ${name} tax after credits
  const net${codeUpper}StateTax = max0(${codeLower}StateTax - credits.nonRefundableCredits);
  const totalStateLiability = addCents(net${codeUpper}StateTax, localTax);

  // Step 8: Calculate payments and refund/owe
  const stateWithheld = input.stateWithheld || 0;
  const stateEstPayments = input.stateEstPayments || 0;
  const totalPayments = addCents(stateWithheld, stateEstPayments);
  const stateRefundOrOwe = totalPayments + credits.refundableCredits - totalStateLiability;

  return {
    stateAGI: ${codeLower}AGI,
    stateTaxableIncome: ${codeLower}TaxableIncome,
    stateTax: net${codeUpper}StateTax,
    localTax,
    totalStateLiability,
    stateDeduction: deductionsAndExemptions,
    stateCredits: credits,
    stateWithheld,
    stateEstPayments,
    stateRefundOrOwe,
    state: '${codeUpper}',
    ${config.hasLocalTax ? "...(input.county && { county: input.county })," : ""}
    taxYear: ${year},
    formReferences: ['TODO: Add form references'],
    calculationNotes: [
      '${name} standard deduction and personal exemptions applied',
      ${config.hasLocalTax ? "localTax > 0 ? `Local tax for \\${input.county} applied` : undefined," : ""}
      credits.earned_income && credits.earned_income > 0 ? '${name} EITC applied' : undefined
    ].filter(Boolean) as string[]
  };
}

/**
 * Calculate ${name} Adjusted Gross Income
 *
 * TODO: Document ${name}-specific AGI adjustments
 *
 * @param input - State tax input containing federal AGI and state-specific adjustments
 * @returns ${name} AGI in cents
 */
function calculate${codeUpper}AGI(input: StateTaxInput): number {
  let ${codeLower}AGI = input.federalResult.agi;

  // ${name} additions to income
  if (input.stateAdditions) {
    ${codeLower}AGI += input.stateAdditions.federalTaxRefund || 0;
    ${codeLower}AGI += input.stateAdditions.municipalBondInterest || 0;
    ${codeLower}AGI += input.stateAdditions.otherAdditions || 0;
  }

  // ${name} subtractions from income
  if (input.stateSubtractions) {
    ${codeLower}AGI -= input.stateSubtractions.socialSecurityBenefits || 0;
    ${codeLower}AGI -= input.stateSubtractions.retirementIncome || 0;
    ${codeLower}AGI -= input.stateSubtractions.militaryPay || 0;
    ${codeLower}AGI -= input.stateSubtractions.otherSubtractions || 0;
  }

  return max0(${codeLower}AGI);
}

/**
 * Calculate ${name} deductions and exemptions
 *
 * TODO: Implement ${name}-specific deduction rules
 *
 * @param input - State tax input
 * @param ${codeLower}AGI - ${name} AGI
 * @returns Total deductions and exemptions in cents
 */
function calculate${codeUpper}DeductionsAndExemptions(
  input: StateTaxInput,
  ${codeLower}AGI: number
): number {
  const { filingStatus } = input;
  const rules = ${codeUpper}_RULES_${year};

  // Standard deduction
  const standardDeduction = rules.standardDeduction[filingStatus];

  // Itemized deductions (TODO: implement state-specific rules)
  let itemizedDeduction = 0;
  if (input.stateItemized) {
    itemizedDeduction += input.stateItemized.medicalExpenses || 0;
    itemizedDeduction += input.stateItemized.propertyTaxes || 0;
    itemizedDeduction += input.stateItemized.mortgageInterest || 0;
    itemizedDeduction += input.stateItemized.charitableContributions || 0;
    itemizedDeduction += input.stateItemized.other || 0;
  }

  // Use greater of standard or itemized
  const deduction = Math.max(standardDeduction, itemizedDeduction);

  // Personal exemptions (if applicable)
  const exemptions = rules.personalExemption
    ? rules.personalExemption * (1 + (input.stateDependents || 0))
    : 0;

  return deduction + exemptions;
}

${config.hasLocalTax ? `
/**
 * Calculate ${name} local tax
 *
 * TODO: Implement local tax calculation based on county/city
 *
 * @param county - County name
 * @param taxableIncome - ${name} taxable income
 * @returns Local tax in cents
 */
function calculate${codeUpper}LocalTax(county: string | undefined, taxableIncome: number): number {
  if (!county) return 0;

  // TODO: Look up local tax rate by county
  const localRate = ${codeUpper}_RULES_${year}.localRates?.[county] || 0;
  return multiplyCents(taxableIncome, localRate);
}
` : ''}

/**
 * Calculate ${name} tax credits
 *
 * TODO: Implement ${name}-specific credit calculations
 *
 * @param input - State tax input
 * @param federalResult - Federal tax calculation result
 * @param ${codeLower}AGI - ${name} AGI
 * @param ${codeLower}Tax - ${name} tax before credits
 * @returns ${name} tax credits
 */
function calculate${codeUpper}Credits(
  input: StateTaxInput,
  federalResult: FederalResult2025,
  ${codeLower}AGI: number,
  ${codeLower}Tax: number
): StateCredits {
  let nonRefundableCredits = 0;
  let refundableCredits = 0;

  ${config.hasStateEITC && config.stateEITCPercent ? `
  // ${name} EITC (${config.stateEITCPercent * 100}% of federal EITC)
  const ${codeLower}EITC = multiplyCents(
    federalResult.credits.eitc || 0,
    ${config.stateEITCPercent}
  );

  // TODO: Determine if ${name} EITC is refundable or non-refundable
  nonRefundableCredits += ${codeLower}EITC;
  ` : '// TODO: Add ${name}-specific credits'}

  return {
    ${config.hasStateEITC ? `earned_income: ${codeLower}EITC,` : ''}
    nonRefundableCredits,
    refundableCredits
  };
}
`;
}

/**
 * Generate rules/brackets file
 */
function generateBracketsTemplate(config: StateEngineConfig, year: number): string {
  const { code, name, taxType } = config;
  const codeUpper = code.toUpperCase();

  if (taxType === 'flat') {
    return `import type { FilingStatus } from '../../../../types';

/**
 * ${name} ${year} Tax Rate
 *
 * ${name} has a flat income tax rate.
 *
 * Source: ${config.authoritativeSource}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */

export const ${codeUpper}_TAX_RATE_${year} = 0.0500; // TODO: Update with actual rate (example: 5%)

/**
 * ${name} ${year} Tax Brackets
 * For compatibility with graduated tax calculation
 */
export const ${codeUpper}_BRACKETS_${year}: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: Infinity, rate: ${codeUpper}_TAX_RATE_${year} }
  ],
  married_jointly: [
    { min: 0, max: Infinity, rate: ${codeUpper}_TAX_RATE_${year} }
  ],
  married_separately: [
    { min: 0, max: Infinity, rate: ${codeUpper}_TAX_RATE_${year} }
  ],
  head_of_household: [
    { min: 0, max: Infinity, rate: ${codeUpper}_TAX_RATE_${year} }
  ]
};
`;
  }

  return `import type { FilingStatus } from '../../../../types';

/**
 * ${name} ${year} Tax Brackets
 *
 * TODO: Update with official ${name} tax brackets for ${year}
 *
 * Source: ${config.authoritativeSource}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */

export const ${codeUpper}_BRACKETS_${year}: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    // TODO: Add ${name} tax brackets for single filers
    { min: 0, max: 10000_00, rate: 0.0400 },
    { min: 10000_00, max: 50000_00, rate: 0.0500 },
    { min: 50000_00, max: Infinity, rate: 0.0600 }
  ],
  married_jointly: [
    // TODO: Add ${name} tax brackets for married filing jointly
    { min: 0, max: 20000_00, rate: 0.0400 },
    { min: 20000_00, max: 100000_00, rate: 0.0500 },
    { min: 100000_00, max: Infinity, rate: 0.0600 }
  ],
  married_separately: [
    // TODO: Add ${name} tax brackets for married filing separately
    { min: 0, max: 10000_00, rate: 0.0400 },
    { min: 10000_00, max: 50000_00, rate: 0.0500 },
    { min: 50000_00, max: Infinity, rate: 0.0600 }
  ],
  head_of_household: [
    // TODO: Add ${name} tax brackets for head of household
    { min: 0, max: 15000_00, rate: 0.0400 },
    { min: 15000_00, max: 75000_00, rate: 0.0500 },
    { min: 75000_00, max: Infinity, rate: 0.0600 }
  ]
};
`;
}

/**
 * Generate rules/deductions file
 */
function generateDeductionsTemplate(config: StateEngineConfig, year: number): string {
  const { code, name } = config;
  const codeUpper = code.toUpperCase();

  return `import type { FilingStatus } from '../../../../types';

/**
 * ${name} ${year} Standard Deduction
 *
 * TODO: Update with official ${name} standard deduction amounts for ${year}
 *
 * Source: ${config.authoritativeSource}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */

export const ${codeUpper}_STANDARD_DEDUCTION_${year}: Record<FilingStatus, number> = {
  single: 3000_00,                    // TODO: Update with actual amount
  married_jointly: 6000_00,           // TODO: Update with actual amount
  married_separately: 3000_00,        // TODO: Update with actual amount
  head_of_household: 4500_00          // TODO: Update with actual amount
};

/**
 * ${name} ${year} Personal Exemption
 *
 * TODO: Update with official ${name} personal exemption for ${year}
 * Set to 0 if ${name} does not have personal exemptions
 */

export const ${codeUpper}_PERSONAL_EXEMPTION_${year} = 1000_00; // TODO: Update with actual amount or set to 0
`;
}

/**
 * Generate rules/credits file
 */
function generateCreditsTemplate(config: StateEngineConfig, year: number): string {
  const { code, name, hasStateEITC, stateEITCPercent } = config;
  const codeUpper = code.toUpperCase();

  return `/**
 * ${name} ${year} Tax Credits
 *
 * TODO: Document ${name}-specific tax credits
 *
 * Source: ${config.authoritativeSource}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */

${hasStateEITC && stateEITCPercent ? `
/**
 * ${name} Earned Income Tax Credit (EITC)
 * ${stateEITCPercent * 100}% of federal EITC
 */
export const ${codeUpper}_EITC_PERCENTAGE_${year} = ${stateEITCPercent};
` : ''}

// TODO: Add other ${name}-specific credits
// Examples:
// - Child and dependent care credit
// - Education credits
// - Property tax credit
// - Renter's credit
`;
}

/**
 * Generate main rules index file
 */
function generateRulesIndexTemplate(config: StateEngineConfig, year: number): string {
  const { code, name } = config;
  const codeUpper = code.toUpperCase();
  const codeLower = code.toLowerCase();

  return `import type { FilingStatus } from '../../../types';
import { ${codeUpper}_BRACKETS_${year} } from './brackets';
import { ${codeUpper}_STANDARD_DEDUCTION_${year}, ${codeUpper}_PERSONAL_EXEMPTION_${year} } from './deductions';
${config.hasStateEITC && config.stateEITCPercent ? `import { ${codeUpper}_EITC_PERCENTAGE_${year} } from './credits';` : ''}

/**
 * ${name} ${year} Tax Rules
 * Consolidated export of all ${name} tax rules for ${year}
 */

export interface ${codeUpper}Rules {
  brackets: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>>;
  standardDeduction: Record<FilingStatus, number>;
  personalExemption: number;
  ${config.hasStateEITC ? 'eitcPercentage: number;' : ''}
  ${config.hasLocalTax ? 'localRates?: Record<string, number>;' : ''}
}

export const ${codeUpper}_RULES_${year}: ${codeUpper}Rules = {
  brackets: ${codeUpper}_BRACKETS_${year},
  standardDeduction: ${codeUpper}_STANDARD_DEDUCTION_${year},
  personalExemption: ${codeUpper}_PERSONAL_EXEMPTION_${year},
  ${config.hasStateEITC && config.stateEITCPercent ? `eitcPercentage: ${codeUpper}_EITC_PERCENTAGE_${year},` : ''}
  ${config.hasLocalTax ? '// TODO: Add localRates mapping' : ''}
};
`;
}

/**
 * Generate basic test file
 */
function generateTestTemplate(config: StateEngineConfig, year: number): string {
  const { code, name } = config;
  const codeUpper = code.toUpperCase();
  const codeLower = code.toLowerCase();

  return `import { describe, it, expect } from 'vitest';
import { compute${codeUpper}${year} } from '../../../src/engine/states/${codeUpper}/${year}/compute${codeUpper}${year}';
import type { StateTaxInput } from '../../../src/engine/types/stateTax';
import type { FederalResult2025 } from '../../../src/engine/types';

/**
 * ${name} ${year} Tax Calculation Tests
 *
 * TODO: Add comprehensive test cases based on ${name} tax instructions
 */

describe('${name} ${year} State Tax Calculation', () => {

  it('should calculate basic ${name} tax for single filer', () => {
    const federalResult: FederalResult2025 = {
      agi: 50000_00,
      taxableIncome: 35000_00,
      regularTax: 4000_00,
      totalTax: 4000_00,
      effectiveRate: 0.08,
      credits: {
        ctc: 0,
        eitc: 0,
        education: 0,
        other: 0,
        nonRefundable: 0,
        refundable: 0
      },
      payments: {
        withheld: 0,
        estimated: 0,
        refundable: 0,
        total: 0
      },
      refundOrOwe: -4000_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: '${codeUpper}',
      filingStatus: 'single',
      stateWithheld: 2000_00,
      stateEstPayments: 0
    };

    const result = compute${codeUpper}${year}(input);

    // TODO: Add specific assertions based on ${name} tax rules
    expect(result.state).toBe('${codeUpper}');
    expect(result.taxYear).toBe(${year});
    expect(result.stateAGI).toBeGreaterThan(0);
    expect(result.stateTaxableIncome).toBeGreaterThan(0);
    expect(result.stateTax).toBeGreaterThanOrEqual(0);
  });

  it('should calculate ${name} tax with married filing jointly', () => {
    const federalResult: FederalResult2025 = {
      agi: 100000_00,
      taxableIncome: 70000_00,
      regularTax: 8000_00,
      totalTax: 8000_00,
      effectiveRate: 0.08,
      credits: {
        ctc: 2000_00,
        eitc: 0,
        education: 0,
        other: 0,
        nonRefundable: 2000_00,
        refundable: 0
      },
      payments: {
        withheld: 0,
        estimated: 0,
        refundable: 0,
        total: 0
      },
      refundOrOwe: -6000_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: '${codeUpper}',
      filingStatus: 'married_jointly',
      stateWithheld: 4000_00,
      stateEstPayments: 0
    };

    const result = compute${codeUpper}${year}(input);

    expect(result.state).toBe('${codeUpper}');
    expect(result.filingStatus).toBe('married_jointly');
    // TODO: Add specific assertions
  });

  ${config.hasStateEITC ? `
  it('should apply ${name} EITC correctly', () => {
    const federalResult: FederalResult2025 = {
      agi: 20000_00,
      taxableIncome: 5000_00,
      regularTax: 500_00,
      totalTax: 500_00,
      effectiveRate: 0.025,
      credits: {
        ctc: 0,
        eitc: 3000_00, // Federal EITC
        education: 0,
        other: 0,
        nonRefundable: 0,
        refundable: 3000_00
      },
      payments: {
        withheld: 0,
        estimated: 0,
        refundable: 3000_00,
        total: 3000_00
      },
      refundOrOwe: 2500_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: '${codeUpper}',
      filingStatus: 'single',
      stateWithheld: 200_00,
      stateEstPayments: 0
    };

    const result = compute${codeUpper}${year}(input);

    // ${name} EITC should be ${config.stateEITCPercent! * 100}% of federal
    const expected${codeUpper}EITC = Math.round(3000_00 * ${config.stateEITCPercent});
    expect(result.stateCredits.earned_income).toBe(expected${codeUpper}EITC);
  });
  ` : ''}

  ${config.hasLocalTax ? `
  it('should calculate local tax correctly', () => {
    const federalResult: FederalResult2025 = {
      agi: 60000_00,
      taxableIncome: 45000_00,
      regularTax: 5000_00,
      totalTax: 5000_00,
      effectiveRate: 0.083,
      credits: {
        ctc: 0,
        eitc: 0,
        education: 0,
        other: 0,
        nonRefundable: 0,
        refundable: 0
      },
      payments: {
        withheld: 0,
        estimated: 0,
        refundable: 0,
        total: 0
      },
      refundOrOwe: -5000_00
    };

    const input: StateTaxInput = {
      federalResult,
      state: '${codeUpper}',
      county: 'TestCounty', // TODO: Use actual county name
      filingStatus: 'single',
      stateWithheld: 2500_00,
      stateEstPayments: 0
    };

    const result = compute${codeUpper}${year}(input);

    // Local tax should be calculated
    expect(result.localTax).toBeGreaterThanOrEqual(0);
    expect(result.totalStateLiability).toBe(result.stateTax + result.localTax);
  });
  ` : ''}

  // TODO: Add more test cases:
  // - Different income levels
  // - With deductions
  // - With various credits
  // - Edge cases (zero income, very high income)
  // - ${name}-specific scenarios
});
`;
}

/**
 * Generate README file
 */
function generateReadmeTemplate(config: StateEngineConfig, year: number): string {
  const { code, name } = config;
  const codeUpper = code.toUpperCase();

  return `# ${name} (${codeUpper}) State Tax Engine

## Status
⚠️ **IN DEVELOPMENT** - This engine is a skeleton and needs to be completed

## Overview
${name} ${config.taxType === 'flat' ? 'has a flat' : 'has a graduated'} income tax${config.hasLocalTax ? ' with local taxes' : ''}.

## Tax Structure (${year})
- **Tax Type**: ${config.taxType}
- **Local Tax**: ${config.hasLocalTax ? 'Yes' : 'No'}
- **State EITC**: ${config.hasStateEITC ? `Yes (${config.stateEITCPercent! * 100}% of federal)` : 'No'}

## Implementation Checklist

### 1. Research Tax Rules
- [ ] Download ${year} ${name} tax forms and instructions
- [ ] Review ${name} standard deduction amounts
- [ ] Review ${name} personal exemption (if applicable)
- [ ] Review ${name} tax brackets/rates
- [ ] Review ${name} credits${config.hasLocalTax ? '\n- [ ] Review local tax rates by county/city' : ''}

### 2. Update Rule Files
- [ ] \`rules/${year}/brackets.ts\` - Update tax brackets
- [ ] \`rules/${year}/deductions.ts\` - Update standard deduction
- [ ] \`rules/${year}/credits.ts\` - Add ${name}-specific credits${config.hasLocalTax ? '\n- [ ] \`rules/${year}/index.ts\` - Add local tax rates' : ''}

### 3. Implement Calculator
- [ ] \`compute${codeUpper}${year}.ts\` - Complete AGI calculation
- [ ] \`compute${codeUpper}${year}.ts\` - Complete deduction calculation
- [ ] \`compute${codeUpper}${year}.ts\` - Complete credit calculation${config.hasLocalTax ? '\n- [ ] \`compute${codeUpper}${year}.ts\` - Complete local tax calculation' : ''}

### 4. Write Tests
- [ ] Add basic scenarios (single, MFJ, HOH)
- [ ] Add high/low income scenarios
- [ ] Add deduction scenarios
- [ ] Add credit scenarios${config.hasLocalTax ? '\n- [ ] Add local tax scenarios' : ''}
- [ ] Verify against ${name} tax calculators

### 5. Register State
- [ ] Update \`src/engine/states/registry.ts\` to include ${codeUpper}
- [ ] Update \`STATE_CONFIGS\` with \`implemented: true\`

## Resources

### Official Sources
- [${name} Tax Authority](${config.authoritativeSource})
- ${name} Form 500 (or equivalent) and Instructions
- ${name} Tax Rate Schedules

### Useful Tools
- ${name} official tax calculator (if available)
- Tax preparation software for verification

## Notes
${config.hasLocalTax ? `
⚠️ **Local Tax**: ${name} has local taxes. Make sure to:
1. Research all county/city tax rates
2. Implement lookup by county/city name
3. Test with multiple jurisdictions
` : ''}

${config.hasStateEITC ? `
✅ **State EITC**: ${name} offers an EITC at ${config.stateEITCPercent! * 100}% of federal EITC.
- Verify if it's refundable or non-refundable
- Check for income limits or phase-outs
` : ''}

## Testing Strategy
1. Start with simple single filer, no credits
2. Add complexity incrementally (MFJ, credits, etc.)
3. Test edge cases (zero income, very high income)
4. Compare results with official ${name} calculators
5. Aim for accuracy within $1 (rounding differences)

## Common Pitfalls
- AGI adjustments (state may differ from federal)
- Deduction phase-outs or limitations
- Credit ordering (non-refundable before refundable)
- Rounding rules (${name} may round differently than federal)${config.hasLocalTax ? '\n- Local tax lookup (ensure accurate county/city mapping)' : ''}

---

**Created**: ${new Date().toISOString().split('T')[0]}
**Generator**: scripts/createStateEngine.ts
`;
}

// ============================================================================
// File System Operations / 文件系统操作
// ============================================================================

function createDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created file: ${filePath}`);
}

// ============================================================================
// Main Generator Function / 主生成函数
// ============================================================================

function generateStateEngine(config: StateEngineConfig, year: number = 2025): void {
  const { code } = config;
  const codeUpper = code.toUpperCase();
  const codeLower = code.toLowerCase();

  console.log(`\n🚀 Generating ${config.name} (${codeUpper}) state tax engine for ${year}...\n`);

  const baseDir = path.join(process.cwd(), 'src', 'engine', 'states', codeUpper);
  const rulesDir = path.join(process.cwd(), 'src', 'engine', 'rules', year.toString(), 'states', codeLower);
  const testDir = path.join(process.cwd(), 'tests', 'golden', 'states', codeLower, year.toString());

  // Create directory structure
  createDirectory(path.join(baseDir, year.toString()));
  createDirectory(path.join(baseDir, 'rules', year.toString()));
  createDirectory(rulesDir);
  createDirectory(testDir);

  // Generate files
  writeFile(
    path.join(baseDir, year.toString(), `compute${codeUpper}${year}.ts`),
    generateCalculatorTemplate(config, year)
  );

  writeFile(
    path.join(baseDir, 'rules', year.toString(), 'brackets.ts'),
    generateBracketsTemplate(config, year)
  );

  writeFile(
    path.join(baseDir, 'rules', year.toString(), 'deductions.ts'),
    generateDeductionsTemplate(config, year)
  );

  writeFile(
    path.join(baseDir, 'rules', year.toString(), 'credits.ts'),
    generateCreditsTemplate(config, year)
  );

  writeFile(
    path.join(rulesDir, `${codeLower}.ts`),
    generateRulesIndexTemplate(config, year)
  );

  writeFile(
    path.join(testDir, 'basic-scenarios.spec.ts'),
    generateTestTemplate(config, year)
  );

  writeFile(
    path.join(baseDir, 'README.md'),
    generateReadmeTemplate(config, year)
  );

  console.log(`\n✅ ${config.name} (${codeUpper}) state tax engine skeleton created successfully!\n`);
  console.log(`📁 Files created:`);
  console.log(`   - ${baseDir}/${year}/compute${codeUpper}${year}.ts`);
  console.log(`   - ${baseDir}/rules/${year}/brackets.ts`);
  console.log(`   - ${baseDir}/rules/${year}/deductions.ts`);
  console.log(`   - ${baseDir}/rules/${year}/credits.ts`);
  console.log(`   - ${rulesDir}/${codeLower}.ts`);
  console.log(`   - ${testDir}/basic-scenarios.spec.ts`);
  console.log(`   - ${baseDir}/README.md`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review ${baseDir}/README.md for implementation checklist`);
  console.log(`   2. Research ${config.name} tax rules and update rule files`);
  console.log(`   3. Complete TODO items in compute${codeUpper}${year}.ts`);
  console.log(`   4. Write comprehensive tests`);
  console.log(`   5. Register state in src/engine/states/registry.ts`);
  console.log(`\n`);
}

// ============================================================================
// CLI / 命令行界面
// ============================================================================

function printUsage(): void {
  console.log(`
Usage: npx tsx scripts/createStateEngine.ts <STATE_CODE> [options]

Arguments:
  STATE_CODE              Two-letter state code (e.g., NY, PA, NJ)

Options:
  --name <name>           Full state name (e.g., "New York")
  --type <type>           Tax type: flat, graduated, or none (default: graduated)
  --local-tax             State has local/county taxes (flag)
  --eitc <percent>        State EITC as decimal (e.g., 0.30 for 30%)
  --url <url>             State tax authority URL

Examples:
  # Create New York engine with local taxes and 30% EITC
  npx tsx scripts/createStateEngine.ts NY --name "New York" --local-tax --eitc 0.30

  # Create Pennsylvania engine with flat tax
  npx tsx scripts/createStateEngine.ts PA --name "Pennsylvania" --type flat

  # Create Texas engine (no income tax)
  npx tsx scripts/createStateEngine.ts TX --name "Texas" --type none
  `);
}

// Parse command-line arguments
function parseArgs(): StateEngineConfig | null {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return null;
  }

  const code = args[0].toUpperCase();
  if (code.length !== 2) {
    console.error('❌ Error: STATE_CODE must be a two-letter code (e.g., NY, CA, TX)');
    return null;
  }

  const config: StateEngineConfig = {
    code,
    name: code, // Default to code, override with --name
    taxType: 'graduated',
    hasLocalTax: false,
    hasStateEITC: false,
    authoritativeSource: `https://www.${code.toLowerCase()}.gov/revenue`
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--name':
        config.name = args[++i];
        break;
      case '--type':
        const type = args[++i];
        if (!['flat', 'graduated', 'none'].includes(type)) {
          console.error('❌ Error: --type must be flat, graduated, or none');
          return null;
        }
        config.taxType = type as 'flat' | 'graduated' | 'none';
        break;
      case '--local-tax':
        config.hasLocalTax = true;
        break;
      case '--eitc':
        const eitc = parseFloat(args[++i]);
        if (isNaN(eitc) || eitc < 0 || eitc > 1) {
          console.error('❌ Error: --eitc must be a decimal between 0 and 1');
          return null;
        }
        config.hasStateEITC = true;
        config.stateEITCPercent = eitc;
        break;
      case '--url':
        config.authoritativeSource = args[++i];
        break;
      default:
        console.error(`❌ Error: Unknown option ${arg}`);
        return null;
    }
  }

  return config;
}

// Main execution
if (require.main === module) {
  const config = parseArgs();
  if (config) {
    generateStateEngine(config);
  }
}

export { generateStateEngine, type StateEngineConfig };
