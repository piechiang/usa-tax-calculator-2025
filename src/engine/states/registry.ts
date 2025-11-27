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
import { computeMN2025 } from './MN/2025/computeMN2025';
import { computeSC2025 } from './SC/2025/computeSC2025';
import { computeWI2025 } from './WI/2025/computeWI2025';
import { computeAL2025 } from './AL/2025/computeAL2025';
import { computeMI2025 } from './MI/2025/computeMI2025';
import { computeIN2025 } from './IN/2025/computeIN2025';
import { computeMO2025 } from './MO/2025/computeMO2025';
import { computeKY2025 } from './KY/2025/computeKY2025';
import { computeTN2025 } from './TN/2025/computeTN2025';
import { computeLA2025 } from './LA/2025/computeLA2025';
import { computeIA2025 } from './IA/2025/computeIA2025';
import { computeTX2025 } from './TX/2025/computeTX2025';
import { computeFL2025 } from './FL/2025/computeFL2025';
import { computeNM2025 } from './NM/2025/computeNM2025';
import { computeAK2025 } from './AK/2025/computeAK2025';
import { computeNV2025 } from './NV/2025/computeNV2025';
import { computeSD2025 } from './SD/2025/computeSD2025';
import { computeWY2025 } from './WY/2025/computeWY2025';
import { computeWA2025 } from './WA/2025/computeWA2025';
import { computeNH2025 } from './NH/2025/computeNH2025';

/**
 * State configurations
 * Source: State tax authority websites, updated for 2025 tax year
 */
