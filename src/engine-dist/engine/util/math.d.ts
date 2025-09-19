export declare const calculateTaxFromBrackets: (taxableIncome: number, brackets: Array<{
    min: number;
    max: number;
    rate: number;
}>) => number;
export declare const calculateMarginalRate: (taxableIncome: number, brackets: Array<{
    min: number;
    max: number;
    rate: number;
}>) => number;
export declare const calculateEffectiveRate: (totalTax: number, agi: number) => number;
export declare const calculatePhaseOut: (income: number, phaseOutStart: number, phaseOutEnd: number, maxBenefit: number) => number;
export declare const applySaltCap: (saltDeduction: number, cap: number) => number;
export declare const chooseDeduction: (standardDeduction: number, itemizedDeduction: number) => {
    deduction: number;
    isItemizing: boolean;
};
export declare const calculateQBIDeduction: (qbiIncome: number, taxableIncomeBeforeQBI: number, _w2Wages?: number, _filingStatus?: string) => number;
export declare const calculateAdditionalStandardDeduction: (birthDate: string | undefined, isBlind?: boolean, taxYear?: number) => number;
//# sourceMappingURL=math.d.ts.map