import { languagesUtil } from "@navikt/skjemadigitalisering-shared-domain";
import fetch from "node-fetch";
import { config } from "../../config/config.js";
import { loadFileFromDirectory } from "../../utils/forms.js";

const { useFormioApi, resourcesDir, formioProjectUrl } = config;

const fetchGlobalTranslationsFromFormioApi = async (lang) => {
  const response = await fetch(
    `${formioProjectUrl}/language/submission?data.name=global&data.language=${lang}&limit=1000`,
    { method: "GET" }
  );
  if (response.ok) {
    const responseJson = await response.json();
    return languagesUtil.globalEntitiesToI18nGroupedByTag(responseJson);
  }
  return {};
};

const loadGlobalTranslations = async (languageCode) => {
  const globalTranslations = useFormioApi
    ? await fetchGlobalTranslationsFromFormioApi(languageCode)
    : await loadFileFromDirectory(resourcesDir, `global-translations-${languageCode}`);
  return languagesUtil.flattenGlobalI18nGroupedByTag(globalTranslations);
};

const globalTranslations = {
  get: async (req, res) => res.json(await loadGlobalTranslations(req.params.languageCode)),
};

export default globalTranslations;
