type TranslationValue = { value?: string; scope?: string } | string;
type TranslationDictionary = Record<string, TranslationValue>;
type TranslationByLanguage = Record<string, { translations?: TranslationDictionary }>;
type FilterPredicate = (value: TranslationValue) => boolean;

const flattenTranslationObject = (translationObject: TranslationDictionary) => {
  return Object.keys(translationObject).reduce((acc, val) => {
    const translationValue = translationObject[val];
    return {
      ...acc,
      [val]:
        typeof translationValue === 'string'
          ? translationValue
          : translationValue.value
            ? translationValue.value
            : translationValue,
    };
  }, {});
};

const mapTranslationsToFormioI18nObject = (translations: TranslationByLanguage, filterPredicate?: FilterPredicate) => {
  const getTranslationsForLanguageCode = (languageCode: string) => {
    const translationsForLanguage = translations[languageCode].translations || {};
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
    {},
  );
};

export { mapTranslationsToFormioI18nObject };
