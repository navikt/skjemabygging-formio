import { attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const attachmentDeprecatedForm = () =>
  form({
    title: 'Attachments test',
    formNumber: 'attachments',
    path: 'attachments',
    components: [
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              nei: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              ettersender: {
                enabled: true,
                showDeadline: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Ledetekst tilleggsinformasjon',
                  description: 'Beskrivelse av krav til tilleggsinformasjon',
                },
              },
            },
            key: 'vedlegg1',
            label: 'Ny vedleggskomponent',
          }),
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              nav: {
                enabled: false,
                additionalDocumentation: {},
              },
              andre: {
                enabled: false,
                additionalDocumentation: {},
              },
              harIkke: {
                enabled: false,
                additionalDocumentation: {},
              },
              ettersender: {
                enabled: false,
              },
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              levertTidligere: {
                enabled: false,
              },
            },
            key: 'vedlegg-med-ett-valg',
            label: 'Vedlegg med ett valg',
          }),
          attachment({
            key: 'oldAttachment',
            label: 'Gammel radio komponent',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'attachments', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const attachmentDeprecatedTranslations = () => getMockTranslationsFromForm(attachmentDeprecatedForm());

export { attachmentDeprecatedForm, attachmentDeprecatedTranslations };
