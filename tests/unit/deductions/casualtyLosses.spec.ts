/**
 * Form 4684: Casualty and Theft Losses Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCasualtyLoss,
  validateCasualtyEvent,
  type CasualtyEvent,
  type CasualtyLossInput,
} from '../../../src/engine/deductions/casualtyLosses';

describe('Form 4684: Casualty and Theft Losses', () => {
  describe('Basic Casualty Loss Calculation', () => {
    it('should calculate loss with $100 floor and 10% AGI limitation', () => {
      const input: CasualtyLossInput = {
        agi: 10000000, // $100,000 AGI
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'fire',
            description: 'House fire',
            dateOfLoss: '2025-06-15',
            propertyDescription: 'Personal residence',
            costOrBasis: 30000000, // $300,000
            fairMarketValueBefore: 35000000, // $350,000
            fairMarketValueAfter: 5000000, // $50,000
            insuranceReimbursement: 20000000, // $200,000
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4673',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Decrease in FMV: $350k - $50k = $300k
      expect(result.eventResults[0].decreaseInFMV).toBe(30000000);

      // Lesser of decrease ($300k) or basis ($300k) = $300k
      expect(result.eventResults[0].lesserAmount).toBe(30000000);

      // After insurance: $300k - $200k = $100k
      expect(result.eventResults[0].lossAfterReimbursement).toBe(10000000);

      // After $100 floor: $100k - $100 = $99,900
      expect(result.eventResults[0].lossAfter100Floor).toBe(9990000);

      // 10% AGI: $100k × 10% = $10k
      expect(result.agiLimit).toBe(1000000);

      // Final deduction: $99,900 - $10,000 = $89,900
      expect(result.casualtyLossDeduction).toBe(8990000);
    });

    it('should use lesser of decrease in FMV or adjusted basis', () => {
      const input: CasualtyLossInput = {
        agi: 5000000, // $50,000
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'flood',
            description: 'Flood damage',
            dateOfLoss: '2025-08-10',
            propertyDescription: 'Vehicle',
            costOrBasis: 1500000, // $15,000 (basis)
            fairMarketValueBefore: 2000000, // $20,000
            fairMarketValueAfter: 500000, // $5,000
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4680',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Decrease: $20k - $5k = $15k
      expect(result.eventResults[0].decreaseInFMV).toBe(1500000);

      // Lesser: min($15k, $15k) = $15k
      expect(result.eventResults[0].lesserAmount).toBe(1500000);

      // After $100 floor: $15k - $100 = $14,900
      expect(result.eventResults[0].lossAfter100Floor).toBe(1490000);

      // 10% AGI: $50k × 10% = $5k
      expect(result.agiLimit).toBe(500000);

      // Deduction: $14,900 - $5,000 = $9,900
      expect(result.casualtyLossDeduction).toBe(990000);
    });

    it('should apply $100 floor per event separately', () => {
      const input: CasualtyLossInput = {
        agi: 5000000, // $50,000
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'theft',
            description: 'Stolen jewelry',
            dateOfLoss: '2025-03-01',
            propertyDescription: 'Jewelry',
            costOrBasis: 500000, // $5,000
            fairMarketValueBefore: 500000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4690',
          },
          {
            type: 'vandalism',
            description: 'Vandalized car',
            dateOfLoss: '2025-07-15',
            propertyDescription: 'Vehicle',
            costOrBasis: 300000, // $3,000
            fairMarketValueBefore: 300000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4690',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Event 1: $5,000 - $100 = $4,900
      expect(result.eventResults[0].lossAfter100Floor).toBe(490000);

      // Event 2: $3,000 - $100 = $2,900
      expect(result.eventResults[1].lossAfter100Floor).toBe(290000);

      // Total: $4,900 + $2,900 = $7,800
      expect(result.totalLossesAfter100Floor).toBe(780000);

      // 10% AGI: $50k × 10% = $5,000
      expect(result.agiLimit).toBe(500000);

      // Deduction: $7,800 - $5,000 = $2,800
      expect(result.casualtyLossDeduction).toBe(280000);
    });
  });

  describe('Post-TCJA Rules (2018+)', () => {
    it('should only allow federally-declared disasters for post-2018', () => {
      const input: CasualtyLossInput = {
        agi: 10000000,
        filingStatus: 'single',
        taxYear: 2025, // Post-TCJA
        casualtyEvents: [
          {
            type: 'fire',
            description: 'House fire (not disaster)',
            dateOfLoss: '2025-06-15',
            propertyDescription: 'Residence',
            costOrBasis: 20000000,
            fairMarketValueBefore: 25000000,
            fairMarketValueAfter: 5000000,
            insuranceReimbursement: 10000000,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: false, // Not a federal disaster
            disasterDesignation: undefined,
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Event should be ineligible
      expect(result.eventResults[0].isEligible).toBe(false);
      expect(result.eventResults[0].ineligibilityReason).toContain('federally-declared disaster');

      // No deduction allowed
      expect(result.casualtyLossDeduction).toBe(0);
      expect(result.eligibleEvents).toBe(0);
      expect(result.ineligibleEvents).toBe(1);
    });

    it('should allow federally-declared disasters for post-2018', () => {
      const input: CasualtyLossInput = {
        agi: 10000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'hurricane',
            description: 'Hurricane damage',
            dateOfLoss: '2025-09-01',
            propertyDescription: 'Home',
            costOrBasis: 30000000,
            fairMarketValueBefore: 35000000,
            fairMarketValueAfter: 10000000,
            insuranceReimbursement: 15000000,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true, // Federal disaster
            disasterDesignation: 'DR-4700',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Event should be eligible
      expect(result.eventResults[0].isEligible).toBe(true);
      expect(result.eligibleEvents).toBe(1);
      expect(result.ineligibleEvents).toBe(0);

      // Should have a deduction
      expect(result.casualtyLossDeduction).toBeGreaterThan(0);
    });

    it('should allow all casualties for pre-2018 years', () => {
      const input: CasualtyLossInput = {
        agi: 10000000,
        filingStatus: 'single',
        taxYear: 2017, // Pre-TCJA
        casualtyEvents: [
          {
            type: 'fire',
            description: 'House fire (not disaster)',
            dateOfLoss: '2017-06-15',
            propertyDescription: 'Residence',
            costOrBasis: 20000000,
            fairMarketValueBefore: 25000000,
            fairMarketValueAfter: 5000000,
            insuranceReimbursement: 10000000,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: false, // Not required pre-TCJA
            disasterDesignation: undefined,
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Event should be eligible (pre-TCJA)
      expect(result.eventResults[0].isEligible).toBe(true);
      expect(result.eligibleEvents).toBe(1);

      // Should have a deduction
      expect(result.casualtyLossDeduction).toBeGreaterThan(0);
    });
  });

  describe('Insurance Reimbursements', () => {
    it('should reduce loss by insurance reimbursement', () => {
      const input: CasualtyLossInput = {
        agi: 5000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'fire',
            description: 'Fire damage',
            dateOfLoss: '2025-04-10',
            propertyDescription: 'Contents',
            costOrBasis: 1000000, // $10,000
            fairMarketValueBefore: 1000000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 800000, // $8,000 insurance
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4710',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Loss after insurance: $10k - $8k = $2,000
      expect(result.eventResults[0].lossAfterReimbursement).toBe(200000);

      // After $100 floor: $2,000 - $100 = $1,900
      expect(result.eventResults[0].lossAfter100Floor).toBe(190000);
    });

    it('should handle full insurance reimbursement (no loss)', () => {
      const input: CasualtyLossInput = {
        agi: 5000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'theft',
            description: 'Stolen item',
            dateOfLoss: '2025-05-20',
            propertyDescription: 'Electronics',
            costOrBasis: 500000, // $5,000
            fairMarketValueBefore: 500000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 500000, // Full reimbursement
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4720',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // No loss after full reimbursement
      expect(result.eventResults[0].lossAfterReimbursement).toBe(0);
      expect(result.eventResults[0].lossAfter100Floor).toBe(0);
      expect(result.casualtyLossDeduction).toBe(0);
    });

    it('should handle insurance + other reimbursements', () => {
      const input: CasualtyLossInput = {
        agi: 5000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'flood',
            description: 'Flood damage',
            dateOfLoss: '2025-08-15',
            propertyDescription: 'Home',
            costOrBasis: 2000000, // $20,000
            fairMarketValueBefore: 2000000,
            fairMarketValueAfter: 500000,
            insuranceReimbursement: 1000000, // $10,000 insurance
            otherReimbursement: 200000, // $2,000 FEMA/other
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4730',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Total reimbursements: $10k + $2k = $12k
      expect(result.eventResults[0].totalReimbursements).toBe(1200000);

      // Loss: $15k decrease - $12k reimbursements = $3,000
      expect(result.eventResults[0].lossAfterReimbursement).toBe(300000);
    });
  });

  describe('Edge Cases', () => {
    it('should return zero deduction when no events', () => {
      const input: CasualtyLossInput = {
        agi: 10000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [],
      };

      const result = calculateCasualtyLoss(input);

      expect(result.casualtyLossDeduction).toBe(0);
      expect(result.eligibleEvents).toBe(0);
      expect(result.eventResults).toHaveLength(0);
    });

    it('should return zero when loss is less than 10% AGI', () => {
      const input: CasualtyLossInput = {
        agi: 10000000, // $100,000 AGI
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'theft',
            description: 'Small theft',
            dateOfLoss: '2025-02-01',
            propertyDescription: 'Item',
            costOrBasis: 500000, // $5,000
            fairMarketValueBefore: 500000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4740',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Loss after $100: $5,000 - $100 = $4,900
      expect(result.totalLossesAfter100Floor).toBe(490000);

      // 10% AGI: $100,000 × 10% = $10,000
      expect(result.agiLimit).toBe(1000000);

      // Deduction: $4,900 - $10,000 = $0 (can't be negative)
      expect(result.casualtyLossDeduction).toBe(0);
    });

    it('should handle loss less than $100 floor', () => {
      const input: CasualtyLossInput = {
        agi: 5000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'theft',
            description: 'Minor theft',
            dateOfLoss: '2025-03-15',
            propertyDescription: 'Item',
            costOrBasis: 5000, // $50
            fairMarketValueBefore: 5000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true,
            disasterDesignation: 'DR-4750',
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      // Loss: $50 < $100 floor → $0
      expect(result.eventResults[0].lossAfter100Floor).toBe(0);
      expect(result.casualtyLossDeduction).toBe(0);
    });

    it('should handle mixed eligible and ineligible events', () => {
      const input: CasualtyLossInput = {
        agi: 5000000,
        filingStatus: 'single',
        taxYear: 2025,
        casualtyEvents: [
          {
            type: 'fire',
            description: 'Disaster fire',
            dateOfLoss: '2025-06-01',
            propertyDescription: 'Home',
            costOrBasis: 1000000,
            fairMarketValueBefore: 1000000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: true, // Eligible
            disasterDesignation: 'DR-4760',
          },
          {
            type: 'theft',
            description: 'Non-disaster theft',
            dateOfLoss: '2025-07-01',
            propertyDescription: 'Item',
            costOrBasis: 500000,
            fairMarketValueBefore: 500000,
            fairMarketValueAfter: 0,
            insuranceReimbursement: 0,
            otherReimbursement: 0,
            isFederallyDeclaredDisaster: false, // Ineligible
          },
        ],
      };

      const result = calculateCasualtyLoss(input);

      expect(result.eligibleEvents).toBe(1);
      expect(result.ineligibleEvents).toBe(1);

      // Only first event counts
      expect(result.totalLossesAfter100Floor).toBe(990000); // $10k - $100
    });
  });

  describe('Validation', () => {
    it('should validate correct casualty event', () => {
      const event: CasualtyEvent = {
        type: 'fire',
        description: 'House fire',
        dateOfLoss: '2025-06-15',
        propertyDescription: 'Residence',
        costOrBasis: 30000000,
        fairMarketValueBefore: 35000000,
        fairMarketValueAfter: 5000000,
        insuranceReimbursement: 20000000,
        otherReimbursement: 0,
        isFederallyDeclaredDisaster: true,
        disasterDesignation: 'DR-4673',
      };

      const validation = validateCasualtyEvent(event);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject negative FMV values', () => {
      const event: CasualtyEvent = {
        type: 'fire',
        description: 'Test',
        dateOfLoss: '2025-06-15',
        propertyDescription: 'Test',
        costOrBasis: 10000,
        fairMarketValueBefore: -100, // Negative!
        fairMarketValueAfter: 0,
        insuranceReimbursement: 0,
        otherReimbursement: 0,
        isFederallyDeclaredDisaster: true,
        disasterDesignation: 'DR-1234',
      };

      const validation = validateCasualtyEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('cannot be negative'))).toBe(true);
    });

    it('should reject FMV after > FMV before', () => {
      const event: CasualtyEvent = {
        type: 'fire',
        description: 'Test',
        dateOfLoss: '2025-06-15',
        propertyDescription: 'Test',
        costOrBasis: 10000,
        fairMarketValueBefore: 10000,
        fairMarketValueAfter: 15000, // Greater than before!
        insuranceReimbursement: 0,
        otherReimbursement: 0,
        isFederallyDeclaredDisaster: true,
        disasterDesignation: 'DR-1234',
      };

      const validation = validateCasualtyEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('cannot exceed'))).toBe(true);
    });

    it('should reject invalid date format', () => {
      const event: CasualtyEvent = {
        type: 'fire',
        description: 'Test',
        dateOfLoss: '06/15/2025', // Wrong format!
        propertyDescription: 'Test',
        costOrBasis: 10000,
        fairMarketValueBefore: 10000,
        fairMarketValueAfter: 5000,
        insuranceReimbursement: 0,
        otherReimbursement: 0,
        isFederallyDeclaredDisaster: true,
        disasterDesignation: 'DR-1234',
      };

      const validation = validateCasualtyEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('YYYY-MM-DD'))).toBe(true);
    });

    it('should require disaster designation for federal disasters', () => {
      const event: CasualtyEvent = {
        type: 'fire',
        description: 'Test',
        dateOfLoss: '2025-06-15',
        propertyDescription: 'Test',
        costOrBasis: 10000,
        fairMarketValueBefore: 10000,
        fairMarketValueAfter: 5000,
        insuranceReimbursement: 0,
        otherReimbursement: 0,
        isFederallyDeclaredDisaster: true,
        disasterDesignation: undefined, // Missing!
      };

      const validation = validateCasualtyEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Disaster designation'))).toBe(true);
    });
  });
});
