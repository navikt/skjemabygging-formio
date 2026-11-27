import { ErrorCode, PrefillData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import prefillClient from './prefillClient';

type PrefillClient = Pick<typeof prefillClient, 'getPrefillData'>;

interface GetPrefillDataProps {
  accessToken: string;
  properties?: string;
  nationalIdentityNumber: string;
}

type PrefillService = {
  getPrefillData: (props: GetPrefillDataProps) => Promise<PrefillData>;
};

interface CreatePrefillServiceProps {
  baseUrl: string;
  client?: PrefillClient;
}

// Stops a hanging request in time to fall back before the user gives up waiting.
const PREFILL_TIMEOUT_MS = 10 * 1000;

const prefillErrorMessage = 'Feil ved kall til SendInn for preutfylling';

// 'ERROR' covers upstream statuses without their own code: 502 and 504, but also less common 4xx statuses such as 422.
const serverErrorCodes: ErrorCode[] = ['INTERNAL_SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'ERROR'];

const isRequested = (properties: string | undefined, property: keyof PrefillData) =>
  !!properties?.split(',').some((requested) => requested.trim() === property);

const createFallbackPrefillData = (properties: string | undefined, nationalIdentityNumber: string): PrefillData =>
  isRequested(properties, 'sokerIdentifikasjonsnummer') ? { sokerIdentifikasjonsnummer: nationalIdentityNumber } : {};

const createPrefillService = ({ baseUrl, client = prefillClient }: CreatePrefillServiceProps): PrefillService => {
  const getPrefillData = async ({
    accessToken,
    properties,
    nationalIdentityNumber,
  }: GetPrefillDataProps): Promise<PrefillData> => {
    try {
      return await client.getPrefillData({ accessToken, baseUrl, properties, timeoutMs: PREFILL_TIMEOUT_MS });
    } catch (error) {
      if (error instanceof ResponseError && !serverErrorCodes.includes(error.errorCode)) {
        throw new ResponseError(error.errorCode, prefillErrorMessage, error.correlationId, prefillErrorMessage);
      }

      logger.warn('Prefill data unavailable, falling back to national identity number from token', {
        error_code: error instanceof ResponseError ? error.errorCode : undefined,
        upstream_correlation_id: error instanceof ResponseError ? error.correlationId : undefined,
        transport_error: error instanceof ResponseError ? undefined : (error as Error)?.message,
      });
      return createFallbackPrefillData(properties, nationalIdentityNumber);
    }
  };

  return {
    getPrefillData,
  };
};

export { createPrefillService };
export type { PrefillService };
