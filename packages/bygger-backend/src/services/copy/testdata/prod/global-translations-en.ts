import { FormioTranslationPayload } from '@navikt/skjemadigitalisering-shared-domain';

const en = [
  {
    _id: 'global-prod-id-1',
    form: 'prod-language-form-id',
    data: {
      name: 'global',
      scope: 'global',
      tag: 'skjematekster',
      language: 'en',
      i18n: {
        Produksjon: 'Production',
      },
    },
  } as FormioTranslationPayload,
  {
    _id: 'global-prod-id-2',
    form: 'prod-language-form-id',
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
    _id: 'global-prod-id-3',
    form: 'prod-language-form-id',
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
    _id: 'global-prod-id-4',
    form: 'prod-language-form-id',
    data: {
      name: 'global',
      scope: 'global',
      tag: 'grensesnitt',
      language: 'en',
      i18n: {
        Ja: 'Yes',
      },
    },
  } as FormioTranslationPayload,
];

export default en as FormioTranslationPayload[];
