# Quick Start Guide for Contributors

Welcome! This guide will get you up and running quickly to contribute to the USA Tax Calculator 2025 project.

## Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or later
- Git
- A code editor (VS Code recommended)

## Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd usa-tax-calculator-2025

# Install dependencies
npm install

# Build the tax engine
npm run build:engine

# Run tests to verify setup
npm run test:engine

# Start development server
npm start
```

## Project Structure Overview

```
usa-tax-calculator-2025/
├── src/
│   ├── engine/              # Tax calculation engine (TypeScript)
│   │   ├── federal/2025/    # Federal tax calculations
│   │   ├── states/          # State tax calculators
│   │   │   ├── md/2025/     # Maryland (example)
│   │   │   ├── registry.ts  # State routing
│   │   │   └── CA/          # California (TODO)
│   │   ├── rules/2025/      # IRS constants
│   │   └── util/            # Shared utilities
│   ├── components/          # React UI components
│   ├── hooks/               # React hooks
│   └── utils/               # UI utilities
├── tests/
│   ├── golden/federal/      # Federal tax test cases
│   ├── golden/states/       # State tax test cases
│   └── property/            # Property-based tests
└── docs/                    # Documentation
    ├── STATE_ENGINE_GUIDE.md
    ├── PDF_EXPORT_DESIGN.md
    └── IMPLEMENTATION_ROADMAP.md
```

## Common Tasks

### Adding a New State Tax Calculator

**See**: [STATE_ENGINE_GUIDE.md](./STATE_ENGINE_GUIDE.md) for detailed instructions

**Quick steps**:

1. Create issue from template: `.github/ISSUE_TEMPLATE/state-implementation.md`
2. Research official state tax rules (2025)
3. Create state directory: `src/engine/states/[STATE]/2025/`
4. Create rules: `src/engine/states/[STATE]/rules/2025/`
5. Implement `compute[STATE]2025.ts`
6. Write golden tests: `tests/golden/states/[state]/2025/`
7. Register in `src/engine/states/registry.ts`
8. Run tests: `npm run test:engine`

### Running Tests

```bash
# All engine tests
npm run test:engine

# Watch mode (for development)
npm run test:engine:watch

# Specific test file
npm run test:engine -- tests/golden/federal/2025/basic.spec.ts

# With coverage
npm run test:engine -- --coverage

# Only Maryland tests
npm run test:engine -- tests/golden/states/md
```

### Building and Linting

```bash
# Build tax engine
npm run build:engine

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Working with the Tax Engine

The engine uses **cents-based arithmetic** for all money values to avoid floating-point errors.

```typescript
// ❌ Wrong - using dollars (float)
const tax = 50000 * 0.22; // $50,000 × 22%

// ✅ Correct - using cents (integer)
import { safeCurrencyToCents } from '../engine/util/money';
const taxableIncome = safeCurrencyToCents(50000); // 5000000 cents
const tax = Math.round(taxableIncome * 0.22);    // 1100000 cents
```

**Utility functions**:

```typescript
import {
  calculateTaxFromBrackets,    // Graduated brackets
  calculateFlatTax,             // Flat tax rate
  calculateStateEITCFromFederal // % of federal EITC
} from '../engine/util/taxCalculations';
```

### Creating Golden Tests

Golden tests verify calculations match IRS/state examples:

```typescript
import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../src/engine/federal/2025/computeFederal2025';

const $ = (amount: number) => Math.round(amount * 100); // Dollars to cents

describe('Federal Tax 2025', () => {
  it('should calculate tax for single filer with $75k income', () => {
    const input = {
      filingStatus: 'single' as const,
      primary: { birthDate: '1990-01-01', isBlind: false },
      dependents: 0,
      income: {
        wages: $(75000)
      },
      payments: {
        federalWithheld: $(10000)
      }
    };

    const result = computeFederal2025(input);

    // Verify against IRS tax tables
    expect(result.agi).toBe($(75000));
    expect(result.taxableIncome).toBe($(60350)); // $75k - $14,650 std deduction
    expect(result.totalTax).toBeCloseTo($(9619), 0); // 2025 tax tables
  });
});
```

