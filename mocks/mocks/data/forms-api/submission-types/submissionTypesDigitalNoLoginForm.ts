import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesDigitalNoLoginForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types digital no login form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL-NO-LOGIN',
    path: 'submissiontypesdigitalnologin',
    submissionTypes: ['DIGITAL_NO_LOGIN'],
  });

const submissionTypesDigitalNoLoginTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types digital no login form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL-NO-LOGIN',
    path: 'submissiontypesdigitalnologin',
    submissionTypes: ['DIGITAL_NO_LOGIN'],
  });

export { submissionTypesDigitalNoLoginForm, submissionTypesDigitalNoLoginTranslations };
