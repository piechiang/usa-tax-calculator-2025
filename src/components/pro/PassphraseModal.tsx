import React, { useState, useEffect } from 'react';
import { isCryptoAvailable, setEncryptionKey } from '../../utils/crypto';

type Props = {
  isOpen: boolean;
  onUnlock: () => void;
  onCancel: () => void;
  mode: 'unlock' | 'setup';
};

export default function PassphraseModal({ isOpen, onUnlock, onCancel, mode }: Props) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassphrase('');
      setConfirmPassphrase('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isCryptoAvailable()) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Encryption Not Available</h3>
          <p className="text-gray-700 mb-4">
            Your browser does not support the Web Cryptography API required for encrypted storage.
            Client data will be saved without encryption.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            To use encryption, please use a modern browser with HTTPS or localhost.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onUnlock}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Continue Unencrypted
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passphrase) {
      setError('Please enter a passphrase');
      return;
    }

    if (mode === 'setup') {
      if (passphrase.length < 12) {
        setError('Passphrase must be at least 12 characters');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError('Passphrases do not match');
        return;
      }
    }

    try {
      const ok = await setEncryptionKey(passphrase);
      if (!ok) {
        setError('Invalid passphrase');
        return;
      }

      onUnlock();
    } catch {
      setError('Invalid passphrase');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {mode === 'setup' ? 'Set Up Encryption' : 'Unlock Client Data'}
          </h3>

          {mode === 'setup' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <p className="font-medium mb-1">Secure Your Data</p>
              <p>
                Create a strong passphrase to encrypt sensitive information (SSNs, EINs, etc.).
                You'll need this passphrase to access encrypted client data.
              </p>
            </div>
          )}

          {mode === 'unlock' && (
            <p className="text-gray-600 mb-4">
              Enter your passphrase to decrypt and access client data.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                  placeholder={mode === 'setup' ? 'Create a strong passphrase (12+ characters)' : 'Enter your passphrase'}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {mode === 'setup' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Passphrase
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Re-enter your passphrase"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {error}
              </div>
            )}

            {mode === 'setup' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <p className="font-medium mb-1">Important</p>
                <p>
                  If you forget your passphrase, encrypted data cannot be recovered.
                  Store it in a secure password manager.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {mode === 'setup' ? 'Set Up Encryption' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
