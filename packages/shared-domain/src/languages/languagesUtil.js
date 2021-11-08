export const globalEntitiesToI18nGroupedByTag = (entities) => {
  return entities.reduce((globalTranslations, translation) => {
    const {data, _id: id} = translation;
    const {i18n, scope, name, tag} = data;
    if (!globalTranslations[data.language]) {
      globalTranslations[data.language] = [];
    }
    globalTranslations[data.language].push({
      id,
      name,
      scope,
      tag,
      translations: Object.keys(i18n).reduce(
        (translationsObjects, translatedText) => ({
          ...translationsObjects,
          [translatedText]: {
            value: i18n[translatedText],
            scope,
          },
        }),
        {}
      ),
    });

    return globalTranslations;
  }, {});
};

const flattenTranslationObject = (translationsObject) => {
  return Object.keys(translationsObject).reduce((translations, key) => {
    return {
      ...translations,
      [key]: translationsObject[key].value
    }
  }, {});
};

export const flattenGlobalI18nGroupedByTag = (globalI18nGroupedByTag) => {
  return Object.keys(globalI18nGroupedByTag).reduce((i18n, languageCode) => ({
    ...i18n,
    [languageCode]: {
      ...globalI18nGroupedByTag[languageCode].reduce((i18nLanguage, translationsForTag) => {
        return {
          ...i18nLanguage,
          ...flattenTranslationObject(translationsForTag.translations),
        }
      }, {}),
    },
  }), {});
};

export default {
  globalEntitiesToI18nGroupedByTag,
  flattenGlobalI18nGroupedByTag,
};
