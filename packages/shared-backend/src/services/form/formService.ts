import { Form, formioFormsApiUtils, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { fileUtil } from '../../util';
import formClient from './formClient';

type FormSelectType = keyof Form;
type FormClient = Pick<typeof formClient, 'getForms' | 'getForm'>;

interface GetFormsConfig {
  formsApiStaging?: boolean;
  mocksEnabled?: boolean;
  formsLocation?: string;
}

type FormService = {
  getForms: <S extends FormSelectType[]>(props: { select: S }) => Promise<Array<Pick<Form, S[number]>>>;
  getForm: <S extends FormSelectType[]>(props: { formPath: string; select: S }) => Promise<Pick<Form, S[number]>>;
};

interface CreateFormServiceProps extends GetFormsConfig {
  baseUrl: string;
  client?: FormClient;
}

const createFormService = ({
  baseUrl,
  formsApiStaging,
  mocksEnabled,
  formsLocation,
  client = formClient,
}: CreateFormServiceProps): FormService => {
  const getForms: FormService['getForms'] = async ({ select }) => {
    if (!select) {
      throw new ResponseError('BAD_REQUEST', 'Select properties are required to fetch forms');
    }

    if (formsApiStaging || mocksEnabled) {
      return client.getForms<Pick<Form, (typeof select)[number]>>({ baseUrl, select: select.join(',') });
    }

    const navForms = await fileUtil.loadAllJsonFilesFromDirectory(formsLocation);
    return navForms.map(formioFormsApiUtils.mapNavFormToForm) as Array<Pick<Form, (typeof select)[number]>>;
  };

  const getForm: FormService['getForm'] = async ({ formPath, select }) => {
    if (!select) {
      throw new ResponseError('BAD_REQUEST', 'Select properties are required to fetch form');
    }

    if (formsApiStaging || mocksEnabled) {
      return client.getForm<Pick<Form, (typeof select)[number]>>({ baseUrl, formPath, select: select.join(',') });
    }

    const form = await fileUtil.loadJsonFileFromDirectory(formsLocation, formPath);
    if (!form) {
      throw new ResponseError('NOT_FOUND', `Form with path ${formPath} not found in directory ${formsLocation}`);
    }
    return formioFormsApiUtils.mapNavFormToForm(form) as Pick<Form, (typeof select)[number]>;
  };

  return {
    getForms,
    getForm,
  };
};

export { createFormService };
export type { FormService };
