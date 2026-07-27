import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationPaperForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation paper form',
    formNumber: 'FORM-NAV-PAPER',
    path: 'formnavigationpaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    includeSelfDeclaration: false,
    innsendingForklaring: 'Her er litt forklaring',
  });

const formNavigationPaperTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation paper form',
    formNumber: 'FORM-NAV-PAPER',
    path: 'formnavigationpaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    includeSelfDeclaration: false,
    innsendingForklaring: 'Her er litt forklaring',
  });

export { formNavigationPaperForm, formNavigationPaperTranslations };
