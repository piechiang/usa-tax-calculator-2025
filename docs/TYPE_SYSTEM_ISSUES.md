# Type System Issues and Remediation Plan

## Current Status
Build date: 2025-11-21
Vitest tests: **594/594 passing** ✅
TypeScript engine build: **Failing with ~100+ errors** ❌

## Root Causes

### 1. Duplicate `StateResult` Definitions
**Location**:
- `src/engine/types.ts:377` (legacy, minimal)
- `src/engine/types/stateTax.ts:15` (new, comprehensive)

**Impact**: New state calculators (CT, OR, MN, SC) use comprehensive interface, old states (MD, NJ, VA, etc.) use legacy format

**Solution**: Unify to single `StateResult` definition, migrate all states to new format

### 2. Missing `StateTaxInput` Export
**Issue**: `StateTaxInput` defined in `src/engine/types/stateTax.ts` but not re-exported from main `types.ts`

**Workaround Applied**: Added re-export in types.ts:449-455

### 3. Strict TypeScript 4.9 + `exactOptionalPropertyTypes`
**Issue**: Optional properties with `| undefined` rejected when `exactOptionalPropertyTypes: true`

**Examples**:
- `adoptionCredit.ts:271` - `ineligibilityReason: string | undefined`
- `saversCredit.ts:107` - `isSpouseEligible: boolean | undefined`
- `diagnostics/helpers.ts:39` - `field: string | undefined`

**Workaround Applied**: Disabled `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, and `strict` mode in `tsconfig.engine.json`

### 4. State Calculator Interface Inconsistencies
**Missing Fields** (various states):
- `stateDependents` vs `dependents` property naming
- `stateItemized` vs `itemized`
- `year` vs `taxYear`
- `agiState` vs `stateAGI`

**States Affected**: GA, IL, MA, NJ, VA, metadata-driven framework

### 5. Metadata Framework Incomplete
**Location**: `src/engine/states/metadata/`

**Issues**:
- `FilingStatus` not exported from `schema.ts`
- Function signatures don't match calls (arity mismatches)
- Undefined `warnings` variable references
- Missing `stateAGI` context in expressions

**Status**: Metadata framework was partially implemented but never completed

## Test Coverage vs Type Safety Trade-off

**Current Decision**: Prioritize test coverage over type-safe build

**Rationale**:
- All 594 tests pass, including 31 new state tests from Phase 2
- Vite build succeeds (UI works)
- Type errors are in engine standalone build only
- Engine consumed via import, not as standalone artifact

## Recommended Remediation (P2 Task)

### Phase 1: Interface Unification (High Priority)
- [ ] Merge `StateResult` definitions
- [ ] Standardize all state calculators to use `StateTaxInput` from `stateTax.ts`
- [ ] Update MD, NJ, VA, GA, IL, MA states to new format
- [ ] Add migration guide for state implementers

### Phase 2: Fix `exactOptionalPropertyTypes` Violations (Medium Priority)
- [ ] Audit all optional properties that might be `undefined`
- [ ] Change `prop?: T` to `prop?: T | undefined` where needed OR
- [ ] Remove `| undefined` where property is truly optional (not assigned)

### Phase 3: Complete or Remove Metadata Framework (Low Priority)
- [ ] Either: Complete metadata-driven state tax implementation
- [ ] Or: Remove incomplete metadata code and document intent

### Phase 4: Re-enable Strict Mode (Future)
- [ ] Fix all type errors incrementally
- [ ] Re-enable strict TypeScript checks
- [ ] Set up CI to enforce type safety

## Workarounds in Production

### For `build:full` Command
Currently disabled strict mode in `tsconfig.engine.json`:
```json
{
  "strict": false,
  "strictNullChecks": false,
  "exactOptionalPropertyTypes": false
}
```

### For Vite Build (UI)
No changes needed - Vite compiles successfully

### For Tests
No changes needed - 594/594 tests passing

## Migration Notes

When upgrading TypeScript beyond 4.9:
1. TypeScript 5.x has even stricter checks
2. Will surface 100+ additional errors from undefined handling
3. Recommend staying on 4.9.5 until Phase 1-2 remediation complete

## Related Documentation
- [State Tax Implementation Guide](STATE_TAX_IMPLEMENTATION_GUIDE.md)
- [Standardized State Tax Framework](STANDARDIZED_STATE_TAX_FRAMEWORK.md)
- [Project Status 2025](PROJECT_STATUS_2025.md)

---
*Document created: 2025-11-21*
*Last updated: 2025-11-21*
