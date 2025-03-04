import { Form, PublishedTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

export type FormPublicationId = Pick<Form, 'path' | 'revision'>;

export interface FormPublicationResult {
  form: FormPublicationId;
  status: 'ok' | 'error';
  message?: string;
  githubOk?: boolean;
}
export type BulkPublicationResult = FormPublicationResult[];

interface FormPublicationsService {
  getAll: () => Promise<Form[]>;
  get: (formPath: string) => Promise<Form>;
  post: (formPath: string, languages: TranslationLang[], revision: number, accessToken: string) => Promise<Form>;
  postAll: (formPaths: FormPublicationId[], accessToken: string) => Promise<BulkPublicationResult>;
  unpublish: (formPath: string, accessToken: string) => Promise<void>;
  getTranslations: (formPath: string, languages: TranslationLang[]) => Promise<PublishedTranslations>;
}

export type { FormPublicationsService };
