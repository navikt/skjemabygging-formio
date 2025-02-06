import { FormsApiTranslation, ScopedTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

const removeDuplicatesAfterFirstMatch = ({ key }, index: number, all: FormsApiTranslation[]) =>
  !key || index === all.findIndex((translation) => translation.key === key);

const getInputHeightInRows = (value?: string, rowSizeInCharacters: number = 35): number => {
  return Math.floor((value ?? '').length / rowSizeInCharacters) + 1;
};

const mapFormsApiTranslationsToScopedTranslationMap = (
  translations: FormsApiTranslation[],
  language: TranslationLang,
): ScopedTranslationMap =>
  translations.reduce(
    (acc, { key, nb, ...translation }) => ({
      ...acc,
      [nb ?? key]: { value: translation[language], scope: 'global' },
    }),
    {},
  );

export { getInputHeightInRows, mapFormsApiTranslationsToScopedTranslationMap, removeDuplicatesAfterFirstMatch };
