import { I18nTranslations, languagesUtil } from '@navikt/skjemadigitalisering-shared-domain';
import fetch from 'node-fetch';
import { ConfigType } from '../config/types';
import { loadFileFromDirectory } from '../utils/forms';

const toFyllutLang = (lang: string) => {
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
      const translationsForForm = (await response.json()) as I18nTranslations;
      // @ts-ignore
      return translationsForForm.reduce((acc, obj) => ({ ...acc, [obj.data.language]: { ...obj.data.i18n } }), {});
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

  async loadTranslation(formPath: string): Promise<I18nTranslations> {
    const { useFormioApi, translationDir } = this._config;
    return useFormioApi
      ? await this.fetchTranslationsFromFormioApi(formPath)
      : await loadFileFromDirectory(translationDir, formPath);
  }

  async loadGlobalTranslations(lang: string): Promise<I18nTranslations> {
    const { useFormioApi, resourcesDir } = this._config;
    const globalTranslations = useFormioApi
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
