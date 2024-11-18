import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

const useFormsApiGlobalTranslations = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms-api/global-translations';

  const get = async (): Promise<FormsApiGlobalTranslation[] | undefined> => {
    try {
      return await http.get<FormsApiGlobalTranslation[]>(baseUrl);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av globale oversettelser. ${message}`);
    }
  };

  return {
    get,
  };
};

export default useFormsApiGlobalTranslations;
