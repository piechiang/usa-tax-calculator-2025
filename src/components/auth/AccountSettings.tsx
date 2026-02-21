/**
 * Account Settings Component
 *
 * Displays user profile and preferences management.
 * Supports both local and cloud modes.
 */

import { useState } from 'react';
import { useAuth, UserPreferences } from '../../contexts/AuthContext';

interface AccountSettingsProps {
  t: (key: string) => string;
  onClose?: () => void;
}

export function AccountSettings({ t, onClose }: AccountSettingsProps) {
  const {
    user,
    authMode,
    isLoading,
    updateProfile,
    updatePreferences,
    endLocalSession,
    logout,
    enableCloudSync,
    disableCloudSync,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  if (!user) {
    return null;
  }

  const handleSaveDisplayName = async () => {
    await updateProfile({ displayName });
    setEditingName(false);
  };

  const handlePreferenceChange = async (
    key: keyof UserPreferences,
    value: UserPreferences[keyof UserPreferences]
  ) => {
    await updatePreferences({ [key]: value });
  };

  const handleLogout = async () => {
    if (authMode === 'local') {
      endLocalSession();
    } else {
      await logout();
    }
    onClose?.();
  };

  const handleToggleSync = async () => {
    if (user.syncEnabled) {
      disableCloudSync();
    } else {
      setShowSyncConfirm(true);
    }
  };

  const confirmEnableSync = async () => {
    await enableCloudSync();
    setShowSyncConfirm(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(user.displayName ?? user.email ?? 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  {user.displayName || user.email || t('auth.localUser')}
                </h2>
                <p className="text-blue-100 text-sm">
                  {authMode === 'local' ? t('auth.localMode') : t('auth.cloudMode')}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                aria-label={t('common.close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {(['profile', 'preferences', 'security'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`auth.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.displayName')}
                </label>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('auth.enterDisplayName')}
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t('common.save')}
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setDisplayName(user.displayName || '');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{user.displayName || t('auth.notSet')}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t('common.edit')}
                    </button>
                  </div>
                )}
              </div>

              {user.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <span className="text-gray-900">{user.email}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.accountCreated')}
                </label>
                <span className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.lastLogin')}
                </label>
                <span className="text-gray-900">{new Date(user.lastLoginAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.theme')}
                </label>
                <select
                  value={user.preferences.theme}
                  onChange={(e) =>
                    handlePreferenceChange('theme', e.target.value as UserPreferences['theme'])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="system">{t('auth.themeSystem')}</option>
                  <option value="light">{t('auth.themeLight')}</option>
                  <option value="dark">{t('auth.themeDark')}</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('auth.autoSave')}
                  </label>
                  <p className="text-sm text-gray-500">{t('auth.autoSaveDescription')}</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('autoSave', !user.preferences.autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.preferences.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('auth.autoBackup')}
                  </label>
                  <p className="text-sm text-gray-500">{t('auth.autoBackupDescription')}</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('autoBackup', !user.preferences.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.preferences.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.preferences.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('auth.showOnboarding')}
                  </label>
                  <p className="text-sm text-gray-500">{t('auth.showOnboardingDescription')}</p>
                </div>
                <button
                  onClick={() =>
                    handlePreferenceChange('showOnboarding', !user.preferences.showOnboarding)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.preferences.showOnboarding ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.preferences.showOnboarding ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('auth.cloudSync')}
                  </label>
                  <p className="text-sm text-gray-500">{t('auth.cloudSyncDescription')}</p>
                </div>
                <button
                  onClick={handleToggleSync}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.syncEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {showSyncConfirm && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">{t('auth.enableSyncTitle')}</h4>
                  <p className="text-sm text-blue-800 mb-4">{t('auth.enableSyncDescription')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmEnableSync}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      {t('auth.enableSync')}
                    </button>
                    <button
                      onClick={() => setShowSyncConfirm(false)}
                      className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  {authMode === 'local' ? t('auth.endSession') : t('auth.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
