import React from 'react';
import { Globe, CheckCircle } from 'lucide-react';
import { languages } from '../../constants/languages';
import { TaxYearSelector } from '../ui/TaxYearSelector';

interface AppHeaderProps {
  t: (key: string) => string;
  language: string;
  showLanguageMenu: boolean;
  currentLanguageInfo: {
    code: string;
    name: string;
    flag: string;
  };
  toggleLanguageMenu: () => void;
  changeLanguage: (lang: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  t,
  language,
  showLanguageMenu,
  currentLanguageInfo,
  toggleLanguageMenu,
  changeLanguage,
}) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-4xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 ml-4">
          {/* Tax Year Selector */}
          <TaxYearSelector />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={toggleLanguageMenu}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span>
                {currentLanguageInfo.flag} {currentLanguageInfo.name}
              </span>
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs sm:text-sm text-yellow-800">
          {t('disclaimer')}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs sm:text-sm text-green-800">
          {t('privacyNotice')}
        </div>
      </div>
    </div>
  );
};
