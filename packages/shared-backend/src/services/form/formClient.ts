import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';

const withSearchParams = (url: string, select?: string, revision?: string) => {
  if (!select && !revision) {
    return url;
  }

  return `${url}?${select ? new URLSearchParams({ select }).toString() : ''}${revision ? '&' + new URLSearchParams({ revision }).toString() : ''}`;
};

interface GetFormsProps {
  baseUrl: string;
  select?: string;
}
const getForms = async <T = Form>(props: GetFormsProps): Promise<T[]> => {
  const { baseUrl, select } = props;
  const targetUrl = withSearchParams(`${baseUrl}/${formsUrl}`, select);
  logger.info('Getting forms', { select, targetUrl });

  return await http.get<T[]>(targetUrl);
};

interface GetFormProps {
  baseUrl: string;
  formPath: string;
  revision?: string;
  select?: string;
}
const getForm = async <T = Form>(props: GetFormProps): Promise<T> => {
  const { baseUrl, formPath, revision, select } = props;
  const targetUrl = withSearchParams(`${baseUrl}/${formsUrl}/${formPath}`, select, revision);

  logger.info('Getting form', { formPath, select, targetUrl });

  return await http.get<T>(targetUrl);
};

const formClient = {
  getForms,
  getForm,
};

export default formClient;
