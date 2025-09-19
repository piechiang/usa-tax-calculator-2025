import { dollarsToCents } from '../../../util/money';

// Child Tax Credit parameters for 2025
export const CTC_2025 = {
  maxCredit: dollarsToCents(2000), // Per qualifying child
  additionalChildCredit: dollarsToCents(1700), // Refundable portion per child
  phaseOutThresholds: {
    marriedJointly: dollarsToCents(400000),
    single: dollarsToCents(200000),
    marriedSeparately: dollarsToCents(200000),
    headOfHousehold: dollarsToCents(200000),
  },
  phaseOutRate: 0.05, // $50 per $1,000 of income over threshold
};

// Earned Income Tax Credit parameters for 2025
export const EITC_2025 = {
  maxCredits: {
    0: dollarsToCents(600),   // No children
    1: dollarsToCents(4213),  // 1 child
    2: dollarsToCents(6935),  // 2 children
    3: dollarsToCents(7830),  // 3+ children
  },
  phaseInRates: {
    0: 0.0765,  // No children
    1: 0.34,    // 1 child
    2: 0.40,    // 2 children
    3: 0.45,    // 3+ children
  },
  plateauAmounts: {
    0: dollarsToCents(7840),   // No children
    1: dollarsToCents(12390),  // 1 child
    2: dollarsToCents(17340),  // 2 children
    3: dollarsToCents(17340),  // 3+ children
  },
  phaseOutStarts: {
    marriedJointly: {
      0: dollarsToCents(16370),  // No children
      1: dollarsToCents(26610),  // 1 child
      2: dollarsToCents(26610),  // 2 children
      3: dollarsToCents(26610),  // 3+ children
    },
    single: {
      0: dollarsToCents(9820),   // No children
      1: dollarsToCents(20060),  // 1 child
      2: dollarsToCents(20060),  // 2 children
      3: dollarsToCents(20060),  // 3+ children
    },
    marriedSeparately: {
      0: dollarsToCents(9820),   // No children
      1: dollarsToCents(20060),  // 1 child
      2: dollarsToCents(20060),  // 2 children
      3: dollarsToCents(20060),  // 3+ children
    },
    headOfHousehold: {
      0: dollarsToCents(16370),  // No children
      1: dollarsToCents(26610),  // 1 child
      2: dollarsToCents(26610),  // 2 children
      3: dollarsToCents(26610),  // 3+ children
    },
  },
  phaseOutRates: {
    0: 0.0765,  // No children
    1: 0.1598,  // 1 child
    2: 0.2106,  // 2 children
    3: 0.2106,  // 3+ children
  },
  ageRequirements: {
    minimumAge: 25,
    maximumAge: 64,
  },
};

// American Opportunity Tax Credit parameters for 2025
export const AOTC_2025 = {
  maxCredit: dollarsToCents(2500), // Per student
  refundablePercentage: 0.40, // 40% refundable
  phaseOutStart: {
    marriedJointly: dollarsToCents(160000),
    single: dollarsToCents(80000),
    marriedSeparately: dollarsToCents(0), // Not available for MFS
    headOfHousehold: dollarsToCents(80000),
  },
  phaseOutRange: dollarsToCents(20000), // Phases out over $20,000
};

// Lifetime Learning Credit parameters for 2025
export const LLC_2025 = {
  maxCredit: dollarsToCents(2000), // Per return (not per student)
  creditRate: 0.20, // 20% of qualified expenses
  maxExpenses: dollarsToCents(10000), // Up to $10,000 in expenses
  phaseOutStart: {
    marriedJointly: dollarsToCents(160000),
    single: dollarsToCents(80000),
    marriedSeparately: dollarsToCents(0), // Not available for MFS
    headOfHousehold: dollarsToCents(80000),
  },
  phaseOutRange: dollarsToCents(20000), // Phases out over $20,000
};

// Child and Dependent Care Credit parameters for 2025
export const CDCC_2025 = {
  maxExpenses: {
    1: dollarsToCents(3000), // One child
    2: dollarsToCents(6000), // Two or more children
  },
  creditRates: {
    // Sliding scale based on AGI
    base: 0.20, // 20% for higher incomes
    max: 0.35,  // 35% for lower incomes
  },
  phaseOutStart: dollarsToCents(15000),
  phaseOutEnd: dollarsToCents(43000),
};

// Retirement Savings Contributions Credit (Saver's Credit) for 2025
export const SAVERS_CREDIT_2025 = {
  maxContribution: dollarsToCents(2000), // Per person
  creditRates: {
    marriedJointly: [
      { agiLimit: dollarsToCents(47550), rate: 0.50 },
      { agiLimit: dollarsToCents(51800), rate: 0.20 },
      { agiLimit: dollarsToCents(79500), rate: 0.10 },
    ],
    single: [
      { agiLimit: dollarsToCents(23775), rate: 0.50 },
      { agiLimit: dollarsToCents(25900), rate: 0.20 },
      { agiLimit: dollarsToCents(39750), rate: 0.10 },
    ],
    headOfHousehold: [
      { agiLimit: dollarsToCents(35663), rate: 0.50 },
      { agiLimit: dollarsToCents(38850), rate: 0.20 },
      { agiLimit: dollarsToCents(59625), rate: 0.10 },
    ],
  },
};