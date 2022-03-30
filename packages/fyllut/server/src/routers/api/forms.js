import { config } from "../../config/config.js";
import { fetchFromFormioApi, loadAllJsonFilesFromDirectory } from "../../utils/forms.js";

const { useFormioApi, skjemaDir, formioProjectUrl } = config;

const loadForms = async () => {
  return useFormioApi
    ? await fetchFromFormioApi(
        `${formioProjectUrl}/form?type=form&tags=nav-skjema&limit=1000&select=title,path,modified`
      )
    : await loadAllJsonFilesFromDirectory(skjemaDir).then((forms) =>
        forms.map((form) => ({
          title: form.title,
          path: form.path,
          modified: form.modified,
        }))
      );
};

const forms = {
  get: async (req, res) => {
    const form = await loadForms();
    return res.json(form);
  },
};

export default forms;
