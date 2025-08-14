import { dollarsToCents } from '../../../util/money';
import { TaxBracket } from '../../../types';

// Maryland tax rules for 2025
export const MD_RULES_2025 = {
  // Maryland standard deductions (converted to cents)
  standardDeduction: {
    marriedJointly: dollarsToCents(4850),
    single: dollarsToCents(2400),
    marriedSeparately: dollarsToCents(2400),
    headOfHousehold: dollarsToCents(2400),
  },

  // Maryland tax brackets (converted to cents)
  brackets: [
    { min: 0, max: dollarsToCents(1000), rate: 0.02 },
    { min: dollarsToCents(1000), max: dollarsToCents(2000), rate: 0.03 },
    { min: dollarsToCents(2000), max: dollarsToCents(3000), rate: 0.04 },
    { min: dollarsToCents(3000), max: dollarsToCents(100000), rate: 0.0475 },
    { min: dollarsToCents(100000), max: dollarsToCents(125000), rate: 0.05 },
    { min: dollarsToCents(125000), max: dollarsToCents(150000), rate: 0.0525 },
    { min: dollarsToCents(150000), max: dollarsToCents(250000), rate: 0.055 },
    { min: dollarsToCents(250000), max: Infinity, rate: 0.0575 },
  ] as TaxBracket[],

  // Default local tax rate if county not found
  defaultLocalRate: 0.032,

  // Maryland county local tax rates
  localRates: {
    'Allegany': 0.0305,
    'Anne Arundel': 0.0281,
    'Baltimore City': 0.032,
    'Baltimore County': 0.032,
    'Calvert': 0.032,
    'Caroline': 0.0263,
    'Carroll': 0.032,
    'Cecil': 0.0274,
    'Charles': 0.029,
    'Dorchester': 0.0262,
    'Frederick': 0.0296,
    'Garrett': 0.0265,
    'Harford': 0.0306,
    'Howard': 0.032,
    'Kent': 0.0285,
    'Montgomery': 0.032,
    'Prince Georges': 0.032,
    'Queen Annes': 0.0285,
    'Somerset': 0.032,
    'St. Marys': 0.032,
    'Talbot': 0.0240,
    'Washington': 0.028,
    'Wicomico': 0.032,
    'Worcester': 0.0125,
  } as Record<string, number>,

  // Maryland personal exemptions
  personalExemption: {
    taxpayer: dollarsToCents(3200),
    spouse: dollarsToCents(3200),
    dependent: dollarsToCents(3200),
  },

  // Maryland EITC (percentage of federal EITC)
  eitcPercentage: 0.28, // 28% of federal EITC

  // Maryland tax-free pay (subtraction modification)
  taxFreePay: {
    military: true,
    railroad: true,
    pension: {
      maximum: dollarsToCents(33100), // Maximum pension exclusion
      ageRequirement: 65,
    },
  },

  // Maryland itemized deduction limitations
  itemizedLimitations: {
    saltDeduction: {
      // Maryland allows full SALT deduction (no federal cap)
      allowFull: true,
    },
  },

  // Maryland poverty level exemption
  povertyLevelExemption: {
    enabled: true,
    thresholds: {
      single: dollarsToCents(15000),
      marriedJointly: dollarsToCents(20000),
      marriedSeparately: dollarsToCents(15000),
      headOfHousehold: dollarsToCents(18000),
    },
  },
};