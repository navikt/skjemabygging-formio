import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesPaperNoLoginForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types paper and digital no login form',
    formNumber: 'SUBMISSION-TYPES-PAPER-NO-LOGIN',
    path: 'submissiontypespapernologin',
    submissionTypes: ['PAPER', 'DIGITAL_NO_LOGIN'],
    includeSelfDeclaration: false,
  });

const submissionTypesPaperNoLoginTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types paper and digital no login form',
    formNumber: 'SUBMISSION-TYPES-PAPER-NO-LOGIN',
    path: 'submissiontypespapernologin',
    submissionTypes: ['PAPER', 'DIGITAL_NO_LOGIN'],
    includeSelfDeclaration: false,
  });

export { submissionTypesPaperNoLoginForm, submissionTypesPaperNoLoginTranslations };
