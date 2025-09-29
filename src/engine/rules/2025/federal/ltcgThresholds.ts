import type { FilingStatus } from '../../../types';

// Preferential long-term capital gains / qualified dividends thresholds for 2025
// Source: Rev. Proc. 2024-40 §2.03
// All amounts in cents
export interface LTCGThresholds { 
  zeroRateMax: number;      // Upper limit for 0% rate
  fifteenRateMax: number;   // Upper limit for 15% rate (above this is 20%)
}

export const LTCG_2025: Record<FilingStatus, LTCGThresholds> = {
  marriedJointly: { 
    zeroRateMax: 9670000,     // $96,700
    fifteenRateMax: 60005000  // $600,050
  },
  marriedSeparately: { 
    zeroRateMax: 4835000,     // $48,350
    fifteenRateMax: 30000000  // $300,000
  },
  headOfHousehold: { 
    zeroRateMax: 6475000,     // $64,750
    fifteenRateMax: 56670000  // $566,700
  },
  single: { 
    zeroRateMax: 4835000,     // $48,350
    fifteenRateMax: 53340000  // $533,400
  },
};