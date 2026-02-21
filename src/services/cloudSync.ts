/**
 * Cloud Sync Service
 *
 * Provides infrastructure for syncing encrypted tax data to cloud storage.
 * Currently a placeholder implementation for future backend integration.
 *
 * Security Model:
 * - All data is encrypted client-side before upload
 * - Encryption keys are derived from user passphrase
 * - Server never sees unencrypted data
 */

import { useState, useEffect } from 'react';
import { UserProfile } from '../contexts/AuthContext';

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: string | null;
  pendingChanges: number;
  error: string | null;
}

export interface SyncableData {
  version: number;
  timestamp: string;
  checksum: string;
  encryptedPayload: string;
}

// Encryption utilities (using Web Crypto API)
async function deriveKey(passphrase: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
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
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i] ?? 0);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

async function encryptData(
  data: string,
  passphrase: string
): Promise<{ encrypted: string; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer);

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));

  return {
    encrypted: uint8ArrayToBase64(new Uint8Array(encrypted)),
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
  };
}

async function decryptData(
  encryptedData: string,
  salt: string,
  iv: string,
  passphrase: string
): Promise<string> {
  const saltArray = base64ToUint8Array(salt);
  const ivArray = base64ToUint8Array(iv);
  const encryptedArray = base64ToUint8Array(encryptedData);

  const key = await deriveKey(passphrase, saltArray.buffer as ArrayBuffer);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray.buffer as ArrayBuffer },
    key,
    encryptedArray.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

// Calculate checksum for data integrity
function calculateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Cloud Sync Service Class
 *
 * Handles all cloud synchronization operations.
 * Currently implements local simulation for development.
 */
export class CloudSyncService {
  private syncState: SyncState = {
    status: 'idle',
    lastSyncAt: null,
    pendingChanges: 0,
    error: null,
  };

  private listeners: Set<(state: SyncState) => void> = new Set();
  private passphrase: string | null = null;

  // Initialize with user passphrase for encryption
  setPassphrase(passphrase: string): void {
    this.passphrase = passphrase;
  }

  clearPassphrase(): void {
    this.passphrase = null;
  }

  // Subscribe to sync state changes
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.syncState);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.syncState));
  }

  private updateState(updates: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...updates };
    this.notifyListeners();
  }

  // Check if sync is available
  isSyncAvailable(): boolean {
    return !!this.passphrase && navigator.onLine;
  }

  // Get current sync state
  getState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Upload encrypted data to cloud
   * Currently simulates the upload process
   */
  async uploadData(data: Record<string, unknown>, user: UserProfile): Promise<boolean> {
    if (!this.passphrase) {
      this.updateState({ status: 'error', error: 'No passphrase set' });
      return false;
    }

    if (!navigator.onLine) {
      this.updateState({ status: 'offline', error: 'No internet connection' });
      return false;
    }

    try {
      this.updateState({ status: 'syncing', error: null });

      // Serialize and encrypt the data
      const jsonData = JSON.stringify(data);
      const checksum = calculateChecksum(jsonData);
      const { encrypted, salt, iv } = await encryptData(jsonData, this.passphrase);

      const syncPayload: SyncableData = {
        version: 1,
        timestamp: new Date().toISOString(),
        checksum,
        encryptedPayload: JSON.stringify({ encrypted, salt, iv }),
      };

      // Simulate API call (replace with actual API in production)
      await this.simulateApiCall('upload', { userId: user.id, payload: syncPayload });

      this.updateState({
        status: 'success',
        lastSyncAt: new Date().toISOString(),
        pendingChanges: 0,
      });

      return true;
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      return false;
    }
  }

  /**
   * Download and decrypt data from cloud
   */
  async downloadData(user: UserProfile): Promise<Record<string, unknown> | null> {
    if (!this.passphrase) {
      this.updateState({ status: 'error', error: 'No passphrase set' });
      return null;
    }

    if (!navigator.onLine) {
      this.updateState({ status: 'offline', error: 'No internet connection' });
      return null;
    }

    try {
      this.updateState({ status: 'syncing', error: null });

      // Simulate API call
      const response = await this.simulateApiCall('download', { userId: user.id });

      if (!response) {
        this.updateState({ status: 'success', lastSyncAt: new Date().toISOString() });
        return null; // No data on server
      }

      const syncData = response as SyncableData;
      const { encrypted, salt, iv } = JSON.parse(syncData.encryptedPayload);

      // Decrypt the data
      const decrypted = await decryptData(encrypted, salt, iv, this.passphrase);

      // Verify checksum
      if (calculateChecksum(decrypted) !== syncData.checksum) {
        throw new Error('Data integrity check failed');
      }

      const data = JSON.parse(decrypted);

      this.updateState({
        status: 'success',
        lastSyncAt: new Date().toISOString(),
      });

      return data;
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed',
      });
      return null;
    }
  }

  /**
   * Mark that there are pending changes to sync
   */
  markPendingChanges(): void {
    this.updateState({ pendingChanges: this.syncState.pendingChanges + 1 });
  }

  /**
   * Simulate API call for development
   * Replace with actual API calls in production
   */
  private async simulateApiCall(
    _action: 'upload' | 'download',
    _params: Record<string, unknown>
  ): Promise<unknown> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In production, this would make actual HTTP requests:
    // const response = await fetch(`${API_BASE_URL}/${action}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(params),
    // });
    // return response.json();

    // For now, just log and return success
    console.log('[CloudSync] Simulated API call:', _action);
    return null;
  }
}

// Singleton instance
export const cloudSyncService = new CloudSyncService();

// React hook for using sync state
export function useSyncState(): SyncState {
  const [state, setState] = useState<SyncState>(cloudSyncService.getState());

  useEffect(() => {
    return cloudSyncService.subscribe(setState);
  }, []);

  return state;
}
