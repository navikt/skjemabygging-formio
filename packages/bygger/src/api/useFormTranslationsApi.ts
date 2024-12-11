import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import { TranslationError } from '../context/translations/types';

const useFormTranslationsApi = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms-api/translations';

  const get = async (formPath: string): Promise<FormsApiFormTranslation[] | undefined> => {
    try {
      return await http.get<FormsApiFormTranslation[]>(`${baseUrl}/${formPath}`);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av oversettelser ${message}`);
    }
  };

  const post = async (
    formPath: string,
    translation: FormsApiFormTranslation,
  ): Promise<FormsApiFormTranslation | TranslationError> => {
    try {
      const { key, nb = null, nn = null, en = null, globalTranslationId } = translation;
      return await http.post<FormsApiFormTranslation>(`${baseUrl}/${formPath}`, {
        key,
        nb,
        nn,
        en,
        globalTranslationId,
      });
    } catch (error: any) {
      if (error?.status === 409) {
        return { type: 'CONFLICT', key: translation.key };
      }
      const message = (error as Error)?.message;
      feedbackEmit.error(
        `Feil ved oppretting av oversettelse med nøkkel ${translation.key} for skjema ${formPath}. ${message}`,
      );
      return { type: 'OTHER_HTTP', key: translation.key };
    }
  };

  const put = async (
    formPath: string,
    translation: FormsApiFormTranslation,
  ): Promise<FormsApiFormTranslation | TranslationError> => {
    try {
      const { id, revision, nb = null, nn = null, en = null, globalTranslationId } = translation;
      return await http.put<FormsApiFormTranslation>(`${baseUrl}/${formPath}/${id}`, {
        revision,
        nb,
        nn,
        en,
        globalTranslationId,
      });
    } catch (error: any) {
      if (error?.status === 409) {
        return { type: 'CONFLICT', key: translation.key };
      }
      const message = (error as Error)?.message;
      feedbackEmit.error(
        `Feil ved oppdatering av oversettelse med nøkkel ${translation.key} for skjema ${formPath}. ${message}`,
      );
      return { type: 'OTHER_HTTP', key: translation.key };
    }
  };

  return {
    get,
    post,
    put,
  };
};

export default useFormTranslationsApi;
