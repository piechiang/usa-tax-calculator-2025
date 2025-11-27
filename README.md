# USA Tax Calculator 2025

Modern, privacy-first 2025 USA tax calculator with a typed tax engine and a React UI. Includes accountant-friendly workflows: client management, data import/export, and clear summaries.

## Highlights

- Accurate 2025 rules: federal brackets, standard deductions, credits (CTC, EITC, AOTC/LLC), and Maryland state/local.
- Typed engine: deterministic, test-covered calculations (Vitest, property tests).
- Privacy by default: runs entirely in the browser; no server required.
- Pro workflows: save/load multiple clients, export JSON, print-ready summaries, CSV importers (W-2, 1099-B totals).
- Extensible: modular rules and state engine; clean hooks and components.

## Getting Started

```bash
npm install
npm start
```

### Development Scripts

```bash
# Build the tax engine (TypeScript + JavaScript)
npm run build:engine

# Run engine tests (Vitest)
npm run test:engine

# Watch mode for tests during development
npm run test:engine:watch

# Lint source code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

**Note:** The engine is automatically built before `npm start` and `npm run build` via prebuild hooks.

## Accountant Workflow

- Client Manager: create, save, load, and delete client returns (local storage).
- Imports: paste CSV for W-2 (Box 1, 2, 17) and 1099-B summaries (proceeds, basis, long/short).
- Review: filing status comparison for married filing jointly vs. separately.
- Export: JSON backup of the full return; print a summary for PDF archives.

## Structure

```
src/
  engine/                # Typed tax engine (federal + state) with tests
    federal/2025/        # Federal tax calculation for 2025
    states/              # State-specific tax calculations
      md/2025/           # Maryland state tax
      CA/2025/           # California state tax
      registry.ts        # State engine registration
    rules/2025/          # IRS constants and thresholds
    tax/                 # Tax computation modules (LTCG, SE tax, etc.)
    credits/             # Tax credit calculations (EITC, CTC, etc.)
    util/                # Money utilities (cents-based arithmetic)
    types/               # Shared type definitions
  components/
    forms/               # Data entry forms (PersonalInfo, Income, Deductions)
    ui/                  # Reusable UI components (Modal, InputField, etc.)
    modals/              # Modal dialogs with accessibility features
    audit/               # Audit risk assessment and documentation
    comparison/          # Multi-year tax comparison and analysis
    analytics/           # Tax analytics and visualizations
    wizard/              # Step-by-step tax interview flow
    pro/                 # Client Manager and professional tools
    layout/              # Layout components (ClassicMode, WizardMode)
  hooks/                 # Custom React hooks
    useTaxCalculator     # Core tax calculation hook
    useModalAccessibility # Modal focus trap and keyboard navigation
    useLanguage          # i18n language management
    useTaxDataHandlers   # Data backup and restore
  utils/                 # Utility functions
    engineAdapter.ts     # Bridge between UI and tax engine
    importers.ts         # CSV/JSON data importers
    toast.ts             # Non-blocking toast notifications
    reports/             # PDF report generation (PDFRenderer, ReportBuilder)
  types/                 # TypeScript type definitions
    CommonTypes.ts       # Shared types across the app
    ui/                  # UI-specific types (audit, backup, comparison)
  contexts/              # React context providers
    TaxContext.tsx       # Global tax data state management
tests/
  golden/federal/2025/   # Golden test cases for federal tax
  golden/states/         # Golden test cases for state taxes (MD, CA)
  property/              # Property-based tests (monotonicity, etc.)
  utils/                 # Test utilities
