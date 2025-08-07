import { useState } from 'react';
import { getTranslation, getLanguageInfo } from '../utils/translations';

export const useLanguage = (initialLanguage = 'en') => {
  const [language, setLanguage] = useState(initialLanguage);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const t = (path) => {
    return getTranslation(path, language);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setShowLanguageMenu(false);
  };

  const toggleLanguageMenu = () => {
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