import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const formPublicationsUrl = 'v1/form-publications';

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
  timeoutMs?: number;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath, select, timeoutMs } = props;
  const targetUrl = withSelect(`${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}`, select);
  logger.info('Getting form', { formPath, select, targetUrl });

  return await http.get<T>(targetUrl, { timeoutMs });
};

interface GetPublishedFormProps {
  baseUrl: string;
  formPath: string;
  timeoutMs?: number;
}
const getPublishedForm = async <T = Form>(props: GetPublishedFormProps): Promise<T> => {
  const { baseUrl, formPath, timeoutMs } = props;
  const targetUrl = `${baseUrl}/${formPublicationsUrl}/${encodeURIComponent(formPath)}`;
  logger.info('Getting published form', { formPath, targetUrl });

  return await http.get<T>(targetUrl, { timeoutMs });
};

const formClient = {
  getForms,
  getForm,
  getPublishedForm,
};

export default formClient;
