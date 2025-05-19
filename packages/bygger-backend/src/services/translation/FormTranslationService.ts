import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import { FormTranslationPostBody, FormTranslationPutBody, FormTranslationService } from './types';

const createFormTranslationsService = (formsApiUrl: string): FormTranslationService => {
  const formsApiTranslationsUrl = `${formsApiUrl}/v1/forms`;
  const translationsPath = 'translations';

  return {
    get: async (formPath: string): Promise<FormsApiTranslation[]> => {
      const response = await fetchWithErrorHandling(`${formsApiTranslationsUrl}/${formPath}/${translationsPath}`, {
        headers: createHeaders(),
      });
      return response.data as FormsApiTranslation[];
    },
    post: async (
      formPath: string,
      translation: FormTranslationPostBody,
      accessToken: string,
    ): Promise<FormsApiTranslation> => {
      const response = await fetchWithErrorHandling(`${formsApiTranslationsUrl}/${formPath}/${translationsPath}`, {
        method: 'POST',
        headers: createHeaders(accessToken),
        body: JSON.stringify(translation),
      });
      return response.data as FormsApiTranslation;
    },

    put: async (
      formPath: string,
      id: string,
      body: FormTranslationPutBody,
      revision: number,
      accessToken: string,
    ): Promise<FormsApiTranslation> => {
      const response = await fetchWithErrorHandling(
        `${formsApiTranslationsUrl}/${formPath}/${translationsPath}/${id}`,
        {
          method: 'PUT',
          headers: createHeaders(accessToken, revision),
          body: JSON.stringify(body),
        },
      );
      return response.data as FormsApiTranslation;
    },

    delete: async (formPath: string, id: number, accessToken: string): Promise<string> => {
      const response = await fetchWithErrorHandling(
        `${formsApiTranslationsUrl}/${formPath}/${translationsPath}/${id}`,
        {
          method: 'DELETE',
          headers: createHeaders(accessToken),
        },
      );
      return response.status;
    },
  };
};

export default createFormTranslationsService;
