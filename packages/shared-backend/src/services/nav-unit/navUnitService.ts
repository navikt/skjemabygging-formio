import { Enhet, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import navUnitClient from './navUnitClient';

type NavUnitClient = Pick<typeof navUnitClient, 'getNavUnits'>;

type SupportedNavUnit = Pick<Enhet, 'enhetId' | 'navn' | 'enhetNr' | 'type'>;

type NavUnitService = {
  getNavUnits: () => Promise<Enhet[]>;
  getSupportedNavUnits: () => Promise<SupportedNavUnit[]>;
};

interface CreateNavUnitServiceProps {
  baseUrl: string;
  consumerId: string;
  client?: NavUnitClient;
}

const isSupportedNavUnit = (navUnit: Enhet) =>
  navUnit.enhetNr !== '0000' && supportedEnhetstyper.includes(navUnit.type);

const pickRelevantProps = ({ enhetId, navn, enhetNr, type }: Enhet): SupportedNavUnit => ({
  enhetId,
  navn,
  enhetNr,
  type,
});

const createNavUnitService = ({
  baseUrl,
  consumerId,
  client = navUnitClient,
}: CreateNavUnitServiceProps): NavUnitService => {
  const getNavUnits = async () => await client.getNavUnits({ baseUrl, consumerId });

  const getSupportedNavUnits = async () => (await getNavUnits()).filter(isSupportedNavUnit).map(pickRelevantProps);

  return {
    getNavUnits,
    getSupportedNavUnits,
  };
};

export { createNavUnitService };
export type { NavUnitService };
