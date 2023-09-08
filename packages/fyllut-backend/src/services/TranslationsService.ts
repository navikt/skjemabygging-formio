import { languagesUtil } from "@navikt/skjemadigitalisering-shared-domain";
import fetch from "node-fetch";
import { loadFileFromDirectory } from "../utils/forms";
import { ConfigType } from "../config/types";

const toFyllutLang = (lang: string) => {
  switch (lang) {
    case "nb":
    case "no":
    case "nb-NO":
      return "nb-NO";
    case "nn":
    case "nn-NO":
      return "nn-NO";
    case "en":
      return "en";
    default:
      return "nb-NO";
  }
};

class TranslationsService {
  private readonly _config: ConfigType;

  constructor(config: ConfigType) {
    this._config = config;
  }

  async fetchTranslationsFromFormioApi(formPath: string) {
    const { formioProjectUrl } = this._config;
    const response = await fetch(`${formioProjectUrl}/language/submission?data.form=${formPath}&limit=1000`, {
      method: "GET",
    });
    if (response.ok) {
      const translationsForForm = await response.json();
      // @ts-ignore
      return translationsForForm.reduce((acc, obj) => ({ ...acc, [obj.data.language]: { ...obj.data.i18n } }), {});
    }
    return {};
  }

  async fetchGlobalTranslationsFromFormioApi(lang: string) {
    const { formioProjectUrl } = this._config;
    const response = await fetch(
      `${formioProjectUrl}/language/submission?data.name=global&data.language=${lang}&limit=1000`,
      { method: "GET" },
    );
    if (response.ok) {
      const responseJson = await response.json();
      return languagesUtil.globalEntitiesToI18nGroupedByTag(responseJson);
    }
    return {};
  }

  async loadTranslation(formPath: string) {
    const { useFormioApi, translationDir } = this._config;
    return useFormioApi
      ? await this.fetchTranslationsFromFormioApi(formPath)
      : await loadFileFromDirectory(translationDir, formPath);
  }

  async loadGlobalTranslations(lang: string) {
    const { useFormioApi, resourcesDir } = this._config;
    const globalTranslations = useFormioApi
      ? await this.fetchGlobalTranslationsFromFormioApi(lang)
      : await loadFileFromDirectory(resourcesDir, `global-translations-${lang}`);
    return languagesUtil.flattenGlobalI18nGroupedByTag(globalTranslations);
  }

  async getTranslationsForLanguage(formPath: string, lang: string): Promise<Record<string, string>> {
    const fyllutLang = toFyllutLang(lang);
    const translations = await this.loadTranslation(formPath);
    const globalTranslations = await this.loadGlobalTranslations(fyllutLang);
    const g = globalTranslations[fyllutLang] ? { ...globalTranslations[fyllutLang] } : {};
    return { ...g, ...(translations[fyllutLang] || {}) };
  }
}

export default TranslationsService;
