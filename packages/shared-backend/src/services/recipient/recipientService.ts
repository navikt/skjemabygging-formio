import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import recipientClient from './recipientClient';

type RecipientClient = Pick<typeof recipientClient, 'getRecipient' | 'getRecipients'>;

interface GetRecipientProps {
  recipientId?: string;
}

type RecipientService = {
  getRecipients: () => Promise<Recipient[]>;
  getRecipient: (props: GetRecipientProps) => Promise<Recipient | undefined>;
};

interface CreateRecipientServiceProps {
  baseUrl: string;
  client?: RecipientClient;
}

const createRecipientService = ({
  baseUrl,
  client = recipientClient,
}: CreateRecipientServiceProps): RecipientService => {
  const getRecipients = async (): Promise<Recipient[]> => {
    return await client.getRecipients({ baseUrl });
  };

  const getRecipient = async (props: GetRecipientProps): Promise<Recipient | undefined> => {
    const { recipientId } = props;

    if (!recipientId) {
      return undefined;
    }

    return await client.getRecipient({ baseUrl, recipientId });
  };

  return {
    getRecipients,
    getRecipient,
  };
};

export { createRecipientService };
export type { RecipientService };
