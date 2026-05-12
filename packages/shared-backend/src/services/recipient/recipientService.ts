import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import recipientApiService from './recipientApiService';

type RecipientApiService = Pick<typeof recipientApiService, 'getRecipients'>;

interface GetRecipientsProps {
  recipientId?: string;
}

type RecipientService = {
  getRecipients: (props: GetRecipientsProps) => Promise<Recipient[]>;
};

interface CreateRecipientServiceProps {
  baseUrl: string;
  apiService?: RecipientApiService;
}

const createRecipientService = ({
  baseUrl,
  apiService = recipientApiService,
}: CreateRecipientServiceProps): RecipientService => {
  const getRecipients = async (props: GetRecipientsProps): Promise<Recipient[]> => {
    const { recipientId } = props;

    if (!recipientId) {
      return [];
    }

    return await apiService.getRecipients({ baseUrl });
  };

  return {
    getRecipients,
  };
};

export { createRecipientService };
export type { RecipientService };
