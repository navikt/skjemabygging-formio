import {
  FormsApiTranslation,
  PublishedTranslations,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';

type FormTranslationPostBody = Pick<FormsApiTranslation, 'key' | 'nb' | 'nn' | 'en' | 'globalTranslationId'>;
type FormTranslationPutBody = Pick<FormsApiTranslation, 'nb' | 'nn' | 'en' | 'globalTranslationId'>;
type GlobalTranslationPostBody = Pick<FormsApiTranslation, 'key' | 'tag' | 'nb' | 'nn' | 'en'>;
type GlobalTranslationPutBody = Pick<FormsApiTranslation, 'nb' | 'nn' | 'en'>;

type FormTranslationService = {
  get: (formPath: string) => Promise<FormsApiTranslation[]>;
  post: (formPath: string, body: FormTranslationPostBody, accessToken: string) => Promise<FormsApiTranslation>;
  put: (
    formPath: string,
    id: string,
    body: FormTranslationPutBody,
    revision: number,
    accessToken: string,
  ) => Promise<FormsApiTranslation>;
  delete: (formPath: string, id: number, accessToken: string) => Promise<string>;
};

type GlobalTranslationService = {
  get: () => Promise<FormsApiTranslation[]>;
  post: (body: GlobalTranslationPostBody, accessToken: string) => Promise<FormsApiTranslation>;
  put: (
    id: string,
    body: GlobalTranslationPutBody,
    revision: number,
    accessToken: string,
  ) => Promise<FormsApiTranslation>;
  delete: (id: string, accessToken: string) => Promise<void>;
  publish: (accessToken: string) => Promise<void>;
  getPublished: (languageCodes: TranslationLang[], accessCode: string) => Promise<PublishedTranslations>;
};

export type {
  FormTranslationPostBody,
  FormTranslationPutBody,
  FormTranslationService,
  GlobalTranslationPostBody,
  GlobalTranslationPutBody,
  GlobalTranslationService,
};
