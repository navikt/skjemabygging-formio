import {
  FormsApiTranslation,
  PublishedTranslations,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import { GlobalTranslationPostBody, GlobalTranslationPutBody, GlobalTranslationService } from './types';

const createGlobalTranslationService = (formsApiUrl: string): GlobalTranslationService => {
  const globalTranslationsPath = '/v1/global-translations';
  const publishedGlobalTranslationsPath = '/v1/published-global-translations';

  return {
    get: async (): Promise<FormsApiTranslation[]> => {
      const response = await fetchWithErrorHandling(`${formsApiUrl}${globalTranslationsPath}`, {
        headers: createHeaders(),
      });
      return response.data as FormsApiTranslation[];
    },
    post: async (body: GlobalTranslationPostBody, accessToken?: string): Promise<FormsApiTranslation> => {
      const response = await fetchWithErrorHandling(`${formsApiUrl}${globalTranslationsPath}`, {
        method: 'POST',
        headers: createHeaders(accessToken),
        body: JSON.stringify(body),
      });
      return response.data as FormsApiTranslation;
    },
    put: async (
      id: string,
      body: GlobalTranslationPutBody,
      revision: number,
      accessToken: string,
    ): Promise<FormsApiTranslation> => {
      const response = await fetchWithErrorHandling(`${formsApiUrl}${globalTranslationsPath}/${id}`, {
        method: 'PUT',
        headers: createHeaders(accessToken, revision),
        body: JSON.stringify(body),
      });
      return response.data as FormsApiTranslation;
    },
    publish: async (accessToken: string) => {
      await fetch(`${formsApiUrl}${globalTranslationsPath}/publish`, {
        method: 'POST',
        headers: createHeaders(accessToken),
      });
    },
    delete: async (id: string, accessToken: string): Promise<void> => {
      await fetchWithErrorHandling(`${formsApiUrl}${globalTranslationsPath}/${id}`, {
        method: 'DELETE',
        headers: createHeaders(accessToken),
      });
    },
    getPublished: async (languageCodes: TranslationLang[], accessToken: string): Promise<PublishedTranslations> => {
      const searchParams = new URLSearchParams({ languageCodes: languageCodes.toString() });
      const response = await fetchWithErrorHandling(
        `${formsApiUrl}${publishedGlobalTranslationsPath}?${searchParams}`,
        { headers: createHeaders(accessToken) },
      );
      return response.data as PublishedTranslations;
    },
  };
};

export default createGlobalTranslationService;
