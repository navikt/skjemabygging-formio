import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../context/config/configContext';

export type Task = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  status: 'Opprettet' | 'Utfylt';
};

export const getActiveTasks = (form: NavFormType): Promise<Task[]> | Task[] => {
  const appConfig = useAppConfig();
  const { http, baseUrl } = appConfig;
  return http?.get<Task[]>(`${baseUrl}/api/send-inn/aktive-opprettede-soknader/${form.properties.skjemanummer}`) ?? [];
};
