import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';

interface GetFormsProps {
  baseUrl: string;
  select?: string;
}
const getForms = async <T = Form>(props: GetFormsProps): Promise<T[]> => {
  const { baseUrl } = props;
  logger.info(`Get all forms`);

  return await http.get<T[]>(`${baseUrl}/${formsUrl}`);
};

interface GetFormProps {
  baseUrl: string;
  formPath: string;
  select?: string;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath } = props;
  logger.info(`Get form ${formPath}`);

  return await http.get<T>(`${baseUrl}/${formsUrl}/${formPath}`);
};

const formService = {
  getForms,
  getForm,
};

export default formService;
