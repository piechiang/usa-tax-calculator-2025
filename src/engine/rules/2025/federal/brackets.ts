import { FilingStatus, TaxBracket } from '../../../types';
import { dollarsToCents } from '../../../util/money';

// Federal tax brackets for 2025 (converted to cents for precision)
export const FEDERAL_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: dollarsToCents(11925), rate: 0.10 },
    { min: dollarsToCents(11925), max: dollarsToCents(48475), rate: 0.12 },
    { min: dollarsToCents(48475), max: dollarsToCents(103350), rate: 0.22 },
    { min: dollarsToCents(103350), max: dollarsToCents(197300), rate: 0.24 },
    { min: dollarsToCents(197300), max: dollarsToCents(250525), rate: 0.32 },
    { min: dollarsToCents(250525), max: dollarsToCents(626350), rate: 0.35 },
    { min: dollarsToCents(626350), max: Infinity, rate: 0.37 }
  ],
  marriedJointly: [
    { min: 0, max: dollarsToCents(23850), rate: 0.10 },
    { min: dollarsToCents(23850), max: dollarsToCents(96950), rate: 0.12 },
    { min: dollarsToCents(96950), max: dollarsToCents(206700), rate: 0.22 },
    { min: dollarsToCents(206700), max: dollarsToCents(394600), rate: 0.24 },
    { min: dollarsToCents(394600), max: dollarsToCents(501050), rate: 0.32 },
    { min: dollarsToCents(501050), max: dollarsToCents(751600), rate: 0.35 },
    { min: dollarsToCents(751600), max: Infinity, rate: 0.37 }
  ],
  marriedSeparately: [
    { min: 0, max: dollarsToCents(11925), rate: 0.10 },
    { min: dollarsToCents(11925), max: dollarsToCents(48475), rate: 0.12 },
    { min: dollarsToCents(48475), max: dollarsToCents(103350), rate: 0.22 },
    { min: dollarsToCents(103350), max: dollarsToCents(197300), rate: 0.24 },
    { min: dollarsToCents(197300), max: dollarsToCents(250525), rate: 0.32 },
    { min: dollarsToCents(250525), max: dollarsToCents(375800), rate: 0.35 },
    { min: dollarsToCents(375800), max: Infinity, rate: 0.37 }
  ],
  headOfHousehold: [
    { min: 0, max: dollarsToCents(17000), rate: 0.10 },
    { min: dollarsToCents(17000), max: dollarsToCents(64850), rate: 0.12 },
    { min: dollarsToCents(64850), max: dollarsToCents(103350), rate: 0.22 },
    { min: dollarsToCents(103350), max: dollarsToCents(197300), rate: 0.24 },
    { min: dollarsToCents(197300), max: dollarsToCents(250500), rate: 0.32 },
    { min: dollarsToCents(250500), max: dollarsToCents(626350), rate: 0.35 },
    { min: dollarsToCents(626350), max: Infinity, rate: 0.37 }
  ]
};