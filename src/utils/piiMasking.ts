/**
 * PII Masking Utilities
 *
 * Provides functions to mask sensitive Personally Identifiable Information (PII)
 * for display purposes while maintaining usability.
 *
 * @module piiMasking
 */

/**
 * Mask an SSN for display, showing only last 4 digits
 *
 * @param ssn - Full SSN (with or without dashes)
 * @returns Masked SSN like "***-**-1234"
 *
 * @example
 * ```typescript
 * maskSSN('123-45-6789') // '***-**-6789'
 * maskSSN('123456789')   // '***-**-6789'
 * ```
 */
export function maskSSN(ssn: string | undefined | null): string {
  if (!ssn) return '***-**-****';

  // Remove any existing dashes
  const digits = ssn.replace(/-/g, '');

  if (digits.length !== 9) {
    return '***-**-****'; // Invalid SSN
  }

  const lastFour = digits.slice(-4);
  return `***-**-${lastFour}`;
}

/**
 * Fully mask an SSN (for logs/exports where even last 4 shouldn't show)
 */
export function fullMaskSSN(_ssn: string | undefined | null): string {
  return '***-**-****';
}

/**
 * Check if a string is a valid SSN format
 */
export function isValidSSN(ssn: string | undefined | null): boolean {
  if (!ssn) return false;
  const ssnRegex = /^(\d{3}-?\d{2}-?\d{4})$/;
  return ssnRegex.test(ssn);
}

/**
 * Mask an email address
 *
 * @example
 * ```typescript
 * maskEmail('john.doe@example.com') // 'j***@e***.com'
 * ```
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email || !email.includes('@')) return '***@***.***';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***@***.***';

  const maskedLocal = localPart.charAt(0) + '***';

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return `${maskedLocal}@***`;

  const domainName = domainParts[0]!;
  const tld = domainParts.slice(1).join('.');

  const maskedDomain = domainName.charAt(0) + '***.' + tld;

  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Mask a phone number, showing only last 4 digits
 *
 * @example
 * ```typescript
 * maskPhone('(555) 123-4567') // '(***) ***-4567'
 * ```
 */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return '(***) ***-****';

  // Extract just digits
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 4) return '(***) ***-****';

  const lastFour = digits.slice(-4);
  return `(***) ***-${lastFour}`;
}

/**
 * Mask a bank account number, showing only last 4 digits
 *
 * @example
 * ```typescript
 * maskAccountNumber('123456789012') // '********9012'
 * ```
 */
export function maskAccountNumber(account: string | undefined | null): string {
  if (!account) return '****';

  if (account.length <= 4) return account;

  const lastFour = account.slice(-4);
  const maskLength = account.length - 4;
  return '*'.repeat(maskLength) + lastFour;
}

/**
 * Mask a routing number (show first 2 and last 2)
 *
 * @example
 * ```typescript
 * maskRoutingNumber('123456789') // '12***89'
 * ```
 */
export function maskRoutingNumber(routing: string | undefined | null): string {
  if (!routing) return '*********';

  if (routing.length < 5) return '*'.repeat(routing.length);

  return routing.slice(0, 2) + '***' + routing.slice(-2);
}

/**
 * Mask a name (show first initial only)
 */
export function maskName(name: string | undefined | null): string {
  if (!name) return '***';
  return name.charAt(0) + '***';
}

/**
 * Mask an address (show only city, state, ZIP)
 */
export function maskAddress(address: string | undefined | null): string {
  if (!address) return '*** (Address on file)';

  // Try to extract just city, state, ZIP from end
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Take last two parts (usually city/state and ZIP)
    return '*** ' + parts.slice(-2).join(',').trim();
  }

  return '*** (Address on file)';
}

/**
 * Generic PII field detector - returns true if field likely contains PII
 */
export function isPIIField(fieldName: string): boolean {
  const piiPatterns = [
    /ssn/i,
    /social.*security/i,
    /tax.*id/i,
    /ein/i,
    /itin/i,
    /account.*num/i,
    /routing/i,
    /credit.*card/i,
    /bank/i,
    /password/i,
    /secret/i,
    /dob/i,
    /birth/i,
    /driver/i,
    /license/i,
    /passport/i,
  ];

  return piiPatterns.some((pattern) => pattern.test(fieldName));
}

/**
 * Redact all PII from an object for logging/export
 * Creates a deep copy with PII fields masked
 */
export function redactPII<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj } as Record<string, unknown>;

  for (const key in result) {
    const value = result[key];

    if (value === null || value === undefined) {
      continue;
    }

    // Check if key suggests PII
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('ssn') || lowerKey.includes('socialsecurity')) {
      result[key] = fullMaskSSN(String(value));
    } else if (lowerKey.includes('email')) {
      result[key] = maskEmail(String(value));
    } else if (lowerKey.includes('phone') || lowerKey.includes('tel')) {
      result[key] = maskPhone(String(value));
    } else if (lowerKey.includes('account') && lowerKey.includes('num')) {
      result[key] = maskAccountNumber(String(value));
    } else if (lowerKey.includes('routing')) {
      result[key] = maskRoutingNumber(String(value));
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      result[key] = redactPII(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      // Process arrays
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? redactPII(item as Record<string, unknown>)
          : item
      );
    }
  }

  return result as T;
}

/**
 * Create a display-safe version of client data
 * Masks SSNs but keeps other data visible
 */
export function createDisplaySafeSnapshot<T extends Record<string, unknown>>(
  snapshot: T
): T {
  const result = JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>;

  // Deep traverse and mask SSN fields only
  const maskSSNsRecursive = (obj: Record<string, unknown>) => {
    for (const key in obj) {
      const value = obj[key];

      if (value === null || value === undefined) continue;

      const lowerKey = key.toLowerCase();

      if (lowerKey === 'ssn' || lowerKey.includes('socialsecurity')) {
        obj[key] = maskSSN(String(value));
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        maskSSNsRecursive(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === 'object' && item !== null) {
            maskSSNsRecursive(item as Record<string, unknown>);
          }
        });
      }
    }
  };

  maskSSNsRecursive(result);
  return result as T;
}
