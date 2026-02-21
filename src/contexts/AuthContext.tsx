/**
 * Authentication Context
 *
 * Provides user authentication state and operations.
 * Designed to support both local-only mode and future cloud sync.
 *
 * Phase 2a: Local authentication simulation (passphrase-based)
 * Phase 2b: Cloud authentication (email/password, OAuth)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// User profile interface
export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
  syncEnabled: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  autoBackup: boolean;
  showOnboarding: boolean;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  authMode: 'local' | 'cloud'; // local = passphrase only, cloud = full auth
  error: string | null;
}

// Context value interface
interface AuthContextValue extends AuthState {
  // Local mode operations (Phase 2a)
  initLocalSession: (passphrase: string) => Promise<boolean>;
  endLocalSession: () => void;

  // Cloud mode operations (Phase 2b - prepared but not yet implemented)
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;

  // User operations
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;

  // Cloud sync toggle
  enableCloudSync: () => Promise<boolean>;
  disableCloudSync: () => void;

  // Session management
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  autoSave: true,
  autoBackup: true,
  showOnboarding: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'utc:user:profile',
  SESSION_TOKEN: 'utc:session:token',
  AUTH_MODE: 'utc:auth:mode',
  PREFERENCES: 'utc:user:preferences',
};

// Generate unique ID
const generateId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    authMode: 'local',
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        const savedMode = localStorage.getItem(STORAGE_KEYS.AUTH_MODE) as 'local' | 'cloud' | null;
        const sessionToken = sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

        if (savedProfile && sessionToken) {
          const user = JSON.parse(savedProfile) as UserProfile;
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            authMode: savedMode || 'local',
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false, error: 'Failed to restore session' }));
      }
    };

    initAuth();
  }, []);

  // Local session initialization (Phase 2a)
  const initLocalSession = useCallback(async (passphrase: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Validate passphrase meets minimum requirements
      if (passphrase.length < 8) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Passphrase must be at least 8 characters',
        }));
        return false;
      }

      // Check if user profile exists
      let user: UserProfile;
      const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

      if (savedProfile) {
        user = JSON.parse(savedProfile);
        user.lastLoginAt = new Date().toISOString();
      } else {
        // Create new local user
        user = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: defaultPreferences,
          syncEnabled: false,
        };
      }

      // Save user profile
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_MODE, 'local');

      // Create session token (hash of passphrase + timestamp for uniqueness)
      const sessionToken = btoa(`${Date.now()}_${passphrase.slice(0, 4)}`);
      sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        authMode: 'local',
        error: null,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize session';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return false;
    }
  }, []);

  // End local session
  const endLocalSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      authMode: 'local',
      error: null,
    });
  }, []);

  // Cloud login (Phase 2b - placeholder)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Implement actual API call when backend is ready
      // For now, simulate local cloud-like login
      console.log('Cloud login not yet implemented. Email:', email);

      // Placeholder: create local user with email
      const user: UserProfile = {
        id: generateId(),
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: defaultPreferences,
        syncEnabled: false,
      };

      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_MODE, 'cloud');
      sessionStorage.setItem(
        STORAGE_KEYS.SESSION_TOKEN,
        btoa(`${Date.now()}_${password.slice(0, 4)}`)
      );

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        authMode: 'cloud',
        error: null,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, []);

  // Cloud registration (Phase 2b - placeholder)
  const register = useCallback(
    async (email: string, password: string, displayName?: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // TODO: Implement actual API call when backend is ready
        console.log('Cloud registration not yet implemented. Email:', email);

        // Placeholder: create local user
        const user: UserProfile = {
          id: generateId(),
          email,
          displayName: displayName || email.split('@')[0],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: defaultPreferences,
          syncEnabled: false,
        };

        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.AUTH_MODE, 'cloud');
        sessionStorage.setItem(
          STORAGE_KEYS.SESSION_TOKEN,
          btoa(`${Date.now()}_${password.slice(0, 4)}`)
        );

        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
          authMode: 'cloud',
          error: null,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return false;
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      // TODO: Call logout API when backend is ready
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        authMode: state.authMode,
        error: null,
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [state.authMode]);

  // Password reset (Phase 2b - placeholder)
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    // TODO: Implement actual API call when backend is ready
    console.log('Password reset not yet implemented. Email:', email);
    return false;
  }, []);

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      if (!state.user) return;

      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
      setState((prev) => ({ ...prev, user: updatedUser }));
    },
    [state.user]
  );

  // Update user preferences
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<void> => {
      if (!state.user) return;

      const updatedUser = {
        ...state.user,
        preferences: { ...state.user.preferences, ...updates },
      };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
      setState((prev) => ({ ...prev, user: updatedUser }));
    },
    [state.user]
  );

  // Enable cloud sync
  const enableCloudSync = useCallback(async (): Promise<boolean> => {
    if (!state.user) return false;

    // TODO: Implement cloud sync initialization
    const updatedUser = { ...state.user, syncEnabled: true };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
    setState((prev) => ({ ...prev, user: updatedUser }));

    return true;
  }, [state.user]);

  // Disable cloud sync
  const disableCloudSync = useCallback(() => {
    if (!state.user) return;

    const updatedUser = { ...state.user, syncEnabled: false };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
    setState((prev) => ({ ...prev, user: updatedUser }));
  }, [state.user]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    // TODO: Implement session refresh when backend is ready
    if (state.user) {
      const updatedUser = { ...state.user, lastLoginAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
      setState((prev) => ({ ...prev, user: updatedUser }));
    }
  }, [state.user]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    initLocalSession,
    endLocalSession,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    updatePreferences,
    enableCloudSync,
    disableCloudSync,
    refreshSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
