import { Form, formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';
import { logger } from '../logger';
import { fetchFromApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory } from '../utils/forms';

const { useFormioMockApi, useFormsApiStaging, skjemaDir, formioApiServiceUrl, formsApiUrl } = config;

class FormService {
  async loadForm(formPath: string): Promise<NavFormType | undefined> {
    if (!formPath.match(/^[a-z0-9]+$/)) {
      return;
    }
    let form: NavFormType | Form | undefined;
    try {
      if (useFormsApiStaging) {
        form = (await fetchFromApi(`${formsApiUrl}/v1/forms/${formPath}`)) as Form;
        return formioFormsApiUtils.removeInnsendingFromForm(formioFormsApiUtils.mapFormToNavForm(form));
      } else if (useFormioMockApi) {
        const forms: any = await fetchFromApi(`${formioApiServiceUrl}/form?type=form&tags=nav-skjema&path=${formPath}`);
        return forms.length > 0 ? formioFormsApiUtils.removeInnsendingFromForm(forms[0]) : undefined;
      } else {
        const form: NavFormType = await loadFileFromDirectory(skjemaDir, formPath, undefined);
        return formioFormsApiUtils.removeInnsendingFromForm(form);
      }
    } catch (error) {
      logger.error(`Failed to load form ${formPath}`, error as Error);

      if (error instanceof Error) {
        const statusCode = (error as any).http_status;
        if (statusCode === 404) {
          return undefined;
        }
      }
    }
  }

  async loadForms() {
    let forms;
    if (useFormsApiStaging) {
      const list: Form[] = (await fetchFromApi(
        `${formsApiUrl}/v1/forms?select=id,path,skjemanummer,title,changedAt,properties`,
      )) as Form[];
      forms = list.map((f) => formioFormsApiUtils.mapFormToNavForm(f));
    } else if (useFormioMockApi) {
      const select = '_id,title,path,modified,properties.skjemanummer,properties.innsending,properties.ettersending';
      forms = await fetchFromApi(`${formioApiServiceUrl}/form?type=form&tags=nav-skjema&limit=1000&select=${select}`);
    } else {
      forms = await loadAllJsonFilesFromDirectory(skjemaDir);
    }

    return forms.map((form: NavFormType) => formioFormsApiUtils.removeInnsendingFromForm(form));
  }
}

export default FormService;
