import { attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const attachmentUploadOnlyTestForm = () => {
  const formNumber = 'attachmentuploadonly';

  return form({
    title: 'Attachment upload-only component test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [],
      }),
      panel({
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            key: 'vedleggUploadOnly',
            attachmentType: 'default',
            label: 'Vedlegg upload-only',
            validate: { required: true },
            attachmentValues: {
              nav: { enabled: false, additionalDocumentation: {} },
              andre: { enabled: false, additionalDocumentation: {} },
              harIkke: { enabled: false, additionalDocumentation: {} },
              ettersender: { enabled: false, showDeadline: false, additionalDocumentation: { enabled: false } },
              leggerVedNaa: { enabled: true, additionalDocumentation: {} },
              levertTidligere: { enabled: false, additionalDocumentation: { enabled: false } },
            },
          }),
          attachment({
            key: 'annenDokumentasjonUploadOnly',
            attachmentType: 'other',
            label: 'Annen dokumentasjon upload-only',
            validate: { required: false },
            attachmentValues: {
              nei: { enabled: false },
              leggerVedNaa: { enabled: true, additionalDocumentation: {} },
            },
          }),
        ],
      }),
    ],
    properties: {
      submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'],
    },
  });
};

const attachmentUploadOnlyTranslations = () => getMockTranslationsFromForm(attachmentUploadOnlyTestForm());

export { attachmentUploadOnlyTestForm, attachmentUploadOnlyTranslations };
