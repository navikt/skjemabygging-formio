import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

export type Task = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  status: 'Opprettet' | 'Utfylt';
};

export const getActiveTasks = (form: NavFormType, config: AppConfigContextType): Promise<Task[]> | Task[] => {
  const { http, baseUrl } = config;
  return http?.get<Task[]>(`${baseUrl}/api/send-inn/aktive-opprettede-soknader/${form.properties.skjemanummer}`) ?? [];
};
