import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import tilleggsstonaderClient from './tilleggsstonaderClient';
import { RegisterDataQuery, UpstreamActivity } from './types';

type TilleggsstonaderClient = Pick<typeof tilleggsstonaderClient, 'getActivities'>;

interface GetActivitiesProps {
  accessToken: string;
  query?: RegisterDataQuery;
}

type RegisterDataService = {
  getActivities: (props: GetActivitiesProps) => Promise<Activity[]>;
};

interface CreateRegisterDataServiceProps {
  tilleggsstonaderBaseUrl: string;
  client?: TilleggsstonaderClient;
}

const mapActivities = (response: UpstreamActivity): Activity[] =>
  response.map(({ id, tekst, type }) => ({ value: id, label: tekst, type }));

const createRegisterDataService = ({
  tilleggsstonaderBaseUrl,
  client = tilleggsstonaderClient,
}: CreateRegisterDataServiceProps): RegisterDataService => {
  const getActivities = async ({ accessToken, query }: GetActivitiesProps): Promise<Activity[]> => {
    const activities = await client.getActivities({ tilleggsstonaderBaseUrl, accessToken, query });
    logger.info(`Fetched ${activities.length} activities from Tilleggsstonader`);

    return mapActivities(activities);
  };

  return {
    getActivities,
  };
};

export { createRegisterDataService };
export type { RegisterDataService };
