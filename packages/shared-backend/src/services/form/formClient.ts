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
  const targetUrl = withSelect(`${baseUrl}/${formsUrl}`, select);
  logger.info('Getting forms', { select, targetUrl });

  return await http.get<T[]>(targetUrl);
};

interface GetFormProps {
  baseUrl: string;
  formPath: string;
  select?: string;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath, select } = props;
  const targetUrl = withSelect(`${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}`, select);
  logger.info('Getting form', { formPath, select, targetUrl });

  return await http.get<T>(targetUrl);
};

const formClient = {
  getForms,
  getForm,
};

export default formClient;
