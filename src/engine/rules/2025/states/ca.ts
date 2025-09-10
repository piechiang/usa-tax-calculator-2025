import { dollarsToCents } from '../../../util/money';
import { TaxBracket } from '../../../types';

// California tax rules for 2025 (simplified)
export const CA_RULES_2025 = {
  standardDeduction: {
    single: dollarsToCents(5202),
    marriedJointly: dollarsToCents(10404),
    marriedSeparately: dollarsToCents(5202),
    headOfHousehold: dollarsToCents(10404),
  },

  brackets: [
    { min: 0, max: dollarsToCents(10000), rate: 0.01 },
    { min: dollarsToCents(10000), max: dollarsToCents(50000), rate: 0.02 },
    { min: dollarsToCents(50000), max: Infinity, rate: 0.04 },
  ] as TaxBracket[],

  // California EITC percentage of federal EITC (simplified)
  eitcPercentage: 0.15,
};
