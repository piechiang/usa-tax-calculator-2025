import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguage, type LanguageInfo } from '../hooks/useLanguage';

interface LanguageContextType {
  language: string;
  showLanguageMenu: boolean;
  currentLanguageInfo: LanguageInfo;
  t: (key: string) => string;
  changeLanguage: (lang: string) => void;
  toggleLanguageMenu: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en'
}) => {
  const languageHook = useLanguage(defaultLanguage);

  return (
    <LanguageContext.Provider value={languageHook}>
      {children}
    </LanguageContext.Provider>
  );
};
