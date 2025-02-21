import { TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

const mapLanguageCodeToFormioFormat = (languageCode: TranslationLang) => {
  switch (languageCode) {
    case 'nn':
      return 'nn-NO';
    case 'en':
      return 'en';
    case 'nb':
    default:
      return 'nb-NO';
  }
};

export { mapLanguageCodeToFormioFormat };
