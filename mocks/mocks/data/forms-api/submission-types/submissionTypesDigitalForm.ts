import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types digital form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL',
    path: 'submissiontypesdigital',
    submissionTypes: ['DIGITAL'],
    includeSelfDeclaration: false,
  });

const submissionTypesDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types digital form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL',
    path: 'submissiontypesdigital',
    submissionTypes: ['DIGITAL'],
    includeSelfDeclaration: false,
  });

export { submissionTypesDigitalForm, submissionTypesDigitalTranslations };
