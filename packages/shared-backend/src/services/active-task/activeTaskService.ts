import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import activeTaskClient from './activeTaskClient';
import type { ActiveTask, SendInnAktivitet, UpstreamActiveTask } from './activeTaskTypes';

type ActiveTaskClient = Pick<typeof activeTaskClient, 'getActiveTasks' | 'getActivities'>;

interface CreateActiveTaskServiceProps {
  baseUrl: string;
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

const activitiesErrorMessage = 'Feil ved kall til SendInn for aktiviteter';

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

  const getActivities = async ({ accessToken, dagligreise, innsendingsId }: GetActivitiesProps) => {
    try {
      return await client.getActivities({
        accessToken,
        baseUrl,
        dagligreise,
        innsendingsId,
      });
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new ResponseError(error.errorCode, activitiesErrorMessage, error.correlationId, activitiesErrorMessage);
      }

      throw error;
    }
  };

  return {
    getActiveTasks,
    getActivities,
  };
};

export { createActiveTaskService };
export type { ActiveTaskService };
