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

const activeTaskClient = {
  getActiveTasks,
};

export default activeTaskClient;
