import {
  FormioTranslationData,
  FormioTranslationMap,
  ScopedTranslationMap,
} from "@navikt/skjemadigitalisering-shared-domain";

export interface FormioTranslationDataWithId extends FormioTranslationData {
  id: string;
}

const createTranslationsMapForEditor =
  (
    translationResource: FormioTranslationDataWithId,
    translationsByLanguage: FormioTranslationMap,
    getTranslatedText: (arg: string) => string | undefined
  ) =>
  (translationsObjects: ScopedTranslationMap, translatedText: string): ScopedTranslationMap => {
    let value = getTranslatedText(translatedText);
    let scope = translationResource.scope;
    const translationObject = translationsByLanguage[translationResource.language]?.translations[translatedText];
    if (translationObject) {
      value = translationObject.value;
      scope = translationObject.scope;
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
  translationResource: FormioTranslationDataWithId
): FormioTranslationMap => {
  const accumulatedTranslationForLanguage = translationsByLanguage[translationResource.language];
  const accumulatedTranslationsMapForLanguage = accumulatedTranslationForLanguage?.translations || {};
  const newTranslationsMap = translationResource.i18n;
  const newOriginalTexts = Object.keys(newTranslationsMap);
  const getTranslatedText = (originalText) => newTranslationsMap[originalText];
  const id =
    accumulatedTranslationForLanguage?.id ||
    (translationResource.scope === "local" && translationResource.id) ||
    undefined;
  return {
    ...translationsByLanguage,
    [translationResource.language]: {
      ...(accumulatedTranslationForLanguage || {}),
      id,
      translations: newOriginalTexts.reduce(
        createTranslationsMapForEditor(translationResource, translationsByLanguage, getTranslatedText),
        accumulatedTranslationsMapForLanguage
      ),
    },
  };
};
export { combineTranslationResources };
