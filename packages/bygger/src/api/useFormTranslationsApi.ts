import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import ApiError from './ApiError';

const useFormTranslationsApi = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;
  const getPath = (formPath: string) => `/api/forms/${formPath}/translations`;

  const get = async (formPath: string): Promise<FormsApiFormTranslation[] | undefined> => {
    try {
      return await http.get<FormsApiFormTranslation[]>(getPath(formPath));
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av oversettelser ${message}`);
    }
  };

  const post = async (formPath: string, translation: FormsApiFormTranslation): Promise<FormsApiFormTranslation> => {
    try {
      const { key, nb = null, nn = null, en = null, globalTranslationId } = translation;
      return await http.post<FormsApiFormTranslation>(getPath(formPath), {
        key,
        nb,
        nn,
        en,
        globalTranslationId,
      });
    } catch (error: any) {
      if (error?.status !== 409) {
        const message = (error as Error)?.message;
        feedbackEmit.error(
          `Feil ved oppretting av oversettelse med nøkkel ${translation.key} for skjema ${formPath}. ${message}`,
        );
      }
      throw error?.status ? new ApiError(error?.status) : new Error(error);
    }
  };

  const put = async (formPath: string, translation: FormsApiFormTranslation): Promise<FormsApiFormTranslation> => {
    try {
      const { id, revision, nb = null, nn = null, en = null, globalTranslationId } = translation;
      return await http.put<FormsApiFormTranslation>(`${getPath(formPath)}/${id}`, {
        revision,
        nb,
        nn,
        en,
        globalTranslationId,
      });
    } catch (error: any) {
      if (error?.status !== 409) {
        const message = (error as Error)?.message;
        feedbackEmit.error(
          `Feil ved oppdatering av oversettelse med nøkkel ${translation.key} for skjema ${formPath}. ${message}`,
        );
      }
      throw error?.status ? new ApiError(error?.status) : new Error(error);
    }
  };

  const deleteTranslation = async (formPath: string, id: number) => {
    try {
      await http.delete(`${getPath(formPath)}/${id}`);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved sletting av oversettelse med id ${id} for skjema ${formPath}. ${message}`);
    }
  };

  return {
    get,
    post,
    put,
    delete: deleteTranslation,
  };
};

export default useFormTranslationsApi;
