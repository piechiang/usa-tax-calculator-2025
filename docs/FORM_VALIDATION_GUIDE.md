# Form Validation Guide

This guide explains how to use Zod schema validation in the USA Tax Calculator 2025 application.

## Overview

We use [Zod](https://zod.dev/) for runtime type-safe form validation. This provides:
- **Type Safety**: TypeScript types automatically inferred from schemas
- **Runtime Validation**: Catch invalid data at runtime, not just compile time
- **User-Friendly Errors**: Custom error messages for better UX
- **Single Source of Truth**: One schema defines both validation rules and types

## Quick Start

### 1. Import the Schema

```typescript
import { personalInfoSchema } from '../validation/schemas';
import { useZodValidation } from '../hooks/useZodValidation';
```

### 2. Use the Validation Hook

```typescript
function PersonalInfoForm() {
  const { errors, validateField, validateForm, hasError } = useZodValidation(personalInfoSchema);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    filingStatus: 'single',
    dependents: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm(formData)) {
      // Form is valid - proceed with submission
      console.log('Valid data:', formData);
    } else {
      // Show errors - they're in the `errors` object
      console.log('Validation errors:', errors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="firstName"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        onBlur={() => validateField('firstName', formData.firstName)}
        aria-invalid={hasError('firstName')}
      />
      {errors.firstName && (
        <span className="error">{errors.firstName}</span>
      )}

      {/* More fields... */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Available Schemas

### Personal Information
```typescript
import { personalInfoSchema, type PersonalInfoFormData } from '../validation/schemas';

// Fields:
// - firstName: string (required, max 50 chars)
// - lastName: string (required, max 50 chars)
// - ssn: string (format XXX-XX-XXXX)
// - filingStatus: 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold'
// - dependents: number (0-20)
// - address, city, state, zipCode: optional
```

### Income
```typescript
import { incomeSchema, type IncomeFormData } from '../validation/schemas';

// Fields: wages, interestIncome, dividends, capitalGains, etc.
// All fields are currency amounts (validated as string matching /^\d+(\.\d{0,2})?$/)
```

### Deductions
```typescript
import { deductionsSchema, type DeductionsFormData } from '../validation/schemas';

// Fields: studentLoanInterest, hsaContribution, medicalExpenses, etc.
// Boolean fields: itemizeDeductions, useStandardDeduction, forceItemized
```

### Payments
```typescript
import { paymentsSchema, type PaymentsFormData } from '../validation/schemas';

// Fields: federalWithholding, stateWithholding, estimatedTaxPayments, etc.
```

## Validation Patterns

### Pattern 1: Validate on Blur

```typescript
<input
  onBlur={() => validateField('fieldName', value)}
/>
```

### Pattern 2: Validate on Submit

```typescript
const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm(formData)) {
    return; // Show errors from `errors` object
  }
  // Proceed with submission
};
```

### Pattern 3: Real-time Validation

```typescript
import { useRealtimeValidation } from '../hooks/useZodValidation';

function MyForm() {
  const { errors, handleChange, validateOnSubmit, shouldShowError } =
    useRealtimeValidation(incomeSchema);

  return (
    <input
      onChange={(e) => {
        handleChange('wages', e.target.value);
        // Validation runs automatically after 300ms
      }}
    />
    {shouldShowError('wages') && <span>{errors.wages}</span>}
  );
}
```

## Custom Validation Rules

### Add Custom Error Messages

```typescript
const customSchema = z.object({
  age: z.number()
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Please enter a valid age'),
});
```

### Custom Currency Validation

```typescript
const currencyAmount = z.string()
  .regex(/^\d+(\.\d{0,2})?$/, 'Please enter a valid dollar amount (e.g., 1000.50)')
  .transform(val => parseFloat(val) * 100); // Convert to cents
```

### Conditional Validation

```typescript
const schema = z.object({
  filingStatus: z.enum(['single', 'married']),
  spouseName: z.string().optional(),
}).refine(
  (data) => data.filingStatus !== 'married' || data.spouseName,
  {
    message: 'Spouse name is required for married filing',
    path: ['spouseName'],
  }
);
```

## Integration with Existing Components

### Using with ValidatedInput

```typescript
import { ValidatedInput } from '../components/ui/InputField';
import { useZodValidation } from '../hooks/useZodValidation';
import { incomeSchema } from '../validation/schemas';

