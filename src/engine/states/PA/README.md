# Pennsylvania (PA) State Tax Engine

## Status
⚠️ **IN DEVELOPMENT** - This engine is a skeleton and needs to be completed

## Overview
Pennsylvania has a flat income tax.

## Tax Structure (2025)
- **Tax Type**: flat
- **Local Tax**: No
- **State EITC**: No

## Implementation Checklist

### 1. Research Tax Rules
- [ ] Download 2025 Pennsylvania tax forms and instructions
- [ ] Review Pennsylvania standard deduction amounts
- [ ] Review Pennsylvania personal exemption (if applicable)
- [ ] Review Pennsylvania tax brackets/rates
- [ ] Review Pennsylvania credits

### 2. Update Rule Files
- [ ] `rules/2025/brackets.ts` - Update tax brackets
- [ ] `rules/2025/deductions.ts` - Update standard deduction
- [ ] `rules/2025/credits.ts` - Add Pennsylvania-specific credits

### 3. Implement Calculator
- [ ] `computePA2025.ts` - Complete AGI calculation
- [ ] `computePA2025.ts` - Complete deduction calculation
- [ ] `computePA2025.ts` - Complete credit calculation

### 4. Write Tests
- [ ] Add basic scenarios (single, MFJ, HOH)
- [ ] Add high/low income scenarios
- [ ] Add deduction scenarios
- [ ] Add credit scenarios
- [ ] Verify against Pennsylvania tax calculators

### 5. Register State
- [ ] Update `src/engine/states/registry.ts` to include PA
- [ ] Update `STATE_CONFIGS` with `implemented: true`

## Resources

### Official Sources
- [Pennsylvania Tax Authority](https://www.revenue.pa.gov)
- Pennsylvania Form 500 (or equivalent) and Instructions
- Pennsylvania Tax Rate Schedules

### Useful Tools
- Pennsylvania official tax calculator (if available)
- Tax preparation software for verification

## Notes




## Testing Strategy
1. Start with simple single filer, no credits
2. Add complexity incrementally (MFJ, credits, etc.)
3. Test edge cases (zero income, very high income)
4. Compare results with official Pennsylvania calculators
5. Aim for accuracy within $1 (rounding differences)

## Common Pitfalls
- AGI adjustments (state may differ from federal)
- Deduction phase-outs or limitations
- Credit ordering (non-refundable before refundable)
- Rounding rules (Pennsylvania may round differently than federal)

---

**Created**: 2025-10-19
**Generator**: scripts/createStateEngine.ts
