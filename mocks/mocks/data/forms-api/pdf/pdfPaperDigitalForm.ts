import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const pdfPaperDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Submission Type: Paper & Digital',
    formNumber: 'st-paper-digital',
    path: 'pdfpaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
    includeSelfDeclaration: false,
    signatureMode: 'default-empty',
  });

const pdfPaperDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission Type: Paper & Digital',
    formNumber: 'st-paper-digital',
    path: 'pdfpaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
    includeSelfDeclaration: false,
    signatureMode: 'default-empty',
  });

export { pdfPaperDigitalForm, pdfPaperDigitalTranslations };
