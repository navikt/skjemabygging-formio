import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';

const withSelect = (url: string, select?: string) => {
  if (!select) {
    return url;
  }

  return `${url}?${new URLSearchParams({ select }).toString()}`;
};

interface GetFormsProps {
  baseUrl: string;
  select?: string;
}
const getForms = async <T = Form>(props: GetFormsProps): Promise<T[]> => {
  const { baseUrl, select } = props;
  logger.info(`Get all forms`);

  return await http.get<T[]>(withSelect(`${baseUrl}/${formsUrl}`, select));
};

interface GetFormProps {
  baseUrl: string;
  formPath: string;
  select?: string;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath, select } = props;
  logger.info(`Get form ${formPath}`);

  return await http.get<T>(withSelect(`${baseUrl}/${formsUrl}/${formPath}`, select));
};

const formClient = {
  getForms,
  getForm,
};

export default formClient;
