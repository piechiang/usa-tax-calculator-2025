# Professional Workflow Guide

This guide describes enabling client management and import tools for accountants.

## Client Manager (save/load multiple clients)

1) Import the component and hook methods in `src/App.tsx`:

```tsx
import ClientManager from './components/pro/ClientManager';
// ...inside component
const [showClientManager, setShowClientManager] = useState(false);
// from useTaxCalculator hook destructuring also get:
// getSnapshot, loadFromSnapshot
```

2) Add a floating button and dialog near your root `return` JSX:

```tsx
<button
  className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded shadow"
  onClick={() => setShowClientManager(true)}
>
  Clients
</button>
<ClientManager
  isOpen={showClientManager}
  onClose={() => setShowClientManager(false)}
  getSnapshot={getSnapshot}
  loadFromSnapshot={loadFromSnapshot}
/>
```

- Saves are stored in localStorage. For production, replace with a backend and encryption.

## CSV Importers

- W‑2 CSV (columns: wages, federalWithholding, stateWithholding)
- 1099‑B summary CSV (columns: proceeds, costBasis, term[short|long])

```ts
import { importW2CSV, import1099BSummaryCSV } from '../utils/importers';

const rows = importW2CSV(csvText);
const totals = rows.reduce((a, r) => ({
  wages: a.wages + (r.wages||0),
  fedWH: a.fedWH + (r.federalWithholding||0),
  stWH: a.stWH + (r.stateWithholding||0),
}), { wages: 0, fedWH: 0, stWH: 0 });

handleIncomeChange('wages', String(totals.wages));
handlePaymentsChange('federalWithholding', String(totals.fedWH));
handlePaymentsChange('stateWithholding', String(totals.stWH));
```

## Validation

- Use `src/utils/schemas.ts` (Zod) to validate inputs and snapshots.
- Example:

```ts
import { personalInfoSchema } from '../utils/schemas';
const result = personalInfoSchema.safeParse(personalInfo);
if (!result.success) setError('personalInfo', result.error.issues[0].message);
```

## Roadmap (suggested)

- Add proper PDF export templates (Form 1040 summary).
- Add user authentication and encrypted storage.
- Extend engine to more states and forms (1099‑R, 8960, AMT, etc.).
- Fix failing engine tests and add integration tests for UI.
