import { useEffect, useState } from 'react';

import { AppHeader } from '../layout/AppHeader';
import { ActionButtons } from '../layout/ActionButtons';
import { ClassicModeView } from '../layout/ClassicModeView';
import { ModalManager } from '../modals/ModalManager';
import { ModernModeView } from '../layout/ModernModeView';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { DisclaimerBanner } from '../ui/DisclaimerBanner';
import { WelcomeGuide } from '../onboarding/WelcomeGuide';

import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTaxContext } from '../../contexts/TaxContext';
import { useUIContext } from '../../contexts/UIContext';
import { errorLogger } from '../../utils/errorLogger';

export function AppShell() {
  const { language, showLanguageMenu, t, changeLanguage, toggleLanguageMenu, currentLanguageInfo } =
    useLanguageContext();

  const { personalInfo } = useTaxContext();

  const { useClassicMode, setShowClientManager, setSelectedState } = useUIContext();

  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  // Check if first-time user
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('tax_calculator_onboarding_complete');
    if (onboardingComplete !== 'true') {
      setShowWelcomeGuide(true);
    }
  }, []);

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
        <ErrorBoundary
          onError={(error, errorInfo) => errorLogger.log(error, errorInfo, { section: 'header' })}
        >
          <AppHeader
            t={t}
            language={language}
            showLanguageMenu={showLanguageMenu}
            currentLanguageInfo={currentLanguageInfo}
            toggleLanguageMenu={toggleLanguageMenu}
            changeLanguage={changeLanguage}
          />
        </ErrorBoundary>

        <DisclaimerBanner t={t} />

        <ErrorBoundary
          onError={(error, errorInfo) => errorLogger.log(error, errorInfo, { section: 'actions' })}
        >
          <ActionButtons />
        </ErrorBoundary>

        <ErrorBoundary
          onError={(error, errorInfo) =>
            errorLogger.log(error, errorInfo, { section: 'main-view' })
          }
        >
          {useClassicMode ? <ClassicModeView /> : <ModernModeView />}
        </ErrorBoundary>
      </div>

      <button
        className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors"
        onClick={() => setShowClientManager(true)}
        aria-label="Open client manager to save and load tax returns"
      >
        Clients
      </button>

      <ErrorBoundary
        onError={(error, errorInfo) => errorLogger.log(error, errorInfo, { section: 'modals' })}
      >
        <ModalManager />
      </ErrorBoundary>

      {showWelcomeGuide && (
        <WelcomeGuide
          t={t}
          onComplete={() => setShowWelcomeGuide(false)}
          onSkip={() => setShowWelcomeGuide(false)}
        />
      )}
    </div>
  );
}