export const STATE_CONFIGS: Record<string, StateConfig> = {
  // States with income tax
  AL: {
    code: 'AL',
    name: 'Alabama',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.revenue.alabama.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,
    hasPersonalExemption: false, // Only dependent exemptions, no personal exemptions
    implemented: true,
    notes: '3-bracket progressive (2%-5%), unique federal income tax deduction, income-based dependent exemptions'
  },

  // States with no income tax
  AK: {
    code: 'AK',
    name: 'Alaska',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://tax.alaska.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax, unique Permanent Fund Dividend (PFD) pays residents $1,000-$3,000 annually from oil revenue'
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://floridarevenue.com',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax - constitutionally prohibited. Popular retirement destination. Revenue from sales tax (6-8%), property tax (0.82% avg), tourism taxes.'
  },
  NV: {
    code: 'NV',
    name: 'Nevada',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://tax.nv.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax, gaming (casino) revenue funds state operations, popular for businesses and high-income individuals'
  },
  NH: {
    code: 'NH',
    name: 'New Hampshire',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://revenue.nh.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No income tax (2025+), Interest & Dividends Tax repealed Jan 1 2025, no sales tax, highest property taxes, "Live Free or Die"'
  },
  SD: {
    code: 'SD',
    name: 'South Dakota',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://dor.sd.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax, strong trust industry, no corporate/personal property tax, business-friendly'
  },
  TN: {
    code: 'TN',
    name: 'Tennessee',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://tn.gov/revenue',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax - Hall Tax (6% on investment income) eliminated January 1, 2021. One of 9 states with no income tax.'
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://comptroller.texas.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax - constitutionally prohibited without voter approval. One of 9 states with no income tax. Revenue from sales tax (8.20% avg) and property tax (1.36% effective rate).'
  },
  WA: {
    code: 'WA',
    name: 'Washington',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://dor.wa.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax on wages/salaries, 7% capital gains tax (2022+) on gains > $262k, tech hub (Seattle, Microsoft, Amazon)'
  },
  WI: {
    code: 'WI',
    name: 'Wisconsin',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'progressive',
    authoritativeSource: 'https://www.revenue.wi.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: true,
    hasStandardDeduction: true,
    hasPersonalExemption: true,
    implemented: true,
    notes: '4-bracket progressive system (3.54%-7.65%), sliding scale standard deduction, state EITC (4%-34% of federal)'
  },
  WY: {
    code: 'WY',
    name: 'Wyoming',
    hasTax: false,
    hasLocalTax: false,
    taxType: 'none',
    authoritativeSource: 'https://revenue.wyo.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: false,
    hasPersonalExemption: false,
    implemented: true,
    notes: 'No state income tax, constitutional protection, mineral extraction revenue, lowest population state'
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
  IA: {
    code: 'IA',
    name: 'Iowa',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://revenue.iowa.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true, // $2,210 single / $5,450 MFJ
    hasPersonalExemption: false,
    implemented: true,
    notes: 'Flat 3.8% rate (NEW for 2025 - reduced from 5.7% in 2024), Senate File 2442, retirement income fully exempt, sixth-lowest rate among 41 states with income tax'
  },
  IN: {
    code: 'IN',
    name: 'Indiana',
    hasTax: true,
    hasLocalTax: true, // All 92 counties have local income tax (0.5%-3%)
    taxType: 'flat',
    authoritativeSource: 'https://www.in.gov/dor',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: true,
    hasStandardDeduction: false, // No standard deduction, only personal exemptions
    hasPersonalExemption: true, // $1,000 taxpayer/spouse, $1,500 dependents
    implemented: true,
    notes: 'Flat 3.0% state rate, county taxes 0.5%-3%, state EITC 10% of federal (non-refundable)'
  },
  KY: {
    code: 'KY',
    name: 'Kentucky',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://revenue.ky.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true, // $3,270 single / $6,540 MFJ
    hasPersonalExemption: false, // No personal exemptions
    implemented: true,
    notes: 'Flat 4.0% rate (reducing to 3.5% in 2026), child care credit 20% of federal, pension income exemption up to $31,110'
  },
  LA: {
    code: 'LA',
    name: 'Louisiana',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://revenue.louisiana.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true, // $12,500 single / $25,000 MFJ
    hasPersonalExemption: false, // Eliminated in 2025 reform
    implemented: true,
    notes: 'Flat 3.0% rate (NEW for 2025 - replaced 3-bracket system), standard deduction increased, personal/dependent exemptions eliminated (Act 11 of 2024)'
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
  MI: {
    code: 'MI',
    name: 'Michigan',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'flat',
    authoritativeSource: 'https://www.michigan.gov/treasury',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: true,
    hasStandardDeduction: false, // No standard deduction, only personal exemptions
    hasPersonalExemption: true, // $5,000 per person (taxpayer + spouse + dependents)
    implemented: true,
    notes: 'Flat 4.25% rate, personal exemptions ($5,000 each), state EITC 30% of federal (refundable)'
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
  NM: {
    code: 'NM',
    name: 'New Mexico',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.tax.newmexico.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true, // $15,000 single / $30,000 MFJ
    hasPersonalExemption: true, // $2,500 per person
    implemented: true,
    notes: '5 brackets (1.5%-5.9%), HB 252 (2024) restructured brackets for 2025, first major change since 2005, lowered rates for low/middle income'
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
  MN: {
    code: 'MN',
    name: 'Minnesota',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://www.revenue.state.mn.us',
    lastUpdated: '2025-11-03',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $14,950 single / $29,900 MFJ
    hasPersonalExemption: false,  // Uses dependent exemption instead
    implemented: true,
    notes: '4 brackets (5.35%-9.85%), generous standard deduction, dependent exemption ($4,900 per dependent)'
  },
  MO: {
    code: 'MO',
    name: 'Missouri',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://dor.mo.gov',
    lastUpdated: '2025-01-22',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true, // $15,000 single / $30,000 MFJ / $22,500 HOH
    hasPersonalExemption: false, // Uses dependent exemption ($1,200 per dependent)
    implemented: true,
    notes: '8 brackets (0%-4.7%), federal tax deduction ($5k/$10k cap), dependent exemptions'
  },
  SC: {
    code: 'SC',
    name: 'South Carolina',
    hasTax: true,
    hasLocalTax: false,
    taxType: 'graduated',
    authoritativeSource: 'https://dor.sc.gov',
    lastUpdated: '2025-11-03',
    taxYear: 2025,
    hasStateEITC: false,
    hasStandardDeduction: true,   // $15,000 single / $30,000 MFJ (federal amounts)
    hasPersonalExemption: true,   // $2,800 per person
    implemented: true,
    notes: '3 brackets (0%, 3%, 6.2%), simple structure, personal and dependent exemptions ($2,800 each)'
  },

  // Placeholder for remaining states
  // TODO: Add remaining 27 states
};

/**
 * Registry of implemented state calculators
 */
export const STATE_REGISTRY: StateRegistry = {
  AK: {
    config: STATE_CONFIGS.AK!,
    calculator: computeAK2025
  },
  AL: {
    config: STATE_CONFIGS.AL!,
    calculator: computeAL2025
  },
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
  IA: {
    config: STATE_CONFIGS.IA!,
    calculator: computeIA2025
  },
  IN: {
    config: STATE_CONFIGS.IN!,
    calculator: computeIN2025
  },
  KY: {
    config: STATE_CONFIGS.KY!,
    calculator: computeKY2025
  },
  LA: {
    config: STATE_CONFIGS.LA!,
    calculator: computeLA2025
  },
  MA: {
    config: STATE_CONFIGS.MA!,
    calculator: computeMA2025
  },
  MD: {
    config: STATE_CONFIGS.MD!,
    calculator: computeMD2025
  },
  MI: {
    config: STATE_CONFIGS.MI!,
    calculator: computeMI2025
  },
  MN: {
    config: STATE_CONFIGS.MN!,
    calculator: computeMN2025
  },
  MO: {
    config: STATE_CONFIGS.MO!,
    calculator: computeMO2025
  },
  NC: {
    config: STATE_CONFIGS.NC!,
    calculator: computeNC2025
  },
  NJ: {
    config: STATE_CONFIGS.NJ!,
    calculator: computeNJ2025
  },
  NH: {
    config: STATE_CONFIGS.NH!,
    calculator: computeNH2025
  },
  NM: {
    config: STATE_CONFIGS.NM!,
    calculator: computeNM2025
  },
  NV: {
    config: STATE_CONFIGS.NV!,
    calculator: computeNV2025
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
  SC: {
    config: STATE_CONFIGS.SC!,
    calculator: computeSC2025
  },
  SD: {
    config: STATE_CONFIGS.SD!,
    calculator: computeSD2025
  },
  WI: {
    config: STATE_CONFIGS.WI!,
    calculator: computeWI2025
  },
  WY: {
    config: STATE_CONFIGS.WY!,
    calculator: computeWY2025
  },
  WA: {
    config: STATE_CONFIGS.WA!,
    calculator: computeWA2025
  },
  VA: {
    config: STATE_CONFIGS.VA!,
    calculator: computeVA2025
  },
  TN: {
    config: STATE_CONFIGS.TN!,
    calculator: computeTN2025
  },
  TX: {
    config: STATE_CONFIGS.TX!,
    calculator: computeTX2025
  },
  FL: {
    config: STATE_CONFIGS.FL!,
    calculator: computeFL2025
  },
  // No-tax states use the same null calculator
  ...Object.fromEntries(
    ['AK', 'NV', 'NH', 'SD', 'WA', 'WY'].map(code => [
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

