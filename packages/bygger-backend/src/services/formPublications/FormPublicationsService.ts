import { Form, PublishedTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';

const createFormPublicationsService = (formsApiUrl: string) => {
  const url = `${formsApiUrl}/v1/form-publications`;

  const getAll = async (): Promise<Form[]> => {
    const response = await fetchWithErrorHandling(url, { headers: createHeaders() });
    return response.data as Form[];
  };

  const get = async (formPath: string): Promise<Form> => {
    const response = await fetchWithErrorHandling(`${url}/${formPath}`, { headers: createHeaders() });
    return response.data as Form;
  };

  const post = async (
    formPath: string,
    languages: TranslationLang[],
    revision: number,
    accessToken: string,
  ): Promise<Form> => {
    const searchParams = new URLSearchParams({ languageCodes: languages.toString() });
    const response = await fetchWithErrorHandling(`${url}/${formPath}?${searchParams}`, {
      method: 'POST',
      headers: createHeaders(accessToken, revision),
    });
    return response.data as Form;
  };

  const getTranslations = async (formPath: string, languages: TranslationLang[]): Promise<PublishedTranslations> => {
    const searchParams = new URLSearchParams({ languageCodes: languages.toString() });
    const response = await fetchWithErrorHandling(`${url}/${formPath}/translations?${searchParams}`, {
      headers: createHeaders(),
    });
    return response.data as PublishedTranslations;
  };

  return {
    getAll,
    get,
    post,
    getTranslations,
  };
};

export default createFormPublicationsService;
