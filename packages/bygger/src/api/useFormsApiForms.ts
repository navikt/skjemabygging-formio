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
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms';

  const getAll = async (): Promise<NavFormType[] | undefined> => {
    try {
      return (await http.get<Form[]>(baseUrl)).map(mapFormToNavForm);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av skjemaer. ${message}`);
    }
  };

  const get = async (path: string): Promise<NavFormType | undefined> => {
    try {
      return mapFormToNavForm(await http.get<Form>(`${baseUrl}/${path}`));
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av skjema. ${message}`);
    }
  };

  const post = async (form: NavFormType): Promise<NavFormType | undefined> => {
    try {
      const mapped = mapNavFormToForm(form);
      console.log('create', baseUrl, mapped);
      const result = await http.post<Form>(baseUrl, mapped);
      console.log('result', result);
      return mapFormToNavForm(result);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppretting av skjema. ${message}`);
    }
  };

  const put = async (form: NavFormType): Promise<NavFormType | undefined> => {
    const { path } = form;
    try {
      return mapFormToNavForm(await http.put<Form>(`${baseUrl}/${path}`, mapNavFormToForm(form)));
    } catch (error) {
      const message = (error as Error)?.message;
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
