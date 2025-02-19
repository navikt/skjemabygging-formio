import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
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
      feedbackEmit.success(`Opprettet skjema ${form.title}`);
      return result;
    } catch (error: any) {
      const message = error?.message;
      const status = error?.status;
      logger?.error(`Failed to create form: ${baseUrl}`, { message });
      if (status === 409) {
        feedbackEmit.error('Skjemanummer er allerede i bruk. Velg et annet skjemanummer.');
        return;
      }
      feedbackEmit.error(`Feil ved oppretting av skjema. ${message}`);
    }
  };

  const put = async (form: Form): Promise<Form | undefined> => {
    const { path } = form;
    const url = `${baseUrl}/${path}`;
    try {
      logger?.info(`Updating form with id ${form.id}: ${url}`);
      const result = await http.put<Form>(url, form);
      logger?.info(`Successfully updated form with id ${form.id}: ${url}`);
      feedbackEmit.success(`Lagret skjema ${form.title}`);
      return result;
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to update form: ${url}`, { message });
      feedbackEmit.error(`Feil ved oppdatering av skjema. ${message}`);
    }
  };

  const postLockForm = async (formPath: string, reason: string) => {
    const url = `/api/forms/${formPath}/lock`;
    try {
      logger?.info(`Locking form with path ${formPath}: ${url}`);
      const result = await http.post<Form>(url, { reason });
      logger?.info(`Successfully locked form with path ${formPath}: ${url}`);
      feedbackEmit.success(`Skjemaet ble låst for redigering`);
      return result;
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to lock form: ${url}`, { message });
      feedbackEmit.error(`Feil ved låsing av skjema. ${message}`);
    }
  };

  const deleteLockForm = async (formPath: string) => {
    const url = `/api/forms/${formPath}/lock`;
    try {
      logger?.info(`Unlocking form with path ${formPath}: ${url}`);
      const result = await http.delete<Form>(url);
      logger?.info(`Successfully unlocked form with path ${formPath}: ${url}`);
      feedbackEmit.success(`Skjemaet ble åpnet for redigering`);
      return result;
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to unlock form: ${url}`, { message });
      feedbackEmit.error(`Feil ved opplåsing av skjema. ${message}`);
    }
  };

  const getPublished = async (formPath: string): Promise<Form | undefined> => {
    const url = `/api/form-publications/${formPath}`;
    try {
      logger?.info(`Fetching published form from ${url}`);
      return await http.get<Form>(url);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to fetch published form from ${url}`, { message });
      feedbackEmit.error(`Feil ved henting av publisert skjema. ${message}`);
    }
  };

  const publish = async (form: Form, languages: TranslationLang[]) => {
    const { path, revision } = form;
    const languageCodes = languages.toString();
    const searchParams = new URLSearchParams({
      languageCodes,
      revision: revision!.toString(),
    });
    const url = `/api/form-publications/${path}?${searchParams}`;
    try {
      const result = await http.post<{ form: Form; changed: boolean }>(url, {});
      feedbackEmit.success('Satt i gang publisering, dette kan ta noen minutter.');
      return result.form;
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Publisering av skjema feilet. ${message}`);
    }
  };

  const unpublish = async (formPath: string) => {
    const url = `/api/form-publications/${formPath}`;
    try {
      const result = await http.delete<{ form: Form; changed: boolean }>(url, {});
      feedbackEmit.success('Satt i gang avpublisering, dette kan ta noen minutter.');
      return result.form;
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Avpublisering av skjema feilet. ${message}`);
    }
  };

  return {
    getAll,
    get,
    post,
    put,
    postLockForm,
    deleteLockForm,
    publish,
    unpublish,
    getPublished,
  };
};

export default useFormsApiForms;