function IncomeForm() {
  const { errors, validateField } = useZodValidation(incomeSchema);

  return (
    <ValidatedInput
      field="wages"
      value={income.wages}
      onChange={handleChange}
      onBlur={() => validateField('wages', income.wages)}
      aria-label="Wages, salaries, and tips"
      // ValidatedInput will show its own error state
    />
  );
}
```

## Best Practices

### 1. Validate at Form Boundaries

Validate when data **enters** the application (form submission) and when it **leaves** the application (API calls).

```typescript
// ✅ Good: Validate at submission
const handleSubmit = () => {
  if (validateForm(formData)) {
    submitToServer(formData);
  }
};

// ❌ Bad: No validation
const handleSubmit = () => {
  submitToServer(formData); // Could send invalid data!
};
```

### 2. Show Errors Only After User Interaction

Don't overwhelm users with error messages before they've touched a field.

```typescript
// ✅ Good: Only show errors for touched fields
{touched.firstName && errors.firstName && (
  <span>{errors.firstName}</span>
)}

// ❌ Bad: Show all errors immediately
{errors.firstName && <span>{errors.firstName}</span>}
```

### 3. Provide Helpful Error Messages

```typescript
// ✅ Good: Specific, actionable error
ssn: z.string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')

// ❌ Bad: Generic error
ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/) // Error: "Invalid"
```

### 4. Use Type Inference

```typescript
// ✅ Good: Let TypeScript infer types
type FormData = z.infer<typeof personalInfoSchema>;

// ❌ Bad: Manually defining types (duplicates validation logic)
type FormData = {
  firstName: string;
  lastName: string;
  // ...
};
```

## Testing Validation

### Unit Testing Schemas

```typescript
import { personalInfoSchema } from '../validation/schemas';

describe('personalInfoSchema', () => {
  test('validates correct data', () => {
    const result = personalInfoSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
      filingStatus: 'single',
      dependents: 2,
    });

    expect(result.success).toBe(true);
  });

  test('rejects invalid SSN format', () => {
    const result = personalInfoSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123456789', // Missing dashes
      filingStatus: 'single',
      dependents: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('SSN must be in format');
    }
  });
});
```

## Migration Guide

### Migrating from Old Validation

**Old approach** (src/utils/validation.ts):
```typescript
function validateField(field: string, value: string): string | null {
  if (field === 'ssn') {
    if (!/^\d{3}-\d{2}-\d{4}$/.test(value)) {
      return 'Invalid SSN format';
    }
  }
  return null;
}
```

**New approach** (Zod schema):
```typescript
const schema = z.object({
  ssn: z.string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
});

// Usage
const result = schema.safeParse({ ssn: '123-45-6789' });
if (!result.success) {
  console.log(result.error.errors[0].message);
}
```

**Benefits of new approach**:
- Type safety
- Centralized validation rules
- Composable schemas
- Better error messages
- Runtime type checking

## Troubleshooting

### Issue: "Cannot read property 'shape' of undefined"

**Cause**: Trying to validate a field that doesn't exist in the schema.

**Solution**: Check that the field name matches the schema definition.

```typescript
// ❌ Wrong field name
validateField('wage', value); // Schema has 'wages', not 'wage'

// ✅ Correct
validateField('wages', value);
```

### Issue: "Expected string, received number"

**Cause**: Type mismatch between form data and schema.

**Solution**: Convert types before validation or update schema.

```typescript
// ❌ Schema expects string, but form has number
const schema = z.object({ amount: z.string() });
const data = { amount: 1000 }; // number

// ✅ Solution 1: Convert to string
const data = { amount: '1000' };

// ✅ Solution 2: Update schema
const schema = z.object({ amount: z.number() });
```

## Resources

- [Zod Documentation](https://zod.dev/)
- [src/validation/schemas.ts](../src/validation/schemas.ts) - All validation schemas
- [src/hooks/useZodValidation.ts](../src/hooks/useZodValidation.ts) - Validation hooks
- [src/components/ui/InputField.tsx](../src/components/ui/InputField.tsx) - Example integration
