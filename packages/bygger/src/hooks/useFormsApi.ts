import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

const useFormsApi = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;

  const getAllRecipients = async (): Promise<Recipient[] | undefined> => {
    try {
      return await http.get<Recipient[]>('/api/recipients');
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av mottakere. ${message}`);
    }
  };

  const recipientsApi = {
    getAll: getAllRecipients,
  };

  return {
    recipientsApi,
  };
};
export default useFormsApi;
