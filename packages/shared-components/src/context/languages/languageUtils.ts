import { I18nTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

const defaultLanguage: TranslationLang = 'nb';

const normalizeLanguageCode = (languageCode?: string): TranslationLang => {
  switch (languageCode?.toLowerCase()) {
    case 'nb-no':
    case 'no':
    case 'nb':
      return 'nb';
    case 'nn-no':
    case 'nn':
      return 'nn';
    case 'en':
      return 'en';
    default:
      return defaultLanguage;
  }
};

const normalizeTranslations = (translations: I18nTranslations): I18nTranslations =>
  Object.entries(translations).reduce<I18nTranslations>((normalizedTranslations, [languageCode, values]) => {
    const normalizedLanguageCode = normalizeLanguageCode(languageCode);
    return {
      ...normalizedTranslations,
      [normalizedLanguageCode]: {
        ...normalizedTranslations[normalizedLanguageCode],
        ...values,
      },
    };
  }, {});

const resolveLanguageCode = (languageCode: string | undefined, translations: I18nTranslations): TranslationLang => {
  const normalizedLanguageCode = normalizeLanguageCode(languageCode);
  return Object.hasOwn(translations, normalizedLanguageCode) ? normalizedLanguageCode : defaultLanguage;
};

export { defaultLanguage, normalizeLanguageCode, normalizeTranslations, resolveLanguageCode };
