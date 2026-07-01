import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationDigitalNoLoginForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation digital no login form',
    formNumber: 'FORM-NAV-DIGITAL-NO-LOGIN',
    path: 'formnavigationdigitalnologin',
    submissionTypes: ['DIGITAL_NO_LOGIN'],
    includeSelfDeclaration: false,
  });

const formNavigationDigitalNoLoginTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation digital no login form',
    formNumber: 'FORM-NAV-DIGITAL-NO-LOGIN',
    path: 'formnavigationdigitalnologin',
    submissionTypes: ['DIGITAL_NO_LOGIN'],
    includeSelfDeclaration: false,
  });

export { formNavigationDigitalNoLoginForm, formNavigationDigitalNoLoginTranslations };
