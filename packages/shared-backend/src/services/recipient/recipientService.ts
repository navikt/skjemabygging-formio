import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import recipientClient from './recipientClient';

type RecipientClient = Pick<typeof recipientClient, 'getRecipients'>;

interface GetRecipientsProps {
  recipientId?: string;
}

type RecipientService = {
  getRecipients: (props: GetRecipientsProps) => Promise<Recipient[]>;
};

interface CreateRecipientServiceProps {
  baseUrl: string;
  client?: RecipientClient;
}

const createRecipientService = ({
  baseUrl,
  client = recipientClient,
}: CreateRecipientServiceProps): RecipientService => {
  const getRecipients = async (props: GetRecipientsProps): Promise<Recipient[]> => {
    const { recipientId } = props;

    if (!recipientId) {
      return [];
    }

    return await client.getRecipients({ baseUrl });
  };

  return {
    getRecipients,
  };
};

export { createRecipientService };
export type { RecipientService };
