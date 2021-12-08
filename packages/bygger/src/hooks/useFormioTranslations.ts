import { languagesUtil, localizationUtils, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import {
  FormioTranslation,
  FormioTranslationMap,
  FormioTranslationPayload,
  I18nTranslationMap,
  Language,
  ScopedTranslationMap,
  TranslationScope,
  TranslationTag,
} from "../../types/translations";
import { languagesInNorwegian } from "../context/i18n";
import { combineTranslationResources } from "../context/i18n/translationsMapper";
import { getAllPredefinedOriginalTexts, tags } from "../translations/global/utils";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

type Country = { label: string; value: string };

export const useFormioTranslations = (serverURL, formio, userAlerter) => {
  const fetchTranslations = (url) => {
    return fetch(url, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Response: ", response);
        return response;
      });
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

  const loadGlobalTranslations = async (language?: Language): Promise<FormioTranslationMap> => {
    let filter = "";
    if (language) {
      filter += `&data.language=${language}`;
    }

    return fetchTranslations(`${formio.projectUrl}/language/submission?data.name=global${filter}&limit=1000`)
      .then(mapFormioKeysToLabelsForValidering)
      .then(languagesUtil.globalEntitiesToI18nGroupedByTag);
  };

  const publishGlobalTranslations = async (languageCode) => {
    const globalTranslationsForCurrentLanguage = await loadGlobalTranslations(languageCode);
    const i18n = globalTranslationsForCurrentLanguage[languageCode].reduce(
      (acc, cur) => ({ ...acc, ...cur.translations }),
      {}
    );
    const originalTexts = getAllPredefinedOriginalTexts(true);
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
    return fetch(`/api/published-resource/global-translations-${languageCode}`, {
      headers: {
        "content-type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.ok) {
        userAlerter.flashSuccessMessage(`Publisering av ${languagesInNorwegian[languageCode]} startet`);
      } else {
        userAlerter.setErrorMessage("Publisering feilet");
      }
    });
  };

  const loadTranslationsForForm = async (formPath: string): Promise<FormioTranslationPayload[]> => {
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
  };

  const loadCountryNames = async (locale: Language): Promise<Country[]> => {
    return fetch(`${serverURL}/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) =>
      response.json()
    );
  };

  const loadAndInsertCountryNames = async (translations: FormioTranslationMap): Promise<FormioTranslation | {}> => {
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
  };

  const loadTranslationsForEditPage = async (formPath: string): Promise<FormioTranslationMap> => {
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
  };

  const deleteTranslation = async (id) => {
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
  };

  const saveTranslation = (
    projectUrl: string,
    translationId,
    language: Language,
    i18n: I18nTranslationMap,
    name: string,
    scope: TranslationScope,
    form?: string,
    tag?: TranslationTag,
    formTitle?: string
  ) => {
    Formiojs.fetch(`${projectUrl}/language/submission${translationId ? `/${translationId}` : ""}`, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
        "content-type": "application/json",
      },
      method: translationId ? "PUT" : "POST",
      body: JSON.stringify({
        data: {
          form,
          name,
          language,
          scope,
          i18n,
          tag,
        },
      }),
    }).then((response) => {
      if (response.ok) {
        userAlerter.flashSuccessMessage(
          !formTitle ? `Lagret globale ${tag}` : `Lagret oversettelser for skjema: ${formTitle}`
        );
      } else {
        response.json().then((r) => {
          const errorMessage = "Lagret oversettelser feilet: ";
          userAlerter.setErrorMessage(errorMessage.concat(r?.message));
        });
      }
    });
  };

  const saveLocalTranslation = (
    projectUrl: string,
    translationId: string,
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
      saveTranslation(
        projectUrl,
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
  };
  const saveGlobalTranslation = (
    projectUrl: string,
    translationId: string,
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
      saveTranslation(projectUrl, translationId, languageCode, i18n, "global", "global", undefined, tag);
    } else {
      userAlerter.setErrorMessage("Skjemaet ble ikke lagret. Du har ikke gjort noen endringer.");
    }
  };

  return {
    loadGlobalTranslations,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  };
};
