import { useState, useCallback } from 'react';
import { z } from 'zod';

type ValidationErrors = Record<string, string>;

/**
 * Custom hook for form validation using Zod schemas
 *
 * @param schema - Zod schema to validate against
 * @returns Validation state and helpers
 *
 * @example
 * const { errors, validateField, validateForm, clearError } = useZodValidation(personalInfoSchema);
 *
 * // Validate single field on blur
 * <input onBlur={() => validateField('firstName', formData.firstName)} />
 *
 * // Validate entire form on submit
 * const handleSubmit = () => {
 *   if (validateForm(formData)) {
 *     // Form is valid, proceed
 *   }
 * };
 */
export function useZodValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: string, value: unknown): boolean => {
      try {
        // Create a partial schema for this field
        const fieldSchema = (schema as any).shape?.[fieldName];

        if (fieldSchema) {
          fieldSchema.parse(value);
          // Clear error if validation passes
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
          return true;
        }
        return true; // If field not in schema, consider it valid
      } catch (err: unknown) {
        if (err instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: (err as z.ZodError).errors[0]?.message || 'Invalid value',
          }));
          return false;
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback(
    (data: unknown): data is T => {
      const result = schema.safeParse(data);

      if (result.success) {
        setErrors({});
        return true;
      } else {
        const newErrors: ValidationErrors = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
    },
    [schema]
  );

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Get error message for a field
   */
  const getError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  /**
   * Check if a field has an error
   */
  const hasError = useCallback(
    (fieldName: string): boolean => {
      return fieldName in errors;
    },
    [errors]
  );

  /**
   * Check if form has any errors
   */
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    getError,
    hasError,
    hasErrors,
  };
}

/**
 * Hook for real-time validation as user types
 *
 * @param schema - Zod schema to validate against
 * @param debounceMs - Milliseconds to debounce validation (default: 300)
 *
 * @example
 * const { errors, handleChange, validateOnSubmit } = useRealtimeValidation(incomeSchema);
 *
 * <input
 *   value={formData.wages}
 *   onChange={(e) => handleChange('wages', e.target.value)}
 * />
 * {errors.wages && <span className="error">{errors.wages}</span>}
 */
export function useRealtimeValidation<T>(schema: z.ZodSchema<T>, debounceMs: number = 300) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  /**
   * Handle field change with validation
   */
  const handleChange = useCallback(
    (fieldName: string, value: unknown) => {
      // Mark field as touched
      setTouchedFields((prev) => new Set(prev).add(fieldName));

      // Debounced validation
      const timeoutId = setTimeout(() => {
        try {
          const fieldSchema = (schema as any).shape?.[fieldName];
          if (fieldSchema) {
            fieldSchema.parse(value);
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        } catch (err: unknown) {
          if (err instanceof z.ZodError) {
            setErrors((prev) => ({
              ...prev,
              [fieldName]: (err as z.ZodError).errors[0]?.message || 'Invalid value',
            }));
          }
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [schema, debounceMs]
  );

  /**
   * Validate entire form on submit
   */
  const validateOnSubmit = useCallback(
    (data: unknown): data is T => {
      const result = schema.safeParse(data);

      if (result.success) {
        setErrors({});
        return true;
      } else {
        const newErrors: ValidationErrors = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
          setTouchedFields((prev) => new Set(prev).add(path));
        });
        setErrors(newErrors);
        return false;
      }
    },
    [schema]
  );

  /**
   * Check if field should show error (touched + has error)
   */
  const shouldShowError = useCallback(
    (fieldName: string): boolean => {
      return touchedFields.has(fieldName) && fieldName in errors;
    },
    [touchedFields, errors]
  );

  return {
    errors,
    handleChange,
    validateOnSubmit,
    shouldShowError,
    touchedFields,
  };
}
