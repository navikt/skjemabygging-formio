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
  const soknadsTyperParam = soknadsTyper.map(encodeURIComponent).join(',');
  const targetUrl = `${baseUrl}/frontend/v1/skjema/${encodeURIComponent(skjemanummer)}/soknader?soknadstyper=${soknadsTyperParam}`;
  logger.info('Getting active tasks', { skjemanummer, soknadsTyper, targetUrl });

  return await http.get<UpstreamActiveTask[]>(targetUrl, {
    accessToken,
    accept: 'application/json',
  });
};

const activeTaskClient = {
  getActiveTasks,
};

export default activeTaskClient;
