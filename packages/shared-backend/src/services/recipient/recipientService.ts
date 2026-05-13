import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import recipientApiService from './recipientApiService';

interface GetRecipientProps {
  baseUrl: string;
  recipientId?: string;
}

const getRecipient = async (props: GetRecipientProps): Promise<Recipient | undefined> => {
  const { baseUrl, recipientId } = props;

  if (!recipientId) {
    return undefined;
  }

  return await recipientApiService.getRecipient({ baseUrl, recipientId });
};

const recipientService = {
  getRecipient,
};

export default recipientService;
