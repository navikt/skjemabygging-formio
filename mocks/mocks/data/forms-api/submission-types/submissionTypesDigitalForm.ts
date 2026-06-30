import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types digital form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL',
    path: 'submissiontypesdigital',
    submissionTypes: ['DIGITAL'],
  });

const submissionTypesDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types digital form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL',
    path: 'submissiontypesdigital',
    submissionTypes: ['DIGITAL'],
  });

export { submissionTypesDigitalForm, submissionTypesDigitalTranslations };
