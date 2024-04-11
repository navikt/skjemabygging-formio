import { FormioTranslationPayload } from '@navikt/skjemadigitalisering-shared-domain';

const translations: FormioTranslationPayload[] = [
  {
    _id: '123',
    data: {
      name: 'global.nav123456',
      scope: 'local',
      form: 'nav123456',
      tag: '',
      language: 'en',
      i18n: {
        'Dette er en testmelding': 'This is a test message',
      },
    },
    project: '9',
  },
] as unknown as FormioTranslationPayload[];

export default translations;
