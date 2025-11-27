import React, { ReactNode } from 'react';
import { TaxProvider } from './TaxContext';
import { UIProvider } from './UIContext';
import { LanguageProvider } from './LanguageContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root provider that combines all context providers
 * Wraps the app with TaxProvider, UIProvider, and LanguageProvider
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LanguageProvider defaultLanguage="en">
      <TaxProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </TaxProvider>
    </LanguageProvider>
  );
};
