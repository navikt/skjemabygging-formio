import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const formNavigationNoneForm = () =>
  createSubmissionTypeForm({
    title: 'Submission Type: None',
    formNumber: 'stnone',
    path: 'formnavigationnone',
    submissionTypes: [],
    includeSelfDeclaration: false,
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

const formNavigationNoneTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission Type: None',
    formNumber: 'stnone',
    path: 'formnavigationnone',
    submissionTypes: [],
    includeSelfDeclaration: false,
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

export { formNavigationNoneForm, formNavigationNoneTranslations };
