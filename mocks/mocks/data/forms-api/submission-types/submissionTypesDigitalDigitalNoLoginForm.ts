import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesDigitalDigitalNoLoginForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types digital and digital no login form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL-DIGITAL-NO-LOGIN',
    path: 'submissiontypesdigitaldigitalnologin',
    submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'],
    ettersendelsesfrist: 14,
  });

const submissionTypesDigitalDigitalNoLoginTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types digital and digital no login form',
    formNumber: 'SUBMISSION-TYPES-DIGITAL-DIGITAL-NO-LOGIN',
    path: 'submissiontypesdigitaldigitalnologin',
    submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'],
    ettersendelsesfrist: 14,
  });

export { submissionTypesDigitalDigitalNoLoginForm, submissionTypesDigitalDigitalNoLoginTranslations };
