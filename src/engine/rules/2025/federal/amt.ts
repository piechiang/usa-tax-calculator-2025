import { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Alternative Minimum Tax (AMT) Constants for 2025
 * Form 6251 - Alternative Minimum Tax - Individuals
 *
 * Source: IRS Rev. Proc. 2024-40 (2025 inflation adjustments)
 * https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
 *
 * The AMT is a parallel tax system designed to ensure that taxpayers with
 * high incomes and significant tax preferences pay at least a minimum amount
 * of tax. The TCJA (2017) significantly reduced AMT impact by increasing
 * exemption amounts and phase-out thresholds.
 */

/**
 * AMT Exemption Amounts for 2025 (Rev. Proc. 2024-40 §3.37)
 * These amounts are subtracted from AMTI before calculating AMT
 */
export const AMT_EXEMPTION_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(88100),               // $88,100
  marriedJointly: dollarsToCents(137000),      // $137,000
  marriedSeparately: dollarsToCents(68500),    // $68,500
  headOfHousehold: dollarsToCents(88100),      // $88,100
};

/**
 * AMT Exemption Phase-out Thresholds for 2025 (Rev. Proc. 2024-40 §3.37)
 * When AMTI exceeds these amounts, the exemption is reduced by 25% of the excess
 *
 * Formula: Reduced Exemption = Exemption - max(0, (AMTI - Threshold) * 0.25)
 * Exemption is completely phased out when AMTI exceeds Threshold + (Exemption * 4)
 */
export const AMT_EXEMPTION_PHASEOUT_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(626350),              // $626,350
  marriedJointly: dollarsToCents(1252700),     // $1,252,700
  marriedSeparately: dollarsToCents(626350),   // $626,350
  headOfHousehold: dollarsToCents(626350),     // $626,350
};

/**
 * AMT Tax Rate Brackets for 2025
 * Two-tier rate structure: 26% and 28%
 *
 * The threshold where the rate increases from 26% to 28% varies by filing status
 * Source: IRS Form 6251 instructions for 2025
 */
export const AMT_RATE_THRESHOLD_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(220700),              // $220,700
  marriedJointly: dollarsToCents(220700),      // $220,700
  marriedSeparately: dollarsToCents(110350),   // $110,350
  headOfHousehold: dollarsToCents(220700),     // $220,700
};

/**
 * AMT Tax Rates
 * 26% on taxable excess up to threshold
 * 28% on taxable excess above threshold
 */
export const AMT_RATES = {
  lower: 0.26,  // 26% rate on income up to threshold
  upper: 0.28,  // 28% rate on income above threshold
};

/**
 * Foreign Tax Credit Limitation for AMT
 * The foreign tax credit limitation is calculated differently for AMT purposes
 * This is a complex calculation that may differ from regular tax FTC limitation
 */
export const AMT_FOREIGN_TAX_CREDIT_RULES = {
  // AMT foreign tax credit is limited to AMT foreign source income
  // This requires separate tracking of foreign source income for AMT
  enabled: true,
};

/**
 * AMT Preference Items (added to taxable income to calculate AMTI)
 * These are items that receive favorable treatment under regular tax but are
 * added back for AMT purposes
 */
export const AMT_PREFERENCE_ITEMS = {
  // Tax-exempt interest from certain private activity bonds
  privateActivityBondInterest: true,

  // Percentage depletion in excess of adjusted basis
  excessDepletion: true,

  // Accelerated depreciation on certain property (pre-1987)
  acceleratedDepreciation: true,
};

/**
 * AMT Adjustment Items (differences between regular tax and AMT calculations)
 * These adjustments can be positive or negative
 */
export const AMT_ADJUSTMENT_ITEMS = {
  // State and local tax deduction is not allowed for AMT
  // Under TCJA, this is capped at $10,000 for regular tax, so impact is limited
  saltDeduction: true,

  // Medical expense deduction threshold is 10% for AMT (was 7.5% for regular)
  // Note: For 2025, regular tax also uses 7.5%, so no adjustment needed
  medicalExpenseThreshold: 0.075, // Same as regular tax for 2025

  // Miscellaneous itemized deductions subject to 2% floor (suspended under TCJA)
  miscellaneousDeductions: false, // Suspended 2018-2025

  // Standard deduction is not allowed for AMT (must use itemized for AMT calculation)
  standardDeduction: true,

  // Personal exemptions (suspended under TCJA)
  personalExemptions: false, // Suspended 2018-2025

  // Incentive stock options (ISO) spread
  isoSpread: true,

  // Depreciation differences (MACRS vs ADS)
  depreciation: true,

  // Tax refunds included in income for regular tax are not included for AMT
  taxRefunds: true,

  // Investment interest expense limitation
  investmentInterest: true,

  // Passive activity losses
  passiveActivityLosses: true,

  // Net operating loss deduction (limited to 90% of AMTI for AMT)
  nolDeduction: true,
};

/**
 * AMT Credit (Minimum Tax Credit)
 * Taxpayers who pay AMT may be able to take a credit in future years
 * when their regular tax exceeds AMT
 *
 * The credit is limited to timing differences (e.g., ISO spread, depreciation)
 * and cannot be claimed for exclusion items (e.g., SALT, standard deduction)
 */
export const AMT_CREDIT_RULES = {
  // Credit is allowed for timing differences only
  timingDifferencesOnly: true,

  // Credit is limited to the amount by which regular tax exceeds tentative minimum tax
  limitedToRegularTaxExcess: true,

  // Credit can be carried forward indefinitely
  carryforwardIndefinite: true,

  // No carryback allowed
  carrybackAllowed: false,
};

/**
 * Qualified Small Business Stock (QSBS) Exclusion for AMT
 * 7% of excluded gain under Section 1202 is a preference item for AMT
 */
export const AMT_QSBS_PREFERENCE_RATE = 0.07;

/**
 * Itemized Deduction Adjustments for AMT
 * Certain itemized deductions are not allowed or limited for AMT
 */
export const AMT_ITEMIZED_ADJUSTMENTS = {
  // Not allowed for AMT:
  saltNotAllowed: true,           // State and local taxes
  miscNotAllowed: true,           // Miscellaneous deductions (suspended anyway)

  // Allowed but may differ:
  medicalExpenseThreshold: 0.075, // 7.5% of AGI (same as regular for 2025)

  // Allowed at same amount:
  mortgageInterestAllowed: true,
  charitableAllowed: true,
  casualtyLossAllowed: true,
  gamblingLossAllowed: true,
};

/**
 * Net Operating Loss (NOL) Deduction Limitation for AMT
 * For AMT purposes, NOL deduction is limited to 90% of AMTI (before NOL)
 * versus 80% for regular tax under TCJA
 */
export const AMT_NOL_LIMITATION = 0.90; // 90% of AMTI

/**
 * AMT Depreciation Rules
 * Different depreciation methods apply for AMT:
 * - ADS (Alternative Depreciation System) must be used for certain property
 * - Longer recovery periods apply
 */
export const AMT_DEPRECIATION_RULES = {
  useADS: true,
  // Property placed in service after 1998 may not have adjustment
  post1998PropertyExempt: true,
};
