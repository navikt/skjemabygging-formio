import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { FormTranslationPostBody, FormTranslationPutBody, FormTranslationService } from './types';
import { createHeaders } from './utils';

const createFormTranslationsService = (formsApiUrl: string): FormTranslationService => {
  const formsApiTranslationsUrl = `${formsApiUrl}/v1/forms`;
  const translationsPath = 'translations';

  return {
    get: async (formPath: string): Promise<FormsApiFormTranslation[]> => {
      const response = await fetchWithErrorHandling(`${formsApiTranslationsUrl}/${formPath}/${translationsPath}`, {
        headers: createHeaders(),
      });
      return response.data as FormsApiFormTranslation[];
    },
    post: async (
      formPath: string,
      translation: FormTranslationPostBody,
      accessToken: string,
    ): Promise<FormsApiFormTranslation> => {
      const response = await fetchWithErrorHandling(`${formsApiTranslationsUrl}/${formPath}/${translationsPath}`, {
        method: 'POST',
        headers: createHeaders(accessToken),
        body: JSON.stringify(translation),
      });
      return response.data as FormsApiFormTranslation;
    },

    put: async (
      formPath: string,
      id: string,
      body: FormTranslationPutBody,
      revision: number,
      accessToken: string,
    ): Promise<FormsApiFormTranslation> => {
      const response = await fetchWithErrorHandling(
        `${formsApiTranslationsUrl}/${formPath}/${translationsPath}/${id}`,
        {
          method: 'PUT',
          headers: createHeaders(accessToken, revision),
          body: JSON.stringify(body),
        },
      );
      return response.data as FormsApiFormTranslation;
    },
  };
};

export default createFormTranslationsService;
