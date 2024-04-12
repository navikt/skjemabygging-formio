import { FormPropertiesType, Language, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

export type NavFormMinimal = Pick<NavFormType, 'path' | 'title'> & {
  properties: Pick<FormPropertiesType, 'skjemanummer'>;
};

export interface CopyService {
  form: (path: string, token: string, username: string) => Promise<NavFormType>;
  globalTranslations: (language: Language, token: string) => Promise<void>;
  getSourceForms: () => Promise<NavFormMinimal[]>;
}
