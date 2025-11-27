/**
 * Rule Version Loader
 *
 * Loads versioned rules from data files
 */

import type { RuleMetadata, VersionedBracket, VersionedConstant } from './types';
import {
  registerRule,
  registerFederalBrackets,
  registerConstant,
  getRegistry,
} from './registry';

/**
 * Load 2025 federal rules
 */
export function load2025FederalRules(): void {
  // Standard deduction
  registerConstant(2025, 'standard_deduction.single', {
    metadata: {
      id: 'federal.standard_deduction.single',
      name: 'Standard Deduction - Single',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRS Rev. Proc. 2024-40',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 1550000, // $15,500
  });

  registerConstant(2025, 'standard_deduction.married_jointly', {
    metadata: {
      id: 'federal.standard_deduction.married_jointly',
      name: 'Standard Deduction - Married Filing Jointly',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRS Rev. Proc. 2024-40',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 3100000, // $31,000
  });

  registerConstant(2025, 'standard_deduction.married_separately', {
    metadata: {
      id: 'federal.standard_deduction.married_separately',
      name: 'Standard Deduction - Married Filing Separately',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRS Rev. Proc. 2024-40',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 1550000, // $15,500
  });

  registerConstant(2025, 'standard_deduction.head_of_household', {
    metadata: {
      id: 'federal.standard_deduction.head_of_household',
      name: 'Standard Deduction - Head of Household',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRS Rev. Proc. 2024-40',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 2325000, // $23,250
  });

  // Tax brackets - Single
  registerFederalBrackets(2025, 'single', {
    metadata: {
      id: 'federal.brackets.single.2025',
      name: 'Federal Tax Brackets - Single (2025)',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRS Rev. Proc. 2024-40',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'brackets', 'single'],
    },
    brackets: [
      { min: 0, max: 1180000, rate: 0.10 }, // $11,800
      { min: 1180000, max: 4780000, rate: 0.12 }, // $47,800
      { min: 4780000, max: 10025000, rate: 0.22 }, // $100,250
      { min: 10025000, max: 19175000, rate: 0.24 }, // $191,750
      { min: 19175000, max: 24320000, rate: 0.32 }, // $243,200
      { min: 24320000, max: 60990000, rate: 0.35 }, // $609,900
      { min: 60990000, max: Infinity, rate: 0.37 },
    ],
  });

  // Child Tax Credit
  registerConstant(2025, 'ctc.amount_per_child', {
    metadata: {
      id: 'federal.ctc.amount_per_child',
      name: 'Child Tax Credit Amount',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRC § 24(a), as amended by TCJA',
      sourceUrl: 'https://www.law.cornell.edu/uscode/text/26/24',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'credit', 'ctc'],
    },
    value: 200000, // $2,000
  });

  // EITC maximum credit (no children)
  registerConstant(2025, 'eitc.max_0_children', {
    metadata: {
      id: 'federal.eitc.max_0_children',
      name: 'EITC Maximum - No Children',
      taxYear: 2025,
      effectiveDate: '2025-01-01',
      expirationDate: '2025-12-31',
      source: 'IRS Rev. Proc. 2024-40',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
      lastVerified: '2024-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'credit', 'eitc'],
    },
    value: 63200, // $632
  });
}

/**
 * Load 2024 federal rules (for comparison/amended returns)
 */
export function load2024FederalRules(): void {
  // Standard deduction - 2024 values
  registerConstant(2024, 'standard_deduction.single', {
    metadata: {
      id: 'federal.standard_deduction.single',
      name: 'Standard Deduction - Single',
      taxYear: 2024,
      effectiveDate: '2024-01-01',
      expirationDate: '2024-12-31',
      source: 'IRS Rev. Proc. 2023-34',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
      lastVerified: '2024-01-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 1475000, // $14,750
  });

  registerConstant(2024, 'standard_deduction.married_jointly', {
    metadata: {
      id: 'federal.standard_deduction.married_jointly',
      name: 'Standard Deduction - Married Filing Jointly',
      taxYear: 2024,
      effectiveDate: '2024-01-01',
      expirationDate: '2024-12-31',
      source: 'IRS Rev. Proc. 2023-34',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
      lastVerified: '2024-01-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 2950000, // $29,500
  });

  // Tax brackets - Single (2024)
  registerFederalBrackets(2024, 'single', {
    metadata: {
      id: 'federal.brackets.single.2024',
      name: 'Federal Tax Brackets - Single (2024)',
      taxYear: 2024,
      effectiveDate: '2024-01-01',
      expirationDate: '2024-12-31',
      source: 'IRS Rev. Proc. 2023-34',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
      lastVerified: '2024-01-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'brackets', 'single'],
    },
    brackets: [
      { min: 0, max: 1160000, rate: 0.10 }, // $11,600
      { min: 1160000, max: 4725000, rate: 0.12 }, // $47,250
      { min: 4725000, max: 10050000, rate: 0.22 }, // $100,500
      { min: 10050000, max: 19175000, rate: 0.24 }, // $191,750
      { min: 19175000, max: 24320000, rate: 0.32 }, // $243,200
      { min: 24320000, max: 60990000, rate: 0.35 }, // $609,900
      { min: 60990000, max: Infinity, rate: 0.37 },
    ],
  });
}

/**
 * Load all available rules
 */
export function loadAllRules(): void {
  load2024FederalRules();
  load2025FederalRules();

  const registry = getRegistry();
  console.log(`Loaded ${registry.metadata.ruleCount} rules`);
}

/**
 * Get rule statistics
 */
export function getRuleStats(): {
  totalRules: number;
  yearsCovered: number[];
  rulesByYear: Record<number, number>;
  rulesByTag: Record<string, number>;
} {
  const registry = getRegistry();
  const yearsCovered = new Set<number>();
  const rulesByYear: Record<number, number> = {};
  const rulesByTag: Record<string, number> = {};

  for (const ruleId in registry.rules) {
    const versions = registry.rules[ruleId]!;

    for (const year in versions) {
      const yearNum = parseInt(year, 10);
      yearsCovered.add(yearNum);

      rulesByYear[yearNum] = (rulesByYear[yearNum] || 0) + 1;

      const rule = versions[yearNum]!;
      for (const tag of rule.tags) {
        rulesByTag[tag] = (rulesByTag[tag] || 0) + 1;
      }
    }
  }

  return {
    totalRules: registry.metadata.ruleCount,
    yearsCovered: Array.from(yearsCovered).sort(),
    rulesByYear,
    rulesByTag,
  };
}
