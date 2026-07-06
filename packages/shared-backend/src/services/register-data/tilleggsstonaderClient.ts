import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import { RegisterDataQuery, UpstreamActivity } from './types';

const activitiesUrl = '/api/ekstern/aktivitet';

interface GetActivitiesProps {
  tilleggsstonaderBaseUrl: string;
  accessToken: string;
  query?: RegisterDataQuery;
}

const buildQueryString = (query?: RegisterDataQuery) => {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined) {
          params.append(key, item);
        }
      });
      return;
    }

    if (value !== undefined) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

const getActivities = async (props: GetActivitiesProps) => {
  const { tilleggsstonaderBaseUrl, accessToken, query } = props;
  logger.info('Get register data activities');

  return await http.get<UpstreamActivity>(`${tilleggsstonaderBaseUrl}${activitiesUrl}${buildQueryString(query)}`, {
    accessToken,
  });
};

const tilleggsstonaderClient = {
  getActivities,
};

export default tilleggsstonaderClient;
