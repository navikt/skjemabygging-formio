import { config } from "../config/config";
import { fetchFromFormioApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory } from "../utils/forms";

const { useFormioApi, skjemaDir, formioProjectUrl } = config;

class FormService {
  async loadForm(formPath: string) {
    if (useFormioApi) {
      const forms = await fetchFromFormioApi(`${formioProjectUrl}/form?type=form&tags=nav-skjema&path=${formPath}`);
      return forms.length > 0 ? forms[0] : null;
    } else {
      return await loadFileFromDirectory(skjemaDir, formPath, undefined);
    }
  }

  async loadForms() {
    let forms;
    if (useFormioApi) {
      const select = "_id,title,path,modified,properties.skjemanummer";
      forms = await fetchFromFormioApi(
        `${formioProjectUrl}/form?type=form&tags=nav-skjema&limit=1000&select=${select}`
      );
    } else {
      forms = await loadAllJsonFilesFromDirectory(skjemaDir);
    }

    return forms;
  }
}

export default FormService;
