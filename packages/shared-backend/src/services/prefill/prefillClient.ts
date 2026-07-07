import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const prefillDataPath = '/fyllUt/v1/prefill-data';

interface GetPrefillDataProps {
  accessToken: string;
  baseUrl: string;
  properties?: string;
}

const getPrefillData = async ({ accessToken, baseUrl, properties }: GetPrefillDataProps): Promise<PrefillData> => {
  logger.info('Get prefill data');

  const url = properties
    ? `${baseUrl}${prefillDataPath}?properties=${encodeURIComponent(properties)}`
    : `${baseUrl}${prefillDataPath}`;

  return await http.get<PrefillData>(url, {
    accessToken,
  });
};

const prefillClient = {
  getPrefillData,
};

export default prefillClient;
