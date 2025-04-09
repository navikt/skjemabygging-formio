import { Activity } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

const getActivities = async (appConfig: AppConfigContextType, params: Record<string, string> = {}) => {
  const { http, baseUrl } = appConfig;
  const queryParams = new URLSearchParams(params).toString();

  return http?.get<Activity[]>(`${baseUrl}/api/register-data/activities${queryParams ? `?${queryParams}` : ''}`);
};

export { getActivities };
