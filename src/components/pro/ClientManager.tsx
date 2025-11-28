import React, { useState, useEffect } from 'react';
import {
  listClients,
  saveClientSecure,
  loadClientSecure,
  deleteClientSecure,
  isClientEncrypted,
  migrateClientToEncrypted,
  type ClientIndexItem,
} from '../../utils/secureClientStorage';
import { hasEncryptionKey, isCryptoAvailable, clearEncryptionKey } from '../../utils/crypto';
import type { TaxCalculatorSnapshot } from '../../hooks/useTaxCalculator';
import PassphraseModal from './PassphraseModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  getSnapshot: () => TaxCalculatorSnapshot;
  loadFromSnapshot: (snapshot: Partial<TaxCalculatorSnapshot>) => void;
};

export default function ClientManager({ isOpen, onClose, getSnapshot, loadFromSnapshot }: Props) {
  const [clients, setClients] = useState<ClientIndexItem[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [passphraseMode, setPassphraseMode] = useState<'unlock' | 'setup'>('unlock');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);

  // Check if we need to show migration banner
  useEffect(() => {
    if (isOpen) {
      const clientList = listClients();
      const hasUnencrypted = clientList.some(c => !c.isEncrypted);
      setShowMigrationBanner(hasUnencrypted && isCryptoAvailable());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      refresh();
      // Check if encryption key is available
      const keyExists = hasEncryptionKey();
      setIsUnlocked(keyExists);

      // If no key and we have a key hash (setup was done), show unlock modal
      const hasKeyHash = localStorage.getItem('utc:encryption:keyHash') !== null;
      if (!keyExists && hasKeyHash) {
        setPassphraseMode('unlock');
        setShowPassphraseModal(true);
      } else if (!keyExists && !hasKeyHash) {
        // First time - setup mode
        setPassphraseMode('setup');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const refresh = () => setClients(listClients());

  const handleUnlock = () => {
    setIsUnlocked(true);
    setShowPassphraseModal(false);
    refresh();
  };

  const handleLock = () => {
    clearEncryptionKey();
    setIsUnlocked(false);
    setSelected(null);
    setName('');
  };

  const handleSave = async () => {
    if (!isUnlocked && isCryptoAvailable()) {
      setPassphraseMode('setup');
      setShowPassphraseModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const snap = getSnapshot();
      const row = await saveClientSecure(name || 'Untitled Return', snap, selected || undefined);
      setName(row.name);
      setSelected(row.id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!selected) return;

    const encrypted = isClientEncrypted(selected);
    if (encrypted && !isUnlocked) {
      setPassphraseMode('unlock');
      setShowPassphraseModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const snap = await loadClientSecure(selected);
      if (snap) {
        loadFromSnapshot(snap);
        onClose();
      } else {
        setError('Failed to load client data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) return;

    deleteClientSecure(selected);
    setSelected(null);
    refresh();
  };

  const handleMigrateSelected = async () => {
    if (!selected) return;
    if (!isUnlocked) {
      setPassphraseMode('setup');
      setShowPassphraseModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const success = await migrateClientToEncrypted(selected);
      if (success) {
        refresh();
      } else {
        setError('Migration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateAll = async () => {
    if (!confirm('Migrate all unencrypted clients to encrypted storage? This is recommended for security.')) {
      return;
    }

    if (!isUnlocked) {
      setPassphraseMode('setup');
      setShowPassphraseModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const { migrateAllClientsToEncrypted } = await import('../../utils/secureClientStorage');
      const result = await migrateAllClientsToEncrypted();

      if (result.failed > 0) {
        setError(`Migrated ${result.migrated} clients, ${result.failed} failed`);
      }

      refresh();
      setShowMigrationBanner(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selected);
  const selectedIsEncrypted = selectedClient?.isEncrypted ?? false;

  return (
    <>
      <PassphraseModal
        isOpen={showPassphraseModal}
        onUnlock={handleUnlock}
        onCancel={() => setShowPassphraseModal(false)}
        mode={passphraseMode}
      />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Client Manager</h3>
              {isCryptoAvailable() && (
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        🔓 Unlocked
                      </span>
                      <button
                        onClick={handleLock}
                        className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Lock
                      </button>
                    </>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      🔒 Locked
                    </span>
                  )}
                </div>
              )}
            </div>
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              ✕ Close
            </button>
          </div>

          {!isCryptoAvailable() && (
            <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-medium">⚠️ Encryption Unavailable</p>
              <p className="mt-1">
                Your browser doesn't support encryption. Client data will be saved unencrypted.
                Use HTTPS or localhost for encryption support.
              </p>
            </div>
          )}

          {showMigrationBanner && (
            <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">🔐 Enhance Security</p>
                  <p className="mt-1">
                    You have unencrypted client data. Migrate to encrypted storage for better protection.
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleMigrateAll}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    Migrate All
                  </button>
                  <button
                    onClick={() => setShowMigrationBanner(false)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Saved Clients</div>
              <div className="border rounded-md max-h-96 overflow-auto divide-y">
                {clients.length === 0 && (
                  <div className="p-3 text-gray-500 text-sm">No clients yet</div>
                )}
                {clients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelected(c.id); setName(c.name); }}
                    className={`w-full text-left p-3 hover:bg-gray-50 ${selected === c.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.name}</div>
                      {c.isEncrypted && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          🔒 Encrypted
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Updated {new Date(c.updatedAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  onClick={handleLoad}
                  disabled={!selected || isLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
                >
                  {isLoading ? 'Loading...' : 'Load'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!selected || isLoading}
                  className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50 hover:bg-red-700"
                >
                  Delete
                </button>
                {selected && !selectedIsEncrypted && isCryptoAvailable() && (
                  <button
                    onClick={handleMigrateSelected}
                    disabled={isLoading}
                    className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700 text-sm"
                  >
                    🔒 Encrypt
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">Save Current Return</div>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Client name (e.g., John & Jane 2025)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div className="mt-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : selected ? 'Update' : 'Save New'}
                </button>
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium text-gray-700 mb-1">💡 Tips</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Select a client from the list to update their return</li>
                    <li>Client data is saved locally in your browser</li>
                    {isCryptoAvailable() && (
                      <li>Sensitive data (SSNs, EINs) is encrypted for security</li>
                    )}
                  </ul>
                </div>

                {isCryptoAvailable() && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium text-blue-700 mb-1">🔐 Encryption Info</p>
                    <p className="text-xs text-blue-600">
                      {isUnlocked
                        ? 'New clients will be encrypted automatically. Your passphrase remains in session until you lock or close the browser.'
                        : 'Set up a passphrase to enable encryption when saving clients.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
