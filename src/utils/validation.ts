export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateSSN = (ssn: string): boolean => {
  const pattern = /^\d{3}-\d{2}-\d{4}$/;
  return pattern.test(ssn);
};

export const validateAmount = (amount: string | number): ValidationResult => {
  const num = Number(amount);
  if (isNaN(num)) return { valid: false, error: 'invalidAmount' };
  if (num < 0) return { valid: false, error: 'negativeAmount' };
  if (num > 10000000) return { valid: false, error: 'tooLarge' };
  return { valid: true };
};

export const validateRequired = (value: string | number | null | undefined): boolean => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateDependents = (dependents: string | number): boolean => {
  const num = Number(dependents);
  if (isNaN(num) || num < 0 || num > 20) return false;
  return true;
};

export const validateField = (
  field: string,
  value: string | number | null | undefined,
  section: string
): string | null => {
  let error: string | null = null;

  switch (section) {
    case 'personal':
      if (['firstName', 'lastName', 'address'].includes(field)) {
        if (!validateRequired(value)) error = 'required';
      } else if (field === 'ssn') {
        if (!validateRequired(value)) {
          error = 'required';
        } else if (typeof value === 'string' && !validateSSN(value)) {
          error = 'invalidSSN';
        }
      } else if (field === 'dependents') {
        if (!validateDependents(value || 0)) error = 'invalidDependents';
      }
      break;
    case 'spouse':
      if (['firstName', 'lastName', 'ssn'].includes(field)) {
        if (!validateRequired(value)) error = 'required';
        if (field === 'ssn' && value && typeof value === 'string' && !validateSSN(value)) {
          error = 'invalidSSN';
        }
      } else {
        if (value !== '' && value !== null && value !== undefined) {
          const validation = validateAmount(value);
          if (!validation.valid) error = validation.error || null;
        }
      }
      break;
    case 'income':
    case 'payments':
    case 'deductions':
    case 'k1':
    case 'businessDetails':
      if (value !== '' && value !== null && value !== undefined) {
        const validation = validateAmount(value);
        if (!validation.valid) error = validation.error || null;
      }
      break;
  }

  return error;
};
