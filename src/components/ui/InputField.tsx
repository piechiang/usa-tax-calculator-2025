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
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
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
  className = ''
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
        className={`w-full px-3 py-2 border ${
          hasError ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 ${
          hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
        } text-sm sm:text-base ${className}`}
      />

      {hasError && (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {help && !hasError && (
        <div className="text-gray-500 text-xs">
          {'\uD83D\uDCA1'} {help}
        </div>
      )}
    </div>
  );
};

interface UncontrolledInputProps {
  field: string;
  defaultValue: string | number;
  onChange: (field: string, value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
  help?: string;
  className?: string;
}

export const UncontrolledInput: React.FC<UncontrolledInputProps> = ({
  field,
  defaultValue,
  onChange,
  type = 'text',
  placeholder = '',
  step,
  min,
  max,
  help,
  className = ''
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
    onChange(field, newValue);
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
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${className}`}
      />

      {help && (
        <div className="text-gray-500 text-xs">
          {'\uD83D\uDCA1'} {help}
        </div>
      )}
    </div>
  );
};
