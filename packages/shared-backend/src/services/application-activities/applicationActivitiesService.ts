import { ResponseError, SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import applicationActivitiesClient from './applicationActivitiesClient';

type ApplicationActivitiesClient = Pick<typeof applicationActivitiesClient, 'getActivities'>;

interface CreateApplicationActivitiesServiceProps {
  baseUrl: string;
  client?: ApplicationActivitiesClient;
}

interface GetActivitiesProps {
  accessToken: string;
  dagligreise?: boolean;
  innsendingsId?: string;
}

type ApplicationActivitiesService = {
  getActivities: (props: GetActivitiesProps) => Promise<SendInnAktivitet[]>;
};

const activitiesErrorMessage = 'Feil ved henting av aktiviteter';

const createApplicationActivitiesService = ({
  baseUrl,
  client = applicationActivitiesClient,
}: CreateApplicationActivitiesServiceProps): ApplicationActivitiesService => {
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
    getActivities,
  };
};

export { createApplicationActivitiesService };
export type { ApplicationActivitiesService };
