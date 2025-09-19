# USA Tax Calculator 2025

Modern, privacy-first 2025 USA tax calculator with a typed tax engine and a React UI. Includes accountant-friendly workflows: client management, data import/export, and clear summaries.

## Highlights

- Accurate 2025 rules: federal brackets, standard deductions, credits (CTC, EITC, AOTC/LLC), and Maryland state/local.
- Typed engine: deterministic, test-covered calculations (Vitest, property tests).
- Privacy by default: runs entirely in the browser; no server required.
- Pro workflows: save/load multiple clients, export JSON, print-ready summaries, CSV importers (W‑2, 1099‑B totals).
- Extensible: modular rules and state engine; clean hooks and components.

## Getting Started

```bash
npm install
npm start
```

Engine tests:

```bash
npm run test:engine
```

## Accountant Workflow

- Client Manager: create, save, load, and delete client returns (local storage).
- Imports: paste CSV for W‑2 (Box 1, 2, 17) and 1099‑B summaries (proceeds, basis, long/short).
- Review: filing status comparison for married filing jointly vs. separately.
- Export: JSON backup of the full return; print a summary for PDF archives.

## Structure

```
src/
  engine/                # Typed tax engine (federal + MD) with tests
  components/
    forms/               # Data entry forms
    pro/                 # Client Manager and pro tools
  hooks/                 # useTaxCalculator, useLanguage
  utils/                 # importers, validation schemas, engine adapter
```

## Notes

- This tool is an estimator. It does not e‑file and is not a substitute for professional judgment.
- Do not store sensitive data unless you control the machine. For production, add encryption and a secure backend.

