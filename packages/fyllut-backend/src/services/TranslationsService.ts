import { languagesUtil } from "@navikt/skjemadigitalisering-shared-domain";
import fetch from "node-fetch";
import { config } from "../config/config";
import { loadFileFromDirectory } from "../utils/forms";

const { useFormioApi, translationDir, formioProjectUrl, resourcesDir } = config;

const fetchTranslationsFromFormioApi = async (formPath: string) => {
  const response = await fetch(`${formioProjectUrl}/language/submission?data.form=${formPath}&limit=1000`, {
    method: "GET",
  });
  if (response.ok) {
    const translationsForForm = await response.json();
    // @ts-ignore
    return translationsForForm.reduce((acc, obj) => ({ ...acc, [obj.data.language]: { ...obj.data.i18n } }), {});
  }
  return {};
};

const fetchGlobalTranslationsFromFormioApi = async (lang: string) => {
  const response = await fetch(
    `${formioProjectUrl}/language/submission?data.name=global&data.language=${lang}&limit=1000`,
    { method: "GET" },
  );
  if (response.ok) {
    const responseJson = await response.json();
    return languagesUtil.globalEntitiesToI18nGroupedByTag(responseJson);
  }
  return {};
};

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
  async loadTranslation(formPath: string) {
    return useFormioApi
      ? await fetchTranslationsFromFormioApi(formPath)
      : await loadFileFromDirectory(translationDir, formPath);
  }

  async loadGlobalTranslations(lang: string) {
    const globalTranslations = useFormioApi
      ? await fetchGlobalTranslationsFromFormioApi(lang)
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
