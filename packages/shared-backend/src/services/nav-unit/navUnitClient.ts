import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const navUnitsPath = 'norg2/api/v1/enhet';

interface GetNavUnitsProps {
  baseUrl: string;
  consumerId: string;
}

const getNavUnits = async ({ baseUrl, consumerId }: GetNavUnitsProps): Promise<Enhet[]> => {
  const targetUrl = `${baseUrl}/${navUnitsPath}?enhetStatusListe=AKTIV`;
  logger.info('Getting nav units', { targetUrl });

  return await http.get<Enhet[]>(targetUrl, {
    headers: { consumerId },
  });
};

const navUnitClient = {
  getNavUnits,
};

export default navUnitClient;
