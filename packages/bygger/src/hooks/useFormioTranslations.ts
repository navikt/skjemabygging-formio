import {
  FormioTranslation,
  FormioTranslationMap,
  FormioTranslationPayload,
  I18nTranslationMap,
  Language,
  languagesUtil,
  localizationUtils,
  ScopedTranslationMap,
  TEXTS,
  TranslationScope,
  TranslationTag,
} from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import { useCallback } from "react";
import { languagesInNorwegian } from "../context/i18n";
import { combineTranslationResources } from "../context/i18n/translationsMapper";
import { getTranslationKeysForAllPredefinedTexts, tags } from "../translations/global/utils";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

type Country = { label: string; value: string };

const fetchTranslations = (url) => {
  return fetch(url, {
    headers: {
      "x-jwt-token": Formiojs.getToken(),
    },
  })
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => (process.env.NODE_ENV !== "production" ? [] : err));
};

const mapFormioKeyToLabel = (i18n: I18nTranslationMap) => {
  return Object.keys(i18n).reduce((translationEntries, translatedText) => {
    let originalText: string = translatedText;
    Object.entries(TEXTS.validering as I18nTranslationMap).forEach(([key, value]) => {
      if (translatedText === key) {
        originalText = value;
      }
    });

    return {
      ...translationEntries,
      [originalText]: i18n[translatedText],
    };
  }, {});
};

const mapFormioKeysToLabelsForValidering = (translationPayload) =>
  translationPayload.map(({ data, ...translationObject }) => ({
    ...translationObject,
    data: {
      ...data,
      i18n: data.tag === tags.VALIDERING ? mapFormioKeyToLabel(data.i18n) : data.i18n,
    },
  }));

