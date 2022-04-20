import { config } from "../../config/config";
import { fetchFromFormioApi, loadFileFromDirectory } from "../../utils/forms.js";

const { useFormioApi, skjemaDir, formioProjectUrl } = config;

const loadForm = async (formPath) => {
  return useFormioApi
    ? await fetchFromFormioApi(`${formioProjectUrl}/form?type=form&tags=nav-skjema&path=${formPath}`).then((results) =>
        results.length > 0 ? results[0] : null
      )
    : await loadFileFromDirectory(skjemaDir, formPath, null);
};

const form = {
  get: async (req, res) => {
    const form = await loadForm(req.params.formPath);
    if (!form) {
      return res.sendStatus(404);
    }
    return res.json(form);
  },
};

export default form;
