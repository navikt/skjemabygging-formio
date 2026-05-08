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

const recipientApiService = {
  getRecipients,
};

export default recipientApiService;
