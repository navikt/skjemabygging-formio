import { http as baseHttp, NavFormioJs, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType, Recipient } from '@navikt/skjemadigitalisering-shared-domain';
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
      const forms = await getFormsWithMottaksadresse(recipientId);
      if (forms.length > 0) {
        const skjemanummerliste = forms.map((form) => form.properties.skjemanummer).join(', ');
        feedbackEmit.error(`Mottakeren brukes i følgende skjema: ${skjemanummerliste}`);
        return;
      }
      return await http.delete(`${baseUrl}/${recipientId}`);
    } catch (error) {
      const message = (error as Error)?.message;
      feedbackEmit.error(`Feil ved sletting av mottaker. ${message}`);
    }
  };

  // Verify that no form refers to the recipient before deleting it. This check should be done in the Forms API when
  // form definitions are moved there too.
  const getFormsWithMottaksadresse = async (recipientId: string): Promise<NavFormType[]> => {
    return fetch(
      `${NavFormioJs.Formio.getProjectUrl()}/form?type=form&tags=nav-skjema&limit=1000&properties.mottaksadresseId=${recipientId}`,
      {
        method: 'GET',
      },
    ).then((forms) => forms.json());
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
