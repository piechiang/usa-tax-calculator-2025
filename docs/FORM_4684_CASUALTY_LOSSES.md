# Form 4684: Casualties and Thefts Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 18 tests

## Overview

Implemented Form 4684 calculation for personal casualty and theft loss deductions. This feature handles losses from disasters, fires, storms, theft, and other casualties with proper post-TCJA limitations.

## Key Rules

### Post-TCJA Changes (2018+)

**Pre-TCJA (before 2018)**:
- All personal casualty/theft losses were deductible
- Applied $100 floor per event
- Applied 10% AGI limitation

**Post-TCJA (2018+)**:
- ❌ Personal casualty losses ONLY deductible if from **federally-declared disaster**
- ✅ Same $100 floor per event
- ✅ Same 10% AGI limitation
- ✅ Business/income-producing property still deductible

###Calculation Steps

#### Step 1: Determine Decrease in FMV
```
Decrease in FMV = FMV Before - FMV After
```

#### Step 2: Lesser of Decrease or Adjusted Basis
```
Loss Amount = min(Decrease in FMV, Cost or Adjusted Basis)
```

#### Step 3: Subtract Reimbursements
```
Loss After Reimbursement = Loss Amount - Insurance - Other Reimbursements
```

#### Step 4: Apply $100 Floor (Per Event)
```
Loss After $100 = max(0, Loss After Reimbursement - $100)
```

#### Step 5: Total All Events
```
Total Losses = Sum of all eligible events (after $100 floor)
```

#### Step 6: Apply 10% AGI Limitation
```
Casualty Loss Deduction = max(0, Total Losses - (10% × AGI))
```

## Implementation Files

### Core Logic
**`src/engine/deductions/casualtyLosses.ts`** (370 lines)
- `calculateCasualtyLoss()` - Main calculation
- `validateCasualtyEvent()` - Input validation
- `formatCasualtyLossResult()` - Display formatting
- `isFederalDisasterDate()` - Disaster verification (stub)

### Types
- `CasualtyEvent` - Single casualty/theft event
- `CasualtyLossInput` - Calculation input
- `CasualtyEventResult` - Per-event results
- `CasualtyLossResult` - Overall deduction result
- `CasualtyType` - Event type enum

### Tests
**`tests/unit/deductions/casualtyLosses.spec.ts`** (18 tests)
- Basic calculation with $100 floor and 10% AGI
- Lesser of decrease or basis
- Multiple events ($100 floor per event)
- Post-TCJA federal disaster requirement
- Pre-TCJA all casualties allowed
- Insurance reimbursements
- Edge cases (no loss, small loss, mixed eligible/ineligible)
- Validation (negative values, invalid dates, missing data)

## Usage Example

```typescript
import { calculateCasualtyLoss } from './engine/deductions/casualtyLosses';

const result = calculateCasualtyLoss({
  agi: 10000000, // $100,000 AGI
  filingStatus: 'single',
  taxYear: 2025,
  casualtyEvents: [
    {
      type: 'fire',
      description: 'House fire from wildfire',
      dateOfLoss: '2025-08-15',
      propertyDescription: 'Personal residence',
      costOrBasis: 30000000, // $300,000
      fairMarketValueBefore: 35000000, // $350,000
      fairMarketValueAfter: 5000000, // $50,000
      insuranceReimbursement: 20000000, // $200,000
      otherReimbursement: 0,
      isFederallyDeclaredDisaster: true,
      disasterDesignation: 'DR-4673', // FEMA disaster number
    },
  ],
});

console.log(`Casualty Loss Deduction: $${result.casualtyLossDeduction / 100}`);
// Output: "Casualty Loss Deduction: $89,900"
```

## Calculation Example

### Scenario
Taxpayer has $100,000 AGI and experienced a house fire in a federally-declared disaster area:

| Item | Value |
|------|-------|
| Cost/Basis | $300,000 |
| FMV Before | $350,000 |
| FMV After | $50,000 |
| Insurance Reimbursement | $200,000 |

### Step-by-Step Calculation

```
Step 1: Decrease in FMV
  $350,000 - $50,000 = $300,000

Step 2: Lesser of Decrease or Basis
  min($300,000, $300,000) = $300,000

Step 3: Subtract Reimbursements
  $300,000 - $200,000 = $100,000

Step 4: Apply $100 Floor
  $100,000 - $100 = $99,900

Step 5: Total All Events
  Total = $99,900 (single event)

Step 6: Apply 10% AGI Limitation
  $99,900 - ($100,000 × 10%) = $99,900 - $10,000 = $89,900

Final Deduction: $89,900
```

## Supported Casualty Types

1. **Fire** - House fires, wildfires
2. **Storm** - Hurricanes, tornadoes, severe storms
3. **Flood** - Flooding from natural disasters
4. **Earthquake** - Earthquake damage
5. **Hurricane** - Specific hurricane events
6. **Tornado** - Tornado destruction
7. **Theft** - Stolen property
8. **Vandalism** - Intentional property damage
9. **Other** - Other qualifying casualties

## Federal Disaster Requirement (Post-TCJA)

### What Qualifies

✅ **Federally-Declared Disasters**:
- FEMA disaster declarations
- Presidential disaster areas
- Major disaster declarations
- Emergency declarations

❌ **Not Deductible** (post-2018):
- Regular house fires (non-disaster)
- Theft (unless in disaster area)
- Vandalism (unless disaster-related)
- Personal accidents
- Gradual deterioration

### Disaster Designation

- Format: `DR-XXXX` (e.g., "DR-4673")
- Issued by FEMA
- Available at: https://www.fema.gov/disasters
- Required for deductibility

## Insurance Reimbursements

### Types of Reimbursements

