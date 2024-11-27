import {
  FormsApiGlobalTranslation,
  objectUtils,
  TEXTS,
  TranslationTag,
} from '@navikt/skjemadigitalisering-shared-domain';

const generateAndPopulateTag = (
  tagName: TranslationTag,
  textObject,
  storedTranslationsMap: Record<string, FormsApiGlobalTranslation>,
) => {
  return objectUtils
    .flattenToArray(textObject, ([entryKey, value], parentKey) => {
      const key = tagName === 'validering' ? objectUtils.concatKeys(entryKey, parentKey) : value;
      const stored = storedTranslationsMap?.[key];
      if (stored && stored.tag === tagName) {
        return { nb: value, ...stored };
      }
      return { key, nb: value, tag: tagName };
    })
    .filter(removeDuplicatesAfterFirstMatch);
};

const generateAndPopulateTags = (translationsMap: Record<string, FormsApiGlobalTranslation>) => {
  const { common, grensesnitt, statiske, pdfStatiske, validering } = TEXTS;
  return {
    skjematekster: Object.values(translationsMap).filter((translation) => translation.tag === 'skjematekster'),
    grensesnitt: generateAndPopulateTag('grensesnitt', { ...common, ...grensesnitt }, translationsMap),
    'statiske-tekster': generateAndPopulateTag('statiske-tekster', { ...statiske, pdfStatiske }, translationsMap),
    validering: generateAndPopulateTag('validering', { validering }, translationsMap),
  };
};

const removeDuplicatesAfterFirstMatch = ({ key }, index, all) =>
  !key || index === all.findIndex((translation) => translation.key === key);

const getInputHeightInRows = (value?: string, rowSizeInCharacters: number = 35): number => {
  return Math.floor((value ?? '').length / rowSizeInCharacters) + 1;
};

export { generateAndPopulateTags, getInputHeightInRows };
