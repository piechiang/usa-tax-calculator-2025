import { translations } from '../constants/translations';
import { languages } from '../constants/languages';

export const getTranslation = (path, language) => {
  const keys = path.split('.');
  let result = translations[language];
  
  for (let key of keys) {
    if (result && result[key]) {
      result = result[key];
    } else {
      return path;
    }
  }
  
  return result;
};

export const getLanguageInfo = (language) => {
  return languages.find(lang => lang.code === language) || languages[0];
};