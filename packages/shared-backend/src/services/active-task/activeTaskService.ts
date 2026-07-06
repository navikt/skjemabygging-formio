import activeTaskClient from './activeTaskClient';
import type { ActiveTask, UpstreamActiveTask } from './activeTaskTypes';

type ActiveTaskClient = Pick<typeof activeTaskClient, 'getActiveTasks'>;

interface CreateActiveTaskServiceProps {
  baseUrl: string;
  client?: ActiveTaskClient;
}

interface GetActiveTasksProps {
  accessToken: string;
  skjemanummer: string;
  soknadsTyper?: Array<'soknad' | 'ettersendelse'>;
}

type ActiveTaskService = {
  getActiveTasks: (props: GetActiveTasksProps) => Promise<ActiveTask[]>;
};

const mapToActiveTask = ({ skjemanr, innsendingsId, endretDato, soknadstype }: UpstreamActiveTask): ActiveTask => ({
  skjemanr,
  innsendingsId,
  endretDato,
  soknadstype,
});

const createActiveTaskService = ({
  baseUrl,
  client = activeTaskClient,
}: CreateActiveTaskServiceProps): ActiveTaskService => {
  const getActiveTasks = async ({
    accessToken,
    skjemanummer,
    soknadsTyper = ['soknad', 'ettersendelse'],
  }: GetActiveTasksProps): Promise<ActiveTask[]> => {
    const tasks = await client.getActiveTasks({
      accessToken,
      baseUrl,
      skjemanummer,
      soknadsTyper,
    });

    return tasks.map(mapToActiveTask);
  };

  return {
    getActiveTasks,
  };
};

export { createActiveTaskService };
export type { ActiveTaskService };