1. **Insurance Proceeds**:
   - Property insurance payouts
   - Casualty insurance claims
   - Homeowner's insurance

2. **Other Reimbursements**:
   - FEMA disaster assistance
   - State disaster relief
   - Employer assistance
   - Charitable donations received

### Important Rules

- Must reduce loss by **expected** reimbursements (not just received)
- Cannot deduct if full reimbursement expected
- Actual reimbursement less than expected: Can file amended return
- Reimbursement more than expected: Report as gain

## IRS Form References

- **Form 4684**: Casualties and Thefts
  - Section A: Personal Use Property
  - Section B: Business and Income-Producing Property

- **Schedule A (Form 1040)**: Line 15 - Casualty and theft losses
  - Limited to federally-declared disasters (2018+)

- **IRS Publication 547**: Casualties, Disasters, and Thefts
  - Comprehensive guide
  - Examples and worksheets
  - Disaster area listings

- **IRC §165(h)**: Limitation on losses of individuals
  - $100 floor statute
  - 10% AGI limitation

## Validation Rules

### Required Fields
- ✅ Event type and description
- ✅ Date of loss (YYYY-MM-DD format)
- ✅ Property description
- ✅ Cost/adjusted basis
- ✅ FMV before and after

### Validation Checks
- ❌ FMV values cannot be negative
- ❌ FMV after cannot exceed FMV before
- ❌ Cost/basis cannot be negative
- ❌ Reimbursements cannot be negative
- ❌ Federal disasters must have designation

## Special Scenarios

### Multiple Events

$100 floor applies **per event separately**:

```
Event 1: $5,000 loss → $4,900 (after $100 floor)
Event 2: $3,000 loss → $2,900 (after $100 floor)
Total: $7,800 (before 10% AGI)
```

NOT:
```
Total: $8,000 - $100 = $7,900 (WRONG!)
```

### Partial Year Disasters

- Date of loss determines tax year
- Can elect to claim in prior year (disaster relief)
- Requires amended return if elected

### Business vs. Personal Property

- **Personal**: Subject to $100 floor + 10% AGI (Form 4684 Section A)
- **Business**: No $100 floor, no 10% AGI (Form 4684 Section B, Schedule C)
- **Rental**: Treated as business property (Schedule E)

## Not Currently Implemented

### Future Enhancements

1. **FEMA API Integration**:
   - Automatic disaster verification
   - Disaster area lookup by zip code
   - Date range validation

2. **Prior Year Election**:
   - Elect to claim disaster loss in prior tax year
   - Generate amended return (Form 1040-X)

3. **Gains from Reimbursements**:
   - Handle insurance proceeds > basis
   - Involuntary conversion rules (IRC §1033)

4. **Pending Reimbursements**:
   - Track expected vs. received reimbursements
   - Generate "reasonable prospect" adjustments

5. **State Casualty Loss**:
   - State-specific rules (often follow federal)
   - State disaster declarations

## Test Coverage

```
✓ Basic calculation ($100 floor + 10% AGI)
✓ Lesser of decrease or basis
✓ Multiple events (separate $100 floors)
✓ Post-TCJA federal disaster requirement
✓ Pre-TCJA all casualties allowed
✓ Insurance reimbursement reduction
✓ Full reimbursement (no deduction)
✓ Insurance + other reimbursements
✓ Zero deduction cases
✓ Loss less than 10% AGI
✓ Loss less than $100 floor
✓ Mixed eligible/ineligible events
✓ Validation (negative values, invalid formats)
```

## Integration Status

**Status**: ⚠️ **Standalone** (Not yet integrated into federal calculation)

### To Integrate

1. Add `casualtyEvents?` field to `FederalInput2025`
2. Add `casualtyLossDeduction?` to `FederalResult2025`
3. Calculate in deductions section (Schedule A itemized)
4. Apply to itemized deductions calculation

### Integration Example (Future)

```typescript
// In computeFederal2025.ts
if (input.casualtyEvents && input.casualtyEvents.length > 0) {
  const casualtyResult = calculateCasualtyLoss({
    casualtyEvents: input.casualtyEvents,
    agi,
    filingStatus: input.filingStatus,
    taxYear: 2025,
  });

  // Add to itemized deductions
  itemized.casualtyLosses = casualtyResult.casualtyLossDeduction;
}
```

## Sources

1. **IRC §165(h)**: Limitation on losses of individuals
2. **TCJA 2017**: Personal casualty loss suspension
3. **IRS Publication 547**: Casualties, Disasters, and Thefts
4. **Form 4684**: Casualties and Thefts
5. **Rev. Proc. 2018-08**: Disaster relief procedures
6. **FEMA Disaster Declarations**: https://www.fema.gov/disasters

## Compliance Notes

- **Post-TCJA Rule**: Critical to verify federal disaster designation
- **Documentation**: Taxpayers must maintain:
  - Photos of damage
  - Repair estimates
  - Insurance claims
  - Police reports (for theft)
  - FEMA disaster number
- **Amended Returns**: Common for disasters (reimbursements clarify)
- **Deduction Timing**: Generally year of loss (or prior year election)

---

**Implementation Complete**: 2025-01-22
**Status**: Standalone calculation (integration pending)
**Next**: Integrate into federal itemized deductions (Schedule A)

## Test Results

```
✓ All 18 casualty loss tests passing
✓ All 713 total tests passing
✓ Zero regressions
```

---

**P1 Engine Enhancements: 100% COMPLETE** 🎉

All 4 P1 items finished:
1. ✅ Form 2210 - Underpayment penalty
2. ✅ Form 8962 - Premium Tax Credit
3. ✅ NOL Carryforward
4. ✅ Form 4684 - Casualty/Theft Losses
