import { Form, PublishedTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import { BulkPublicationResult, FormPublication, FormPublicationResult, FormPublicationsService } from './types';

const createFormPublicationsService = (formsApiUrl: string): FormPublicationsService => {
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
    languages: TranslationLang[] | undefined,
    revision: number,
    accessToken: string,
  ): Promise<Form> => {
    const searchParams = new URLSearchParams(
      languages ? { languageCodes: languages.toString() } : { skipTranslations: 'true' },
    );
    const response = await fetchWithErrorHandling(`${url}/${formPath}?${searchParams}`, {
      method: 'POST',
      headers: createHeaders(accessToken, revision),
    });
    return response.data as Form;
  };

  const postAll = async (formPublication: FormPublication[], accessToken: string): Promise<BulkPublicationResult> => {
    const result: FormPublicationResult[] = [];
    for (const form of formPublication) {
      try {
        const publishedForm = await post(form.path, undefined, form.revision!, accessToken);
        result.push({
          form: { path: publishedForm.path, revision: publishedForm.revision! },
          status: 'ok',
        });
      } catch (err: any) {
        const errorMessage = err.bodyErrorMessage || err.response.statusText || 'Ukjent feil';
        result.push({
          form: { path: form.path, revision: form.revision! },
          status: 'error',
          message: errorMessage,
        });
      }
    }
    return Promise.resolve(result);
  };

  const unpublish = async (formPath: string, accessToken: string): Promise<void> => {
    await fetchWithErrorHandling(`${url}/${formPath}`, {
      method: 'DELETE',
      headers: createHeaders(accessToken),
    });
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
    postAll,
    unpublish,
    getTranslations,
  };
};

export default createFormPublicationsService;
