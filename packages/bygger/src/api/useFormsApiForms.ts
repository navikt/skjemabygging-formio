import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import { overwriteForm } from '../import/api';

const useFormsApiForms = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const { logger } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms';

  const getAll = async (select?: string): Promise<Form[]> => {
    try {
      const url = select ? `${baseUrl}?${new URLSearchParams({ select })}` : baseUrl;
      logger?.debug(`Fetching all forms from ${url}`);
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
      logger?.debug(`Fetching form from ${url}`);
      return await http.get<Form>(url);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to fetch form from ${url}`, { message });
      feedbackEmit.error(`Feil ved henting av skjema. ${message}`);
    }
  };

  const post = async (form: Form): Promise<Form | undefined> => {
    try {
      logger?.debug(`Creating new form: ${baseUrl}`);
      const result = await http.post<Form>(baseUrl, form);
      logger?.debug(`Successfully created form with id ${result.id} and path ${result.path}`);
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
      logger?.debug(`Updating form with id ${form.id}: ${url}`);
      const result = await http.put<Form>(url, form);
      logger?.debug(`Successfully updated form with id ${form.id}: ${url}`);
      feedbackEmit.success(`Lagret skjema ${form.title}`);
      return result;
    } catch (error: any) {
      const message = error?.message;
      const status = error?.status;
      logger?.error(`Failed to update form: ${url}`, { message });
      if (status === 409) {
        feedbackEmit.error('Skjemaet kan ikke oppdateres akkurat nå. Du kan prøve å laste siden på nytt.');
        return;
      }
      feedbackEmit.error(`Feil ved oppdatering av skjema. ${message}`);
    }
  };

  const resetForm = async (formPath: string, revision: number): Promise<Form | undefined> => {
    const searchParams = new URLSearchParams({
      revision: revision.toString(),
    });
    const url = `${baseUrl}/${formPath}/reset?${searchParams}`;
    try {
      logger?.debug(`Resetting form with id ${formPath}: ${url}`);
      const result = await http.delete<Form>(url, {});
      logger?.debug(`Successfully reset form with id ${formPath}: ${url}`);
      feedbackEmit.success(`Endringer i skjemaet er forkastet`);
      return result;
    } catch (error: any) {
      const message = error?.message;
      const status = error?.status;
      if (status === 409) {
        feedbackEmit.error('Endringer kan ikke forkastes. Du kan prøve å laste siden på nytt.');
        return;
      }
      feedbackEmit.error(`Feil ved tilbakestilling av skjema. ${message}`);
    }
  };

  const postLockForm = async (formPath: string, reason: string) => {
    const url = `/api/forms/${formPath}/lock`;
    try {
      logger?.debug(`Locking form with path ${formPath}: ${url}`);
      const result = await http.post<Form>(url, { reason });
      logger?.debug(`Successfully locked form with path ${formPath}: ${url}`);
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
      logger?.debug(`Unlocking form with path ${formPath}: ${url}`);
      const result = await http.delete<Form>(url);
      logger?.debug(`Successfully unlocked form with path ${formPath}: ${url}`);
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
      logger?.debug(`Fetching published form from ${url}`);
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

  const deleteForm = async (form: Form) => {
    const url = `/api/forms/${form.path}`;
    try {
      logger?.debug(`Delete form with path ${form.path}: ${url}`);
      const searchParams = new URLSearchParams({
        revision: form.revision!.toString(),
      });
      await http.delete(`${url}?${searchParams}`);
      logger?.debug(`Successfully deleted form with path ${form.path}: ${url}`);
      return { success: true };
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to unlock form: ${url}`, { message });
      feedbackEmit.error(`Feil ved sletting av skjema. ${message}`);
      return { success: false };
    }
  };

  const copyFromProd = async (formPath: string): Promise<Form | undefined> => {
    try {
      const form = await overwriteForm(formPath);
      feedbackEmit.success('Skjemaet er kopiert fra produksjon.');
      return form;
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Kopiering fra produksjon feilet. ${message}`);
      return undefined;
    }
  };

  return {
    getAll,
    get,
    post,
    put,
    resetForm,
    postLockForm,
    deleteLockForm,
    publish,
    unpublish,
    deleteForm,
    getPublished,
    copyFromProd,
  };
};

export default useFormsApiForms;
