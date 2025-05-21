import { DataFetcherSourceId } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

const getRegisterData = <T>(
  dataFetcherSourceId: DataFetcherSourceId,
  appConfig: AppConfigContextType,
  params: Record<string, string> = {},
) => {
  const { http, baseUrl } = appConfig;
  const queryParams = new URLSearchParams(params).toString();

  return http?.get<T>(`${baseUrl}/api/register-data/${dataFetcherSourceId}${queryParams ? `?${queryParams}` : ''}`);
};

export { getRegisterData };
