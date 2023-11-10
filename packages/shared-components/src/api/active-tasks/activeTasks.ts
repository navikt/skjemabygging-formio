import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

export type Soknad = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  soknadstype: 'soknad' | 'ettersendelse';
};

export const getActiveTasks = (form: NavFormType, config: AppConfigContextType): Promise<Soknad[]> | Soknad[] => {
  const { http, baseUrl } = config;
  return (
    http?.get<Soknad[]>(`${baseUrl}/api/send-inn/aktive-opprettede-soknader/${form.properties.skjemanummer}`) ?? []
  );
};
