# New York (NY) State Tax Engine

## Status
⚠️ **IN DEVELOPMENT** - This engine is a skeleton and needs to be completed

## Overview
New York has a graduated income tax with local taxes.

## Tax Structure (2025)
- **Tax Type**: graduated
- **Local Tax**: Yes
- **State EITC**: Yes (30% of federal)

## Implementation Checklist

### 1. Research Tax Rules
- [ ] Download 2025 New York tax forms and instructions
- [ ] Review New York standard deduction amounts
- [ ] Review New York personal exemption (if applicable)
- [ ] Review New York tax brackets/rates
- [ ] Review New York credits
- [ ] Review local tax rates by county/city

### 2. Update Rule Files
- [ ] `rules/2025/brackets.ts` - Update tax brackets
- [ ] `rules/2025/deductions.ts` - Update standard deduction
- [ ] `rules/2025/credits.ts` - Add New York-specific credits
- [ ] `rules/${year}/index.ts` - Add local tax rates

### 3. Implement Calculator
- [ ] `computeNY2025.ts` - Complete AGI calculation
- [ ] `computeNY2025.ts` - Complete deduction calculation
- [ ] `computeNY2025.ts` - Complete credit calculation
- [ ] `compute${codeUpper}${year}.ts` - Complete local tax calculation

### 4. Write Tests
- [ ] Add basic scenarios (single, MFJ, HOH)
- [ ] Add high/low income scenarios
- [ ] Add deduction scenarios
- [ ] Add credit scenarios
- [ ] Add local tax scenarios
- [ ] Verify against New York tax calculators

### 5. Register State
- [ ] Update `src/engine/states/registry.ts` to include NY
- [ ] Update `STATE_CONFIGS` with `implemented: true`

## Resources

### Official Sources
- [New York Tax Authority](https://www.tax.ny.gov)
- New York Form 500 (or equivalent) and Instructions
- New York Tax Rate Schedules

### Useful Tools
- New York official tax calculator (if available)
- Tax preparation software for verification

## Notes

⚠️ **Local Tax**: New York has local taxes. Make sure to:
1. Research all county/city tax rates
2. Implement lookup by county/city name
3. Test with multiple jurisdictions



✅ **State EITC**: New York offers an EITC at 30% of federal EITC.
- Verify if it's refundable or non-refundable
- Check for income limits or phase-outs


## Testing Strategy
1. Start with simple single filer, no credits
2. Add complexity incrementally (MFJ, credits, etc.)
3. Test edge cases (zero income, very high income)
4. Compare results with official New York calculators
5. Aim for accuracy within $1 (rounding differences)

## Common Pitfalls
- AGI adjustments (state may differ from federal)
- Deduction phase-outs or limitations
- Credit ordering (non-refundable before refundable)
- Rounding rules (New York may round differently than federal)
- Local tax lookup (ensure accurate county/city mapping)

---

**Created**: 2025-10-19
**Generator**: scripts/createStateEngine.ts
