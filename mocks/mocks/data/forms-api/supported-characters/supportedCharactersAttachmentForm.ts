import { attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const supportedCharactersAttachmentForm = () =>
  form({
    title: 'Supported characters',
    formNumber: 'supportedcharacters',
    path: 'supportedcharacters',
    components: [
      panel({
        key: 'documentation',
        title: 'Documentation',
        isAttachmentPanel: false,
        components: [
          attachment({
            key: 'attachment',
            label: 'Supporting documentation',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Additional documentation',
                  description: 'Describe the document.',
                },
              },
            },
          }),
        ],
      }),
      panel({
        key: 'vedlegg',
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            key: 'uploadAttachment',
            label: 'Upload documentation',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Upload details',
                  description: 'Describe the upload.',
                },
              },
              ettersender: { enabled: true },
            },
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'supportedcharacters', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const supportedCharactersAttachmentTranslations = () =>
  getMockTranslationsFromForm(supportedCharactersAttachmentForm());

export { supportedCharactersAttachmentForm, supportedCharactersAttachmentTranslations };
