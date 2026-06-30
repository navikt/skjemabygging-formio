import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesPaperDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types paper digital form',
    formNumber: 'SUBMISSION-TYPES-PAPER-DIGITAL',
    path: 'submissiontypespaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
  });

const submissionTypesPaperDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types paper digital form',
    formNumber: 'SUBMISSION-TYPES-PAPER-DIGITAL',
    path: 'submissiontypespaperdigital',
    submissionTypes: ['PAPER', 'DIGITAL'],
  });

export { submissionTypesPaperDigitalForm, submissionTypesPaperDigitalTranslations };
