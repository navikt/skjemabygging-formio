import { FormsApiGlobalTranslation, objectUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { removeDuplicatesAfterFirstMatch } from '../../../translations/utils/translationsUtils';

type GlobalTranslationTag = 'skjematekster' | 'grensesnitt' | 'statiske-tekster' | 'validering';

const TAG_TITLE: Record<GlobalTranslationTag, string> = {
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const generateAndPopulateTag = (
  tagName: GlobalTranslationTag,
  textObject: object,
  storedTranslationsMap: Record<string, FormsApiGlobalTranslation>,
) => {
  return objectUtils
    .flattenToArray(textObject, ([entryKey, value]) => {
      const key = tagName === 'validering' ? entryKey : value;
      const stored = storedTranslationsMap?.[key];
      if (stored && stored.tag === tagName) {
        return { nb: value, ...stored };
      }
      return { key, nb: value, tag: tagName };
    })
    .filter(removeDuplicatesAfterFirstMatch);
};

const generateAndPopulateTags = (
  translationsMap: Record<string, FormsApiGlobalTranslation>,
): Record<GlobalTranslationTag, FormsApiGlobalTranslation[]> => {
  const { common, grensesnitt, statiske, pdfStatiske, validering } = TEXTS;
  return {
    skjematekster: Object.values(translationsMap).filter((translation) => translation.tag === 'skjematekster'),
    grensesnitt: generateAndPopulateTag('grensesnitt', { ...common, ...grensesnitt }, translationsMap),
    'statiske-tekster': generateAndPopulateTag('statiske-tekster', { ...statiske, pdfStatiske }, translationsMap),
    validering: generateAndPopulateTag('validering', { validering }, translationsMap),
  };
};

const getTagsWithIncompleteTranslations = (
  translationsPerTag: Record<GlobalTranslationTag, FormsApiGlobalTranslation[]>,
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
