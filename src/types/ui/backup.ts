/**
 * Centralized backup and restore type definitions
 * Used by DataBackupManager and useTaxDataHandlers
 */

import type { TaxContextValue } from '../../contexts/TaxContext';

/**
 * Form data structure for backups
 */
export interface BackupFormData {
  personalInfo: TaxContextValue['personalInfo'];
  incomeData: TaxContextValue['incomeData'];
  deductions: TaxContextValue['deductions'];
  paymentsData: TaxContextValue['paymentsData'];
  spouseInfo?: TaxContextValue['spouseInfo'];
  k1Data?: TaxContextValue['k1Data'];
  businessDetails?: TaxContextValue['businessDetails'];
}

/**
 * Complete backup payload with metadata
 */
export interface BackupPayload {
  formData: BackupFormData;
  taxResult: TaxContextValue['taxResult'];
  timestamp: string;
  version: string;
}

/**
 * Backup record with runtime metadata
 */
export interface BackupRecord {
  id: string;
  name: string;
  timestamp: Date;
  size: string;
  data: BackupPayload;
  version: string;
  checksum: string;
}

/**
 * Persisted backup (timestamp as string for storage)
 */
export interface PersistedBackup extends Omit<BackupRecord, 'timestamp'> {
  timestamp: string;
}

/**
 * Minimal backup data for restore operations
 * Used by useTaxDataHandlers
 */
export interface RestoreData {
  formData?: {
    personalInfo?: Record<string, unknown>;
    incomeData?: Record<string, unknown>;
    deductions?: Record<string, unknown>;
    paymentsData?: Record<string, unknown>;
    spouseInfo?: Record<string, unknown>;
    k1Data?: Record<string, unknown>;
    businessDetails?: Record<string, unknown>;
  };
  taxResult?: Record<string, unknown>;
}
