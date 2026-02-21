import React, { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4F46E5', // brand.DEFAULT
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <LanguageProvider defaultLanguage="en">
        <TaxProvider>
          <UIProvider>{children}</UIProvider>
        </TaxProvider>
      </LanguageProvider>
    </ConfigProvider>
  );
};
