import {
  externalStorageTexts,
  FormsApiTranslation,
  objectUtils,
  TEXTS,
  Tkey,
} from '@navikt/skjemadigitalisering-shared-domain';
import { removeDuplicatesAfterFirstMatch } from '../../../translations/utils/translationsUtils';

type GlobalTranslationTag = 'introPage' | 'skjematekster' | 'grensesnitt' | 'statiske-tekster' | 'validering';

const TAG_TITLE: Record<GlobalTranslationTag, string> = {
  introPage: 'Introside',
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const generateTranslation = (
  tagName: GlobalTranslationTag,
  stored: FormsApiTranslation,
  init: FormsApiTranslation,
): FormsApiTranslation => {
  const { key, nb, nn, en } = init;
  if (stored && stored.tag === tagName) {
    return { ...init, ...stored };
  }
  return { key, nb, nn, en, tag: tagName };
};

const populateTagFromInitValues = (
  tagName: GlobalTranslationTag,
  keys: readonly Tkey[],
  initValues: FormsApiTranslation[],
  storedTranslationsMap: Record<string, FormsApiTranslation>,
): FormsApiTranslation[] => {
  return keys.map((key) => {
    const stored = storedTranslationsMap?.[key];
    const init = initValues.find((translation) => translation.key === key);
    return generateTranslation(tagName, stored, { ...init, key });
  });
};

const populateTagFromTextObject = (
  tagName: GlobalTranslationTag,
  textObject: object,
  storedTranslationsMap: Record<string, FormsApiTranslation>,
) => {
  return objectUtils
    .flattenToArray(textObject, ([entryKey, value]) => {
      const key = tagName === 'validering' ? entryKey : value;
      const stored = storedTranslationsMap?.[key];
      if (!stored || stored.tag === tagName) {
        // Do not populate if there already is a stored translation with a different tag
        return generateTranslation(tagName, stored, { key, nb: value });
      }
      return [];
    })
    .filter(removeDuplicatesAfterFirstMatch);
};

const generateAndPopulateTags = (
  translationsMap: Record<string, FormsApiTranslation>,
): Record<GlobalTranslationTag, FormsApiTranslation[]> => {
  const { common, grensesnitt, statiske, pdfStatiske, validering } = TEXTS;
  const { introPage: introPageInit } = externalStorageTexts.initValues;
  const { introPage: introPageKeys } = externalStorageTexts.keys;
  return {
    introPage: populateTagFromInitValues('introPage', introPageKeys, introPageInit, translationsMap),
    skjematekster: Object.values(translationsMap).filter((translation) => translation.tag === 'skjematekster'),
    grensesnitt: populateTagFromTextObject('grensesnitt', { ...common, ...grensesnitt }, translationsMap),
    'statiske-tekster': populateTagFromTextObject('statiske-tekster', { ...statiske, pdfStatiske }, translationsMap),
    validering: populateTagFromTextObject('validering', { validering }, translationsMap),
  };
};

const getTagsWithIncompleteTranslations = (
  translationsPerTag: Record<GlobalTranslationTag, FormsApiTranslation[]>,
): GlobalTranslationTag[] => {
  return Object.keys(translationsPerTag).flatMap((tag) => {
    if (translationsPerTag[tag].some((translation) => !translation.nn || !translation.en)) {
      return tag as GlobalTranslationTag;
    }
    return [];
  });
};

const getMissingGlobalTranslationsErrorMessage = (tagsMissingTranslations: GlobalTranslationTag[]) => {
  const titles = tagsMissingTranslations.map((tag) => `"${TAG_TITLE[tag]}"`);
  const lastTitle = titles.pop();
  return `Kan ikke publisere. Det mangler oversettelser for ${titles.join(', ')}${titles.length > 0 ? ' og' : ''} ${lastTitle}`;
};

export {
  generateAndPopulateTags,
  getMissingGlobalTranslationsErrorMessage,
  getTagsWithIncompleteTranslations,
  TAG_TITLE,
};
export type { GlobalTranslationTag };
