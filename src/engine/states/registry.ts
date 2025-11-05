/**
 * State Tax Calculator Registry
 *
 * Central registry for all state tax calculators.
 * Add new states here as they are implemented.
 */

import type { StateRegistry, StateConfig, StateTaxInput, StateCalculator } from '../types/stateTax';
import { computeMD2025 } from './md/2025/computeMD2025';
import { computeCA2025 } from './CA/2025/computeCA2025';
import { computeNY2025 } from './NY/2025/computeNY2025';
import { computePA2025 } from './PA/2025/computePA2025';
import { computeIL2025 } from './IL/2025/computeIL2025';
import { computeGA2025 } from './GA/2025/computeGA2025';
import { computeVA2025 } from './VA/2025/computeVA2025';
import { computeMA2025 } from './MA/2025/computeMA2025';
import { computeNJ2025 } from './NJ/2025/computeNJ2025';
import { computeOH2025 } from './OH/2025/computeOH2025';
import { computeNC2025 } from './NC/2025/computeNC2025';
import { computeCO2025 } from './CO/2025/computeCO2025';
import { computeAZ2025 } from './AZ/2025/computeAZ2025';
import { computeCT2025 } from './CT/2025/computeCT2025';
import { computeOR2025 } from './OR/2025/computeOR2025';

/**
 * State configurations
 * Source: State tax authority websites, updated for 2025 tax year
 */
