import { FormsApiTranslation, I18nTranslationMap, I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { getCountries } from '../countries/countries';

type FormioFormatLang = 'nb-NO' | 'nn-NO' | 'en';

const formioFormatToStandard = (lang: string): string => lang.substring(0, 2);

const populateCountries = (translations: I18nTranslations): I18nTranslations => {
  const nbCountryNames = Object.fromEntries(getCountries('nb').map(({ label, value }) => [value, label]));
  return Object.fromEntries(
    Object.entries(translations).map(([language, values]) => [
      language,
      {
        ...values,
        ...Object.fromEntries(
          getCountries(language as FormioFormatLang).map(({ label, value }) => [nbCountryNames[value], label]),
        ),
      },
    ]),
  );
};

const mapFormsApiTranslationsToI18n = (
  translations: FormsApiTranslation[],
  initial: I18nTranslations = { 'nb-NO': {}, 'nn-NO': {}, en: {} },
  includeCountryNames: boolean = false,
): I18nTranslations => {
  const i18nTranslations = translations.reduce<I18nTranslations>((acc, translation) => {
    return Object.fromEntries(
      Object.entries(acc).map(([language, values]): [string, I18nTranslationMap] => {
        const formsApiValueForLanguage = translation[formioFormatToStandard(language)];
        if (formsApiValueForLanguage) {
          return [language, { ...values, [translation.key]: formsApiValueForLanguage }];
        } else {
          return [language, values];
        }
      }),
    );
  }, initial);
  if (includeCountryNames) {
    return populateCountries(i18nTranslations);
  }
  return i18nTranslations;
};

export { mapFormsApiTranslationsToI18n };
