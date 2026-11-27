import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const prefillDataPath = '/fyllUt/v1/prefill-data';

interface GetPrefillDataProps {
  accessToken: string;
  baseUrl: string;
  properties?: string;
  timeoutMs: number;
}

const getPrefillData = async ({
  accessToken,
  baseUrl,
  properties,
  timeoutMs,
}: GetPrefillDataProps): Promise<PrefillData> => {
  const url = properties
    ? `${baseUrl}${prefillDataPath}?properties=${encodeURIComponent(properties)}`
    : `${baseUrl}${prefillDataPath}`;
  logger.info('Getting prefill data', { targetUrl: url });

  return await http.get<PrefillData>(url, {
    accessToken,
    signal: AbortSignal.timeout(timeoutMs),
  });
};

const prefillClient = {
  getPrefillData,
};

export default prefillClient;
