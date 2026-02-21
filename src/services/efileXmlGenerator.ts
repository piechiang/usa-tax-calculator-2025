/**
 * E-File XML Generator Service
 *
 * Generates IRS-compliant XML for Form 1040 e-filing.
 * This is a prototype implementation for Phase 3a.
 *
 * Note: Full production use requires IRS schema validation
 * and authorized e-file provider status.
 */

import type { FederalInput2025, FederalResult2025 } from '../engine/types';

// IRS Filing Status Codes
const FILING_STATUS_CODES: Record<string, string> = {
  single: '1',
  marriedJointly: '2',
  marriedSeparately: '3',
  headOfHousehold: '4',
  qualifyingWidow: '5',
};

// XML namespace for IRS e-file
const IRS_NAMESPACE = 'http://www.irs.gov/efile';

export interface EFileReturn {
  taxYear: number;
  submissionId: string;
  xml: string;
  checksum: string;
}

export interface EFileValidationResult {
  isValid: boolean;
  errors: EFileValidationError[];
  warnings: EFileValidationWarning[];
}

export interface EFileValidationError {
  code: string;
  message: string;
  field?: string;
  rule?: string;
}

export interface EFileValidationWarning {
  code: string;
  message: string;
  field?: string;
}

// Extended input for e-file that includes PII not in engine types
export interface EFilePersonInfo {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface EFileExtendedInput {
  federalInput: FederalInput2025;
  primaryInfo?: EFilePersonInfo;
  spouseInfo?: EFilePersonInfo;
}

/**
 * Generate IRS e-file XML from tax calculation data
 */
export function generateEFileXml(
  extendedInput: EFileExtendedInput,
  result: FederalResult2025,
  options: {
    taxYear?: number;
    submissionId?: string;
    includeSchedules?: boolean;
  } = {}
): EFileReturn {
  const taxYear = options.taxYear ?? 2025;
  const submissionId = options.submissionId ?? generateSubmissionId();

  const xml = buildReturnXml(
    extendedInput,
    result,
    taxYear,
    submissionId,
    options.includeSchedules
  );
  const checksum = calculateXmlChecksum(xml);

  return {
    taxYear,
    submissionId,
    xml,
    checksum,
  };
}

/**
 * Build the complete return XML structure
 */
function buildReturnXml(
  extendedInput: EFileExtendedInput,
  result: FederalResult2025,
  taxYear: number,
  submissionId: string,
  includeSchedules = true
): string {
  const header = buildReturnHeader(extendedInput, taxYear, submissionId);
  const data = buildReturnData(extendedInput, result, includeSchedules);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="${IRS_NAMESPACE}" returnVersion="${taxYear}v1.0">
${header}
${data}
</Return>`;
}

/**
 * Build the return header section
 */
function buildReturnHeader(
  extendedInput: EFileExtendedInput,
  taxYear: number,
  submissionId: string
): string {
  const { federalInput, primaryInfo, spouseInfo } = extendedInput;
  const filer = federalInput.primary;
  const spouse = federalInput.spouse;
  const filingStatusCode = FILING_STATUS_CODES[federalInput.filingStatus] ?? '1';

  let spouseSection = '';
  if (
    spouse &&
    (federalInput.filingStatus === 'marriedJointly' ||
      federalInput.filingStatus === 'marriedSeparately')
  ) {
    spouseSection = `
    <SpouseSSN>${formatSSN(spouse.ssn)}</SpouseSSN>
    <SpouseNameControlTxt>${getNameControl(spouseInfo?.lastName ?? spouse.lastName ?? '')}</SpouseNameControlTxt>`;
  }

  const fullName =
    `${primaryInfo?.firstName ?? ''} ${primaryInfo?.lastName ?? ''}`.trim() || 'Taxpayer';
  const address = primaryInfo?.address ?? '123 Main St';
  const city = primaryInfo?.city ?? 'City';
  const state = primaryInfo?.state ?? 'ST';
  const zipCode = primaryInfo?.zipCode ?? '00000';

  return `  <ReturnHeader>
    <ReturnTs>${new Date().toISOString()}</ReturnTs>
    <TaxYr>${taxYear}</TaxYr>
    <TaxPeriodBeginDt>${taxYear}-01-01</TaxPeriodBeginDt>
    <TaxPeriodEndDt>${taxYear}-12-31</TaxPeriodEndDt>
    <SoftwareId>USATAXCALC2025</SoftwareId>
    <SoftwareVersionNum>1.0.0</SoftwareVersionNum>
    <OriginatorGrp>
      <EFIN>000000</EFIN>
      <OriginatorTypeCd>OnlineFiler</OriginatorTypeCd>
    </OriginatorGrp>
    <ReturnTypeCd>1040</ReturnTypeCd>
    <Filer>
      <PrimarySSN>${formatSSN(filer?.ssn)}</PrimarySSN>
      <NameLine1Txt>${escapeXml(fullName)}</NameLine1Txt>
      <PrimaryNameControlTxt>${getNameControl(primaryInfo?.lastName ?? '')}</PrimaryNameControlTxt>${spouseSection}
      <USAddress>
        <AddressLine1Txt>${escapeXml(address)}</AddressLine1Txt>
        <CityNm>${escapeXml(city)}</CityNm>
        <StateAbbreviationCd>${state}</StateAbbreviationCd>
        <ZIPCd>${zipCode}</ZIPCd>
      </USAddress>
    </Filer>
    <FilingStatusCd>${filingStatusCode}</FilingStatusCd>
    <SubmissionId>${submissionId}</SubmissionId>
  </ReturnHeader>`;
}

/**
 * Build the return data section with Form 1040 and schedules
 */
function buildReturnData(
  extendedInput: EFileExtendedInput,
  result: FederalResult2025,
  includeSchedules: boolean
): string {
  const form1040 = buildForm1040(extendedInput.federalInput, result);

  let schedules = '';
  if (includeSchedules) {
    const income = extendedInput.federalInput.income;
    const adjustments = extendedInput.federalInput.adjustments;

    // Schedule 1 (Additional Income and Adjustments) if applicable
    const hasAdditionalIncome =
      (income.scheduleCNet ?? 0) !== 0 || (income.other?.otherIncome ?? 0) !== 0;
    const hasAdjustments =
      (adjustments?.hsaDeduction ?? 0) > 0 ||
      (adjustments?.iraDeduction ?? 0) > 0 ||
      (adjustments?.studentLoanInterest ?? 0) > 0 ||
      (adjustments?.seTaxDeduction ?? 0) > 0 ||
      (adjustments?.educatorExpenses ?? 0) > 0;
    if (hasAdditionalIncome || hasAdjustments) {
      schedules += buildSchedule1(extendedInput.federalInput, result);
    }

    // Schedule A (Itemized Deductions) if itemizing
    if (result.deductionType === 'itemized' && result.itemizedDeduction) {
      schedules += buildScheduleA(extendedInput.federalInput, result);
    }

    // Schedule B (Interest and Dividends) if applicable
    if ((income.interest ?? 0) > 150000 || (income.dividends?.ordinary ?? 0) > 150000) {
      schedules += buildScheduleB(extendedInput.federalInput);
    }

    // Schedule C (Business Income) if applicable
    if (income.scheduleCNet && income.scheduleCNet > 0) {
      schedules += buildScheduleC(extendedInput.federalInput);
    }

    // Schedule D (Capital Gains and Losses) if applicable
    const hasCapitalGains =
      (income.capGainsNet ?? 0) !== 0 ||
      (income.capitalGainsDetail?.shortTerm ?? 0) !== 0 ||
      (income.capitalGainsDetail?.longTerm ?? 0) !== 0;
    if (hasCapitalGains) {
      schedules += buildScheduleD(extendedInput.federalInput, result);
      // Form 8949 accompanies Schedule D
      schedules += buildForm8949(extendedInput.federalInput);
    }

    // Schedule SE (Self-Employment Tax) if applicable
    if ((income.scheduleCNet ?? 0) > 0 || (result.additionalTaxes?.seTax ?? 0) > 0) {
      schedules += buildScheduleSE(extendedInput.federalInput, result);
    }

    // Schedule 2 (Additional Taxes) if applicable
    const hasAdditionalTaxes =
      (result.additionalTaxes?.amt ?? 0) > 0 ||
      (result.additionalTaxes?.seTax ?? 0) > 0 ||
      (result.additionalTaxes?.niit ?? 0) > 0 ||
      (result.additionalTaxes?.medicareSurtax ?? 0) > 0;
    if (hasAdditionalTaxes) {
      schedules += buildSchedule2(extendedInput.federalInput, result);
    }

    // Schedule 3 (Additional Credits) if applicable
    const hasAdditionalCredits =
      (result.credits.ftc ?? 0) > 0 ||
      (result.credits.aotc ?? 0) > 0 ||
      (result.credits.llc ?? 0) > 0 ||
      (result.credits.ptc ?? 0) > 0 ||
      (result.credits.otherNonRefundable ?? 0) > 0 ||
      (result.credits.otherRefundable ?? 0) > 0;
    if (hasAdditionalCredits) {
      schedules += buildSchedule3(extendedInput.federalInput, result);
    }
  }

  return `  <ReturnData>
${form1040}${schedules}
  </ReturnData>`;
}

/**
 * Build Form 1040 main body
 */
function buildForm1040(input: FederalInput2025, result: FederalResult2025): string {
  const income = input.income;
  const payments = input.payments;

  // Calculate total income (cents)
  const totalIncome =
    (income.wages ?? 0) +
    (income.interest ?? 0) +
    (income.dividends?.ordinary ?? 0) +
    (income.capGainsNet ?? 0) +
    (income.scheduleCNet ?? 0);

  // Calculate total adjustments
  const adjustments = input.adjustments;
  const totalAdjustments =
    (adjustments?.businessExpenses ?? 0) +
    (adjustments?.hsaDeduction ?? 0) +
    (adjustments?.seTaxDeduction ?? 0) +
    (adjustments?.iraDeduction ?? 0) +
    (adjustments?.studentLoanInterest ?? 0);

  // Calculate total credits
  const totalCredits =
    (result.credits.ctc ?? 0) +
    (result.credits.aotc ?? 0) +
    (result.credits.llc ?? 0) +
    (result.credits.eitc ?? 0) +
    (result.credits.ftc ?? 0);

  // Deduction used
  const deductionUsed =
    result.deductionType === 'itemized'
      ? (result.itemizedDeduction ?? 0)
      : result.standardDeduction;

  return `    <IRS1040>
      <!-- Filing Status and Personal Info -->
      <IndividualReturnFilingStatusCd>${FILING_STATUS_CODES[input.filingStatus] ?? '1'}</IndividualReturnFilingStatusCd>

      <!-- Income -->
      <WagesAmt>${formatAmount(income.wages)}</WagesAmt>
      <TaxableInterestAmt>${formatAmount(income.interest)}</TaxableInterestAmt>
      <OrdinaryDividendsAmt>${formatAmount(income.dividends?.ordinary)}</OrdinaryDividendsAmt>
      <QualifiedDividendsAmt>${formatAmount(income.dividends?.qualified)}</QualifiedDividendsAmt>
      <TotalIncomeAmt>${formatAmount(totalIncome)}</TotalIncomeAmt>

      <!-- Adjustments -->
      <TotalAdjustmentsAmt>${formatAmount(totalAdjustments)}</TotalAdjustmentsAmt>
      <AdjustedGrossIncomeAmt>${formatAmount(result.agi)}</AdjustedGrossIncomeAmt>

      <!-- Deductions -->
      <TotalItemizedOrStandardDedAmt>${formatAmount(deductionUsed)}</TotalItemizedOrStandardDedAmt>
      <TaxableIncomeAmt>${formatAmount(result.taxableIncome)}</TaxableIncomeAmt>

      <!-- Tax Calculation -->
      <TaxAmt>${formatAmount(result.taxBeforeCredits)}</TaxAmt>
      <TotalCreditsAmt>${formatAmount(totalCredits)}</TotalCreditsAmt>
      <TotalTaxAmt>${formatAmount(result.totalTax)}</TotalTaxAmt>

      <!-- Payments -->
      <WithholdingTaxAmt>${formatAmount(payments.federalWithheld)}</WithholdingTaxAmt>
      <EstimatedTaxPaymentsAmt>${formatAmount(payments.estPayments)}</EstimatedTaxPaymentsAmt>
      <TotalPaymentsAmt>${formatAmount(result.totalPayments)}</TotalPaymentsAmt>

      <!-- Refund or Amount Owed -->
      ${
        result.refundOrOwe > 0
          ? `<OverpaidAmt>${formatAmount(result.refundOrOwe)}</OverpaidAmt>
      <RefundAmt>${formatAmount(result.refundOrOwe)}</RefundAmt>`
          : `<OwedAmt>${formatAmount(Math.abs(result.refundOrOwe))}</OwedAmt>`
      }
    </IRS1040>`;
}

/**
 * Build Schedule A (Itemized Deductions)
 */
function buildScheduleA(input: FederalInput2025, result: FederalResult2025): string {
  const itemized = input.itemized;

  return `
    <IRS1040ScheduleA>
      <MedicalAndDentalExpensesAmt>${formatAmount(itemized?.medical)}</MedicalAndDentalExpensesAmt>
      <StateAndLocalTaxAmt>${formatAmount(Math.min(itemized?.stateLocalTaxes ?? 0, 1000000))}</StateAndLocalTaxAmt>
      <MortgageInterestAmt>${formatAmount(itemized?.mortgageInterest)}</MortgageInterestAmt>
      <GiftsToCharityAmt>${formatAmount(itemized?.charitable)}</GiftsToCharityAmt>
      <OtherItemizedDedAmt>${formatAmount(itemized?.other)}</OtherItemizedDedAmt>
      <TotalItemizedDeductionsAmt>${formatAmount(result.itemizedDeduction)}</TotalItemizedDeductionsAmt>
    </IRS1040ScheduleA>`;
}

/**
 * Build Schedule B (Interest and Dividends)
 */
function buildScheduleB(input: FederalInput2025): string {
  const income = input.income;

  return `
    <IRS1040ScheduleB>
      <TotalInterestAmt>${formatAmount(income.interest)}</TotalInterestAmt>
      <TotalOrdinaryDividendsAmt>${formatAmount(income.dividends?.ordinary)}</TotalOrdinaryDividendsAmt>
    </IRS1040ScheduleB>`;
}

/**
 * Build Schedule C (Business Income) - Simplified
 */
function buildScheduleC(input: FederalInput2025): string {
  const income = input.income;

  return `
    <IRS1040ScheduleC>
      <GrossReceiptsOrSalesAmt>${formatAmount(income.scheduleCNet)}</GrossReceiptsOrSalesAmt>
      <NetProfitOrLossAmt>${formatAmount(income.scheduleCNet)}</NetProfitOrLossAmt>
    </IRS1040ScheduleC>`;
}

/**
 * Build Schedule D (Capital Gains and Losses)
 */
function buildScheduleD(input: FederalInput2025, _result: FederalResult2025): string {
  const income = input.income;
  const shortTermNet = income.capitalGainsDetail?.shortTerm ?? 0;
  const longTermNet = income.capitalGainsDetail?.longTerm ?? 0;
  const totalNet = income.capGainsNet ?? shortTermNet + longTermNet;

  return `
    <IRS1040ScheduleD>
      <!-- Part I: Short-Term Capital Gains and Losses -->
      <NetShortTermCapitalGainLossAmt>${formatAmount(shortTermNet)}</NetShortTermCapitalGainLossAmt>

      <!-- Part II: Long-Term Capital Gains and Losses -->
      <NetLongTermCapitalGainLossAmt>${formatAmount(longTermNet)}</NetLongTermCapitalGainLossAmt>

      <!-- Part III: Summary -->
      <TotalNetGainLossAmt>${formatAmount(totalNet)}</TotalNetGainLossAmt>
      ${totalNet < 0 ? `<AllowableCapitalLossAmt>${formatAmount(Math.max(totalNet, -300000))}</AllowableCapitalLossAmt>` : ''}
    </IRS1040ScheduleD>`;
}

/**
 * Build Schedule SE (Self-Employment Tax)
 */
function buildScheduleSE(input: FederalInput2025, result: FederalResult2025): string {
  const income = input.income;
  const netProfit = income.scheduleCNet ?? 0;

  // Calculate SE tax values (simplified - actual values should come from engine)
  const netEarningsFromSE = Math.max(0, Math.round(netProfit * 0.9235));
  const socialSecurityBase = 17610000; // $176,100 in cents for 2025
  const oasdiBase = Math.min(netEarningsFromSE, socialSecurityBase);
  const oasdiTax = Math.round(oasdiBase * 0.124);
  const medicareTax = Math.round(netEarningsFromSE * 0.029);
  const totalSETax = oasdiTax + medicareTax + (result.additionalTaxes?.medicareSurtax ?? 0);
  const deductibleHalf = Math.floor((oasdiTax + medicareTax) / 2);

  return `
    <IRS1040ScheduleSE>
      <!-- Section A - Short Schedule SE -->
      <NetProfitOrLossAmt>${formatAmount(netProfit)}</NetProfitOrLossAmt>
      <NetEarningsFromSelfEmplAmt>${formatAmount(netEarningsFromSE)}</NetEarningsFromSelfEmplAmt>

      <!-- Self-Employment Tax Calculation -->
      <SocialSecurityTaxAmt>${formatAmount(oasdiTax)}</SocialSecurityTaxAmt>
      <MedicareTaxAmt>${formatAmount(medicareTax)}</MedicareTaxAmt>
      ${(result.additionalTaxes?.medicareSurtax ?? 0) > 0 ? `<AddlMedicareTaxAmt>${formatAmount(result.additionalTaxes?.medicareSurtax)}</AddlMedicareTaxAmt>` : ''}
      <TotalSelfEmploymentTaxAmt>${formatAmount(totalSETax)}</TotalSelfEmploymentTaxAmt>

      <!-- Deductible Part -->
      <DeductibleSelfEmplTaxAmt>${formatAmount(deductibleHalf)}</DeductibleSelfEmplTaxAmt>
    </IRS1040ScheduleSE>`;
}

/**
 * Build Schedule 1 (Additional Income and Adjustments)
 */
function buildSchedule1(input: FederalInput2025, _result: FederalResult2025): string {
  const income = input.income;
  const adjustments = input.adjustments;

  // Part I - Additional Income
  const businessIncome = income.scheduleCNet ?? 0;
  const otherIncome = (income.other?.otherIncome ?? 0) + (income.other?.royalties ?? 0);
  const totalAdditionalIncome = businessIncome + otherIncome;

  // Part II - Adjustments to Income
  const educatorExpenses = adjustments?.educatorExpenses ?? 0;
  const hsaDeduction = adjustments?.hsaDeduction ?? 0;
  const movingExpenses = adjustments?.movingExpensesMilitary ?? 0;
  const seTaxDeduction = adjustments?.seTaxDeduction ?? 0;
  const selfEmployedRetirement = adjustments?.selfEmployedRetirement ?? 0;
  const selfEmployedHealthIns = adjustments?.selfEmployedHealthInsurance ?? 0;
  const iraDeduction = adjustments?.iraDeduction ?? 0;
  const studentLoanInterest = adjustments?.studentLoanInterest ?? 0;
  const alimonyPaid = adjustments?.alimonyPaid ?? 0;
  const otherAdjustments = adjustments?.otherAdjustments ?? 0;

  const totalAdjustments =
    educatorExpenses +
    hsaDeduction +
    movingExpenses +
    seTaxDeduction +
    selfEmployedRetirement +
    selfEmployedHealthIns +
    iraDeduction +
    studentLoanInterest +
    alimonyPaid +
    otherAdjustments;

  return `
    <IRS1040Schedule1>
      <!-- Part I: Additional Income -->
      <BusinessIncomeOrLossAmt>${formatAmount(businessIncome)}</BusinessIncomeOrLossAmt>
      <OtherIncomeAmt>${formatAmount(otherIncome)}</OtherIncomeAmt>
      <TotalAdditionalIncomeAmt>${formatAmount(totalAdditionalIncome)}</TotalAdditionalIncomeAmt>

      <!-- Part II: Adjustments to Income -->
      ${educatorExpenses > 0 ? `<EducatorExpensesAmt>${formatAmount(educatorExpenses)}</EducatorExpensesAmt>` : ''}
      ${hsaDeduction > 0 ? `<HSADeductionAmt>${formatAmount(hsaDeduction)}</HSADeductionAmt>` : ''}
      ${movingExpenses > 0 ? `<MovingExpensesAmt>${formatAmount(movingExpenses)}</MovingExpensesAmt>` : ''}
      ${seTaxDeduction > 0 ? `<DeductibleSelfEmplTaxAmt>${formatAmount(seTaxDeduction)}</DeductibleSelfEmplTaxAmt>` : ''}
      ${selfEmployedRetirement > 0 ? `<SelfEmplRetirementAmt>${formatAmount(selfEmployedRetirement)}</SelfEmplRetirementAmt>` : ''}
      ${selfEmployedHealthIns > 0 ? `<SelfEmplHealthInsuranceAmt>${formatAmount(selfEmployedHealthIns)}</SelfEmplHealthInsuranceAmt>` : ''}
      ${iraDeduction > 0 ? `<IRADeductionAmt>${formatAmount(iraDeduction)}</IRADeductionAmt>` : ''}
      ${studentLoanInterest > 0 ? `<StudentLoanInterestDedAmt>${formatAmount(studentLoanInterest)}</StudentLoanInterestDedAmt>` : ''}
      ${alimonyPaid > 0 ? `<AlimonyPaidAmt>${formatAmount(alimonyPaid)}</AlimonyPaidAmt>` : ''}
      ${otherAdjustments > 0 ? `<OtherAdjustmentsAmt>${formatAmount(otherAdjustments)}</OtherAdjustmentsAmt>` : ''}
      <TotalAdjustmentsAmt>${formatAmount(totalAdjustments)}</TotalAdjustmentsAmt>
    </IRS1040Schedule1>`;
}

/**
 * Build Form 8949 (Sales and Other Dispositions of Capital Assets)
 */
function buildForm8949(input: FederalInput2025): string {
  const income = input.income;
  const shortTermNet = income.capitalGainsDetail?.shortTerm ?? 0;
  const longTermNet = income.capitalGainsDetail?.longTerm ?? 0;

  // If no capital gains detail, use the net amount
  const hasShortTerm = shortTermNet !== 0;
  const hasLongTerm = longTermNet !== 0;

  if (!hasShortTerm && !hasLongTerm) {
    // Use capGainsNet as long-term if no detail provided
    const capGainsNet = income.capGainsNet ?? 0;
    if (capGainsNet === 0) return '';

    return `
    <IRS8949>
      <!-- Form 8949: Sales and Other Dispositions of Capital Assets -->
      <!-- Part II: Long-Term (Box D - Basis reported to IRS) -->
      <LongTermCapitalGainAndLossGrp>
        <TransactionCd>D</TransactionCd>
        <TotalProceedsSalesPriceAmt>0</TotalProceedsSalesPriceAmt>
        <TotalCostOrOtherBasisAmt>0</TotalCostOrOtherBasisAmt>
        <TotalAdjustmentsToGainOrLossAmt>0</TotalAdjustmentsToGainOrLossAmt>
        <TotalGainOrLossAmt>${formatAmount(capGainsNet)}</TotalGainOrLossAmt>
      </LongTermCapitalGainAndLossGrp>
    </IRS8949>`;
  }

  let xml = `
    <IRS8949>
      <!-- Form 8949: Sales and Other Dispositions of Capital Assets -->`;

  // Part I: Short-Term Capital Gains and Losses
  if (hasShortTerm) {
    xml += `
      <!-- Part I: Short-Term (Box A - Basis reported to IRS) -->
      <ShortTermCapitalGainAndLossGrp>
        <TransactionCd>A</TransactionCd>
        <TotalProceedsSalesPriceAmt>0</TotalProceedsSalesPriceAmt>
        <TotalCostOrOtherBasisAmt>0</TotalCostOrOtherBasisAmt>
        <TotalAdjustmentsToGainOrLossAmt>0</TotalAdjustmentsToGainOrLossAmt>
        <TotalGainOrLossAmt>${formatAmount(shortTermNet)}</TotalGainOrLossAmt>
      </ShortTermCapitalGainAndLossGrp>`;
  }

  // Part II: Long-Term Capital Gains and Losses
  if (hasLongTerm) {
    xml += `
      <!-- Part II: Long-Term (Box D - Basis reported to IRS) -->
      <LongTermCapitalGainAndLossGrp>
        <TransactionCd>D</TransactionCd>
        <TotalProceedsSalesPriceAmt>0</TotalProceedsSalesPriceAmt>
        <TotalCostOrOtherBasisAmt>0</TotalCostOrOtherBasisAmt>
        <TotalAdjustmentsToGainOrLossAmt>0</TotalAdjustmentsToGainOrLossAmt>
        <TotalGainOrLossAmt>${formatAmount(longTermNet)}</TotalGainOrLossAmt>
      </LongTermCapitalGainAndLossGrp>`;
  }

  xml += `
    </IRS8949>`;

  return xml;
}

/**
 * Build Schedule 2 (Additional Taxes)
 */
function buildSchedule2(_input: FederalInput2025, result: FederalResult2025): string {
  const amt = result.additionalTaxes?.amt ?? 0;
  const seTax = result.additionalTaxes?.seTax ?? 0;
  const niit = result.additionalTaxes?.niit ?? 0;
  const additionalMedicare = result.additionalTaxes?.medicareSurtax ?? 0;

  // Part I total (AMT + excess advance PTC repayment)
  const partITotal = amt + (result.credits.ptcRepayment ?? 0);

  // Part II total (other taxes)
  const partIITotal = seTax + niit + additionalMedicare;

  // Total additional taxes
  const totalSchedule2 = partITotal + partIITotal;

  return `
    <IRS1040Schedule2>
      <!-- Part I: Tax -->
      ${amt > 0 ? `<AlternativeMinimumTaxAmt>${formatAmount(amt)}</AlternativeMinimumTaxAmt>` : ''}
      ${(result.credits.ptcRepayment ?? 0) > 0 ? `<ExcessAdvancePTCRepaymentAmt>${formatAmount(result.credits.ptcRepayment)}</ExcessAdvancePTCRepaymentAmt>` : ''}
      <TotalTaxPart1Amt>${formatAmount(partITotal)}</TotalTaxPart1Amt>

      <!-- Part II: Other Taxes -->
      ${seTax > 0 ? `<SelfEmploymentTaxAmt>${formatAmount(seTax)}</SelfEmploymentTaxAmt>` : ''}
      ${additionalMedicare > 0 ? `<AddlMedicareTaxAmt>${formatAmount(additionalMedicare)}</AddlMedicareTaxAmt>` : ''}
      ${niit > 0 ? `<NetInvestmentIncomeTaxAmt>${formatAmount(niit)}</NetInvestmentIncomeTaxAmt>` : ''}
      <TotalOtherTaxesAmt>${formatAmount(partIITotal)}</TotalOtherTaxesAmt>

      <!-- Total Schedule 2 -->
      <TotalAdditionalTaxAmt>${formatAmount(totalSchedule2)}</TotalAdditionalTaxAmt>
    </IRS1040Schedule2>`;
}

/**
 * Build Schedule 3 (Additional Credits and Payments)
 */
function buildSchedule3(_input: FederalInput2025, result: FederalResult2025): string {
  // Part I - Nonrefundable Credits
  const ftc = result.credits.ftc ?? 0;
  const aotcNonRefundable = Math.round((result.credits.aotc ?? 0) * 0.6); // 60% non-refundable
  const llc = result.credits.llc ?? 0;
  const adoptionCredit = result.credits.adoptionCreditNonRefundable ?? 0;
  const otherNonRefundable = result.credits.otherNonRefundable ?? 0;

  const totalNonrefundable = ftc + aotcNonRefundable + llc + adoptionCredit + otherNonRefundable;

  // Part II - Other Payments and Refundable Credits
  const ptc = result.credits.ptc ?? 0;
  const aotcRefundable = Math.round((result.credits.aotc ?? 0) * 0.4); // 40% refundable
  const adoptionRefundable = result.credits.adoptionCreditRefundable ?? 0;
  const otherRefundable = result.credits.otherRefundable ?? 0;

  const totalRefundable = ptc + aotcRefundable + adoptionRefundable + otherRefundable;

  return `
    <IRS1040Schedule3>
      <!-- Part I: Nonrefundable Credits -->
      ${ftc > 0 ? `<ForeignTaxCreditAmt>${formatAmount(ftc)}</ForeignTaxCreditAmt>` : ''}
      ${aotcNonRefundable > 0 ? `<EducationCreditAmt>${formatAmount(aotcNonRefundable + llc)}</EducationCreditAmt>` : ''}
      ${llc > 0 && aotcNonRefundable === 0 ? `<LifetimeLearningCreditAmt>${formatAmount(llc)}</LifetimeLearningCreditAmt>` : ''}
      ${adoptionCredit > 0 ? `<AdoptionCreditAmt>${formatAmount(adoptionCredit)}</AdoptionCreditAmt>` : ''}
      ${otherNonRefundable > 0 ? `<OtherNonrefundableCrAmt>${formatAmount(otherNonRefundable)}</OtherNonrefundableCrAmt>` : ''}
      <TotalNonrefundableCreditsAmt>${formatAmount(totalNonrefundable)}</TotalNonrefundableCreditsAmt>

      <!-- Part II: Other Payments and Refundable Credits -->
      ${ptc > 0 ? `<NetPremiumTaxCreditAmt>${formatAmount(ptc)}</NetPremiumTaxCreditAmt>` : ''}
      ${aotcRefundable > 0 ? `<RefundableAOTCAmt>${formatAmount(aotcRefundable)}</RefundableAOTCAmt>` : ''}
      ${adoptionRefundable > 0 ? `<RefundableAdoptionCreditAmt>${formatAmount(adoptionRefundable)}</RefundableAdoptionCreditAmt>` : ''}
      ${otherRefundable > 0 ? `<OtherRefundableCrAmt>${formatAmount(otherRefundable)}</OtherRefundableCrAmt>` : ''}
      <TotalOtherPaymentsRfdblCrAmt>${formatAmount(totalRefundable)}</TotalOtherPaymentsRfdblCrAmt>
    </IRS1040Schedule3>`;
}

/**
 * Validate e-file XML against IRS business rules
 * This is a simplified validation - production would use full IRS rules
 */
export function validateEFileXml(
  input: FederalInput2025,
  result: FederalResult2025
): EFileValidationResult {
  const errors: EFileValidationError[] = [];
  const warnings: EFileValidationWarning[] = [];

  // Required field validations
  if (!input.primary?.ssn) {
    errors.push({
      code: 'R0001',
      message: 'Primary SSN is required',
      field: 'primary.ssn',
      rule: 'IND-001',
    });
  }

  if (!input.filingStatus) {
    errors.push({
      code: 'R0002',
      message: 'Filing status is required',
      field: 'filingStatus',
      rule: 'IND-002',
    });
  }

  // Married filing jointly requires spouse info
  if (input.filingStatus === 'marriedJointly' && !input.spouse?.ssn) {
    errors.push({
      code: 'R0003',
      message: 'Spouse SSN required for married filing jointly',
      field: 'spouse.ssn',
      rule: 'IND-003',
    });
  }

  // SALT cap warning (in cents: $10,000 = 1,000,000 cents)
  if ((input.itemized?.stateLocalTaxes ?? 0) > 1000000) {
    warnings.push({
      code: 'W0002',
      message: 'State and local tax deduction capped at $10,000',
      field: 'itemized.stateLocalTaxes',
    });
  }

  // Negative AGI warning
  if (result.agi < 0) {
    warnings.push({
      code: 'W0003',
      message: 'Negative AGI may require additional forms',
      field: 'agi',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper functions

function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
}

function formatSSN(ssn?: string): string {
  if (!ssn) return '000000000';
  return ssn.replace(/\D/g, '').padStart(9, '0');
}

function getNameControl(lastName: string): string {
  // IRS name control is first 4 characters of last name, uppercase
  return lastName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, ' ');
}

function formatAmount(amount?: number): string {
  // Engine values are in cents, convert to dollars for XML
  if (amount === undefined || amount === null) return '0';
  return Math.round(amount / 100).toString();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function calculateXmlChecksum(xml: string): string {
  let hash = 0;
  for (let i = 0; i < xml.length; i++) {
    const char = xml.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Export e-file data as downloadable XML file
 */
export function downloadEFileXml(efileReturn: EFileReturn): void {
  const blob = new Blob([efileReturn.xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tax-return-${efileReturn.taxYear}-${efileReturn.submissionId}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
