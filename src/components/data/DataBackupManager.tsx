import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Database, Clock, Shield, AlertTriangle, Trash2 } from 'lucide-react';

import type { TaxContextValue } from '../../contexts/TaxContext';
import { toast } from '../../utils/toast';

interface BackupFormData {
  personalInfo: TaxContextValue['personalInfo'];
  incomeData: TaxContextValue['incomeData'];
  deductions: TaxContextValue['deductions'];
  paymentsData: TaxContextValue['paymentsData'];
  spouseInfo?: TaxContextValue['spouseInfo'];
  k1Data?: TaxContextValue['k1Data'];
  businessDetails?: TaxContextValue['businessDetails'];
}

interface BackupPayload {
  formData: BackupFormData;
  taxResult: TaxContextValue['taxResult'];
  timestamp: string;
  version: string;
}

interface BackupRecord {
  id: string;
  name: string;
  timestamp: Date;
  size: string;
  data: BackupPayload;
  version: string;
  checksum: string;
}

interface PersistedBackup extends Omit<BackupRecord, 'timestamp'> {
  timestamp: string;
}

interface DataBackupManagerProps {
  formData: BackupFormData;
  taxResult: TaxContextValue['taxResult'];
  onDataRestore: (data: BackupPayload) => void;
  t: (key: string) => string;
}

