import { FilingStatus } from '../../../types';
export declare const STANDARD_DEDUCTION_2025: Record<FilingStatus, number>;
export declare const ADDITIONAL_STANDARD_DEDUCTION_2025: {
    age65OrOlder: number;
    blind: number;
};
export declare const SALT_CAP_2025: number;
export declare const MEDICAL_EXPENSE_AGI_THRESHOLD = 0.075;
export declare const CHARITABLE_DEDUCTION_LIMITS: {
    cash: number;
    property: number;
    capitalGainProperty: number;
};
export declare const PERSONAL_EXEMPTION_2025 = 0;
export declare const ITEMIZED_DEDUCTION_PHASEOUT_2025: {
    enabled: boolean;
    thresholds: {
        single: number;
        marriedJointly: number;
        marriedSeparately: number;
        headOfHousehold: number;
    };
};
//# sourceMappingURL=deductions.d.ts.map