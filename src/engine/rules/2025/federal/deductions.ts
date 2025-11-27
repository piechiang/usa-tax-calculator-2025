import { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

// Standard deductions for 2025 (converted to cents)
// Source: IRS Rev. Proc. 2024-40, official 2025 amounts
export const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(15000),
  marriedJointly: dollarsToCents(30000),
  marriedSeparately: dollarsToCents(15000),
  headOfHousehold: dollarsToCents(22500),
};

// Additional standard deduction amounts for 2025
// Source: IRS Rev. Proc. 2024-40 §2.15
// Note: Different amounts for unmarried vs married taxpayers
export const ADDITIONAL_STANDARD_DEDUCTION_2025 = {
  // For unmarried taxpayers (Single, Head of Household)
  age65OrOlderUnmarried: dollarsToCents(2000), // Per person
  blindUnmarried: dollarsToCents(2000), // Per person
  // For married taxpayers (MFJ, MFS, QSS)
  age65OrOlderMarried: dollarsToCents(1600), // Per person
  blindMarried: dollarsToCents(1600), // Per person
  // Legacy exports for backwards compatibility - uses unmarried amounts
  age65OrOlder: dollarsToCents(2000),
  blind: dollarsToCents(2000),
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