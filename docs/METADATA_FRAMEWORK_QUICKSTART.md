# State Tax Framework Quick Start Guide

## Add a New State in 5 Minutes

This guide shows you how to add a new state to the tax calculator using the metadata-driven framework. No TypeScript coding required!

---

## Prerequisites

- Basic understanding of state income tax concepts
- Official state tax documentation
- Text editor with YAML syntax highlighting

---

## Step 1: Create Configuration File (2 minutes)

Create `src/engine/states/metadata/configs/XX_2025.yaml` where XX is your state code.

### Example: Texas (No Income Tax)

```yaml
metadata:
  stateCode: TX
  stateName: Texas
  taxYear: 2025
  version: "1.0.0"
  lastUpdated: "2025-01-15"
  sources:
    - "Texas Comptroller of Public Accounts"

structure: flat
flatRate: 0.00  # No income tax

standardDeduction:
  available: false
  amounts:
    single: 0
    marriedJointly: 0
    marriedSeparately: 0
    headOfHousehold: 0

agiModifications:
  additions: []
  subtractions: []

credits: []

documentation:
  primaryForm: "N/A"
  authorityUrl: "https://comptroller.texas.gov/"
```

---

## Step 2: Validate (30 seconds)

```bash
npm run validate-config XX_2025
```

---

## Step 3: Create Tests (2 minutes)

```typescript
it('should calculate TX tax correctly', () => {
  const result = calculateStateFromMetadata(input, config);
  expect(result.stateTax).toBe(0); // TX has no income tax
});
```

---

## Resources

- [Full Documentation](METADATA_DRIVEN_STATE_TAX_FRAMEWORK.md)
- [Example Configurations](../src/engine/states/metadata/configs/)
