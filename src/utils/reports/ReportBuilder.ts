import { STATE_CONFIGS } from '../../engine/states/registry';
import type {
  FederalResult2025,
  TaxPayerInput
} from '../../engine/types';
import type { StateResult } from '../../engine/types/stateTax';
import { addCents } from '../../engine/util/money';
import type { ReportData, ReportMode, ReportRow, ReportSection } from './types';

export class ReportBuilder {
  constructor(
    private federalResult: FederalResult2025,
    private stateResult: StateResult | null,
    private input: TaxPayerInput
  ) {}

  build(mode: ReportMode = 'summary'): ReportData {
    return {
      mode,
      metadata: this.buildMetadata(),
      summary: this.buildSummary(),
      sections: this.buildSections(mode)
    };
  }

  private buildMetadata() {
    const taxpayerName = this.resolveTaxpayerName();
    const ssnLast4 = this.maskSSN(this.input.primary?.ssn);
    const taxYear = this.stateResult?.taxYear ?? 2025;
    const stateCode = this.stateResult?.state;
    const stateName = stateCode ? STATE_CONFIGS[stateCode]?.name ?? stateCode : undefined;

    return {
      taxpayerName,
      filingStatus: this.input.filingStatus,
      ssnLast4,
      state: stateName,
      taxYear,
      generatedAt: new Date().toISOString()
    };
  }

  private buildSummary() {
    const stateLiability = this.stateResult?.totalStateLiability ?? 0;
    const totalTax = addCents(this.federalResult.totalTax, stateLiability);
    const statePayments = this.stateResult
      ? addCents(this.stateResult.stateWithheld, this.stateResult.stateEstPayments)
      : 0;
    const totalPayments = addCents(this.federalResult.totalPayments, statePayments);
    const refundOrOwe = addCents(
      this.federalResult.refundOrOwe,
      this.stateResult?.stateRefundOrOwe ?? 0
    );

    return {
      adjustedGrossIncome: this.federalResult.agi,
      taxableIncome: this.federalResult.taxableIncome,
      totalTax,
      totalPayments,
      refundOrOwe
    };
  }

  private buildSections(mode: ReportMode): ReportSection[] {
    const sections: ReportSection[] = [this.buildFederalSection(mode)];

    if (this.stateResult) {
      sections.push(this.buildStateSection(mode));
    }

    if (mode === 'detailed') {
      sections.push(this.buildPaymentsSection(mode));
    }

    return sections;
  }

  private buildFederalSection(mode: ReportMode): ReportSection {
    const rows: ReportRow[] = [
      this.currencyRow('Adjusted Gross Income', this.federalResult.agi),
      this.currencyRow('Taxable Income', this.federalResult.taxableIncome),
      this.currencyRow('Total Tax', this.federalResult.totalTax)
    ];

    if (mode === 'detailed') {
      rows.push(
        this.currencyRow('Regular Tax', this.federalResult.taxBeforeCredits),
        this.currencyRow('Credits - Child Tax Credit', this.federalResult.credits.ctc || 0, {
          footnote: 'Non-refundable credit applied against tax liability.'
        }),
        this.currencyRow('Credits - Earned Income Tax Credit', this.federalResult.credits.eitc || 0),
        this.currencyRow('Credits - Education (AOTC/LLC)', addCents(
          this.federalResult.credits.aotc || 0,
          this.federalResult.credits.llc || 0,
          this.federalResult.credits.otherRefundable || 0
        )),
        this.currencyRow('Additional Taxes', addCents(
          this.federalResult.additionalTaxes?.seTax || 0,
          this.federalResult.additionalTaxes?.niit || 0,
          this.federalResult.additionalTaxes?.medicareSurtax || 0,
          this.federalResult.additionalTaxes?.amt || 0
        )),
        {
          label: 'Effective Federal Tax Rate',
          value: this.federalResult.agi > 0 ? this.federalResult.totalTax / this.federalResult.agi : 0,
          format: 'percent'
        }
      );
    }

    return {
      title: 'Federal Summary',
      rows
    };
  }

