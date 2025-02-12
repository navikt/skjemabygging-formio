import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import { FormPostBody, FormPutBody, FormsService } from './types';

const createFormsService = (formsApiUrl: string): FormsService => {
  const formsUrl = `${formsApiUrl}/v1/forms`;

  const getAll = async (select?: string): Promise<Form[]> => {
    const search = select ? new URLSearchParams({ select }) : '';
    const url = `${formsUrl}?${search}`;
    console.log('getAll', url);
    const response = await fetchWithErrorHandling(url, { headers: createHeaders() });
    return response.data as Form[];
  };

  const get = async (formPath: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}`, { headers: createHeaders() });
    return response.data as Form;
  };

  const post = async (body: FormPostBody, accessToken: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(formsUrl, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify(body),
    });
    return response.data as Form;
  };

  const put = async (formPath: string, body: FormPutBody, revision: number, accessToken: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(`${formsUrl}/${formPath}`, {
      method: 'PUT',
      headers: createHeaders(accessToken, revision),
      body: JSON.stringify(body),
    });
    return response.data as Form;
  };

  return {
    getAll,
    get,
    post,
    put,
    formsUrl,
  };
};

export default createFormsService;
