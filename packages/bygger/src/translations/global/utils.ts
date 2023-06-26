import {
  GlobalTranslationMap,
  objectUtils,
  ScopedTranslationMap,
  TEXTS,
  TranslationResource,
} from "@navikt/skjemadigitalisering-shared-domain";
import { getInputType, sanitizeForCsv, withoutDuplicatedComponents } from "../utils";

const tags = {
  SKJEMATEKSTER: "skjematekster",
  GRENSESNITT: "grensesnitt",
  STATISKE_TEKSTER: "statiske-tekster",
  VALIDERING: "validering",
};

const flattenTextsForEditPanel = (texts: any): Array<any> => {
  return objectUtils
    .flattenToArray(texts, (entry, parentKey) => {
      const key = objectUtils.concatKeys(entry[0], parentKey);
      const text = entry[1];
      return { key, text, type: getInputType(text) };
    })
    .filter((component, index, currentComponents) => withoutDuplicatedComponents(component, index, currentComponents))
    .sort((a, b) => a.text.localeCompare(b.text));
};

const getAllPredefinedOriginalTexts = (skipUpperCasing = false): string[] => {
  const { grensesnitt, statiske, validering, common, pdfStatiske } = TEXTS;
  return objectUtils.flattenToArray({ ...grensesnitt, ...statiske, ...validering, ...common, pdfStatiske }, (entry) => {
    return skipUpperCasing ? entry[1] : entry[1].toUpperCase();
  });
};

const getTranslationKeysForAllPredefinedTexts = (): string[] => {
  const { grensesnitt, statiske, validering, common, pdfStatiske } = TEXTS;
  return [
    ...objectUtils.flattenToArray({ grensesnitt, statiske, common, pdfStatiske }, ([_key, value]) => value),
    ...objectUtils.flattenToArray(validering, ([key]) => key),
  ];
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
  const translationsResourceWithSelectedLanguageAndTag = globalTranslationsResourcesForSelectedLanguage?.find(
    isTranslationResourceForSelectedTag(selectedTag)
  ) || { translations: {} };
  if (selectedTag === "skjematekster") {
    Object.keys(allGlobalTranslations)
      .filter((language) => language !== languageCode)
      .map((language) => allGlobalTranslations[language])
      .map((translationResourcesWithDifferentTags) =>
        translationResourcesWithDifferentTags.find(isTranslationResourceForSelectedTag(selectedTag))
      )
      .map((translationResource) => (translationResource ? translationResource.translations : {}))
      .reduce(
        (missingOriginalTexts, translations): string[] => [
          ...missingOriginalTexts,
          ...Object.keys(translations).filter(
            (key) =>
              translationsResourceWithSelectedLanguageAndTag.translations[key] === undefined &&
              missingOriginalTexts.indexOf(key) === -1
          ),
        ],
        []
      )
      .forEach(
        (missingKey) =>
          (translationsResourceWithSelectedLanguageAndTag.translations[missingKey] = {
            scope: "global",
            value: undefined,
          })
      );
  }
  return translationsResourceWithSelectedLanguageAndTag;
};

const transformGlobalTranslationsToCsvData = (
  allGlobalTranslations: GlobalTranslationMap,
  allPredefinedOriginalTexts,
  languageCode: string
) => {
  const translations: ScopedTranslationMap = Object.values(tags)
    .map((tag) => getGlobalTranslationsWithLanguageAndTag(allGlobalTranslations, languageCode, tag))
    .reduce((previous, current) => ({ ...previous, ...current.translations }), {} as ScopedTranslationMap);
  allPredefinedOriginalTexts.forEach((predefinedText) => {
    if (!translations[predefinedText]) {
      translations[predefinedText] = { value: undefined, scope: "global" };
    }
  });

  const data = Object.keys(translations).map((text) => ({
    text: sanitizeForCsv(text),
    [languageCode]: sanitizeForCsv(translations[text].value!),
  }));
  const headers = [
    { label: "Globale tekster", key: "text" },
    { label: languageCode?.toUpperCase(), key: languageCode },
  ];
  return { data, headers };
};

export {
  tags,
  flattenTextsForEditPanel,
  getGlobalTranslationsWithLanguageAndTag,
  getAllPredefinedOriginalTexts,
  getTranslationKeysForAllPredefinedTexts,
  getCurrentOriginalTextList,
  transformGlobalTranslationsToCsvData,
};
