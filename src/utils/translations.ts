/**
 * Translation utilities
 *
 * This module provides translation functions with support for:
 * - Synchronous translation lookup
 * - Fallback to default language (English)
 * - Variable interpolation
 */

import { translations } from '../constants/translations';
import { languages } from '../constants/languages';

interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

/**
 * Get translation by path
 *
 * @param path - Dot-separated path to translation (e.g., 'personalInfo.firstName')
 * @param language - Language code
 * @returns Translated string or path if not found
 */
export const getTranslation = (path: string, language: string): string => {
  const keys = path.split('.');

  // Try requested language first
  let result: unknown = translations[language];

  if (result) {
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        result = undefined;
        break;
      }
    }

    if (typeof result === 'string') {
      return result;
    }
  }

  // Fallback to English if translation not found
  if (language !== 'en') {
    return getTranslation(path, 'en');
  }

  // Return path as fallback
  return path;
};

/**
 * Get language info by code
 */
export const getLanguageInfo = (language: string): LanguageInfo => {
  const found = languages.find((lang) => lang.code === language);
  const fallback = languages[0];
  if (!fallback) {
    return { code: 'en', name: 'English', flag: '🇺🇸' };
  }
  return found || fallback;
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = (): LanguageInfo[] => {
  return [...languages];
};

/**
 * Check if a language is supported
 */
export const isLanguageSupported = (language: string): boolean => {
  return language in translations;
};

/**
 * Get translation with interpolation
 * Supports {variable} syntax for dynamic values
 *
 * @param path - Translation path
 * @param language - Language code
 * @param variables - Object with variable values to interpolate
 */
export const getTranslationWithVariables = (
  path: string,
  language: string,
  variables: Record<string, string | number>
): string => {
  let translation = getTranslation(path, language);

  for (const [key, value] of Object.entries(variables)) {
    translation = translation.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }

  return translation;
};
