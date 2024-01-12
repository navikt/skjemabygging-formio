import { NavFormioJs, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import {
  FormioTranslationMap,
  FormioTranslationPayload,
  I18nTranslationMap,
  Language,
  ScopedTranslationMap,
  TEXTS,
  TranslationScope,
  TranslationTag,
  languagesUtil,
  localizationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { languagesInNorwegian } from '../context/i18n';
import { combineTranslationResources } from '../context/i18n/translationsMapper';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import { getTranslationKeysForAllPredefinedTexts, tags } from '../translations/global/utils';

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

type Country = { label: string; value: string };

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

export const useFormioTranslations = (serverURL, formio) => {
  const feedbackEmit = useFeedbackEmit();
  const { logger, http } = useAppConfig();

  const loadGlobalTranslations = useCallback(
    async (language?: Language, mapper = (response) => response): Promise<FormioTranslationMap> => {
      let filter = '';
      if (language) {
        filter += `&data.language=${language}`;
      }

      const url = `${formio.projectUrl}/language/submission?data.name=global${filter}&limit=1000`;
      try {
        const responseBody = await http!.get(url, { 'x-jwt-token': NavFormioJs.Formio.getToken() });
        return languagesUtil.globalEntitiesToI18nGroupedByTag(mapper(responseBody));
      } catch (err) {
        const userMessage = 'Henting av globale oversettelser feilet. Last siden på nytt.';
        if (err instanceof http!.HttpError) {
          logger?.error('Failed to fetch global translations', {
            reason: err.message,
            httpStatus: err.status,
            userMessage,
            url,
          });
        }
        feedbackEmit.error(userMessage);
        throw err;
      }
    },
    [formio.projectUrl],
  );

  const loadGlobalTranslationsForTranslationsPage = useCallback(
    async (language?: Language): Promise<FormioTranslationMap> =>
      loadGlobalTranslations(language, mapFormioKeysToLabelsForValidering),
    [loadGlobalTranslations],
  );

  const publishGlobalTranslations = useCallback(
    async (languageCode) => {
      const globalTranslationsForCurrentLanguage = await loadGlobalTranslations(languageCode);
      const i18n = globalTranslationsForCurrentLanguage[languageCode].reduce(
        (acc, cur) => ({ ...acc, ...cur.translations }),
        {},
      );
      const originalTexts = getTranslationKeysForAllPredefinedTexts();
      const originalTextsWithNoTranslation = originalTexts.filter((text) => !i18n[text]);
      if (originalTextsWithNoTranslation.length > 0) {
        feedbackEmit.error(
          `Det mangler oversettelser for følgende tekster: ${originalTextsWithNoTranslation.join(', ')}`,
        );
        return Promise.resolve();
      }
      try {
        const responseBody = await http!.put<{ changed: boolean }>(
          `/api/published-resource/global-translations-${languageCode}`,
          { resource: globalTranslationsForCurrentLanguage },
          {
            'Bygger-Formio-Token': NavFormioJs.Formio.getToken(),
          },
        );
        if (responseBody.changed) {
          feedbackEmit.success(`Publisering av ${languagesInNorwegian[languageCode]} startet`);
        } else {
          feedbackEmit.warning(
            'Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)',
          );
        }
      } catch (error) {
        feedbackEmit.error('Publisering feilet');
      }
    },
    [loadGlobalTranslations, feedbackEmit],
  );

  const loadTranslationsForForm = useCallback(
    async (formPath: string): Promise<FormioTranslationPayload[]> => {
      const url = `${formio.projectUrl}/language/submission?data.name__regex=/^global(.${formPath})*$/gi&limit=1000`;
      try {
        const translations = (await http!.get<FormioTranslationPayload[]>(url, {
          'x-jwt-token': NavFormioJs.Formio.getToken(),
        })) as FormioTranslationPayload[];
        const languagesWithLocalTranslation = translations.reduce((localTranslations: Language[], translation) => {
          if (localTranslations.indexOf(translation.data.language) === -1) {
            return [...localTranslations, translation.data.language];
          } else {
            return localTranslations;
          }
        }, []);
        return translations.filter(
          (translation) => languagesWithLocalTranslation.indexOf(translation.data.language) !== -1,
        );
      } catch (err: any) {
        const userMessage = 'Henting av oversettelser for dette skjemaet feilet. Last siden på nytt.';
        if (err instanceof http!.HttpError) {
          logger?.error(`Failed to fetch form translations`, {
            reason: err.message,
            httpStatus: err.status,
            userMessage,
            formPath,
            url,
          });
        } else {
          logger?.error('Failed to process fetched form translations', {
            reason: err.message || err,
            formPath,
            userMessage,
          });
        }
        feedbackEmit.error(userMessage);
        throw err;
      }
    },
    [formio.projectUrl],
  );

  const loadCountryNames = useCallback(
    async (locale: Language): Promise<Country[]> => {
      return http!.get(`${serverURL}/api/countries?lang=${getLanguageCodeAsIso639_1(locale)}`);
    },
    [http, serverURL],
  );

  const loadAndInsertCountryNames = useCallback(
    async (translations: FormioTranslationMap): Promise<FormioTranslationMap | {}> => {
      const localesInTranslations = Object.keys(translations).filter((lang): lang is Language => !!(lang as Language));
      localesInTranslations.unshift('nb-NO');
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
                  scope: 'component-countryName',
                })),
              },
            },
          }),
          {},
        );
      });
    },
    [loadCountryNames],
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
            .reduce(combineTranslationResources, {}),
        )
        .then(loadAndInsertCountryNames);
    },
    [loadAndInsertCountryNames, loadTranslationsForForm],
  );

  const deleteTranslation = useCallback(
    async (id: string) => {
      const url = `${formio.projectUrl}/language/submission/${id}`;
      try {
        await http!.delete(
          url,
          {},
          {
            'x-jwt-token': NavFormioJs.Formio.getToken(),
          },
        );
        feedbackEmit.success('Slettet oversettelse ' + id);
        return { deleted: true };
      } catch (err: any) {
        if (err instanceof http!.HttpError) {
          logger?.error(`Failed to fetch form translations`, {
            reason: err.message,
            httpStatus: err.status,
            url,
          });
        }
        return { deleted: false, errorMessage: err.message };
      }
    },
    [formio.projectUrl, feedbackEmit],
  );

  const createTranslationSubmission = useCallback(
    async (data: { language: Language; name: string; scope: TranslationScope; form?: string; tag?: TranslationTag }) =>
      http!.post<{ _id: string }>(
        `${formio.projectUrl}/language/submission`,
        { data },
        {
          'x-jwt-token': NavFormioJs.Formio.getToken(),
        },
      ),
    [formio.projectUrl, http],
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
      },
    ) =>
      http!.put(
        `${formio.projectUrl}/language/submission/${translationId}`,
        { data },
        {
          'x-jwt-token': NavFormioJs.Formio.getToken(),
        },
      ),
    [formio.projectUrl],
  );

  const saveTranslation = useCallback(
    async (
      translationId: string | undefined,
      language: Language,
      i18n: I18nTranslationMap,
      name: string,
      scope: TranslationScope,
      form?: string,
      tag?: TranslationTag,
      formTitle?: string,
    ) => {
      let newOrExistingTranslationId = translationId;
      if (!newOrExistingTranslationId) {
        try {
          const submission = await createTranslationSubmission({ language, name, scope, form, tag });
          newOrExistingTranslationId = submission._id;
        } catch (error: any) {
          const userMessage = 'Oversettelsen kunne ikke opprettes: '.concat(error.message);
          if (error instanceof http!.HttpError) {
            logger?.error('Failed to create translation object', {
              reason: error.message,
              httpStatus: error.status,
              userMessage,
              formPath: form,
              translationScope: scope,
            });
          }
          feedbackEmit.error(userMessage);
          return error.message;
        }
      }
      if (newOrExistingTranslationId) {
        try {
          const submission = await updateTranslationSubmission(newOrExistingTranslationId, {
            language,
            i18n,
            name,
            scope,
            form,
            tag,
          });
          feedbackEmit.success(
            !formTitle
              ? `Lagret globale ${tag}`
              : `Lagret oversettelser for skjema "${formTitle}" på ${languagesInNorwegian[language]}`,
          );
          return submission;
        } catch (error: any) {
          const userMessage = 'Lagring av oversettelser feilet: '.concat(error.message);
          if (error instanceof http!.HttpError) {
            logger?.error('Failed to update translation object', {
              reason: error.message,
              httpStatus: error.status,
              userMessage,
              formPath: form,
              translationScope: scope,
              newOrExistingTranslationId,
            });
          }
          feedbackEmit.error(userMessage);
          return error.message;
        }
      }
    },
    [createTranslationSubmission, updateTranslationSubmission, feedbackEmit],
  );

  const saveLocalTranslation = useCallback(
    async (
      translationId: string | undefined,
      languageCode: Language,
      translations: ScopedTranslationMap,
      formPath: string,
      formTitle: string,
    ) => {
      if (translations) {
        const i18n: I18nTranslationMap = Object.keys(translations).reduce((translationsToSave, translatedText) => {
          if (translations[translatedText].scope === 'local' && translations[translatedText].value) {
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
          'local',
          formPath,
          undefined,
          formTitle,
        );
      } else {
        feedbackEmit.error('Skjemaet ble ikke lagret. Du har ikke gjort noen endringer.');
      }
    },
    [saveTranslation, feedbackEmit],
  );

  const saveGlobalTranslation = useCallback(
    async (
      translationId: string | undefined,
      languageCode: Language,
      translations: ScopedTranslationMap,
      tag: TranslationTag,
    ) => {
      if (Object.keys(translations).length !== 0 || tag === 'skjematekster') {
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
        return saveTranslation(translationId, languageCode, i18n, 'global', 'global', undefined, tag);
      } else {
        feedbackEmit.error('Skjemaet ble ikke lagret. Du har ikke gjort noen endringer.');
      }
    },
    [saveTranslation, feedbackEmit],
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
