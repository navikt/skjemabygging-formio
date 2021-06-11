import GlobalTranslations from "../../i18nData";

const mapTranslationsToFormioI18nObject = (translations) => {
  return Object.keys(translations).reduce(
    (formioI18nObject, languageCode) => ({
      ...formioI18nObject,
      [languageCode]: {
        ...Object.keys(translations[languageCode].translations || {}).reduce(
          (translationsForLanguageCode, originalText) => ({
            ...translationsForLanguageCode,
            [originalText]: translations[languageCode].translations[originalText].value,
          }),
          {}
        ),
      },
    }),
    {
      ...Object.keys(GlobalTranslations).reduce(
        (languages, languageCode) => ({
          ...languages,
          [languageCode]: {
            ...GlobalTranslations[languageCode],
          },
        }),
        {}
      ),
    }
  );
};

export { mapTranslationsToFormioI18nObject };
