import { useState } from 'react';
import { getTranslation, getLanguageInfo } from '../utils/translations';

export interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

export interface UseLanguageReturn {
  language: string;
  showLanguageMenu: boolean;
  t: (path: string) => string;
  changeLanguage: (newLanguage: string) => void;
  toggleLanguageMenu: () => void;
  currentLanguageInfo: LanguageInfo;
}

export const useLanguage = (initialLanguage: string = 'en'): UseLanguageReturn => {
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);

  const t = (path: string): string => {
    return getTranslation(path, language);
  };

  const changeLanguage = (newLanguage: string): void => {
    setLanguage(newLanguage);
    setShowLanguageMenu(false);
  };

  const toggleLanguageMenu = (): void => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const currentLanguageInfo = getLanguageInfo(language);

  return {
    language,
    showLanguageMenu,
    t,
    changeLanguage,
    toggleLanguageMenu,
    currentLanguageInfo
  };
};
