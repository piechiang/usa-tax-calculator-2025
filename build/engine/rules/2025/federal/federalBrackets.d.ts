import type { FilingStatus } from './standardDeductions';
export interface TaxBracket {
    min: number;
    max: number;
    rate: number;
}
export declare const FEDERAL_BRACKETS_2025: Record<FilingStatus, TaxBracket[]>;
//# sourceMappingURL=federalBrackets.d.ts.map