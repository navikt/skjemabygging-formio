import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

interface GetActivitiesProps {
  accessToken: string;
  baseUrl: string;
  dagligreise?: boolean;
  innsendingsId?: string;
}

const getActivities = async ({
  accessToken,
  baseUrl,
  dagligreise = false,
  innsendingsId,
}: GetActivitiesProps): Promise<SendInnAktivitet[]> => {
  logger.info('Get submission activities');

  return await http.get<SendInnAktivitet[]>(`${baseUrl}/fyllUt/v1/aktiviteter?dagligreise=${dagligreise}`, {
    accessToken,
    headers: innsendingsId ? { 'x-innsendingsid': innsendingsId } : undefined,
  });
};

const applicationActivitiesClient = {
  getActivities,
};

export default applicationActivitiesClient;
