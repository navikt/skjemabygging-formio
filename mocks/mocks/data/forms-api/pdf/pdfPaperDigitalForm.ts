import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const pdfPaperDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'PDF paper digital form',
    formNumber: 'PDF-PAPER-DIGITAL',
    path: 'pdfpaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
    signatureMode: 'default-empty',
  });

const pdfPaperDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'PDF paper digital form',
    formNumber: 'PDF-PAPER-DIGITAL',
    path: 'pdfpaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
    signatureMode: 'default-empty',
  });

export { pdfPaperDigitalForm, pdfPaperDigitalTranslations };
