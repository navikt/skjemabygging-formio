import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import ApiError from './ApiError';

const useGlobalTranslationsApi = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;
  const basePath = '/api/translations';

  const get = async (): Promise<FormsApiGlobalTranslation[] | undefined> => {
    try {
      return await http.get<FormsApiGlobalTranslation[]>(basePath);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av globale oversettelser. ${message}`);
    }
  };

  const post = async (translation: FormsApiGlobalTranslation): Promise<FormsApiGlobalTranslation> => {
    try {
      const { key, tag, nb = null, nn = null, en = null } = translation;
      return await http.post<FormsApiGlobalTranslation>(basePath, { key, tag, nb, nn, en });
    } catch (error: any) {
      if (error?.status !== 409) {
        const message = (error as Error)?.message;
        feedbackEmit.error(`Feil ved oppretting av global oversettelse med nøkkel ${translation.key}. ${message}`);
      }
      throw error?.status ? new ApiError(error?.status) : new Error(error);
    }
  };

  const put = async (translation: FormsApiGlobalTranslation): Promise<FormsApiGlobalTranslation> => {
    try {
      const { id, revision, nb = null, nn = null, en = null } = translation;
      return await http.put<FormsApiGlobalTranslation>(`${basePath}/${id}`, { revision, nb, nn, en });
    } catch (error: any) {
      if (error?.status !== 409) {
        const message = (error as Error)?.message;
        feedbackEmit.error(`Feil ved oppdatering av global oversettelse med nøkkel ${translation.key}. ${message}`);
      }
      throw error?.status ? new ApiError(error?.status) : new Error(error);
    }
  };

  const publish = async () => {
    try {
      await http.post(`${basePath}/publish`, {});
      feedbackEmit.success(
        'Publisering av globale oversettelser fullført. Endringene vil bli synlige på nav.no/fyllut om noen minutter.',
      );
    } catch (error: any) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved publisering. ${message}`);
    }
  };

  const deleteTranslation = async (id: number) => {
    try {
      await http.delete(`${basePath}/${id}`);
    } catch (error: any) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved sletting av global oversettelse med id ${id}. ${message}`);
    }
  };

  return {
    get,
    post,
    put,
    publish,
    delete: deleteTranslation,
  };
};

export default useGlobalTranslationsApi;
