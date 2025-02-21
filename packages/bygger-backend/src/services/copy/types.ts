import { Form } from '@navikt/skjemadigitalisering-shared-domain';

export type FormMinimal = Pick<Form, 'path' | 'title' | 'skjemanummer'>;

export interface CopyService {
  form: (path: string, token: string, username: string) => Promise<Form>;
  globalTranslations: (token: string) => Promise<void>;
  getSourceForms: () => Promise<FormMinimal[]>;
}
