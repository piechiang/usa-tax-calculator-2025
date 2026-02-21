/**
 * Form 4684: Casualties and Thefts
 *
 * Deduction for personal casualty and theft losses.
 *
 * Post-TCJA Rules (2018+):
 * - Personal casualty losses are ONLY deductible if from a federally-declared disaster
 * - $100 floor per casualty event
 * - 10% AGI limitation applies to total net losses
 * - Must reduce by insurance or other reimbursements
 *
 * Pre-TCJA (before 2018):
 * - All personal casualty/theft losses were deductible
 * - Same $100 floor and 10% AGI limitation
 *
 * Sources:
 * - IRC §165(h): Limitation on losses of individuals
 * - TCJA 2017: Suspended personal casualty loss deduction (except disasters)
 * - IRS Publication 547: Casualties, Disasters, and Thefts
 * - Form 4684: Casualties and Thefts
 */

import type { FilingStatus } from '../types';

/**
 * Types of casualty events
 */
export type CasualtyType =
  | 'fire'
  | 'storm'
  | 'flood'
  | 'earthquake'
  | 'hurricane'
  | 'tornado'
  | 'theft'
  | 'vandalism'
  | 'other';

/**
 * Individual casualty or theft event
 */
export interface CasualtyEvent {
  type: CasualtyType;
  description: string;
  dateOfLoss: string; // YYYY-MM-DD

  // Property details
  propertyDescription: string;
  costOrBasis: number; // Original cost or adjusted basis (cents)
  fairMarketValueBefore: number; // FMV before casualty (cents)
  fairMarketValueAfter: number; // FMV after casualty (cents)

  // Insurance and reimbursements
  insuranceReimbursement: number; // Insurance proceeds received (cents)
  otherReimbursement: number; // Other reimbursements (cents)

  // Disaster designation
  isFederallyDeclaredDisaster: boolean; // Required for post-TCJA deductibility
  disasterDesignation?: string; // FEMA disaster number (e.g., "DR-4673")
}

/**
 * Casualty loss deduction input
 */
export interface CasualtyLossInput {
  casualtyEvents: CasualtyEvent[];
  agi: number; // Adjusted Gross Income (cents)
  filingStatus: FilingStatus;
  taxYear: number; // For determining TCJA rules
}

/**
 * Casualty loss calculation for a single event
 */
export interface CasualtyEventResult {
  event: CasualtyEvent;

  // Step 1: Determine decrease in FMV
  decreaseInFMV: number; // FMV before - FMV after (cents)

  // Step 2: Lesser of decrease or adjusted basis
  lesserAmount: number; // min(decrease, costOrBasis) (cents)

  // Step 3: Subtract reimbursements
  totalReimbursements: number; // Insurance + other (cents)
  lossAfterReimbursement: number; // lesserAmount - reimbursements (cents)

  // Step 4: Apply $100 floor per event
  lossAfter100Floor: number; // max(0, lossAfterReimbursement - 100) (cents)

  // Eligibility
  isEligible: boolean; // Post-TCJA: must be federally-declared disaster
  ineligibilityReason?: string;
}

/**
 * Overall casualty loss deduction result
 */
export interface CasualtyLossResult {
  eventResults: CasualtyEventResult[];

  // Total losses after $100 floor
  totalLossesAfter100Floor: number; // Sum of all eligible events (cents)

  // 10% AGI limitation
  agiLimit: number; // 10% of AGI (cents)

  // Final deduction
  casualtyLossDeduction: number; // max(0, totalLosses - agiLimit) (cents)

  // Summary
  eligibleEvents: number; // Count of eligible events
  ineligibleEvents: number; // Count of ineligible events (non-disaster post-TCJA)
  totalReimbursements: number; // Total insurance/other reimbursements (cents)
}

/**
 * Calculate casualty and theft loss deduction
 *
 * @param input Casualty loss input
 * @returns Casualty loss deduction result
 */
export function calculateCasualtyLoss(input: CasualtyLossInput): CasualtyLossResult {
  const { casualtyEvents, agi, taxYear } = input;

  const eventResults: CasualtyEventResult[] = [];
  let totalLossesAfter100Floor = 0;
  let totalReimbursements = 0;
  let eligibleEvents = 0;
  let ineligibleEvents = 0;

  // Process each casualty event
  for (const event of casualtyEvents) {
    // Step 1: Determine decrease in FMV
    const decreaseInFMV = event.fairMarketValueBefore - event.fairMarketValueAfter;

    // Step 2: Lesser of decrease in FMV or adjusted basis
    const lesserAmount = Math.min(decreaseInFMV, event.costOrBasis);

    // Step 3: Subtract reimbursements
    const eventTotalReimbursements = event.insuranceReimbursement + event.otherReimbursement;
    const lossAfterReimbursement = Math.max(0, lesserAmount - eventTotalReimbursements);

    // Step 4: Apply $100 floor per event
    const FLOOR_PER_EVENT = 10000; // $100 in cents
    const lossAfter100Floor = Math.max(0, lossAfterReimbursement - FLOOR_PER_EVENT);

    // Check eligibility (Post-TCJA: must be federally-declared disaster)
    let isEligible = true;
    let ineligibilityReason: string | undefined;

    if (taxYear >= 2018) {
      // Post-TCJA: Only federally-declared disasters are deductible
      if (!event.isFederallyDeclaredDisaster) {
        isEligible = false;
        ineligibilityReason =
          'Personal casualty losses are only deductible for federally-declared disasters (post-TCJA)';
      }
    }

    // Add to results
    eventResults.push({
      event,
      decreaseInFMV,
      lesserAmount,
      totalReimbursements: eventTotalReimbursements,
      lossAfterReimbursement,
      lossAfter100Floor,
      isEligible,
      ineligibilityReason,
    });

    // Accumulate totals (only eligible events)
    if (isEligible) {
      totalLossesAfter100Floor += lossAfter100Floor;
      totalReimbursements += eventTotalReimbursements;
      eligibleEvents++;
    } else {
      ineligibleEvents++;
    }
  }

  // Apply 10% AGI limitation
  const agiLimit = Math.floor(agi * 0.1);
  const casualtyLossDeduction = Math.max(0, totalLossesAfter100Floor - agiLimit);

  return {
    eventResults,
    totalLossesAfter100Floor,
    agiLimit,
    casualtyLossDeduction,
    eligibleEvents,
    ineligibleEvents,
    totalReimbursements,
  };
}

