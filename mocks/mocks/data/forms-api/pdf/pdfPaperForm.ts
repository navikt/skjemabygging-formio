import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const pdfPaperForm = () =>
  createSubmissionTypeForm({
    title: 'Submission Type: Paper',
    formNumber: 'stpaper',
    path: 'pdfpaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    includeSelfDeclaration: false,
    innsendingForklaring: 'Her er litt forklaring',
    signatureMode: 'omit',
  });

const pdfPaperTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission Type: Paper',
    formNumber: 'stpaper',
    path: 'pdfpaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    includeSelfDeclaration: false,
    innsendingForklaring: 'Her er litt forklaring',
    signatureMode: 'omit',
  });

export { pdfPaperForm, pdfPaperTranslations };
