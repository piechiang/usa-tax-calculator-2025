/**
 * Client-Side Encryption Utilities
 *
 * Provides AES-GCM encryption for sensitive client data stored in localStorage.
 * Uses Web Crypto API for secure encryption operations.
 *
 * Security Notes:
 * - This is client-side encryption for data-at-rest protection
 * - The encryption key is derived from a user-provided passphrase using PBKDF2
 * - A unique salt and IV are generated for each encryption operation
 * - For production, consider server-side key management (HSM, KMS)
 *
 * @module crypto
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

/**
 * Encryption result containing ciphertext and metadata for decryption
 */
export interface EncryptedData {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Base64-encoded salt used for key derivation */
  salt: string;
  /** Version identifier for future algorithm changes */
  version: number;
}

/**
 * Generate cryptographically secure random bytes
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive an encryption key from a passphrase using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive data using AES-GCM
 *
 * @param plaintext - The data to encrypt (will be JSON stringified if object)
 * @param passphrase - User-provided passphrase for key derivation
 * @returns Encrypted data with metadata for decryption
 *
 * @example
 * ```typescript
 * const encrypted = await encryptData({ ssn: '123-45-6789' }, 'user-passphrase');
 * // Store encrypted.ciphertext, encrypted.iv, encrypted.salt
 * ```
 */
export async function encryptData(
  plaintext: string | object,
  passphrase: string
): Promise<EncryptedData> {
  const salt = generateRandomBytes(SALT_LENGTH);
  const iv = generateRandomBytes(IV_LENGTH);
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const data = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
    version: 1,
  };
}

/**
 * Decrypt data that was encrypted with encryptData
 *
 * @param encrypted - The encrypted data object
 * @param passphrase - The same passphrase used for encryption
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (wrong passphrase or corrupted data)
 *
 * @example
 * ```typescript
 * const decrypted = await decryptData(encrypted, 'user-passphrase');
 * const data = JSON.parse(decrypted);
 * ```
 */
export async function decryptData(
  encrypted: EncryptedData,
  passphrase: string
): Promise<string> {
  const salt = base64ToUint8Array(encrypted.salt);
  const iv = base64ToUint8Array(encrypted.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

/**
 * Generate a secure random passphrase (for automatic key generation)
 */
export function generatePassphrase(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomBytes = generateRandomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i]! % chars.length];
  }
  return result;
}

/**
 * Storage key for the encryption key (stored separately, not with data)
 */
const ENCRYPTION_KEY_STORAGE = 'utc:encryption:key';

/**
 * Get or generate the application encryption key
 * In production, this should be managed via a secure key management system
 */
export function getOrCreateEncryptionKey(): string {
  let key = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!key) {
    // Check if there's a stored key hash to validate against
    const storedKeyHash = localStorage.getItem('utc:encryption:keyHash');
    if (!storedKeyHash) {
      // First time - generate new key
      key = generatePassphrase(32);
      // Store key in session (lost on browser close)
      sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
      // Store hash in localStorage for validation
      hashString(key).then(hash => {
        localStorage.setItem('utc:encryption:keyHash', hash);
      });
    } else {
      // Key exists but not in session - user needs to re-enter or we need to prompt
      throw new Error('Encryption key required. Please unlock your data.');
    }
  }
  return key;
}

/**
 * Set the encryption key (for unlocking existing data)
 */
export async function setEncryptionKey(key: string): Promise<boolean> {
  const storedHash = localStorage.getItem('utc:encryption:keyHash');
  if (storedHash) {
    const providedHash = await hashString(key);
    if (providedHash !== storedHash) {
      return false; // Wrong key
    }
  }
  sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  if (!storedHash) {
    const hash = await hashString(key);
    localStorage.setItem('utc:encryption:keyHash', hash);
  }
  return true;
}

/**
 * Check if encryption key is set in session
 */
export function hasEncryptionKey(): boolean {
  return sessionStorage.getItem(ENCRYPTION_KEY_STORAGE) !== null;
}

/**
 * Clear the encryption key from session
 */
export function clearEncryptionKey(): void {
  sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
}

/**
 * Hash a string using SHA-256 (for key validation, not encryption)
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}