  private buildStateSection(mode: ReportMode): ReportSection {
    if (!this.stateResult) {
      return { title: 'State Summary', rows: [] };
    }

    // Support both old and new StateResult type structure
    const stateAGI = (this.stateResult as any).agiState ?? (this.stateResult as any).stateAGI ?? 0;
    const stateTaxableIncome = (this.stateResult as any).taxableIncomeState ?? (this.stateResult as any).stateTaxableIncome ?? 0;

    const rows: ReportRow[] = [
      this.currencyRow('State AGI', stateAGI),
      this.currencyRow('State Taxable Income', stateTaxableIncome),
      this.currencyRow('State Tax', this.stateResult.totalStateLiability)
    ];

    if (mode === 'detailed') {
      const localTax = (this.stateResult as any).localTax ?? 0;
      const stateCredits = (this.stateResult as any).stateCredits;

      rows.push(
        this.currencyRow('State Base Tax', this.stateResult.stateTax),
        this.currencyRow('Local Tax', localTax)
      );

      if (stateCredits) {
        rows.push(
          this.currencyRow(
            'State Credits (Non-refundable)',
            stateCredits.nonRefundableCredits ?? 0,
            stateCredits.renters
              ? { footnote: 'Includes renter and dependent credits limited by liability.' }
              : undefined
          ),
          this.currencyRow('State Credits (Refundable)', stateCredits.refundableCredits ?? 0)
        );
      }
    }

    const calculationNotes = (this.stateResult as any).calculationNotes;
    if (calculationNotes?.length) {
      rows.push({
        label: 'Notes',
        value: calculationNotes.join('\n'),
        format: 'text'
      });
    }

    return {
      title: `${STATE_CONFIGS[this.stateResult.state]?.name ?? this.stateResult.state} Summary`,
      rows
    };
  }

  private buildPaymentsSection(mode: ReportMode): ReportSection {
    const rows: ReportRow[] = [
      this.currencyRow('Federal Payments / Withholdings', this.federalResult.totalPayments),
      this.currencyRow('Federal Refund / Balance Due', this.federalResult.refundOrOwe)
    ];

    if (this.stateResult) {
      rows.push(
        this.currencyRow('State Withholding', this.stateResult.stateWithheld),
        this.currencyRow('State Estimated Payments', this.stateResult.stateEstPayments),
        this.currencyRow('State Refund / Balance Due', this.stateResult.stateRefundOrOwe)
      );
    }

    return {
      title: 'Payments & Balances',
      rows,
      pageBreakBefore: mode === 'detailed'
    };
  }

  private currencyRow(label: string, value: number, extra: Partial<ReportRow> = {}): ReportRow {
    return {
      label,
      value,
      format: 'currency',
      ...extra
    };
  }

  private resolveTaxpayerName(): string {
    const primary = this.input.primary;
    if (!primary) return 'Primary Taxpayer';

    // FederalPrimaryPerson2025 doesn't have firstName/lastName directly
    // Try to get it from spouse which extends primary, or from input level
    const firstName = (primary as any).firstName || (this.input.spouse as any)?.firstName;
    const lastName = (primary as any).lastName || (this.input.spouse as any)?.lastName;

    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ').trim();
    }

    return 'Primary Taxpayer';
  }

  /**
   * Mask SSN for privacy - shows only last 4 digits
   * Format: ***-**-1234
   * Uses Unicode-safe characters to prevent encoding issues
   */
  private maskSSN(ssn?: string | null): string | undefined {
    if (!ssn) return undefined;

    // Extract digits only
    const digits = ssn.replace(/\D/g, '');

    // Validate SSN length
    if (digits.length !== 9) {
      console.warn(`Invalid SSN format: expected 9 digits, got ${digits.length}`);
      return undefined;
    }

    // Return masked format with Unicode-safe characters
    // Using asterisks instead of bullet points for better compatibility
    return `***-**-${digits.slice(-4)}`;
  }
}
