import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { config } from "../config/config";
import { fetchFromFormioApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory } from "../utils/forms";

const { useFormioApi, skjemaDir, formioProjectUrl } = config;

const defaultMeta = {
  PAGE_TITLE: "Fyll ut skjema - www.nav.no",
  PAGE_DESCRIPTION: "NAV søknadsskjema",
};

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

  async getMeta(formPath: string) {
    if (formPath) {
      const form = await this.loadForm(formPath);
      if (form) {
        return {
          PAGE_TITLE: form.title || defaultMeta.PAGE_TITLE,
          PAGE_DESCRIPTION: navFormUtils.findDescription(form) || defaultMeta.PAGE_DESCRIPTION,
        };
      }
    }
    return defaultMeta;
  }
}

export default FormService;
