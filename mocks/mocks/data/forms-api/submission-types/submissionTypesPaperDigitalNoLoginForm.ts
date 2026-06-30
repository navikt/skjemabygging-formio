import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesPaperDigitalNoLoginForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types paper digital and digital no login form',
    formNumber: 'SUBMISSION-TYPES-PAPER-DIGITAL-NO-LOGIN',
    path: 'submissiontypespaperdigitalnologin',
    submissionTypes: ['PAPER', 'DIGITAL', 'DIGITAL_NO_LOGIN'],
  });

const submissionTypesPaperDigitalNoLoginTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types paper digital and digital no login form',
    formNumber: 'SUBMISSION-TYPES-PAPER-DIGITAL-NO-LOGIN',
    path: 'submissiontypespaperdigitalnologin',
    submissionTypes: ['PAPER', 'DIGITAL', 'DIGITAL_NO_LOGIN'],
  });

export { submissionTypesPaperDigitalNoLoginForm, submissionTypesPaperDigitalNoLoginTranslations };
