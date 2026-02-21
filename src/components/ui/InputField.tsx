import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { validateField } from '../../utils/validation';
import { formatSSN } from '../../utils/formatters';

interface ValidatedInputProps {
  field: string;
  value: string | number;
  onChange: (field: string, value: string) => void;
  section?: string;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
  help?: string;
  className?: string;
  'aria-label'?: string;
}

const ValidatedInputComponent: React.FC<ValidatedInputProps> = ({
  field,
  value,
  onChange,
  section = 'income',
  type = 'text',
  placeholder = '',
  step,
  min,
  max,
  help,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<boolean>(false);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let newValue = e.target.value;

    // Format SSN as user types
    if (field === 'ssn') {
      newValue = formatSSN(newValue);
    }

    setLocalValue(newValue);
    onChange(field, newValue);
  };

  const handleBlur = (): void => {
    setTouched(true);
    const validationError = validateField(field, localValue, section);
    setError(validationError);
  };

  const hasError = touched && error;

  return (
    <div className="space-y-1">
      <input
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        aria-label={ariaLabel}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={
          help && !hasError ? `${field}-help` : hasError ? `${field}-error` : undefined
        }
        className={`w-full px-3 py-2 border ${
          hasError ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 ${
          hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
        } text-sm sm:text-base ${className}`}
      />

      {hasError && (
        <div
          id={`${field}-error`}
          className="flex items-center gap-1 text-red-600 text-xs"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {help && !hasError && (
        <div id={`${field}-help`} className="text-gray-500 text-xs">
          {'\uD83D\uDCA1'} {help}
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ValidatedInput = React.memo(ValidatedInputComponent);

interface UncontrolledInputProps {
  field: string;
  defaultValue?: string | number;
  onChange?: (field: string, value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
  help?: string;
  className?: string;
  'aria-label'?: string;
}

const UncontrolledInputComponent: React.FC<UncontrolledInputProps> = ({
  field,
  defaultValue,
  onChange,
  type = 'text',
  placeholder = '',
  step,
  min,
  max,
  help,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const [value, setValue] = useState<string>(defaultValue?.toString() || '');

  useEffect(() => {
    setValue(defaultValue?.toString() || '');
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let newValue = e.target.value;

    // Format SSN as user types
    if (field === 'ssn') {
      newValue = formatSSN(newValue);
    }

    setValue(newValue);
    onChange?.(field, newValue);
  };

  return (
    <div className="space-y-1">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        aria-label={ariaLabel}
        aria-describedby={help ? `${field}-help` : undefined}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${className}`}
      />

      {help && (
        <div id={`${field}-help`} className="text-gray-500 text-xs">
          {'\uD83D\uDCA1'} {help}
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const UncontrolledInput = React.memo(UncontrolledInputComponent);