/**
 * Format casualty loss result for display
 */
export function formatCasualtyLossResult(result: CasualtyLossResult): string {
  const lines: string[] = [];

  lines.push('=== Form 4684: Casualty and Theft Losses ===');
  lines.push('');

  if (result.eventResults.length === 0) {
    lines.push('No casualty events reported.');
    return lines.join('\n');
  }

  lines.push(`Total Events: ${result.eventResults.length}`);
  lines.push(`Eligible Events: ${result.eligibleEvents}`);
  if (result.ineligibleEvents > 0) {
    lines.push(`Ineligible Events: ${result.ineligibleEvents} (non-disaster post-TCJA)`);
  }
  lines.push('');

  // Detail each event
  for (let i = 0; i < result.eventResults.length; i++) {
    const eventResult = result.eventResults[i];
    if (!eventResult) continue;
    const event = eventResult.event;

    lines.push(`Event ${i + 1}: ${event.type} - ${event.description}`);
    lines.push(`  Date: ${event.dateOfLoss}`);
    lines.push(`  Property: ${event.propertyDescription}`);

    if (!eventResult.isEligible) {
      lines.push(`  ❌ INELIGIBLE: ${eventResult.ineligibilityReason}`);
      lines.push('');
      continue;
    }

    lines.push(
      `  FMV Before: $${(event.fairMarketValueBefore / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );
    lines.push(
      `  FMV After: $${(event.fairMarketValueAfter / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );
    lines.push(
      `  Decrease in FMV: $${(eventResult.decreaseInFMV / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );
    lines.push(
      `  Cost/Basis: $${(event.costOrBasis / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );
    lines.push(
      `  Lesser Amount: $${(eventResult.lesserAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );

    if (eventResult.totalReimbursements > 0) {
      lines.push(
        `  Reimbursements: $${(eventResult.totalReimbursements / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      );
    }

    lines.push(
      `  Loss After $100 Floor: $${(eventResult.lossAfter100Floor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    );

    if (event.isFederallyDeclaredDisaster && event.disasterDesignation) {
      lines.push(`  ✓ Federally-Declared Disaster: ${event.disasterDesignation}`);
    }

    lines.push('');
  }

  // Summary
  lines.push('--- Summary ---');
  lines.push(
    `Total Losses (after $100 floor): $${(result.totalLossesAfter100Floor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  );
  lines.push(
    `Less: 10% AGI Limitation: $${(result.agiLimit / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  );
  lines.push(
    `Casualty Loss Deduction: $${(result.casualtyLossDeduction / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  );

  return lines.join('\n');
}

/**
 * Validate casualty event data
 */
export function validateCasualtyEvent(event: CasualtyEvent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // FMV validation
  if (event.fairMarketValueBefore < 0) {
    errors.push('Fair market value before loss cannot be negative');
  }

  if (event.fairMarketValueAfter < 0) {
    errors.push('Fair market value after loss cannot be negative');
  }

  if (event.fairMarketValueAfter > event.fairMarketValueBefore) {
    errors.push('Fair market value after loss cannot exceed value before loss');
  }

  // Cost/basis validation
  if (event.costOrBasis < 0) {
    errors.push('Cost or adjusted basis cannot be negative');
  }

  // Reimbursement validation
  if (event.insuranceReimbursement < 0) {
    errors.push('Insurance reimbursement cannot be negative');
  }

  if (event.otherReimbursement < 0) {
    errors.push('Other reimbursement cannot be negative');
  }

  // Date validation (basic format check)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(event.dateOfLoss)) {
    errors.push('Date of loss must be in YYYY-MM-DD format');
  }

  // Disaster designation check
  if (event.isFederallyDeclaredDisaster && !event.disasterDesignation) {
    errors.push('Disaster designation (FEMA number) required for federally-declared disasters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if date falls within a federally-declared disaster period
 *
 * This is a simplified check. In a production system, you would:
 * - Query FEMA disaster database
 * - Check disaster declaration dates
 * - Verify county/location eligibility
 */
export function isFederalDisasterDate(dateOfLoss: string, disasterDesignation?: string): boolean {
  // Simplified: If disaster designation is provided, assume it's valid
  // In production, validate against FEMA API/database
  return !!disasterDesignation && disasterDesignation.startsWith('DR-');
}
