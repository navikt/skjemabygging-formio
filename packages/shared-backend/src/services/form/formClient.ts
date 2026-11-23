import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const formPublicationsUrl = 'v1/form-publications';

const withQuery = (url: string, query: Record<string, string | undefined>) => {
  const params = new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] => entry[1] !== undefined),
  ).toString();
  return params ? `${url}?${params}` : url;
};

interface GetFormsProps {
  baseUrl: string;
  select?: string;
}
const getForms = async <T = Form>(props: GetFormsProps): Promise<T[]> => {
  const { baseUrl, select } = props;
  const targetUrl = withQuery(`${baseUrl}/${formsUrl}`, { select });
  logger.info('Getting forms', { select, targetUrl });

  return await http.get<T[]>(targetUrl);
};

interface GetFormProps {
  baseUrl: string;
  formPath: string;
  select?: string;
  revision?: number;
  timeoutMs?: number;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath, select, revision, timeoutMs } = props;
  const targetUrl = withQuery(`${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}`, {
    select,
    revision: revision?.toString(),
  });
  logger.info('Getting form', { formPath, select, revision, targetUrl });

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
