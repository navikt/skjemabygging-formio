import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import { TranslationError } from '../context/translations/types';

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

  const post = async (
    translation: FormsApiGlobalTranslation,
  ): Promise<FormsApiGlobalTranslation | TranslationError> => {
    try {
      const { key, tag, nb = null, nn = null, en = null } = translation;
      return await http.post<FormsApiGlobalTranslation>(basePath, { key, tag, nb, nn, en });
    } catch (error: any) {
      if (error?.status === 409) {
        return { type: 'CONFLICT', key: translation.key };
      }
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppretting av global oversettelse med nøkkel ${translation.key}. ${message}`);
      return { type: 'OTHER_HTTP', key: translation.key };
    }
  };

  const put = async (translation: FormsApiGlobalTranslation): Promise<FormsApiGlobalTranslation | TranslationError> => {
    try {
      const { id, revision, nb = null, nn = null, en = null } = translation;
      return await http.put<FormsApiGlobalTranslation>(`${basePath}/${id}`, { revision, nb, nn, en });
    } catch (error: any) {
      if (error?.status === 409) {
        return { type: 'CONFLICT', key: translation.key };
      }
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppdatering av global oversettelse med nøkkel ${translation.key}. ${message}`);
      return { type: 'OTHER_HTTP', key: translation.key };
    }
  };

  return {
    get,
    post,
    put,
  };
};

export default useGlobalTranslationsApi;