export const useFormioTranslations = (serverURL, formio, userAlerter) => {
  const loadGlobalTranslations = useCallback(
    async (language?: Language, mapper = (response) => response): Promise<FormioTranslationMap> => {
      let filter = "";
      if (language) {
        filter += `&data.language=${language}`;
      }

      return fetchTranslations(`${formio.projectUrl}/language/submission?data.name=global${filter}&limit=1000`)
        .then(mapper)
        .then(languagesUtil.globalEntitiesToI18nGroupedByTag);
    },
    [formio.projectUrl]
  );

  const loadGlobalTranslationsForTranslationsPage = useCallback(
    async (language?: Language): Promise<FormioTranslationMap> =>
      loadGlobalTranslations(language, mapFormioKeysToLabelsForValidering),
    [loadGlobalTranslations]
  );

  const publishGlobalTranslations = useCallback(
    async (languageCode) => {
      const globalTranslationsForCurrentLanguage = await loadGlobalTranslations(languageCode);
      const i18n = globalTranslationsForCurrentLanguage[languageCode].reduce(
        (acc, cur) => ({ ...acc, ...cur.translations }),
        {}
      );
      const originalTexts = getTranslationKeysForAllPredefinedTexts();
      const originalTextsWithNoTranslation = originalTexts.filter((text) => !i18n[text]);
      if (originalTextsWithNoTranslation.length > 0) {
        userAlerter.setErrorMessage(
          `Det mangler oversettelser for følgende tekster: ${originalTextsWithNoTranslation.join(", ")}`
        );
        return Promise.resolve();
      }
      const payload = {
        token: Formiojs.getToken(),
        resource: globalTranslationsForCurrentLanguage,
      };

      const response = await fetch(`/api/published-resource/global-translations-${languageCode}`, {
        headers: {
          "content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const { changed } = await response.json();
        if (changed) {
          userAlerter.flashSuccessMessage(`Publisering av ${languagesInNorwegian[languageCode]} startet`);
        } else {
          userAlerter.setWarningMessage(
            "Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)"
          );
        }
      } else {
        userAlerter.setErrorMessage("Publisering feilet");
      }
    },
    [loadGlobalTranslations, userAlerter]
  );

  const loadTranslationsForForm = useCallback(
    async (formPath: string): Promise<FormioTranslationPayload[]> => {
      return fetchTranslations(
        `${formio.projectUrl}/language/submission?data.name__regex=/^global(.${formPath})*$/gi&limit=1000`
      ).then((translations: FormioTranslationPayload[]) => {
        const languagesWithLocalTranslation = translations.reduce((localTranslations: Language[], translation) => {
          if (localTranslations.indexOf(translation.data.language) === -1) {
            return [...localTranslations, translation.data.language];
          } else {
            return localTranslations;
          }
        }, []);
        return translations.filter(
          (translation) => languagesWithLocalTranslation.indexOf(translation.data.language) !== -1
        );
      });
    },
    [formio.projectUrl]
  );

  const loadCountryNames = useCallback(
    async (locale: Language): Promise<Country[]> => {
      return fetch(`${serverURL}/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) =>
        response.json()
      );
    },
    [serverURL]
  );

  const loadAndInsertCountryNames = useCallback(
    async (translations: FormioTranslationMap): Promise<FormioTranslation | {}> => {
      const localesInTranslations = Object.keys(translations).filter((lang): lang is Language => !!(lang as Language));
      localesInTranslations.unshift("nb-NO");
      return await Promise.all(localesInTranslations.map(loadCountryNames)).then((loadedCountryNames) => {
        const norwegianCountryNames = loadedCountryNames[0];
        return localesInTranslations.reduce(
          (accumulated, locale, index) => ({
            ...accumulated,
            [locale]: {
              ...translations[locale],
              translations: {
                ...translations[locale]?.translations,
                ...zipCountryNames(norwegianCountryNames, loadedCountryNames[index], (countryName) => ({
                  value: countryName.label,
                  scope: "component-countryName",
                })),
              },
            },
          }),
          {}
        );
      });
    },
    [loadCountryNames]
  );

  const loadTranslationsForEditPage = useCallback(
    async (formPath: string): Promise<FormioTranslationMap> => {
      return loadTranslationsForForm(formPath)
        .then((translations) =>
          translations
            .map((translation) => ({
              ...translation.data,
              id: translation._id,
            }))
            .reduce(combineTranslationResources, {})
        )
        .then(loadAndInsertCountryNames);
    },
    [loadAndInsertCountryNames, loadTranslationsForForm]
  );

  const deleteTranslation = useCallback(
    async (id) => {
      return Formiojs.fetch(`${formio.projectUrl}/language/submission/${id}`, {
        headers: {
          "x-jwt-token": Formiojs.getToken(),
        },
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          userAlerter.flashSuccessMessage("Slettet oversettelse " + id);
        }
        return response;
      });
    },
    [formio.projectUrl, userAlerter]
  );

  const createTranslationSubmission = useCallback(
    async (data: { language: Language; name: string; scope: TranslationScope; form?: string; tag?: TranslationTag }) =>
      Formiojs.fetch(`${formio.projectUrl}/language/submission`, {
        headers: {
          "x-jwt-token": Formiojs.getToken(),
          "content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          data,
        }),
      }),
    [formio.projectUrl]
  );

  const updateTranslationSubmission = useCallback(
    async (
      translationId: string,
      data: {
        language: Language;
        i18n: I18nTranslationMap;
        name: string;
        scope: TranslationScope;
        form?: string;
        tag?: TranslationTag;
      }
    ) =>
      Formiojs.fetch(`${formio.projectUrl}/language/submission/${translationId}`, {
        headers: {
          "x-jwt-token": Formiojs.getToken(),
          "content-type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          data,
        }),
      }),
    [formio.projectUrl]
  );

  const saveTranslation = useCallback(
    async (
      translationId,
      language: Language,
      i18n: I18nTranslationMap,
      name: string,
      scope: TranslationScope,
      form?: string,
      tag?: TranslationTag,
      formTitle?: string
    ) => {
      let newOrExistingTranslationId = translationId;
      if (!newOrExistingTranslationId) {
        const response = await createTranslationSubmission({ language, name, scope, form, tag });
        if (response.ok) {
          const submission = await response.json();
          newOrExistingTranslationId = submission._id;
        } else {
          const error = await response.json();
          const errorMessage = "Oversettelsen kunne ikke opprettes: ".concat(error?.message);
          userAlerter.setErrorMessage(errorMessage);
          return error;
        }
      }
      if (newOrExistingTranslationId) {
        const response = await updateTranslationSubmission(newOrExistingTranslationId, {
          language,
          i18n,
          name,
          scope,
          form,
          tag,
        });
        if (response.ok) {
          userAlerter.flashSuccessMessage(
            !formTitle
              ? `Lagret globale ${tag}`
              : `Lagret oversettelser for skjema "${formTitle}" på ${languagesInNorwegian[language]}`
          );
          return response.json();
        } else {
          const error = await response.json();
          const errorMessage = "Lagret oversettelser feilet: ".concat(error?.message);
          userAlerter.setErrorMessage(errorMessage);
          return error;
        }
      }
    },
    [createTranslationSubmission, updateTranslationSubmission, userAlerter]
  );

  const saveLocalTranslation = useCallback(
    async (
      translationId: string | undefined,
      languageCode: Language,
      translations: ScopedTranslationMap,
      formPath: string,
      formTitle: string
    ) => {
      if (translations) {
        const i18n: I18nTranslationMap = Object.keys(translations).reduce((translationsToSave, translatedText) => {
          if (translations[translatedText].scope === "local" && translations[translatedText].value) {
            return {
              ...translationsToSave,
              [translatedText]: translations[translatedText].value,
            };
          } else {
            return translationsToSave;
          }
        }, {});
        return saveTranslation(
          translationId,
          languageCode,
          i18n,
          `global.${formPath}`,
          "local",
          formPath,
          undefined,
          formTitle
        );
      } else {
        userAlerter.setErrorMessage("Skjemaet ble ikke lagret. Du har ikke gjort noen endringer.");
      }
    },
    [saveTranslation, userAlerter]
  );

  const saveGlobalTranslation = useCallback(
    async (
      translationId: string | undefined,
      languageCode: Language,
      translations: ScopedTranslationMap,
      tag: TranslationTag
    ) => {
      if (Object.keys(translations).length !== 0 || tag === "skjematekster") {
        const i18n: I18nTranslationMap = Object.keys(translations).reduce((translationsToSave, translatedText) => {
          if (translations[translatedText].value) {
            return {
              ...translationsToSave,
              [translatedText]: translations[translatedText].value,
            };
          } else {
            return translationsToSave;
          }
        }, {});
        return saveTranslation(translationId, languageCode, i18n, "global", "global", undefined, tag);
      } else {
        userAlerter.setErrorMessage("Skjemaet ble ikke lagret. Du har ikke gjort noen endringer.");
      }
    },
    [saveTranslation, userAlerter]
  );

  return {
    loadGlobalTranslations,
    loadGlobalTranslationsForTranslationsPage,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  };
};
