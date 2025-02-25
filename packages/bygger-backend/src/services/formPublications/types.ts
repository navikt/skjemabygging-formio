import { Form, PublishedTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

interface FormPublicationsService {
  getAll: () => Promise<Form[]>;
  get: (formPath: string) => Promise<Form>;
  post: (formPath: string, languages: TranslationLang[], revision: number, accessToken: string) => Promise<Form>;
  unpublish: (formPath: string, accessToken: string) => Promise<void>;
  getTranslations: (formPath: string, languages: TranslationLang[]) => Promise<PublishedTranslations>;
}

export type { FormPublicationsService };
