import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationDigitalNoAttachmentsForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation digital no attachments form',
    formNumber: 'FORM-NAV-DIGITAL-NO-ATTACHMENTS',
    path: 'formnavigationdigitalnoattachments',
    submissionTypes: ['DIGITAL'],
    includeAttachmentPanel: false,
  });

const formNavigationDigitalNoAttachmentsTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation digital no attachments form',
    formNumber: 'FORM-NAV-DIGITAL-NO-ATTACHMENTS',
    path: 'formnavigationdigitalnoattachments',
    submissionTypes: ['DIGITAL'],
    includeAttachmentPanel: false,
  });

export { formNavigationDigitalNoAttachmentsForm, formNavigationDigitalNoAttachmentsTranslations };
