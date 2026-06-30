import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationNoneForm = () =>
  createSubmissionTypeForm({
    title: 'Form navigation none form',
    formNumber: 'FORM-NAV-NONE',
    path: 'formnavigationnone',
    submissionTypes: [],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

const formNavigationNoneTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Form navigation none form',
    formNumber: 'FORM-NAV-NONE',
    path: 'formnavigationnone',
    submissionTypes: [],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

export { formNavigationNoneForm, formNavigationNoneTranslations };
