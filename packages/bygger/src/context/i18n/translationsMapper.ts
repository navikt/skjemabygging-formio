import {
  FormioTranslation,
  FormioTranslationData,
  FormioTranslationMap,
  ScopedTranslationMap,
} from "../../../types/translations";

export interface TranslationResource extends FormioTranslationData {
  id: string;
}

const createTranslationsMapForEditor =
  (
    translationResource: TranslationResource,
    translationsByLanguage: FormioTranslationMap,
    getTranslatedText: (arg: string) => string
  ) =>
  (translationsObjects: ScopedTranslationMap, translatedText: string): ScopedTranslationMap => {
    let value = getTranslatedText(translatedText);
    let scope = translationResource.scope;
    if (
      translationsByLanguage[translationResource.language] &&
      translationsByLanguage[translationResource.language].translations
    ) {
      if (
        Object.keys(translationsByLanguage[translationResource.language].translations).indexOf(translatedText) !== -1
      ) {
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

const combineTranslationResources = (
  translationsByLanguage: FormioTranslationMap,
  translationResource: TranslationResource
): FormioTranslationMap => {
  const accumulatedTranslationForLanguage: FormioTranslation =
    translationsByLanguage[translationResource.language] || {};
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
export { combineTranslationResources };
