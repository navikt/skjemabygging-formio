import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const pdfPaperForm = () =>
  createSubmissionTypeForm({
    title: 'PDF paper form',
    formNumber: 'PDF-PAPER',
    path: 'pdfpaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
    signatureMode: 'omit',
  });

const pdfPaperTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'PDF paper form',
    formNumber: 'PDF-PAPER',
    path: 'pdfpaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
    signatureMode: 'omit',
  });

export { pdfPaperForm, pdfPaperTranslations };
