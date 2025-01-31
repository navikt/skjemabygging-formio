import { FormsApiTranslation, I18nTranslationMap, I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { getCountries } from '../countries/countries';
import i18nData from './i18nData';

type FormioFormatLang = 'nb-NO' | 'nn-NO' | 'en';

const formioFormatToStandard = (lang: string): string => lang.substring(0, 2);

const populateLanguages = (translations: I18nTranslations): I18nTranslations => {
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
  includeCountryNames: boolean = false,
  initial: I18nTranslations = i18nData as I18nTranslations,
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
    return populateLanguages(i18nTranslations);
  }
  return i18nTranslations;
};

export { mapFormsApiTranslationsToI18n };
