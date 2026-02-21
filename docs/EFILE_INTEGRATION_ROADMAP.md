# E-File Integration Roadmap

## Overview

This document outlines the technical requirements and implementation roadmap for integrating IRS e-file capabilities into the USA Tax Calculator 2025.

## IRS e-File System Overview

### Modernized e-File (MeF)

The IRS uses the **Modernized e-File (MeF)** system for electronic tax return submission. Key characteristics:

- **XML-based format** - All returns must be submitted in IRS-approved XML format
- **Web-based submission** - Returns are transmitted via internet to IRS servers
- **Schema validation** - XML must conform to IRS-defined schemas
- **Business rules validation** - Returns must pass IRS business rules before acceptance

### Resources

- [MeF Schemas and Business Rules](https://www.irs.gov/e-file-providers/modernized-e-file-mef-schemas-and-business-rules)
- [Individual Tax Returns Schemas](https://www.irs.gov/e-file-providers/modernized-e-file-schema-and-business-rules-for-individual-tax-returns-and-extensions)
- [MeF Overview](https://www.irs.gov/e-file-providers/modernized-e-file-overview)

---

## Becoming an Authorized e-File Provider

### Requirements

1. **e-Services Account** - Must have approved e-Services username and password
2. **e-File Application** - Complete IRS e-file provider application (up to 45 days for approval)
3. **Suitability Check** - IRS conducts background checks on principals
4. **EFIN** - Receive Electronic Filing Identification Number

### Provider Types

| Type | Description |
|------|-------------|
| ERO | Electronic Return Originator - prepares and submits returns |
| Transmitter | Sends returns to IRS on behalf of EROs |
| Software Developer | Creates e-file software |
| Intermediate Service Provider | Processes returns between EROs and transmitters |

### Application Process

1. Create e-Services account at [IRS e-Services](https://www.irs.gov/e-services)
2. Submit e-file application (Form 8633)
3. Pass suitability checks
4. Receive EFIN approval
5. Complete Assurance Testing System (ATS) testing

---

## Technical Requirements

### 1. XML Schema Compliance

**Form 1040 Series Schema Requirements:**

```xml
<!-- Example structure (simplified) -->
<Return xmlns="http://www.irs.gov/efile">
  <ReturnHeader>
    <TaxYr>2025</TaxYr>
    <TaxPeriodBeginDt>2025-01-01</TaxPeriodBeginDt>
    <TaxPeriodEndDt>2025-12-31</TaxPeriodEndDt>
    <Filer>
      <EIN>...</EIN>
      <PrimarySSN>...</PrimarySSN>
      <NameLine1Txt>...</NameLine1Txt>
    </Filer>
  </ReturnHeader>
  <ReturnData>
    <IRS1040>...</IRS1040>
    <IRS1040ScheduleA>...</IRS1040ScheduleA>
    <!-- Additional schedules -->
  </ReturnData>
</Return>
```

**Schema Access:**
- Schemas are distributed via IRS Secure Object Repository (SOR)
- Requires active e-Services account with software developer role
- Updated annually with tax year changes

### 2. Business Rules Validation

Before submission, returns must pass ~4,000+ business rules including:

- Mathematical accuracy checks
- Cross-reference validations
- Data consistency rules
- Schedule requirement rules

### 3. Security Requirements

- **TLS 1.2+** for all transmissions
- **Digital signatures** on transmitted returns
- **Encryption** of sensitive data
- **Audit logging** of all e-file activities

### 4. Testing Requirements

**Assurance Testing System (ATS):**

1. Submit test returns to IRS ATS environment
2. Pass all required test scenarios
3. Demonstrate error handling
4. Validate acknowledgment processing

---

## Implementation Phases

### Phase 3a: XML Generation (Current Focus)

**Goal:** Generate IRS-compliant XML from calculator data

**Tasks:**
1. Map calculator data model to IRS schema elements
2. Create XML generation service
3. Implement schema validation
4. Build business rules pre-validation

**Deliverables:**
- `src/services/efileXmlGenerator.ts` - XML generation
- `src/services/efileValidator.ts` - Schema/rules validation
- `src/utils/irsSchemaMapping.ts` - Data mapping

### Phase 3b: Provider Registration

**Goal:** Complete IRS e-file provider application

**Requirements:**
- Business entity registration
- Principal/responsible official identification
- Background check completion
- EFIN acquisition

**Timeline:** 45-90 days (IRS processing)

### Phase 3c: Testing Integration

**Goal:** Pass IRS Assurance Testing System

**Tasks:**
1. Set up ATS environment connection
2. Create test return scenarios
3. Submit test returns
4. Process acknowledgments
5. Address rejection scenarios

### Phase 3d: Production Integration

**Goal:** Enable live e-filing

**Tasks:**
1. Production transmitter setup
2. Real-time status tracking
3. Acknowledgment processing
4. Error handling and resubmission

---

## Data Mapping: Calculator → IRS XML

### Personal Information

| Calculator Field | IRS XML Element |
|-----------------|-----------------|
| `personalInfo.firstName` | `//Filer/NameLine1Txt` |
| `personalInfo.lastName` | `//Filer/NameLine1Txt` |
| `personalInfo.ssn` | `//Filer/PrimarySSN` |
| `personalInfo.filingStatus` | `//IRS1040/IndividualReturnFilingStatusCd` |
| `personalInfo.address` | `//Filer/USAddress/*` |

### Income

| Calculator Field | IRS XML Element |
|-----------------|-----------------|
| `income.wages` | `//IRS1040/WagesAmt` |
| `income.interest` | `//IRS1040/TaxableInterestAmt` |
| `income.dividends.ordinary` | `//IRS1040/OrdinaryDividendsAmt` |
| `income.dividends.qualified` | `//IRS1040/QualifiedDividendsAmt` |
| `income.capitalGains.shortTerm` | `//IRS1040ScheduleD/NetSTCGOrLossAmt` |
| `income.capitalGains.longTerm` | `//IRS1040ScheduleD/NetLTCGOrLossAmt` |

### Deductions

| Calculator Field | IRS XML Element |
|-----------------|-----------------|
| `itemized.stateLocalTaxes` | `//IRS1040ScheduleA/StateAndLocalTaxAmt` |
| `itemized.mortgageInterest` | `//IRS1040ScheduleA/MortgageInterestAmt` |
| `itemized.charitable` | `//IRS1040ScheduleA/GiftsToCharityAmt` |
| `itemized.medical` | `//IRS1040ScheduleA/MedicalAndDentalExpensesAmt` |

### Tax Calculation

| Calculator Field | IRS XML Element |
|-----------------|-----------------|
| `result.agi` | `//IRS1040/AdjustedGrossIncomeAmt` |
| `result.taxableIncome` | `//IRS1040/TaxableIncomeAmt` |
| `result.totalTax` | `//IRS1040/TotalTaxAmt` |
| `result.federalWithheld` | `//IRS1040/WithholdingTaxAmt` |
| `result.refundAmount` | `//IRS1040/OverpaidAmt` |

---

## Alternative: Third-Party Integration

Instead of becoming a direct IRS transmitter, consider partnering with:

### Option A: Transmitter Partnership

Partner with an existing authorized transmitter who handles:
- IRS communication
- Security compliance
- Acknowledgment processing

**Pros:**
- Faster time to market
- Lower compliance burden
- Shared infrastructure costs

**Cons:**
- Revenue sharing
- Less control
- Dependency on partner

### Option B: API Integration Services

Services that provide e-file API access:
- **TaxBandits API** - 1099, W-2, 94x forms
- **Intuit Tax API** - Full tax preparation
- **Drake Software API** - Professional tax software

### Option C: IRS Free File Alliance

Join IRS Free File program for taxpayers with AGI below threshold:
- Direct IRS partnership
- Free filing for eligible taxpayers
- Brand visibility on IRS.gov

---

## Security Considerations

### Data Protection

```typescript
// Example: Secure SSN handling
interface SecureSSN {
  encrypted: string;  // AES-256 encrypted
  masked: string;     // XXX-XX-1234 for display
  hash: string;       // For duplicate detection
}

function encryptSSN(ssn: string, key: CryptoKey): Promise<SecureSSN>;
function decryptSSN(secure: SecureSSN, key: CryptoKey): Promise<string>;
```

### Audit Requirements

All e-file operations must be logged:
- Submission timestamps
- User identity
- Return identifiers
- Status changes
- Error details

### Retention Requirements

- **3 years minimum** for e-filed return records
- **7 years** for returns with claims or amendments
- Secure deletion after retention period

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 3a: XML Generation | 4-6 weeks | Calculator data model |
| 3b: Provider Registration | 6-12 weeks | Business registration |
| 3c: ATS Testing | 4-8 weeks | Provider approval |
| 3d: Production Launch | 2-4 weeks | ATS certification |
| **Total** | **16-30 weeks** | |

---

## Next Steps

1. **Immediate:** Create XML generation prototype
2. **Short-term:** Begin e-file provider application
3. **Medium-term:** Establish transmitter partnership OR complete ATS
4. **Long-term:** Full production e-file capability

---

## References

- [Become an Authorized e-File Provider](https://www.irs.gov/e-file-providers/become-an-authorized-e-file-provider)
- [E-File Provider Services](https://www.irs.gov/tax-professionals/e-file-provider-services)
- [MeF User Guides and Publications](https://www.irs.gov/e-file-providers/modernized-e-file-mef-user-guides-and-publications)
- [Publication 4164 - MeF Guide for Software Developers](https://www.irs.gov/pub/irs-pdf/p4164.pdf)
- [Tax Year 2025 1040 MeF Release Memo](https://www.irs.gov/e-file-providers/release-memo-for-tax-year-2025-modernized-e-file-schema-and-business-rules-for-individual-tax-returns-version-1-point-0)
