import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationDigitalForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation digital form',
    formNumber: 'FORM-NAV-DIGITAL',
    path: 'formnavigationdigital',
    submissionTypes: ['DIGITAL'],
  });

const formNavigationDigitalTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation digital form',
    formNumber: 'FORM-NAV-DIGITAL',
    path: 'formnavigationdigital',
    submissionTypes: ['DIGITAL'],
  });

export { formNavigationDigitalForm, formNavigationDigitalTranslations };
