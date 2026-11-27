import {
  Form,
  formioFormsApiUtils,
  FormWithLanguages,
  ResponseError,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { fileUtil } from '../../util';
import { MetricServiceConfig } from '../metrics/metricService';
import formClient from './formClient';
import { resolveFormLanguages } from './formLanguages';
import { createFormMetrics } from './formMetrics';

type FormSelectType = keyof Form;
type FormWithLanguagesSelectType = keyof FormWithLanguages;
type FormClient = Pick<typeof formClient, 'getForms' | 'getForm'>;

interface GetFormsConfig {
  formsApiStaging?: boolean;
  mocksEnabled?: boolean;
  formsLocation?: string;
}

type FormService = {
  getForms: <S extends FormSelectType[]>(props: { select: S }) => Promise<Array<Pick<Form, S[number]>>>;
  getForm: {
    <S extends FormWithLanguagesSelectType[]>(props: {
      formPath: string;
      select: S;
    }): Promise<Pick<FormWithLanguages, S[number]>>;
    (props: { formPath: string; select?: undefined }): Promise<Form>;
  };
};

interface CreateFormServiceProps extends GetFormsConfig {
  baseUrl: string;
  metrics?: MetricServiceConfig;
  client?: FormClient;
}

const isFormNotFoundError = (error: unknown) => error instanceof ResponseError && error.errorCode === 'NOT_FOUND';

const createFormService = ({
  baseUrl,
  formsApiStaging,
  mocksEnabled,
  formsLocation,
  metrics,
  client = formClient,
}: CreateFormServiceProps): FormService => {
  const formMetrics = createFormMetrics(metrics);

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

  const includeUnpublishedLanguages = !!(formsApiStaging || mocksEnabled);

  const fetchForm = async ({ formPath, select }: { formPath: string; select?: FormSelectType[] }) => {
    if (!validatorUtils.isValidFormPath(formPath)) {
      throw new ResponseError('NOT_FOUND', `Form with path ${formPath} not found`);
    }

    if (formsApiStaging || mocksEnabled) {
      if (!select) {
        return client.getForm<Form>({ baseUrl, formPath });
      }

      return client.getForm<Pick<Form, (typeof select)[number]>>({ baseUrl, formPath, select: select.join(',') });
    }

    const form = await fileUtil.loadJsonFileFromDirectory(formsLocation, formPath);
    if (!form) {
      throw new ResponseError('NOT_FOUND', `Form with path ${formPath} not found in directory ${formsLocation}`);
    }

    const mappedForm = formioFormsApiUtils.mapNavFormToForm(form);
    if (!select) {
      return mappedForm;
    }

    return mappedForm as Pick<Form, (typeof select)[number]>;
  };

  const getForm = (async ({ formPath, select }: { formPath: string; select?: FormWithLanguagesSelectType[] }) => {
    try {
      if (!select?.includes('languages')) {
        const form = await fetchForm({ formPath, select: select as FormSelectType[] | undefined });
        formMetrics.fetches.increment({ result: 'hit' });
        return form;
      }

      const formSelect = select.filter((field): field is FormSelectType => field !== 'languages');
      const form = await fetchForm({
        formPath,
        select:
          formSelect.length > 0
            ? Array.from(new Set([...formSelect, 'publishedLanguages' as const, 'status' as const]))
            : undefined,
      });

      const resolvedForm = { ...form, languages: resolveFormLanguages(form, includeUnpublishedLanguages) };
      formMetrics.fetches.increment({ result: 'hit' });
      return resolvedForm;
    } catch (error) {
      formMetrics.fetches.increment({ result: isFormNotFoundError(error) ? 'miss' : 'error' });
      throw error;
    }
  }) as FormService['getForm'];

  return {
    getForms,
    getForm,
  };
};

export { createFormService };
export type { FormService };
