import { useState } from 'react';

type Errors = Record<string, string>;
type Touched = Record<string, boolean>;

/**
 * Hook for managing form validation state
 * Tracks field errors and touched status for form validation feedback
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const setError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const setFieldTouched = (field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const clearAllTouched = () => {
    setTouched({});
  };

  const hasError = (field: string): boolean => {
    return !!errors[field];
  };

  const isTouched = (field: string): boolean => {
    return !!touched[field];
  };

  const showError = (field: string): boolean => {
    return isTouched(field) && hasError(field);
  };

  return {
    errors,
    touched,
    setError,
    clearError,
    setFieldTouched,
    clearAllErrors,
    clearAllTouched,
    hasError,
    isTouched,
    showError,
  };
};
