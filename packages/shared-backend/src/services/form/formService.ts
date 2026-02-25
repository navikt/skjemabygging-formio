import { Form, formioFormsApiUtils, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { fileUtil } from '../../util';
import formApiService from './formApiService';

type FormSelectType = keyof Form;

interface GetFormsProps {
  baseUrl: string;
  formsApiStaging?: boolean;
  mocksEnabled?: boolean;
  formsLocation?: string;
  select: Omit<FormSelectType, 'components'>[];
}
const getForms = async <S extends FormSelectType[]>(
  props: Omit<GetFormsProps, 'select'> & { select: S },
): Promise<Array<Pick<Form, S[number]>>> => {
  const { baseUrl, formsApiStaging, mocksEnabled, formsLocation, select } = props;

  if (!select) {
    throw new ResponseError('BAD_REQUEST', 'Select properties are required to fetch forms');
  }

  if (formsApiStaging || mocksEnabled) {
    return formApiService.getForms<Pick<Form, S[number]>>({ baseUrl, select: select.join(',') });
  } else {
    const navForms = await fileUtil.loadAllJsonFilesFromDirectory(formsLocation);
    return navForms.map(formioFormsApiUtils.mapNavFormToForm) as Array<Pick<Form, S[number]>>;
  }
};

interface GetFormProps {
  baseUrl: string;
  formPath: string;
  formsApiStaging?: boolean;
  mocksEnabled?: boolean;
  formsLocation?: string;
  select: FormSelectType[];
}
const getForm = async <S extends FormSelectType[]>(
  props: Omit<GetFormProps, 'select'> & { select: S },
): Promise<Pick<Form, S[number]>> => {
  const { baseUrl, formPath, formsApiStaging, mocksEnabled, formsLocation, select } = props;

  if (!select) {
    throw new ResponseError('BAD_REQUEST', 'Select properties are required to fetch form');
  }

  if (formsApiStaging || mocksEnabled) {
    return formApiService.getForm<Pick<Form, S[number]>>({ baseUrl, formPath, select: select.join(',') });
  } else {
    const form = await fileUtil.loadJsonFileFromDirectory(formsLocation, formPath);
    if (!form) {
      throw new ResponseError('NOT_FOUND', `Form with path ${formPath} not found in directory ${formsLocation}`);
    }
    return formioFormsApiUtils.mapNavFormToForm(form) as Pick<Form, S[number]>;
  }
};

const formService = {
  getForms,
  getForm,
};

export default formService;
