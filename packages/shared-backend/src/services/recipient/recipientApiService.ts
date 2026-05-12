import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const recipientsUrl = 'v1/recipients';

interface GetRecipientsProps {
  baseUrl: string;
}

const getRecipients = async (props: GetRecipientsProps) => {
  const { baseUrl } = props;
  logger.info('Get recipients');

  return await http.get<Recipient[]>(`${baseUrl}/${recipientsUrl}`);
};

interface GetRecipientProps {
  baseUrl: string;
  recipientId: string;
}

const getRecipient = async (props: GetRecipientProps) => {
  const { baseUrl, recipientId } = props;
  logger.info(`Get recipient ${recipientId}`);

  return await http.get<Recipient>(`${baseUrl}/${recipientsUrl}/${recipientId}`);
};

const recipientApiService = {
  getRecipients,
  getRecipient,
};

export default recipientApiService;
