export declare const CTC_2025: {
    maxCredit: number;
    additionalChildCredit: number;
    phaseOutThresholds: {
        marriedJointly: number;
        single: number;
        marriedSeparately: number;
        headOfHousehold: number;
    };
    phaseOutRate: number;
};
export declare const EITC_2025: {
    maxCredits: {
        0: number;
        1: number;
        2: number;
        3: number;
    };
    phaseInRates: {
        0: number;
        1: number;
        2: number;
        3: number;
    };
    plateauAmounts: {
        0: number;
        1: number;
        2: number;
        3: number;
    };
    phaseOutStarts: {
        marriedJointly: {
            0: number;
            1: number;
            2: number;
            3: number;
        };
        single: {
            0: number;
            1: number;
            2: number;
            3: number;
        };
        marriedSeparately: {
            0: number;
            1: number;
            2: number;
            3: number;
        };
        headOfHousehold: {
            0: number;
            1: number;
            2: number;
            3: number;
        };
    };
    phaseOutRates: {
        0: number;
        1: number;
        2: number;
        3: number;
    };
    ageRequirements: {
        minimumAge: number;
        maximumAge: number;
    };
};
export declare const AOTC_2025: {
    maxCredit: number;
    refundablePercentage: number;
    phaseOutStart: {
        marriedJointly: number;
        single: number;
        marriedSeparately: number;
        headOfHousehold: number;
    };
    phaseOutRange: number;
};
export declare const LLC_2025: {
    maxCredit: number;
    creditRate: number;
    maxExpenses: number;
    phaseOutStart: {
        marriedJointly: number;
        single: number;
        marriedSeparately: number;
        headOfHousehold: number;
    };
    phaseOutRange: number;
};
export declare const CDCC_2025: {
    maxExpenses: {
        1: number;
        2: number;
    };
    creditRates: {
        base: number;
        max: number;
    };
    phaseOutStart: number;
    phaseOutEnd: number;
};
export declare const SAVERS_CREDIT_2025: {
    maxContribution: number;
    creditRates: {
        marriedJointly: {
            agiLimit: number;
            rate: number;
        }[];
        single: {
            agiLimit: number;
            rate: number;
        }[];
        headOfHousehold: {
            agiLimit: number;
            rate: number;
        }[];
    };
};
//# sourceMappingURL=credits.d.ts.map