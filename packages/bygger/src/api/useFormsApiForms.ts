import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

const mapFormToNavForm = (form: Form): NavFormType => {
  const { title } = form;

  return {
    tags: [],
    display: 'wizard',
    name: title,
    type: 'form',
    ...form,
  };
};

const mapNavFormToForm = (form: NavFormType): Form => {
  const { id, revision, path, title, components, properties, createdAt, createdBy, changedAt, changedBy } = form;
  return {
    id,
    revision,
    skjemanummer: properties.skjemanummer,
    path,
    title,
    components,
    properties,
    createdAt,
    createdBy,
    changedAt,
    changedBy,
  };
};

const useFormsApiForms = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const { logger } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms';

  const getAll = async (): Promise<NavFormType[]> => {
    try {
      logger?.info(`Fetching all forms from ${baseUrl}`);
      return (await http.get<Form[]>(baseUrl)).map(mapFormToNavForm);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to fetch forms from ${baseUrl}`, { message });
      feedbackEmit.error(`Feil ved henting av skjemaer. ${message}`);
      throw error;
    }
  };

  const get = async (path: string): Promise<NavFormType | undefined> => {
    const url = `${baseUrl}/${path}`;
    try {
      logger?.info(`Fetching form from ${url}`);
      return mapFormToNavForm(await http.get<Form>(url));
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to fetch form from ${url}`, { message });
      feedbackEmit.error(`Feil ved henting av skjema. ${message}`);
    }
  };

  const post = async (form: NavFormType): Promise<NavFormType | undefined> => {
    try {
      logger?.info(`Creating new form: ${baseUrl}`);
      const mapped = mapNavFormToForm(form);
      const result = await http.post<Form>(baseUrl, mapped);
      logger?.info(`Successfully created form with id ${result.id} and path ${result.path}`);
      return mapFormToNavForm(result);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to create form: ${baseUrl}`, { message });
      feedbackEmit.error(`Feil ved oppretting av skjema. ${message}`);
    }
  };

  const put = async (form: NavFormType): Promise<NavFormType | undefined> => {
    const { path } = form;
    const url = `${baseUrl}/${path}`;
    try {
      logger?.info(`Updating form with id ${form.id}: ${url}`);
      const result = await http.put<Form>(url, mapNavFormToForm(form));
      logger?.info(`Successfully updated form with id ${form.id}: ${url}`);
      return mapFormToNavForm(result);
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error(`Failed to update form: ${url}`, { message });
      feedbackEmit.error(`Feil ved oppdatering av skjema. ${message}`);
    }
  };

  return {
    getAll,
    get,
    post,
    put,
  };
};

export default useFormsApiForms;
