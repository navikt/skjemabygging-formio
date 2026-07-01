import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesPaperDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types paper digital form',
    formNumber: 'SUBMISSION-TYPES-PAPER-DIGITAL',
    path: 'submissiontypespaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
    includeSelfDeclaration: false,
  });

const submissionTypesPaperDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types paper digital form',
    formNumber: 'SUBMISSION-TYPES-PAPER-DIGITAL',
    path: 'submissiontypespaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
    includeSelfDeclaration: false,
  });

export { submissionTypesPaperDigitalForm, submissionTypesPaperDigitalTranslations };
