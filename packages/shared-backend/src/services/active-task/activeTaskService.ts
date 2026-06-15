import activeTaskClient from './activeTaskClient';
import type { ActiveTask, SendInnAktivitet, UpstreamActiveTask } from './activeTaskTypes';

type ActiveTaskClient = Pick<typeof activeTaskClient, 'getActiveTasks' | 'getActivities'>;

interface CreateActiveTaskServiceProps {
  baseUrl: string;
  activitiesPath: string;
  client?: ActiveTaskClient;
}

interface GetActiveTasksProps {
  accessToken: string;
  skjemanummer: string;
  soknadsTyper?: Array<'soknad' | 'ettersendelse'>;
}

interface GetActivitiesProps {
  accessToken: string;
  dagligreise?: boolean;
  innsendingsId?: string;
}

type ActiveTaskService = {
  getActiveTasks: (props: GetActiveTasksProps) => Promise<ActiveTask[]>;
  getActivities: (props: GetActivitiesProps) => Promise<SendInnAktivitet[]>;
};

const mapToActiveTask = ({ skjemanr, innsendingsId, endretDato, soknadstype }: UpstreamActiveTask): ActiveTask => ({
  skjemanr,
  innsendingsId,
  endretDato,
  soknadstype,
});

const createActiveTaskService = ({
  baseUrl,
  activitiesPath,
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

  const getActivities = async ({ accessToken, dagligreise, innsendingsId }: GetActivitiesProps) =>
    await client.getActivities({
      accessToken,
      activitiesPath,
      baseUrl,
      dagligreise,
      innsendingsId,
    });

  return {
    getActiveTasks,
    getActivities,
  };
};

export { createActiveTaskService };
export type { ActiveTaskService };
