import { Form } from '@navikt/skjemadigitalisering-shared-domain';

type FormPostBody = Pick<Form, 'skjemanummer' | 'title' | 'components' | 'properties'>;
type FormPutBody = Pick<Form, 'title' | 'components' | 'properties'>;

interface FormsService {
  getAll: (select?: string) => Promise<Form[]>;
  get: (formPath: string) => Promise<Form>;
  post: (body: FormPostBody, accessToken: string) => Promise<Form>;
  put: (formPath: string, body: FormPutBody, revision: number, accessToken: string) => Promise<Form>;
  formsUrl: string;
}

export type { FormPostBody, FormPutBody, FormsService };
