import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { logger } from '../../logging/logger';
import { createHeaders, removeInnsendingTypeFromForm } from '../utils/formsApiUtils';
import { FormPostBody, FormPutBody, FormsService } from './types';

const createFormsService = (formsApiUrl: string): FormsService => {
  const formsUrl = `${formsApiUrl}/v1/forms`;

  const getAll = async (select?: string): Promise<Array<Partial<Form>>> => {
    const search = select ? new URLSearchParams({ select }) : '';
    const url = `${formsUrl}?${search}`;
    const response = await fetchWithErrorHandling(url, { headers: createHeaders() });
    return (response.data as Partial<Form>[]).map(removeInnsendingTypeFromForm);
  };

  const get = async (formPath: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}`, { headers: createHeaders() });
    return removeInnsendingTypeFromForm(response.data as Form) as Form;
  };

  const post = async (body: FormPostBody, accessToken: string): Promise<Form> => {
    logger.info(`Create new form ${body.skjemanummer} ${body.title}`);
    const response = await fetchWithErrorHandling(formsUrl, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify(body),
    });
    return response.data as Form;
  };

  const put = async (formPath: string, body: FormPutBody, revision: number, accessToken: string): Promise<Form> => {
    logger.info(`Update form ${formPath} (revision ${revision})`);
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}`, {
      method: 'PUT',
      headers: createHeaders(accessToken, revision),
      body: JSON.stringify(body),
    });
    return response.data as Form;
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
    postLockForm,
    deleteLockForm,
    formsUrl,
  };
};

export default createFormsService;
