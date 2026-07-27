import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation digital form',
    formNumber: 'FORM-NAV-DIGITAL',
    path: 'formnavigationdigital',
    submissionTypes: ['DIGITAL'],
    includeSelfDeclaration: false,
  });

const formNavigationDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation digital form',
    formNumber: 'FORM-NAV-DIGITAL',
    path: 'formnavigationdigital',
    submissionTypes: ['DIGITAL'],
    includeSelfDeclaration: false,
  });

export { formNavigationDigitalForm, formNavigationDigitalTranslations };