## Development Workflow

### 1. Pick a Task

Check:
- GitHub Issues (state implementation issues)
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for current phase
- Project board for assigned tasks

### 2. Create a Branch

```bash
git checkout -b feature/implement-ca-tax
# or
git checkout -b fix/eitc-calculation
```

### 3. Make Changes

Follow these guidelines:
- **Money values**: Always use cents (integers)
- **Constants**: Source from official IRS/state publications
- **Tests**: Add golden tests for every scenario
- **Comments**: Document sources (e.g., "Rev. Proc. 2024-40 §2.01")
- **Types**: Maintain strict TypeScript typing

### 4. Test Your Changes

```bash
# Build engine
npm run build:engine

# Run tests
npm run test:engine

# Lint
npm run lint:fix

# Check types
npx tsc -p tsconfig.engine.json --noEmit
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat(states): Implement California 2025 tax calculator"
git push origin feature/implement-ca-tax
```

**Commit message format**:
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation
- `test(scope): description` - Tests
- `refactor(scope): description` - Refactoring

**Scopes**: `federal`, `states`, `md`, `ca`, `pdf`, `ui`, `engine`

### 6. Create Pull Request

- Use PR template (if available)
- Link to related issue
- Ensure all CI checks pass
- Request review

## Code Style

### TypeScript

- Use strict mode
- Avoid `any` - use proper types
- Prefer `const` over `let`
- Use functional programming patterns where possible

### Naming Conventions

```typescript
// Functions: camelCase with verb prefix
calculateTax()
computeEITC()
determineDeduction()

// Constants: UPPER_SNAKE_CASE
const CA_TAX_BRACKETS_2025 = { ... };
const STANDARD_DEDUCTION_2025 = { ... };

// Types/Interfaces: PascalCase
interface TaxBracket { ... }
type StateResult = { ... };

// Files: camelCase or kebab-case
computeCA2025.ts
tax-calculations.ts
```

### Documentation

- Add JSDoc comments for all public functions
- Include `@param` and `@returns` annotations
- Document data sources in comments
- Keep README and docs up to date

Example:

```typescript
/**
 * Calculate California state tax for 2025
 *
 * Source: California FTB Publication 1001 (2025 Tax Rates)
 * URL: https://www.ftb.ca.gov/forms/2025/...
 *
 * @param input - State tax input with federal results
 * @returns California state tax calculation result
 */
export function computeCA2025(input: StateTaxInput): StateResult {
  // ...
}
```

## Troubleshooting

### Tests Failing

```bash
# Clear build artifacts
rm -rf build/engine

# Rebuild
npm run build:engine

# Run tests with verbose output
npm run test:engine -- --reporter=verbose
```

### TypeScript Errors

```bash
# Check types
npx tsc -p tsconfig.engine.json --noEmit

# Common fix: regenerate engine build
npm run build:engine
```

### Linting Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Check remaining issues
npm run lint
```

## Getting Help

- **Documentation**: See `docs/` directory
- **Examples**: Check `src/engine/states/md/` for working implementation
- **Issues**: Search existing issues or create new one
- **Discussions**: Use GitHub Discussions for questions

## Key Resources

### Internal Documentation
- [State Engine Guide](./STATE_ENGINE_GUIDE.md) - How to add states
- [PDF Export Design](./PDF_EXPORT_DESIGN.md) - PDF report specs
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - Project timeline

### External Resources
- [IRS Rev. Proc. 2024-40](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf) - 2025 inflation adjustments
- [Tax Foundation](https://taxfoundation.org/state-tax-data/) - State tax data
- [FTA State Tax Agencies](https://www.taxadmin.org/state-tax-agencies) - Links to all state tax authorities

## Next Steps

1. Read the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
2. Review [State Engine Guide](./STATE_ENGINE_GUIDE.md)
3. Look at Maryland implementation (`src/engine/states/md/`)
4. Pick an issue or task from the project board
5. Start coding! 🚀

---

**Questions?** Open an issue or discussion on GitHub.
