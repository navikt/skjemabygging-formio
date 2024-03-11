import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

export const getActivities = async (
  appConfig: AppConfigContextType,
  type: 'aktivitet' | 'dagligreise',
): Promise<SendInnAktivitet[] | undefined> => {
  const { http, baseUrl } = appConfig;

  return http?.get<any>(`${baseUrl}/api/send-inn/activities?type=${type ?? 'aktivitet'}`);
};
