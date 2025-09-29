import Decimal from 'decimal.js';
export declare const C: (n: number | string | Decimal) => Decimal;
export declare const toCents: (d: Decimal) => number;
export declare const cents: (n: number) => Decimal;
export declare const dollarsToCents: (dollars: number) => number;
export declare const centsToDollars: (cents: number) => number;
export declare const addCents: (...vals: (number | undefined | null)[]) => number;
export declare const subtractCents: (a: number, b: number) => number;
export declare const multiplyCents: (cents: number, rate: number) => number;
export declare const max0: (n: number) => number;
export declare const percentOf: (amount: number, percentage: number) => number;
export declare const roundToCents: (amount: number) => number;
export declare const isValidCurrency: (amount: any) => boolean;
export declare const safeCurrencyToCents: (amount: any) => number;
export declare const toCentsFlexible: (amount: any) => number;
export declare const formatCents: (cents: number) => string;
//# sourceMappingURL=money.d.ts.map