import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import ApiError from './ApiError';

const useFormTranslationsApi = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;
  const getPath = (formPath: string) => `/api/forms/${formPath}/translations`;

  const get = async (formPath: string): Promise<FormsApiTranslation[] | undefined> => {
    try {
      return await http.get<FormsApiTranslation[]>(getPath(formPath));
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av oversettelser ${message}`);
    }
  };

  const post = async (formPath: string, translation: FormsApiTranslation): Promise<FormsApiTranslation> => {
    try {
      const { key, nb = null, nn = null, en = null, globalTranslationId } = translation;
      return await http.post<FormsApiTranslation>(getPath(formPath), {
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

  const put = async (formPath: string, translation: FormsApiTranslation): Promise<FormsApiTranslation> => {
    try {
      const { id, revision, nb = null, nn = null, en = null, globalTranslationId } = translation;
      return await http.put<FormsApiTranslation>(`${getPath(formPath)}/${id}`, {
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
      feedbackEmit.success(`Oversettelse med id ${id} for skjema ${formPath} ble slettet`);
      return true;
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved sletting av oversettelse med id ${id} for skjema ${formPath}. ${message}`);
      return false;
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
