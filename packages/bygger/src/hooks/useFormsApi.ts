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

  const postRecipient = async (recipient: Recipient): Promise<Recipient | undefined> => {
    try {
      return await http.post<Recipient>('/api/recipients', recipient);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppretting av ny mottaker. ${message}`);
    }
  };

  const putRecipient = async (recipient: Recipient): Promise<Recipient | undefined> => {
    const { recipientId, ...updatedRecipient } = recipient;
    try {
      return await http.put<Recipient>(`/api/recipients/${recipientId}`, updatedRecipient);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppdatering av mottaker. ${message}`);
    }
  };

  const recipientsApi = {
    getAll: getAllRecipients,
    post: postRecipient,
    put: putRecipient,
  };

  return {
    recipientsApi,
  };
};
export default useFormsApi;
