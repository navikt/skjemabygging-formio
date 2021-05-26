import FormioDefaultTranslations from "formiojs/i18n";
import GlobalTranslations from "../../i18nData";

const mapTranslationsToFormioI18nObject = (translations) => {
  return Object.keys(translations).reduce(
    (formioI18nObject, languageCode) => ({
      ...formioI18nObject,
      resources: {
        ...formioI18nObject.resources,
        [languageCode]: {
          ...(formioI18nObject.resources[languageCode] || {}),
          translation: {
            ...((formioI18nObject.resources[languageCode] && formioI18nObject.resources[languageCode].translation) ||
              {}),
            ...Object.keys(translations[languageCode].translations || {}).reduce(
              (translationsForLanguageCode, originalText) => ({
                ...translationsForLanguageCode,
                [originalText]: translations[languageCode].translations[originalText].value,
              }),
              {}
            ),
          },
        },
      },
    }),
    {
      ...FormioDefaultTranslations,
      resources: {
        ...FormioDefaultTranslations.resources,
        ...Object.keys(GlobalTranslations).reduce(
          (languages, languageCode) => ({
            ...languages,
            [languageCode]: {
              ...((FormioDefaultTranslations.resources && FormioDefaultTranslations.resources[languageCode]) || {}),
              translation: {
                ...((FormioDefaultTranslations.resources &&
                  FormioDefaultTranslations.resources[languageCode] &&
                  FormioDefaultTranslations.resources[languageCode].translation) ||
                  {}),
                ...GlobalTranslations[languageCode],
              },
            },
          }),
          {}
        ),
      },
    }
  );
};

export { mapTranslationsToFormioI18nObject };
