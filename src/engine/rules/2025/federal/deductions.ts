import { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

// Standard deductions for 2025 (converted to cents)
export const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(15750),
  marriedJointly: dollarsToCents(31500),
  marriedSeparately: dollarsToCents(15750),
  headOfHousehold: dollarsToCents(23625),
};

// Additional standard deduction amounts for 2025
export const ADDITIONAL_STANDARD_DEDUCTION_2025 = {
  age65OrOlder: dollarsToCents(1400), // Per person
  blind: dollarsToCents(1400), // Per person
};

// SALT (State and Local Tax) deduction cap
export const SALT_CAP_2025 = dollarsToCents(10000);

// Medical expense AGI threshold
export const MEDICAL_EXPENSE_AGI_THRESHOLD = 0.075; // 7.5% of AGI

// Charitable deduction limits
export const CHARITABLE_DEDUCTION_LIMITS = {
  cash: 0.60, // 60% of AGI for cash contributions
  property: 0.30, // 30% of AGI for property contributions
  capitalGainProperty: 0.20, // 20% of AGI for capital gain property
};

// Personal exemption (suspended for 2018-2025)
export const PERSONAL_EXEMPTION_2025 = 0;

// Itemized deduction phaseout thresholds (suspended for 2018-2025)
export const ITEMIZED_DEDUCTION_PHASEOUT_2025 = {
  enabled: false,
  thresholds: {
    single: dollarsToCents(0),
    marriedJointly: dollarsToCents(0),
    marriedSeparately: dollarsToCents(0),
    headOfHousehold: dollarsToCents(0),
  }
};