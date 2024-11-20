import { FormsApiGlobalTranslation, objectUtils, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';

const generateAndPopulateTag = (
  tagName: TranslationTag,
  textObject,
  storedTranslationsMap: Record<string, FormsApiGlobalTranslation>,
) => {
  return objectUtils.flattenToArray(textObject, ([entryKey, value], parentKey) => {
    const key = objectUtils.concatKeys(entryKey, parentKey);
    const stored = storedTranslationsMap?.[key];
    if (stored && stored.tag === tagName) {
      return { nb: value, ...stored };
    }
    return { key, nb: value, tag: tagName };
  });
};

const getInputHeightInRows = (value?: string, rowSizeInCharacters: number = 35): number => {
  return Math.floor((value ?? '').length / rowSizeInCharacters) + 1;
};

export { generateAndPopulateTag, getInputHeightInRows };
