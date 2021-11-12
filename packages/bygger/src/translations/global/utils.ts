import { getInputType, removeDuplicatedComponents } from "../utils";
import { objectUtils, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { TranslationResource } from "../../../types/translations";

const tags = {
  SKJEMATEKSTER: "skjematekster",
  GRENSESNITT: "grensesnitt",
  STATISKE_TEKSTER: "statiske-tekster",
  VALIDERING: "validering",
};

const flattenTextsForEditPanel = (texts: any): Array<any> => {
  return removeDuplicatedComponents(
    objectUtils.flattenToArray(texts, (entry, parentKey) => {
      const key = objectUtils.concatKeys(entry[0], parentKey);
      const text = entry[1];
      return { key, text, type: getInputType(text) };
    })
  );
};

const getAllPredefinedOriginalTexts = (skipUpperCasing = false): string[] => {
  const { grensesnitt, statiske, validering, common, pdfStatiske } = TEXTS;
  return objectUtils.flattenToArray({ ...grensesnitt, ...statiske, ...validering, ...common, pdfStatiske }, (entry) => {
    return skipUpperCasing ? entry[1] : entry[1].toUpperCase();
  });
};

const getCurrentOriginalTextList = (currentTranslation: Array<any>): string[] => {
  return currentTranslation.reduce((originalTextList, translations) => {
    const { originalText } = translations;
    if (originalText !== "") return [...originalTextList, originalText.toUpperCase()];
    else return originalTextList;
  }, []);
};

const isTranslationResourceForSelectedTag =
  (selectedTag: string) =>
  (translationResource): boolean =>
    translationResource.tag === selectedTag;

const getGlobalTranslationsWithLanguageAndTag = (
  allGlobalTranslations: object,
  languageCode: string,
  selectedTag: string
): TranslationResource => {
  const globalTranslationsResourcesForSelectedLanguage = allGlobalTranslations[languageCode];
  const translationsResourceWithSelectedLanguageAndTag = globalTranslationsResourcesForSelectedLanguage.find(
    isTranslationResourceForSelectedTag(selectedTag)
  );
  const missingOriginalTexts = Object.keys(allGlobalTranslations)
    .filter((language) => language !== languageCode)
    .map((language) => allGlobalTranslations[language])
    .map((translationResourcesWithDifferentTags) =>
      translationResourcesWithDifferentTags.find(isTranslationResourceForSelectedTag(selectedTag))
    )
    .map((translationResource) => (translationResource ? translationResource.translations : {}))
    .reduce((missingOriginalTexts, translationsResource): string[] => {
      if (translationsResource) {
        return [
          ...missingOriginalTexts,
          ...Object.keys(translationsResource).filter(
            (key) =>
              translationsResourceWithSelectedLanguageAndTag.translations[key] === undefined &&
              missingOriginalTexts.indexOf(key) === -1
          ),
        ];
      } else {
        return missingOriginalTexts;
      }
    }, []);
  missingOriginalTexts.forEach(
    (missingKey) =>
      (translationsResourceWithSelectedLanguageAndTag.translations[missingKey] = {
        scope: "global",
        value: undefined,
      })
  );
  return translationsResourceWithSelectedLanguageAndTag;
};

export {
  tags,
  flattenTextsForEditPanel,
  getGlobalTranslationsWithLanguageAndTag,
  getAllPredefinedOriginalTexts,
  getCurrentOriginalTextList,
};
