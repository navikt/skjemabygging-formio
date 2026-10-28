import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import type { ContentSource } from '../content/contentSource';

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
  source?: ContentSource;
  timeoutMs?: number;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath, select, source = 'latest', timeoutMs } = props;
  const resource = source === 'published' ? 'v1/form-publications' : formsUrl;
  const targetUrl = withSelect(
    `${baseUrl}/${resource}/${encodeURIComponent(formPath)}`,
    source === 'published' ? undefined : select,
  );
  logger.info('Getting form', { formPath, select, targetUrl });

  return await http.get<T>(targetUrl, {
    ...(timeoutMs !== undefined && { signal: AbortSignal.timeout(timeoutMs) }),
  });
};

const formClient = {
  getForms,
  getForm,
};

export default formClient;
