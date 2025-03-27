import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

const getActivities = async (appConfig: AppConfigContextType) => {
  const { http, baseUrl } = appConfig;

  return http?.get<Activity[]>(`${baseUrl}/api/register-data/activities`);
};

export { getActivities };
