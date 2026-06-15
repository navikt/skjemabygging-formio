import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

interface GetPrefillDataProps {
  accessToken: string;
  baseUrl: string;
  properties?: string;
}

const getPrefillData = async ({ accessToken, baseUrl, properties }: GetPrefillDataProps): Promise<PrefillData> => {
  logger.info('Get prefill data');

  const url = properties ? `${baseUrl}?properties=${encodeURIComponent(properties)}` : baseUrl;

  return await http.get<PrefillData>(url, {
    accessToken,
  });
};

const prefillClient = {
  getPrefillData,
};

export default prefillClient;
