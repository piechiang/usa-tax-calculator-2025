import { translations } from '../constants/translations';
import { languages } from '../constants/languages';

interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

export const getTranslation = (path: string, language: string): string => {
  const keys = path.split('.');
  let result: unknown = translations[language];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof result === 'string' ? result : path;
};

export const getLanguageInfo = (language: string): LanguageInfo => {
  const found = languages.find(lang => lang.code === language);
  const fallback = languages[0];
  if (!fallback) {
    return { code: 'en', name: 'English', flag: '🇺🇸' };
  }
  return found || fallback;
};
