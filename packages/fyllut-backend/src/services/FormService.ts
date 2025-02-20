import { Form, formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';
import { fetchFromApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory } from '../utils/forms';

const { useFormioMockApi, useFormsApiStaging, skjemaDir, formioApiServiceUrl, formsApiUrl } = config;

class FormService {
  async loadForm(formPath: string): Promise<NavFormType | null | undefined> {
    if (useFormsApiStaging) {
      const form: Form = (await fetchFromApi(`${formsApiUrl}/v1/forms/${formPath}`)) as Form;
      return form ? formioFormsApiUtils.mapFormToNavForm(form) : null;
    } else if (useFormioMockApi) {
      const forms: any = await fetchFromApi(`${formioApiServiceUrl}/form?type=form&tags=nav-skjema&path=${formPath}`);
      return forms.length > 0 ? forms[0] : null;
    } else {
      return await loadFileFromDirectory(skjemaDir, formPath, undefined);
    }
  }

  async loadForms() {
    let forms;
    if (useFormsApiStaging) {
      const list: Form[] = (await fetchFromApi(
        `${formsApiUrl}/v1/forms?select=id,path,skjemanummer,title,changedAt,properties`,
      )) as Form[];
      console.log(`Forms: ${JSON.stringify(list)}`);
      forms = list.map((f) => formioFormsApiUtils.mapFormToNavForm(f));
    } else if (useFormioMockApi) {
      const select = '_id,title,path,modified,properties.skjemanummer,properties.innsending,properties.ettersending';
      forms = await fetchFromApi(`${formioApiServiceUrl}/form?type=form&tags=nav-skjema&limit=1000&select=${select}`);
    } else {
      forms = await loadAllJsonFilesFromDirectory(skjemaDir);
    }

    return forms;
  }
}

export default FormService;
