import {
  FormioTranslationPayload,
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  I18nTranslations,
  Language,
  languagesUtil,
} from '@navikt/skjemadigitalisering-shared-domain';
import fetch from 'node-fetch';
import { ConfigType } from '../config/types';
import { loadFileFromDirectory } from '../utils/forms';

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
  private readonly _config: ConfigType;

  constructor(config: ConfigType) {
    this._config = config;
  }

  async fetchTranslationsFromFormioApi(formPath: string) {
    const { formioApiServiceUrl } = this._config;
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
    const response = await fetch(`${formsApiUrl}/v1/forms/${formPath}/translations`, {
      method: 'GET',
    });
    if (response.ok) {
      const translationsForForm = (await response.json()) as FormsApiFormTranslation[];
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
    }
    return {};
  }

  async fetchGlobalTranslationsFromFormioApi(lang: string) {
    const { formioApiServiceUrl } = this._config;
    const response = await fetch(
      `${formioApiServiceUrl}/language/submission?data.name=global&data.language=${lang}&limit=1000`,
      { method: 'GET' },
    );
    if (response.ok) {
      const responseJson = await response.json();
      return languagesUtil.globalEntitiesToI18nGroupedByTag(responseJson);
    }
    return {};
  }

  async fetchGlobalTranslationsFromFormsApi(lang: string): Promise<I18nTranslations> {
    const { formsApiUrl } = this._config;
    const formsApiLang = toFormsApiLang(lang);
    const response = await fetch(`${formsApiUrl}/v1/global-translations`, { method: 'GET' });
    if (response.ok) {
      const responseJson = (await response.json()) as FormsApiGlobalTranslation[];
      return responseJson.reduce(
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
    }
    return {};
  }

  async loadTranslation(formPath: string): Promise<I18nTranslations> {
    const { useFormsApiStaging, useFormioMockApi, translationDir } = this._config;
    if (useFormsApiStaging) {
      return this.fetchTranslationsFromFormsApi(formPath);
    }
    return useFormioMockApi
      ? await this.fetchTranslationsFromFormioApi(formPath)
      : await loadFileFromDirectory(translationDir, formPath);
  }

  async loadGlobalTranslations(lang: string): Promise<I18nTranslations> {
    const { useFormsApiStaging, useFormioMockApi, resourcesDir } = this._config;
    if (useFormsApiStaging) {
      return this.fetchGlobalTranslationsFromFormsApi(lang);
    }
    const globalTranslations = useFormioMockApi
      ? await this.fetchGlobalTranslationsFromFormioApi(lang)
      : await loadFileFromDirectory(resourcesDir, `global-translations-${lang}`);
    return languagesUtil.flattenGlobalI18nGroupedByTag(globalTranslations);
  }

  async getTranslationsForLanguage(formPath: string, lang: string): Promise<Record<string, string>> {
    const fyllutLang = toFyllutLang(lang);
    const formTranslations = (await this.loadTranslation(formPath))[fyllutLang];
    const globalTranslations = (await this.loadGlobalTranslations(fyllutLang))[fyllutLang];
    return { ...globalTranslations, ...formTranslations };
  }
}

export default TranslationsService;
