import { describe, it, expect } from 'vitest';
import {
  computeAdoptionCredit2025,
  ADOPTION_CREDIT_2025,
  type AdoptionCreditInput,
  type AdoptedChild,
} from '../../../../src/engine/credits/adoptionCredit';
import { dollarsToCents } from '../../../../src/engine';

const $ = dollarsToCents;

describe('Adoption Credit 2025 (Form 8839)', () => {
  describe('Basic Credit Calculation', () => {
    it('should calculate credit for domestic adoption with full expenses', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child A',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(15000), // Paid in year of finalization
          priorYearsExpenses: $(5000), // Paid in prior year
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(150000), // Below phase-out
        taxBeforeCredits: $(25000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Total expenses: $20,000 (but capped at $17,280 max)
      expect(result.childDetails[0]!.totalQualifiedExpenses).toBe($(20000));
      expect(result.childDetails[0]!.eligibleExpenses).toBe($(20000));
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(ADOPTION_CREDIT_2025.maxCredit);

      // Split into refundable ($5k) and non-refundable ($12,280)
      expect(result.refundableCredit).toBe($(5000));
      expect(result.nonRefundableCredit).toBe($(12280));
      expect(result.totalAdoptionCredit).toBe($(17280));
    });

    it('should calculate credit for foreign adoption (must be finalized)', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child B',
          adoptionType: 'foreign',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(8000), // Paid in year of finalization
          priorYearsExpenses: $(10000), // Paid in prior years
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: false,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(100000),
        taxBeforeCredits: $(20000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Foreign adoption: All expenses combined when finalized
      // Total expenses: $18,000 but credit capped at max $17,280
      expect(result.childDetails[0]!.totalQualifiedExpenses).toBe($(18000));
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(17280)); // Capped at max

      // Split: $5k refundable, $12,280 non-refundable
      expect(result.refundableCredit).toBe($(5000));
      expect(result.nonRefundableCredit).toBe($(12280));
      expect(result.totalAdoptionCredit).toBe($(17280));
    });

    it('should not allow credit for foreign adoption not yet finalized', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child C',
          adoptionType: 'foreign',
          adoptionStatus: 'pending',
          isSpecialNeeds: false,
          currentYearExpenses: $(10000),
          priorYearsExpenses: $(5000),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: false,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(80000),
        taxBeforeCredits: $(15000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Foreign adoption not finalized: No credit
      expect(result.childDetails[0]!.isEligible).toBe(false);
      expect(result.childDetails[0]!.ineligibilityReason).toBe('Foreign adoption not yet finalized');
      expect(result.totalAdoptionCredit).toBe(0);
    });
  });

  describe('Special Needs Adoption', () => {
    it('should provide full credit for special needs adoption even with no expenses', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Special Needs Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: true,
          yearFinalized: 2025,
          currentYearExpenses: $(0), // No expenses required
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(180000),
        taxBeforeCredits: $(20000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Special needs: Full $17,280 credit regardless of expenses
      expect(result.childDetails[0]!.totalQualifiedExpenses).toBe(0);
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(ADOPTION_CREDIT_2025.maxCredit);
      expect(result.childDetails[0]!.isSpecialNeeds).toBe(true);
      expect(result.totalAdoptionCredit).toBe($(17280));
    });

    it('should provide full credit for special needs even with minimal expenses', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Special Needs Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: true,
          yearFinalized: 2025,
          currentYearExpenses: $(1000), // Only $1k expenses
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(120000),
        taxBeforeCredits: $(18000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Special needs: Still get full $17,280 credit
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(ADOPTION_CREDIT_2025.maxCredit);
      expect(result.totalAdoptionCredit).toBe($(17280));
    });
  });

  describe('Employer-Provided Adoption Assistance', () => {
    it('should reduce qualified expenses by employer assistance', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child with Employer Assistance',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(20000),
          priorYearsExpenses: $(0),
          employerAssistance: $(8000), // Employer paid $8k
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(160000),
        taxBeforeCredits: $(22000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Expenses: $20k - $8k employer = $12k eligible
      expect(result.childDetails[0]!.totalQualifiedExpenses).toBe($(20000));
      expect(result.childDetails[0]!.eligibleExpenses).toBe($(12000));
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(12000));
      expect(result.employerAssistanceExclusion).toBe($(8000));
      expect(result.totalAdoptionCredit).toBe($(12000));
    });

    it('should handle employer assistance exceeding expenses', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(10000),
          priorYearsExpenses: $(0),
          employerAssistance: $(15000), // Employer paid more than expenses
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(130000),
        taxBeforeCredits: $(18000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Eligible expenses = max(0, $10k - $15k) = 0
      expect(result.childDetails[0]!.eligibleExpenses).toBe(0);
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(0);
      expect(result.employerAssistanceExclusion).toBe($(15000));
    });
  });

  describe('Income Phase-Out', () => {
    it('should not phase out credit below $259,190 MAGI', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(17280),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(259190), // At phase-out threshold
        taxBeforeCredits: $(30000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // No phase-out at threshold
      expect(result.wasPhaseoutApplied).toBe(false);
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(17280));
      expect(result.totalAdoptionCredit).toBe($(17280));
    });

    it('should fully phase out credit at $299,190 MAGI', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(17280),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(299190), // At full phase-out
        taxBeforeCredits: $(35000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Full phase-out
      expect(result.wasPhaseoutApplied).toBe(true);
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(0);
      expect(result.totalAdoptionCredit).toBe(0);
    });

    it('should partially phase out credit in range $259,190 - $299,190', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(17280),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(279190), // Midpoint: $259,190 + $20,000
        taxBeforeCredits: $(30000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // At midpoint: 50% reduction
      // Credit before phase-out: $17,280
      // Phase-out: 50% of $17,280 = $8,640 reduction
      // Credit after: $17,280 - $8,640 = $8,640
      expect(result.wasPhaseoutApplied).toBe(true);
      expect(result.childDetails[0]!.creditBeforePhaseout).toBe($(17280));
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(8640));
      expect(result.phaseoutPercentage).toBeCloseTo(0.5, 2);
    });
  });

  describe('Carryforward Rules', () => {
    it('should apply prior year carryforward', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(10000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(140000),
        taxBeforeCredits: $(18000),
        adoptedChildren: children,
        priorYearCarryforward: $(5000), // $5k carried forward
      };

      const result = computeAdoptionCredit2025(input);

      // Current year: $10k credit
      // Plus carryforward: $5k
      // Total available: $15k
      // Refundable: $5k, Non-refundable: $10k
      expect(result.totalAdoptionCredit).toBe($(15000));
      expect(result.carryforwardUsed).toBe($(5000));
      expect(result.unusedCreditCarryforward).toBe(0);
    });

    it('should carry forward unused credit when limited by tax liability', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(17280),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(120000),
        taxBeforeCredits: $(8000), // Low tax liability
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Total credit: $17,280
      // Refundable: $5,000 (not limited by tax)
      // Non-refundable available: $12,280
      // Non-refundable used: $8,000 (limited by tax)
      // Carryforward: $12,280 - $8,000 = $4,280
      expect(result.refundableCredit).toBe($(5000));
      expect(result.nonRefundableCredit).toBe($(8000));
      expect(result.totalAdoptionCredit).toBe($(13000));
      expect(result.unusedCreditCarryforward).toBe($(4280));
    });

    it('should not carry forward if tax liability is sufficient', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(15000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(180000),
        taxBeforeCredits: $(25000), // High enough tax
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Full credit used, no carryforward needed
      expect(result.totalAdoptionCredit).toBe($(15000));
      expect(result.unusedCreditCarryforward).toBe(0);
    });
  });

  describe('Multiple Children', () => {
    it('should calculate credit for multiple children', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child A',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(12000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
        {
          name: 'Child B',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: true,
          yearFinalized: 2025,
          currentYearExpenses: $(0), // Special needs - no expenses required
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(200000),
        taxBeforeCredits: $(35000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Child A: $12,000 credit
      // Child B: $17,280 credit (special needs)
      // Total: $29,280
      // But refundable is capped at $5,000 per return (not per child)
      expect(result.childDetails).toHaveLength(2);
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(12000));
      expect(result.childDetails[1]!.creditAfterPhaseout).toBe($(17280));
      expect(result.refundableCredit).toBe($(5000)); // Capped at $5k per return
      expect(result.nonRefundableCredit).toBe($(24280));
      expect(result.totalAdoptionCredit).toBe($(29280));
    });

    it('should handle mix of eligible and ineligible children', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Eligible Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(10000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
        {
          name: 'Ineligible Child',
          adoptionType: 'foreign',
          adoptionStatus: 'pending', // Not finalized
          isSpecialNeeds: false,
          currentYearExpenses: $(8000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: false,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(130000),
        taxBeforeCredits: $(20000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Only eligible child counts
      expect(result.childDetails[0]!.isEligible).toBe(true);
      expect(result.childDetails[1]!.isEligible).toBe(false);
      expect(result.totalAdoptionCredit).toBe($(10000));
    });
  });

  describe('Prior Year Credits Claimed', () => {
    it('should reduce available credit by prior year claims', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2024, // Finalized last year
          currentYearExpenses: $(8000), // Additional expenses this year
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(10000), // Claimed $10k last year
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(170000),
        taxBeforeCredits: $(22000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Max credit: $17,280
      // Prior claimed: $10,000
      // Available: $7,280
      // Current expenses: $8,000
      // Credit: min($8,000, $7,280) = $7,280
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(7280));
      expect(result.totalAdoptionCredit).toBe($(7280));
    });

    it('should not allow credit if max already claimed', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2024,
          currentYearExpenses: $(5000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(17280), // Already claimed max
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(120000),
        taxBeforeCredits: $(18000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // No additional credit available
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(0);
      expect(result.totalAdoptionCredit).toBe(0);
    });
  });

  describe('Refundable Credit (2025 OBBBA)', () => {
    it('should make $5,000 refundable even with no tax liability', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(15000),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(80000),
        taxBeforeCredits: $(0), // No tax liability
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Refundable portion: $5,000 (not limited by tax)
      // Non-refundable: $10,000 available, but $0 used (no tax)
      // Carryforward: $10,000
      expect(result.refundableCredit).toBe($(5000));
      expect(result.nonRefundableCredit).toBe(0);
      expect(result.totalAdoptionCredit).toBe($(5000));
      expect(result.unusedCreditCarryforward).toBe($(10000));
    });

    it('should cap refundable at $5,000 even with multiple children', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child A',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: true,
          yearFinalized: 2025,
          currentYearExpenses: $(0),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
        {
          name: 'Child B',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: true,
          yearFinalized: 2025,
          currentYearExpenses: $(0),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(190000),
        taxBeforeCredits: $(1000), // Very low tax
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Two special needs children: 2 × $17,280 = $34,560 total
      // Refundable capped at $5,000 per RETURN (not per child)
      // Non-refundable: limited to $1,000 tax liability
      // Carryforward: $34,560 - $5,000 - $1,000 = $28,560
      expect(result.refundableCredit).toBe($(5000));
      expect(result.nonRefundableCredit).toBe($(1000));
      expect(result.totalAdoptionCredit).toBe($(6000));
      expect(result.unusedCreditCarryforward).toBe($(28560));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero expenses for non-special needs child', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Child',
          adoptionType: 'domestic',
          adoptionStatus: 'finalized',
          isSpecialNeeds: false,
          yearFinalized: 2025,
          currentYearExpenses: $(0),
          priorYearsExpenses: $(0),
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(100000),
        taxBeforeCredits: $(15000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // No expenses, not special needs: No credit
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe(0);
      expect(result.totalAdoptionCredit).toBe(0);
    });

    it('should handle no children', () => {
      const input: AdoptionCreditInput = {
        filingStatus: 'single',
        magi: $(100000),
        taxBeforeCredits: $(15000),
        adoptedChildren: [],
      };

      const result = computeAdoptionCredit2025(input);

      expect(result.childDetails).toHaveLength(0);
      expect(result.totalAdoptionCredit).toBe(0);
    });

    it('should handle domestic pending adoption with prior year expenses', () => {
      const children: AdoptedChild[] = [
        {
          name: 'Pending Child',
          adoptionType: 'domestic',
          adoptionStatus: 'pending',
          isSpecialNeeds: false,
          currentYearExpenses: $(0),
          priorYearsExpenses: $(8000), // Paid last year, claim this year
          employerAssistance: $(0),
          priorYearCreditsClaimed: $(0),
          isUsCitizenOrResident: true,
        },
      ];

      const input: AdoptionCreditInput = {
        filingStatus: 'marriedJointly',
        magi: $(150000),
        taxBeforeCredits: $(20000),
        adoptedChildren: children,
      };

      const result = computeAdoptionCredit2025(input);

      // Domestic pending: Can claim prior year expenses
      expect(result.childDetails[0]!.isEligible).toBe(true);
      expect(result.childDetails[0]!.creditAfterPhaseout).toBe($(8000));
      expect(result.totalAdoptionCredit).toBe($(8000));
    });
  });
});
