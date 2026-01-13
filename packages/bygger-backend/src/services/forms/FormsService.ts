import { Form, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { logger } from '../../logging/logger';
import { createHeaders } from '../utils/formsApiUtils';
import { FormPostBody, FormPutBody, FormsService } from './types';

const createFormsService = (formsApiUrl: string): FormsService => {
  const formsUrl = `${formsApiUrl}/v1/forms`;

  const getAll = async <T extends Partial<Form>>(select?: string): Promise<Array<T>> => {
    const search = select ? new URLSearchParams({ select }) : '';
    const url = `${formsUrl}?${search}`;
    const response = await fetchWithErrorHandling(url, { headers: createHeaders() });
    return response.data as T[];
  };

  const get = async (formPath: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}`, { headers: createHeaders() });
    return response.data as Form;
  };

  const post = async (body: FormPostBody, accessToken: string): Promise<Form> => {
    logger.info(`Create new form ${body.skjemanummer} ${body.title}`);
    const componentsWithNavIds = navFormUtils.enrichComponentsWithNavIds(body.components);
    const response = await fetchWithErrorHandling(formsUrl, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify({ ...body, components: componentsWithNavIds }),
    });
    return response.data as Form;
  };

  const put = async (formPath: string, body: FormPutBody, revision: number, accessToken: string): Promise<Form> => {
    logger.info(`Update form ${formPath} (revision ${revision})`);
    const componentsWithNavIds = navFormUtils.enrichComponentsWithNavIds(body.components);
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}`, {
      method: 'PUT',
      headers: createHeaders(accessToken, revision),
      body: JSON.stringify({ ...body, components: componentsWithNavIds }),
    });
    return response.data as Form;
  };

  const resetForm = async (formPath: string, revision: number, accessToken: string): Promise<Form> => {
    logger.info(`Reset form ${formPath} from revision ${revision}`);
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}/reset`, {
      method: 'DELETE',
      headers: createHeaders(accessToken, revision),
    });
    return response.data as Form;
  };

  const deleteForm = async (formPath: string, revision: number, accessToken: string): Promise<void> => {
    logger.info(`Delete form ${formPath} (revision ${revision})`);
    await fetchWithErrorHandling(`${formsUrl}/${formPath}`, {
      method: 'DELETE',
      headers: createHeaders(accessToken, revision),
    });
  };

  const postLockForm = async (formPath: string, reason: string, accessToken: string): Promise<Form> => {
    logger.info(`Lock form ${formPath}`);
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}/lock`, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify({ reason }),
    });
    return response.data as Form;
  };

  const deleteLockForm = async (formPath: string, accessToken: string): Promise<Form> => {
    logger.info(`Unlock form ${formPath}`);
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}/lock`, {
      method: 'DELETE',
      headers: createHeaders(accessToken),
    });
    return response.data as Form;
  };

  return {
    getAll,
    get,
    post,
    put,
    resetForm,
    deleteForm,
    postLockForm,
    deleteLockForm,
    formsUrl,
  };
};

export default createFormsService;