```

## Tax Engine Architecture

### Core Principles

1. **Cents-based arithmetic**: All monetary amounts are stored and calculated in **cents** (integers) to avoid floating-point precision issues. The `safeCurrencyToCents()` utility converts dollar amounts to cents.

2. **Authoritative IRS constants**: Tax brackets, deductions, thresholds, and credits are sourced from official IRS publications (primarily Rev. Proc. 2024-40 for 2025 adjustments) and stored in `src/engine/rules/2025/federal/`.

3. **Deterministic calculations**: The engine produces identical results for identical inputs, enabling golden tests and regression prevention.

4. **Modular design**: Each tax concept (regular tax, LTCG, SE tax, credits) is isolated in its own module with clear inputs and outputs.

### Build Process

The tax engine is written in TypeScript (`src/engine/`) and compiled to JavaScript (`build/engine/`) using:

```bash
npm run build:engine
```

**Build configuration:**
- Source: `src/engine/**/*.ts`
- Output: `build/engine/` (gitignored, rebuilt on each install/build)
- TypeScript config: `tsconfig.engine.json`

The UI adapter (`src/utils/engineAdapter.ts`) loads the compiled engine from `build/engine` and converts between UI data structures and engine inputs/outputs.

### Adding New Tax Rules

1. **Update constants** in `src/engine/rules/YEAR/federal/` (e.g., `federalBrackets.ts`, `deductions.ts`)
2. **Update calculation logic** in `src/engine/federal/YEAR/` or relevant module
3. **Add golden tests** in `tests/golden/federal/YEAR/` with expected values from IRS worksheets
4. **Run tests** with `npm run test:engine` to verify
5. **Document sources** in code comments (e.g., "Rev. Proc. 2024-40 §2.01")

### Testing Strategy

- **Golden tests**: Verify specific scenarios match IRS examples and worksheets
- **Property tests**: Ensure mathematical properties (monotonicity, non-negativity, etc.)
- **Boundary tests**: Test edge cases (exactly at thresholds, $1 over/under, etc.)
- **Current coverage**: 84+ engine/unit tests (federal, CA, MD, utilities)

## UI Architecture

### Key Features

**Accessibility-First Design:**
- **Modal System**: Custom `useModalAccessibility` hook provides:
  - Focus trap: Keyboard focus stays within open modals
  - ESC key handling: Close modals with keyboard
  - Focus restoration: Returns focus to trigger element on close
  - ARIA attributes: Proper screen reader support
  - Body scroll lock: Prevents background scrolling

**Performance Optimizations:**
- **Memoized Computations**: Heavy calculations use `useMemo`/`useCallback`:
  - Audit risk factor analysis (AuditRiskAssessment)
  - Multi-year comparison charts (MultiYearComparison)
  - Tax result calculations (useTaxCalculator)
- **Type Safety**: Full TypeScript coverage with centralized type definitions
- **Toast Notifications**: Non-blocking user feedback replacing browser `alert()`

**Internationalization (i18n):**
- Multi-language support (English, Spanish, Chinese)
- Translation system with fallback handling
- Locale-specific formatting for currency and dates

**Data Management:**
- **Backup/Restore**: Client-side backup with checksum verification
- **Import/Export**: CSV import for W-2, 1099-B; JSON export for full returns
- **Client Management**: Multiple client profiles with local storage
- **Data Validation**: Zod schemas for input validation

### Component Architecture

The UI follows a layered architecture:

1. **Presentation Layer** (`components/`): Pure UI components
2. **Business Logic Layer** (`hooks/`): Custom hooks for state and calculations
3. **Data Layer** (`contexts/`): Global state management with React Context
4. **Engine Layer** (`engine/`): Pure TypeScript tax calculations
5. **Adapter Layer** (`utils/engineAdapter.ts`): Bridges UI ↔ Engine

### State Management

- **TaxContext**: Global tax data state (form inputs, results, settings)
- **Local Storage**: Persisted data for client profiles and preferences
- **Backup System**: Timestamped snapshots with integrity validation

## Roadmap

### Currently Supported

- ✅ **Federal taxes** (2025): Complete implementation with all major forms and credits  
  Source: IRS Rev. Proc. 2024-40, Publication 17, Form 1040 instructions (last updated Jan 2025)
- ✅ **Maryland state taxes** (2025): Full state + local calculation with county-specific rates  
  Source: [Maryland Comptroller](https://www.marylandtaxes.gov) (last updated Jan 2025, EITC 45% of federal)
- ✅ **California state taxes** (2025): Progressive brackets, CalEITC, YCTC, renters credit, mental health surtax  
  Source: [California Franchise Tax Board](https://www.ftb.ca.gov) (last updated Oct 2025)
- ✅ **No-tax states** (9): AK, FL, NV, NH, SD, TN, TX, WA, WY  
  Sources: individual state revenue departments (last verified Jan 2025)

### In Progress

- 🔄 **50-state expansion**: Phase 1A underway — CA delivered; NY, TX, FL data collection & rule design in progress (see [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md))
- 🔄 **PDF export**: ReportBuilder/PDFRenderer shipped; UI export workflow & E2E validation pending (see [PDF Export Design](docs/PDF_EXPORT_DESIGN.md))

### Planned Features

- Multi-year tax comparison
- Advanced optimization suggestions
- Quarterly estimated payment calculator
- Accountant collaboration tools

For detailed implementation plans, see:
- [State Engine Implementation Guide](docs/STATE_ENGINE_GUIDE.md) - How to add new states
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md) - Full 50-state expansion timeline
- [PDF Export Design](docs/PDF_EXPORT_DESIGN.md) - PDF report specifications

## Notes

- This tool is an estimator. It does not e-file and is not a substitute for professional judgment.
- Do not store sensitive data unless you control the machine. For production, add encryption and a secure backend.





