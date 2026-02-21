/**
 * Auth Modal Component
 *
 * Modal wrapper for authentication forms (login, register, settings).
 * Manages view switching between different auth states.
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { AccountSettings } from './AccountSettings';

type AuthView = 'login' | 'register' | 'settings';

interface AuthModalProps {
  t: (key: string) => string;
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModal({ t, isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);

  // If authenticated, always show settings
  const currentView = isAuthenticated ? 'settings' : view;

  if (!isOpen) {
    return null;
  }

  const handleSuccess = () => {
    if (isAuthenticated) {
      setView('settings');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleBackdropClick} />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button for non-authenticated views */}
          {currentView !== 'settings' && (
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Content */}
          {currentView === 'login' && (
            <LoginForm
              t={t}
              onSuccess={handleSuccess}
              onSwitchToRegister={() => setView('register')}
            />
          )}

          {currentView === 'register' && (
            <RegisterForm
              t={t}
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}

          {currentView === 'settings' && <AccountSettings t={t} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
