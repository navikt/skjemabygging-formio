import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form, formioFormsApiUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

const useFormsApiForms = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const { logger } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms';

  const getAll = async (select?: string): Promise<Form[]> => {
    try {
      const url = select ? `${baseUrl}?${new URLSearchParams({ select })}` : baseUrl;
      logger?.info(`Fetching all forms from ${url}`);
      return await http.get<Form[]>(url);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to fetch forms from ${baseUrl}`, { message });
      feedbackEmit.error(`Feil ved henting av skjemaer. ${message}`);
      throw error;
    }
  };

  const get = async (path: string): Promise<Form | undefined> => {
    const url = `${baseUrl}/${path}`;
    try {
      logger?.info(`Fetching form from ${url}`);
      return await http.get<Form>(url);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to fetch form from ${url}`, { message });
      feedbackEmit.error(`Feil ved henting av skjema. ${message}`);
    }
  };

  const post = async (form: Form): Promise<Form | undefined> => {
    try {
      logger?.info(`Creating new form: ${baseUrl}`);
      const result = await http.post<Form>(baseUrl, form);
      logger?.info(`Successfully created form with id ${result.id} and path ${result.path}`);
      return result;
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to create form: ${baseUrl}`, { message });
      feedbackEmit.error(`Feil ved oppretting av skjema. ${message}`);
    }
  };

  const put = async (form: Form): Promise<Form | undefined> => {
    // const form = formioFormsApiUtils.mapNavFormToForm(form);
    const { path } = form;
    const url = `${baseUrl}/${path}`;
    try {
      logger?.info(`Updating form with id ${form.id}: ${url}`);
      const result = await http.put<Form>(url, form);
      logger?.info(`Successfully updated form with id ${form.id}: ${url}`);
      return result;
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to update form: ${url}`, { message });
      feedbackEmit.error(`Feil ved oppdatering av skjema. ${message}`);
    }
  };

  const publish = async (form: Form, languages: TranslationLang[]) => {
    const { path, revision } = form;
    const languageCodes = languages.length > 0 ? languages.toString() : 'nb';
    const searchParams = new URLSearchParams({
      languageCodes,
      revision: revision!.toString(),
    });
    const url = `/api/form-publications/${path}?${searchParams}`;
    try {
      const result = await http.post<Form>(url, {});
      feedbackEmit.success('Satt i gang publisering, dette kan ta noen minutter.');
      return formioFormsApiUtils.mapFormToNavForm(result);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Publisering av skjema feilet. ${message}`);
    }
  };

  return {
    getAll,
    get,
    post,
    put,
    publish,
  };
};

export default useFormsApiForms;
