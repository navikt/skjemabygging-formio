import { Form } from '@navikt/skjemadigitalisering-shared-domain';

type FormPostBody = Pick<Form, 'skjemanummer' | 'title' | 'components' | 'properties'>;
type FormPutBody = Pick<Form, 'title' | 'components' | 'properties' | 'introPage'>;

interface FormsService {
  getAll: <T extends Partial<Form>>(select?: string) => Promise<Array<T>>;
  get: (formPath: string) => Promise<Form>;
  post: (body: FormPostBody, accessToken: string) => Promise<Form>;
  put: (formPath: string, body: FormPutBody, revision: number, accessToken: string) => Promise<Form>;
  resetForm: (formPath: string, revision: number, accessToken: string) => Promise<Form>;
  deleteForm: (formPath: string, revision: number, accessToken: string) => Promise<void>;
  postLockForm: (formPath: string, reason: string, accessToken: string) => Promise<Form>;
  deleteLockForm: (formPath: string, accessToken: string) => Promise<Form>;
  formsUrl: string;
}

export type { FormPostBody, FormPutBody, FormsService };
