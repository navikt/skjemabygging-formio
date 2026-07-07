import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationDigitalNoAttachmentsForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation digital no attachments form',
    formNumber: 'FORM-NAV-DIGITAL-NO-ATTACHMENTS',
    path: 'formnavigationdigitalnoattachments',
    submissionTypes: ['DIGITAL'],
    includeAttachmentPanel: false,
    includeSelfDeclaration: false,
  });

const formNavigationDigitalNoAttachmentsTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation digital no attachments form',
    formNumber: 'FORM-NAV-DIGITAL-NO-ATTACHMENTS',
    path: 'formnavigationdigitalnoattachments',
    submissionTypes: ['DIGITAL'],
    includeAttachmentPanel: false,
    includeSelfDeclaration: false,
  });

export { formNavigationDigitalNoAttachmentsForm, formNavigationDigitalNoAttachmentsTranslations };
