import { PrefillData } from '@navikt/skjemadigitalisering-shared-domain';
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

const createPrefillService = ({ baseUrl, client = prefillClient }: CreatePrefillServiceProps): PrefillService => {
  const getPrefillData = async ({ accessToken, properties }: GetPrefillDataProps): Promise<PrefillData> =>
    await client.getPrefillData({ accessToken, baseUrl, properties });

  return {
    getPrefillData,
  };
};

export { createPrefillService };
export type { PrefillService };
