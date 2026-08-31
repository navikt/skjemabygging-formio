import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';
import { createSubmissionTypeForm } from '../shared/createSubmissionTypeForm';

const options = {
  title: 'Custom download button text form',
  formNumber: 'CUSTOM-DOWNLOAD-BUTTON-TEXT',
  path: 'customdownloadbuttontext',
  submissionTypes: ['PAPER' as const],
  includeAttachmentPanel: false,
  includeSelfDeclaration: false,
};

const customDownloadButtonTextForm = () => {
  const form = createSubmissionTypeForm(options);
  return {
    ...form,
    properties: {
      ...form.properties,
      downloadPdfButtonText: 'Last ned fullmaktsskjema',
    },
  };
};

const customDownloadButtonTextTranslations = () => getMockTranslationsFromForm(customDownloadButtonTextForm());

export { customDownloadButtonTextForm, customDownloadButtonTextTranslations };
