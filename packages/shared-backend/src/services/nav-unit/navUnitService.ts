import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import navUnitClient from './navUnitClient';

type NavUnitClient = Pick<typeof navUnitClient, 'getNavUnits'>;

type NavUnitService = {
  getNavUnits: () => Promise<Enhet[]>;
};

interface CreateNavUnitServiceProps {
  baseUrl: string;
  consumerId: string;
  client?: NavUnitClient;
}

const createNavUnitService = ({
  baseUrl,
  consumerId,
  client = navUnitClient,
}: CreateNavUnitServiceProps): NavUnitService => {
  const getNavUnits = async () => await client.getNavUnits({ baseUrl, consumerId });

  return {
    getNavUnits,
  };
};

export { createNavUnitService };
export type { NavUnitService };
