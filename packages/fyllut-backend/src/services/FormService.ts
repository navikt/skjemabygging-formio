import { Form, formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';
import { logger } from '../logger';
import { fetchFromApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory } from '../utils/forms';
import { isValidPath } from '../utils/url';

const { useFormioMockApi, useFormsApiStaging, skjemaDir, formioApiServiceUrl, formsApiUrl } = config;

class FormService {
  async loadForm(formPath: string, select?: string): Promise<NavFormType | undefined> {
    if (!isValidPath(formPath)) {
      return;
    }
    let form: NavFormType | Form | undefined;
    try {
      if (useFormsApiStaging) {
        const url = `${formsApiUrl}/v1/forms/${formPath}${select ? `?select=${select}` : ''}`;
        form = (await fetchFromApi(url)) as Form;
        return formioFormsApiUtils.mapFormToNavForm(form);
      } else if (useFormioMockApi) {
        const forms: any = await fetchFromApi(`${formioApiServiceUrl}/form?type=form&tags=nav-skjema&path=${formPath}`);
        return forms.length > 0 ? forms[0] : undefined;
      } else {
        return await loadFileFromDirectory(skjemaDir, formPath, undefined);
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
    if (useFormsApiStaging) {
      const list: Form[] = (await fetchFromApi(
        `${formsApiUrl}/v1/forms?select=id,path,skjemanummer,title,changedAt,properties`,
      )) as Form[];
      return list.map((f) => formioFormsApiUtils.mapFormToNavForm(f));
    } else if (useFormioMockApi) {
      const select = '_id,title,path,modified,properties.skjemanummer,properties.innsending,properties.ettersending';
      return await fetchFromApi(`${formioApiServiceUrl}/form?type=form&tags=nav-skjema&limit=1000&select=${select}`);
    } else {
      return await loadAllJsonFilesFromDirectory(skjemaDir);
    }
  }
}

export default FormService;
