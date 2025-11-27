# Phase 1 – Federal Engine Hardening

This note captures the current status of the 2025 federal engine, gaps that need to be closed to reach “Phase 1” readiness, and the target data flow we want to enforce across hooks/UI → adapters → engine → results. Use this as the working backlog while we implement the remaining work.

## Current Technical Inventory

- `src/engine/federal/2025/computeFederal2025.ts` – monolithic procedure that orchestrates AGI, deductions, tax, credits, and additional taxes. It depends heavily on helpers inside the same file.
- `src/engine/tax/*` – lower-level calculators (regular tax, long-term capital gains preferential rates, SE tax).
- `src/engine/rules/2025/federal/*` – data tables for brackets, deductions, additional Medicare thresholds, EITC, etc.
- `src/utils/engineAdapter.ts` – converts UI strings to cents and attempts to load the compiled engine output from `build/engine/index.js`; currently weakly typed and depends on dynamic require.
- `src/hooks/useTaxResults.ts` – still casts engine output to `Record<string, unknown>` and extracts numbers manually; federal vs state results are conflated, and error handling just logs to console.
- Testing: no automated validations for the federal engine beyond generic validation tests. No “golden” scenario files exist.

## Gaps vs. Phase 1 Goals

1. **Typed engine I/O** – The engine should accept a well-defined `FederalInput2025` type and return a `FederalResult2025`. Today `EngineInput` in `engineAdapter` mixes UI concerns with engine requirements, and `useTaxResults` casts outputs from `Record<string, unknown>`.
2. **Deterministic data flow** – We need a strict pipeline: UI snapshot → `engineAdapter` conversion → `computeFederal2025` → typed result. The adapter should return a typed structure, and hooks should consume typed results (no casts/`any`).
3. **Rule isolation** – Many constants (standard deduction, EITC limits, etc.) are hard-coded in the orchestrator. They should pull from the rule tables so that updating the tables is sufficient for a new tax year.
4. **Golden regression tests** – Add a suite under `tests/golden/federal/2025/*` that feeds canonical IRS examples into the engine and checks outputs (AGI, taxable income, tax, credits, balance). Without this, refactors risk regressions.
5. **State separation** – Federal engine currently sets fields like `marylandTax`/`localTax`. We should split responsibilities: federal result contains only federal metrics; state engines enrich state-specific numbers.
6. **Error surfacing** – Failures in `calculateTaxResultsWithEngine` should return structured errors; UI hooks should display actionable messages rather than just logging to console.
7. **Build/runtime packaging** – `engineAdapter` requires a prebuilt `build/engine/index.js`. For development, we should either bundle the TypeScript engine directly or provide a build script that ensures parity between TS source and runtime bundle.

## Target Data Flow (Phase 1)

```
UI snapshot (TaxCalculatorSnapshot)
  └─ engineAdapter.convertSnapshot(snapshot) → FederalInput2025 + StateInput*
        └─ computeFederal2025(FederalInput2025) → FederalResult2025
              └─ (optionally) computeState2025(StateInput, FederalResult2025)
```

- Hooks (`useTaxResults`) consume the typed results and update React state without casts.
- Engine outputs should carry metadata (breakdowns, diagnostics) needed for downstream components, eliminating redundant calculations in the UI.

## Phase 1 Task Backlog

1. **Define types** – Introduce `FederalInput2025` / `FederalResult2025` in `src/engine/types` and migrate `computeFederal2025` to accept/return those types.
2. **Refactor adapter** – Rewrite `calculateTaxResultsWithEngine` to:
   - Convert the React snapshot into a `FederalInput2025` instance (centralise string→cents, boolean defaults, etc.).
   - Call `computeFederal2025` directly (without dynamic require) during dev/tests.
   - Return `{ result: FederalResult2025 } | { error: EngineError }`.
3. **Update hooks** – Adjust `useTaxResults` to consume the typed result. Remove casts and map values explicitly. Surface errors through UI state.
4. **Normalize computeFederal2025** – Break the monolithic function into pure helpers (AGI, deductions, income tax, additional taxes, credits). Ensure rule lookups come from `engine/rules` tables.
5. **Golden tests** – Under `tests/golden/federal/2025`, add JSON fixtures covering:
   - Basic W-2 scenario (single, standard deduction).
   - Married joint with itemized deductions.
   - Self-employed with SE tax.
   - Investment income triggering NIIT.
   - Scenario with refundable/non-refundable credits (CTC, AOTC, EITC).
6. **State boundary clean-up** – Remove `marylandTax`/`localTax` from the federal result; update `useTaxResults` to call state calculators separately.
7. **Diagnostics stub** – Add a field in `FederalResult2025` for warnings/errors so Phase 2 diagnostics can consume them.
8. **Build scripts** – Provide an npm script (e.g., `npm run build:engine`) that compiles the TS engine into the expected runtime bundle. Document it in the README.

## Documentation & Next Steps

- After implementing the backlog, document the new flow in `docs/ARCHITECTURE.md` (or extend this file) showing how data moves from UI → engine.
- Phase 1 success criteria:
  - All federal calculations use typed inputs/outputs.
  - `npm run lint` / `npm run test` include the federal golden suite with green results.
  - UI hooks show meaningful errors when engine computation fails.
  - State calculators only depend on the typed federal result (no implicit UI props).

Once Phase 1 is complete, move to state engine hardening and expand golden tests for the most common states before tackling organizer/workflow features in later phases.
