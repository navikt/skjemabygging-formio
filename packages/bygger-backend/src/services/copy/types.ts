import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

export interface CopyService {
  form: (path: string, token: string, username: string) => Promise<NavFormType>;
}
