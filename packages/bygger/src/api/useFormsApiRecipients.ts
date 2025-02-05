import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

const useFormsApiRecipients = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/recipients';

  const getAll = async (): Promise<Recipient[] | undefined> => {
    try {
      return await http.get<Recipient[]>(baseUrl);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved henting av mottakere. ${message}`);
    }
  };

  const post = async (recipient: Recipient): Promise<Recipient | undefined> => {
    try {
      return await http.post<Recipient>(baseUrl, recipient);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppretting av ny mottaker. ${message}`);
    }
  };

  const put = async (recipient: Recipient): Promise<Recipient | undefined> => {
    const { recipientId, ...updatedRecipient } = recipient;
    try {
      return await http.put<Recipient>(`${baseUrl}/${recipientId}`, updatedRecipient);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved oppdatering av mottaker. ${message}`);
    }
  };

  const save = async (recipient: Recipient): Promise<Recipient | undefined> => {
    if (recipient.recipientId === undefined) {
      return await post(recipient);
    } else {
      return await put(recipient);
    }
  };

  const deleteRecipient = async (recipientId: string): Promise<void> => {
    try {
      return await http.delete(`${baseUrl}/${recipientId}`);
    } catch (error: any) {
      const message = error?.message;
      const status = error?.status;
      if (status === 405) {
        feedbackEmit.error(
          `Mottaksadressen kan ikke slettes fordi den er i bruk i ett eller flere skjemaer. ${message}`,
        );
      } else {
        feedbackEmit.error(`Feil ved sletting av mottaker. ${message}`);
      }
    }
  };

  return {
    getAll,
    post,
    put,
    save,
    deleteRecipient,
  };
};
export default useFormsApiRecipients;
