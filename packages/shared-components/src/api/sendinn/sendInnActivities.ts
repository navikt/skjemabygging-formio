import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import url from '../../util/url/url';

export const getActivities = async (
  appConfig: AppConfigContextType,
  type: 'aktivitet' | 'dagligreise',
): Promise<SendInnAktivitet[] | undefined> => {
  const { http, baseUrl } = appConfig;
  const innsendingsId = url.getUrlParam(window.location.search, 'innsendingsId') as string;

  return http?.get<any>(`${baseUrl}/api/send-inn/activities?type=${type ?? 'aktivitet'}`, {
    'x-innsendingsid': innsendingsId,
  });
};
