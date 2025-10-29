// src/i18n.ts
import es from './locales/es.json';
import en from './locales/en.json';

const LANGUAGES = {
  es,
  en,
};

export const useTranslations = (lang: keyof typeof LANGUAGES) => {
  return function t(key: string) {
    const keys = key.split('.');
    let value: any = LANGUAGES[lang];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  }
}
