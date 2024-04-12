import { FormioTranslationPayload } from '@navikt/skjemadigitalisering-shared-domain';

const en = [
  {
    _id: 'global-dev-id-1',
    form: 'dev-language-form-id',
    data: {
      name: 'global',
      scope: 'global',
      tag: 'skjematekster',
      language: 'en',
      i18n: {
        Utvikling: 'Development',
      },
    },
  } as FormioTranslationPayload,
  {
    _id: 'global-dev-id-2',
    form: 'dev-language-form-id',
    data: {
      name: 'global',
      scope: 'global',
      tag: 'validering',
      language: 'en',
      i18n: {
        minYear: '{{field}} cannot be before {{minYear}}',
      },
    },
  } as FormioTranslationPayload,
  {
    _id: 'global-dev-id-3',
    form: 'dev-language-form-id',
    data: {
      name: 'global',
      scope: 'global',
      tag: 'statiske-tekster',
      language: 'en',
      i18n: {
        Oppsummering: 'Summary',
      },
    },
  } as FormioTranslationPayload,
  {
    _id: 'global-dev-id-4',
    form: 'dev-language-form-id',
    data: {
      name: 'global',
      scope: 'global',
      tag: 'grensesnitt',
      language: 'en',
      i18n: {
        Nei: 'No',
      },
    },
  } as FormioTranslationPayload,
];

export default en as FormioTranslationPayload[];
