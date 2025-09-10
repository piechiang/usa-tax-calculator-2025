import { dollarsToCents } from '../../../util/money';
import { TaxBracket } from '../../../types';

// New York tax rules for 2025 (simplified)
export const NY_RULES_2025 = {
  standardDeduction: {
    single: dollarsToCents(8000),
    marriedJointly: dollarsToCents(16050),
    marriedSeparately: dollarsToCents(8000),
    headOfHousehold: dollarsToCents(11200),
  },

  brackets: [
    { min: 0, max: dollarsToCents(8500), rate: 0.04 },
    { min: dollarsToCents(8500), max: dollarsToCents(11700), rate: 0.045 },
    { min: dollarsToCents(11700), max: dollarsToCents(13900), rate: 0.0525 },
    { min: dollarsToCents(13900), max: Infinity, rate: 0.059 },
  ] as TaxBracket[],

  // New York EITC percentage of federal EITC (simplified)
  eitcPercentage: 0.30,
};
