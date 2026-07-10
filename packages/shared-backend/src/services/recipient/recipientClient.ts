import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const recipientsUrl = 'v1/recipients';

interface GetRecipientsProps {
  baseUrl: string;
}

const getRecipients = async (props: GetRecipientsProps) => {
  const { baseUrl } = props;
  const targetUrl = `${baseUrl}/${recipientsUrl}`;
  logger.info('Getting recipients', { targetUrl });

  return await http.get<Recipient[]>(targetUrl);
};

interface GetRecipientProps {
  baseUrl: string;
  recipientId: string;
}

const getRecipient = async (props: GetRecipientProps) => {
  const { baseUrl, recipientId } = props;
  const targetUrl = `${baseUrl}/${recipientsUrl}/${recipientId}`;
  logger.info('Getting recipient', { recipientId, targetUrl });

  return await http.get<Recipient>(targetUrl);
};

const recipientClient = {
  getRecipients,
  getRecipient,
};

export default recipientClient;
