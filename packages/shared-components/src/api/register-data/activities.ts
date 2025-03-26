import { AppConfigContextType } from '../../context/config/configContext';

const getActivities = async (appConfig: AppConfigContextType) => {
  const { http, baseUrl } = appConfig;

  return http?.get<any>(`${baseUrl}/api/register-data/activities`);
};

export { getActivities };