export const DataBackupManager: React.FC<DataBackupManagerProps> = ({
  formData,
  taxResult,
  onDataRestore,
  t
}) => {
  const translate = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [backupName, setBackupName] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();

    // Auto-save every 5 minutes if enabled
    if (autoSaveEnabled) {
      const interval = setInterval(() => {
        if (hasSignificantData(formData)) {
          createAutoBackup();
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveEnabled, formData]);

  const hasSignificantData = (data: BackupFormData): boolean => {
    return !!(
      (data.personalInfo?.firstName && data.personalInfo?.lastName) ||
      (data.incomeData?.wages && parseFloat(String(data.incomeData.wages)) > 0) ||
      (data.deductions && Object.keys(data.deductions).length > 0)
    );
  };

  const generateChecksum = (data: BackupPayload): string => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const createBackup = (name?: string) => {
    const timestamp = new Date();
    const backupData: BackupPayload = {
      formData,
      taxResult,
      timestamp: timestamp.toISOString(),
      version: '2025.1.0'
    };

    const dataString = JSON.stringify(backupData);
    const size = `${Math.round(dataString.length / 1024)}KB`;
    const checksum = generateChecksum(backupData);

    const backup: BackupRecord = {
      id: `backup_${timestamp.getTime()}`,
      name: name || `Tax Return ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`,
      timestamp,
      size,
      data: backupData,
      version: '2025.1.0',
      checksum
    };

    const updatedBackups = [backup, ...backups].slice(0, 10); // Keep max 10 backups
    setBackups(updatedBackups);
    saveBackupsToStorage(updatedBackups);

    return backup;
  };

  const createAutoBackup = () => {
    createBackup(`Auto-save ${new Date().toLocaleString()}`);
    setLastAutoSave(new Date());
  };

  const createManualBackup = () => {
    if (!backupName.trim()) {
      toast.warning(translate('backup.manager.alert.nameRequired', 'Please enter a backup name'));
      return;
    }

    createBackup(backupName);
    setBackupName('');
    toast.success(translate('backup.manager.alert.success', 'Backup created successfully!'));
  };

  const restoreBackup = (backup: BackupRecord) => {
    try {
      // Verify checksum
      const currentChecksum = generateChecksum(backup.data);
      if (currentChecksum !== backup.checksum) {
        toast.error(translate('backup.manager.alert.checksumMismatch', 'Backup data may be corrupted. Checksum mismatch.'));
        return;
      }

      onDataRestore(backup.data);
      setShowRestoreConfirm(null);
      toast.success(translate('backup.manager.alert.restoreSuccess', 'Data restored successfully!'));
    } catch (error) {
      toast.error(
        `${translate('backup.manager.alert.restoreError', 'Error restoring backup:')} ${(error as Error).message}`
      );
    }
  };

  const deleteBackup = (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      const updatedBackups = backups.filter(b => b.id !== backupId);
      setBackups(updatedBackups);
      saveBackupsToStorage(updatedBackups);
    }
  };

  const exportBackup = (backup: BackupRecord) => {
    const dataStr = JSON.stringify(backup.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${backup.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as Partial<BackupPayload>;

        // Validate the imported data structure
        if (!importedData.formData || !importedData.timestamp || !importedData.taxResult) {
          throw new Error('Invalid backup file format');
        }

        const timestamp = new Date();
        const payload: BackupPayload = {
          formData: importedData.formData,
          taxResult: importedData.taxResult,
          version: importedData.version || 'unknown',
          timestamp: importedData.timestamp
        };

        const backup: BackupRecord = {
          id: `imported_${timestamp.getTime()}`,
          name: `Imported from ${file.name}`,
          timestamp,
          size: `${Math.round(file.size / 1024)}KB`,
          data: payload,
          version: payload.version,
          checksum: generateChecksum(payload)
        };

        const updatedBackups = [backup, ...backups].slice(0, 10);
        setBackups(updatedBackups);
        saveBackupsToStorage(updatedBackups);

        toast.success(translate('backup.manager.alert.importSuccess', 'Backup imported successfully!'));
      } catch (error) {
        toast.error(
          `${translate('backup.manager.alert.importError', 'Error importing backup:')} ${(error as Error).message}`
        );
      }
    };
    reader.readAsText(file);
  };

  const saveBackupsToStorage = (backupsData: BackupRecord[]) => {
    try {
      localStorage.setItem('tax_calculator_backups', JSON.stringify(backupsData));
    } catch (error) {
      console.error('Error saving backups to storage:', error);
    }
  };

  const loadBackups = () => {
    try {
      const saved = localStorage.getItem('tax_calculator_backups');
      if (saved) {
        const parsedBackups: PersistedBackup[] = JSON.parse(saved);
        const normalizedBackups: BackupRecord[] = parsedBackups.map(backup => ({
          ...backup,
          timestamp: new Date(backup.timestamp)
        }));
        setBackups(normalizedBackups);
      }
    } catch (error) {
      console.error('Error loading backups from storage:', error);
    }
  };

  const clearAllBackups = () => {
    if (confirm('Are you sure you want to delete ALL backups? This action cannot be undone.')) {
      setBackups([]);
      localStorage.removeItem('tax_calculator_backups');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {translate('backup.manager.title', 'Data Backup & Recovery')}
        </h3>
      </div>

      {/* Auto-Save Settings */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-900">
              {translate('backup.manager.autoSave.title', 'Auto-Save Protection')}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`dot absolute w-4 h-4 rounded-full bg-white transition ${autoSaveEnabled ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>
        <p className="text-sm text-gray-600">
          {translate(
            'backup.manager.autoSave.description',
            'Automatically saves your data every 5 minutes to prevent data loss.'
          )}
        </p>
        {lastAutoSave && (
          <p className="text-xs text-gray-500 mt-1">
            Last auto-save: {lastAutoSave.toLocaleString()}
          </p>
        )}
      </div>

      {/* Manual Backup Creation */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Create Manual Backup</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="Enter backup name..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={createManualBackup}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Backup
          </button>
        </div>
      </div>

      {/* Import/Export */}
      <div className="flex gap-2 mb-6">
        <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
          <Upload className="h-4 w-4" />
          Import Backup
          <input
            type="file"
            accept=".json"
            onChange={importBackup}
            className="hidden"
          />
        </label>
        <button
          onClick={clearAllBackups}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </button>
      </div>

      {/* Backup List */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Saved Backups ({backups.length}/10)</h4>
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No backups available</p>
            <p className="text-sm">Create your first backup to secure your tax data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div key={backup.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{backup.name}</h5>
                      {backup.name.includes('Auto-save') && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {backup.timestamp.toLocaleString()}
                        </span>
                        <span>{backup.size}</span>
                        <span>v{backup.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => setShowRestoreConfirm(backup.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      title="Restore"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => exportBackup(backup)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded"
                      title="Export"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Restore Confirmation */}
                {showRestoreConfirm === backup.id && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Confirm Restore</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      This will replace all current data with the backup from {backup.timestamp.toLocaleString()}.
                      Any unsaved changes will be lost.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreBackup(backup)}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Confirm Restore
                      </button>
                      <button
                        onClick={() => setShowRestoreConfirm(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Security Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">
            {translate('backup.manager.security.title', 'Data Security')}
          </span>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>{translate('backup.manager.security.tip1', 'All data is stored locally in your browser')}</li>
          <li>{translate('backup.manager.security.tip2', 'Backups include checksums for data integrity verification')}</li>
          <li>{translate('backup.manager.security.tip3', 'No personal information is sent to external servers')}</li>
          <li>{translate('backup.manager.security.tip4', 'Export backups for additional security')}</li>
        </ul>
      </div>
    </div>
  );
};
