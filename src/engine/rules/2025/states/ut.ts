/**
 * Utah (UT) Tax Rules for 2025
 *
 * Utah has a flat income tax rate of 4.65% (reduced from 4.85% in 2024).
 * Utah offers a tax credit system rather than deductions.
 *
 * Sources:
 * - Utah State Tax Commission
 * - https://tax.utah.gov/forms/current/tc-40.pdf
 * - 2025 UT Tax Rate Schedule
 *
 * Last Updated: 2025-01-22
 */


export const UT_RULES_2025 = {
  state: 'UT',
  taxYear: 2025,

  /**
   * Utah uses tax credits instead of traditional deductions
   * Setting to zero as Utah calculates credits differently
   */
  standardDeduction: {
    single: 0,
    marriedJointly: 0,
    marriedSeparately: 0,
    headOfHousehold: 0
  },

  /**
   * Utah provides tax credits per exemption (not deductions)
   * Credit amounts per person: approximately $785 for 2025
   */
  personalExemption: 0,  // Utah uses credits instead

  /**
   * Utah Flat Tax Rate: 4.65% for 2025
   */
  brackets: {
    single: [
      { max: Infinity, rate: 0.0465 }
    ],
    marriedJointly: [
      { max: Infinity, rate: 0.0465 }
    ],
    marriedSeparately: [
      { max: Infinity, rate: 0.0465 }
    ],
    headOfHousehold: [
      { max: Infinity, rate: 0.0465 }
    ]
  },

  /**
   * Utah Nonrefundable Tax Credits for 2025
   * Personal exemption credit: approximately $785 per exemption
   */
  personalExemptionCredit: 78500,  // $785 per exemption (subject to phase-out)

  /**
   * Special UT provisions
   */
  specialProvisions: {
    allowsItemizedDeductions: false,  // Utah uses credits
    hasPersonalExemptionCredit: true,
    flatTaxRate: 0.0465
  }
};
