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

const mapTranslationsToFormioI18nObject = (translations, filterPredicate) => {
  const getTranslationsForLanguageCode = (languageCode) => {
    const translationsForLanguage = translations[languageCode].translations;
    return filterPredicate
      ? Object.fromEntries(Object.entries(translationsForLanguage).filter(([_, value]) => filterPredicate(value)))
      : translationsForLanguage;
  };

  return Object.keys(translations).reduce(
    (formioI18nObject, languageCode) => ({
      ...formioI18nObject,
      [languageCode]: {
        ...flattenTranslationObject(getTranslationsForLanguageCode(languageCode) || {}),
      },
    }),
    {
      ...flattenTranslationObject(GlobalTranslations),
    }
  );
};

export { mapTranslationsToFormioI18nObject };
