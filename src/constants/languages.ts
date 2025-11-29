export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' }, // 🇺🇸
  { code: 'zh', name: '\u7B80\u4F53\u4E2D\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3' }, // 简体中文, 🇨🇳
  { code: 'zh-TW', name: '\u7E41\u9AD4\u4E2D\u6587', flag: '\uD83C\uDDF9\uD83C\uDDFC' }, // 繁體中文, 🇹🇼
  { code: 'es', name: 'Espa\u00F1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' } // 🇪🇸
];
