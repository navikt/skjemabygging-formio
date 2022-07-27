import { config } from "../../config/config";
import { fetchFromFormioApi, loadAllJsonFilesFromDirectory } from "../../utils/forms.js";

const { useFormioApi, skjemaDir, formioProjectUrl } = config;

const loadForms = async () => {
  let forms;
  if (useFormioApi) {
    const select = "title,path,modifie,properties.skjemanummer";
    forms = await fetchFromFormioApi(`${formioProjectUrl}/form?type=form&tags=nav-skjema&limit=1000&select=${select}`);
  } else {
    forms = await loadAllJsonFilesFromDirectory(skjemaDir);
  }

  return forms.map(mapForm);
};

const mapForm = (form) => ({
  title: form.title,
  path: form.path,
  modified: form.modified,
  skjemanummer: form.properties.skjemanummer,
});

const forms = {
  get: async (req, res) => {
    const form = await loadForms();
    return res.json(form);
  },
};

export default forms;
