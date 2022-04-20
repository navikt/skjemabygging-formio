import fetch from "node-fetch";
import { config } from "../../config/config";
import { loadFileFromDirectory } from "../../utils/forms.js";

const { useFormioApi, formioProjectUrl, translationDir } = config;

const fetchTranslationsFromFormioApi = async (formPath) => {
  const response = await fetch(`${formioProjectUrl}/language/submission?data.form=${formPath}&limit=1000`, {
    method: "GET",
  });
  if (response.ok) {
    const translationsForForm = await response.json();
    return translationsForForm.reduce((acc, obj) => ({ ...acc, [obj.data.language]: { ...obj.data.i18n } }), {});
  }
  return {};
};

const loadTranslations = async (formPath) => {
  return useFormioApi
    ? await fetchTranslationsFromFormioApi(formPath)
    : await loadFileFromDirectory(translationDir, formPath);
};

const translations = {
  get: async (req, res) => res.json(await loadTranslations(req.params.form)),
};

export default translations;
