/**
 * Secure Client Storage
 *
 * Enhanced client storage with encryption for PII fields.
 * Provides the same API as clientStorage but with security features.
 *
 * Security Features:
 * - AES-GCM encryption for sensitive fields (SSN, etc.)
 * - PII masking for display
 * - Audit logging for data access
 * - Session-based encryption key management
 *
 * @module secureClientStorage
 */

import { snapshotSchema, type Snapshot } from './schemas';
import { encryptData, decryptData, type EncryptedData, getOrCreateEncryptionKey, isCryptoAvailable } from './crypto';
import { auditLog, AuditAction } from './auditLog';

const INDEX_KEY = 'utc:clients:index';
const CLIENT_KEY = (id: string) => `utc:client:${id}`;
const ENCRYPTED_MARKER = '__encrypted__';

export interface ClientIndexItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isEncrypted: boolean;
}

/**
 * Fields that should be encrypted in storage
 */
const SENSITIVE_FIELDS = ['ssn', 'socialSecurityNumber', 'ein', 'itin'];

function readIndex(): ClientIndexItem[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeIndex(rows: ClientIndexItem[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(rows));
}

/**
 * Extract and encrypt sensitive fields from an object
 */
async function encryptSensitiveFields(
  obj: Record<string, unknown>,
  encryptionKey: string
): Promise<{ data: Record<string, unknown>; encryptedFields: Record<string, EncryptedData> }> {
  const data = { ...obj };
  const encryptedFields: Record<string, EncryptedData> = {};

  const processObject = async (
    target: Record<string, unknown>,
    path: string = ''
  ) => {
    for (const key in target) {
      const value = target[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (value === null || value === undefined) continue;

      const lowerKey = key.toLowerCase();

      // Check if this is a sensitive field
      if (SENSITIVE_FIELDS.some((f) => lowerKey.includes(f.toLowerCase()))) {
        if (typeof value === 'string' && value.length > 0) {
          // Encrypt the value
          const encrypted = await encryptData(value, encryptionKey);
          encryptedFields[currentPath] = encrypted;
          // Replace with marker
          target[key] = ENCRYPTED_MARKER;
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        await processObject(value as Record<string, unknown>, currentPath);
      }
    }
  };

  await processObject(data);

  return { data, encryptedFields };
}

/**
 * Decrypt sensitive fields back into an object
 */
async function decryptSensitiveFields(
  data: Record<string, unknown>,
  encryptedFields: Record<string, EncryptedData>,
  encryptionKey: string
): Promise<Record<string, unknown>> {
  const result = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;

  for (const path of Object.keys(encryptedFields)) {
    const parts = path.split('.');
    let target: Record<string, unknown> = result;

    // Navigate to parent object
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (target[part] && typeof target[part] === 'object') {
        target = target[part] as Record<string, unknown>;
      }
    }

    // Decrypt and restore value
    const key = parts[parts.length - 1]!;
    const encrypted = encryptedFields[path]!;
    try {
      const decrypted = await decryptData(encrypted, encryptionKey);
      target[key] = decrypted;
    } catch {
      // Decryption failed - leave as marker or empty
      target[key] = '';
    }
  }

  return result;
}

/**
 * Storage format for encrypted client data
 */
interface SecureStorageFormat {
  version: number;
  data: Record<string, unknown>;
  encryptedFields: Record<string, EncryptedData>;
  encryptedAt: string;
}

export function listClients(): ClientIndexItem[] {
  auditLog(AuditAction.LIST_CLIENTS);
  return readIndex();
}

/**
 * Save client data with encryption for sensitive fields
 */
export async function saveClientSecure(
  name: string,
  snapshot: Snapshot,
  id?: string
): Promise<ClientIndexItem> {
  const parsed = snapshotSchema.safeParse(snapshot);
  if (!parsed.success) throw new Error('Invalid snapshot');

  const now = new Date().toISOString();
  const index = readIndex();
  const clientId = id || crypto.randomUUID();

  let isEncrypted = false;

  // Try to encrypt if crypto is available
  if (isCryptoAvailable()) {
    try {
      const encryptionKey = getOrCreateEncryptionKey();
      const { data, encryptedFields } = await encryptSensitiveFields(
        parsed.data as Record<string, unknown>,
        encryptionKey
      );

      const storageFormat: SecureStorageFormat = {
        version: 1,
        data,
        encryptedFields,
        encryptedAt: now,
      };

      localStorage.setItem(CLIENT_KEY(clientId), JSON.stringify(storageFormat));
      isEncrypted = Object.keys(encryptedFields).length > 0;

      auditLog(AuditAction.SAVE_CLIENT, {
        clientId,
        encrypted: isEncrypted,
        fieldsEncrypted: Object.keys(encryptedFields).length,
      });
    } catch (error) {
      // Fallback to unencrypted if encryption fails
      console.warn('Encryption failed, saving unencrypted:', error);
      localStorage.setItem(CLIENT_KEY(clientId), JSON.stringify(parsed.data));
      auditLog(AuditAction.SAVE_CLIENT, { clientId, encrypted: false, error: 'encryption_failed' });
    }
  } else {
    // No crypto available - save unencrypted with warning
    localStorage.setItem(CLIENT_KEY(clientId), JSON.stringify(parsed.data));
    auditLog(AuditAction.SAVE_CLIENT, { clientId, encrypted: false, error: 'crypto_unavailable' });
  }

  const existingIdx = index.findIndex((r) => r.id === clientId);
  const row: ClientIndexItem = {
    id: clientId,
    name,
    createdAt: existingIdx >= 0 && index[existingIdx] ? index[existingIdx]!.createdAt : now,
    updatedAt: now,
    isEncrypted,
  };

  if (existingIdx >= 0) {
    index[existingIdx] = row;
  } else {
    index.unshift(row);
  }
  writeIndex(index);

  return row;
}

/**
 * Load client data with decryption
 */
export async function loadClientSecure(id: string): Promise<Snapshot | null> {
  const raw = localStorage.getItem(CLIENT_KEY(id));
  if (!raw) {
    auditLog(AuditAction.LOAD_CLIENT, { clientId: id, found: false });
    return null;
  }

  try {
    const obj = JSON.parse(raw);

    // Check if this is encrypted format
    if (obj.version && obj.encryptedFields && Object.keys(obj.encryptedFields).length > 0) {
      const storageFormat = obj as SecureStorageFormat;

      try {
        const encryptionKey = getOrCreateEncryptionKey();
        const decryptedData = await decryptSensitiveFields(
          storageFormat.data,
          storageFormat.encryptedFields,
          encryptionKey
        );

        const parsed = snapshotSchema.safeParse(decryptedData);
        if (!parsed.success) {
          auditLog(AuditAction.LOAD_CLIENT, { clientId: id, error: 'validation_failed' });
          return null;
        }

        auditLog(AuditAction.LOAD_CLIENT, { clientId: id, decrypted: true });
        return parsed.data;
      } catch (error) {
        auditLog(AuditAction.LOAD_CLIENT, { clientId: id, error: 'decryption_failed' });
        throw new Error('Failed to decrypt client data. Please unlock with correct key.');
      }
    }

    // Legacy unencrypted format
    const parsed = snapshotSchema.safeParse(obj.data || obj);
    if (!parsed.success) {
      auditLog(AuditAction.LOAD_CLIENT, { clientId: id, error: 'validation_failed' });
      return null;
    }

    auditLog(AuditAction.LOAD_CLIENT, { clientId: id, decrypted: false });
    return parsed.data;
  } catch (error) {
    auditLog(AuditAction.LOAD_CLIENT, { clientId: id, error: String(error) });
    throw error;
  }
}

/**
 * Delete client data
 */
export function deleteClientSecure(id: string): void {
  const index = readIndex().filter((r) => r.id !== id);
  writeIndex(index);
  localStorage.removeItem(CLIENT_KEY(id));
  auditLog(AuditAction.DELETE_CLIENT, { clientId: id });
}

/**
 * Check if client data is encrypted
 */
export function isClientEncrypted(id: string): boolean {
  const index = readIndex();
  const client = index.find((c) => c.id === id);
  return client?.isEncrypted ?? false;
}

/**
 * Migrate unencrypted client data to encrypted format
 */
export async function migrateClientToEncrypted(id: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(CLIENT_KEY(id));
    if (!raw) return false;

    const obj = JSON.parse(raw);

    // Already encrypted
    if (obj.version && obj.encryptedFields) {
      return true;
    }

    // Parse as legacy format
    const parsed = snapshotSchema.safeParse(obj);
    if (!parsed.success) return false;

    // Re-save with encryption
    const index = readIndex();
    const existing = index.find((c) => c.id === id);
    if (!existing) return false;

    await saveClientSecure(existing.name, parsed.data, id);
    auditLog(AuditAction.MIGRATE_CLIENT, { clientId: id });

    return true;
  } catch {
    return false;
  }
}

/**
 * Migrate all clients to encrypted format
 */
export async function migrateAllClientsToEncrypted(): Promise<{
  total: number;
  migrated: number;
  failed: number;
}> {
  const clients = listClients();
  let migrated = 0;
  let failed = 0;

  for (const client of clients) {
    if (!client.isEncrypted) {
      const success = await migrateClientToEncrypted(client.id);
      if (success) {
        migrated++;
      } else {
        failed++;
      }
    }
  }

  return { total: clients.length, migrated, failed };
}
