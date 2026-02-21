import React, { useState } from 'react';
import { FileText, Download, Eye, Printer } from 'lucide-react';
import type { PersonalInfo, TaxResult, SpouseInfo } from '../../types/CommonTypes';
import type { UIIncomeData, UIDeductions, UIPaymentsData } from '../../utils/engineAdapter';

// Use consolidated types from engineAdapter
type IncomeData = UIIncomeData;

interface Deductions extends UIDeductions {
  useStandardDeduction?: boolean;
  standardDeduction?: number;
  itemizedTotal?: number;
}

type PaymentsData = UIPaymentsData;

interface FormData {
  personalInfo: PersonalInfo;
  incomeData: IncomeData;
  deductions: Deductions;
  taxResult: TaxResult;
  spouseInfo?: SpouseInfo;
  paymentsData?: PaymentsData;
  // Extended data for Schedule generation
  capitalGainsDetails?: {
    shortTermGain: number;
    shortTermLoss: number;
    longTermGain: number;
    longTermLoss: number;
    netShortTerm: number;
    netLongTerm: number;
    totalNetGain: number;
    taxAt0Percent?: number;
    taxAt15Percent?: number;
    taxAt20Percent?: number;
  };
  selfEmploymentData?: {
    netProfit: number;
    netEarningsFromSE: number;
    socialSecurityTax: number;
    medicareTax: number;
    additionalMedicareTax: number;
    totalSETax: number;
    deductibleHalf: number;
  };
  adjustmentsData?: {
    educatorExpenses?: number;
    hsaDeduction?: number;
    selfEmployedHealthInsurance?: number;
    selfEmployedRetirement?: number;
    iraDeduction?: number;
    studentLoanInterest?: number;
    alimonyPaid?: number;
    movingExpensesMilitary?: number;
    seTaxDeduction?: number;
    otherAdjustments?: number;
    totalAdjustments: number;
  };
  // Form 8949 - Capital asset transactions
  capitalTransactions?: {
    shortTerm: CapitalTransaction[];
    longTerm: CapitalTransaction[];
  };
  // Schedule 2 - Additional Taxes
  additionalTaxesData?: {
    amt?: number; // Alternative Minimum Tax (Form 6251)
    amtDetails?: {
      amti?: number; // Alternative Minimum Taxable Income
      exemption?: number; // AMT exemption
      tentativeMinimumTax?: number; // TMT before comparison
    };
    seTax?: number; // Self-Employment Tax (Schedule SE)
    niit?: number; // Net Investment Income Tax (Form 8960)
    niitDetails?: {
      netInvestmentIncome?: number;
      threshold?: number;
      excessAGI?: number;
    };
    additionalMedicareTax?: number; // Additional Medicare Tax (Form 8959)
    householdEmploymentTax?: number; // Schedule H
    firstTimeHomebuyerRepayment?: number; // Form 5405
    otherTaxes?: number;
    totalAdditionalTaxes?: number;
  };
  // Schedule 3 - Additional Credits
  additionalCreditsData?: {
    // Part I - Nonrefundable Credits
    foreignTaxCredit?: number; // Form 1116 or direct
    childDependentCareCredit?: number; // Form 2441
    educationCredits?: {
      aotc?: number; // American Opportunity Credit
      llc?: number; // Lifetime Learning Credit
    };
    retirementSavingsCredit?: number; // Form 8880 (Saver's Credit)
    residentialEnergyCredits?: number; // Form 5695
    otherNonrefundableCredits?: number;
    totalNonrefundableCredits?: number;
    // Part II - Refundable Credits
    earnedIncomeCredit?: number; // Schedule EIC
    additionalChildTaxCredit?: number; // Form 8812
    americanOpportunityRefundable?: number; // 40% of AOTC refundable
    premiumTaxCredit?: number; // Form 8962
    otherRefundableCredits?: number;
    totalRefundableCredits?: number;
  };
  // Schedule B - Interest and Dividends (detailed)
  interestDividendData?: {
    interestSources?: Array<{
      payerName: string;
      amount: number;
    }>;
    dividendSources?: Array<{
      payerName: string;
      ordinaryDividends: number;
      qualifiedDividends?: number;
    }>;
    totalInterest?: number;
    totalOrdinaryDividends?: number;
    totalQualifiedDividends?: number;
    hasForeignAccounts?: boolean;
    foreignAccountCountry?: string;
    hasForeignTrust?: boolean;
  };
  // Schedule C - Business Income (detailed)
  businessData?: {
    businessName?: string;
    businessAddress?: string;
    ein?: string;
    accountingMethod?: 'cash' | 'accrual' | 'other';
    businessCode?: string;
    grossReceipts?: number;
    returnsAndAllowances?: number;
    costOfGoodsSold?: number;
    grossProfit?: number;
    otherIncome?: number;
    // Expenses
    expenses?: {
      advertising?: number;
      carAndTruck?: number;
      commissions?: number;
      contractLabor?: number;
      depreciation?: number;
      employeeBenefits?: number;
      insurance?: number;
      interestMortgage?: number;
      interestOther?: number;
      legal?: number;
      officeExpense?: number;
      pensionPlans?: number;
      rentVehicles?: number;
      rentOther?: number;
      repairs?: number;
      supplies?: number;
      taxes?: number;
      travel?: number;
      mealsDeductible?: number;
      utilities?: number;
      wages?: number;
      otherExpenses?: number;
    };
    totalExpenses?: number;
    netProfit?: number;
  };
  // Schedule E - Supplemental Income (Rental, Royalties, Partnerships, S Corps, Estates, Trusts)
  scheduleEData?: {
    // Part I - Rental Real Estate and Royalties
    rentalProperties?: Array<{
      propertyType:
        | 'single_family'
        | 'multi_family'
        | 'vacation'
        | 'commercial'
        | 'land'
        | 'royalties'
        | 'other';
      propertyAddress?: string;
      fairRentalDays?: number;
      personalUseDays?: number;
      qbiProperty?: boolean; // Qualifies for QBI deduction
      // Income
      rentsReceived?: number;
      royaltiesReceived?: number;
      // Expenses
      expenses?: {
        advertising?: number;
        auto?: number;
        cleaning?: number;
        commissions?: number;
        insurance?: number;
        legal?: number;
        management?: number;
        mortgageInterest?: number;
        otherInterest?: number;
        repairs?: number;
        supplies?: number;
        taxes?: number;
        utilities?: number;
        depreciation?: number;
        other?: number;
      };
      totalExpenses?: number;
      netIncome?: number; // Can be negative (loss)
    }>;
    totalRentalIncome?: number;
    totalRoyaltyIncome?: number;
    totalRentalExpenses?: number;
    netRentalRoyaltyIncome?: number;
    // Part II - Partnerships and S Corporations (K-1 summary)
    partnershipK1s?: Array<{
      entityName: string;
      ein?: string;
      entityType: 'partnership' | 'sCorp';
      passiveActivity?: boolean;
      // Income/Loss items
      ordinaryIncome?: number;
      rentalIncome?: number;
      portfolioIncome?: number;
      guaranteedPayments?: number;
      // Other items
      section179?: number;
      selfEmploymentEarnings?: number;
    }>;
    totalPartnershipIncome?: number;
    // Part III - Estates and Trusts (K-1 summary)
    estateK1s?: Array<{
      estateName: string;
      ein?: string;
      ordinaryIncome?: number;
      rentalIncome?: number;
      capitalGains?: number;
    }>;
    totalEstateIncome?: number;
    // Part IV - Real Estate Mortgage Investment Conduits (REMICs)
    remicIncome?: number;
    // Part V - Summary
    totalScheduleEIncome?: number;
  };
  // Form 2441 - Child and Dependent Care Expenses
  form2441Data?: {
    qualifyingPersons?: Array<{
      name: string;
      ssn?: string;
      dateOfBirth?: string;
      qualifyingReason: 'under13' | 'disabled' | 'spouse';
    }>;
    careProviders?: Array<{
      name: string;
      address?: string;
      tin?: string; // SSN or EIN
      amountPaid: number;
    }>;
    totalExpensesPaid?: number;
    earnedIncome?: number;
    spouseEarnedIncome?: number;
    dependentCareBenefits?: number; // From employer (Box 10 of W-2)
    creditPercentage?: number; // 20-35% based on AGI
    allowableCredit?: number;
  };
  // Form 8863 - Education Credits
  form8863Data?: {
    students?: Array<{
      name: string;
      ssn?: string;
      institution?: string;
      institutionEIN?: string;
      qualifiedExpenses: number;
      // AOTC specific
      isFirstFourYears?: boolean; // First 4 years of post-secondary
      hasNeverClaimedAOTC?: boolean; // Has AOTC been claimed for 4 years?
      isAtLeastHalfTime?: boolean;
      hasFelonyDrugConviction?: boolean;
      // Credit calculation
      aotcAmount?: number;
      llcAmount?: number;
    }>;
    totalAOTC?: number;
    totalLLC?: number;
    refundableAOTC?: number; // 40% of AOTC
    nonRefundableAOTC?: number; // 60% of AOTC
  };
  // Form 8880 - Saver's Credit (Retirement Savings Contributions Credit)
  form8880Data?: {
    taxpayerContributions?: {
      traditionalIRA?: number;
      rothIRA?: number;
      employer401k?: number;
      employer403b?: number;
      employer457b?: number;
      simplePlan?: number;
      sepIRA?: number;
      other?: number;
      totalContributions?: number;
      distributions?: number; // Distributions received (reduces credit)
      netContributions?: number;
    };
    spouseContributions?: {
      traditionalIRA?: number;
      rothIRA?: number;
      employer401k?: number;
      other?: number;
      totalContributions?: number;
      distributions?: number;
      netContributions?: number;
    };
    creditRate?: number; // 10%, 20%, or 50% based on AGI
    totalCredit?: number;
  };
  // Form 5695 - Residential Energy Credits
  form5695Data?: {
    // Part I - Residential Clean Energy Credit (formerly Renewable Energy)
    solarElectric?: number;
    solarWaterHeating?: number;
    fuelCell?: number;
    smallWindEnergy?: number;
    geothermalHeatPump?: number;
    batteryStorage?: number;
    totalCleanEnergy?: number;
    cleanEnergyCredit?: number; // 30% of costs
    // Part II - Energy Efficient Home Improvement Credit
    insulationMaterials?: number;
    exteriorDoorsWindows?: number;
    roofs?: number;
    waterHeaters?: number;
    furnacesBoilers?: number;
    centralAC?: number;
    heatPumps?: number;
    biomassStoves?: number;
    homeEnergyAudits?: number;
    electricPanels?: number;
    totalHomeImprovement?: number;
    homeImprovementCredit?: number; // Various limits apply
    totalResidentialCredit?: number;
  };
  // Form 8962 - Premium Tax Credit
  form8962Data?: {
    // Part I - Annual and Monthly Contribution Amounts
    familySize?: number;
    modifiedAGI?: number;
    dependentsModifiedAGI?: number;
    householdIncome?: number;
    federalPovertyLine?: number;
    householdIncomePercent?: number; // % of FPL
    applicablePercent?: number; // From applicable figure table
    annualContributionAmount?: number;
    monthlyContributionAmount?: number;
    // Part II - Premium Tax Credit Claim
    annualPremium?: number;
    annualSLCSP?: number; // Second Lowest Cost Silver Plan
    annualMaxPTC?: number;
    annualPTCAllowed?: number;
    advancePayments?: number; // APTC received
    netPTC?: number; // Refund or repayment
    excessAPTC?: number; // Amount to repay
    // Monthly allocation (if applicable)
    monthlyData?: Array<{
      month: string;
      enrolled: boolean;
      premium?: number;
      slcsp?: number;
      aptc?: number;
    }>;
    sharedPolicyAllocation?: boolean;
  };
  // Form 1116 - Foreign Tax Credit
  form1116Data?: {
    foreignCountry?: string;
    incomeCategory?: 'general' | 'passive' | 'section951A' | 'foreignBranch' | 'resourcedTreaty';
    // Part I - Taxable Income or Loss From Sources Outside the United States
    grossIncomeFromSources?: number;
    deductionsAllocated?: number;
    apportionedDeductions?: number;
    netForeignSourceIncome?: number;
    // Part II - Foreign Taxes Paid or Accrued
    foreignTaxesPaid?: number;
    foreignTaxesAccrued?: number;
    taxesPaidOrAccruedMethod?: 'paid' | 'accrued';
    // Part III - Figuring the Credit
    totalForeignTaxes?: number;
    carryoverFromPriorYears?: number;
    carrybackFromLaterYears?: number;
    totalAvailableCredit?: number;
    // Limitation calculation
    foreignSourceTaxableIncome?: number;
    totalTaxableIncome?: number;
    taxBeforeCredits?: number;
    foreignTaxCreditLimit?: number;
    allowedCredit?: number;
    creditCarryforward?: number;
  };
  // Form 6251 - Alternative Minimum Tax
  form6251Data?: {
    // Part I - Alternative Minimum Taxable Income (AMTI)
    taxableIncome?: number;
    // Adjustments
    standardDeductionOrSALT?: number;
    taxes?: number;
    refundOfTaxes?: number;
    investmentInterest?: number;
    depletionDeduction?: number;
    netOperatingLoss?: number;
    interestFromPrivateActivityBonds?: number;
    qualifiedSmallBusinessStock?: number;
    exerciseOfISO?: number;
    estateTrustDeductions?: number;
    dispositionProperty?: number;
    depreciation?: number;
    passiveActivities?: number;
    lossLimitations?: number;
    circulationCosts?: number;
    longTermContracts?: number;
    miningCosts?: number;
    researchExperimental?: number;
    installmentSales?: number;
    intangibleDrilling?: number;
    otherAdjustments?: number;
    totalAdjustments?: number;
    // Part II - Alternative Minimum Tax (AMT)
    amti?: number;
    exemption?: number;
    exemptionPhaseout?: number;
    reducedExemption?: number;
    amtTaxableIncome?: number;
    tentativeMinimumTax?: number;
    regularTax?: number;
    amt?: number;
  };
  // Form 8829 - Expenses for Business Use of Your Home
  form8829Data?: {
    // Part I - Part of Your Home Used for Business
    totalHomeArea?: number; // Total area in sq ft
    businessArea?: number; // Business area in sq ft
    businessPercent?: number; // Business use percentage
    // Part II - Figure Your Allowable Deduction
    // Direct expenses (100% deductible)
    directExpenses?: {
      repairs?: number;
      painting?: number;
      other?: number;
      total?: number;
    };
    // Indirect expenses (business % deductible)
    indirectExpenses?: {
      mortgageInterest?: number;
      realEstateTaxes?: number;
      insurance?: number;
      utilities?: number;
      repairs?: number;
      other?: number;
      total?: number;
    };
    // Depreciation
    homeValue?: number;
    landValue?: number;
    buildingValue?: number;
    depreciationRate?: number; // Usually 2.564% for residential
    depreciationAmount?: number;
    // Calculations
    grossIncomeFromBusiness?: number;
    tentativeProfit?: number;
    allowableExpenses?: number;
    carryoverFromPriorYear?: number;
    totalDeduction?: number;
    carryoverToNextYear?: number;
  };
  // Schedule K-1 Summary (for display purposes - aggregates from Schedule E)
  scheduleK1Data?: {
    // Partnership K-1s (Form 1065)
    partnershipK1s?: Array<{
      entityName: string;
      entityEIN?: string;
      partnershipAddress?: string;
      partnerType: 'general' | 'limited' | 'llcMember';
      profitSharePercent?: number;
      lossSharePercent?: number;
      capitalSharePercent?: number;
      // Part III - Partner's Share of Current Year Income
      ordinaryBusinessIncome?: number; // Box 1
      netRentalRealEstateIncome?: number; // Box 2
      otherNetRentalIncome?: number; // Box 3
      guaranteedPayments?: number; // Box 4
      interestIncome?: number; // Box 5
      ordinaryDividends?: number; // Box 6a
      qualifiedDividends?: number; // Box 6b
      royalties?: number; // Box 7
      netShortTermCapitalGain?: number; // Box 8
      netLongTermCapitalGain?: number; // Box 9a
      unrecapturedSection1250Gain?: number; // Box 9b
      netSection1231Gain?: number; // Box 10
      otherIncome?: number; // Box 11
      // Deductions
      section179Deduction?: number; // Box 12
      otherDeductions?: number; // Box 13
      // Self-Employment
      selfEmploymentEarnings?: number; // Box 14
      // Credits
      lowIncomeHousingCredit?: number; // Box 15
      otherCredits?: number;
      // Foreign transactions
      foreignTaxesPaid?: number; // Box 16
      foreignSourceIncome?: number;
      // AMT items
      amtItems?: number;
      // Distributions
      distributions?: number; // Box 19
    }>;
    // S Corporation K-1s (Form 1120-S)
    sCorpK1s?: Array<{
      entityName: string;
      entityEIN?: string;
      corporationAddress?: string;
      shareholderPercent?: number;
      // Part III - Shareholder's Share
      ordinaryBusinessIncome?: number; // Box 1
      netRentalRealEstateIncome?: number; // Box 2
      otherNetRentalIncome?: number; // Box 3
      interestIncome?: number; // Box 4
      ordinaryDividends?: number; // Box 5a
      qualifiedDividends?: number; // Box 5b
      royalties?: number; // Box 6
      netShortTermCapitalGain?: number; // Box 7
      netLongTermCapitalGain?: number; // Box 8a
      unrecapturedSection1250Gain?: number; // Box 8b
      netSection1231Gain?: number; // Box 9
      otherIncome?: number; // Box 10
      // Deductions
      section179Deduction?: number; // Box 11
      otherDeductions?: number; // Box 12
      // Credits
      credits?: number; // Box 13
      // Foreign transactions
      foreignTaxesPaid?: number; // Box 14
      // Distributions
      distributions?: number; // Box 16
      // Basis information
      stockBasis?: number;
      debtBasis?: number;
    }>;
    // Estate/Trust K-1s (Form 1041)
    estateK1s?: Array<{
      estateName: string;
      estateEIN?: string;
      fiduciaryName?: string;
      fiduciaryAddress?: string;
      beneficiaryType: 'simple' | 'complex';
      // Part III - Beneficiary's Share
      interestIncome?: number; // Box 1
      ordinaryDividends?: number; // Box 2a
      qualifiedDividends?: number; // Box 2b
      netShortTermCapitalGain?: number; // Box 3
      netLongTermCapitalGain?: number; // Box 4a
      unrecapturedSection1250Gain?: number; // Box 4b
      otherPortfolioIncome?: number; // Box 5
      ordinaryBusinessIncome?: number; // Box 6
      netRentalRealEstateIncome?: number; // Box 7
      otherRentalIncome?: number; // Box 8
      directlyApportionedDeductions?: number; // Box 9
      estateTaxDeduction?: number; // Box 10
      finalYearDeductions?: number; // Box 11
      amtAdjustments?: number; // Box 12
      credits?: number; // Box 13
      foreignTaxesPaid?: number; // Box 14
    }>;
    // Summary totals
    totalOrdinaryIncome?: number;
    totalRentalIncome?: number;
    totalCapitalGains?: number;
    totalDistributions?: number;
  };
  // Form 8959 - Additional Medicare Tax
  form8959Data?: {
    // Part I - Additional Medicare Tax on Medicare Wages
    medicareWages?: number; // From W-2 Box 5
    unreportedTips?: number;
    wagesNotSubjectToWithholding?: number;
    totalMedicareWages?: number;
    threshold?: number; // $200k single, $250k MFJ, $125k MFS
    excessOverThreshold?: number;
    additionalMedicareOnWages?: number; // 0.9% of excess
    // Part II - Additional Medicare Tax on Self-Employment Income
    selfEmploymentIncome?: number; // From Schedule SE
    totalWagesAndSE?: number;
    excessWagesAndSE?: number;
    additionalMedicareOnSE?: number;
    // Part III - Additional Medicare Tax on Railroad Retirement
    rrta?: number;
    totalWithRRTA?: number;
    additionalMedicareOnRRTA?: number;
    // Part IV - Total Additional Medicare Tax
    totalAdditionalMedicareTax?: number;
    // Part V - Withholding Reconciliation
    medicareWithheld?: number; // From W-2 Box 6
    regularMedicareOnWages?: number; // 1.45% of wages
    additionalMedicareWithheld?: number;
  };
  // Form 8960 - Net Investment Income Tax
  form8960Data?: {
    // Part I - Investment Income
    taxableInterest?: number; // Line 1
    ordinaryDividends?: number; // Line 2
    annuities?: number; // Line 3
    rentalRoyaltyPartnershipSCorpTrust?: number; // Line 4a
    adjustmentFromRentalActivity?: number; // Line 4b
    netRentalIncome?: number; // Line 4c
    netGainFromDisposition?: number; // Line 5a
    netGainIncludedInAGI?: number; // Line 5b
    adjustmentsToNetGain?: number; // Line 5c
    netGainForNIIT?: number; // Line 5d
    otherInvestmentIncome?: number; // Line 6
    // Modifications
    modificationsToInvestmentIncome?: number; // Line 7
    totalInvestmentIncome?: number; // Line 8
    // Part II - Investment Expenses
    investmentInterestExpense?: number; // Line 9a
    stateAndLocalTaxes?: number; // Line 9b
    miscInvestmentExpenses?: number; // Line 9c
    totalDeductions?: number; // Line 9d
    // Part III - Tax Computation
    netInvestmentIncome?: number; // Line 12 (Line 8 - Line 9d)
    modifiedAGI?: number; // Line 13
    threshold?: number; // Line 14: $200k single, $250k MFJ, $125k MFS
    excessAGIOverThreshold?: number; // Line 15
    smallerOfNIIOrExcess?: number; // Line 16
    niitTax?: number; // Line 17: 3.8% of Line 16
  };
  // Form 8812 - Additional Child Tax Credit
  form8812Data?: {
    // Part I - Child Tax Credit and Credit for Other Dependents
    qualifyingChildren?: number; // Number under age 17
    otherDependents?: number; // Number of other dependents
    childTaxCreditPerChild?: number; // $2,000 per child for 2025
    otherDependentCreditEach?: number; // $500 per other dependent
    totalChildTaxCredit?: number;
    totalOtherDependentCredit?: number;
    combinedCredit?: number;
    // Part II-A - Additional Child Tax Credit (Refundable)
    earnedIncome?: number;
    earnedIncomeThreshold?: number; // $2,500
    earnedIncomeOverThreshold?: number;
    multipliedAmount?: number; // 15% of excess
    // Credit limitation
    taxLiability?: number;
    nonrefundableCTC?: number; // Limited to tax liability
    additionalChildTaxCredit?: number; // Refundable portion
    // Part II-B - Certain Filers with Three or More Children
    socialSecurityTaxes?: number;
    earnedIncomeCredit?: number;
    excessSSOverEIC?: number;
    largerRefundableAmount?: number;
  };
  // Form 8995 / 8995-A - Qualified Business Income Deduction
  form8995Data?: {
    // Simplified (8995) vs Full (8995-A)
    useSimplifiedForm?: boolean; // True for taxable income <= threshold
    // QBI from each business
    qbiBusinesses?: Array<{
      businessName: string;
      ein?: string;
      businessType: 'sole_prop' | 'partnership' | 'sCorp' | 'REIT' | 'PTP';
      qualifiedBusinessIncome?: number;
      w2Wages?: number;
      ubia?: number; // Unadjusted basis of qualified property
      sstb?: boolean; // Specified Service Trade or Business
      // Calculated
      qbiComponent?: number;
      wageComponent?: number; // 50% of W-2 wages
      wagePropertyComponent?: number; // 25% W-2 + 2.5% UBIA
      allowedQBIDeduction?: number;
    }>;
    // Totals
    totalQBI?: number;
    combinedQBIDeduction?: number;
    // Income limits
    taxableIncomeBeforeQBI?: number;
    threshold?: number; // $191,950 single, $383,900 MFJ for 2025
    phaseInRange?: number; // $50,000 single, $100,000 MFJ
    // Final calculation
    netCapitalGain?: number;
    qbiDeductionBeforeLimit?: number; // 20% of QBI
    taxableIncomeLimit?: number; // 20% of (taxable income - net cap gain)
    qbiDeduction?: number; // Lesser of above two
    // REIT/PTP
    reitDividends?: number;
    ptpIncome?: number;
    reitPtpDeduction?: number; // 20% of REIT dividends + PTP income
    totalQBIDeduction?: number;
  };
  // Form 4562 - Depreciation and Amortization
  form4562Data?: {
    // Part I - Election to Expense (Section 179)
    section179Assets?: Array<{
      description: string;
      cost: number;
      electedCost: number;
      dateAcquired?: string;
    }>;
    totalSection179Elected?: number;
    section179Limit?: number; // $1,220,000 for 2025
    thresholdReduction?: number; // Reduction starts at $3,050,000
    section179Deduction?: number;
    carryoverFromPriorYear?: number;
    businessIncomeLimit?: number;
    section179CarryoverToNextYear?: number;
    // Part II - Special Depreciation Allowance (Bonus)
    bonusDepreciationAssets?: Array<{
      description: string;
      cost: number;
      bonusPercent: number; // 60% for 2025 (phasing out)
      bonusAmount: number;
    }>;
    totalBonusDepreciation?: number;
    // Part III - MACRS Depreciation
    macrsAssets?: Array<{
      description: string;
      dateAcquired?: string;
      cost: number;
      priorDepreciation?: number;
      recoveryPeriod: '3yr' | '5yr' | '7yr' | '10yr' | '15yr' | '20yr' | '27.5yr' | '39yr';
      convention: 'HY' | 'MQ' | 'MM'; // Half-Year, Mid-Quarter, Mid-Month
      method: 'GDS' | 'ADS';
      currentYearDepreciation: number;
    }>;
    totalMACRSDepreciation?: number;
    // Part IV - Summary
    listedPropertyDepreciation?: number; // Part V
    amortizationDepreciation?: number; // Part VI
    totalDepreciation?: number;
  };
  // Schedule H - Household Employment Taxes
  scheduleHData?: {
    // Employer Information
    employerName?: string;
    employerEIN?: string;
    // Part I - Social Security, Medicare, and Federal Income Tax
    totalCashWagesPaid?: number;
    socialSecurityWagesThreshold?: number; // $2,700 for 2025
    subjectToSocialSecurity?: boolean;
    socialSecurityTax?: number; // 12.4% (6.2% employee + 6.2% employer)
    medicareTax?: number; // 2.9% (1.45% + 1.45%)
    additionalMedicareTax?: number; // 0.9% on wages over $200k
    federalIncomeWithheld?: number;
    totalSocialSecurityMedicare?: number;
    // Part II - Federal Unemployment Tax (FUTA)
    futaWagesThreshold?: number; // $1,000 in any quarter
    subjectToFUTA?: boolean;
    totalFUTAWages?: number;
    futaTaxRate?: number; // 6.0% (before state credit)
    stateUnemploymentCredit?: number; // Up to 5.4%
    netFUTATax?: number; // Usually 0.6%
    // Part III - Total Household Employment Taxes
    totalTaxes?: number;
    advanceEIC?: number; // Rarely used now
    netTaxesDue?: number;
    // Employees
    employees?: Array<{
      name: string;
      ssn?: string;
      wagesPaid: number;
      socialSecurityWithheld?: number;
      medicareWithheld?: number;
      federalWithheld?: number;
    }>;
  };
  // Form 8606 - Nondeductible IRAs
  form8606Data?: {
    // Part I - Nondeductible Contributions to Traditional IRAs
    nondeductibleContributions?: number; // Current year
    basisFromPriorYears?: number; // Line 2
    totalBasis?: number; // Line 3
    // Distributions
    traditionalIRADistributions?: number; // Line 7
    yearEndValue?: number; // Line 6 - Dec 31 value
    outstandingRollovers?: number;
    totalValue?: number; // Line 8
    basisRatio?: number; // Line 10
    nontaxableAmount?: number; // Line 13
    taxableAmount?: number; // Line 15
    // Part II - Conversions to Roth IRA
    conversionAmount?: number; // Line 16
    conversionBasis?: number;
    taxableConversion?: number; // Line 18
    // Part III - Distributions from Roth IRAs
    rothDistributions?: number;
    rothContributionBasis?: number;
    rothConversionBasis?: number;
    qualifiedDistribution?: boolean; // 5-year rule met
    taxableRothDistribution?: number;
  };
  // Form 8889 - Health Savings Accounts (HSAs)
  form8889Data?: {
    // Part I - HSA Contributions and Deduction
    coverageType?: 'self' | 'family';
    contributionLimit?: number; // $4,300 self, $8,550 family for 2025
    catchUpContribution?: number; // $1,000 if 55+
    totalLimit?: number;
    employerContributions?: number; // From W-2 Box 12 Code W
    personalContributions?: number;
    qualifiedFundingDistribution?: number; // From IRA
    totalContributions?: number;
    excessContributions?: number;
    hsaDeduction?: number; // Line 13
    // Part II - HSA Distributions
    totalDistributions?: number; // From 1099-SA
    qualifiedMedicalExpenses?: number;
    rolloverAmount?: number;
    qualifiedDistributions?: number;
    taxableDistributions?: number;
    additionalTax?: number; // 20% penalty if not qualified
    // Part III - Income and Additional Tax for Failure to Maintain HDHP Coverage
    lastMonthRule?: boolean;
    testingPeriodFailure?: boolean;
    includibleIncome?: number;
    additionalTaxForFailure?: number;
  };
  // Form 2106 - Employee Business Expenses
  form2106Data?: {
    // Part I - Employee Business Expenses
    vehicleExpenses?: number;
    parkingTolls?: number;
    travelExpenses?: number; // Away from home
    mealsExpenses?: number; // Subject to 50% limit
    otherExpenses?: number;
    totalExpenses?: number;
    // Reimbursements
    reimbursementsAccountable?: number;
    reimbursementsNonAccountable?: number;
    unreimbursedExpenses?: number;
    // Vehicle Information
    vehicleInfo?: {
      dateAvailable?: string;
      totalMiles?: number;
      businessMiles?: number;
      commutingMiles?: number;
      personalMiles?: number;
      availableForPersonal?: boolean;
      anotherVehicle?: boolean;
      evidenceWritten?: boolean;
    };
    // Part II - Vehicle Expenses (Standard Mileage or Actual)
    useStandardMileage?: boolean;
    standardMileageRate?: number; // $0.70 for 2025
    standardMileageDeduction?: number;
    actualExpenses?: {
      gasoline?: number;
      oilLubeRepairs?: number;
      insurance?: number;
      vehicleRentals?: number;
      depreciation?: number;
      garageRent?: number;
      other?: number;
      total?: number;
      businessPercent?: number;
      businessPortion?: number;
    };
    // Note: Most employees cannot deduct since 2018 TCJA
    performingArtist?: boolean;
    qualifiedPerformingArtist?: boolean;
    reservist?: boolean;
    feeBasedOfficial?: boolean;
    disabledEmployee?: boolean;
  };
  // Form 3903 - Moving Expenses (Military Only)
  form3903Data?: {
    // Moving Expenses (Only for Armed Forces)
    militaryMove?: boolean;
    permanentChangeOfStation?: boolean;
    // Transportation and Storage
    transportationExpenses?: number; // Household goods
    travelExpenses?: number; // Personal travel
    lodgingExpenses?: number; // During move
    storageExpenses?: number; // Temporary storage
    totalMovingExpenses?: number;
    // Reimbursements
    reimbursementsReceived?: number;
    taxableReimbursements?: number; // Included in income
    netDeduction?: number;
    // Move Details
    oldHome?: {
      address?: string;
      city?: string;
      state?: string;
    };
    newHome?: {
      address?: string;
      city?: string;
      state?: string;
    };
    distanceMoved?: number;
    dateOfMove?: string;
  };
}

// Capital asset transaction for Form 8949
interface CapitalTransaction {
  description: string; // (a) Description of property
  dateAcquired?: string; // (b) Date acquired (MM/DD/YYYY)
  dateSold?: string; // (c) Date sold or disposed (MM/DD/YYYY)
  proceeds: number; // (d) Proceeds (sales price)
  costBasis: number; // (e) Cost or other basis
  adjustmentCode?: string; // (f) Code(s) from instructions
  adjustmentAmount?: number; // (g) Amount of adjustment
  gainOrLoss: number; // (h) Gain or (loss)
  basisReportedToIRS?: boolean; // Was basis reported to IRS (Box A/D vs B/E/C/F)
}

