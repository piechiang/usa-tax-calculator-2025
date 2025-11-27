import { FEDERAL_BRACKETS_2025 } from '../engine';
import { STANDARD_DEDUCTION_2025 } from '../engine/rules/2025/federal/deductions';
import { MD_RULES_2025 } from '../engine/rules/2025/states/md';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface FederalTaxBrackets {
  single: TaxBracket[];
  marriedJointly: TaxBracket[];
  marriedSeparately: TaxBracket[];
  headOfHousehold: TaxBracket[];
}

export interface StandardDeductions {
  single: number;
  marriedJointly: number;
  marriedSeparately: number;
  headOfHousehold: number;
}

const centsToDollars = (value: number): number =>
  value === Infinity ? Infinity : value / 100;

const mapFederalBrackets = (): FederalTaxBrackets => ({
  single: FEDERAL_BRACKETS_2025.single.map(({ min, max, rate }) => ({
    min: centsToDollars(min),
    max: centsToDollars(max),
    rate
  })),
  marriedJointly: FEDERAL_BRACKETS_2025.marriedJointly.map(({ min, max, rate }) => ({
    min: centsToDollars(min),
    max: centsToDollars(max),
    rate
  })),
  marriedSeparately: FEDERAL_BRACKETS_2025.marriedSeparately.map(({ min, max, rate }) => ({
    min: centsToDollars(min),
    max: centsToDollars(max),
    rate
  })),
  headOfHousehold: FEDERAL_BRACKETS_2025.headOfHousehold.map(({ min, max, rate }) => ({
    min: centsToDollars(min),
    max: centsToDollars(max),
    rate
  }))
});

export const federalTaxBrackets: FederalTaxBrackets = mapFederalBrackets();

// Updated to 2025 values per IRS Rev. Proc. 2024-40
// These values match the engine constants in src/engine/rules/2025/federal/deductions.ts
export const standardDeductions: StandardDeductions = {
  single: centsToDollars(STANDARD_DEDUCTION_2025.single),
  marriedJointly: centsToDollars(STANDARD_DEDUCTION_2025.marriedJointly),
  marriedSeparately: centsToDollars(STANDARD_DEDUCTION_2025.marriedSeparately),
  headOfHousehold: centsToDollars(STANDARD_DEDUCTION_2025.headOfHousehold)
};

export const marylandTaxBrackets: TaxBracket[] = MD_RULES_2025.brackets.map(
  ({ min, max, rate }) => ({
    min: centsToDollars(min),
    max: centsToDollars(max),
    rate
  })
);

export const marylandCountyRates: Record<string, number> = {
  ...MD_RULES_2025.localRates
};
