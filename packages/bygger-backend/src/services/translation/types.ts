import {
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  PublishedTranslations,
} from '@navikt/skjemadigitalisering-shared-domain';

type FormTranslationPostBody = Pick<FormsApiFormTranslation, 'key' | 'nb' | 'nn' | 'en' | 'globalTranslationId'>;
type FormTranslationPutBody = Pick<FormsApiFormTranslation, 'nb' | 'nn' | 'en' | 'globalTranslationId'>;
type GlobalTranslationPostBody = Pick<FormsApiGlobalTranslation, 'key' | 'tag' | 'nb' | 'nn' | 'en'>;
type GlobalTranslationPutBody = Pick<FormsApiGlobalTranslation, 'nb' | 'nn' | 'en'>;

type FormTranslationService = {
  get: (formPath: string) => Promise<FormsApiFormTranslation[]>;
  post: (formPath: string, body: FormTranslationPostBody, accessToken: string) => Promise<FormsApiFormTranslation>;
  put: (
    formPath: string,
    id: string,
    body: FormTranslationPutBody,
    revision: number,
    accessToken: string,
  ) => Promise<FormsApiFormTranslation>;
};

type GlobalTranslationService = {
  get: () => Promise<FormsApiGlobalTranslation[]>;
  post: (body: GlobalTranslationPostBody, accessToken: string) => Promise<FormsApiGlobalTranslation>;
  put: (
    id: string,
    body: GlobalTranslationPutBody,
    revision: number,
    accessToken: string,
  ) => Promise<FormsApiGlobalTranslation>;
  publish: (accessToken: string) => Promise<void>;
  getPublished: (languageCodes: Array<'nn' | 'en'>, accessCode: string) => Promise<PublishedTranslations>;
};

export type {
  FormTranslationPostBody,
  FormTranslationPutBody,
  FormTranslationService,
  GlobalTranslationPostBody,
  GlobalTranslationPutBody,
  GlobalTranslationService,
};
