import { attachment, email, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const emailDeprecatedForm = () =>
  form({
    title: 'Basic form',
    formNumber: 'eml123456',
    path: 'eml123456',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          email({
            key: 'epost',
            label: 'E-post',
          }),
        ],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              nei: {
                enabled: true,
              },
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              ettersender: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
                showDeadline: false,
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              harIkke: {
                additionalDocumentation: {},
                enabled: false,
              },
              andre: {
                additionalDocumentation: {},
                enabled: false,
              },
              nav: {
                additionalDocumentation: {},
                enabled: false,
              },
            },
            key: 'husleiekontrakt',
            label: 'Husleiekontrakt',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              ettersender: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
                showDeadline: false,
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              harIkke: {
                additionalDocumentation: {},
                enabled: false,
              },
              andre: {
                additionalDocumentation: {},
                enabled: false,
              },
              nav: {
                additionalDocumentation: {},
                enabled: false,
              },
            },
            key: 'veterinaerutgifter',
            label: 'Veterinærutgifter',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              ettersender: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
                showDeadline: false,
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              harIkke: {
                additionalDocumentation: {},
                enabled: false,
              },
              andre: {
                additionalDocumentation: {},
                enabled: false,
              },
              nav: {
                additionalDocumentation: {},
                enabled: false,
              },
            },
            key: 'vitnemal',
            label: 'Vitnemål',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'eml123456', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const emailDeprecatedTranslations = () => getMockTranslationsFromForm(emailDeprecatedForm());

export { emailDeprecatedForm, emailDeprecatedTranslations };