export const STATE_CONFIGS: Record<string, StateConfig> = {
  // States with no income tax
  AK: {
    code: 'AK',
    name: 'Alaska',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://tax.alaska.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax'
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://floridarevenue.com',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax'
  },
  NV: {
    code: 'NV',
    name: 'Nevada',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://tax.nv.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax'
  },
  NH: {
    code: 'NH',
    name: 'New Hampshire',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://revenue.nh.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'Interest and dividends tax repealed for 2025+'
  },
  SD: {
    code: 'SD',
    name: 'South Dakota',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://dor.sd.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax'
  },
  TN: {
    code: 'TN',
    name: 'Tennessee',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://tn.gov/revenue',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'Hall income tax repealed in 2021'
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://comptroller.texas.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax'
  },
  WA: {
    code: 'WA',
    name: 'Washington',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://dor.wa.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax (capital gains tax applies to limited high-income scenarios)'
  },
  WY: {
    code: 'WY',
    name: 'Wyoming',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://revenue.wyo.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax'
  },

  // Implemented states with income tax
  MD: {
    code: 'MD',
    name: 'Maryland',
    hasTax: true,
    hasLocalTax: true,
    taxType: 'graduated',
    authoritativeSource: 'https://www.marylandtaxes.gov',
    lastUpdated: '2025-01-01',
    taxYear: 2025,
    hasStateEITC: true,
    stateEITCPercent: 0.45,  // 45% of federal EITC for 2025
    hasStandardDeduction: true,
    hasPersonalExemption: true,
    implemented: true,
    notes: 'Full implementation with local taxes'
  },

  // Implemented states with graduated tax
  CA: {
    code: 'CA',
    name: 'California',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.ftb.ca.gov',
    lastUpdated: '2025-10-03',
    taxYear: 2025,
    hasStateEITC: true,
    stateEITCPercent: 0.85,  // CalEITC uses complex calculation, not simple %
    hasStandardDeduction: true,
    hasPersonalExemption: false, // Eliminated in 2019, replaced with credits
    implemented: true,
    notes: 'Full implementation with CalEITC, YCTC, renters credit, mental health tax'
  },
  NY: {
    code: 'NY',
    name: 'New York',
    hasTax: true,
    hasLocalTax: true,
    taxType: 'graduated',
    authoritativeSource: 'https://www.tax.ny.gov',
    lastUpdated: '2025-10-19',
    taxYear: 2025,
    hasStateEITC: true,
    stateEITCPercent: 0.30,  // 30% of federal EITC
    hasStandardDeduction: true,
    hasPersonalExemption: true,
    implemented: true,
    notes: 'Full implementation with NYC and Yonkers local taxes'
  },
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    hasTax: true,
    hasLocalTax: false,  // Local taxes exist but handled separately by municipalities
    taxType: 'flat',
    authoritativeSource: 'https://www.revenue.pa.gov',
    lastUpdated: '2025-10-19',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,  // No standard deduction in PA
    hasPersonalExemption: false,  // No personal exemptions in PA
    implemented: true,
    notes: 'Simplest state tax: 3.07% flat rate, no deductions, retirement income exempt'
  },
  IL: {
    code: 'IL',
    name: 'Illinois',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://tax.illinois.gov',
    lastUpdated: '2025-10-27',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,  // Uses personal exemptions instead
    hasPersonalExemption: true,   // $2,825 per person
    implemented: true,
    notes: 'Flat 4.95% rate, property tax credit (5%), retirement income fully exempt'
  },
  GA: {
    code: 'GA',
    name: 'Georgia',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://dor.georgia.gov',
    lastUpdated: '2025-10-27',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $12,000 single / $24,000 MFJ
    hasPersonalExemption: false,  // Eliminated (only dependent exemption remains)
    implemented: true,
    notes: 'Flat 5.19% rate, retirement exclusion ($35k-$65k age-based), Social Security fully exempt'
  },
  VA: {
    code: 'VA',
    name: 'Virginia',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.tax.virginia.gov',
    lastUpdated: '2025-10-30',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $8,750 single / $17,500 MFJ
    hasPersonalExemption: true,   // $930 per person
    implemented: true,
    notes: '4 brackets (2%-5.75%), age exemption $800 or alternative $12k deduction, cannot use standard if itemized federal'
  },
  MA: {
    code: 'MA',
    name: 'Massachusetts',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',  // Technically dual-rate (5% + 4% surtax)
    authoritativeSource: 'https://www.mass.gov',
    lastUpdated: '2025-10-30',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,  // No standard deduction (unique feature)
    hasPersonalExemption: true,   // $4,400 single / $8,800 MFJ
    implemented: true,
    notes: '5% base rate + 4% millionaire surtax (9% on income over ~$1.08M), no standard deduction'
  },
  NJ: {
    code: 'NJ',
    name: 'New Jersey',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.nj.gov/treasury/taxation',
    lastUpdated: '2025-10-30',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $1,000 single / $2,000 MFJ
    hasPersonalExemption: true,   // $1,000 age 65+, $1,500 per dependent
    implemented: true,
    notes: '8 brackets (1.4%-10.75%), property tax deduction up to $15k, $50 refundable credit option'
  },
  OH: {
    code: 'OH',
    name: 'Ohio',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://tax.ohio.gov',
    lastUpdated: '2025-10-30',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $2,400 single / $4,800 MFJ
    hasPersonalExemption: true,   // $2,350/$2,100/$1,850 based on MAGI
    implemented: true,
    notes: '3 brackets (0%-3.125%), $20 personal exemption credit, $750k MAGI cap, transitioning to flat 2.75% in 2026'
  },
  NC: {
    code: 'NC',
    name: 'North Carolina',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://www.ncdor.gov',
    lastUpdated: '2025-10-31',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $12,750 single / $25,500 MFJ / $19,125 HOH
    hasPersonalExemption: false,  // No personal exemptions
    implemented: true,
    notes: 'Flat 4.25% rate (down from 4.5% in 2024), transitioning to 3.99% in 2026'
  },
  CO: {
    code: 'CO',
    name: 'Colorado',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://tax.colorado.gov',
    lastUpdated: '2025-11-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,  // Uses federal taxable income
    hasPersonalExemption: false,  // No personal exemptions
    implemented: true,
    notes: 'Flat 4.40% rate, uses federal taxable income as base, state income tax addback for high earners (AGI > $300k single / $1M joint)'
  },
  AZ: {
    code: 'AZ',
    name: 'Arizona',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://azdor.gov',
    lastUpdated: '2025-11-01',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $15,750 single / $31,500 MFJ
    hasPersonalExemption: false,  // No personal exemptions (has dependent exemptions instead)
    implemented: true,
    notes: 'Flat 2.5% rate (transitioned from progressive in 2023), age 65+ additional deduction ($6k), dependent exemptions ($1k/$500/$300 by AGI), charitable contribution SD increase'
  },
  CT: {
    code: 'CT',
    name: 'Connecticut',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://portal.ct.gov/drs',
    lastUpdated: '2025-11-01',
    taxYear: 2025,
    hasStateEITC: true,           // 40% of federal EITC
    stateEITCPercent: 0.40,
    hasStandardDeduction: false,  // No traditional standard deduction
    hasPersonalExemption: true,   // Treated as a credit, not deduction ($15k-$24k)
    implemented: true,
    notes: '7 brackets (2%-6.99%), personal exemption credit ($15k-$24k), personal tax credit (1%-75% phaseout), CT EITC (40% federal)'
  },
  OR: {
    code: 'OR',
    name: 'Oregon',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.oregon.gov/dor',
    lastUpdated: '2025-11-03',
    taxYear: 2025,
    hasStateEITC: false,          // No state EITC in Oregon
    hasStandardDeduction: true,   // $2,835 single / $5,670 MFJ / $4,560 HOH
    hasPersonalExemption: true,   // $256 credit per person (income-limited)
    implemented: true,
    notes: '4 brackets (4.75%-9.90%), federal tax deduction ($6,100/$12,200), personal exemption credit ($256 per person, phaseout > $100k/$200k), elderly/blind additional deduction'
  },

  // Placeholder for remaining states
  // TODO: Add remaining 29 states
};

