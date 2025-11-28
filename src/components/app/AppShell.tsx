import { useEffect } from 'react';

import { AppHeader } from '../layout/AppHeader';
import { ActionButtons } from '../layout/ActionButtons';
import { ClassicModeView } from '../layout/ClassicModeView';
import { ModalManager } from '../modals/ModalManager';
import { ModernModeView } from '../layout/ModernModeView';

import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';

export function AppShell() {
  const {
    language,
    showLanguageMenu,
    t,
    changeLanguage,
    toggleLanguageMenu,
    currentLanguageInfo
  } = useLanguageContext();

  const { personalInfo } = useTaxContext();

  const { useClassicMode, setShowClientManager, setSelectedState } = useUIContext();

  // Sync UI selectedState with PersonalInfo.state
  useEffect(() => {
    if (personalInfo.state) {
      setSelectedState(personalInfo.state);
    } else if (personalInfo.isMaryland) {
      // Backward compatibility - fallback to deprecated isMaryland
      setSelectedState('MD');
    } else {
      setSelectedState('');
    }
  }, [personalInfo.state, personalInfo.isMaryland, setSelectedState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <AppHeader
          t={t}
          language={language}
          showLanguageMenu={showLanguageMenu}
          currentLanguageInfo={currentLanguageInfo}
          toggleLanguageMenu={toggleLanguageMenu}
          changeLanguage={changeLanguage}
        />

        <ActionButtons />

        {useClassicMode ? <ClassicModeView /> : <ModernModeView />}
      </div>

      <button
        className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors"
        onClick={() => setShowClientManager(true)}
        aria-label="Open client manager to save and load tax returns"
      >
        Clients
      </button>

      <ModalManager />
    </div>
  );
}