interface TaxFormGeneratorProps {
  formData: FormData;
  t: (key: string) => string;
}

export const TaxFormGenerator: React.FC<TaxFormGeneratorProps> = ({ formData, t }) => {
  const [selectedForms, setSelectedForms] = useState<string[]>(['1040']);
  const [previewForm, setPreviewForm] = useState<string | null>(null);

  const availableForms = [
    {
      id: '1040',
      name: 'Form 1040',
      description: 'U.S. Individual Income Tax Return',
      required: true,
    },
    {
      id: 'schedule-a',
      name: 'Schedule A',
      description: 'Itemized Deductions',
      condition: !formData.deductions?.useStandardDeduction,
    },
    {
      id: 'schedule-b',
      name: 'Schedule B',
      description: 'Interest and Ordinary Dividends',
      condition:
        parseFloat(formData.incomeData?.interestIncome || '0') > 1500 ||
        parseFloat(formData.incomeData?.dividends || '0') > 1500,
    },
    {
      id: 'schedule-c',
      name: 'Schedule C',
      description: 'Profit or Loss From Business',
      condition: parseFloat(formData.incomeData?.businessIncome || '0') > 0,
    },
    {
      id: 'schedule-d',
      name: 'Schedule D',
      description: 'Capital Gains and Losses',
      condition: parseFloat(formData.incomeData?.capitalGains || '0') !== 0,
    },
    {
      id: '8949',
      name: 'Form 8949',
      description: 'Sales and Other Dispositions of Capital Assets',
      condition: parseFloat(formData.incomeData?.capitalGains || '0') !== 0,
    },
    {
      id: 'schedule-se',
      name: 'Schedule SE',
      description: 'Self-Employment Tax',
      condition:
        parseFloat(formData.incomeData?.businessIncome || '0') > 0 ||
        (formData.selfEmploymentData?.netProfit ?? 0) > 0,
    },
    {
      id: 'schedule-1',
      name: 'Schedule 1',
      description: 'Additional Income and Adjustments to Income',
      condition:
        (formData.adjustmentsData?.totalAdjustments ?? 0) > 0 ||
        parseFloat(formData.incomeData?.otherIncome || '0') > 0,
    },
    {
      id: 'schedule-2',
      name: 'Schedule 2',
      description: 'Additional Taxes',
      condition:
        (formData.additionalTaxesData?.totalAdditionalTaxes ?? 0) > 0 ||
        (formData.selfEmploymentData?.totalSETax ?? 0) > 0 ||
        (formData.additionalTaxesData?.amt ?? 0) > 0 ||
        (formData.additionalTaxesData?.niit ?? 0) > 0,
    },
    {
      id: 'schedule-3',
      name: 'Schedule 3',
      description: 'Additional Credits and Payments',
      condition:
        (formData.additionalCreditsData?.totalNonrefundableCredits ?? 0) > 0 ||
        (formData.additionalCreditsData?.totalRefundableCredits ?? 0) > 0 ||
        (formData.taxResult?.credits &&
          Object.values(formData.taxResult.credits).some((v) => (v ?? 0) > 0)),
    },
    {
      id: 'schedule-e',
      name: 'Schedule E',
      description:
        'Supplemental Income and Loss (Rental, Royalty, Partnership, S Corp, Estate, Trust)',
      condition:
        (formData.scheduleEData?.totalScheduleEIncome ?? 0) !== 0 ||
        (formData.scheduleEData?.rentalProperties?.length ?? 0) > 0 ||
        (formData.scheduleEData?.partnershipK1s?.length ?? 0) > 0 ||
        parseFloat(formData.incomeData?.rentalIncome || '0') !== 0,
    },
    {
      id: 'form-2441',
      name: 'Form 2441',
      description: 'Child and Dependent Care Expenses',
      condition:
        (formData.form2441Data?.totalExpensesPaid ?? 0) > 0 ||
        (formData.form2441Data?.qualifyingPersons?.length ?? 0) > 0,
    },
    {
      id: 'form-8863',
      name: 'Form 8863',
      description: 'Education Credits (AOTC and LLC)',
      condition:
        (formData.form8863Data?.totalAOTC ?? 0) > 0 ||
        (formData.form8863Data?.totalLLC ?? 0) > 0 ||
        (formData.form8863Data?.students?.length ?? 0) > 0 ||
        (formData.taxResult?.credits?.aotc ?? 0) > 0 ||
        (formData.taxResult?.credits?.llc ?? 0) > 0,
    },
    {
      id: 'form-8880',
      name: 'Form 8880',
      description: "Credit for Qualified Retirement Savings Contributions (Saver's Credit)",
      condition:
        (formData.form8880Data?.totalCredit ?? 0) > 0 ||
        (formData.form8880Data?.taxpayerContributions?.totalContributions ?? 0) > 0,
    },
    {
      id: 'form-5695',
      name: 'Form 5695',
      description: 'Residential Energy Credits',
      condition:
        (formData.form5695Data?.totalResidentialCredit ?? 0) > 0 ||
        (formData.form5695Data?.totalCleanEnergy ?? 0) > 0 ||
        (formData.form5695Data?.totalHomeImprovement ?? 0) > 0,
    },
    {
      id: 'form-8962',
      name: 'Form 8962',
      description: 'Premium Tax Credit (PTC)',
      condition:
        (formData.form8962Data?.annualPTCAllowed ?? 0) > 0 ||
        (formData.form8962Data?.advancePayments ?? 0) > 0 ||
        (formData.taxResult?.credits?.ptc ?? 0) > 0,
    },
    {
      id: 'form-1116',
      name: 'Form 1116',
      description: 'Foreign Tax Credit',
      condition:
        (formData.form1116Data?.allowedCredit ?? 0) > 0 ||
        (formData.form1116Data?.foreignTaxesPaid ?? 0) > 0 ||
        (formData.taxResult?.credits?.ftc ?? 0) > 0,
    },
    {
      id: 'form-6251',
      name: 'Form 6251',
      description: 'Alternative Minimum Tax - Individuals',
      condition:
        (formData.form6251Data?.amt ?? 0) > 0 || (formData.additionalTaxesData?.amt ?? 0) > 0,
    },
    {
      id: 'form-8829',
      name: 'Form 8829',
      description: 'Expenses for Business Use of Your Home',
      condition:
        (formData.form8829Data?.totalDeduction ?? 0) > 0 ||
        (formData.form8829Data?.businessPercent ?? 0) > 0,
    },
    {
      id: 'schedule-k1',
      name: 'Schedule K-1',
      description: 'Partner/Shareholder/Beneficiary Share of Income',
      condition:
        (formData.scheduleK1Data?.partnershipK1s?.length ?? 0) > 0 ||
        (formData.scheduleK1Data?.sCorpK1s?.length ?? 0) > 0 ||
        (formData.scheduleK1Data?.estateK1s?.length ?? 0) > 0 ||
        (formData.scheduleEData?.partnershipK1s?.length ?? 0) > 0,
    },
    {
      id: 'form-8959',
      name: 'Form 8959',
      description: 'Additional Medicare Tax',
      condition:
        (formData.form8959Data?.totalAdditionalMedicareTax ?? 0) > 0 ||
        (formData.additionalTaxesData?.additionalMedicareTax ?? 0) > 0 ||
        parseFloat(formData.incomeData?.wages || '0') > 200000,
    },
    {
      id: 'form-8960',
      name: 'Form 8960',
      description: 'Net Investment Income Tax',
      condition:
        (formData.form8960Data?.niitTax ?? 0) > 0 ||
        (formData.additionalTaxesData?.niit ?? 0) > 0 ||
        (formData.taxResult.adjustedGrossIncome > 200000 &&
          (parseFloat(formData.incomeData?.interestIncome || '0') > 0 ||
            parseFloat(formData.incomeData?.dividends || '0') > 0 ||
            parseFloat(formData.incomeData?.capitalGains || '0') > 0)),
    },
    {
      id: 'form-8812',
      name: 'Form 8812',
      description: 'Additional Child Tax Credit',
      condition:
        (formData.form8812Data?.additionalChildTaxCredit ?? 0) > 0 ||
        (formData.additionalCreditsData?.additionalChildTaxCredit ?? 0) > 0 ||
        (formData.personalInfo.dependents ?? 0) > 0,
    },
    {
      id: 'form-8995',
      name: 'Form 8995/8995-A',
      description: 'Qualified Business Income Deduction',
      condition:
        (formData.form8995Data?.totalQBIDeduction ?? 0) > 0 ||
        (formData.form8995Data?.qbiBusinesses?.length ?? 0) > 0 ||
        parseFloat(formData.incomeData?.businessIncome || '0') > 0,
    },
    {
      id: 'form-4562',
      name: 'Form 4562',
      description: 'Depreciation and Amortization',
      condition:
        (formData.form4562Data?.totalDepreciation ?? 0) > 0 ||
        (formData.form4562Data?.section179Deduction ?? 0) > 0 ||
        (formData.businessData?.expenses?.depreciation ?? 0) > 0,
    },
    {
      id: 'schedule-h',
      name: 'Schedule H',
      description: 'Household Employment Taxes',
      condition:
        (formData.scheduleHData?.totalTaxes ?? 0) > 0 ||
        (formData.scheduleHData?.totalCashWagesPaid ?? 0) > 0 ||
        (formData.additionalTaxesData?.householdEmploymentTax ?? 0) > 0,
    },
    {
      id: 'form-8606',
      name: 'Form 8606',
      description: 'Nondeductible IRAs',
      condition:
        (formData.form8606Data?.nondeductibleContributions ?? 0) > 0 ||
        (formData.form8606Data?.conversionAmount ?? 0) > 0 ||
        (formData.form8606Data?.rothDistributions ?? 0) > 0,
    },
    {
      id: 'form-8889',
      name: 'Form 8889',
      description: 'Health Savings Accounts (HSAs)',
      condition:
        (formData.form8889Data?.hsaDeduction ?? 0) > 0 ||
        (formData.form8889Data?.totalContributions ?? 0) > 0 ||
        (formData.form8889Data?.totalDistributions ?? 0) > 0,
    },
    {
      id: 'form-2106',
      name: 'Form 2106',
      description: 'Employee Business Expenses',
      condition:
        (formData.form2106Data?.unreimbursedExpenses ?? 0) > 0 ||
        formData.form2106Data?.performingArtist === true ||
        formData.form2106Data?.reservist === true,
    },
    {
      id: 'form-3903',
      name: 'Form 3903',
      description: 'Moving Expenses (Military)',
      condition:
        (formData.form3903Data?.totalMovingExpenses ?? 0) > 0 ||
        formData.form3903Data?.militaryMove === true,
    },
  ];

  const generateForm1040 = () => {
    const { personalInfo, incomeData, deductions, taxResult, spouseInfo } = formData;

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Form 1040</h1>
          <p>U.S. Individual Income Tax Return</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="taxpayer-info">
          <h2>Filing Information</h2>
          <div class="info-grid">
            <div>First Name: ${personalInfo.firstName}</div>
            <div>Last Name: ${personalInfo.lastName}</div>
            <div>SSN: ${personalInfo.ssn}</div>
            <div>Filing Status: ${personalInfo.filingStatus}</div>
            ${
              spouseInfo
                ? `
              <div>Spouse First Name: ${spouseInfo.firstName}</div>
              <div>Spouse Last Name: ${spouseInfo.lastName}</div>
              <div>Spouse SSN: ${spouseInfo.ssn}</div>
            `
                : ''
            }
            <div>Address: ${personalInfo.address}</div>
            <div>Dependents: ${personalInfo.dependents}</div>
          </div>
        </div>

        <div class="income-section">
          <h2>Income</h2>
          <div class="line-items">
            <div class="line">1. Wages, salaries, tips: $${parseFloat(incomeData.wages || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">2a. Tax-exempt interest: $${parseFloat(incomeData.interestIncome || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">3a. Qualified dividends: $${parseFloat(incomeData.dividends || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">4. IRA distributions: $0.00</div>
            <div class="line">5. Pensions and annuities: $0.00</div>
            <div class="line">6. Social security benefits: $0.00</div>
            <div class="line">7. Capital gain or (loss): $${parseFloat(incomeData.capitalGains || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">8. Other income: $${parseFloat(incomeData.otherIncome || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line total">9. Total income: $${taxResult.adjustedGrossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="deductions-section">
          <h2>Deductions</h2>
          <div class="line-items">
            <div class="line">10a. Adjustments to income: $0.00</div>
            <div class="line">11. Adjusted gross income: $${taxResult.adjustedGrossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">12. ${deductions.useStandardDeduction ? 'Standard' : 'Itemized'} deduction: $${(deductions.useStandardDeduction ? (deductions.standardDeduction ?? 0) : (deductions.itemizedTotal ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">13. Qualified business income deduction: $0.00</div>
            <div class="line total">14. Taxable income: $${taxResult.taxableIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="tax-section">
          <h2>Tax and Credits</h2>
          <div class="line-items">
            <div class="line">15. Tax: $${taxResult.federalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">16. Amount from Schedule 2: $0.00</div>
            <div class="line">17. Amount from Schedule 3: $0.00</div>
            <div class="line total">18. Total tax: $${taxResult.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="payments-section">
          <h2>Payments</h2>
          <div class="line-items">
            <div class="line">19. Federal income tax withheld: $${formData.paymentsData?.federalWithholding ? parseFloat(formData.paymentsData.federalWithholding).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
            <div class="line">20. Estimated tax payments: $${formData.paymentsData?.estimatedTaxPayments ? parseFloat(formData.paymentsData.estimatedTaxPayments).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
            <div class="line total">21. Total payments: $${taxResult.totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="refund-section">
          <h2>Refund or Amount Owed</h2>
          <div class="line-items">
            ${
              taxResult.balance > 0
                ? `<div class="line refund">23. Overpaid amount (refund): $${taxResult.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>`
                : taxResult.balance < 0
                  ? `<div class="line refund">22. Amount you owe: $${Math.abs(taxResult.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>`
                  : `<div class="line refund">Balance: $0.00 (No refund or amount owed)</div>`
            }
          </div>
        </div>

        <div class="signature-section">
          <h2>Sign Here</h2>
          <div class="signature-grid">
            <div>Your signature: ___________________________ Date: ___________</div>
            ${spouseInfo ? '<div>Spouse signature: ___________________________ Date: ___________</div>' : ''}
            <div>Preparer signature: ___________________________ Date: ___________</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleA = () => {
    const { deductions } = formData;

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule A (Form 1040)</h1>
          <p>Itemized Deductions</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="medical-section">
          <h2>Medical and Dental Expenses</h2>
          <div class="line-items">
            <div class="line">1. Medical and dental expenses: $${parseFloat(String(deductions.medicalExpenses ?? '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">2. AGI limitation (7.5%): $${(formData.taxResult.adjustedGrossIncome * 0.075).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">3. Deductible medical expenses: $${Math.max(0, parseFloat(String(deductions.medicalExpenses ?? '0')) - formData.taxResult.adjustedGrossIncome * 0.075).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="taxes-section">
          <h2>Taxes You Paid</h2>
          <div class="line-items">
            <div class="line">5. State and local taxes (SALT): $${Math.min(10000, parseFloat(String(deductions.stateLocalTaxes ?? '0'))).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="interest-section">
          <h2>Interest You Paid</h2>
          <div class="line-items">
            <div class="line">8. Home mortgage interest: $${parseFloat(String(deductions.mortgageInterest ?? '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="charity-section">
          <h2>Gifts to Charity</h2>
          <div class="line-items">
            <div class="line">11. Charitable contributions: $${parseFloat(String(deductions.charitableContributions ?? '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="total-section">
          <h2>Total Itemized Deductions</h2>
          <div class="line-items">
            <div class="line total">17. Total itemized deductions: $${(deductions.itemizedTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleB = () => {
    const { interestDividendData, incomeData } = formData;

    // Get interest sources or create default from incomeData
    const interestSources = interestDividendData?.interestSources ?? [];
    const totalInterest =
      interestDividendData?.totalInterest ?? parseFloat(incomeData?.interestIncome || '0');

    // Get dividend sources or create default from incomeData
    const dividendSources = interestDividendData?.dividendSources ?? [];
    const totalOrdinaryDividends =
      interestDividendData?.totalOrdinaryDividends ?? parseFloat(incomeData?.dividends || '0');
    const totalQualifiedDividends =
      interestDividendData?.totalQualifiedDividends ??
      parseFloat(incomeData?.qualifiedDividends || '0');

    // Foreign accounts
    const hasForeignAccounts = interestDividendData?.hasForeignAccounts ?? false;
    const foreignCountry = interestDividendData?.foreignAccountCountry ?? '';
    const hasForeignTrust = interestDividendData?.hasForeignTrust ?? false;

    // Helper for formatting
    const formatCurrency = (amount: number) =>
      amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Generate interest source rows
    const interestRows =
      interestSources.length > 0
        ? interestSources
            .map(
              (source, idx) => `
          <div class="line source-row">
            <span class="source-num">${idx + 1}.</span>
            <span class="source-name">${source.payerName}</span>
            <span class="source-amount">$${formatCurrency(source.amount)}</span>
          </div>
        `
            )
            .join('')
        : totalInterest > 0
          ? `<div class="line source-row"><span class="source-name">Various payers (see 1099-INT forms)</span><span class="source-amount">$${formatCurrency(totalInterest)}</span></div>`
          : '<div class="line note">No interest income to report</div>';

    // Generate dividend source rows
    const dividendRows =
      dividendSources.length > 0
        ? dividendSources
            .map(
              (source, idx) => `
          <div class="line source-row">
            <span class="source-num">${idx + 1}.</span>
            <span class="source-name">${source.payerName}</span>
            <span class="source-amount">$${formatCurrency(source.ordinaryDividends)}</span>
          </div>
        `
            )
            .join('')
        : totalOrdinaryDividends > 0
          ? `<div class="line source-row"><span class="source-name">Various payers (see 1099-DIV forms)</span><span class="source-amount">$${formatCurrency(totalOrdinaryDividends)}</span></div>`
          : '<div class="line note">No dividend income to report</div>';

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule B (Form 1040)</h1>
          <p>Interest and Ordinary Dividends</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="instructions-note">
          <p><strong>Note:</strong> Schedule B is required if:</p>
          <ul>
            <li>You had over $1,500 of taxable interest or ordinary dividends</li>
            <li>You had a foreign account or received a distribution from a foreign trust</li>
          </ul>
        </div>

        <div class="part-1">
          <h2>Part I - Interest</h2>
          <p class="line-instruction">List name of payer. If any interest is from a seller-financed mortgage and the buyer used the property as a personal residence, see instructions.</p>

          <div class="source-table">
            <div class="table-header">
              <span class="source-num">#</span>
              <span class="source-name">Name of Payer</span>
              <span class="source-amount">Amount</span>
            </div>
            ${interestRows}
          </div>

          <div class="line-items">
            <div class="line">2. Add the amounts on line 1: $${formatCurrency(totalInterest)}</div>
            <div class="line">3. Excludable interest on series EE and I U.S. savings bonds issued after 1989: $0.00</div>
            <div class="line total">4. Subtract line 3 from line 2. Enter here and on Form 1040, line 2b: $${formatCurrency(totalInterest)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Ordinary Dividends</h2>
          <p class="line-instruction">List name of payer.</p>

          <div class="source-table">
            <div class="table-header">
              <span class="source-num">#</span>
              <span class="source-name">Name of Payer</span>
              <span class="source-amount">Amount</span>
            </div>
            ${dividendRows}
          </div>

          <div class="line-items">
            <div class="line total">6. Add the amounts on line 5. Enter here and on Form 1040, line 3b: $${formatCurrency(totalOrdinaryDividends)}</div>
            ${
              totalQualifiedDividends > 0
                ? `
              <div class="line sub-note">Qualified dividends included above (Form 1040, line 3a): $${formatCurrency(totalQualifiedDividends)}</div>
            `
                : ''
            }
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Foreign Accounts and Trusts</h2>
          <div class="line-items">
            <div class="line">7a. At any time during ${new Date().getFullYear()}, did you have a financial interest in or signature authority over a financial account (such as a bank account, securities account, or brokerage account) located in a foreign country?</div>
            <div class="line checkbox-line">
              <span>[${hasForeignAccounts ? 'X' : ' '}] Yes</span>
              <span>[${!hasForeignAccounts ? 'X' : ' '}] No</span>
            </div>
            ${
              hasForeignAccounts
                ? `
              <div class="line sub-note">7b. If "Yes," are you required to file FinCEN Form 114, Report of Foreign Bank and Financial Accounts (FBAR)?</div>
              <div class="line sub-note">Country(ies): ${foreignCountry || '_______________'}</div>
            `
                : ''
            }

            <div class="line">8. During ${new Date().getFullYear()}, did you receive a distribution from, or were you the grantor of, or transferor to, a foreign trust?</div>
            <div class="line checkbox-line">
              <span>[${hasForeignTrust ? 'X' : ' '}] Yes</span>
              <span>[${!hasForeignTrust ? 'X' : ' '}] No</span>
            </div>
            ${
              hasForeignTrust
                ? `
              <div class="line sub-note">If "Yes," you may have to file Form 3520. See instructions.</div>
            `
                : ''
            }
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Reference Information</h2>
          <div class="line-items">
            <div class="line">FBAR filing threshold: $10,000 aggregate in foreign accounts</div>
            <div class="line">FBAR filing deadline: April 15 (automatic extension to October 15)</div>
            <div class="line">Qualified dividends tax rate: 0%, 15%, or 20% (based on income)</div>
            <div class="line">Ordinary dividends: Taxed as ordinary income</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleC = () => {
    const { businessData, incomeData, selfEmploymentData } = formData;

    // Business information
    const businessName = businessData?.businessName ?? 'Sole Proprietorship';
    const businessAddress = businessData?.businessAddress ?? '';
    const ein = businessData?.ein ?? '';
    const accountingMethod = businessData?.accountingMethod ?? 'cash';
    const businessCode = businessData?.businessCode ?? '';

    // Income
    const grossReceipts =
      businessData?.grossReceipts ?? parseFloat(incomeData?.businessIncome || '0') * 100; // Convert to cents
    const returnsAllowances = businessData?.returnsAndAllowances ?? 0;
    const cogs = businessData?.costOfGoodsSold ?? 0;
    const grossProfit = businessData?.grossProfit ?? grossReceipts - returnsAllowances - cogs;
    const otherBusinessIncome = businessData?.otherIncome ?? 0;
    const grossIncome = grossProfit + otherBusinessIncome;

    // Expenses
    const expenses = businessData?.expenses ?? {};
    const advertising = expenses.advertising ?? 0;
    const carTruck = expenses.carAndTruck ?? 0;
    const commissions = expenses.commissions ?? 0;
    const contractLabor = expenses.contractLabor ?? 0;
    const depreciation = expenses.depreciation ?? 0;
    const employeeBenefits = expenses.employeeBenefits ?? 0;
    const insurance = expenses.insurance ?? 0;
    const interestMortgage = expenses.interestMortgage ?? 0;
    const interestOther = expenses.interestOther ?? 0;
    const legal = expenses.legal ?? 0;
    const officeExpense = expenses.officeExpense ?? 0;
    const pensionPlans = expenses.pensionPlans ?? 0;
    const rentVehicles = expenses.rentVehicles ?? 0;
    const rentOther = expenses.rentOther ?? 0;
    const repairs = expenses.repairs ?? 0;
    const supplies = expenses.supplies ?? 0;
    const taxes = expenses.taxes ?? 0;
    const travel = expenses.travel ?? 0;
    const mealsDeductible = expenses.mealsDeductible ?? 0;
    const utilities = expenses.utilities ?? 0;
    const wages = expenses.wages ?? 0;
    const otherExpenses = expenses.otherExpenses ?? 0;

    const totalExpenses =
      businessData?.totalExpenses ??
      advertising +
        carTruck +
        commissions +
        contractLabor +
        depreciation +
        employeeBenefits +
        insurance +
        interestMortgage +
        interestOther +
        legal +
        officeExpense +
        pensionPlans +
        rentVehicles +
        rentOther +
        repairs +
        supplies +
        taxes +
        travel +
        mealsDeductible +
        utilities +
        wages +
        otherExpenses;

    const netProfit =
      businessData?.netProfit ?? selfEmploymentData?.netProfit ?? grossIncome - totalExpenses;

    // Convert from cents to dollars
    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule C (Form 1040)</h1>
          <p>Profit or Loss From Business</p>
          <p>(Sole Proprietorship)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="business-info">
          <h2>Business Information</h2>
          <div class="info-grid">
            <div class="line">A. Principal business or profession: ${businessName}</div>
            <div class="line">B. Business code: ${businessCode || '______'}</div>
            <div class="line">C. Business name: ${businessName}</div>
            <div class="line">D. Employer ID number (EIN): ${ein || 'N/A'}</div>
            <div class="line">E. Business address: ${businessAddress || '_______________'}</div>
            <div class="line">F. Accounting method: [${accountingMethod === 'cash' ? 'X' : ' '}] Cash  [${accountingMethod === 'accrual' ? 'X' : ' '}] Accrual  [${accountingMethod === 'other' ? 'X' : ' '}] Other</div>
            <div class="line">G. Did you "materially participate" in the operation of this business? [X] Yes [ ] No</div>
            <div class="line">H. If you started or acquired this business during ${new Date().getFullYear()}, check here: [ ]</div>
          </div>
        </div>

        <div class="part-1">
          <h2>Part I - Income</h2>
          <div class="line-items">
            <div class="line">1. Gross receipts or sales: $${toDollars(grossReceipts)}</div>
            <div class="line">2. Returns and allowances: $${toDollars(returnsAllowances)}</div>
            <div class="line">3. Subtract line 2 from line 1: $${toDollars(grossReceipts - returnsAllowances)}</div>
            <div class="line">4. Cost of goods sold (from Part III, line 42): $${toDollars(cogs)}</div>
            <div class="line">5. Gross profit. Subtract line 4 from line 3: $${toDollars(grossProfit)}</div>
            <div class="line">6. Other income: $${toDollars(otherBusinessIncome)}</div>
            <div class="line total">7. Gross income. Add lines 5 and 6: $${toDollars(grossIncome)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Expenses</h2>
          <div class="line-items expense-grid">
            <div class="line">8. Advertising: $${toDollars(advertising)}</div>
            <div class="line">9. Car and truck expenses: $${toDollars(carTruck)}</div>
            <div class="line">10. Commissions and fees: $${toDollars(commissions)}</div>
            <div class="line">11. Contract labor: $${toDollars(contractLabor)}</div>
            <div class="line">12. Depletion: $0.00</div>
            <div class="line">13. Depreciation (Form 4562): $${toDollars(depreciation)}</div>
            <div class="line">14. Employee benefit programs: $${toDollars(employeeBenefits)}</div>
            <div class="line">15. Insurance (other than health): $${toDollars(insurance)}</div>
            <div class="line">16a. Interest - Mortgage: $${toDollars(interestMortgage)}</div>
            <div class="line">16b. Interest - Other: $${toDollars(interestOther)}</div>
            <div class="line">17. Legal and professional services: $${toDollars(legal)}</div>
            <div class="line">18. Office expense: $${toDollars(officeExpense)}</div>
            <div class="line">19. Pension and profit-sharing plans: $${toDollars(pensionPlans)}</div>
            <div class="line">20a. Rent - Vehicles, machinery, equipment: $${toDollars(rentVehicles)}</div>
            <div class="line">20b. Rent - Other business property: $${toDollars(rentOther)}</div>
            <div class="line">21. Repairs and maintenance: $${toDollars(repairs)}</div>
            <div class="line">22. Supplies: $${toDollars(supplies)}</div>
            <div class="line">23. Taxes and licenses: $${toDollars(taxes)}</div>
            <div class="line">24a. Travel: $${toDollars(travel)}</div>
            <div class="line">24b. Deductible meals (50%): $${toDollars(mealsDeductible)}</div>
            <div class="line">25. Utilities: $${toDollars(utilities)}</div>
            <div class="line">26. Wages (less employment credits): $${toDollars(wages)}</div>
            <div class="line">27a. Other expenses (from Part V): $${toDollars(otherExpenses)}</div>
            <div class="line total">28. Total expenses. Add lines 8 through 27a: $${toDollars(totalExpenses)}</div>
          </div>
        </div>

        <div class="part-net">
          <h2>Net Profit or Loss</h2>
          <div class="line-items">
            <div class="line total">29. Tentative profit or (loss). Subtract line 28 from line 7: $${toDollars(grossIncome - totalExpenses)}</div>
            <div class="line">30. Expenses for business use of home (Form 8829): $0.00</div>
            <div class="line total highlight">31. Net profit or (loss). Subtract line 30 from line 29: $${toDollars(netProfit)}</div>
            <div class="line note">   • If a profit, enter on both Form 1040, line 3 (or Schedule 1, line 3) and Schedule SE, line 2</div>
            <div class="line note">   • If a loss, you must go to line 32</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>Self-Employment Tax Reference</h2>
          <div class="line-items">
            <div class="line">Net profit subject to SE tax: $${toDollars(Math.max(0, netProfit))}</div>
            <div class="line">SE tax rate: 15.3% (12.4% Social Security + 2.9% Medicare)</div>
            <div class="line">Social Security wage base 2025: $176,100</div>
            <div class="line">SE tax deduction: 50% of SE tax is deductible (Schedule 1, line 15)</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleD = () => {
    const { capitalGainsDetails, incomeData } = formData;
    const shortTerm =
      capitalGainsDetails?.netShortTerm ?? parseFloat(incomeData?.netShortTermCapitalGain || '0');
    const longTerm =
      capitalGainsDetails?.netLongTerm ?? parseFloat(incomeData?.netLongTermCapitalGain || '0');
    const totalNet =
      capitalGainsDetails?.totalNetGain ?? parseFloat(incomeData?.capitalGains || '0');

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule D (Form 1040)</h1>
          <p>Capital Gains and Losses</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Short-Term Capital Gains and Losses (Assets Held One Year or Less)</h2>
          <div class="line-items">
            <div class="line">1a. Short-term totals from Form 8949, Box A: $${(capitalGainsDetails?.shortTermGain ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">1b. Short-term totals from Form 8949, Box B: $0.00</div>
            <div class="line">1c. Short-term totals from Form 8949, Box C: $0.00</div>
            <div class="line">4. Short-term gain from Form 6252: $0.00</div>
            <div class="line">5. Net short-term gain or (loss) from partnerships, S corps, estates: $0.00</div>
            <div class="line">6. Short-term capital loss carryover: $0.00</div>
            <div class="line total">7. Net short-term capital gain or (loss): $${shortTerm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Long-Term Capital Gains and Losses (Assets Held More Than One Year)</h2>
          <div class="line-items">
            <div class="line">8a. Long-term totals from Form 8949, Box D: $${(capitalGainsDetails?.longTermGain ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">8b. Long-term totals from Form 8949, Box E: $0.00</div>
            <div class="line">8c. Long-term totals from Form 8949, Box F: $0.00</div>
            <div class="line">9. Gain from Form 4797: $0.00</div>
            <div class="line">10. Net long-term gain or (loss) from partnerships, S corps, estates: $0.00</div>
            <div class="line">11. Capital gain distributions: $0.00</div>
            <div class="line">12. Long-term capital loss carryover: $0.00</div>
            <div class="line">13. Net gain or (loss) from Form 4684: $0.00</div>
            <div class="line total">14. Net long-term capital gain or (loss): $${longTerm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Summary</h2>
          <div class="line-items">
            <div class="line">15. Net short-term capital gain or (loss) (from line 7): $${shortTerm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">16. Net long-term capital gain or (loss) (from line 14): $${longTerm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line total">17. Total net gain or (loss): $${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            ${
              totalNet > 0
                ? `
              <div class="line">18. If line 17 is a gain, enter the gain on Form 1040, line 7</div>
              <div class="line sub-note">Amount taxed at 0%: $${(capitalGainsDetails?.taxAt0Percent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div class="line sub-note">Amount taxed at 15%: $${(capitalGainsDetails?.taxAt15Percent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div class="line sub-note">Amount taxed at 20%: $${(capitalGainsDetails?.taxAt20Percent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            `
                : `
              <div class="line">18. If line 17 is a loss, enter the smaller of (a) the loss or (b) $3,000 ($1,500 if MFS)</div>
              <div class="line">Deductible loss on Form 1040, line 7: $${Math.max(totalNet, -3000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            `
            }
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleSE = () => {
    const { selfEmploymentData, incomeData } = formData;
    const netProfit =
      selfEmploymentData?.netProfit ?? parseFloat(incomeData?.businessIncome || '0');
    const netEarnings = selfEmploymentData?.netEarningsFromSE ?? Math.round(netProfit * 0.9235);
    const ssTax =
      selfEmploymentData?.socialSecurityTax ??
      Math.round(Math.min(netEarnings, 176100 * 100) * 0.124);
    const medicareTax = selfEmploymentData?.medicareTax ?? Math.round(netEarnings * 0.029);
    const additionalMedicare = selfEmploymentData?.additionalMedicareTax ?? 0;
    const totalSE = selfEmploymentData?.totalSETax ?? ssTax + medicareTax + additionalMedicare;
    const deductibleHalf =
      selfEmploymentData?.deductibleHalf ?? Math.floor((ssTax + medicareTax) / 2);

    // Convert from cents to dollars for display
    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule SE (Form 1040)</h1>
          <p>Self-Employment Tax</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="section-a">
          <h2>Section A - Short Schedule SE</h2>
          <div class="line-items">
            <div class="line">1a. Net farm profit or (loss) from Schedule F: $0.00</div>
            <div class="line">1b. Reserved for future use: $0.00</div>
            <div class="line">2. Net profit or (loss) from Schedule C: $${toDollars(netProfit)}</div>
            <div class="line">3. Combine lines 1a, 1b, and 2: $${toDollars(netProfit)}</div>
            <div class="line">4. Multiply line 3 by 92.35% (0.9235): $${toDollars(netEarnings)}</div>
            <div class="line note">   (This is your net earnings from self-employment)</div>
          </div>
        </div>

        <div class="section-tax">
          <h2>Self-Employment Tax Calculation</h2>
          <div class="line-items">
            <div class="line">5. Social Security Tax (12.4% up to $176,100): $${toDollars(ssTax)}</div>
            <div class="line">6. Medicare Tax (2.9% of all net earnings): $${toDollars(medicareTax)}</div>
            ${
              additionalMedicare > 0
                ? `
              <div class="line">7. Additional Medicare Tax (0.9% over threshold): $${toDollars(additionalMedicare)}</div>
            `
                : ''
            }
            <div class="line total">8. Total self-employment tax: $${toDollars(totalSE)}</div>
            <div class="line note">   Enter this amount on Schedule 2, line 4</div>
          </div>
        </div>

        <div class="deduction-section">
          <h2>Deduction for Self-Employment Tax</h2>
          <div class="line-items">
            <div class="line">9. Deductible part of SE tax (1/2 of line 8, excluding Additional Medicare): $${toDollars(deductibleHalf)}</div>
            <div class="line note">   Enter this amount on Schedule 1, line 15</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Self-Employment Tax Rates</h2>
          <div class="line-items">
            <div class="line">Social Security wage base: $176,100</div>
            <div class="line">Social Security rate: 12.4%</div>
            <div class="line">Medicare rate: 2.9%</div>
            <div class="line">Additional Medicare (over threshold): 0.9%</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateSchedule1 = () => {
    const { adjustmentsData, incomeData } = formData;

    // Part I - Additional Income
    const otherIncome = parseFloat(incomeData?.otherIncome || '0');

    // Part II - Adjustments to Income
    const educatorExpenses = adjustmentsData?.educatorExpenses ?? 0;
    const hsaDeduction = adjustmentsData?.hsaDeduction ?? 0;
    const selfEmployedHealthIns = adjustmentsData?.selfEmployedHealthInsurance ?? 0;
    const selfEmployedRetirement = adjustmentsData?.selfEmployedRetirement ?? 0;
    const seTaxDeduction = adjustmentsData?.seTaxDeduction ?? 0;
    const iraDeduction = adjustmentsData?.iraDeduction ?? 0;
    const studentLoanInterest = adjustmentsData?.studentLoanInterest ?? 0;
    const alimonyPaid = adjustmentsData?.alimonyPaid ?? 0;
    const movingExpenses = adjustmentsData?.movingExpensesMilitary ?? 0;
    const otherAdjustments = adjustmentsData?.otherAdjustments ?? 0;
    const totalAdjustments =
      adjustmentsData?.totalAdjustments ??
      educatorExpenses +
        hsaDeduction +
        selfEmployedHealthIns +
        selfEmployedRetirement +
        seTaxDeduction +
        iraDeduction +
        studentLoanInterest +
        alimonyPaid +
        movingExpenses +
        otherAdjustments;

    // Convert from cents to dollars
    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule 1 (Form 1040)</h1>
          <p>Additional Income and Adjustments to Income</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Additional Income</h2>
          <div class="line-items">
            <div class="line">1. Taxable refunds, credits, or offsets of state and local income taxes: $0.00</div>
            <div class="line">2a. Alimony received: $0.00</div>
            <div class="line">3. Business income or (loss) - Attach Schedule C: $${parseFloat(incomeData?.businessIncome || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">4. Other gains or (losses) - Attach Form 4797: $0.00</div>
            <div class="line">5. Rental real estate, royalties, partnerships, S corps - Attach Schedule E: $0.00</div>
            <div class="line">6. Farm income or (loss) - Attach Schedule F: $0.00</div>
            <div class="line">7. Unemployment compensation: $${parseFloat(incomeData?.unemployment || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line">8. Other income: $${otherIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="line total">9. Total additional income: $${(parseFloat(incomeData?.businessIncome || '0') + parseFloat(incomeData?.unemployment || '0') + otherIncome).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Adjustments to Income</h2>
          <div class="line-items">
            <div class="line">11. Educator expenses (max $300): $${toDollars(educatorExpenses)}</div>
            <div class="line">12. Certain business expenses of reservists, performing artists, etc.: $0.00</div>
            <div class="line">13. Health savings account deduction: $${toDollars(hsaDeduction)}</div>
            <div class="line">14. Moving expenses for Armed Forces: $${toDollars(movingExpenses)}</div>
            <div class="line">15. Deductible part of self-employment tax: $${toDollars(seTaxDeduction)}</div>
            <div class="line">16. Self-employed SEP, SIMPLE, and qualified plans: $${toDollars(selfEmployedRetirement)}</div>
            <div class="line">17. Self-employed health insurance deduction: $${toDollars(selfEmployedHealthIns)}</div>
            <div class="line">18. Penalty on early withdrawal of savings: $0.00</div>
            <div class="line">19a. Alimony paid: $${toDollars(alimonyPaid)}</div>
            <div class="line">20. IRA deduction: $${toDollars(iraDeduction)}</div>
            <div class="line">21. Student loan interest deduction (max $2,500): $${toDollars(studentLoanInterest)}</div>
            <div class="line">22. Reserved for future use: $0.00</div>
            <div class="line">23. Archer MSA deduction: $0.00</div>
            <div class="line">24. Other adjustments: $${toDollars(otherAdjustments)}</div>
            <div class="line total">25. Total adjustments to income: $${toDollars(totalAdjustments)}</div>
            <div class="line note">   Enter this amount on Form 1040, line 10</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Adjustment Limits</h2>
          <div class="line-items">
            <div class="line">Educator expenses: $300 per educator ($600 MFJ both educators)</div>
            <div class="line">HSA contribution limit (self): $4,300</div>
            <div class="line">HSA contribution limit (family): $8,550</div>
            <div class="line">Student loan interest: $2,500 (subject to income phase-out)</div>
            <div class="line">IRA contribution: $7,000 ($8,000 if age 50+)</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateSchedule2 = () => {
    const { additionalTaxesData, selfEmploymentData, taxResult } = formData;

    // Part I - Tax on Income
    const amt = additionalTaxesData?.amt ?? taxResult?.additionalTaxes?.amt ?? 0;
    const amtDetails = additionalTaxesData?.amtDetails;

    // Part II - Other Taxes
    const seTax =
      additionalTaxesData?.seTax ??
      selfEmploymentData?.totalSETax ??
      taxResult?.additionalTaxes?.seTax ??
      0;
    const niit = additionalTaxesData?.niit ?? taxResult?.additionalTaxes?.niit ?? 0;
    const niitDetails = additionalTaxesData?.niitDetails;
    const additionalMedicareTax =
      additionalTaxesData?.additionalMedicareTax ??
      selfEmploymentData?.additionalMedicareTax ??
      taxResult?.additionalTaxes?.medicareSurtax ??
      0;
    const householdTax = additionalTaxesData?.householdEmploymentTax ?? 0;
    const homebuyerRepay = additionalTaxesData?.firstTimeHomebuyerRepayment ?? 0;
    const otherTaxes = additionalTaxesData?.otherTaxes ?? 0;

    const totalAdditionalTaxes =
      additionalTaxesData?.totalAdditionalTaxes ??
      amt + seTax + niit + additionalMedicareTax + householdTax + homebuyerRepay + otherTaxes;

    // Convert from cents to dollars for display
    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule 2 (Form 1040)</h1>
          <p>Additional Taxes</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Tax</h2>
          <div class="line-items">
            <div class="line">1. Alternative minimum tax (Form 6251): $${toDollars(amt)}</div>
            ${
              amt > 0 && amtDetails
                ? `
              <div class="line sub-note">AMTI: $${toDollars(amtDetails.amti ?? 0)}</div>
              <div class="line sub-note">AMT Exemption: $${toDollars(amtDetails.exemption ?? 0)}</div>
              <div class="line sub-note">Tentative Minimum Tax: $${toDollars(amtDetails.tentativeMinimumTax ?? 0)}</div>
            `
                : ''
            }
            <div class="line">2. Excess advance premium tax credit repayment (Form 8962): $0.00</div>
            <div class="line total">3. Add lines 1 and 2: $${toDollars(amt)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Other Taxes</h2>
          <div class="line-items">
            <div class="line">4. Self-employment tax (Schedule SE): $${toDollars(seTax)}</div>
            <div class="line">5. Social security and Medicare tax on tips (Form 4137): $0.00</div>
            <div class="line">6. Uncollected social security and Medicare tax on wages (Form 8919): $0.00</div>
            <div class="line">7. Total additional social security and Medicare tax (lines 5 + 6): $0.00</div>
            <div class="line">8. Additional tax on IRAs and other qualified retirement plans (Form 5329): $0.00</div>
            <div class="line">9. Household employment taxes (Schedule H): $${toDollars(householdTax)}</div>
            <div class="line">10. First-time homebuyer credit repayment (Form 5405): $${toDollars(homebuyerRepay)}</div>
            <div class="line">11. Additional Medicare Tax (Form 8959): $${toDollars(additionalMedicareTax)}</div>
            <div class="line">12. Net Investment Income Tax (Form 8960): $${toDollars(niit)}</div>
            ${
              niit > 0 && niitDetails
                ? `
              <div class="line sub-note">Net Investment Income: $${toDollars(niitDetails.netInvestmentIncome ?? 0)}</div>
              <div class="line sub-note">MAGI Threshold: $${toDollars(niitDetails.threshold ?? 0)}</div>
              <div class="line sub-note">Excess AGI over Threshold: $${toDollars(niitDetails.excessAGI ?? 0)}</div>
            `
                : ''
            }
            <div class="line">13. Interest on tax due on installment income from the sale of certain
                  residential lots and timeshares: $0.00</div>
            <div class="line">14. Interest on deferred tax on gain from certain installment sales: $0.00</div>
            <div class="line">15. Recapture of low-income housing credit (Form 8611): $0.00</div>
            <div class="line">16. Recapture of other credits: $0.00</div>
            <div class="line">17a. Recapture of federal mortgage subsidy: $0.00</div>
            <div class="line">17b. Section 72(m)(5) excess benefits tax: $0.00</div>
            <div class="line">17c. Excise tax on golden parachute payments: $0.00</div>
            <div class="line">17d. Excise tax on employer-sponsored health coverage: $0.00</div>
            <div class="line">17e. Look-back interest under section 167(g) or 460(b): $0.00</div>
            <div class="line">17f. Tax on non-effectively connected income: $0.00</div>
            <div class="line">17g. Any interest from Form 8621 line 16f, relating to PFICs: $0.00</div>
            <div class="line">17h. Any interest from Form 8621 line 24: $0.00</div>
            ${otherTaxes > 0 ? `<div class="line">17z. Other taxes: $${toDollars(otherTaxes)}</div>` : ''}
            <div class="line">18. Total other taxes (add lines 4, 7-17): $${toDollars(seTax + niit + additionalMedicareTax + householdTax + homebuyerRepay + otherTaxes)}</div>
            <div class="line total">19. Add Part I, line 3 and Part II, line 18 (enter on Form 1040, line 17): $${toDollars(totalAdditionalTaxes)}</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Additional Tax Information</h2>
          <div class="line-items">
            <div class="line">Net Investment Income Tax Rate: 3.8%</div>
            <div class="line">NIIT Threshold (Single/HOH): $200,000</div>
            <div class="line">NIIT Threshold (MFJ): $250,000</div>
            <div class="line">NIIT Threshold (MFS): $125,000</div>
            <div class="line">Additional Medicare Tax Rate: 0.9%</div>
            <div class="line">Medicare Tax Threshold (Single): $200,000</div>
            <div class="line">Medicare Tax Threshold (MFJ): $250,000</div>
            <div class="line">AMT Rate: 26% / 28%</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateSchedule3 = () => {
    const { additionalCreditsData, taxResult } = formData;

    // Part I - Nonrefundable Credits
    const foreignTaxCredit =
      additionalCreditsData?.foreignTaxCredit ?? taxResult?.credits?.ftc ?? 0;
    const childCareCredit = additionalCreditsData?.childDependentCareCredit ?? 0;
    const educationAotc =
      additionalCreditsData?.educationCredits?.aotc ?? taxResult?.credits?.aotc ?? 0;
    const educationLlc =
      additionalCreditsData?.educationCredits?.llc ?? taxResult?.credits?.llc ?? 0;
    const saversCredit = additionalCreditsData?.retirementSavingsCredit ?? 0;
    const residentialEnergy = additionalCreditsData?.residentialEnergyCredits ?? 0;
    const otherNonrefundable =
      additionalCreditsData?.otherNonrefundableCredits ??
      taxResult?.credits?.otherNonRefundable ??
      0;

    const totalNonrefundable =
      additionalCreditsData?.totalNonrefundableCredits ??
      foreignTaxCredit +
        childCareCredit +
        educationLlc +
        saversCredit +
        residentialEnergy +
        otherNonrefundable;

    // Part II - Refundable Credits (other than EITC and refundable CTC)
    const eic = additionalCreditsData?.earnedIncomeCredit ?? taxResult?.credits?.eitc ?? 0;
    const additionalCtc = additionalCreditsData?.additionalChildTaxCredit ?? 0;
    const aotcRefundable =
      additionalCreditsData?.americanOpportunityRefundable ??
      Math.round((taxResult?.credits?.aotc ?? 0) * 0.4);
    const premiumTaxCredit =
      additionalCreditsData?.premiumTaxCredit ?? taxResult?.credits?.ptc ?? 0;
    const otherRefundable =
      additionalCreditsData?.otherRefundableCredits ?? taxResult?.credits?.otherRefundable ?? 0;

    const totalRefundable =
      additionalCreditsData?.totalRefundableCredits ??
      aotcRefundable + premiumTaxCredit + otherRefundable;

    // Convert from cents to dollars for display
    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return `
      <div class="tax-form">
        <div class="form-header">
          <h1>Schedule 3 (Form 1040)</h1>
          <p>Additional Credits and Payments</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Nonrefundable Credits</h2>
          <div class="line-items">
            <div class="line">1. Foreign tax credit (Form 1116 or direct): $${toDollars(foreignTaxCredit)}</div>
            <div class="line">2. Credit for child and dependent care expenses (Form 2441): $${toDollars(childCareCredit)}</div>
            <div class="line">3. Education credits from Form 8863:</div>
            <div class="line sub-note">   3a. American Opportunity Credit (nonrefundable portion): $${toDollars(Math.round(educationAotc * 0.6))}</div>
            <div class="line sub-note">   3b. Lifetime Learning Credit: $${toDollars(educationLlc)}</div>
            <div class="line">4. Retirement savings contributions credit (Form 8880): $${toDollars(saversCredit)}</div>
            <div class="line">5. Residential energy credits (Form 5695): $${toDollars(residentialEnergy)}</div>
            <div class="line">6. Other nonrefundable credits:</div>
            <div class="line sub-note">   6a. General business credit (Form 3800): $0.00</div>
            <div class="line sub-note">   6b. Credit for prior year minimum tax (Form 8801): $0.00</div>
            <div class="line sub-note">   6c. Adoption credit (Form 8839): $${toDollars(taxResult?.credits?.adoptionCreditNonRefundable ?? 0)}</div>
            <div class="line sub-note">   6d. Credit for the elderly or disabled (Schedule R): $0.00</div>
            <div class="line sub-note">   6e. Alternative motor vehicle credit (Form 8910): $0.00</div>
            <div class="line sub-note">   6f. Qualified plug-in motor vehicle credit (Form 8936): $0.00</div>
            <div class="line sub-note">   6g. Mortgage interest credit (Form 8396): $0.00</div>
            <div class="line sub-note">   6h. District of Columbia first-time homebuyer credit: $0.00</div>
            <div class="line sub-note">   6i. Qualified electric vehicle credit (Form 8834): $0.00</div>
            <div class="line sub-note">   6j. Alternative fuel vehicle refueling property credit (Form 8911): $0.00</div>
            <div class="line sub-note">   6k. Credit to holders of tax credit bonds (Form 8912): $0.00</div>
            <div class="line sub-note">   6l. Amount on Form 8978, line 14: $0.00</div>
            <div class="line sub-note">   6z. Other nonrefundable credits: $${toDollars(otherNonrefundable)}</div>
            <div class="line total">7. Total nonrefundable credits (add lines 1-6): $${toDollars(totalNonrefundable)}</div>
            <div class="line note">   Enter on Form 1040, line 20</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Other Payments and Refundable Credits</h2>
          <div class="line-items">
            <div class="line">8. Net premium tax credit (Form 8962): $${toDollars(premiumTaxCredit)}</div>
            <div class="line">9. Amount paid with request for extension to file: $0.00</div>
            <div class="line">10. Excess social security and tier 1 RRTA tax withheld: $0.00</div>
            <div class="line">11. Credit for federal tax on fuels (Form 4136): $0.00</div>
            <div class="line">12. Other payments or refundable credits:</div>
            <div class="line sub-note">   12a. Form 2439: $0.00</div>
            <div class="line sub-note">   12b. Qualified sick and family leave credit from Schedule H: $0.00</div>
            <div class="line sub-note">   12c. Health coverage tax credit from Form 8885: $0.00</div>
            <div class="line sub-note">   12d. Credit for repayment of amounts included in income: $0.00</div>
            <div class="line sub-note">   12e. Reserved for future use: $0.00</div>
            <div class="line sub-note">   12f. Deferred amount of net 965 tax liability: $0.00</div>
            <div class="line sub-note">   12g. Credit for child of deceased (Form 8814): $0.00</div>
            <div class="line sub-note">   12z. Other payments/refundable credits: $${toDollars(otherRefundable)}</div>
            <div class="line total">13. Total other payments and refundable credits (add lines 8-12): $${toDollars(totalRefundable)}</div>
            <div class="line note">   Enter on Form 1040, line 31</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>Common Credits Summary</h2>
          <div class="line-items">
            ${eic > 0 ? `<div class="line">Earned Income Credit (Schedule EIC, Form 1040 line 27): $${toDollars(eic)}</div>` : ''}
            ${additionalCtc > 0 ? `<div class="line">Additional Child Tax Credit (Form 8812): $${toDollars(additionalCtc)}</div>` : ''}
            ${aotcRefundable > 0 ? `<div class="line">American Opportunity Credit (refundable 40%): $${toDollars(aotcRefundable)}</div>` : ''}
            <div class="line note">Note: EITC and Additional CTC are reported directly on Form 1040, not Schedule 3</div>
          </div>
        </div>

        <div class="credits-limits">
          <h2>2025 Credit Limits and Thresholds</h2>
          <div class="line-items">
            <div class="line">Child Tax Credit: $2,000 per qualifying child</div>
            <div class="line">Additional Child Tax Credit: Up to $1,700 refundable</div>
            <div class="line">American Opportunity Credit: Max $2,500 (40% refundable = $1,000)</div>
            <div class="line">Lifetime Learning Credit: Max $2,000 (20% of first $10,000)</div>
            <div class="line">Saver's Credit: 10-50% of contributions (max $1,000/$2,000 MFJ)</div>
            <div class="line">Child & Dependent Care: Up to 35% of $3,000/$6,000 expenses</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateScheduleE = () => {
    const { scheduleEData, incomeData } = formData;

    // Helper for formatting currency (from cents to dollars)
    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Rental Properties
    const rentalProperties = scheduleEData?.rentalProperties ?? [];
    const totalRentalIncome = scheduleEData?.totalRentalIncome ?? 0;
    const totalRoyaltyIncome = scheduleEData?.totalRoyaltyIncome ?? 0;
    const totalRentalExpenses = scheduleEData?.totalRentalExpenses ?? 0;
    const netRentalRoyaltyIncome =
      scheduleEData?.netRentalRoyaltyIncome ??
      totalRentalIncome + totalRoyaltyIncome - totalRentalExpenses;

    // Part II - Partnership/S Corp K-1s
    const partnershipK1s = scheduleEData?.partnershipK1s ?? [];
    const totalPartnershipIncome =
      scheduleEData?.totalPartnershipIncome ??
      partnershipK1s.reduce(
        (sum, k1) => sum + (k1.ordinaryIncome ?? 0) + (k1.rentalIncome ?? 0),
        0
      );

    // Part III - Estate/Trust K-1s
    const estateK1s = scheduleEData?.estateK1s ?? [];
    const totalEstateIncome =
      scheduleEData?.totalEstateIncome ??
      estateK1s.reduce((sum, k1) => sum + (k1.ordinaryIncome ?? 0) + (k1.rentalIncome ?? 0), 0);

    // Part IV - REMICs
    const remicIncome = scheduleEData?.remicIncome ?? 0;

    // Total Schedule E income
    const totalScheduleEIncome =
      scheduleEData?.totalScheduleEIncome ??
      netRentalRoyaltyIncome + totalPartnershipIncome + totalEstateIncome + remicIncome;

    // Fallback to incomeData if no scheduleEData
    const rentalIncomeFromUI = parseFloat(incomeData?.rentalIncome || '0');

    // Property type labels
    const propertyTypeLabels: Record<string, string> = {
      single_family: 'Single Family Residence',
      multi_family: 'Multi-Family Residence',
      vacation: 'Vacation/Short-Term Rental',
      commercial: 'Commercial Property',
      land: 'Land',
      royalties: 'Royalties',
      other: 'Other',
    };

    // Generate property rows for Part I
    const generatePropertyRows = () => {
      if (rentalProperties.length === 0) {
        if (rentalIncomeFromUI !== 0) {
          return `
            <tr>
              <td>A</td>
              <td>Rental Property (See attached records)</td>
              <td>1</td>
              <td>-</td>
              <td>-</td>
              <td>$${rentalIncomeFromUI.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          `;
        }
        return '<tr><td colspan="6" class="note">No rental properties to report</td></tr>';
      }

      return rentalProperties
        .map(
          (prop, idx) => `
        <tr>
          <td>${String.fromCharCode(65 + idx)}</td>
          <td>${prop.propertyAddress || propertyTypeLabels[prop.propertyType] || 'Property ' + (idx + 1)}</td>
          <td>${prop.propertyType === 'royalties' ? '6' : '1'}</td>
          <td>${prop.fairRentalDays ?? '-'}</td>
          <td>${prop.personalUseDays ?? '-'}</td>
          <td>$${toDollars((prop.rentsReceived ?? 0) + (prop.royaltiesReceived ?? 0))}</td>
        </tr>
      `
        )
        .join('');
    };

    // Generate expense breakdown for properties
    const generateExpenseBreakdown = () => {
      if (rentalProperties.length === 0) return '';

      return rentalProperties
        .map((prop, idx) => {
          const exp = prop.expenses ?? {};
          const totalExp =
            prop.totalExpenses ??
            Object.values(exp).reduce((sum: number, val) => sum + (val ?? 0), 0);

          return `
          <div class="property-expenses">
            <h4>Property ${String.fromCharCode(65 + idx)}: ${prop.propertyAddress || propertyTypeLabels[prop.propertyType]}</h4>
            <div class="expense-grid">
              ${(exp.advertising ?? 0) > 0 ? `<div class="line">5. Advertising: $${toDollars(exp.advertising ?? 0)}</div>` : ''}
              ${(exp.auto ?? 0) > 0 ? `<div class="line">6. Auto and travel: $${toDollars(exp.auto ?? 0)}</div>` : ''}
              ${(exp.cleaning ?? 0) > 0 ? `<div class="line">7. Cleaning and maintenance: $${toDollars(exp.cleaning ?? 0)}</div>` : ''}
              ${(exp.commissions ?? 0) > 0 ? `<div class="line">8. Commissions: $${toDollars(exp.commissions ?? 0)}</div>` : ''}
              ${(exp.insurance ?? 0) > 0 ? `<div class="line">9. Insurance: $${toDollars(exp.insurance ?? 0)}</div>` : ''}
              ${(exp.legal ?? 0) > 0 ? `<div class="line">10. Legal and professional: $${toDollars(exp.legal ?? 0)}</div>` : ''}
              ${(exp.management ?? 0) > 0 ? `<div class="line">11. Management fees: $${toDollars(exp.management ?? 0)}</div>` : ''}
              ${(exp.mortgageInterest ?? 0) > 0 ? `<div class="line">12. Mortgage interest: $${toDollars(exp.mortgageInterest ?? 0)}</div>` : ''}
              ${(exp.otherInterest ?? 0) > 0 ? `<div class="line">13. Other interest: $${toDollars(exp.otherInterest ?? 0)}</div>` : ''}
              ${(exp.repairs ?? 0) > 0 ? `<div class="line">14. Repairs: $${toDollars(exp.repairs ?? 0)}</div>` : ''}
              ${(exp.supplies ?? 0) > 0 ? `<div class="line">15. Supplies: $${toDollars(exp.supplies ?? 0)}</div>` : ''}
              ${(exp.taxes ?? 0) > 0 ? `<div class="line">16. Taxes: $${toDollars(exp.taxes ?? 0)}</div>` : ''}
              ${(exp.utilities ?? 0) > 0 ? `<div class="line">17. Utilities: $${toDollars(exp.utilities ?? 0)}</div>` : ''}
              ${(exp.depreciation ?? 0) > 0 ? `<div class="line">18. Depreciation: $${toDollars(exp.depreciation ?? 0)}</div>` : ''}
              ${(exp.other ?? 0) > 0 ? `<div class="line">19. Other: $${toDollars(exp.other ?? 0)}</div>` : ''}
              <div class="line total">20. Total expenses: $${toDollars(totalExp)}</div>
              <div class="line total highlight">21. Net income (loss): $${toDollars(prop.netIncome ?? (prop.rentsReceived ?? 0) + (prop.royaltiesReceived ?? 0) - totalExp)}</div>
            </div>
          </div>
        `;
        })
        .join('');
    };

    // Generate K-1 rows for Part II
    const generateK1Rows = () => {
      if (partnershipK1s.length === 0) {
        return '<tr><td colspan="5" class="note">No partnership or S corporation income to report</td></tr>';
      }

      return partnershipK1s
        .map(
          (k1, idx) => `
        <tr>
          <td>${String.fromCharCode(65 + idx)}</td>
          <td>${k1.entityName}</td>
          <td>${k1.entityType === 'partnership' ? 'P' : 'S'}</td>
          <td>${k1.ein || 'N/A'}</td>
          <td>$${toDollars((k1.ordinaryIncome ?? 0) + (k1.rentalIncome ?? 0))}</td>
        </tr>
      `
        )
        .join('');
    };

    // Generate Estate/Trust K-1 rows for Part III
    const generateEstateK1Rows = () => {
      if (estateK1s.length === 0) {
        return '<tr><td colspan="4" class="note">No estate or trust income to report</td></tr>';
      }

      return estateK1s
        .map(
          (k1, idx) => `
        <tr>
          <td>${String.fromCharCode(65 + idx)}</td>
          <td>${k1.estateName}</td>
          <td>${k1.ein || 'N/A'}</td>
          <td>$${toDollars((k1.ordinaryIncome ?? 0) + (k1.rentalIncome ?? 0))}</td>
        </tr>
      `
        )
        .join('');
    };

    return `
      <div class="tax-form schedule-e">
        <div class="form-header">
          <h1>Schedule E (Form 1040)</h1>
          <p>Supplemental Income and Loss</p>
          <p>(From rental real estate, royalties, partnerships, S corporations, estates, trusts, REMICs, etc.)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Income or Loss From Rental Real Estate and Royalties</h2>
          <p class="note">Note: If you are in the business of renting personal property, use Schedule C. Report farm rental income or loss from Form 4835 on page 2, line 40.</p>

          <div class="property-table">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Physical Address/Description</th>
                  <th>Type Code</th>
                  <th>Fair Rental Days</th>
                  <th>Personal Use Days</th>
                  <th>Rents/Royalties Received</th>
                </tr>
              </thead>
              <tbody>
                ${generatePropertyRows()}
              </tbody>
            </table>
          </div>

          <div class="type-codes">
            <p><strong>Type Codes:</strong> 1-Single Family, 2-Multi-Family, 3-Vacation/Short-Term, 4-Commercial, 5-Land, 6-Royalties, 7-Self-Rental, 8-Other</p>
          </div>

          ${generateExpenseBreakdown()}

          <div class="part-1-totals">
            <h3>Part I Totals</h3>
            <div class="line-items">
              <div class="line">3. Rents received: $${toDollars(totalRentalIncome || rentalIncomeFromUI * 100)}</div>
              <div class="line">4. Royalties received: $${toDollars(totalRoyaltyIncome)}</div>
              <div class="line total">21. Total rental real estate and royalty income or (loss): $${toDollars(netRentalRoyaltyIncome || rentalIncomeFromUI * 100)}</div>
            </div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Income or Loss From Partnerships and S Corporations</h2>
          <p class="note">Note: If you report a loss, receive a distribution, dispose of stock, or receive a loan repayment from an S corporation, you must check the box in column (e).</p>

          <div class="k1-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name of Entity</th>
                  <th>Type (P/S)</th>
                  <th>EIN</th>
                  <th>Income (Loss)</th>
                </tr>
              </thead>
              <tbody>
                ${generateK1Rows()}
              </tbody>
            </table>
          </div>

          <div class="line-items">
            <div class="line total">32. Total partnership and S corporation income or (loss): $${toDollars(totalPartnershipIncome)}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Income or Loss From Estates and Trusts</h2>

          <div class="k1-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name of Estate or Trust</th>
                  <th>EIN</th>
                  <th>Income (Loss)</th>
                </tr>
              </thead>
              <tbody>
                ${generateEstateK1Rows()}
              </tbody>
            </table>
          </div>

          <div class="line-items">
            <div class="line total">37. Total estate and trust income or (loss): $${toDollars(totalEstateIncome)}</div>
          </div>
        </div>

        <div class="part-4">
          <h2>Part IV - Income or Loss From Real Estate Mortgage Investment Conduits (REMICs)</h2>
          <div class="line-items">
            <div class="line">38. Income from REMICs: $${toDollars(remicIncome)}</div>
          </div>
        </div>

        <div class="part-5">
          <h2>Part V - Summary</h2>
          <div class="line-items">
            <div class="line">40. Net farm rental income or (loss) from Form 4835: $0.00</div>
            <div class="line total highlight">41. Total income or (loss). Combine lines 26, 32, 37, 38, 39, and 40: $${toDollars(totalScheduleEIncome || rentalIncomeFromUI * 100)}</div>
            <div class="line note">   Enter on Form 1040, Schedule 1, line 5</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Schedule E Reference Information</h2>
          <div class="line-items">
            <div class="line">Passive Activity Loss Rules: Losses from passive activities generally limited to passive income</div>
            <div class="line">Real Estate Professional Exception: Must spend 750+ hours AND more than half of personal services in real property trades</div>
            <div class="line">$25,000 Special Allowance: Up to $25,000 rental loss deduction if actively participate (phases out at $100k-$150k MAGI)</div>
            <div class="line">At-Risk Rules: Losses limited to amount you have at risk in the activity</div>
            <div class="line">QBI Deduction: Rental income may qualify for 20% QBI deduction if it's a trade or business</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateForm2441 = () => {
    const { form2441Data, personalInfo, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const qualifyingPersons = form2441Data?.qualifyingPersons ?? [];
    const careProviders = form2441Data?.careProviders ?? [];
    const totalExpenses = form2441Data?.totalExpensesPaid ?? 0;
    const earnedIncome = form2441Data?.earnedIncome ?? 0;
    const spouseEarnedIncome = form2441Data?.spouseEarnedIncome ?? 0;
    const dcBenefits = form2441Data?.dependentCareBenefits ?? 0;
    const creditPct = form2441Data?.creditPercentage ?? 20;
    const allowableCredit = form2441Data?.allowableCredit ?? 0;

    // Expense limits: $3,000 for one person, $6,000 for two or more
    const expenseLimit = qualifyingPersons.length >= 2 ? 600000 : 300000;
    const qualifiedExpenses = Math.min(totalExpenses, expenseLimit);

    const reasonLabels: Record<string, string> = {
      under13: 'Under age 13',
      disabled: 'Physically or mentally incapable of self-care',
      spouse: 'Spouse physically or mentally incapable of self-care',
    };

    return `
      <div class="tax-form form-2441">
        <div class="form-header">
          <h1>Form 2441</h1>
          <p>Child and Dependent Care Expenses</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Persons or Organizations Who Provided the Care</h2>
          <p class="note">You must complete this part. (If you need more space, attach a separate statement.)</p>

          <div class="provider-table">
            <table>
              <thead>
                <tr>
                  <th>(a) Care provider's name</th>
                  <th>(b) Address</th>
                  <th>(c) TIN (SSN or EIN)</th>
                  <th>(d) Amount paid</th>
                </tr>
              </thead>
              <tbody>
                ${
                  careProviders.length > 0
                    ? careProviders
                        .map(
                          (p) => `
                    <tr>
                      <td>${p.name}</td>
                      <td>${p.address || '-'}</td>
                      <td>${p.tin || 'See statement'}</td>
                      <td>$${toDollars(p.amountPaid)}</td>
                    </tr>
                  `
                        )
                        .join('')
                    : `<tr><td colspan="4" class="note">No care providers listed</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Credit for Child and Dependent Care Expenses</h2>

          <div class="qualifying-persons">
            <h3>Qualifying Person(s)</h3>
            <table>
              <thead>
                <tr>
                  <th>(a) Qualifying person's name</th>
                  <th>(b) SSN</th>
                  <th>(c) Qualifying reason</th>
                </tr>
              </thead>
              <tbody>
                ${
                  qualifyingPersons.length > 0
                    ? qualifyingPersons
                        .map(
                          (p) => `
                    <tr>
                      <td>${p.name}</td>
                      <td>${p.ssn || 'XXX-XX-XXXX'}</td>
                      <td>${reasonLabels[p.qualifyingReason] || p.qualifyingReason}</td>
                    </tr>
                  `
                        )
                        .join('')
                    : `<tr><td colspan="3" class="note">No qualifying persons listed</td></tr>`
                }
              </tbody>
            </table>
          </div>

          <div class="line-items">
            <div class="line">2. Information about qualifying person(s): See table above</div>
            <div class="line">3. Qualified expenses (max $3,000 for one, $6,000 for two+): $${toDollars(qualifiedExpenses)}</div>
            <div class="line">4. Enter your earned income: $${toDollars(earnedIncome)}</div>
            ${
              personalInfo.filingStatus === 'marriedJointly' ||
              personalInfo.filingStatus === 'Married Filing Jointly'
                ? `<div class="line">5. Enter spouse's earned income: $${toDollars(spouseEarnedIncome)}</div>`
                : ''
            }
            <div class="line">6. Smallest of lines 3, 4, or 5: $${toDollars(Math.min(qualifiedExpenses, earnedIncome, spouseEarnedIncome || earnedIncome))}</div>
            <div class="line">7. Enter amount from line 6: $${toDollars(Math.min(qualifiedExpenses, earnedIncome, spouseEarnedIncome || earnedIncome))}</div>
            <div class="line">8. Enter dependent care benefits (W-2, Box 10): $${toDollars(dcBenefits)}</div>
            <div class="line">9. Subtract line 8 from line 7: $${toDollars(Math.max(0, Math.min(qualifiedExpenses, earnedIncome, spouseEarnedIncome || earnedIncome) - dcBenefits))}</div>
            <div class="line">10. Credit percentage based on AGI: ${creditPct}%</div>
            <div class="line total">11. Credit (line 9 × line 10): $${toDollars(allowableCredit || Math.round((Math.max(0, Math.min(qualifiedExpenses, earnedIncome, spouseEarnedIncome || earnedIncome) - dcBenefits) * creditPct) / 100))}</div>
            <div class="line note">   Enter on Schedule 3, line 2</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Child and Dependent Care Credit Information</h2>
          <div class="line-items">
            <div class="line">Maximum expenses: $3,000 (one person) / $6,000 (two or more)</div>
            <div class="line">Credit percentage: 20% to 35% based on AGI</div>
            <div class="line">Maximum credit: $600 (one person) / $1,200 (two or more) at 20%</div>
            <div class="line">Credit percentage phases down above $15,000 AGI</div>
            <div class="line">Minimum credit percentage: 20% (AGI above $43,000)</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateForm8863 = () => {
    const { form8863Data, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const students = form8863Data?.students ?? [];
    const totalAOTC = form8863Data?.totalAOTC ?? taxResult?.credits?.aotc ?? 0;
    const totalLLC = form8863Data?.totalLLC ?? taxResult?.credits?.llc ?? 0;
    const refundableAOTC = form8863Data?.refundableAOTC ?? Math.round(totalAOTC * 0.4);
    const nonRefundableAOTC = form8863Data?.nonRefundableAOTC ?? Math.round(totalAOTC * 0.6);

    return `
      <div class="tax-form form-8863">
        <div class="form-header">
          <h1>Form 8863</h1>
          <p>Education Credits</p>
          <p>(American Opportunity and Lifetime Learning Credits)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Refundable American Opportunity Credit</h2>
          <div class="line-items">
            <div class="line">1. Total American Opportunity Credit from Part III: $${toDollars(totalAOTC)}</div>
            <div class="line">2. Enter tax from Form 1040, line 18, minus Schedule 3 nonrefundable credits: (varies)</div>
            <div class="line">3. Subtract line 2 from line 1. If zero or less, enter -0-: (calculated)</div>
            <div class="line">4. Multiply line 3 by 40% (0.40): $${toDollars(refundableAOTC)}</div>
            <div class="line total">5. Refundable American Opportunity Credit: $${toDollars(refundableAOTC)}</div>
            <div class="line note">   Enter on Form 1040, line 29</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Nonrefundable Education Credits</h2>
          <div class="line-items">
            <div class="line">7. American Opportunity Credit (nonrefundable portion): $${toDollars(nonRefundableAOTC)}</div>
            <div class="line">8. Lifetime Learning Credit from Part III: $${toDollars(totalLLC)}</div>
            <div class="line">9. Add lines 7 and 8: $${toDollars(nonRefundableAOTC + totalLLC)}</div>
            <div class="line">10. Enter tax liability limit: (varies)</div>
            <div class="line total">11. Nonrefundable education credits: $${toDollars(nonRefundableAOTC + totalLLC)}</div>
            <div class="line note">   Enter on Schedule 3, line 3</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Student and Educational Institution Information</h2>
          ${
            students.length > 0
              ? students
                  .map(
                    (student, idx) => `
              <div class="student-info">
                <h3>Student ${idx + 1}: ${student.name}</h3>
                <div class="info-grid">
                  <div class="line">SSN: ${student.ssn || 'XXX-XX-XXXX'}</div>
                  <div class="line">Institution: ${student.institution || 'See 1098-T'}</div>
                  <div class="line">Qualified expenses: $${toDollars(student.qualifiedExpenses)}</div>
                  <div class="line">First 4 years of post-secondary: ${student.isFirstFourYears ? 'Yes' : 'No'}</div>
                  <div class="line">At least half-time student: ${student.isAtLeastHalfTime ? 'Yes' : 'No'}</div>
                  ${student.aotcAmount ? `<div class="line">AOTC Amount: $${toDollars(student.aotcAmount)}</div>` : ''}
                  ${student.llcAmount ? `<div class="line">LLC Amount: $${toDollars(student.llcAmount)}</div>` : ''}
                </div>
              </div>
            `
                  )
                  .join('')
              : `<div class="note">No student information provided. See Form 1098-T from educational institution.</div>`
          }
        </div>

        <div class="reference-section">
          <h2>2025 Education Credits Reference</h2>
          <div class="line-items">
            <div class="line"><strong>American Opportunity Tax Credit (AOTC):</strong></div>
            <div class="line sub-note">Maximum credit: $2,500 per eligible student</div>
            <div class="line sub-note">100% of first $2,000 + 25% of next $2,000 in expenses</div>
            <div class="line sub-note">40% refundable (up to $1,000)</div>
            <div class="line sub-note">Available for first 4 years of post-secondary education</div>
            <div class="line sub-note">Phase-out: $80,000-$90,000 (single) / $160,000-$180,000 (MFJ)</div>
            <div class="line"><strong>Lifetime Learning Credit (LLC):</strong></div>
            <div class="line sub-note">Maximum credit: $2,000 per return</div>
            <div class="line sub-note">20% of first $10,000 in expenses</div>
            <div class="line sub-note">Nonrefundable only</div>
            <div class="line sub-note">No limit on years claimed</div>
            <div class="line sub-note">Phase-out: $80,000-$90,000 (single) / $160,000-$180,000 (MFJ)</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateForm8880 = () => {
    const { form8880Data, personalInfo, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const taxpayerContrib = form8880Data?.taxpayerContributions;
    const spouseContrib = form8880Data?.spouseContributions;
    const creditRate = form8880Data?.creditRate ?? 0;
    const totalCredit = form8880Data?.totalCredit ?? 0;

    const isJoint =
      personalInfo.filingStatus === 'marriedJointly' ||
      personalInfo.filingStatus === 'Married Filing Jointly';

    // Calculate totals
    const taxpayerTotal = taxpayerContrib?.totalContributions ?? 0;
    const taxpayerDist = taxpayerContrib?.distributions ?? 0;
    const taxpayerNet =
      taxpayerContrib?.netContributions ?? Math.max(0, taxpayerTotal - taxpayerDist);

    const spouseTotal = spouseContrib?.totalContributions ?? 0;
    const spouseDist = spouseContrib?.distributions ?? 0;
    const spouseNet = spouseContrib?.netContributions ?? Math.max(0, spouseTotal - spouseDist);

    // Maximum contribution for credit: $2,000 per person
    const maxContrib = 200000; // cents
    const taxpayerQualified = Math.min(taxpayerNet, maxContrib);
    const spouseQualified = Math.min(spouseNet, maxContrib);

    return `
      <div class="tax-form form-8880">
        <div class="form-header">
          <h1>Form 8880</h1>
          <p>Credit for Qualified Retirement Savings Contributions</p>
          <p>(Saver's Credit)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="eligibility">
          <h2>Eligibility Requirements</h2>
          <div class="line-items">
            <div class="line">• You (and spouse if filing jointly) were age 18 or older at end of 2025</div>
            <div class="line">• You (and spouse) were not a full-time student during 2025</div>
            <div class="line">• You (and spouse) were not claimed as a dependent on another person's return</div>
          </div>
        </div>

        <div class="part-1">
          <h2>Part I - Contributions</h2>
          <div class="contributions-grid">
            <div class="contributor-section">
              <h3>Your Contributions</h3>
              <div class="line-items">
                ${taxpayerContrib?.traditionalIRA ? `<div class="line">Traditional IRA: $${toDollars(taxpayerContrib.traditionalIRA)}</div>` : ''}
                ${taxpayerContrib?.rothIRA ? `<div class="line">Roth IRA: $${toDollars(taxpayerContrib.rothIRA)}</div>` : ''}
                ${taxpayerContrib?.employer401k ? `<div class="line">401(k)/403(b)/457(b): $${toDollars(taxpayerContrib.employer401k)}</div>` : ''}
                ${taxpayerContrib?.simplePlan ? `<div class="line">SIMPLE plan: $${toDollars(taxpayerContrib.simplePlan)}</div>` : ''}
                <div class="line">1. Total contributions: $${toDollars(taxpayerTotal)}</div>
                <div class="line">2. Distributions received: $${toDollars(taxpayerDist)}</div>
                <div class="line">3. Net contributions (line 1 - line 2): $${toDollars(taxpayerNet)}</div>
                <div class="line">4. Qualified contributions (max $2,000): $${toDollars(taxpayerQualified)}</div>
              </div>
            </div>

            ${
              isJoint
                ? `
              <div class="contributor-section">
                <h3>Spouse's Contributions</h3>
                <div class="line-items">
                  ${spouseContrib?.traditionalIRA ? `<div class="line">Traditional IRA: $${toDollars(spouseContrib.traditionalIRA)}</div>` : ''}
                  ${spouseContrib?.rothIRA ? `<div class="line">Roth IRA: $${toDollars(spouseContrib.rothIRA)}</div>` : ''}
                  ${spouseContrib?.employer401k ? `<div class="line">401(k)/403(b)/457(b): $${toDollars(spouseContrib.employer401k)}</div>` : ''}
                  <div class="line">5. Total contributions: $${toDollars(spouseTotal)}</div>
                  <div class="line">6. Distributions received: $${toDollars(spouseDist)}</div>
                  <div class="line">7. Net contributions (line 5 - line 6): $${toDollars(spouseNet)}</div>
                  <div class="line">8. Qualified contributions (max $2,000): $${toDollars(spouseQualified)}</div>
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Credit Calculation</h2>
          <div class="line-items">
            <div class="line">9. Add lines 4 and 8: $${toDollars(taxpayerQualified + spouseQualified)}</div>
            <div class="line">10. Enter AGI from Form 1040, line 11: (see Form 1040)</div>
            <div class="line">11. Credit rate based on AGI and filing status: ${creditRate}%</div>
            <div class="line total">12. Saver's Credit (line 9 × line 11): $${toDollars(totalCredit || Math.round(((taxpayerQualified + spouseQualified) * creditRate) / 100))}</div>
            <div class="line note">   Enter on Schedule 3, line 4</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Saver's Credit Rate Table</h2>
          <div class="rate-table">
            <table>
              <thead>
                <tr>
                  <th>AGI (MFJ)</th>
                  <th>AGI (HOH)</th>
                  <th>AGI (Single/MFS)</th>
                  <th>Credit Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>$0 - $47,500</td><td>$0 - $35,625</td><td>$0 - $23,750</td><td>50%</td></tr>
                <tr><td>$47,501 - $51,000</td><td>$35,626 - $38,250</td><td>$23,751 - $25,500</td><td>20%</td></tr>
                <tr><td>$51,001 - $79,000</td><td>$38,251 - $59,250</td><td>$25,501 - $39,500</td><td>10%</td></tr>
                <tr><td>Over $79,000</td><td>Over $59,250</td><td>Over $39,500</td><td>0%</td></tr>
              </tbody>
            </table>
          </div>
          <div class="line-items">
            <div class="line">Maximum credit: $1,000 per person ($2,000 if MFJ)</div>
            <div class="line">Credit is nonrefundable</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateForm5695 = () => {
    const { form5695Data } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Residential Clean Energy Credit
    const solarElectric = form5695Data?.solarElectric ?? 0;
    const solarWater = form5695Data?.solarWaterHeating ?? 0;
    const fuelCell = form5695Data?.fuelCell ?? 0;
    const wind = form5695Data?.smallWindEnergy ?? 0;
    const geothermal = form5695Data?.geothermalHeatPump ?? 0;
    const battery = form5695Data?.batteryStorage ?? 0;
    const totalCleanEnergy =
      form5695Data?.totalCleanEnergy ??
      solarElectric + solarWater + fuelCell + wind + geothermal + battery;
    const cleanEnergyCredit = form5695Data?.cleanEnergyCredit ?? Math.round(totalCleanEnergy * 0.3);

    // Part II - Energy Efficient Home Improvement Credit
    const insulation = form5695Data?.insulationMaterials ?? 0;
    const doorsWindows = form5695Data?.exteriorDoorsWindows ?? 0;
    const roofs = form5695Data?.roofs ?? 0;
    const waterHeaters = form5695Data?.waterHeaters ?? 0;
    const furnaces = form5695Data?.furnacesBoilers ?? 0;
    const centralAC = form5695Data?.centralAC ?? 0;
    const heatPumps = form5695Data?.heatPumps ?? 0;
    const biomass = form5695Data?.biomassStoves ?? 0;
    const audit = form5695Data?.homeEnergyAudits ?? 0;
    const panels = form5695Data?.electricPanels ?? 0;

    const totalHomeImprovement =
      form5695Data?.totalHomeImprovement ??
      insulation +
        doorsWindows +
        roofs +
        waterHeaters +
        furnaces +
        centralAC +
        heatPumps +
        biomass +
        audit +
        panels;

    // Calculate credit (with 2025 limits)
    // Annual limit: $1,200 total, with sub-limits
    const windowsDoorLimit = Math.min(doorsWindows, 25000); // $250 per door, $600 total for windows
    const auditLimit = Math.min(audit, 15000); // $150 max for audits
    const heatPumpLimit = Math.min(heatPumps + waterHeaters, 200000); // $2,000 annual for heat pumps/water heaters
    const otherLimit = Math.min(
      insulation + roofs + furnaces + centralAC + biomass + panels,
      120000
    );

    const homeImprovementCredit =
      form5695Data?.homeImprovementCredit ??
      Math.min(
        Math.round((windowsDoorLimit + auditLimit) * 0.3) +
          Math.min(heatPumpLimit, 200000) +
          otherLimit,
        320000
      );

    const totalCredit =
      form5695Data?.totalResidentialCredit ?? cleanEnergyCredit + homeImprovementCredit;

    return `
      <div class="tax-form form-5695">
        <div class="form-header">
          <h1>Form 5695</h1>
          <p>Residential Energy Credits</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Residential Clean Energy Credit</h2>
          <p class="note">For solar, wind, geothermal, fuel cell, and battery storage systems installed in your home.</p>

          <div class="line-items">
            <div class="line">1. Qualified solar electric property costs: $${toDollars(solarElectric)}</div>
            <div class="line">2. Qualified solar water heating property costs: $${toDollars(solarWater)}</div>
            <div class="line">3. Qualified fuel cell property costs: $${toDollars(fuelCell)}</div>
            <div class="line">4. Qualified small wind energy property costs: $${toDollars(wind)}</div>
            <div class="line">5. Qualified geothermal heat pump property costs: $${toDollars(geothermal)}</div>
            <div class="line">6. Qualified battery storage technology costs: $${toDollars(battery)}</div>
            <div class="line">7. Add lines 1 through 6: $${toDollars(totalCleanEnergy)}</div>
            <div class="line">8. Multiply line 7 by 30% (0.30): $${toDollars(cleanEnergyCredit)}</div>
            <div class="line total">14. Residential clean energy credit: $${toDollars(cleanEnergyCredit)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Energy Efficient Home Improvement Credit</h2>
          <p class="note">For qualifying energy efficient improvements made to your main home.</p>

          <div class="line-items">
            <div class="line">17a. Insulation and air sealing materials: $${toDollars(insulation)}</div>
            <div class="line">17b. Exterior doors (max $250 each, $500 total): $${toDollars(doorsWindows)}</div>
            <div class="line">17c. Exterior windows and skylights (max $600): $${toDollars(doorsWindows)}</div>
            <div class="line">17d. Central air conditioners: $${toDollars(centralAC)}</div>
            <div class="line">17e. Natural gas, propane, or oil water heaters: $${toDollars(waterHeaters)}</div>
            <div class="line">17f. Natural gas, propane, or oil furnaces/boilers: $${toDollars(furnaces)}</div>
            <div class="line">18. Electric or natural gas heat pump water heaters: $${toDollars(waterHeaters)}</div>
            <div class="line">19. Electric or natural gas heat pumps: $${toDollars(heatPumps)}</div>
            <div class="line">20. Biomass stoves and boilers: $${toDollars(biomass)}</div>
            <div class="line">21. Home energy audits (max $150): $${toDollars(audit)}</div>
            <div class="line">22. Electric panel and related equipment: $${toDollars(panels)}</div>
            <div class="line">23. Add lines 17a through 22: $${toDollars(totalHomeImprovement)}</div>
            <div class="line total">30. Energy efficient home improvement credit: $${toDollars(homeImprovementCredit)}</div>
          </div>
        </div>

        <div class="summary">
          <h2>Total Residential Energy Credits</h2>
          <div class="line-items">
            <div class="line">Part I - Residential Clean Energy Credit: $${toDollars(cleanEnergyCredit)}</div>
            <div class="line">Part II - Energy Efficient Home Improvement Credit: $${toDollars(homeImprovementCredit)}</div>
            <div class="line total highlight">Total Credit (enter on Schedule 3, line 5): $${toDollars(totalCredit)}</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Residential Energy Credit Limits</h2>
          <div class="line-items">
            <div class="line"><strong>Residential Clean Energy Credit (Part I):</strong></div>
            <div class="line sub-note">Credit rate: 30% of costs</div>
            <div class="line sub-note">No maximum limit (except fuel cells: $500/0.5 kW)</div>
            <div class="line sub-note">Battery storage: Minimum 3 kWh capacity required</div>
            <div class="line"><strong>Energy Efficient Home Improvement Credit (Part II):</strong></div>
            <div class="line sub-note">Annual limit: $1,200 total</div>
            <div class="line sub-note">Windows/skylights: $600 annual limit</div>
            <div class="line sub-note">Doors: $250 per door, $500 annual limit</div>
            <div class="line sub-note">Home energy audit: $150 annual limit</div>
            <div class="line sub-note">Heat pumps/heat pump water heaters: $2,000 annual limit (separate from $1,200)</div>
            <div class="line sub-note">Biomass stoves: $2,000 annual limit (separate from $1,200)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8962 - Premium Tax Credit
  const generateForm8962 = () => {
    const { form8962Data, personalInfo, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Annual and Monthly Contribution
    const familySize = form8962Data?.familySize ?? 1 + (personalInfo.dependents ?? 0);
    const modifiedAGI = form8962Data?.modifiedAGI ?? taxResult.adjustedGrossIncome * 100;
    const householdIncome = form8962Data?.householdIncome ?? modifiedAGI;

    // 2025 Federal Poverty Lines (48 contiguous states)
    const fplTable: Record<number, number> = {
      1: 1558000,
      2: 2108000,
      3: 2658000,
      4: 3208000,
      5: 3758000,
      6: 4308000,
      7: 4858000,
      8: 5408000,
    };
    const baseFPL = fplTable[Math.min(familySize, 8)] ?? 5408000 + (familySize - 8) * 550000;
    const fpl = form8962Data?.federalPovertyLine ?? baseFPL;
    const fplPercent =
      form8962Data?.householdIncomePercent ?? Math.round((householdIncome / fpl) * 10000) / 100;

    // Applicable percentage table (2025 - enhanced through ARP extension)
    const getApplicablePercent = (fplPct: number): number => {
      if (fplPct < 100) return 0;
      if (fplPct < 150) return 0;
      if (fplPct < 200) return 2.0 + (fplPct - 150) * 0.04;
      if (fplPct < 250) return 4.0 + (fplPct - 200) * 0.05;
      if (fplPct < 300) return 6.5 + (fplPct - 250) * 0.017;
      if (fplPct <= 400) return 8.5;
      return 8.5; // Cap at 8.5% for 2025
    };
    const applicablePercent = form8962Data?.applicablePercent ?? getApplicablePercent(fplPercent);
    const annualContribution =
      form8962Data?.annualContributionAmount ??
      Math.round(householdIncome * (applicablePercent / 100));
    const monthlyContribution =
      form8962Data?.monthlyContributionAmount ?? Math.round(annualContribution / 12);

    // Part II - Premium Tax Credit
    const annualPremium = form8962Data?.annualPremium ?? 0;
    const annualSLCSP = form8962Data?.annualSLCSP ?? 0;
    const annualMaxPTC = Math.max(0, annualSLCSP - annualContribution);
    const annualPTCAllowed =
      form8962Data?.annualPTCAllowed ?? Math.min(annualPremium, annualMaxPTC);
    const advancePayments = form8962Data?.advancePayments ?? 0;
    const netPTC = form8962Data?.netPTC ?? annualPTCAllowed - advancePayments;
    const excessAPTC =
      form8962Data?.excessAPTC ??
      (advancePayments > annualPTCAllowed ? advancePayments - annualPTCAllowed : 0);

    return `
      <div class="tax-form form-8962">
        <div class="form-header">
          <h1>Form 8962</h1>
          <p>Premium Tax Credit (PTC)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Annual and Monthly Contribution Amount</h2>

          <div class="line-items">
            <div class="line">1. Tax family size: ${familySize}</div>
            <div class="line">2a. Modified AGI: $${toDollars(modifiedAGI)}</div>
            <div class="line">2b. Dependents' modified AGI: $${toDollars(form8962Data?.dependentsModifiedAGI ?? 0)}</div>
            <div class="line">3. Household income (add 2a and 2b): $${toDollars(householdIncome)}</div>
            <div class="line">4. Federal poverty line for family size: $${toDollars(fpl)}</div>
            <div class="line">5. Household income as percentage of FPL: ${fplPercent.toFixed(2)}%</div>
            <div class="line note">${
              fplPercent < 100
                ? '(Below 100% - may not qualify for PTC without Medicaid gap coverage)'
                : fplPercent > 400
                  ? '(Above 400% - enhanced ARP credits apply through 2025)'
                  : ''
            }</div>
            <div class="line">7. Applicable figure (from table): ${applicablePercent.toFixed(4)}</div>
            <div class="line">8a. Annual contribution amount: $${toDollars(annualContribution)}</div>
            <div class="line">8b. Monthly contribution amount: $${toDollars(monthlyContribution)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Premium Tax Credit Claim and Reconciliation of Advance Payment</h2>

          <div class="line-items">
            <div class="line">11. Annual enrollment premiums: $${toDollars(annualPremium)}</div>
            <div class="line">12. Annual applicable SLCSP premium: $${toDollars(annualSLCSP)}</div>
            <div class="line">13. Annual contribution amount (from line 8a): $${toDollars(annualContribution)}</div>
            <div class="line">14. Annual maximum PTC (line 12 minus line 13): $${toDollars(annualMaxPTC)}</div>
            <div class="line">24. Total premium tax credit (smaller of lines 11 or 14): $${toDollars(annualPTCAllowed)}</div>
            <div class="line">25. Advance payment of PTC received: $${toDollars(advancePayments)}</div>
            <div class="line total">26. Net Premium Tax Credit: $${toDollars(netPTC)}</div>
            ${
              netPTC > 0
                ? `<div class="line note">Refundable credit - enter on Schedule 3, Line 9</div>`
                : `<div class="line">27. Excess advance payment (line 25 minus line 24): $${toDollars(excessAPTC)}</div>
               <div class="line note">Repayment - enter on Schedule 2, Line 2</div>`
            }
          </div>
        </div>

        ${
          form8962Data?.monthlyData && form8962Data.monthlyData.length > 0
            ? `
        <div class="monthly-allocation">
          <h2>Monthly Allocation</h2>
          <table class="monthly-table">
            <tr><th>Month</th><th>Premium</th><th>SLCSP</th><th>APTC</th></tr>
            ${form8962Data.monthlyData
              .map(
                (m) => `
              <tr>
                <td>${m.month}</td>
                <td>$${toDollars(m.premium ?? 0)}</td>
                <td>$${toDollars(m.slcsp ?? 0)}</td>
                <td>$${toDollars(m.aptc ?? 0)}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
        `
            : ''
        }

        <div class="reference-section">
          <h2>2025 Premium Tax Credit Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Eligibility:</strong></div>
            <div class="line sub-note">Household income 100%-400% FPL (enhanced ARP credits extended through 2025)</div>
            <div class="line sub-note">Must purchase coverage through Health Insurance Marketplace</div>
            <div class="line sub-note">Cannot be claimed as dependent, eligible for other coverage, or MFS</div>
            <div class="line"><strong>Applicable Percentage (2025):</strong></div>
            <div class="line sub-note">100-150% FPL: 0%</div>
            <div class="line sub-note">150-200% FPL: 0% - 2%</div>
            <div class="line sub-note">200-250% FPL: 2% - 4%</div>
            <div class="line sub-note">250-300% FPL: 4% - 6%</div>
            <div class="line sub-note">300-400% FPL: 6% - 8.5%</div>
            <div class="line sub-note">400%+ FPL: 8.5% cap (ARP enhancement)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 1116 - Foreign Tax Credit
  const generateForm1116 = () => {
    const { form1116Data, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const incomeCategories: Record<string, string> = {
      general: 'General category income',
      passive: 'Passive category income',
      section951A: 'Section 951A category income',
      foreignBranch: 'Foreign branch category income',
      resourcedTreaty: 'Income re-sourced by treaty',
    };

    const category = form1116Data?.incomeCategory ?? 'general';
    const foreignCountry = form1116Data?.foreignCountry ?? 'Various';

    // Part I - Foreign Source Income
    const grossIncome = form1116Data?.grossIncomeFromSources ?? 0;
    const deductionsAllocated = form1116Data?.deductionsAllocated ?? 0;
    const apportionedDeductions = form1116Data?.apportionedDeductions ?? 0;
    const netForeignIncome =
      form1116Data?.netForeignSourceIncome ??
      grossIncome - deductionsAllocated - apportionedDeductions;

    // Part II - Foreign Taxes
    const foreignTaxesPaid = form1116Data?.foreignTaxesPaid ?? 0;
    const foreignTaxesAccrued = form1116Data?.foreignTaxesAccrued ?? 0;
    const method = form1116Data?.taxesPaidOrAccruedMethod ?? 'paid';
    const totalForeignTaxes =
      form1116Data?.totalForeignTaxes ??
      (method === 'paid' ? foreignTaxesPaid : foreignTaxesAccrued);

    // Part III - Credit Calculation
    const carryover = form1116Data?.carryoverFromPriorYears ?? 0;
    const carryback = form1116Data?.carrybackFromLaterYears ?? 0;
    const totalAvailable =
      form1116Data?.totalAvailableCredit ?? totalForeignTaxes + carryover + carryback;

    // Limitation
    const foreignSourceTaxable = form1116Data?.foreignSourceTaxableIncome ?? netForeignIncome;
    const totalTaxable = form1116Data?.totalTaxableIncome ?? taxResult.taxableIncome * 100;
    const taxBeforeCredits = form1116Data?.taxBeforeCredits ?? taxResult.federalTax * 100;
    const limitRatio = totalTaxable > 0 ? foreignSourceTaxable / totalTaxable : 0;
    const creditLimit =
      form1116Data?.foreignTaxCreditLimit ?? Math.round(taxBeforeCredits * limitRatio);
    const allowedCredit = form1116Data?.allowedCredit ?? Math.min(totalAvailable, creditLimit);
    const carryforward =
      form1116Data?.creditCarryforward ?? Math.max(0, totalAvailable - allowedCredit);

    return `
      <div class="tax-form form-1116">
        <div class="form-header">
          <h1>Form 1116</h1>
          <p>Foreign Tax Credit (Individual, Estate, or Trust)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="category-info">
          <div class="line">Category of income: <strong>${incomeCategories[category] || category}</strong></div>
          <div class="line">Foreign country or U.S. possession: <strong>${foreignCountry}</strong></div>
        </div>

        <div class="part-1">
          <h2>Part I - Taxable Income or Loss From Sources Outside the United States</h2>
          <p class="note">For category checked above</p>

          <div class="line-items">
            <div class="line">1a. Gross income from sources within country shown: $${toDollars(grossIncome)}</div>
            <div class="line">3e. Pro rata share of other deductions: $${toDollars(deductionsAllocated)}</div>
            <div class="line">6. Gross foreign source income (line 1a less 3e): $${toDollars(grossIncome - deductionsAllocated)}</div>
            <div class="line">14. Apportioned share of deductions: $${toDollars(apportionedDeductions)}</div>
            <div class="line total">17. Net foreign source taxable income: $${toDollars(netForeignIncome)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Foreign Taxes Paid or Accrued</h2>

          <div class="line-items">
            <div class="line">Method: ${method === 'paid' ? 'Cash (taxes paid)' : 'Accrual (taxes accrued)'}</div>
            <div class="line">Foreign taxes ${method}: $${toDollars(method === 'paid' ? foreignTaxesPaid : foreignTaxesAccrued)}</div>
            <div class="line">Add foreign taxes from additional countries/possessions: $0.00</div>
            <div class="line total">8. Total foreign taxes (add amounts across): $${toDollars(totalForeignTaxes)}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Figuring the Credit</h2>

          <div class="line-items">
            <div class="line">9. Total from Part II, line 8: $${toDollars(totalForeignTaxes)}</div>
            <div class="line">10. Carryover from prior tax years: $${toDollars(carryover)}</div>
            <div class="line">11. Carryback from later tax years: $${toDollars(carryback)}</div>
            <div class="line">12. Total (add lines 9-11): $${toDollars(totalAvailable)}</div>
          </div>
        </div>

        <div class="part-4">
          <h2>Part IV - Summary of Credits From Separate Parts III</h2>

          <div class="line-items">
            <div class="line"><strong>Credit Limitation Calculation:</strong></div>
            <div class="line">Foreign source taxable income: $${toDollars(foreignSourceTaxable)}</div>
            <div class="line">Total taxable income: $${toDollars(totalTaxable)}</div>
            <div class="line">Ratio (foreign/total): ${(limitRatio * 100).toFixed(4)}%</div>
            <div class="line">Tax before credits: $${toDollars(taxBeforeCredits)}</div>
            <div class="line">Foreign tax credit limit: $${toDollars(creditLimit)}</div>
            <div class="line total">33. Allowed foreign tax credit: $${toDollars(allowedCredit)}</div>
            ${
              carryforward > 0
                ? `<div class="line note">Carryforward to future years: $${toDollars(carryforward)}</div>`
                : ''
            }
          </div>
        </div>

        <div class="reference-section">
          <h2>Foreign Tax Credit Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Credit vs. Deduction:</strong></div>
            <div class="line sub-note">Credit directly reduces U.S. tax (usually more beneficial)</div>
            <div class="line sub-note">Deduction reduces taxable income (may be simpler)</div>
            <div class="line"><strong>Carryover Rules:</strong></div>
            <div class="line sub-note">Carryback: 1 year</div>
            <div class="line sub-note">Carryforward: 10 years</div>
            <div class="line"><strong>Simplified Limitation:</strong></div>
            <div class="line sub-note">If foreign taxes ≤ $300 ($600 MFJ), may claim without Form 1116</div>
            <div class="line sub-note">All income must be qualified passive income</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 6251 - Alternative Minimum Tax
  const generateForm6251 = () => {
    const { form6251Data, additionalTaxesData, taxResult, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - AMTI Calculation
    const taxableIncome = form6251Data?.taxableIncome ?? taxResult.taxableIncome * 100;

    // Adjustments
    const standardOrSALT = form6251Data?.standardDeductionOrSALT ?? 0;
    const taxes = form6251Data?.taxes ?? 0;
    const investmentInterest = form6251Data?.investmentInterest ?? 0;
    const depletionDeduction = form6251Data?.depletionDeduction ?? 0;
    const nol = form6251Data?.netOperatingLoss ?? 0;
    const pabInterest = form6251Data?.interestFromPrivateActivityBonds ?? 0;
    const qsbs = form6251Data?.qualifiedSmallBusinessStock ?? 0;
    const iso = form6251Data?.exerciseOfISO ?? 0;
    const depreciation = form6251Data?.depreciation ?? 0;
    const passive = form6251Data?.passiveActivities ?? 0;
    const otherAdj = form6251Data?.otherAdjustments ?? 0;

    const totalAdjustments =
      form6251Data?.totalAdjustments ??
      standardOrSALT +
        taxes +
        investmentInterest +
        depletionDeduction +
        nol +
        pabInterest +
        qsbs +
        iso +
        depreciation +
        passive +
        otherAdj;

    const amti = form6251Data?.amti ?? taxableIncome + totalAdjustments;

    // 2025 AMT Exemption amounts
    const filingStatus = personalInfo.filingStatus;
    const exemptionAmounts: Record<string, number> = {
      single: 8870000,
      married_filing_jointly: 13790000,
      married_filing_separately: 6895000,
      head_of_household: 8870000,
      qualifying_widow: 13790000,
    };
    const phaseoutThresholds: Record<string, number> = {
      single: 62680000,
      married_filing_jointly: 125360000,
      married_filing_separately: 62680000,
      head_of_household: 62680000,
      qualifying_widow: 125360000,
    };

    const baseExemption = exemptionAmounts[filingStatus] ?? 8870000;
    const phaseoutThreshold = phaseoutThresholds[filingStatus] ?? 62680000;

    // Exemption phaseout (25 cents per dollar over threshold)
    const excessAMTI = Math.max(0, amti - phaseoutThreshold);
    const phaseoutAmount = form6251Data?.exemptionPhaseout ?? Math.round(excessAMTI * 0.25);
    const reducedExemption =
      form6251Data?.reducedExemption ?? Math.max(0, baseExemption - phaseoutAmount);

    // AMT taxable income
    const amtTaxableIncome = form6251Data?.amtTaxableIncome ?? Math.max(0, amti - reducedExemption);

    // 2025 AMT rates: 26% up to threshold, 28% above
    const amtRateThreshold = filingStatus === 'married_filing_separately' ? 11000000 : 22000000;
    const tentativeMinTax =
      form6251Data?.tentativeMinimumTax ??
      (amtTaxableIncome <= amtRateThreshold
        ? Math.round(amtTaxableIncome * 0.26)
        : Math.round(amtRateThreshold * 0.26) +
          Math.round((amtTaxableIncome - amtRateThreshold) * 0.28));

    const regularTax = form6251Data?.regularTax ?? taxResult.federalTax * 100;
    const amt =
      form6251Data?.amt ?? additionalTaxesData?.amt ?? Math.max(0, tentativeMinTax - regularTax);

    return `
      <div class="tax-form form-6251">
        <div class="form-header">
          <h1>Form 6251</h1>
          <p>Alternative Minimum Tax - Individuals</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Alternative Minimum Taxable Income (AMTI)</h2>

          <div class="line-items">
            <div class="line">1. Taxable income from Form 1040, line 15: $${toDollars(taxableIncome)}</div>
            <div class="line note">Adjustments and Preferences:</div>
            ${standardOrSALT > 0 ? `<div class="line">2a. Standard deduction or SALT: $${toDollars(standardOrSALT)}</div>` : ''}
            ${taxes > 0 ? `<div class="line">2b. Taxes from Schedule A, line 7: $${toDollars(taxes)}</div>` : ''}
            ${investmentInterest > 0 ? `<div class="line">3. Investment interest expense: $${toDollars(investmentInterest)}</div>` : ''}
            ${depletionDeduction > 0 ? `<div class="line">4. Depletion: $${toDollars(depletionDeduction)}</div>` : ''}
            ${nol > 0 ? `<div class="line">5. Net operating loss deduction: $${toDollars(nol)}</div>` : ''}
            ${pabInterest > 0 ? `<div class="line">6. Interest from private activity bonds: $${toDollars(pabInterest)}</div>` : ''}
            ${qsbs > 0 ? `<div class="line">7. Qualified small business stock (Sec 1202): $${toDollars(qsbs)}</div>` : ''}
            ${iso > 0 ? `<div class="line">8. Exercise of incentive stock options: $${toDollars(iso)}</div>` : ''}
            ${depreciation !== 0 ? `<div class="line">11. Depreciation adjustment: $${toDollars(depreciation)}</div>` : ''}
            ${passive !== 0 ? `<div class="line">12. Passive activities: $${toDollars(passive)}</div>` : ''}
            ${otherAdj !== 0 ? `<div class="line">25. Other adjustments: $${toDollars(otherAdj)}</div>` : ''}
            <div class="line">27. Total adjustments: $${toDollars(totalAdjustments)}</div>
            <div class="line total">28. Alternative Minimum Taxable Income (AMTI): $${toDollars(amti)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Alternative Minimum Tax (AMT)</h2>

          <div class="line-items">
            <div class="line">29. Exemption (from table): $${toDollars(baseExemption)}</div>
            <div class="line">30. Phase-out threshold: $${toDollars(phaseoutThreshold)}</div>
            ${excessAMTI > 0 ? `<div class="line">31. AMTI over threshold: $${toDollars(excessAMTI)}</div>` : ''}
            ${phaseoutAmount > 0 ? `<div class="line">32. Phase-out amount (25%): $${toDollars(phaseoutAmount)}</div>` : ''}
            <div class="line">33. Reduced exemption: $${toDollars(reducedExemption)}</div>
            <div class="line">34. AMT taxable income (line 28 - line 33): $${toDollars(amtTaxableIncome)}</div>
            <div class="line">35. Tentative minimum tax: $${toDollars(tentativeMinTax)}</div>
            <div class="line">36. Regular tax (Form 1040, line 16): $${toDollars(regularTax)}</div>
            <div class="line total">37. Alternative Minimum Tax: $${toDollars(amt)}</div>
            ${
              amt > 0
                ? `<div class="line note">Enter on Schedule 2, line 1</div>`
                : `<div class="line note">No AMT liability</div>`
            }
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 AMT Reference</h2>
          <div class="line-items">
            <div class="line"><strong>AMT Exemption Amounts:</strong></div>
            <div class="line sub-note">Single/HOH: $88,700</div>
            <div class="line sub-note">Married Filing Jointly: $137,900</div>
            <div class="line sub-note">Married Filing Separately: $68,950</div>
            <div class="line"><strong>Phase-out Thresholds:</strong></div>
            <div class="line sub-note">Single/HOH: $626,800</div>
            <div class="line sub-note">Married Filing Jointly: $1,253,600</div>
            <div class="line sub-note">Married Filing Separately: $626,800</div>
            <div class="line"><strong>AMT Tax Rates:</strong></div>
            <div class="line sub-note">26% on first $220,000 ($110,000 MFS)</div>
            <div class="line sub-note">28% on amounts over threshold</div>
            <div class="line"><strong>Common AMT Triggers:</strong></div>
            <div class="line sub-note">Incentive stock option (ISO) exercise</div>
            <div class="line sub-note">Private activity bond interest</div>
            <div class="line sub-note">Large itemized deductions (limited SALT)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8829 - Expenses for Business Use of Your Home
  const generateForm8829 = () => {
    const { form8829Data, businessData } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Business Use Percentage
    const totalArea = form8829Data?.totalHomeArea ?? 2000;
    const businessArea = form8829Data?.businessArea ?? 200;
    const businessPercent =
      form8829Data?.businessPercent ?? (totalArea > 0 ? (businessArea / totalArea) * 100 : 0);

    // Part II - Expenses
    // Direct expenses (100% deductible)
    const directRepairs = form8829Data?.directExpenses?.repairs ?? 0;
    const directPainting = form8829Data?.directExpenses?.painting ?? 0;
    const directOther = form8829Data?.directExpenses?.other ?? 0;
    const totalDirect =
      form8829Data?.directExpenses?.total ?? directRepairs + directPainting + directOther;

    // Indirect expenses (business % deductible)
    const indirectMortgage = form8829Data?.indirectExpenses?.mortgageInterest ?? 0;
    const indirectTaxes = form8829Data?.indirectExpenses?.realEstateTaxes ?? 0;
    const indirectInsurance = form8829Data?.indirectExpenses?.insurance ?? 0;
    const indirectUtilities = form8829Data?.indirectExpenses?.utilities ?? 0;
    const indirectRepairs = form8829Data?.indirectExpenses?.repairs ?? 0;
    const indirectOther = form8829Data?.indirectExpenses?.other ?? 0;
    const totalIndirect =
      form8829Data?.indirectExpenses?.total ??
      indirectMortgage +
        indirectTaxes +
        indirectInsurance +
        indirectUtilities +
        indirectRepairs +
        indirectOther;

    const businessPortionIndirect = Math.round(totalIndirect * (businessPercent / 100));

    // Depreciation
    const homeValue = form8829Data?.homeValue ?? 0;
    const landValue = form8829Data?.landValue ?? 0;
    const buildingValue = form8829Data?.buildingValue ?? homeValue - landValue;
    const depreciationRate = form8829Data?.depreciationRate ?? 2.564; // Residential: 39 years
    const depreciation =
      form8829Data?.depreciationAmount ??
      Math.round(buildingValue * (businessPercent / 100) * (depreciationRate / 100));

    // Calculations
    const grossIncome = form8829Data?.grossIncomeFromBusiness ?? businessData?.netProfit ?? 0;
    const tentativeProfit = form8829Data?.tentativeProfit ?? grossIncome * 100;
    const totalExpenses = totalDirect + businessPortionIndirect + depreciation;
    const allowableExpenses =
      form8829Data?.allowableExpenses ?? Math.min(totalExpenses, tentativeProfit);
    const carryoverPrior = form8829Data?.carryoverFromPriorYear ?? 0;
    const totalDeduction = form8829Data?.totalDeduction ?? allowableExpenses;
    const carryoverNext =
      form8829Data?.carryoverToNextYear ?? Math.max(0, totalExpenses - allowableExpenses);

    return `
      <div class="tax-form form-8829">
        <div class="form-header">
          <h1>Form 8829</h1>
          <p>Expenses for Business Use of Your Home</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Part of Your Home Used for Business</h2>

          <div class="line-items">
            <div class="line">1. Area used regularly and exclusively for business: ${businessArea} sq ft</div>
            <div class="line">2. Total area of home: ${totalArea} sq ft</div>
            <div class="line total">7. Business percentage (line 1 ÷ line 2): ${businessPercent.toFixed(2)}%</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Figure Your Allowable Deduction</h2>

          <div class="line-items">
            <div class="line">8. Gross income from business use of home: $${toDollars(tentativeProfit)}</div>

            <div class="line note"><strong>Direct Expenses (100% deductible):</strong></div>
            ${directRepairs > 0 ? `<div class="line sub-note">Repairs/maintenance: $${toDollars(directRepairs)}</div>` : ''}
            ${directPainting > 0 ? `<div class="line sub-note">Painting: $${toDollars(directPainting)}</div>` : ''}
            ${directOther > 0 ? `<div class="line sub-note">Other direct: $${toDollars(directOther)}</div>` : ''}
            <div class="line">9. Total direct expenses: $${toDollars(totalDirect)}</div>

            <div class="line note"><strong>Indirect Expenses (${businessPercent.toFixed(2)}% deductible):</strong></div>
            ${indirectMortgage > 0 ? `<div class="line sub-note">Mortgage interest: $${toDollars(indirectMortgage)}</div>` : ''}
            ${indirectTaxes > 0 ? `<div class="line sub-note">Real estate taxes: $${toDollars(indirectTaxes)}</div>` : ''}
            ${indirectInsurance > 0 ? `<div class="line sub-note">Insurance: $${toDollars(indirectInsurance)}</div>` : ''}
            ${indirectUtilities > 0 ? `<div class="line sub-note">Utilities: $${toDollars(indirectUtilities)}</div>` : ''}
            ${indirectRepairs > 0 ? `<div class="line sub-note">Repairs: $${toDollars(indirectRepairs)}</div>` : ''}
            ${indirectOther > 0 ? `<div class="line sub-note">Other indirect: $${toDollars(indirectOther)}</div>` : ''}
            <div class="line">16. Total indirect expenses: $${toDollars(totalIndirect)}</div>
            <div class="line">17. Business portion of indirect expenses: $${toDollars(businessPortionIndirect)}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Depreciation of Your Home</h2>

          <div class="line-items">
            <div class="line">37. Smaller of home's adjusted basis or fair market value: $${toDollars(homeValue)}</div>
            <div class="line">38. Value of land: $${toDollars(landValue)}</div>
            <div class="line">39. Building value (line 37 minus line 38): $${toDollars(buildingValue)}</div>
            <div class="line">40. Business basis of building: $${toDollars(Math.round(buildingValue * (businessPercent / 100)))}</div>
            <div class="line">41. Depreciation percentage (residential 39-year): ${depreciationRate}%</div>
            <div class="line">42. Depreciation allowable: $${toDollars(depreciation)}</div>
          </div>
        </div>

        <div class="summary">
          <h2>Summary - Allowable Home Office Deduction</h2>

          <div class="line-items">
            <div class="line">Direct expenses: $${toDollars(totalDirect)}</div>
            <div class="line">Business portion of indirect expenses: $${toDollars(businessPortionIndirect)}</div>
            <div class="line">Depreciation: $${toDollars(depreciation)}</div>
            <div class="line">Total calculated expenses: $${toDollars(totalExpenses)}</div>
            <div class="line">Carryover from prior year: $${toDollars(carryoverPrior)}</div>
            <div class="line total">36. Allowable expenses (limited to gross income): $${toDollars(allowableExpenses)}</div>
            ${
              carryoverNext > 0
                ? `<div class="line note">Carryover to next year: $${toDollars(carryoverNext)}</div>`
                : ''
            }
            <div class="line note">Enter on Schedule C, line 30</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>Home Office Deduction Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Requirements:</strong></div>
            <div class="line sub-note">Regular and exclusive use for business</div>
            <div class="line sub-note">Principal place of business OR meet clients/customers</div>
            <div class="line sub-note">Separate structure used for business also qualifies</div>
            <div class="line"><strong>Simplified Method Alternative:</strong></div>
            <div class="line sub-note">$5 per square foot, up to 300 sq ft maximum</div>
            <div class="line sub-note">Maximum deduction: $1,500</div>
            <div class="line sub-note">No depreciation deduction or carryover</div>
            <div class="line"><strong>Regular Method (Form 8829):</strong></div>
            <div class="line sub-note">Limited to gross income from business</div>
            <div class="line sub-note">Excess expenses carry forward</div>
            <div class="line sub-note">Depreciation recapture may apply on sale</div>
          </div>
        </div>
      </div>
    `;
  };

  // Schedule K-1 Summary - Partner/Shareholder/Beneficiary Share of Income
  const generateScheduleK1 = () => {
    const { scheduleK1Data, scheduleEData, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Combine K-1 data from both sources
    const partnershipK1s = scheduleK1Data?.partnershipK1s ?? [];
    const sCorpK1s = scheduleK1Data?.sCorpK1s ?? [];
    const estateK1s = scheduleK1Data?.estateK1s ?? scheduleEData?.estateK1s ?? [];

    // Also check scheduleEData for partnership K-1s
    const scheduleEPartnershipK1s = scheduleEData?.partnershipK1s ?? [];

    // Calculate totals
    const partnershipTotals = partnershipK1s.reduce(
      (acc, k1) => ({
        ordinaryIncome: acc.ordinaryIncome + (k1.ordinaryBusinessIncome ?? 0),
        rentalIncome:
          acc.rentalIncome + (k1.netRentalRealEstateIncome ?? 0) + (k1.otherNetRentalIncome ?? 0),
        interestDividends:
          acc.interestDividends + (k1.interestIncome ?? 0) + (k1.ordinaryDividends ?? 0),
        capitalGains:
          acc.capitalGains + (k1.netShortTermCapitalGain ?? 0) + (k1.netLongTermCapitalGain ?? 0),
        guaranteedPayments: acc.guaranteedPayments + (k1.guaranteedPayments ?? 0),
        distributions: acc.distributions + (k1.distributions ?? 0),
        foreignTaxes: acc.foreignTaxes + (k1.foreignTaxesPaid ?? 0),
      }),
      {
        ordinaryIncome: 0,
        rentalIncome: 0,
        interestDividends: 0,
        capitalGains: 0,
        guaranteedPayments: 0,
        distributions: 0,
        foreignTaxes: 0,
      }
    );

    const sCorpTotals = sCorpK1s.reduce(
      (acc, k1) => ({
        ordinaryIncome: acc.ordinaryIncome + (k1.ordinaryBusinessIncome ?? 0),
        rentalIncome:
          acc.rentalIncome + (k1.netRentalRealEstateIncome ?? 0) + (k1.otherNetRentalIncome ?? 0),
        interestDividends:
          acc.interestDividends + (k1.interestIncome ?? 0) + (k1.ordinaryDividends ?? 0),
        capitalGains:
          acc.capitalGains + (k1.netShortTermCapitalGain ?? 0) + (k1.netLongTermCapitalGain ?? 0),
        distributions: acc.distributions + (k1.distributions ?? 0),
        foreignTaxes: acc.foreignTaxes + (k1.foreignTaxesPaid ?? 0),
      }),
      {
        ordinaryIncome: 0,
        rentalIncome: 0,
        interestDividends: 0,
        capitalGains: 0,
        distributions: 0,
        foreignTaxes: 0,
      }
    );

    // Estate K-1s can come from two sources with different property names
    // Use type-safe property access with fallbacks
    const estateTotals = (estateK1s as Array<Record<string, unknown>>).reduce(
      (
        acc: {
          ordinaryIncome: number;
          rentalIncome: number;
          interestDividends: number;
          capitalGains: number;
          foreignTaxes: number;
        },
        k1: Record<string, unknown>
      ) => {
        const k1Any = k1;
        return {
          ordinaryIncome:
            acc.ordinaryIncome +
            ((k1Any.ordinaryBusinessIncome as number) ?? (k1Any.ordinaryIncome as number) ?? 0),
          rentalIncome:
            acc.rentalIncome +
            ((k1Any.netRentalRealEstateIncome as number) ?? (k1Any.rentalIncome as number) ?? 0) +
            ((k1Any.otherRentalIncome as number) ?? 0),
          interestDividends:
            acc.interestDividends +
            ((k1Any.interestIncome as number) ?? 0) +
            ((k1Any.ordinaryDividends as number) ?? 0),
          capitalGains:
            acc.capitalGains +
            ((k1Any.netShortTermCapitalGain as number) ?? 0) +
            ((k1Any.netLongTermCapitalGain as number) ?? (k1Any.capitalGains as number) ?? 0),
          foreignTaxes: acc.foreignTaxes + ((k1Any.foreignTaxesPaid as number) ?? 0),
        };
      },
      { ordinaryIncome: 0, rentalIncome: 0, interestDividends: 0, capitalGains: 0, foreignTaxes: 0 }
    );

    return `
      <div class="tax-form schedule-k1">
        <div class="form-header">
          <h1>Schedule K-1 Summary</h1>
          <p>Partner's/Shareholder's/Beneficiary's Share of Income, Deductions, Credits</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="taxpayer-info">
          <div class="line">Taxpayer: ${personalInfo.firstName} ${personalInfo.lastName}</div>
          <div class="line">SSN: ${personalInfo.ssn}</div>
        </div>

        ${
          partnershipK1s.length > 0
            ? `
        <div class="partnership-section">
          <h2>Partnership K-1s (Form 1065)</h2>
          ${partnershipK1s
            .map(
              (k1, idx) => `
            <div class="k1-entity">
              <h3>Partnership ${idx + 1}: ${k1.entityName}</h3>
              <div class="line-items">
                <div class="line">EIN: ${k1.entityEIN || 'N/A'}</div>
                <div class="line">Partner Type: ${k1.partnerType === 'general' ? 'General Partner' : k1.partnerType === 'limited' ? 'Limited Partner' : 'LLC Member'}</div>
                ${k1.profitSharePercent ? `<div class="line">Profit Share: ${k1.profitSharePercent}%</div>` : ''}
                <div class="line note"><strong>Part III - Partner's Share of Current Year Income:</strong></div>
                <div class="line">Box 1 - Ordinary business income: $${toDollars(k1.ordinaryBusinessIncome ?? 0)}</div>
                <div class="line">Box 2 - Net rental real estate income: $${toDollars(k1.netRentalRealEstateIncome ?? 0)}</div>
                <div class="line">Box 3 - Other net rental income: $${toDollars(k1.otherNetRentalIncome ?? 0)}</div>
                <div class="line">Box 4 - Guaranteed payments: $${toDollars(k1.guaranteedPayments ?? 0)}</div>
                <div class="line">Box 5 - Interest income: $${toDollars(k1.interestIncome ?? 0)}</div>
                <div class="line">Box 6a - Ordinary dividends: $${toDollars(k1.ordinaryDividends ?? 0)}</div>
                <div class="line">Box 6b - Qualified dividends: $${toDollars(k1.qualifiedDividends ?? 0)}</div>
                <div class="line">Box 7 - Royalties: $${toDollars(k1.royalties ?? 0)}</div>
                <div class="line">Box 8 - Net short-term capital gain: $${toDollars(k1.netShortTermCapitalGain ?? 0)}</div>
                <div class="line">Box 9a - Net long-term capital gain: $${toDollars(k1.netLongTermCapitalGain ?? 0)}</div>
                <div class="line">Box 10 - Net section 1231 gain: $${toDollars(k1.netSection1231Gain ?? 0)}</div>
                <div class="line">Box 11 - Other income: $${toDollars(k1.otherIncome ?? 0)}</div>
                ${k1.section179Deduction ? `<div class="line">Box 12 - Section 179 deduction: $${toDollars(k1.section179Deduction)}</div>` : ''}
                ${k1.selfEmploymentEarnings ? `<div class="line">Box 14 - Self-employment earnings: $${toDollars(k1.selfEmploymentEarnings)}</div>` : ''}
                ${k1.foreignTaxesPaid ? `<div class="line">Box 16 - Foreign taxes paid: $${toDollars(k1.foreignTaxesPaid)}</div>` : ''}
                ${k1.distributions ? `<div class="line">Box 19 - Distributions: $${toDollars(k1.distributions)}</div>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
          <div class="k1-totals">
            <h3>Partnership K-1 Totals</h3>
            <div class="line-items">
              <div class="line">Total ordinary business income: $${toDollars(partnershipTotals.ordinaryIncome)}</div>
              <div class="line">Total rental income: $${toDollars(partnershipTotals.rentalIncome)}</div>
              <div class="line">Total interest & dividends: $${toDollars(partnershipTotals.interestDividends)}</div>
              <div class="line">Total capital gains: $${toDollars(partnershipTotals.capitalGains)}</div>
              <div class="line">Total guaranteed payments: $${toDollars(partnershipTotals.guaranteedPayments)}</div>
              <div class="line">Total distributions: $${toDollars(partnershipTotals.distributions)}</div>
              ${partnershipTotals.foreignTaxes > 0 ? `<div class="line">Total foreign taxes paid: $${toDollars(partnershipTotals.foreignTaxes)}</div>` : ''}
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          sCorpK1s.length > 0
            ? `
        <div class="scorp-section">
          <h2>S Corporation K-1s (Form 1120-S)</h2>
          ${sCorpK1s
            .map(
              (k1, idx) => `
            <div class="k1-entity">
              <h3>S Corporation ${idx + 1}: ${k1.entityName}</h3>
              <div class="line-items">
                <div class="line">EIN: ${k1.entityEIN || 'N/A'}</div>
                ${k1.shareholderPercent ? `<div class="line">Shareholder Ownership: ${k1.shareholderPercent}%</div>` : ''}
                <div class="line note"><strong>Part III - Shareholder's Share:</strong></div>
                <div class="line">Box 1 - Ordinary business income: $${toDollars(k1.ordinaryBusinessIncome ?? 0)}</div>
                <div class="line">Box 2 - Net rental real estate income: $${toDollars(k1.netRentalRealEstateIncome ?? 0)}</div>
                <div class="line">Box 3 - Other net rental income: $${toDollars(k1.otherNetRentalIncome ?? 0)}</div>
                <div class="line">Box 4 - Interest income: $${toDollars(k1.interestIncome ?? 0)}</div>
                <div class="line">Box 5a - Ordinary dividends: $${toDollars(k1.ordinaryDividends ?? 0)}</div>
                <div class="line">Box 5b - Qualified dividends: $${toDollars(k1.qualifiedDividends ?? 0)}</div>
                <div class="line">Box 6 - Royalties: $${toDollars(k1.royalties ?? 0)}</div>
                <div class="line">Box 7 - Net short-term capital gain: $${toDollars(k1.netShortTermCapitalGain ?? 0)}</div>
                <div class="line">Box 8a - Net long-term capital gain: $${toDollars(k1.netLongTermCapitalGain ?? 0)}</div>
                <div class="line">Box 9 - Net section 1231 gain: $${toDollars(k1.netSection1231Gain ?? 0)}</div>
                <div class="line">Box 10 - Other income: $${toDollars(k1.otherIncome ?? 0)}</div>
                ${k1.section179Deduction ? `<div class="line">Box 11 - Section 179 deduction: $${toDollars(k1.section179Deduction)}</div>` : ''}
                ${k1.foreignTaxesPaid ? `<div class="line">Box 14 - Foreign taxes paid: $${toDollars(k1.foreignTaxesPaid)}</div>` : ''}
                ${k1.distributions ? `<div class="line">Box 16 - Distributions: $${toDollars(k1.distributions)}</div>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
          <div class="k1-totals">
            <h3>S Corporation K-1 Totals</h3>
            <div class="line-items">
              <div class="line">Total ordinary business income: $${toDollars(sCorpTotals.ordinaryIncome)}</div>
              <div class="line">Total rental income: $${toDollars(sCorpTotals.rentalIncome)}</div>
              <div class="line">Total interest & dividends: $${toDollars(sCorpTotals.interestDividends)}</div>
              <div class="line">Total capital gains: $${toDollars(sCorpTotals.capitalGains)}</div>
              <div class="line">Total distributions: $${toDollars(sCorpTotals.distributions)}</div>
              ${sCorpTotals.foreignTaxes > 0 ? `<div class="line">Total foreign taxes paid: $${toDollars(sCorpTotals.foreignTaxes)}</div>` : ''}
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          estateK1s.length > 0
            ? `
        <div class="estate-section">
          <h2>Estate/Trust K-1s (Form 1041)</h2>
          ${estateK1s
            .map((k1, idx) => {
              const k1Data = k1 as Record<string, unknown>;
              const estateName = (k1Data.estateName as string) || 'Unknown';
              const estateEIN = (k1Data.estateEIN as string) || (k1Data.ein as string) || 'N/A';
              const beneficiaryType = k1Data.beneficiaryType as string | undefined;
              const interestIncome = (k1Data.interestIncome as number) ?? 0;
              const ordinaryDividends = (k1Data.ordinaryDividends as number) ?? 0;
              const qualifiedDividends = (k1Data.qualifiedDividends as number) ?? 0;
              const netShortTermCapitalGain = (k1Data.netShortTermCapitalGain as number) ?? 0;
              const netLongTermCapitalGain =
                (k1Data.netLongTermCapitalGain as number) ?? (k1Data.capitalGains as number) ?? 0;
              const ordinaryBusinessIncome =
                (k1Data.ordinaryBusinessIncome as number) ?? (k1Data.ordinaryIncome as number) ?? 0;
              const netRentalRealEstateIncome =
                (k1Data.netRentalRealEstateIncome as number) ??
                (k1Data.rentalIncome as number) ??
                0;
              const otherRentalIncome = (k1Data.otherRentalIncome as number) ?? 0;
              const foreignTaxesPaid = (k1Data.foreignTaxesPaid as number) ?? 0;
              return `
            <div class="k1-entity">
              <h3>Estate/Trust ${idx + 1}: ${estateName}</h3>
              <div class="line-items">
                <div class="line">EIN: ${estateEIN}</div>
                <div class="line">Beneficiary Type: ${beneficiaryType ? (beneficiaryType === 'simple' ? 'Simple Trust' : 'Complex Trust/Estate') : 'N/A'}</div>
                <div class="line note"><strong>Part III - Beneficiary's Share:</strong></div>
                <div class="line">Box 1 - Interest income: $${toDollars(interestIncome)}</div>
                <div class="line">Box 2a - Ordinary dividends: $${toDollars(ordinaryDividends)}</div>
                ${qualifiedDividends > 0 ? `<div class="line">Box 2b - Qualified dividends: $${toDollars(qualifiedDividends)}</div>` : ''}
                <div class="line">Box 3 - Net short-term capital gain: $${toDollars(netShortTermCapitalGain)}</div>
                <div class="line">Box 4a - Net long-term capital gain: $${toDollars(netLongTermCapitalGain)}</div>
                ${ordinaryBusinessIncome > 0 ? `<div class="line">Box 6 - Ordinary business income: $${toDollars(ordinaryBusinessIncome)}</div>` : ''}
                <div class="line">Box 7 - Net rental real estate income: $${toDollars(netRentalRealEstateIncome)}</div>
                ${otherRentalIncome > 0 ? `<div class="line">Box 8 - Other rental income: $${toDollars(otherRentalIncome)}</div>` : ''}
                ${foreignTaxesPaid > 0 ? `<div class="line">Box 14 - Foreign taxes paid: $${toDollars(foreignTaxesPaid)}</div>` : ''}
              </div>
            </div>
          `;
            })
            .join('')}
          <div class="k1-totals">
            <h3>Estate/Trust K-1 Totals</h3>
            <div class="line-items">
              <div class="line">Total ordinary income: $${toDollars(estateTotals.ordinaryIncome)}</div>
              <div class="line">Total rental income: $${toDollars(estateTotals.rentalIncome)}</div>
              <div class="line">Total interest & dividends: $${toDollars(estateTotals.interestDividends)}</div>
              <div class="line">Total capital gains: $${toDollars(estateTotals.capitalGains)}</div>
              ${estateTotals.foreignTaxes > 0 ? `<div class="line">Total foreign taxes paid: $${toDollars(estateTotals.foreignTaxes)}</div>` : ''}
            </div>
          </div>
        </div>
        `
            : ''
        }

        <div class="grand-totals">
          <h2>Grand Total - All K-1 Income</h2>
          <div class="line-items">
            <div class="line total">Total Ordinary Business Income: $${toDollars(partnershipTotals.ordinaryIncome + sCorpTotals.ordinaryIncome + estateTotals.ordinaryIncome)}</div>
            <div class="line total">Total Rental Income: $${toDollars(partnershipTotals.rentalIncome + sCorpTotals.rentalIncome + estateTotals.rentalIncome)}</div>
            <div class="line total">Total Interest & Dividends: $${toDollars(partnershipTotals.interestDividends + sCorpTotals.interestDividends + estateTotals.interestDividends)}</div>
            <div class="line total">Total Capital Gains: $${toDollars(partnershipTotals.capitalGains + sCorpTotals.capitalGains + estateTotals.capitalGains)}</div>
            <div class="line note">K-1 income flows to Schedule E and other applicable schedules</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>Schedule K-1 Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Form Types:</strong></div>
            <div class="line sub-note">Form 1065 K-1: Partnership (general/limited partners, LLC members)</div>
            <div class="line sub-note">Form 1120-S K-1: S Corporation shareholders</div>
            <div class="line sub-note">Form 1041 K-1: Estate/Trust beneficiaries</div>
            <div class="line"><strong>Where K-1 Income is Reported:</strong></div>
            <div class="line sub-note">Ordinary income → Schedule E, Part II</div>
            <div class="line sub-note">Rental income → Schedule E, Part II</div>
            <div class="line sub-note">Interest/Dividends → Schedule B</div>
            <div class="line sub-note">Capital gains → Schedule D</div>
            <div class="line sub-note">Self-employment → Schedule SE (partnerships only)</div>
            <div class="line sub-note">Foreign taxes → Form 1116 or Schedule 3</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8959 - Additional Medicare Tax
  const generateForm8959 = () => {
    const { form8959Data, additionalTaxesData, selfEmploymentData, personalInfo, incomeData } =
      formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Get threshold based on filing status
    const filingStatus = personalInfo.filingStatus;
    const thresholds: Record<string, number> = {
      single: 20000000,
      married_filing_jointly: 25000000,
      married_filing_separately: 12500000,
      head_of_household: 20000000,
      qualifying_widow: 25000000,
    };
    const threshold = form8959Data?.threshold ?? thresholds[filingStatus] ?? 20000000;

    // Part I - Additional Medicare Tax on Medicare Wages
    const medicareWages = form8959Data?.medicareWages ?? parseFloat(incomeData?.wages || '0') * 100;
    const unreportedTips = form8959Data?.unreportedTips ?? 0;
    const wagesNotSubject = form8959Data?.wagesNotSubjectToWithholding ?? 0;
    const totalMedicareWages =
      form8959Data?.totalMedicareWages ?? medicareWages + unreportedTips + wagesNotSubject;

    const excessWages =
      form8959Data?.excessOverThreshold ?? Math.max(0, totalMedicareWages - threshold);
    const additionalMedicareOnWages =
      form8959Data?.additionalMedicareOnWages ?? Math.round(excessWages * 0.009);

    // Part II - Additional Medicare Tax on Self-Employment Income
    const seIncome =
      form8959Data?.selfEmploymentIncome ?? (selfEmploymentData?.netEarningsFromSE ?? 0) * 100;
    const totalWagesAndSE = form8959Data?.totalWagesAndSE ?? totalMedicareWages + seIncome;

    // SE tax only applies to amount over threshold after considering wages
    const wagesUsedAgainstThreshold = Math.min(totalMedicareWages, threshold);
    const remainingThreshold = threshold - wagesUsedAgainstThreshold;
    const excessSE = form8959Data?.excessWagesAndSE ?? Math.max(0, seIncome - remainingThreshold);
    const additionalMedicareOnSE =
      form8959Data?.additionalMedicareOnSE ?? Math.round(excessSE * 0.009);

    // Part III - Railroad Retirement (typically 0 for most taxpayers)
    const rrta = form8959Data?.rrta ?? 0;
    const additionalMedicareOnRRTA = form8959Data?.additionalMedicareOnRRTA ?? 0;

    // Part IV - Total
    const totalAdditionalMedicare =
      form8959Data?.totalAdditionalMedicareTax ??
      additionalTaxesData?.additionalMedicareTax ??
      additionalMedicareOnWages + additionalMedicareOnSE + additionalMedicareOnRRTA;

    // Part V - Withholding Reconciliation
    const medicareWithheld = form8959Data?.medicareWithheld ?? 0;
    const regularMedicareRate = 0.0145;
    const regularMedicareOnWages =
      form8959Data?.regularMedicareOnWages ?? Math.round(medicareWages * regularMedicareRate);
    const additionalMedicareWithheld =
      form8959Data?.additionalMedicareWithheld ??
      Math.max(0, medicareWithheld - regularMedicareOnWages);

    return `
      <div class="tax-form form-8959">
        <div class="form-header">
          <h1>Form 8959</h1>
          <p>Additional Medicare Tax</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="threshold-info">
          <div class="line">Filing Status: ${filingStatus.replace(/_/g, ' ')}</div>
          <div class="line">Threshold for Additional Medicare Tax: $${toDollars(threshold)}</div>
        </div>

        <div class="part-1">
          <h2>Part I - Additional Medicare Tax on Medicare Wages</h2>

          <div class="line-items">
            <div class="line">1. Medicare wages and tips from Form W-2, box 5: $${toDollars(medicareWages)}</div>
            <div class="line">2. Unreported tips from Form 4137, line 6: $${toDollars(unreportedTips)}</div>
            <div class="line">3. Wages from Form 8919, line 6: $${toDollars(wagesNotSubject)}</div>
            <div class="line">4. Add lines 1-3: $${toDollars(totalMedicareWages)}</div>
            <div class="line">5. Threshold amount: $${toDollars(threshold)}</div>
            <div class="line">6. Subtract line 5 from line 4 (if zero or less, enter -0-): $${toDollars(excessWages)}</div>
            <div class="line total">7. Additional Medicare Tax on wages (line 6 × 0.9%): $${toDollars(additionalMedicareOnWages)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Additional Medicare Tax on Self-Employment Income</h2>

          <div class="line-items">
            <div class="line">8. Self-employment income from Schedule SE, line 6: $${toDollars(seIncome)}</div>
            <div class="line">9. Threshold amount: $${toDollars(threshold)}</div>
            <div class="line">10. Enter line 4 (Medicare wages): $${toDollars(totalMedicareWages)}</div>
            <div class="line">11. Subtract line 10 from line 9 (remaining threshold): $${toDollars(remainingThreshold)}</div>
            <div class="line">12. Self-employment income over remaining threshold: $${toDollars(excessSE)}</div>
            <div class="line total">13. Additional Medicare Tax on SE (line 12 × 0.9%): $${toDollars(additionalMedicareOnSE)}</div>
          </div>
        </div>

        ${
          rrta > 0
            ? `
        <div class="part-3">
          <h2>Part III - Additional Medicare Tax on Railroad Retirement (RRTA)</h2>

          <div class="line-items">
            <div class="line">14. RRTA compensation: $${toDollars(rrta)}</div>
            <div class="line total">19. Additional Medicare Tax on RRTA: $${toDollars(additionalMedicareOnRRTA)}</div>
          </div>
        </div>
        `
            : ''
        }

        <div class="part-4">
          <h2>Part IV - Total Additional Medicare Tax</h2>

          <div class="line-items">
            <div class="line">Part I (wages): $${toDollars(additionalMedicareOnWages)}</div>
            <div class="line">Part II (self-employment): $${toDollars(additionalMedicareOnSE)}</div>
            ${rrta > 0 ? `<div class="line">Part III (RRTA): $${toDollars(additionalMedicareOnRRTA)}</div>` : ''}
            <div class="line total highlight">18. Total Additional Medicare Tax: $${toDollars(totalAdditionalMedicare)}</div>
            <div class="line note">Enter on Schedule 2, line 11</div>
          </div>
        </div>

        <div class="part-5">
          <h2>Part V - Withholding Reconciliation</h2>

          <div class="line-items">
            <div class="line">19. Medicare tax withheld from W-2, box 6: $${toDollars(medicareWithheld)}</div>
            <div class="line">20. Regular Medicare tax (1.45% × wages): $${toDollars(regularMedicareOnWages)}</div>
            <div class="line">21. Additional Medicare tax withheld (line 19 - line 20): $${toDollars(additionalMedicareWithheld)}</div>
            <div class="line note">If line 21 exceeds line 18, the difference is added to withholding on Form 1040</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Additional Medicare Tax Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Tax Rate:</strong> 0.9% on income over threshold</div>
            <div class="line"><strong>Thresholds:</strong></div>
            <div class="line sub-note">Single / Head of Household: $200,000</div>
            <div class="line sub-note">Married Filing Jointly: $250,000</div>
            <div class="line sub-note">Married Filing Separately: $125,000</div>
            <div class="line"><strong>Income Subject to Tax:</strong></div>
            <div class="line sub-note">Medicare wages (W-2 Box 5)</div>
            <div class="line sub-note">Self-employment income</div>
            <div class="line sub-note">RRTA compensation</div>
            <div class="line"><strong>Withholding:</strong></div>
            <div class="line sub-note">Employers withhold 0.9% on wages over $200,000</div>
            <div class="line sub-note">No withholding adjustment for filing status</div>
            <div class="line sub-note">May need to pay with return or increase estimated payments</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8960 - Net Investment Income Tax
  const generateForm8960 = () => {
    const { form8960Data, additionalTaxesData, personalInfo, incomeData, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Get threshold based on filing status
    const filingStatus = personalInfo.filingStatus;
    const thresholds: Record<string, number> = {
      single: 20000000,
      married_filing_jointly: 25000000,
      married_filing_separately: 12500000,
      head_of_household: 20000000,
      qualifying_widow: 25000000,
    };
    const threshold = form8960Data?.threshold ?? thresholds[filingStatus] ?? 20000000;

    // Part I - Investment Income
    const taxableInterest =
      form8960Data?.taxableInterest ?? parseFloat(incomeData?.interestIncome || '0') * 100;
    const ordinaryDividends =
      form8960Data?.ordinaryDividends ?? parseFloat(incomeData?.dividends || '0') * 100;
    const annuities = form8960Data?.annuities ?? 0;
    const rentalIncome =
      form8960Data?.rentalRoyaltyPartnershipSCorpTrust ??
      parseFloat(incomeData?.rentalIncome || '0') * 100;
    const adjustmentRental = form8960Data?.adjustmentFromRentalActivity ?? 0;
    const netRentalIncome = form8960Data?.netRentalIncome ?? rentalIncome + adjustmentRental;

    const netGainDisposition =
      form8960Data?.netGainFromDisposition ?? parseFloat(incomeData?.capitalGains || '0') * 100;
    const adjustmentsGain = form8960Data?.adjustmentsToNetGain ?? 0;
    const netGainForNIIT = form8960Data?.netGainForNIIT ?? netGainDisposition + adjustmentsGain;

    const otherInvestmentIncome = form8960Data?.otherInvestmentIncome ?? 0;
    const modifications = form8960Data?.modificationsToInvestmentIncome ?? 0;

    const totalInvestmentIncome =
      form8960Data?.totalInvestmentIncome ??
      taxableInterest +
        ordinaryDividends +
        annuities +
        netRentalIncome +
        netGainForNIIT +
        otherInvestmentIncome +
        modifications;

    // Part II - Investment Expenses
    const investmentInterest = form8960Data?.investmentInterestExpense ?? 0;
    const saltDeduction = form8960Data?.stateAndLocalTaxes ?? 0;
    const miscExpenses = form8960Data?.miscInvestmentExpenses ?? 0;
    const totalDeductions =
      form8960Data?.totalDeductions ?? investmentInterest + saltDeduction + miscExpenses;

    // Part III - Tax Computation
    const netInvestmentIncome =
      form8960Data?.netInvestmentIncome ?? Math.max(0, totalInvestmentIncome - totalDeductions);
    const modifiedAGI = form8960Data?.modifiedAGI ?? taxResult.adjustedGrossIncome * 100;
    const excessAGI = form8960Data?.excessAGIOverThreshold ?? Math.max(0, modifiedAGI - threshold);
    const smallerAmount =
      form8960Data?.smallerOfNIIOrExcess ?? Math.min(netInvestmentIncome, excessAGI);
    const niitTax =
      form8960Data?.niitTax ?? additionalTaxesData?.niit ?? Math.round(smallerAmount * 0.038);

    return `
      <div class="tax-form form-8960">
        <div class="form-header">
          <h1>Form 8960</h1>
          <p>Net Investment Income Tax - Individuals, Estates, and Trusts</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="threshold-info">
          <div class="line">Filing Status: ${filingStatus.replace(/_/g, ' ')}</div>
          <div class="line">MAGI Threshold: $${toDollars(threshold)}</div>
        </div>

        <div class="part-1">
          <h2>Part I - Investment Income</h2>

          <div class="line-items">
            <div class="line">1. Taxable interest: $${toDollars(taxableInterest)}</div>
            <div class="line">2. Ordinary dividends: $${toDollars(ordinaryDividends)}</div>
            <div class="line">3. Annuities (taxable portion): $${toDollars(annuities)}</div>
            <div class="line">4a. Rental, royalty, partnership, S Corp, trust: $${toDollars(rentalIncome)}</div>
            ${adjustmentRental !== 0 ? `<div class="line">4b. Adjustment from rental activities: $${toDollars(adjustmentRental)}</div>` : ''}
            <div class="line">4c. Net rental and other income: $${toDollars(netRentalIncome)}</div>
            <div class="line">5a. Net gain from disposition of property: $${toDollars(netGainDisposition)}</div>
            ${adjustmentsGain !== 0 ? `<div class="line">5c. Adjustments to net gain: $${toDollars(adjustmentsGain)}</div>` : ''}
            <div class="line">5d. Net gain included in NIIT: $${toDollars(netGainForNIIT)}</div>
            ${otherInvestmentIncome > 0 ? `<div class="line">6. Other modifications to investment income: $${toDollars(otherInvestmentIncome)}</div>` : ''}
            ${modifications !== 0 ? `<div class="line">7. Modifications: $${toDollars(modifications)}</div>` : ''}
            <div class="line total">8. Total investment income: $${toDollars(totalInvestmentIncome)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Investment Expenses Allocable to Investment Income</h2>

          <div class="line-items">
            ${investmentInterest > 0 ? `<div class="line">9a. Investment interest expense: $${toDollars(investmentInterest)}</div>` : ''}
            ${saltDeduction > 0 ? `<div class="line">9b. State and local income taxes: $${toDollars(saltDeduction)}</div>` : ''}
            ${miscExpenses > 0 ? `<div class="line">9c. Miscellaneous investment expenses: $${toDollars(miscExpenses)}</div>` : ''}
            <div class="line">9d. Total investment expenses: $${toDollars(totalDeductions)}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Tax Computation</h2>

          <div class="line-items">
            <div class="line">12. Net investment income (line 8 minus line 9d): $${toDollars(netInvestmentIncome)}</div>
            <div class="line">13. Modified adjusted gross income: $${toDollars(modifiedAGI)}</div>
            <div class="line">14. Threshold (based on filing status): $${toDollars(threshold)}</div>
            <div class="line">15. MAGI over threshold (line 13 - line 14): $${toDollars(excessAGI)}</div>
            <div class="line">16. Smaller of line 12 or line 15: $${toDollars(smallerAmount)}</div>
            <div class="line total highlight">17. Net Investment Income Tax (line 16 × 3.8%): $${toDollars(niitTax)}</div>
            ${
              niitTax > 0
                ? `<div class="line note">Enter on Schedule 2, line 12</div>`
                : `<div class="line note">No NIIT liability (NII or excess MAGI is zero)</div>`
            }
          </div>
        </div>

        <div class="summary">
          <h2>NIIT Summary</h2>
          <div class="line-items">
            <div class="line">Net Investment Income: $${toDollars(netInvestmentIncome)}</div>
            <div class="line">MAGI over Threshold: $${toDollars(excessAGI)}</div>
            <div class="line">Amount Subject to 3.8% Tax: $${toDollars(smallerAmount)}</div>
            <div class="line total">Net Investment Income Tax: $${toDollars(niitTax)}</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Net Investment Income Tax Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Tax Rate:</strong> 3.8% on lesser of NII or excess MAGI</div>
            <div class="line"><strong>MAGI Thresholds:</strong></div>
            <div class="line sub-note">Single / Head of Household: $200,000</div>
            <div class="line sub-note">Married Filing Jointly / QW: $250,000</div>
            <div class="line sub-note">Married Filing Separately: $125,000</div>
            <div class="line"><strong>Net Investment Income Includes:</strong></div>
            <div class="line sub-note">Interest, dividends, capital gains</div>
            <div class="line sub-note">Rental and royalty income</div>
            <div class="line sub-note">Passive business income (non-material participation)</div>
            <div class="line sub-note">Gains from disposition of passive activities</div>
            <div class="line"><strong>NOT Included in NII:</strong></div>
            <div class="line sub-note">Wages and self-employment income</div>
            <div class="line sub-note">Active business income (material participation)</div>
            <div class="line sub-note">Tax-exempt interest</div>
            <div class="line sub-note">Distributions from qualified retirement plans</div>
            <div class="line sub-note">Social Security benefits</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8812 - Additional Child Tax Credit
  const generateForm8812 = () => {
    const { form8812Data, additionalCreditsData, personalInfo, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Child Tax Credit calculation
    const qualifyingChildren = form8812Data?.qualifyingChildren ?? personalInfo.dependents ?? 0;
    const otherDependents = form8812Data?.otherDependents ?? 0;
    const ctcPerChild = form8812Data?.childTaxCreditPerChild ?? 200000; // $2,000 for 2025
    const odcPerDependent = form8812Data?.otherDependentCreditEach ?? 50000; // $500 for 2025

    const totalCTC = form8812Data?.totalChildTaxCredit ?? qualifyingChildren * ctcPerChild;
    const totalODC = form8812Data?.totalOtherDependentCredit ?? otherDependents * odcPerDependent;
    const combinedCredit = form8812Data?.combinedCredit ?? totalCTC + totalODC;

    // Part II-A - Additional Child Tax Credit (refundable portion)
    const earnedIncome = form8812Data?.earnedIncome ?? taxResult.adjustedGrossIncome * 100;
    const threshold = form8812Data?.earnedIncomeThreshold ?? 250000; // $2,500
    const excessEarnedIncome =
      form8812Data?.earnedIncomeOverThreshold ?? Math.max(0, earnedIncome - threshold);
    const multipliedAmount =
      form8812Data?.multipliedAmount ?? Math.round(excessEarnedIncome * 0.15);

    // Credit limitation
    const taxLiability = form8812Data?.taxLiability ?? taxResult.federalTax * 100;
    const nonrefundableCTC =
      form8812Data?.nonrefundableCTC ?? Math.min(combinedCredit, taxLiability);
    const maxRefundablePerChild = 170000; // $1,700 max refundable per child for 2025
    const maxRefundable = qualifyingChildren * maxRefundablePerChild;
    const potentialRefundable = combinedCredit - nonrefundableCTC;
    const additionalCTC =
      form8812Data?.additionalChildTaxCredit ??
      additionalCreditsData?.additionalChildTaxCredit ??
      Math.min(potentialRefundable, multipliedAmount, maxRefundable);

    // Part II-B - Three or more children (alternative calculation)
    const ssTaxes = form8812Data?.socialSecurityTaxes ?? 0;
    const eic = form8812Data?.earnedIncomeCredit ?? 0;
    const excessSSOverEIC = form8812Data?.excessSSOverEIC ?? Math.max(0, ssTaxes - eic);
    const largerAmount =
      form8812Data?.largerRefundableAmount ?? Math.max(additionalCTC, excessSSOverEIC);

    return `
      <div class="tax-form form-8812">
        <div class="form-header">
          <h1>Form 8812</h1>
          <p>Credits for Qualifying Children and Other Dependents</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Child Tax Credit and Credit for Other Dependents</h2>

          <div class="line-items">
            <div class="line">1. Number of qualifying children under age 17: ${qualifyingChildren}</div>
            <div class="line">2. Child tax credit per child: $${toDollars(ctcPerChild)}</div>
            <div class="line">3. Total child tax credit (line 1 × line 2): $${toDollars(totalCTC)}</div>
            <div class="line">4. Number of other dependents: ${otherDependents}</div>
            <div class="line">5. Credit per other dependent: $${toDollars(odcPerDependent)}</div>
            <div class="line">6. Total other dependent credit (line 4 × line 5): $${toDollars(totalODC)}</div>
            <div class="line total">7. Combined credit (line 3 + line 6): $${toDollars(combinedCredit)}</div>
          </div>
        </div>

        <div class="part-2a">
          <h2>Part II-A - Additional Child Tax Credit (Refundable)</h2>
          <p class="note">For taxpayers with earned income over $2,500</p>

          <div class="line-items">
            <div class="line">8. Earned income: $${toDollars(earnedIncome)}</div>
            <div class="line">9. Threshold amount: $${toDollars(threshold)}</div>
            <div class="line">10. Earned income over threshold (line 8 - line 9): $${toDollars(excessEarnedIncome)}</div>
            <div class="line">11. Multiply line 10 by 15%: $${toDollars(multipliedAmount)}</div>
            <div class="line">12. Tax liability before credits: $${toDollars(taxLiability)}</div>
            <div class="line">13. Nonrefundable CTC (lesser of line 7 or line 12): $${toDollars(nonrefundableCTC)}</div>
            <div class="line">14. Credit remaining (line 7 - line 13): $${toDollars(potentialRefundable)}</div>
            <div class="line">15. Maximum refundable per child: $${toDollars(maxRefundablePerChild)}</div>
            <div class="line">16. Maximum refundable amount: $${toDollars(maxRefundable)}</div>
            <div class="line total highlight">17. Additional Child Tax Credit: $${toDollars(additionalCTC)}</div>
            <div class="line note">Enter on Form 1040, line 28</div>
          </div>
        </div>

        ${
          qualifyingChildren >= 3
            ? `
        <div class="part-2b">
          <h2>Part II-B - Alternative Calculation (Three or More Children)</h2>

          <div class="line-items">
            <div class="line">18. Social Security taxes (including self-employment): $${toDollars(ssTaxes)}</div>
            <div class="line">19. Earned income credit: $${toDollars(eic)}</div>
            <div class="line">20. Excess SS taxes over EIC: $${toDollars(excessSSOverEIC)}</div>
            <div class="line total">21. Larger of line 17 or line 20: $${toDollars(largerAmount)}</div>
          </div>
        </div>
        `
            : ''
        }

        <div class="summary">
          <h2>Credit Summary</h2>
          <div class="line-items">
            <div class="line">Total Child Tax Credit (nonrefundable): $${toDollars(nonrefundableCTC)}</div>
            <div class="line">Additional Child Tax Credit (refundable): $${toDollars(additionalCTC)}</div>
            <div class="line total">Total Credits: $${toDollars(nonrefundableCTC + additionalCTC)}</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Child Tax Credit Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Credit Amounts:</strong></div>
            <div class="line sub-note">Child Tax Credit: $2,000 per qualifying child under 17</div>
            <div class="line sub-note">Credit for Other Dependents: $500 per dependent</div>
            <div class="line sub-note">Maximum refundable ACTC: $1,700 per child</div>
            <div class="line"><strong>Income Limits (Phase-out):</strong></div>
            <div class="line sub-note">Single: Begins at $200,000 AGI</div>
            <div class="line sub-note">Married Filing Jointly: Begins at $400,000 AGI</div>
            <div class="line sub-note">Phase-out: $50 per $1,000 over threshold</div>
            <div class="line"><strong>Qualifying Child Requirements:</strong></div>
            <div class="line sub-note">Under age 17 at end of tax year</div>
            <div class="line sub-note">U.S. citizen, national, or resident alien</div>
            <div class="line sub-note">Valid SSN issued before due date of return</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8995 / 8995-A - Qualified Business Income Deduction
  const generateForm8995 = () => {
    const { form8995Data, businessData, personalInfo, taxResult } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const filingStatus = personalInfo.filingStatus;
    const isSimplified = form8995Data?.useSimplifiedForm ?? true;

    // 2025 thresholds
    const thresholds: Record<string, number> = {
      single: 19195000,
      married_filing_jointly: 38390000,
      married_filing_separately: 19195000,
      head_of_household: 19195000,
      qualifying_widow: 38390000,
    };
    const phaseInRanges: Record<string, number> = {
      single: 5000000,
      married_filing_jointly: 10000000,
      married_filing_separately: 5000000,
      head_of_household: 5000000,
      qualifying_widow: 10000000,
    };
    const threshold = form8995Data?.threshold ?? thresholds[filingStatus] ?? 19195000;
    const phaseInRange = form8995Data?.phaseInRange ?? phaseInRanges[filingStatus] ?? 5000000;

    const taxableIncomeBeforeQBI =
      form8995Data?.taxableIncomeBeforeQBI ?? taxResult.taxableIncome * 100;
    const businesses = form8995Data?.qbiBusinesses ?? [];

    // Default business from Schedule C if no explicit QBI businesses
    const defaultQBI = businessData?.netProfit ? businessData.netProfit * 100 : 0;
    const totalQBI =
      form8995Data?.totalQBI ??
      (businesses.length > 0
        ? businesses.reduce((sum, b) => sum + (b.qualifiedBusinessIncome ?? 0), 0)
        : defaultQBI);

    // QBI deduction calculation
    const qbiDeductionBeforeLimit =
      form8995Data?.qbiDeductionBeforeLimit ?? Math.round(totalQBI * 0.2);
    const netCapitalGain = form8995Data?.netCapitalGain ?? 0;
    const taxableIncomeLimit =
      form8995Data?.taxableIncomeLimit ??
      Math.round((taxableIncomeBeforeQBI - netCapitalGain) * 0.2);
    const qbiDeduction =
      form8995Data?.qbiDeduction ?? Math.min(qbiDeductionBeforeLimit, taxableIncomeLimit);

    // REIT/PTP
    const reitDividends = form8995Data?.reitDividends ?? 0;
    const ptpIncome = form8995Data?.ptpIncome ?? 0;
    const reitPtpDeduction =
      form8995Data?.reitPtpDeduction ?? Math.round((reitDividends + ptpIncome) * 0.2);

    const totalQBIDeduction = form8995Data?.totalQBIDeduction ?? qbiDeduction + reitPtpDeduction;

    return `
      <div class="tax-form form-8995">
        <div class="form-header">
          <h1>Form ${isSimplified ? '8995' : '8995-A'}</h1>
          <p>Qualified Business Income Deduction${isSimplified ? ' (Simplified Computation)' : ''}</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="threshold-info">
          <div class="line">Filing Status: ${filingStatus.replace(/_/g, ' ')}</div>
          <div class="line">Taxable Income Before QBI: $${toDollars(taxableIncomeBeforeQBI)}</div>
          <div class="line">Threshold: $${toDollars(threshold)}</div>
          <div class="line">${
            taxableIncomeBeforeQBI <= threshold
              ? 'Using simplified Form 8995 (income at or below threshold)'
              : taxableIncomeBeforeQBI <= threshold + phaseInRange
                ? 'In phase-in range - W-2 wage/UBIA limits partially apply'
                : 'Above threshold - W-2 wage/UBIA limits fully apply'
          }</div>
        </div>

        ${
          businesses.length > 0
            ? `
        <div class="qbi-businesses">
          <h2>Qualified Business Income</h2>
          ${businesses
            .map(
              (biz, idx) => `
            <div class="business-item">
              <h3>Business ${idx + 1}: ${biz.businessName}</h3>
              <div class="line-items">
                <div class="line">Type: ${
                  biz.businessType === 'sole_prop'
                    ? 'Sole Proprietorship'
                    : biz.businessType === 'partnership'
                      ? 'Partnership'
                      : biz.businessType === 'sCorp'
                        ? 'S Corporation'
                        : biz.businessType === 'REIT'
                          ? 'REIT'
                          : 'PTP'
                }</div>
                ${biz.ein ? `<div class="line">EIN: ${biz.ein}</div>` : ''}
                <div class="line">Qualified Business Income: $${toDollars(biz.qualifiedBusinessIncome ?? 0)}</div>
                ${biz.w2Wages ? `<div class="line">W-2 Wages: $${toDollars(biz.w2Wages)}</div>` : ''}
                ${biz.ubia ? `<div class="line">UBIA of Qualified Property: $${toDollars(biz.ubia)}</div>` : ''}
                ${biz.sstb ? `<div class="line note">⚠️ Specified Service Trade or Business (SSTB)</div>` : ''}
                <div class="line">QBI Component (20%): $${toDollars(biz.qbiComponent ?? Math.round((biz.qualifiedBusinessIncome ?? 0) * 0.2))}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : `
        <div class="qbi-summary">
          <h2>Qualified Business Income</h2>
          <div class="line-items">
            <div class="line">Total QBI from Schedule C/K-1: $${toDollars(totalQBI)}</div>
          </div>
        </div>
        `
        }

        <div class="calculation">
          <h2>QBI Deduction Calculation</h2>

          <div class="line-items">
            <div class="line">1. Total qualified business income: $${toDollars(totalQBI)}</div>
            <div class="line">2. QBI deduction component (20% of line 1): $${toDollars(qbiDeductionBeforeLimit)}</div>
            <div class="line">3. Taxable income before QBI deduction: $${toDollars(taxableIncomeBeforeQBI)}</div>
            <div class="line">4. Net capital gain (if any): $${toDollars(netCapitalGain)}</div>
            <div class="line">5. Taxable income minus net capital gain: $${toDollars(taxableIncomeBeforeQBI - netCapitalGain)}</div>
            <div class="line">6. Income limit (20% of line 5): $${toDollars(taxableIncomeLimit)}</div>
            <div class="line total">7. QBI deduction (smaller of line 2 or 6): $${toDollars(qbiDeduction)}</div>
          </div>
        </div>

        ${
          reitDividends > 0 || ptpIncome > 0
            ? `
        <div class="reit-ptp">
          <h2>REIT Dividends and PTP Income</h2>

          <div class="line-items">
            <div class="line">8. Qualified REIT dividends: $${toDollars(reitDividends)}</div>
            <div class="line">9. Qualified PTP income: $${toDollars(ptpIncome)}</div>
            <div class="line">10. Total (line 8 + line 9): $${toDollars(reitDividends + ptpIncome)}</div>
            <div class="line total">11. REIT/PTP component (20%): $${toDollars(reitPtpDeduction)}</div>
          </div>
        </div>
        `
            : ''
        }

        <div class="total-deduction">
          <h2>Total QBI Deduction</h2>
          <div class="line-items">
            <div class="line">QBI component: $${toDollars(qbiDeduction)}</div>
            ${reitPtpDeduction > 0 ? `<div class="line">REIT/PTP component: $${toDollars(reitPtpDeduction)}</div>` : ''}
            <div class="line total highlight">Total QBI Deduction: $${toDollars(totalQBIDeduction)}</div>
            <div class="line note">Enter on Form 1040, line 13</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 QBI Deduction Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Basic Deduction:</strong> 20% of qualified business income</div>
            <div class="line"><strong>Income Thresholds:</strong></div>
            <div class="line sub-note">Single/HOH/MFS: $191,950</div>
            <div class="line sub-note">Married Filing Jointly: $383,900</div>
            <div class="line"><strong>Phase-in Range:</strong></div>
            <div class="line sub-note">Single/HOH/MFS: $50,000</div>
            <div class="line sub-note">Married Filing Jointly: $100,000</div>
            <div class="line"><strong>Above Threshold Limits:</strong></div>
            <div class="line sub-note">Greater of: 50% of W-2 wages OR</div>
            <div class="line sub-note">25% of W-2 wages + 2.5% of UBIA</div>
            <div class="line"><strong>SSTB Limitation:</strong></div>
            <div class="line sub-note">No deduction above threshold for specified service businesses</div>
            <div class="line sub-note">(health, law, accounting, consulting, athletics, financial services, etc.)</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 4562 - Depreciation and Amortization
  const generateForm4562 = () => {
    const { form4562Data, businessData } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Section 179
    const section179Assets = form4562Data?.section179Assets ?? [];
    const totalSection179Elected =
      form4562Data?.totalSection179Elected ??
      section179Assets.reduce((sum, a) => sum + a.electedCost, 0);
    const section179Limit = form4562Data?.section179Limit ?? 122000000; // $1,220,000 for 2025
    const thresholdReduction = form4562Data?.thresholdReduction ?? 305000000; // $3,050,000 for 2025
    const carryover = form4562Data?.carryoverFromPriorYear ?? 0;
    const businessIncomeLimit =
      form4562Data?.businessIncomeLimit ?? (businessData?.netProfit ?? 0) * 100;
    const section179Deduction =
      form4562Data?.section179Deduction ??
      Math.min(totalSection179Elected + carryover, section179Limit, businessIncomeLimit);
    const section179Carryover =
      form4562Data?.section179CarryoverToNextYear ??
      Math.max(0, totalSection179Elected + carryover - section179Deduction);

    // Part II - Bonus Depreciation
    const bonusAssets = form4562Data?.bonusDepreciationAssets ?? [];
    const totalBonus =
      form4562Data?.totalBonusDepreciation ??
      bonusAssets.reduce((sum, a) => sum + a.bonusAmount, 0);

    // Part III - MACRS
    const macrsAssets = form4562Data?.macrsAssets ?? [];
    const totalMACRS =
      form4562Data?.totalMACRSDepreciation ??
      macrsAssets.reduce((sum, a) => sum + a.currentYearDepreciation, 0);

    // Part IV - Summary
    const listedProperty = form4562Data?.listedPropertyDepreciation ?? 0;
    const amortization = form4562Data?.amortizationDepreciation ?? 0;
    const totalDepreciation =
      form4562Data?.totalDepreciation ??
      section179Deduction + totalBonus + totalMACRS + listedProperty + amortization;

    return `
      <div class="tax-form form-4562">
        <div class="form-header">
          <h1>Form 4562</h1>
          <p>Depreciation and Amortization</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="part-1">
          <h2>Part I - Election to Expense Certain Property (Section 179)</h2>

          <div class="line-items">
            <div class="line">1. Maximum amount (2025): $${toDollars(section179Limit)}</div>
            <div class="line">2. Total cost of section 179 property placed in service: $${toDollars(totalSection179Elected)}</div>
            <div class="line">3. Threshold cost before reduction: $${toDollars(thresholdReduction)}</div>
            <div class="line">4. Carryover from prior year: $${toDollars(carryover)}</div>
            <div class="line">5. Business income limitation: $${toDollars(businessIncomeLimit)}</div>
            <div class="line total">6. Section 179 expense deduction: $${toDollars(section179Deduction)}</div>
            ${
              section179Carryover > 0
                ? `<div class="line note">Carryover to next year: $${toDollars(section179Carryover)}</div>`
                : ''
            }
          </div>

          ${
            section179Assets.length > 0
              ? `
          <div class="asset-list">
            <h3>Section 179 Assets</h3>
            ${section179Assets
              .map(
                (asset, idx) => `
              <div class="asset-item">
                <div class="line">${idx + 1}. ${asset.description}</div>
                <div class="line sub-note">Cost: $${toDollars(asset.cost)} | Elected: $${toDollars(asset.electedCost)}</div>
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }
        </div>

        <div class="part-2">
          <h2>Part II - Special Depreciation Allowance (Bonus Depreciation)</h2>
          <p class="note">2025 bonus depreciation rate: 60% (phasing down from 100% in 2022)</p>

          <div class="line-items">
            ${
              bonusAssets.length > 0
                ? bonusAssets
                    .map(
                      (asset, idx) => `
              <div class="line">${idx + 1}. ${asset.description}: $${toDollars(asset.cost)} × ${asset.bonusPercent}% = $${toDollars(asset.bonusAmount)}</div>
            `
                    )
                    .join('')
                : '<div class="line">No bonus depreciation assets</div>'
            }
            <div class="line total">14. Total special depreciation allowance: $${toDollars(totalBonus)}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - MACRS Depreciation</h2>

          ${
            macrsAssets.length > 0
              ? `
          <table class="depreciation-table">
            <tr>
              <th>Description</th>
              <th>Date Placed</th>
              <th>Cost/Basis</th>
              <th>Recovery Period</th>
              <th>Method</th>
              <th>Current Year</th>
            </tr>
            ${macrsAssets
              .map(
                (asset) => `
              <tr>
                <td>${asset.description}</td>
                <td>${asset.dateAcquired || 'Various'}</td>
                <td>$${toDollars(asset.cost)}</td>
                <td>${asset.recoveryPeriod}</td>
                <td>${asset.method}/${asset.convention}</td>
                <td>$${toDollars(asset.currentYearDepreciation)}</td>
              </tr>
            `
              )
              .join('')}
          </table>
          `
              : `
          <div class="line-items">
            <div class="line">No MACRS assets listed</div>
          </div>
          `
          }

          <div class="line-items">
            <div class="line total">17. Total MACRS depreciation: $${toDollars(totalMACRS)}</div>
          </div>
        </div>

        ${
          listedProperty > 0 || amortization > 0
            ? `
        <div class="part-4-5-6">
          <h2>Parts IV-VI - Listed Property, Amortization</h2>
          <div class="line-items">
            ${listedProperty > 0 ? `<div class="line">Listed property depreciation: $${toDollars(listedProperty)}</div>` : ''}
            ${amortization > 0 ? `<div class="line">Amortization: $${toDollars(amortization)}</div>` : ''}
          </div>
        </div>
        `
            : ''
        }

        <div class="summary">
          <h2>Depreciation Summary</h2>
          <div class="line-items">
            <div class="line">Section 179 expense: $${toDollars(section179Deduction)}</div>
            <div class="line">Special depreciation allowance: $${toDollars(totalBonus)}</div>
            <div class="line">MACRS depreciation: $${toDollars(totalMACRS)}</div>
            ${listedProperty > 0 ? `<div class="line">Listed property: $${toDollars(listedProperty)}</div>` : ''}
            ${amortization > 0 ? `<div class="line">Amortization: $${toDollars(amortization)}</div>` : ''}
            <div class="line total highlight">22. Total depreciation: $${toDollars(totalDepreciation)}</div>
            <div class="line note">Enter on appropriate line of your return (Schedule C line 13, etc.)</div>
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 Depreciation Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Section 179:</strong></div>
            <div class="line sub-note">Maximum deduction: $1,220,000</div>
            <div class="line sub-note">Phase-out threshold: $3,050,000</div>
            <div class="line sub-note">Limited to business income</div>
            <div class="line"><strong>Bonus Depreciation:</strong></div>
            <div class="line sub-note">2025: 60% (phasing down)</div>
            <div class="line sub-note">2026: 40% | 2027: 20% | 2028+: 0%</div>
            <div class="line"><strong>MACRS Recovery Periods:</strong></div>
            <div class="line sub-note">3-year: Certain manufacturing tools</div>
            <div class="line sub-note">5-year: Computers, vehicles, office equipment</div>
            <div class="line sub-note">7-year: Office furniture, most equipment</div>
            <div class="line sub-note">27.5-year: Residential rental property</div>
            <div class="line sub-note">39-year: Nonresidential real property</div>
          </div>
        </div>
      </div>
    `;
  };

  // Schedule H - Household Employment Taxes
  const generateScheduleH = () => {
    const { scheduleHData, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // 2025 thresholds
    const ssThreshold = scheduleHData?.socialSecurityWagesThreshold ?? 270000; // $2,700 for 2025
    const futaThreshold = scheduleHData?.futaWagesThreshold ?? 100000; // $1,000 in any quarter

    const totalWages = scheduleHData?.totalCashWagesPaid ?? 0;
    const subjectToSS = scheduleHData?.subjectToSocialSecurity ?? totalWages >= ssThreshold;
    const subjectToFUTA = scheduleHData?.subjectToFUTA ?? totalWages >= futaThreshold;

    // Part I - Social Security and Medicare
    const ssTax =
      scheduleHData?.socialSecurityTax ?? (subjectToSS ? Math.round(totalWages * 0.124) : 0);
    const medicareTax =
      scheduleHData?.medicareTax ?? (subjectToSS ? Math.round(totalWages * 0.029) : 0);
    const additionalMedicare = scheduleHData?.additionalMedicareTax ?? 0;
    const federalWithheld = scheduleHData?.federalIncomeWithheld ?? 0;
    const totalSSMedicare =
      scheduleHData?.totalSocialSecurityMedicare ?? ssTax + medicareTax + additionalMedicare;

    // Part II - FUTA
    const futaWages = scheduleHData?.totalFUTAWages ?? Math.min(totalWages, 700000); // $7,000 FUTA wage base
    const futaRate = scheduleHData?.futaTaxRate ?? 0.06;
    const stateCredit = scheduleHData?.stateUnemploymentCredit ?? Math.round(futaWages * 0.054);
    const netFUTA =
      scheduleHData?.netFUTATax ?? (subjectToFUTA ? Math.round(futaWages * 0.006) : 0);

    // Part III - Total
    const totalTaxes = scheduleHData?.totalTaxes ?? totalSSMedicare + netFUTA + federalWithheld;
    const employees = scheduleHData?.employees ?? [];

    return `
      <div class="tax-form schedule-h">
        <div class="form-header">
          <h1>Schedule H (Form 1040)</h1>
          <p>Household Employment Taxes</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="employer-info">
          <div class="line">Employer: ${scheduleHData?.employerName || `${personalInfo.firstName} ${personalInfo.lastName}`}</div>
          ${scheduleHData?.employerEIN ? `<div class="line">EIN: ${scheduleHData.employerEIN}</div>` : ''}
        </div>

        <div class="threshold-check">
          <h2>Threshold Check</h2>
          <div class="line-items">
            <div class="line">Total cash wages paid in 2025: $${toDollars(totalWages)}</div>
            <div class="line">Social Security/Medicare threshold: $${toDollars(ssThreshold)}</div>
            <div class="line">${subjectToSS ? '✓ Subject to Social Security and Medicare taxes' : '✗ Below threshold - not subject to SS/Medicare'}</div>
            <div class="line">FUTA threshold: $${toDollars(futaThreshold)} in any calendar quarter</div>
            <div class="line">${subjectToFUTA ? '✓ Subject to FUTA tax' : '✗ Below threshold - not subject to FUTA'}</div>
          </div>
        </div>

        <div class="part-1">
          <h2>Part I - Social Security, Medicare, and Federal Income Tax</h2>

          <div class="line-items">
            <div class="line">1. Total cash wages subject to social security tax: $${toDollars(totalWages)}</div>
            <div class="line">2. Social Security tax (12.4%): $${toDollars(ssTax)}</div>
            <div class="line sub-note">(Employer 6.2% + Employee 6.2%)</div>
            <div class="line">3. Total cash wages subject to Medicare tax: $${toDollars(totalWages)}</div>
            <div class="line">4. Medicare tax (2.9%): $${toDollars(medicareTax)}</div>
            <div class="line sub-note">(Employer 1.45% + Employee 1.45%)</div>
            ${
              additionalMedicare > 0
                ? `<div class="line">5. Additional Medicare tax (0.9% over $200k): $${toDollars(additionalMedicare)}</div>`
                : ''
            }
            <div class="line">6. Federal income tax withheld: $${toDollars(federalWithheld)}</div>
            <div class="line total">8. Total Social Security, Medicare, and federal taxes: $${toDollars(totalSSMedicare + federalWithheld)}</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - Federal Unemployment (FUTA) Tax</h2>

          <div class="line-items">
            <div class="line">10. Total FUTA wages (max $7,000 per employee): $${toDollars(futaWages)}</div>
            <div class="line">11. FUTA tax rate: 6.0%</div>
            <div class="line">12. Gross FUTA tax: $${toDollars(Math.round(futaWages * futaRate))}</div>
            <div class="line">13. State unemployment tax credit (up to 5.4%): $${toDollars(stateCredit)}</div>
            <div class="line total">14. Net FUTA tax (0.6%): $${toDollars(netFUTA)}</div>
          </div>
        </div>

        <div class="part-3">
          <h2>Part III - Total Household Employment Taxes</h2>

          <div class="line-items">
            <div class="line">Social Security and Medicare: $${toDollars(totalSSMedicare)}</div>
            <div class="line">Federal income tax withheld: $${toDollars(federalWithheld)}</div>
            <div class="line">FUTA tax: $${toDollars(netFUTA)}</div>
            <div class="line total highlight">Total household employment taxes: $${toDollars(totalTaxes)}</div>
            <div class="line note">Enter on Schedule 2, line 9</div>
          </div>
        </div>

        ${
          employees.length > 0
            ? `
        <div class="employee-list">
          <h2>Household Employees</h2>
          ${employees
            .map(
              (emp, idx) => `
            <div class="employee-item">
              <h3>Employee ${idx + 1}: ${emp.name}</h3>
              <div class="line-items">
                ${emp.ssn ? `<div class="line">SSN: XXX-XX-${emp.ssn.slice(-4)}</div>` : ''}
                <div class="line">Wages paid: $${toDollars(emp.wagesPaid)}</div>
                ${emp.socialSecurityWithheld ? `<div class="line">SS withheld: $${toDollars(emp.socialSecurityWithheld)}</div>` : ''}
                ${emp.medicareWithheld ? `<div class="line">Medicare withheld: $${toDollars(emp.medicareWithheld)}</div>` : ''}
                ${emp.federalWithheld ? `<div class="line">Federal withheld: $${toDollars(emp.federalWithheld)}</div>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : ''
        }

        <div class="reference-section">
          <h2>2025 Household Employment Tax Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Who is a Household Employee:</strong></div>
            <div class="line sub-note">Nannies, housekeepers, caregivers, gardeners, private nurses</div>
            <div class="line sub-note">Workers you control what and how work is done</div>
            <div class="line"><strong>2025 Thresholds:</strong></div>
            <div class="line sub-note">SS/Medicare: $2,700 annual cash wages</div>
            <div class="line sub-note">FUTA: $1,000 in any calendar quarter</div>
            <div class="line"><strong>Tax Rates:</strong></div>
            <div class="line sub-note">Social Security: 12.4% (6.2% each)</div>
            <div class="line sub-note">Medicare: 2.9% (1.45% each)</div>
            <div class="line sub-note">FUTA: 6.0% - 5.4% credit = 0.6% net</div>
            <div class="line"><strong>Employer Responsibilities:</strong></div>
            <div class="line sub-note">Obtain employee's SSN (Form W-4)</div>
            <div class="line sub-note">Issue Form W-2 by January 31</div>
            <div class="line sub-note">File Schedule H with Form 1040</div>
            <div class="line sub-note">May need state unemployment registration</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8606 - Nondeductible IRAs
  const generateForm8606 = () => {
    const { form8606Data, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Part I - Nondeductible Contributions
    const currentContributions = form8606Data?.nondeductibleContributions ?? 0;
    const priorBasis = form8606Data?.basisFromPriorYears ?? 0;
    const totalBasis = form8606Data?.totalBasis ?? currentContributions + priorBasis;

    // Distributions
    const distributions = form8606Data?.traditionalIRADistributions ?? 0;
    const yearEndValue = form8606Data?.yearEndValue ?? 0;
    const rollovers = form8606Data?.outstandingRollovers ?? 0;
    const totalValue = form8606Data?.totalValue ?? distributions + yearEndValue + rollovers;

    // Pro-rata calculation
    const basisRatio =
      form8606Data?.basisRatio ?? (totalValue > 0 ? Math.min(1, totalBasis / totalValue) : 0);
    const nontaxableAmount =
      form8606Data?.nontaxableAmount ?? Math.round(distributions * basisRatio);
    const taxableAmount = form8606Data?.taxableAmount ?? distributions - nontaxableAmount;

    // Part II - Conversions
    const conversionAmount = form8606Data?.conversionAmount ?? 0;
    const conversionBasis = form8606Data?.conversionBasis ?? 0;
    const taxableConversion = form8606Data?.taxableConversion ?? conversionAmount - conversionBasis;

    // Part III - Roth Distributions
    const rothDistributions = form8606Data?.rothDistributions ?? 0;
    const rothContributionBasis = form8606Data?.rothContributionBasis ?? 0;
    const rothConversionBasis = form8606Data?.rothConversionBasis ?? 0;
    const isQualified = form8606Data?.qualifiedDistribution ?? false;
    const taxableRoth =
      form8606Data?.taxableRothDistribution ??
      (isQualified
        ? 0
        : Math.max(0, rothDistributions - rothContributionBasis - rothConversionBasis));

    return `
      <div class="tax-form form-8606">
        <div class="form-header">
          <h1>Form 8606</h1>
          <p>Nondeductible IRAs</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="taxpayer-info">
          <div class="line">Taxpayer: ${personalInfo.firstName} ${personalInfo.lastName}</div>
          <div class="line">SSN: ${personalInfo.ssn}</div>
        </div>

        <div class="part-1">
          <h2>Part I - Nondeductible Contributions to Traditional IRAs and Basis</h2>

          <div class="line-items">
            <div class="line">1. Nondeductible contributions for 2025: $${toDollars(currentContributions)}</div>
            <div class="line">2. Total basis in traditional IRAs from prior years: $${toDollars(priorBasis)}</div>
            <div class="line">3. Total basis (line 1 + line 2): $${toDollars(totalBasis)}</div>
          </div>

          ${
            distributions > 0
              ? `
          <div class="distributions">
            <h3>Distributions from Traditional IRAs</h3>
            <div class="line-items">
              <div class="line">6. Value of all traditional IRAs as of 12/31/2025: $${toDollars(yearEndValue)}</div>
              <div class="line">7. Distributions received in 2025: $${toDollars(distributions)}</div>
              ${rollovers > 0 ? `<div class="line">7a. Outstanding rollovers: $${toDollars(rollovers)}</div>` : ''}
              <div class="line">8. Total value (lines 6 + 7 + 7a): $${toDollars(totalValue)}</div>
              <div class="line">10. Basis ratio (line 3 ÷ line 8): ${(basisRatio * 100).toFixed(4)}%</div>
              <div class="line">13. Nontaxable portion (line 7 × line 10): $${toDollars(nontaxableAmount)}</div>
              <div class="line total">15. Taxable amount: $${toDollars(taxableAmount)}</div>
              <div class="line note">Enter taxable amount on Form 1040, line 4b</div>
            </div>
          </div>
          `
              : ''
          }
        </div>

        ${
          conversionAmount > 0
            ? `
        <div class="part-2">
          <h2>Part II - Conversions from Traditional, SEP, or SIMPLE IRAs to Roth IRAs</h2>

          <div class="line-items">
            <div class="line">16. Amount converted to Roth IRA: $${toDollars(conversionAmount)}</div>
            <div class="line">17. Basis in conversion (nontaxable portion): $${toDollars(conversionBasis)}</div>
            <div class="line total">18. Taxable conversion amount: $${toDollars(taxableConversion)}</div>
            <div class="line note">Include on Form 1040, line 4b</div>
          </div>
        </div>
        `
            : ''
        }

        ${
          rothDistributions > 0
            ? `
        <div class="part-3">
          <h2>Part III - Distributions from Roth IRAs</h2>

          <div class="line-items">
            <div class="line">19. Total Roth IRA distributions: $${toDollars(rothDistributions)}</div>
            <div class="line">20. Qualified distribution: ${isQualified ? 'Yes' : 'No'}</div>
            <div class="line">22. Basis in Roth contributions: $${toDollars(rothContributionBasis)}</div>
            <div class="line">23. Basis in Roth conversions: $${toDollars(rothConversionBasis)}</div>
            <div class="line total">25. Taxable Roth distribution: $${toDollars(taxableRoth)}</div>
            ${
              taxableRoth > 0 && !isQualified
                ? `<div class="line note">⚠️ Early distribution may be subject to 10% penalty</div>`
                : `<div class="line note">Qualified distribution - tax-free</div>`
            }
          </div>
        </div>
        `
            : ''
        }

        <div class="reference-section">
          <h2>Form 8606 Reference</h2>
          <div class="line-items">
            <div class="line"><strong>When to File Form 8606:</strong></div>
            <div class="line sub-note">Made nondeductible contributions to traditional IRA</div>
            <div class="line sub-note">Received distributions from traditional/SEP/SIMPLE IRA with basis</div>
            <div class="line sub-note">Converted traditional IRA to Roth IRA</div>
            <div class="line sub-note">Received distributions from Roth IRA</div>
            <div class="line"><strong>2025 IRA Contribution Limits:</strong></div>
            <div class="line sub-note">Under 50: $7,000</div>
            <div class="line sub-note">50 or older: $8,000 (includes $1,000 catch-up)</div>
            <div class="line"><strong>Pro-Rata Rule:</strong></div>
            <div class="line sub-note">Cannot withdraw only after-tax (basis) amounts</div>
            <div class="line sub-note">Each distribution is part taxable, part nontaxable</div>
            <div class="line sub-note">Based on ratio of basis to total IRA value</div>
            <div class="line"><strong>Roth 5-Year Rule:</strong></div>
            <div class="line sub-note">Qualified distribution: 5 years since first contribution AND age 59½</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 8889 - Health Savings Accounts (HSAs)
  const generateForm8889 = () => {
    const { form8889Data, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // 2025 HSA limits
    const coverageType = form8889Data?.coverageType ?? 'self';
    const baseLimits: Record<string, number> = {
      self: 430000, // $4,300 for 2025
      family: 855000, // $8,550 for 2025
    };
    const baseLimit = baseLimits[coverageType] ?? 430000;
    const catchUp = form8889Data?.catchUpContribution ?? 0; // $1,000 if 55+
    const totalLimit = form8889Data?.totalLimit ?? baseLimit + catchUp;

    // Part I - Contributions
    const employerContributions = form8889Data?.employerContributions ?? 0;
    const personalContributions = form8889Data?.personalContributions ?? 0;
    const qfd = form8889Data?.qualifiedFundingDistribution ?? 0; // From IRA
    const totalContributions =
      form8889Data?.totalContributions ?? employerContributions + personalContributions + qfd;
    const excessContributions =
      form8889Data?.excessContributions ?? Math.max(0, totalContributions - totalLimit);
    const hsaDeduction =
      form8889Data?.hsaDeduction ??
      Math.min(personalContributions, totalLimit - employerContributions);

    // Part II - Distributions
    const totalDistributions = form8889Data?.totalDistributions ?? 0;
    const qualifiedExpenses = form8889Data?.qualifiedMedicalExpenses ?? 0;
    const rollovers = form8889Data?.rolloverAmount ?? 0;
    const qualifiedDistributions =
      form8889Data?.qualifiedDistributions ?? qualifiedExpenses + rollovers;
    const taxableDistributions =
      form8889Data?.taxableDistributions ??
      Math.max(0, totalDistributions - qualifiedDistributions);
    const additionalTax = form8889Data?.additionalTax ?? Math.round(taxableDistributions * 0.2);

    // Part III - Testing period
    const lastMonthRule = form8889Data?.lastMonthRule ?? false;
    const testingPeriodFailure = form8889Data?.testingPeriodFailure ?? false;
    const includibleIncome = form8889Data?.includibleIncome ?? 0;
    const additionalTaxFailure =
      form8889Data?.additionalTaxForFailure ?? Math.round(includibleIncome * 0.1);

    return `
      <div class="tax-form form-8889">
        <div class="form-header">
          <h1>Form 8889</h1>
          <p>Health Savings Accounts (HSAs)</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="taxpayer-info">
          <div class="line">Taxpayer: ${personalInfo.firstName} ${personalInfo.lastName}</div>
          <div class="line">Coverage Type: ${coverageType === 'self' ? 'Self-only' : 'Family'}</div>
        </div>

        <div class="part-1">
          <h2>Part I - HSA Contributions and Deduction</h2>

          <div class="line-items">
            <div class="line">1. Coverage under HDHP: ${coverageType === 'self' ? 'Self-only' : 'Family'}</div>
            <div class="line">2. HSA contribution limit for coverage type: $${toDollars(baseLimit)}</div>
            ${catchUp > 0 ? `<div class="line">3. Additional catch-up contribution (55+): $${toDollars(catchUp)}</div>` : ''}
            <div class="line">4. Total contribution limit: $${toDollars(totalLimit)}</div>
            <div class="line">9. Employer contributions (W-2 Box 12, Code W): $${toDollars(employerContributions)}</div>
            <div class="line">10. Personal HSA contributions: $${toDollars(personalContributions)}</div>
            ${qfd > 0 ? `<div class="line">10a. Qualified funding distribution from IRA: $${toDollars(qfd)}</div>` : ''}
            <div class="line">12. Total contributions: $${toDollars(totalContributions)}</div>
            ${
              excessContributions > 0
                ? `<div class="line note">⚠️ Excess contributions: $${toDollars(excessContributions)} (subject to 6% excise tax)</div>`
                : ''
            }
            <div class="line total highlight">13. HSA Deduction: $${toDollars(hsaDeduction)}</div>
            <div class="line note">Enter on Schedule 1, line 13</div>
          </div>
        </div>

        <div class="part-2">
          <h2>Part II - HSA Distributions</h2>

          <div class="line-items">
            <div class="line">14a. Total distributions from HSAs (Form 1099-SA): $${toDollars(totalDistributions)}</div>
            <div class="line">14b. Distributions included on line 14a from deceased account holder: $0.00</div>
            <div class="line">15. Qualified medical expenses paid from HSA: $${toDollars(qualifiedExpenses)}</div>
            ${rollovers > 0 ? `<div class="line">16. HSA-to-HSA rollovers: $${toDollars(rollovers)}</div>` : ''}
            <div class="line">17. Total qualified distributions: $${toDollars(qualifiedDistributions)}</div>
            <div class="line total">17b. Taxable HSA distributions: $${toDollars(taxableDistributions)}</div>
            ${
              taxableDistributions > 0
                ? `
              <div class="line">17c. Additional 20% tax on nonqualified distributions: $${toDollars(additionalTax)}</div>
              <div class="line note">Enter on Schedule 2, line 17c</div>
            `
                : `<div class="line note">All distributions were for qualified medical expenses</div>`
            }
          </div>
        </div>

        ${
          lastMonthRule || testingPeriodFailure
            ? `
        <div class="part-3">
          <h2>Part III - Income and Additional Tax for Failure to Maintain HDHP Coverage</h2>

          <div class="line-items">
            ${lastMonthRule ? `<div class="line">Used last-month rule in prior year: Yes</div>` : ''}
            ${
              testingPeriodFailure
                ? `
              <div class="line">Failed to maintain HDHP coverage during testing period</div>
              <div class="line">18. Income to include: $${toDollars(includibleIncome)}</div>
              <div class="line">19. Additional 10% tax: $${toDollars(additionalTaxFailure)}</div>
            `
                : ''
            }
          </div>
        </div>
        `
            : ''
        }

        <div class="summary">
          <h2>HSA Summary</h2>
          <div class="line-items">
            <div class="line">Total Contributions: $${toDollars(totalContributions)}</div>
            <div class="line">HSA Deduction (above-the-line): $${toDollars(hsaDeduction)}</div>
            <div class="line">Total Distributions: $${toDollars(totalDistributions)}</div>
            <div class="line">Taxable Distributions: $${toDollars(taxableDistributions)}</div>
            ${additionalTax > 0 ? `<div class="line">20% Penalty: $${toDollars(additionalTax)}</div>` : ''}
          </div>
        </div>

        <div class="reference-section">
          <h2>2025 HSA Reference</h2>
          <div class="line-items">
            <div class="line"><strong>2025 Contribution Limits:</strong></div>
            <div class="line sub-note">Self-only coverage: $4,300</div>
            <div class="line sub-note">Family coverage: $8,550</div>
            <div class="line sub-note">Catch-up (55+): Additional $1,000</div>
            <div class="line"><strong>2025 HDHP Requirements:</strong></div>
            <div class="line sub-note">Self-only: Min deductible $1,650, Max OOP $8,300</div>
            <div class="line sub-note">Family: Min deductible $3,300, Max OOP $16,600</div>
            <div class="line"><strong>Qualified Medical Expenses:</strong></div>
            <div class="line sub-note">Doctors, dentists, vision, prescriptions</div>
            <div class="line sub-note">Medical equipment, insulin, long-term care</div>
            <div class="line sub-note">Not: cosmetic procedures, gym memberships, vitamins</div>
            <div class="line"><strong>Tax Benefits:</strong></div>
            <div class="line sub-note">Contributions: Tax-deductible (above-the-line)</div>
            <div class="line sub-note">Growth: Tax-free</div>
            <div class="line sub-note">Qualified distributions: Tax-free</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 2106 - Employee Business Expenses
  const generateForm2106 = () => {
    const { form2106Data, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Eligibility check
    const isPerformingArtist = form2106Data?.performingArtist ?? false;
    const isQualifiedArtist = form2106Data?.qualifiedPerformingArtist ?? false;
    const isReservist = form2106Data?.reservist ?? false;
    const isFeeBasedOfficial = form2106Data?.feeBasedOfficial ?? false;
    const isDisabled = form2106Data?.disabledEmployee ?? false;
    const canDeduct = isQualifiedArtist || isReservist || isFeeBasedOfficial || isDisabled;

    // Part I - Expenses
    const vehicleExpenses = form2106Data?.vehicleExpenses ?? 0;
    const parkingTolls = form2106Data?.parkingTolls ?? 0;
    const travelExpenses = form2106Data?.travelExpenses ?? 0;
    const mealsExpenses = form2106Data?.mealsExpenses ?? 0;
    const mealsAllowed = Math.round(mealsExpenses * 0.5); // 50% limit
    const otherExpenses = form2106Data?.otherExpenses ?? 0;
    const totalExpenses =
      form2106Data?.totalExpenses ??
      vehicleExpenses + parkingTolls + travelExpenses + mealsAllowed + otherExpenses;

    // Reimbursements
    const accountableReimb = form2106Data?.reimbursementsAccountable ?? 0;
    const nonAccountableReimb = form2106Data?.reimbursementsNonAccountable ?? 0;
    const unreimbursed =
      form2106Data?.unreimbursedExpenses ?? Math.max(0, totalExpenses - accountableReimb);

    // Vehicle info
    const vehicle = form2106Data?.vehicleInfo;
    const useStandardMileage = form2106Data?.useStandardMileage ?? true;
    const standardRate = form2106Data?.standardMileageRate ?? 70; // $0.70 for 2025
    const businessMiles = vehicle?.businessMiles ?? 0;
    const standardMileageDeduction =
      form2106Data?.standardMileageDeduction ?? Math.round(businessMiles * standardRate);

    return `
      <div class="tax-form form-2106">
        <div class="form-header">
          <h1>Form 2106</h1>
          <p>Employee Business Expenses</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="eligibility-notice">
          <h2>⚠️ Important: Limited Deductibility</h2>
          <div class="line-items">
            <div class="line">Since 2018 (TCJA), most employees CANNOT deduct unreimbursed business expenses.</div>
            <div class="line"><strong>Form 2106 is only for:</strong></div>
            <div class="line sub-note">✓ Armed Forces reservists</div>
            <div class="line sub-note">✓ Qualified performing artists</div>
            <div class="line sub-note">✓ Fee-basis state/local government officials</div>
            <div class="line sub-note">✓ Employees with impairment-related work expenses</div>
          </div>
        </div>

        <div class="qualification-status">
          <h2>Qualification Status</h2>
          <div class="line-items">
            ${isPerformingArtist ? `<div class="line">Performing artist: ${isQualifiedArtist ? '✓ Qualified' : '✗ Not qualified'}</div>` : ''}
            ${isReservist ? `<div class="line">Armed Forces reservist: ✓ Qualified</div>` : ''}
            ${isFeeBasedOfficial ? `<div class="line">Fee-basis government official: ✓ Qualified</div>` : ''}
            ${isDisabled ? `<div class="line">Impairment-related expenses: ✓ Qualified</div>` : ''}
            ${!canDeduct ? `<div class="line note">⚠️ Does not qualify - expenses are NOT deductible</div>` : ''}
          </div>
        </div>

        <div class="part-1">
          <h2>Part I - Employee Business Expenses</h2>

          <div class="line-items">
            <div class="line">1. Vehicle expenses: $${toDollars(vehicleExpenses)}</div>
            <div class="line">2. Parking fees, tolls, transportation: $${toDollars(parkingTolls)}</div>
            <div class="line">3. Travel expense (lodging, air, etc.): $${toDollars(travelExpenses)}</div>
            <div class="line">4. Business meals expense: $${toDollars(mealsExpenses)}</div>
            <div class="line">5. Meals allowed (50% of line 4): $${toDollars(mealsAllowed)}</div>
            <div class="line">6. Other business expenses: $${toDollars(otherExpenses)}</div>
            <div class="line total">7. Total expenses: $${toDollars(totalExpenses)}</div>
          </div>
        </div>

        <div class="reimbursements">
          <h2>Reimbursements</h2>
          <div class="line-items">
            <div class="line">8. Reimbursements (accountable plan): $${toDollars(accountableReimb)}</div>
            ${
              nonAccountableReimb > 0
                ? `<div class="line">8b. Nonaccountable reimbursements (included in W-2): $${toDollars(nonAccountableReimb)}</div>`
                : ''
            }
            <div class="line total">10. Unreimbursed expenses: $${toDollars(unreimbursed)}</div>
          </div>
        </div>

        ${
          vehicle
            ? `
        <div class="part-2">
          <h2>Part II - Vehicle Expenses</h2>

          <div class="vehicle-info">
            <h3>Vehicle Information</h3>
            <div class="line-items">
              ${vehicle.dateAvailable ? `<div class="line">Date vehicle placed in service: ${vehicle.dateAvailable}</div>` : ''}
              <div class="line">Total miles driven: ${vehicle.totalMiles?.toLocaleString() ?? 0}</div>
              <div class="line">Business miles: ${vehicle.businessMiles?.toLocaleString() ?? 0}</div>
              <div class="line">Commuting miles: ${vehicle.commutingMiles?.toLocaleString() ?? 0}</div>
              <div class="line">Other personal miles: ${vehicle.personalMiles?.toLocaleString() ?? 0}</div>
              <div class="line">Business use percentage: ${
                vehicle.totalMiles && vehicle.businessMiles
                  ? ((vehicle.businessMiles / vehicle.totalMiles) * 100).toFixed(1)
                  : 0
              }%</div>
            </div>
          </div>

          ${
            useStandardMileage
              ? `
          <div class="standard-mileage">
            <h3>Standard Mileage Method</h3>
            <div class="line-items">
              <div class="line">22a. Standard mileage rate (2025): $${(standardRate / 100).toFixed(2)}/mile</div>
              <div class="line">22b. Business miles: ${businessMiles.toLocaleString()}</div>
              <div class="line total">22c. Standard mileage deduction: $${toDollars(standardMileageDeduction)}</div>
            </div>
          </div>
          `
              : `
          <div class="actual-expenses">
            <h3>Actual Expense Method</h3>
            <div class="line-items">
              ${
                form2106Data?.actualExpenses
                  ? `
                <div class="line">Gas and oil: $${toDollars(form2106Data.actualExpenses.gasoline ?? 0)}</div>
                <div class="line">Repairs: $${toDollars(form2106Data.actualExpenses.oilLubeRepairs ?? 0)}</div>
                <div class="line">Insurance: $${toDollars(form2106Data.actualExpenses.insurance ?? 0)}</div>
                <div class="line">Depreciation: $${toDollars(form2106Data.actualExpenses.depreciation ?? 0)}</div>
                <div class="line">Other: $${toDollars(form2106Data.actualExpenses.other ?? 0)}</div>
                <div class="line">Total actual expenses: $${toDollars(form2106Data.actualExpenses.total ?? 0)}</div>
                <div class="line">Business portion: $${toDollars(form2106Data.actualExpenses.businessPortion ?? 0)}</div>
              `
                  : ''
              }
            </div>
          </div>
          `
          }
        </div>
        `
            : ''
        }

        ${
          canDeduct
            ? `
        <div class="deduction-summary">
          <h2>Deduction Summary</h2>
          <div class="line-items">
            <div class="line total highlight">Allowable employee business expense deduction: $${toDollars(unreimbursed)}</div>
            ${
              isReservist
                ? `<div class="line note">Enter on Schedule 1, line 12</div>`
                : isQualifiedArtist
                  ? `<div class="line note">Enter on Schedule 1, line 12</div>`
                  : isFeeBasedOfficial
                    ? `<div class="line note">Enter on Schedule 1, line 12</div>`
                    : `<div class="line note">Enter on Schedule A, line 16 (if itemizing)</div>`
            }
          </div>
        </div>
        `
            : ''
        }

        <div class="reference-section">
          <h2>2025 Form 2106 Reference</h2>
          <div class="line-items">
            <div class="line"><strong>Standard Mileage Rate (2025):</strong> $0.70 per mile</div>
            <div class="line"><strong>Qualified Performing Artist Requirements:</strong></div>
            <div class="line sub-note">Performed for at least 2 employers</div>
            <div class="line sub-note">Received at least $200 from each employer</div>
            <div class="line sub-note">Business expenses exceed 10% of performing income</div>
            <div class="line sub-note">AGI not more than $16,000 before deduction</div>
            <div class="line"><strong>Reservist Travel Expenses:</strong></div>
            <div class="line sub-note">Travel more than 100 miles from home</div>
            <div class="line sub-note">Away from home overnight</div>
            <div class="line"><strong>Substantiation Required:</strong></div>
            <div class="line sub-note">Written records, receipts, mileage logs</div>
            <div class="line sub-note">Date, amount, business purpose</div>
          </div>
        </div>
      </div>
    `;
  };

  // Form 3903 - Moving Expenses (Military Only)
  const generateForm3903 = () => {
    const { form3903Data, personalInfo } = formData;

    const toDollars = (cents: number) =>
      (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const isMilitaryMove = form3903Data?.militaryMove ?? false;
    const isPCS = form3903Data?.permanentChangeOfStation ?? false;

    // Expenses
    const transportationExpenses = form3903Data?.transportationExpenses ?? 0;
    const travelExpenses = form3903Data?.travelExpenses ?? 0;
    const lodgingExpenses = form3903Data?.lodgingExpenses ?? 0;
    const storageExpenses = form3903Data?.storageExpenses ?? 0;
    const totalExpenses =
      form3903Data?.totalMovingExpenses ??
      transportationExpenses + travelExpenses + lodgingExpenses + storageExpenses;

    // Reimbursements
    const reimbursements = form3903Data?.reimbursementsReceived ?? 0;
    const taxableReimb = form3903Data?.taxableReimbursements ?? 0;
    const netDeduction = form3903Data?.netDeduction ?? Math.max(0, totalExpenses - reimbursements);

    // Move details
    const oldHome = form3903Data?.oldHome;
    const newHome = form3903Data?.newHome;
    const distance = form3903Data?.distanceMoved ?? 0;

    return `
      <div class="tax-form form-3903">
        <div class="form-header">
          <h1>Form 3903</h1>
          <p>Moving Expenses</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="eligibility-notice">
          <h2>⚠️ Important: Military Only</h2>
          <div class="line-items">
            <div class="line">Since 2018 (TCJA), moving expense deductions are ONLY available for:</div>
            <div class="line sub-note">✓ Active duty members of the Armed Forces</div>
            <div class="line sub-note">✓ Moving due to military orders (Permanent Change of Station)</div>
            <div class="line"><strong>Civilians cannot deduct moving expenses through 2025.</strong></div>
          </div>
        </div>

        <div class="qualification-status">
          <h2>Military Move Status</h2>
          <div class="line-items">
            <div class="line">Active duty military member: ${isMilitaryMove ? '✓ Yes' : '✗ No'}</div>
            <div class="line">Permanent Change of Station (PCS): ${isPCS ? '✓ Yes' : '✗ No'}</div>
            ${
              !isMilitaryMove || !isPCS
                ? `<div class="line note">⚠️ Does not qualify - moving expenses are NOT deductible</div>`
                : `<div class="line note">✓ Qualifies for moving expense deduction</div>`
            }
          </div>
        </div>

        ${
          oldHome || newHome
            ? `
        <div class="move-details">
          <h2>Move Information</h2>
          <div class="line-items">
            ${
              oldHome
                ? `
              <div class="line"><strong>Old Home:</strong></div>
              <div class="line sub-note">${oldHome.address || ''}</div>
              <div class="line sub-note">${oldHome.city || ''}, ${oldHome.state || ''}</div>
            `
                : ''
            }
            ${
              newHome
                ? `
              <div class="line"><strong>New Home:</strong></div>
              <div class="line sub-note">${newHome.address || ''}</div>
              <div class="line sub-note">${newHome.city || ''}, ${newHome.state || ''}</div>
            `
                : ''
            }
            ${distance > 0 ? `<div class="line">Distance moved: ${distance} miles</div>` : ''}
            ${form3903Data?.dateOfMove ? `<div class="line">Date of move: ${form3903Data.dateOfMove}</div>` : ''}
          </div>
        </div>
        `
            : ''
        }

        <div class="moving-expenses">
          <h2>Moving Expenses</h2>

          <div class="line-items">
            <div class="line">1. Transportation of household goods and personal effects: $${toDollars(transportationExpenses)}</div>
            <div class="line">2. Travel (including lodging) from old home to new home: $${toDollars(travelExpenses)}</div>
            ${lodgingExpenses > 0 ? `<div class="line">2a. Lodging expenses: $${toDollars(lodgingExpenses)}</div>` : ''}
            ${storageExpenses > 0 ? `<div class="line">3. Storage expenses (within 30 days): $${toDollars(storageExpenses)}</div>` : ''}
            <div class="line total">4. Total moving expenses: $${toDollars(totalExpenses)}</div>
          </div>
        </div>

        <div class="reimbursements">
          <h2>Reimbursements</h2>

          <div class="line-items">
            <div class="line">5. Reimbursements received (not included in W-2): $${toDollars(reimbursements)}</div>
            ${
              taxableReimb > 0
                ? `<div class="line">5a. Taxable reimbursements (included in W-2 Box 12 Code P): $${toDollars(taxableReimb)}</div>`
                : ''
            }
          </div>
        </div>

        ${
          isMilitaryMove && isPCS
            ? `
        <div class="deduction">
          <h2>Moving Expense Deduction</h2>

          <div class="line-items">
            <div class="line">6. Expenses minus nontaxable reimbursements: $${toDollars(totalExpenses - reimbursements)}</div>
            <div class="line total highlight">7. Moving expense deduction: $${toDollars(netDeduction)}</div>
            <div class="line note">Enter on Schedule 1, line 14</div>
          </div>
        </div>
        `
            : ''
        }

        <div class="reference-section">
          <h2>Form 3903 Reference (Military Moves)</h2>
          <div class="line-items">
            <div class="line"><strong>Deductible Moving Expenses:</strong></div>
            <div class="line sub-note">Transportation and storage of household goods</div>
            <div class="line sub-note">Travel costs (car expenses at $0.22/mile for 2025)</div>
            <div class="line sub-note">Lodging costs (not meals)</div>
            <div class="line sub-note">Temporary storage (up to 30 consecutive days)</div>
            <div class="line"><strong>NOT Deductible:</strong></div>
            <div class="line sub-note">Meals during travel</div>
            <div class="line sub-note">House hunting trips</div>
            <div class="line sub-note">Temporary living expenses</div>
            <div class="line sub-note">Costs of selling/buying home</div>
            <div class="line"><strong>Qualifying Moves:</strong></div>
            <div class="line sub-note">Permanent Change of Station (PCS)</div>
            <div class="line sub-note">Move to first post of active duty</div>
            <div class="line sub-note">Move from last post (within 1 year of leaving)</div>
            <div class="line sub-note">Move to U.S. for retirement or death</div>
          </div>
        </div>
      </div>
    `;
  };

  const generateForm8949 = () => {
    const { capitalTransactions, capitalGainsDetails, incomeData } = formData;

    // Helper to format currency
    const formatCurrency = (amount: number) =>
      amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Helper to generate transaction rows
    const generateTransactionRows = (
      transactions: CapitalTransaction[] | undefined,
      isShortTerm: boolean
    ) => {
      if (!transactions || transactions.length === 0) {
        // Generate placeholder row if no transactions
        const netAmount = isShortTerm
          ? (capitalGainsDetails?.netShortTerm ??
            parseFloat(incomeData?.netShortTermCapitalGain || '0'))
          : (capitalGainsDetails?.netLongTerm ??
            parseFloat(incomeData?.netLongTermCapitalGain || '0'));

        if (netAmount === 0) return '<div class="line note">No transactions to report</div>';

        return `
          <div class="transaction-row">
            <div class="col-desc">Various ${isShortTerm ? 'short-term' : 'long-term'} transactions</div>
            <div class="col-date">Various</div>
            <div class="col-date">Various</div>
            <div class="col-amount">-</div>
            <div class="col-amount">-</div>
            <div class="col-code">-</div>
            <div class="col-amount">-</div>
            <div class="col-amount total">$${formatCurrency(netAmount)}</div>
          </div>
        `;
      }

      return transactions
        .map(
          (t) => `
        <div class="transaction-row">
          <div class="col-desc">${t.description}</div>
          <div class="col-date">${t.dateAcquired || 'Various'}</div>
          <div class="col-date">${t.dateSold || 'Various'}</div>
          <div class="col-amount">$${formatCurrency(t.proceeds)}</div>
          <div class="col-amount">$${formatCurrency(t.costBasis)}</div>
          <div class="col-code">${t.adjustmentCode || ''}</div>
          <div class="col-amount">${t.adjustmentAmount ? '$' + formatCurrency(t.adjustmentAmount) : ''}</div>
          <div class="col-amount ${t.gainOrLoss < 0 ? 'loss' : 'gain'}">$${formatCurrency(t.gainOrLoss)}</div>
        </div>
      `
        )
        .join('');
    };

    // Calculate totals
    const shortTermTransactions = capitalTransactions?.shortTerm || [];
    const longTermTransactions = capitalTransactions?.longTerm || [];

    const shortTermTotals =
      shortTermTransactions.length > 0
        ? {
            proceeds: shortTermTransactions.reduce((sum, t) => sum + t.proceeds, 0),
            costBasis: shortTermTransactions.reduce((sum, t) => sum + t.costBasis, 0),
            adjustments: shortTermTransactions.reduce(
              (sum, t) => sum + (t.adjustmentAmount || 0),
              0
            ),
            gainLoss: shortTermTransactions.reduce((sum, t) => sum + t.gainOrLoss, 0),
          }
        : {
            proceeds: 0,
            costBasis: 0,
            adjustments: 0,
            gainLoss:
              capitalGainsDetails?.netShortTerm ??
              parseFloat(incomeData?.netShortTermCapitalGain || '0'),
          };

    const longTermTotals =
      longTermTransactions.length > 0
        ? {
            proceeds: longTermTransactions.reduce((sum, t) => sum + t.proceeds, 0),
            costBasis: longTermTransactions.reduce((sum, t) => sum + t.costBasis, 0),
            adjustments: longTermTransactions.reduce(
              (sum, t) => sum + (t.adjustmentAmount || 0),
              0
            ),
            gainLoss: longTermTransactions.reduce((sum, t) => sum + t.gainOrLoss, 0),
          }
        : {
            proceeds: 0,
            costBasis: 0,
            adjustments: 0,
            gainLoss:
              capitalGainsDetails?.netLongTerm ??
              parseFloat(incomeData?.netLongTermCapitalGain || '0'),
          };

    return `
      <div class="tax-form form-8949">
        <div class="form-header">
          <h1>Form 8949</h1>
          <p>Sales and Other Dispositions of Capital Assets</p>
          <p>Tax Year 2025</p>
        </div>

        <div class="instructions-note">
          <p><strong>Important:</strong> Use this form to report sales and exchanges of capital assets.</p>
          <p>Report short-term transactions in Part I and long-term transactions in Part II.</p>
          <p>Check the appropriate box (A, B, C for short-term or D, E, F for long-term) based on whether basis was reported to IRS.</p>
        </div>

        <div class="part-1">
          <h2>Part I - Short-Term Capital Gains and Losses (Assets Held One Year or Less)</h2>
          <p class="box-instruction">Check Box A if basis was reported to IRS, Box B if not reported, Box C if Form 1099-B not received</p>

          <div class="checkbox-row">
            <label><input type="checkbox" checked disabled /> (A) Short-term transactions reported on Form(s) 1099-B showing basis was reported to the IRS</label>
          </div>

          <div class="transaction-table">
            <div class="table-header">
              <div class="col-desc">(a) Description</div>
              <div class="col-date">(b) Date Acquired</div>
              <div class="col-date">(c) Date Sold</div>
              <div class="col-amount">(d) Proceeds</div>
              <div class="col-amount">(e) Cost Basis</div>
              <div class="col-code">(f) Code</div>
              <div class="col-amount">(g) Adjustment</div>
              <div class="col-amount">(h) Gain/(Loss)</div>
            </div>
            ${generateTransactionRows(shortTermTransactions, true)}
            <div class="totals-row">
              <div class="col-desc"><strong>2. Totals</strong></div>
              <div class="col-date"></div>
              <div class="col-date"></div>
              <div class="col-amount"><strong>$${formatCurrency(shortTermTotals.proceeds)}</strong></div>
              <div class="col-amount"><strong>$${formatCurrency(shortTermTotals.costBasis)}</strong></div>
              <div class="col-code"></div>
              <div class="col-amount"><strong>${shortTermTotals.adjustments ? '$' + formatCurrency(shortTermTotals.adjustments) : ''}</strong></div>
              <div class="col-amount total"><strong>$${formatCurrency(shortTermTotals.gainLoss)}</strong></div>
            </div>
          </div>
          <p class="note">Enter totals on Schedule D, line 1a (if Box A), 1b (if Box B), or 1c (if Box C)</p>
        </div>

        <div class="part-2">
          <h2>Part II - Long-Term Capital Gains and Losses (Assets Held More Than One Year)</h2>
          <p class="box-instruction">Check Box D if basis was reported to IRS, Box E if not reported, Box F if Form 1099-B not received</p>

          <div class="checkbox-row">
            <label><input type="checkbox" checked disabled /> (D) Long-term transactions reported on Form(s) 1099-B showing basis was reported to the IRS</label>
          </div>

          <div class="transaction-table">
            <div class="table-header">
              <div class="col-desc">(a) Description</div>
              <div class="col-date">(b) Date Acquired</div>
              <div class="col-date">(c) Date Sold</div>
              <div class="col-amount">(d) Proceeds</div>
              <div class="col-amount">(e) Cost Basis</div>
              <div class="col-code">(f) Code</div>
              <div class="col-amount">(g) Adjustment</div>
              <div class="col-amount">(h) Gain/(Loss)</div>
            </div>
            ${generateTransactionRows(longTermTransactions, false)}
            <div class="totals-row">
              <div class="col-desc"><strong>2. Totals</strong></div>
              <div class="col-date"></div>
              <div class="col-date"></div>
              <div class="col-amount"><strong>$${formatCurrency(longTermTotals.proceeds)}</strong></div>
              <div class="col-amount"><strong>$${formatCurrency(longTermTotals.costBasis)}</strong></div>
              <div class="col-code"></div>
              <div class="col-amount"><strong>${longTermTotals.adjustments ? '$' + formatCurrency(longTermTotals.adjustments) : ''}</strong></div>
              <div class="col-amount total"><strong>$${formatCurrency(longTermTotals.gainLoss)}</strong></div>
            </div>
          </div>
          <p class="note">Enter totals on Schedule D, line 8a (if Box D), 8b (if Box E), or 8c (if Box F)</p>
        </div>

        <div class="adjustment-codes">
          <h2>Common Adjustment Codes (Column f)</h2>
          <div class="code-list">
            <div class="code-item"><strong>B</strong> - Incorrect basis reported on Form 1099-B</div>
            <div class="code-item"><strong>W</strong> - Wash sale loss disallowed</div>
            <div class="code-item"><strong>D</strong> - Market discount</div>
            <div class="code-item"><strong>E</strong> - Accrued market discount reported as ordinary income</div>
            <div class="code-item"><strong>H</strong> - Gain eligible for exclusion under IRC Section 1202</div>
            <div class="code-item"><strong>O</strong> - Other adjustment (attach explanation)</div>
          </div>
        </div>

        <div class="summary-section">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Total Short-Term Gain/(Loss):</span>
              <span class="${shortTermTotals.gainLoss < 0 ? 'loss' : 'gain'}">$${formatCurrency(shortTermTotals.gainLoss)}</span>
            </div>
            <div class="summary-item">
              <span>Total Long-Term Gain/(Loss):</span>
              <span class="${longTermTotals.gainLoss < 0 ? 'loss' : 'gain'}">$${formatCurrency(longTermTotals.gainLoss)}</span>
            </div>
            <div class="summary-item total">
              <span>Combined Net Gain/(Loss):</span>
              <span class="${shortTermTotals.gainLoss + longTermTotals.gainLoss < 0 ? 'loss' : 'gain'}">
                $${formatCurrency(shortTermTotals.gainLoss + longTermTotals.gainLoss)}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const getFormContent = (formId: string) => {
    switch (formId) {
      case '1040':
        return generateForm1040();
      case 'schedule-a':
        return generateScheduleA();
      case 'schedule-b':
        return generateScheduleB();
      case 'schedule-c':
        return generateScheduleC();
      case 'schedule-d':
        return generateScheduleD();
      case 'schedule-se':
        return generateScheduleSE();
      case 'schedule-1':
        return generateSchedule1();
      case 'schedule-2':
        return generateSchedule2();
      case 'schedule-3':
        return generateSchedule3();
      case 'schedule-e':
        return generateScheduleE();
      case '8949':
        return generateForm8949();
      case 'form-2441':
        return generateForm2441();
      case 'form-8863':
        return generateForm8863();
      case 'form-8880':
        return generateForm8880();
      case 'form-5695':
        return generateForm5695();
      case 'form-8962':
        return generateForm8962();
      case 'form-1116':
        return generateForm1116();
      case 'form-6251':
        return generateForm6251();
      case 'form-8829':
        return generateForm8829();
      case 'schedule-k1':
        return generateScheduleK1();
      case 'form-8959':
        return generateForm8959();
      case 'form-8960':
        return generateForm8960();
      case 'form-8812':
        return generateForm8812();
      case 'form-8995':
        return generateForm8995();
      case 'form-4562':
        return generateForm4562();
      case 'schedule-h':
        return generateScheduleH();
      case 'form-8606':
        return generateForm8606();
      case 'form-8889':
        return generateForm8889();
      case 'form-2106':
        return generateForm2106();
      case 'form-3903':
        return generateForm3903();
      default:
        return `<div class="tax-form"><p>Form ${formId} not yet implemented</p></div>`;
    }
  };

  const downloadForm = (formId: string) => {
    const content = getFormContent(formId);
    const printContent = `
      <html>
        <head>
          <title>${formId.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
            .tax-form { max-width: 8.5in; margin: 0 auto; }
            .form-header { text-align: center; margin-bottom: 20px; }
            .form-header h1 { font-size: 18px; margin: 0; }
            .form-header p { margin: 5px 0; }
            h2 { font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px; margin: 15px 0 10px 0; }
            .info-grid, .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
            .line-items { margin: 10px 0; }
            .line { padding: 3px 0; border-bottom: 1px dotted #ccc; display: flex; justify-content: space-between; }
            .line.total { font-weight: bold; border-bottom: 2px solid #000; }
            .line.refund { font-weight: bold; background-color: #f0f0f0; padding: 5px; }
            .line.note { color: #666; font-style: italic; border-bottom: none; }
            .line.sub-note { padding-left: 20px; font-size: 11px; color: #555; }
            /* Form 8949 specific styles */
            .form-8949 .instructions-note { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #333; }
            .form-8949 .checkbox-row { margin: 10px 0; }
            .form-8949 .box-instruction { font-size: 11px; color: #666; margin-bottom: 5px; }
            .form-8949 .transaction-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .form-8949 .table-header, .form-8949 .transaction-row, .form-8949 .totals-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr 1fr 1fr; gap: 5px; padding: 5px 0; border-bottom: 1px solid #ddd; }
            .form-8949 .table-header { font-weight: bold; background: #f0f0f0; font-size: 10px; }
            .form-8949 .table-header div { padding: 3px; }
            .form-8949 .transaction-row div, .form-8949 .totals-row div { padding: 3px; font-size: 11px; }
            .form-8949 .totals-row { border-top: 2px solid #000; background: #f9f9f9; }
            .form-8949 .col-amount { text-align: right; }
            .form-8949 .col-code { text-align: center; }
            .form-8949 .gain { color: #228B22; }
            .form-8949 .loss { color: #DC143C; }
            .form-8949 .adjustment-codes { background: #f9f9f9; padding: 10px; margin: 15px 0; }
            .form-8949 .code-list { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
            .form-8949 .code-item { font-size: 11px; }
            .form-8949 .summary-section { margin-top: 20px; }
            .form-8949 .summary-grid { display: grid; gap: 10px; }
            .form-8949 .summary-item { display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px dotted #ccc; }
            .form-8949 .summary-item.total { font-weight: bold; border-bottom: 2px solid #000; background: #f0f0f0; }
            .note { font-size: 11px; color: #666; font-style: italic; }
            @media print { body { margin: 0; } .form-8949 .table-header, .form-8949 .transaction-row, .form-8949 .totals-row { font-size: 9px; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formId}-${new Date().getFullYear()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printForm = (formId: string) => {
    const content = getFormContent(formId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${formId.toUpperCase()}</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
              .tax-form { max-width: 8.5in; margin: 0 auto; }
              .form-header { text-align: center; margin-bottom: 20px; }
              .form-header h1 { font-size: 18px; margin: 0; }
              .form-header p { margin: 5px 0; }
              h2 { font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px; margin: 15px 0 10px 0; }
              .info-grid, .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
              .line-items { margin: 10px 0; }
              .line { padding: 3px 0; border-bottom: 1px dotted #ccc; display: flex; justify-content: space-between; }
              .line.total { font-weight: bold; border-bottom: 2px solid #000; }
              .line.refund { font-weight: bold; background-color: #f0f0f0; padding: 5px; }
              .line.note { color: #666; font-style: italic; border-bottom: none; }
              .line.sub-note { padding-left: 20px; font-size: 11px; color: #555; }
              /* Form 8949 specific styles */
              .form-8949 .instructions-note { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #333; }
              .form-8949 .checkbox-row { margin: 10px 0; }
              .form-8949 .box-instruction { font-size: 11px; color: #666; margin-bottom: 5px; }
              .form-8949 .transaction-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              .form-8949 .table-header, .form-8949 .transaction-row, .form-8949 .totals-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr 1fr 1fr; gap: 5px; padding: 5px 0; border-bottom: 1px solid #ddd; }
              .form-8949 .table-header { font-weight: bold; background: #f0f0f0; font-size: 10px; }
              .form-8949 .table-header div { padding: 3px; }
              .form-8949 .transaction-row div, .form-8949 .totals-row div { padding: 3px; font-size: 11px; }
              .form-8949 .totals-row { border-top: 2px solid #000; background: #f9f9f9; }
              .form-8949 .col-amount { text-align: right; }
              .form-8949 .col-code { text-align: center; }
              .form-8949 .gain { color: #228B22; }
              .form-8949 .loss { color: #DC143C; }
              .form-8949 .adjustment-codes { background: #f9f9f9; padding: 10px; margin: 15px 0; }
              .form-8949 .code-list { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
              .form-8949 .code-item { font-size: 11px; }
              .form-8949 .summary-section { margin-top: 20px; }
              .form-8949 .summary-grid { display: grid; gap: 10px; }
              .form-8949 .summary-item { display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px dotted #ccc; }
              .form-8949 .summary-item.total { font-weight: bold; border-bottom: 2px solid #000; background: #f0f0f0; }
              .note { font-size: 11px; color: #666; font-style: italic; }
              @media print { body { margin: 0; } .form-8949 .table-header, .form-8949 .transaction-row, .form-8949 .totals-row { font-size: 9px; } }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        {t('forms.generator.title')}
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('forms.generator.availableForms')}</h4>
          <div className="space-y-2">
            {availableForms.map((form) => {
              const isRequired = form.required;
              const meetsCondition = form.condition === undefined || form.condition;
              const isAvailable = isRequired || meetsCondition;

              return (
                <div
                  key={form.id}
                  className={`p-3 border rounded-lg ${
                    isAvailable ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedForms.includes(form.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForms((prev) => [...prev, form.id]);
                          } else if (!isRequired) {
                            setSelectedForms((prev) => prev.filter((id) => id !== form.id));
                          }
                        }}
                        disabled={!isAvailable || isRequired}
                        className="mt-1"
                      />
                      <div>
                        <div
                          className={`font-medium ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                          {form.name}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        <div
                          className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}
                        >
                          {form.description}
                        </div>
                        {!isAvailable && (
                          <div className="text-xs text-gray-400 mt-1">
                            {t('forms.generator.notRequired')}
                          </div>
                        )}
                      </div>
                    </div>

                    {isAvailable && selectedForms.includes(form.id) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewForm(form.id)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title={t('forms.generator.preview')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadForm(form.id)}
                          className="p-1 text-gray-600 hover:text-green-600"
                          title={t('forms.generator.download')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printForm(form.id)}
                          className="p-1 text-gray-600 hover:text-purple-600"
                          title={t('forms.generator.print')}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => {
              selectedForms.forEach((formId) => downloadForm(formId));
            }}
            disabled={selectedForms.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {t('forms.generator.downloadAll')}
          </button>
          <button
            onClick={() => {
              selectedForms.forEach((formId) => printForm(formId));
            }}
            disabled={selectedForms.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            {t('forms.generator.printAll')}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{previewForm.toUpperCase()} Preview</h3>
              <button
                onClick={() => setPreviewForm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div
                dangerouslySetInnerHTML={{ __html: getFormContent(previewForm) }}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
