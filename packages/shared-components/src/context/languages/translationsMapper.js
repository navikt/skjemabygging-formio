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
    {}
  );
};

export { mapTranslationsToFormioI18nObject };
