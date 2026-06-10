import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import registerDataClient from './registerDataClient';
import { RegisterDataQuery, UpstreamActivity } from './types';

type RegisterDataClient = Pick<typeof registerDataClient, 'getActivities'>;

interface GetActivitiesProps {
  accessToken: string;
  query?: RegisterDataQuery;
}

type RegisterDataService = {
  getActivities: (props: GetActivitiesProps) => Promise<Activity[]>;
};

interface CreateRegisterDataServiceProps {
  baseUrl: string;
  client?: RegisterDataClient;
}

const mapActivities = (response: UpstreamActivity): Activity[] =>
  response.map(({ id, tekst, type }) => ({ value: id, label: tekst, type }));

const createRegisterDataService = ({
  baseUrl,
  client = registerDataClient,
}: CreateRegisterDataServiceProps): RegisterDataService => {
  const getActivities = async ({ accessToken, query }: GetActivitiesProps): Promise<Activity[]> => {
    const activities = await client.getActivities({ baseUrl, accessToken, query });
    logger.info(`Fetched ${activities.length} activities from Tilleggsstonader`);

    return mapActivities(activities);
  };

  return {
    getActivities,
  };
};

export { createRegisterDataService };
export type { RegisterDataService };
