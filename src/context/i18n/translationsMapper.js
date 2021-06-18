import GlobalTranslations from "../../i18nData";

const flattenTranslationObject = (translationObject) => {
  return Object.keys(translationObject).reduce(
    (acc, val) => ({
      ...acc,
      [val]: translationObject[val].value ? translationObject[val].value : translationObject[val],
    }),
    {}
  );
};

const mapTranslationsToFormioI18nObject = (translations) => {
  return Object.keys(translations).reduce(
    (formioI18nObject, languageCode) => ({
      ...formioI18nObject,
      [languageCode]: {
        ...flattenTranslationObject(translations[languageCode].translations || {}),
      },
    }),
    {
      ...flattenTranslationObject(GlobalTranslations),
    }
  );
};

const createTranslationsMapForEditor = (translationResource, translationsByLanguage, getTranslatedText) => (
  translationsObjects,
  translatedText
) => {
  let value = getTranslatedText(translatedText);
  let scope = translationResource.scope;
  if (
    translationsByLanguage[translationResource.language] &&
    translationsByLanguage[translationResource.language].translations
  ) {
    if (Object.keys(translationsByLanguage[translationResource.language].translations).indexOf(translatedText) !== -1) {
      value = translationsByLanguage[translationResource.language].translations[translatedText].value;
      scope = translationsByLanguage[translationResource.language].translations[translatedText].scope;
    }
  }
  return {
    ...translationsObjects,
    [translatedText]: {
      value: value,
      scope: scope,
    },
  };
};

const combineTranslationResources = (translationsByLanguage, translationResource) => {
  const accumulatedTranslationForLanguage = translationsByLanguage[translationResource.language] || {};
  const accumulatedTranslationsMapForLanguage = accumulatedTranslationForLanguage.translations || {};
  const newTranslationsMap = translationResource.i18n;
  const newOriginalTexts = Object.keys(newTranslationsMap);
  const getTranslatedText = (originalText) => newTranslationsMap[originalText];
  const id =
    accumulatedTranslationForLanguage.id ||
    (translationResource.scope === "local" && translationResource.id) ||
    undefined;
  return {
    ...translationsByLanguage,
    [translationResource.language]: {
      ...accumulatedTranslationForLanguage,
      id,
      translations: newOriginalTexts.reduce(
        createTranslationsMapForEditor(translationResource, translationsByLanguage, getTranslatedText),
        accumulatedTranslationsMapForLanguage
      ),
    },
  };
};

export { createTranslationsMapForEditor, combineTranslationResources, mapTranslationsToFormioI18nObject };
