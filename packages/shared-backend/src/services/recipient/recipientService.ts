import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import recipientApiService from './recipientApiService';

interface GetRecipientsProps {
  baseUrl: string;
  recipientId?: string;
}

const getRecipients = async (props: GetRecipientsProps): Promise<Recipient[]> => {
  const { baseUrl, recipientId } = props;

  if (!recipientId) {
    return [];
  }

  return await recipientApiService.getRecipients({ baseUrl });
};

const recipientService = {
  getRecipients,
};

export default recipientService;
