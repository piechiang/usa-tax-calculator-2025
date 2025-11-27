/**
 * Crypto Utility Tests
 *
 * Note: These tests require Web Crypto API which is available in Node.js 18+
 * and modern browsers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encryptData,
  decryptData,
  isCryptoAvailable,
  generatePassphrase,
} from '../../../src/utils/crypto';

describe('Crypto Utilities', () => {
  describe('isCryptoAvailable', () => {
    it('should return true in supported environments', () => {
      expect(isCryptoAvailable()).toBe(true);
    });
  });

  describe('generatePassphrase', () => {
    it('should generate a passphrase of specified length', () => {
      const passphrase = generatePassphrase(32);
      expect(passphrase.length).toBe(32);
    });

    it('should generate unique passphrases', () => {
      const p1 = generatePassphrase(32);
      const p2 = generatePassphrase(32);
      expect(p1).not.toBe(p2);
    });

    it('should use default length of 32', () => {
      const passphrase = generatePassphrase();
      expect(passphrase.length).toBe(32);
    });
  });

  describe('encryptData and decryptData', () => {
    const testPassphrase = 'test-passphrase-12345';

    it('should encrypt and decrypt string data', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptData(plaintext, testPassphrase);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('version', 1);
      expect(encrypted.ciphertext).not.toBe(plaintext);

      const decrypted = await decryptData(encrypted, testPassphrase);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt object data', async () => {
      const data = { ssn: '123-45-6789', name: 'John Doe' };
      const encrypted = await encryptData(data, testPassphrase);

      const decrypted = await decryptData(encrypted, testPassphrase);
      expect(JSON.parse(decrypted)).toEqual(data);
    });

    it('should produce different ciphertext for same plaintext (due to random IV/salt)', async () => {
      const plaintext = 'Same data';
      const e1 = await encryptData(plaintext, testPassphrase);
      const e2 = await encryptData(plaintext, testPassphrase);

      // Different IV and salt should produce different ciphertext
      expect(e1.ciphertext).not.toBe(e2.ciphertext);
      expect(e1.iv).not.toBe(e2.iv);
      expect(e1.salt).not.toBe(e2.salt);

      // But both should decrypt to the same plaintext
      expect(await decryptData(e1, testPassphrase)).toBe(plaintext);
      expect(await decryptData(e2, testPassphrase)).toBe(plaintext);
    });

    it('should fail decryption with wrong passphrase', async () => {
      const plaintext = 'Secret data';
      const encrypted = await encryptData(plaintext, testPassphrase);

      await expect(decryptData(encrypted, 'wrong-passphrase')).rejects.toThrow();
    });

    it('should handle empty string', async () => {
      const plaintext = '';
      const encrypted = await encryptData(plaintext, testPassphrase);
      const decrypted = await decryptData(encrypted, testPassphrase);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', async () => {
      const plaintext = '日本語 Émoji 🎉 中文';
      const encrypted = await encryptData(plaintext, testPassphrase);
      const decrypted = await decryptData(encrypted, testPassphrase);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle large data', async () => {
      const plaintext = 'x'.repeat(100000);
      const encrypted = await encryptData(plaintext, testPassphrase);
      const decrypted = await decryptData(encrypted, testPassphrase);
      expect(decrypted).toBe(plaintext);
    });
  });
});
