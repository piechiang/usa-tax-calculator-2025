// FilingStatus is used in computeEITC2025 parameter types

// EITC parameters for 2025 (Rev. Proc. 2024-40 §2.06)
// All amounts in cents
export type EITCQualifyingChildren = 0 | 1 | 2 | 3;

export interface EITCTableRow {
  earnedIncomeAmount: number;    // where max credit is reached
  maxCredit: number;             // maximum credit
  thresholdPhaseoutMFJ: number;  // AGI/earned income where phaseout begins (MFJ)
  completedPhaseoutMFJ: number;  // where credit becomes 0 (MFJ)
  thresholdPhaseoutOther: number;// phaseout begins (all other filing statuses)
  completedPhaseoutOther: number;// where credit becomes 0 (non-MFJ)
}

// Investment income limit for EITC eligibility in 2025
export const EITC_INVESTMENT_INCOME_LIMIT_2025 = 1195000; // $11,950

export const EITC_2025: Record<EITCQualifyingChildren, EITCTableRow> = {
  0: { 
    earnedIncomeAmount: 849000,      // $8,490
    maxCredit: 64900,                // $649
    thresholdPhaseoutMFJ: 1773000,   // $17,730
    completedPhaseoutMFJ: 2621400,   // $26,214
    thresholdPhaseoutOther: 1062000, // $10,620
    completedPhaseoutOther: 1910400  // $19,104
  },
  1: { 
    earnedIncomeAmount: 1273000,     // $12,730
    maxCredit: 432800,               // $4,328
    thresholdPhaseoutMFJ: 3047000,   // $30,470
    completedPhaseoutMFJ: 5755400,   // $57,554
    thresholdPhaseoutOther: 2335000, // $23,350
    completedPhaseoutOther: 5043400  // $50,434
  },
  2: { 
    earnedIncomeAmount: 1788000,     // $17,880
    maxCredit: 715200,               // $7,152
    thresholdPhaseoutMFJ: 3047000,   // $30,470
    completedPhaseoutMFJ: 6443000,   // $64,430
    thresholdPhaseoutOther: 2335000, // $23,350
    completedPhaseoutOther: 5731000  // $57,310
  },
  3: { 
    earnedIncomeAmount: 1788000,     // $17,880
    maxCredit: 804600,               // $8,046
    thresholdPhaseoutMFJ: 3047000,   // $30,470
    completedPhaseoutMFJ: 6867500,   // $68,675
    thresholdPhaseoutOther: 2335000, // $23,350
    completedPhaseoutOther: 6155500  // $61,555
  },
};