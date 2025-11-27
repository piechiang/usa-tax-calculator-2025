export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' }, // 🇺🇸
  { code: 'zh', name: '\u4E2D\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3' }, // 中文, 🇨🇳
  { code: 'es', name: 'Espa\u00F1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' } // 🇪🇸
];