/**
 * Registry of implemented state calculators
 */
export const STATE_REGISTRY: StateRegistry = {
  AZ: {
    config: STATE_CONFIGS.AZ!,
    calculator: computeAZ2025
  },
  CA: {
    config: STATE_CONFIGS.CA!,
    calculator: computeCA2025
  },
  CT: {
    config: STATE_CONFIGS.CT!,
    calculator: computeCT2025
  },
  CO: {
    config: STATE_CONFIGS.CO!,
    calculator: computeCO2025
  },
  GA: {
    config: STATE_CONFIGS.GA!,
    calculator: computeGA2025
  },
  IL: {
    config: STATE_CONFIGS.IL!,
    calculator: computeIL2025
  },
  MA: {
    config: STATE_CONFIGS.MA!,
    calculator: computeMA2025
  },
  MD: {
    config: STATE_CONFIGS.MD!,
    calculator: computeMD2025
  },
  NC: {
    config: STATE_CONFIGS.NC!,
    calculator: computeNC2025
  },
  NJ: {
    config: STATE_CONFIGS.NJ!,
    calculator: computeNJ2025
  },
  NY: {
    config: STATE_CONFIGS.NY!,
    calculator: computeNY2025
  },
  OH: {
    config: STATE_CONFIGS.OH!,
    calculator: computeOH2025
  },
  OR: {
    config: STATE_CONFIGS.OR!,
    calculator: computeOR2025
  },
  PA: {
    config: STATE_CONFIGS.PA!,
    calculator: computePA2025
  },
  VA: {
    config: STATE_CONFIGS.VA!,
    calculator: computeVA2025
  },
  // No-tax states use the same null calculator
  ...Object.fromEntries(
    ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'].map(code => [
      code,
      {
        config: STATE_CONFIGS[code],
        calculator: createNoTaxCalculator(code)
      }
    ])
  )
};

/**
 * Create a calculator for states with no income tax
 */
function createNoTaxCalculator(stateCode: string): StateCalculator {
  return (input: StateTaxInput) => {
    const config = STATE_CONFIGS[stateCode];
    return {
      stateAGI: 0,
      stateTaxableIncome: 0,
      stateTax: 0,
      localTax: 0,
      totalStateLiability: 0,
      stateDeduction: 0,
      stateCredits: {
        nonRefundableCredits: 0,
        refundableCredits: 0
      },
      stateWithheld: input.stateWithheld || 0,
      stateEstPayments: input.stateEstPayments || 0,
      stateRefundOrOwe: (input.stateWithheld || 0) + (input.stateEstPayments || 0),
      state: stateCode,
      taxYear: 2025,
      calculationNotes: config ? [`${config.name} has no state income tax`] : ['No state income tax']
    };
  };
}

/**
 * Get state calculator by state code
 */
export function getStateCalculator(stateCode: string) {
  const entry = STATE_REGISTRY[stateCode?.toUpperCase()];
  if (!entry) {
    return null;
  }
  return entry;
}

/**
 * Get list of all supported states
 */
export function getSupportedStates(): StateConfig[] {
  return Object.values(STATE_CONFIGS).filter(config => config.implemented);
}

/**
 * Get list of states pending implementation
 */
export function getPendingStates(): StateConfig[] {
  return Object.values(STATE_CONFIGS).filter(config => !config.implemented);
}

/**
 * Check if a state has income tax
 */
export function stateHasTax(stateCode: string): boolean {
  const config = STATE_CONFIGS[stateCode?.toUpperCase()];
  return config ? config.hasTax : true; // Default to true for unknown states
}

