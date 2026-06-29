import { PrefillData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import prefillClient from './prefillClient';

type PrefillClient = Pick<typeof prefillClient, 'getPrefillData'>;

interface GetPrefillDataProps {
  accessToken: string;
  properties?: string;
}

type PrefillService = {
  getPrefillData: (props: GetPrefillDataProps) => Promise<PrefillData>;
};

interface CreatePrefillServiceProps {
  baseUrl: string;
  client?: PrefillClient;
}

const prefillErrorMessage = 'Feil ved kall til SendInn for preutfylling';

const createPrefillService = ({ baseUrl, client = prefillClient }: CreatePrefillServiceProps): PrefillService => {
  const getPrefillData = async ({ accessToken, properties }: GetPrefillDataProps): Promise<PrefillData> => {
    try {
      return await client.getPrefillData({ accessToken, baseUrl, properties });
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new ResponseError(error.errorCode, prefillErrorMessage, error.correlationId, prefillErrorMessage);
      }

      throw error;
    }
  };

  return {
    getPrefillData,
  };
};

export { createPrefillService };
export type { PrefillService };
