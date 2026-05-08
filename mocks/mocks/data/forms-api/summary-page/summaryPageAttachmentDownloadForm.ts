import { attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const summaryPageAttachmentDownloadForm = () => {
  const formNumber = 'summarypagedownload';

  return form({
    title: 'Summary page attachment download test form',
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
        ],
      }),
    ],
    properties: formProperties({ formNumber, submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'] }),
  });
};

const summaryPageAttachmentDownloadTranslations = () =>
  getMockTranslationsFromForm(summaryPageAttachmentDownloadForm());

export { summaryPageAttachmentDownloadForm, summaryPageAttachmentDownloadTranslations };
