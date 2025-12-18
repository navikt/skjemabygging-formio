import {
  FormioTranslationPayload,
  FormsApiTranslation,
  I18nTranslations,
  Language,
  languagesUtil,
} from '@navikt/skjemadigitalisering-shared-domain';
import fetch from 'node-fetch';
import { ConfigType } from '../config/types';
import { loadFileFromDirectory } from '../utils/forms';
import { isValidPath } from '../utils/url';

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

  private validateFormPath(formPath: string) {
    if (!isValidPath(formPath)) {
      throw new Error(`Invalid formPath: ${formPath}`);
    }
  }

  async fetchTranslationsFromFormioApi(formPath: string) {
    this.validateFormPath(formPath);
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
    this.validateFormPath(formPath);
    const response = await fetch(`${formsApiUrl}/v1/forms/${formPath}/translations`, {
      method: 'GET',
    });
    if (response.ok) {
      const translationsForForm = (await response.json()) as FormsApiTranslation[];
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

  async fetchGlobalTranslationsFromFormsApi(lang: string): Promise<I18nTranslations> {
    const { formsApiUrl } = this._config;
    const formsApiLang = toFormsApiLang(lang);
    const response = await fetch(`${formsApiUrl}/v1/global-translations`, { method: 'GET' });
    if (response.ok) {
      const responseJson = (await response.json()) as FormsApiTranslation[];
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
    const { useFormsApiStaging, isMocksEnabled, translationDir } = this._config;
    this.validateFormPath(formPath);
    if (isMocksEnabled) {
      return this.fetchTranslationsFromFormioApi(formPath);
    }
    return useFormsApiStaging
      ? await this.fetchTranslationsFromFormsApi(formPath)
      : await loadFileFromDirectory(translationDir, formPath);
  }

  async loadGlobalTranslations(lang: string): Promise<I18nTranslations> {
    const { useFormsApiStaging, isMocksEnabled, resourcesDir } = this._config;
    if (useFormsApiStaging || isMocksEnabled) {
      return this.fetchGlobalTranslationsFromFormsApi(lang);
    }
    const globalTranslations = await loadFileFromDirectory(resourcesDir, `global-translations-${lang}`);
    return languagesUtil.flattenGlobalI18nGroupedByTag(globalTranslations);
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
