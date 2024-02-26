import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

export const getActivities = async (appConfig: AppConfigContextType): Promise<SendInnAktivitet[] | undefined> => {
  const { http, baseUrl } = appConfig;

  return http?.get<any>(`${baseUrl}/api/send-inn/activities`);
};
