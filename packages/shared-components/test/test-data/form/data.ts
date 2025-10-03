import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

export const defaultFormProperties = {
  skjemanummer: 'NAV 10-11.13',
  tema: 'BIL',
  innsending: undefined,
  hasLabeledSignatures: false,
  signatures: undefined,
};

export const defaultForm = {
  title: 'Mitt testskjema',
  path: 'testskjema',
  properties: {
    ...defaultFormProperties,
  },
  components: [],
} as unknown as NavFormType;

export const defaultFormWithAttachment = {
  ...defaultForm,
  components: [
    {
      title: 'Vedlegg',
      key: 'vedlegg',
      type: 'panel',
      components: [
        {
          label: 'Annen dokumentasjon',
          description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
          key: 'annenDokumentasjon',
          properties: {
            vedleggstittel: 'Annet',
            vedleggskode: 'N6',
          },
          otherDocumentation: true,
        },
      ],
      isAttachmentPanel: true,
    },
  ],
} as unknown as NavFormType;
