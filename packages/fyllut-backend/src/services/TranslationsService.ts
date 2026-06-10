import { HttpResponseError, fileUtil, translationClient, urlUtil } from '@navikt/skjemadigitalisering-shared-backend';
import {
  FormioTranslationPayload,
  I18nTranslations,
  Language,
  languageUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import fetch from 'node-fetch';
import { FyllutBackendConfig } from '../config/types';

const toFyllutLang = (lang: string): Language => {
  switch (lang) {
    case 'nb':
    case 'no':
    case 'nb-NO':
      return 'nb-NO';
    case 'nn':
    case 'nn-NO':
      return 'nn-NO';
    case 'en':
      return 'en';
    default:
      return 'nb-NO';
  }
};

const toFormsApiLang = (lang: string) => {
  switch (lang) {
    case 'nb':
    case 'no':
    case 'nb-NO':
      return 'nb';
    case 'nn':
    case 'nn-NO':
      return 'nn';
    case 'en':
      return 'en';
    default:
      return 'nb';
  }
};

class TranslationsService {
  private readonly _config: FyllutBackendConfig;

  constructor(config: FyllutBackendConfig) {
    this._config = config;
  }

  private validateFormPath(formPath: string) {
    if (!urlUtil.isValidPath(formPath)) {
      throw new Error(`Invalid formPath: ${formPath}`);
    }
  }

  async fetchTranslationsFromFormioApi(formPath: string): Promise<I18nTranslations> {
    const { formioApiServiceUrl } = this._config;
    this.validateFormPath(formPath);
    const response = await fetch(`${formioApiServiceUrl}/language/submission?data.form=${formPath}&limit=1000`, {
      method: 'GET',
    });
    if (response.ok) {
      const translationsForForm = (await response.json()) as FormioTranslationPayload[];
      return translationsForForm.reduce((acc, obj) => ({ ...acc, [obj.data.language]: { ...obj.data.i18n } }), {});
    }
    return {};
  }

  async fetchTranslationsFromFormsApi(formPath: string): Promise<I18nTranslations> {
    const { formsApiUrl } = this._config;
    this.validateFormPath(formPath);
    try {
      const translationsForForm = await translationClient.getFormTranslations({
        baseUrl: formsApiUrl,
        formPath,
      });

      return translationsForForm
        .filter((t) => !t.globalTranslationId)
        .reduce(
          (acc, obj) => {
            const { key, nb, nn, en } = obj;
            return {
              ['nb-NO']: {
                ...acc['nb-NO'],
                ...(nb && { [key]: nb }),
              },
              ['nn-NO']: {
                ...acc['nn-NO'],
                ...(nn && { [key]: nn }),
              },
              en: {
                ...acc.en,
                ...(en && { [key]: en }),
              },
            };
          },
          {
            ['nb-NO']: {},
            ['nn-NO']: {},
            en: {},
          },
        );
    } catch (error) {
      // Translations are non-critical; preserve legacy behavior of returning {} on upstream failure.
      if (error instanceof HttpResponseError) {
        return {};
      }

      throw error;
    }
  }

  async fetchGlobalTranslationsFromFormsApi(lang: string): Promise<I18nTranslations> {
    const { formsApiUrl } = this._config;
    const formsApiLang = toFormsApiLang(lang);
    try {
      const translations = await translationClient.getGlobalTranslations({
        baseUrl: formsApiUrl,
        languageCodes: [formsApiLang],
      });
      return translations.reduce(
        (acc, obj) => ({
          [lang]: {
            ...acc[lang],
            ...(obj[formsApiLang] && { [obj.key]: obj[formsApiLang] }),
          },
        }),
        {
          [lang]: {},
        },
      );
    } catch (error) {
      if (error instanceof HttpResponseError) {
        return {};
      }

      throw error;
    }
  }

  async loadTranslation(formPath: string): Promise<I18nTranslations> {
    const { useFormsApiStaging, mocksEnabled, translationDir } = this._config;
    this.validateFormPath(formPath);
    if (mocksEnabled) {
      return this.fetchTranslationsFromFormioApi(formPath);
    }
    if (useFormsApiStaging) {
      return this.fetchTranslationsFromFormsApi(formPath);
    }
    return (await fileUtil.loadJsonFileFromDirectory(translationDir, formPath)) ?? {};
  }

  async loadGlobalTranslations(lang: string): Promise<I18nTranslations> {
    const { useFormsApiStaging, mocksEnabled, resourcesDir } = this._config;
    if (useFormsApiStaging || mocksEnabled) {
      return this.fetchGlobalTranslationsFromFormsApi(lang);
    }
    const globalTranslations =
      (await fileUtil.loadJsonFileFromDirectory(resourcesDir, `global-translations-${lang}`)) ?? {};
    return languageUtils.flattenGlobalI18nGroupedByTag(globalTranslations);
  }

  async getTranslationsForLanguage(formPath: string, lang: string): Promise<Record<string, string>> {
    this.validateFormPath(formPath);
    const fyllutLang = toFyllutLang(lang);
    const formTranslations = (await this.loadTranslation(formPath))[fyllutLang];
    const globalTranslations = (await this.loadGlobalTranslations(fyllutLang))[fyllutLang];
    return { ...globalTranslations, ...formTranslations };
  }
}

export default TranslationsService;
