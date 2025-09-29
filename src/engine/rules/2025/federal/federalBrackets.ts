import type { FilingStatus } from '../../../types';

// 2025 ordinary income tax brackets (Rev. Proc. 2024-40)
// Ranges are inclusive of min, exclusive of max. All amounts in cents.
export interface TaxBracket { 
  min: number; 
  max: number; 
  rate: number; 
}

export const FEDERAL_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0,        max: 1192500,  rate: 0.10 },  // $0 - $11,925
    { min: 1192500,  max: 4847500,  rate: 0.12 },  // $11,925 - $48,475
    { min: 4847500,  max: 10335000, rate: 0.22 },  // $48,475 - $103,350
    { min: 10335000, max: 19730000, rate: 0.24 },  // $103,350 - $197,300
    { min: 19730000, max: 25052500, rate: 0.32 },  // $197,300 - $250,525
    { min: 25052500, max: 62635000, rate: 0.35 },  // $250,525 - $626,350
    { min: 62635000, max: Infinity, rate: 0.37 },  // $626,350+
  ],
  marriedJointly: [
    { min: 0,        max: 2385000,  rate: 0.10 },  // $0 - $23,850
    { min: 2385000,  max: 9695000,  rate: 0.12 },  // $23,850 - $96,950
    { min: 9695000,  max: 20670000, rate: 0.22 },  // $96,950 - $206,700
    { min: 20670000, max: 39460000, rate: 0.24 },  // $206,700 - $394,600
    { min: 39460000, max: 50105000, rate: 0.32 },  // $394,600 - $501,050
    { min: 50105000, max: 75160000, rate: 0.35 },  // $501,050 - $751,600
    { min: 75160000, max: Infinity, rate: 0.37 },  // $751,600+
  ],
  marriedSeparately: [
    { min: 0,        max: 1192500,  rate: 0.10 },  // $0 - $11,925
    { min: 1192500,  max: 4847500,  rate: 0.12 },  // $11,925 - $48,475
    { min: 4847500,  max: 10335000, rate: 0.22 },  // $48,475 - $103,350
    { min: 10335000, max: 19730000, rate: 0.24 },  // $103,350 - $197,300
    { min: 19730000, max: 25052500, rate: 0.32 },  // $197,300 - $250,525
    { min: 25052500, max: 37580000, rate: 0.35 },  // $250,525 - $375,800
    { min: 37580000, max: Infinity, rate: 0.37 },  // $375,800+
  ],
  headOfHousehold: [
    { min: 0,        max: 1700000,  rate: 0.10 },  // $0 - $17,000
    { min: 1700000,  max: 6485000,  rate: 0.12 },  // $17,000 - $64,850
    { min: 6485000,  max: 10335000, rate: 0.22 },  // $64,850 - $103,350
    { min: 10335000, max: 19730000, rate: 0.24 },  // $103,350 - $197,300
    { min: 19730000, max: 25050000, rate: 0.32 },  // $197,300 - $250,500
    { min: 25050000, max: 62635000, rate: 0.35 },  // $250,500 - $626,350
    { min: 62635000, max: Infinity, rate: 0.37 },  // $626,350+
  ],
};