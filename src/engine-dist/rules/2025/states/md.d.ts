import { TaxBracket } from '../../../types';
export declare const MD_RULES_2025: {
    standardDeduction: {
        marriedJointly: number;
        single: number;
        marriedSeparately: number;
        headOfHousehold: number;
    };
    brackets: TaxBracket[];
    defaultLocalRate: number;
    localRates: Record<string, number>;
    personalExemption: {
        taxpayer: number;
        spouse: number;
        dependent: number;
    };
    eitcPercentage: number;
    taxFreePay: {
        military: boolean;
        railroad: boolean;
        pension: {
            maximum: number;
            ageRequirement: number;
        };
    };
    itemizedLimitations: {
        saltDeduction: {
            allowFull: boolean;
        };
    };
    povertyLevelExemption: {
        enabled: boolean;
        thresholds: {
            single: number;
            marriedJointly: number;
            marriedSeparately: number;
            headOfHousehold: number;
        };
    };
};
//# sourceMappingURL=md.d.ts.map