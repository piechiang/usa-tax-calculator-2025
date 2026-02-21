import { dollarsToCents } from '../../src/engine';
import type {
  FederalInput2025,
  FilingStatus,
  QualifyingChild,
  QualifyingRelative,
  EducationExpenses,
  ForeignIncomeSource,
} from '../../src/engine/types';

type DollarValue = number | undefined;

type DollarDividends = {
  ordinary?: DollarValue;
  qualified?: DollarValue;
};

type DollarK1 = {
  ordinaryBusinessIncome?: DollarValue;
  passiveIncome?: DollarValue;
  portfolioIncome?: DollarValue;
};

type DollarOtherIncome = {
  otherIncome?: DollarValue;
  royalties?: DollarValue;
  guaranteedPayments?: DollarValue;
};

type DollarCapitalDetail = {
  shortTerm?: DollarValue;
  longTerm?: DollarValue;
};

type DollarIncome = {
  wages?: DollarValue;
  interest?: DollarValue;
  dividends?: DollarDividends;
  capGains?: DollarValue;
  capitalGainsDetail?: DollarCapitalDetail;
  scheduleCNet?: DollarValue;
  k1?: DollarK1;
  other?: DollarOtherIncome;
};

type DollarAdjustments = {
  studentLoanInterest?: DollarValue;
  hsaDeduction?: DollarValue;
  iraDeduction?: DollarValue;
  seTaxDeduction?: DollarValue;
  businessExpenses?: DollarValue;
};

type DollarItemized = {
  stateLocalTaxes?: DollarValue;
  mortgageInterest?: DollarValue;
  charitable?: DollarValue;
  medical?: DollarValue;
  other?: DollarValue;
};

type DollarPayments = {
  federalWithheld?: DollarValue;
  estPayments?: DollarValue;
  eitcAdvance?: DollarValue;
  // stateWithheld removed - not part of federal input
};

export interface FederalInputDollarShape {
  filingStatus: FilingStatus;
  primary?: FederalInput2025['primary'];
  spouse?: FederalInput2025['spouse'];
  dependents?: number;
  qualifyingChildren?: QualifyingChild[];
  qualifyingRelatives?: QualifyingRelative[];
  educationExpenses?: EducationExpenses[];
  income?: DollarIncome;
  adjustments?: DollarAdjustments;
  itemized?: DollarItemized;
  payments?: DollarPayments;
  foreignIncomeSources?: ForeignIncomeSource[];
  foreignTaxCreditOptions?: FederalInput2025['foreignTaxCreditOptions'];
}

const cents = (value: DollarValue): number => dollarsToCents(value ?? 0);

const buildDividends = (dividends?: DollarDividends) => ({
  ordinary: cents(dividends?.ordinary),
  qualified: cents(dividends?.qualified),
});

const buildCapitalDetail = (detail?: DollarCapitalDetail, fallback?: DollarValue) => ({
  shortTerm: cents(detail?.shortTerm),
  longTerm: cents(detail?.longTerm ?? fallback),
});

const buildK1 = (k1?: DollarK1) => ({
  ordinaryBusinessIncome: cents(k1?.ordinaryBusinessIncome),
  passiveIncome: cents(k1?.passiveIncome),
  portfolioIncome: cents(k1?.portfolioIncome),
});

const buildOtherIncome = (other?: DollarOtherIncome) => ({
  otherIncome: cents(other?.otherIncome),
  royalties: cents(other?.royalties),
  guaranteedPayments: cents(other?.guaranteedPayments),
});

const buildAdjustments = (adjustments?: DollarAdjustments): FederalInput2025['adjustments'] => ({
  studentLoanInterest: cents(adjustments?.studentLoanInterest),
  hsaDeduction: cents(adjustments?.hsaDeduction),
  iraDeduction: cents(adjustments?.iraDeduction),
  seTaxDeduction: cents(adjustments?.seTaxDeduction),
  businessExpenses: cents(adjustments?.businessExpenses),
});

const buildItemized = (itemized?: DollarItemized): FederalInput2025['itemized'] => ({
  stateLocalTaxes: cents(itemized?.stateLocalTaxes),
  mortgageInterest: cents(itemized?.mortgageInterest),
  charitable: cents(itemized?.charitable),
  medical: cents(itemized?.medical),
  other: cents(itemized?.other),
});

const buildPayments = (payments?: DollarPayments): FederalInput2025['payments'] => ({
  federalWithheld: cents(payments?.federalWithheld),
  estPayments: cents(payments?.estPayments),
  eitcAdvance: cents(payments?.eitcAdvance),
});

/**
 * Helper to construct a fully-populated FederalInput2025 structure from familiar dollar-based shapes.
 * Tests may pass partial sections; unspecified values default to zero or empty collections.
 */
export function buildFederalInput(input: FederalInputDollarShape): FederalInput2025 {
  const income = input.income ?? {};
  const payments = input.payments ?? {};

  return {
    filingStatus: input.filingStatus,
    primary: input.primary ?? {},
    spouse: input.spouse,
    dependents: input.dependents ?? 0,
    qualifyingChildren: input.qualifyingChildren ?? [],
    qualifyingRelatives: input.qualifyingRelatives ?? [],
    educationExpenses: input.educationExpenses ?? [],
    income: {
      wages: cents(income.wages),
      interest: cents(income.interest),
      dividends: buildDividends(income.dividends),
      capGainsNet: cents(income.capGains),
      capitalGainsDetail: buildCapitalDetail(income.capitalGainsDetail, income.capGains),
      scheduleCNet: cents(income.scheduleCNet),
      k1: buildK1(income.k1),
      other: buildOtherIncome(income.other),
    },
    adjustments: buildAdjustments(input.adjustments),
    itemized: buildItemized(input.itemized),
    payments: buildPayments(payments),
    ...(input.foreignIncomeSources && { foreignIncomeSources: input.foreignIncomeSources }),
    ...(input.foreignTaxCreditOptions && {
      foreignTaxCreditOptions: input.foreignTaxCreditOptions,
    }),
  };
}
