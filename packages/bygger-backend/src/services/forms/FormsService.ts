import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import { FormPostBody, FormPutBody } from './types';

const createFormsService = (formsApiUrl: string) => {
  const formsUrl = `${formsApiUrl}/v1/forms`;

  const getAll = async (): Promise<Form[]> => {
    const response = await fetchWithErrorHandling(formsUrl, { headers: createHeaders() });
    return response.data as Form[];
  };

  const get = async (id: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(`${formsUrl}/${id}`, { headers: createHeaders() });
    return response.data as Form;
  };

  const post = async (body: FormPostBody, accessToken: string): Promise<Form> => {
    console.log('formsService', body);
    const response = await fetchWithErrorHandling(formsUrl, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify(body),
    });
    return response.data as Form;
  };

  const put = async (id: string, body: FormPutBody, revision: number, accessToken: string) => {
    const response = await fetchWithErrorHandling(`${formsUrl}/${id}`, {
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
  };
};

export default createFormsService;
