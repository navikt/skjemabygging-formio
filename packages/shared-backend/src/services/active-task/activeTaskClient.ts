import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import type { UpstreamActiveTask } from './activeTaskTypes';

interface ActiveTaskBaseProps {
  accessToken: string;
  baseUrl: string;
}

interface GetActiveTasksProps extends ActiveTaskBaseProps {
  skjemanummer: string;
  soknadsTyper: Array<'soknad' | 'ettersendelse'>;
}

interface GetActivitiesProps extends ActiveTaskBaseProps {
  dagligreise?: boolean;
  innsendingsId?: string;
}

const getActiveTasks = async ({
  accessToken,
  baseUrl,
  skjemanummer,
  soknadsTyper,
}: GetActiveTasksProps): Promise<UpstreamActiveTask[]> => {
  logger.info(`Get active tasks for ${skjemanummer}`);

  return await http.get<UpstreamActiveTask[]>(
    `${baseUrl}/frontend/v1/skjema/${skjemanummer}/soknader?soknadstyper=${soknadsTyper.join(',')}`,
    {
      accessToken,
      accept: 'application/json',
    },
  );
};

const getActivities = async ({
  accessToken,
  baseUrl,
  dagligreise = false,
  innsendingsId,
}: GetActivitiesProps): Promise<SendInnAktivitet[]> => {
  logger.info('Get send-inn activities');

  return await http.get<SendInnAktivitet[]>(`${baseUrl}/fyllUt/v1/aktiviteter?dagligreise=${dagligreise}`, {
    accessToken,
    headers: innsendingsId ? { 'x-innsendingsid': innsendingsId } : undefined,
  });
};

const activeTaskClient = {
  getActiveTasks,
  getActivities,
};

export default activeTaskClient;
